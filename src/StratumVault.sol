// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title StratumVault
 * @notice Core CDP (Collateralized Debt Position) engine
 * @dev Manages collateral deposits, sUSD minting, and liquidations
 * 
 * ==============================================================================
 * HOW THIS WORKS (The Full Story):
 * ==============================================================================
 * 
 * 1. USER DEPOSITS COLLATERAL:
 *    - User has 10 OIL tokens (worth $75 each = $750 total)
 *    - User calls depositAndMint(10 OIL, 400 sUSD)
 *    - System checks: $750 / $400 = 187.5% ratio ✓ (above 150% minimum)
 *    - User receives 400 sUSD to use elsewhere
 * 
 * 2. MAINTAINING HEALTH:
 *    - Minimum ratio: 150% (must have $1.50 collateral per $1.00 debt)
 *    - Liquidation threshold: 130% (get liquidated if you drop below this)
 *    - Buffer zone: 130%-150% (warning zone, stay above 150% to be safe)
 * 
 * 3. PRICE CRASH SCENARIO:
 *    - Oil price drops from $75 to $50 per barrel
 *    - User's 10 OIL now worth $500 (was $750)
 *    - User still owes 400 sUSD
 *    - New ratio: $500 / $400 = 125% ✗ (below 130% threshold)
 *    - Position is now liquidatable
 * 
 * 4. LIQUIDATION:
 *    - Anyone can call liquidate(user)
 *    - Liquidator pays 400 sUSD debt
 *    - Liquidator receives 11 OIL ($550 worth) - includes 10% bonus
 *    - User's position cleared
 *    - System maintains solvency
 * 
 * 5. NORMAL REPAYMENT:
 *    - User calls burnAndWithdraw(400 sUSD, 10 OIL)
 *    - Burns 400 sUSD (repays debt)
 *    - Receives 10 OIL back
 *    - Position closed, no liquidation
 * 
 * ==============================================================================
 */

// Chainlink price feed interface
interface AggregatorV3Interface {
    function latestRoundData() external view returns (
        uint80 roundId,
        int256 answer,
        uint256 startedAt,
        uint256 updatedAt,
        uint80 answeredInRound
    );
}

// Interface to mint/burn sUSD
interface IStratumStable {
    function mint(address to, uint256 amount) external;
    function burn(uint256 amount) external;
}

contract StratumVault {
    using SafeERC20 for IERC20;
    
    // ========== STATE VARIABLES ==========
    
    IERC20 public immutable collateralToken;  // The OIL token
    IERC20 public immutable stablecoin;       // The sUSD token
    AggregatorV3Interface public immutable priceFeed;  // Price oracle
    
    // ========== PROTOCOL PARAMETERS ==========
    
    uint256 public constant COLLATERAL_RATIO = 150;      // 150% minimum (1.5x overcollateralized)
    uint256 public constant LIQUIDATION_THRESHOLD = 130; // Liquidate at 130%
    uint256 public constant LIQUIDATION_BONUS = 10;      // 10% bonus to liquidators
    uint256 public constant PRECISION = 100;             // For percentage math
    
    // ========== USER POSITIONS ==========
    
    /// @notice Tracks each user's collateral and debt
    struct Position {
        uint256 collateralAmount;  // OIL tokens deposited
        uint256 debtAmount;        // sUSD borrowed
    }
    
    mapping(address => Position) public positions;
    
    // ========== EVENTS ==========
    
    event CollateralDeposited(address indexed user, uint256 amount);
    event StablecoinMinted(address indexed user, uint256 amount);
    event StablecoinBurned(address indexed user, uint256 amount);
    event CollateralWithdrawn(address indexed user, uint256 amount);
    event PositionLiquidated(
        address indexed user, 
        address indexed liquidator, 
        uint256 debtBurned, 
        uint256 collateralSeized
    );
    
    // ========== ERRORS ==========
    
    error InsufficientCollateralRatio();
    error PositionNotLiquidatable();
    error NoDebtToRepay();
    error InsufficientCollateral();
    
    // ========== CONSTRUCTOR ==========
    
    constructor(
        address _collateralToken,
        address _stablecoin,
        address _priceFeed
    ) {
        collateralToken = IERC20(_collateralToken);
        stablecoin = IERC20(_stablecoin);
        priceFeed = AggregatorV3Interface(_priceFeed);
    }
    
    // ========== CORE FUNCTIONS ==========
    
    /**
     * @notice Deposit collateral and mint sUSD in one transaction
     * @param collateralAmount OIL tokens to deposit
     * @param mintAmount sUSD tokens to mint
     * 
     * EXAMPLE:
     * depositAndMint(10 ether, 400 ether)
     * - Deposits 10 OIL ($750 if oil is $75)
     * - Mints 400 sUSD
     * - Ratio: 187.5% ✓
     */
    function depositAndMint(uint256 collateralAmount, uint256 mintAmount) external {
        require(collateralAmount > 0, "Must deposit collateral");
        require(mintAmount > 0, "Must mint some sUSD");
        
        // Transfer OIL from user to vault
        collateralToken.safeTransferFrom(msg.sender, address(this), collateralAmount);
        
        // Update user's position
        Position storage pos = positions[msg.sender];
        pos.collateralAmount += collateralAmount;
        pos.debtAmount += mintAmount;
        
        // Verify position is healthy (above 150% ratio)
        if (!_isHealthy(msg.sender)) {
            revert InsufficientCollateralRatio();
        }
        
        // Mint sUSD to user
        IStratumStable(address(stablecoin)).mint(msg.sender, mintAmount);
        
        emit CollateralDeposited(msg.sender, collateralAmount);
        emit StablecoinMinted(msg.sender, mintAmount);
    }
    
    /**
     * @notice Burn debt and withdraw collateral
     * @param burnAmount sUSD to burn (repay)
     * @param withdrawAmount OIL to withdraw
     * 
     * EXAMPLE:
     * burnAndWithdraw(200 ether, 5 ether)
     * - Burns 200 sUSD
     * - Withdraws 5 OIL
     * - Remaining position must stay healthy
     */
    function burnAndWithdraw(uint256 burnAmount, uint256 withdrawAmount) external {
        Position storage pos = positions[msg.sender];
        
        if (pos.debtAmount == 0) revert NoDebtToRepay();
        if (pos.collateralAmount < withdrawAmount) revert InsufficientCollateral();
        
        // Burn sUSD
        stablecoin.safeTransferFrom(msg.sender, address(this), burnAmount);
        IStratumStable(address(stablecoin)).burn(burnAmount);
        
        // Update position
        pos.debtAmount -= burnAmount;
        pos.collateralAmount -= withdrawAmount;
        
        // Check remaining position is healthy (if debt remains)
        if (pos.debtAmount > 0 && !_isHealthy(msg.sender)) {
            revert InsufficientCollateralRatio();
        }
        
        // Return OIL to user
        collateralToken.safeTransfer(msg.sender, withdrawAmount);
        
        emit StablecoinBurned(msg.sender, burnAmount);
        emit CollateralWithdrawn(msg.sender, withdrawAmount);
    }
    
    /**
     * @notice Liquidate unhealthy position (anyone can call)
     * @param user Address of position to liquidate
     * 
     * LIQUIDATION EXAMPLE:
     * - Position: 10 OIL collateral ($500 value), 400 sUSD debt
     * - Ratio: 125% (below 130% threshold)
     * - Liquidator pays: 400 sUSD
     * - Liquidator receives: 11 OIL ($550 value) - includes 10% bonus
     * - Liquidator profit: $50 instant arbitrage
     */
    function liquidate(address user) external {
    Position storage pos = positions[user];
    
    // Verify position is liquidatable
    uint256 ratio = getCollateralRatio(user);
    if (ratio >= LIQUIDATION_THRESHOLD) {
        revert PositionNotLiquidatable();
    }
    
    // Calculate liquidation amounts
    uint256 debtToCover = pos.debtAmount;
    uint256 collateralToSeize = pos.collateralAmount;
    
    // NOTE: We give ALL collateral to liquidator
    // The "bonus" is the fact that collateral value > debt value
    // Example: Pay $400 debt, get $500 collateral = $100 profit
    
    // Liquidator pays the debt
    stablecoin.safeTransferFrom(msg.sender, address(this), debtToCover);
    IStratumStable(address(stablecoin)).burn(debtToCover);
    
    // Give liquidator ALL the collateral
    collateralToken.safeTransfer(msg.sender, collateralToSeize);
    
    // Clear the position
    delete positions[user];
    
    emit PositionLiquidated(user, msg.sender, debtToCover, collateralToSeize);
}
    
    // ========== VIEW FUNCTIONS ==========
    
    /**
     * @notice Calculate USD value of collateral
     * @param collateralAmount OIL tokens
     * @return USD value (18 decimals)
     * 
     * MATH:
     * - Oracle price: 7500000000 (8 decimals) = $75.00
     * - Collateral: 10 ether (18 decimals)
     * - Result: (10e18 * 7500000000) / 1e8 = 750e18 = $750.00
     */
    function getCollateralValueUSD(uint256 collateralAmount) public view returns (uint256) {
        (, int256 price,,,) = priceFeed.latestRoundData();
        require(price > 0, "Invalid price");
        
        // Convert 8 decimal price to 18 decimal USD value
        return (collateralAmount * uint256(price)) / 1e8;
    }
    
    /**
     * @notice Calculate collateralization ratio
     * @param user Address to check
     * @return ratio Percentage (100 = 100%)
     * 
     * EXAMPLE:
     * - Collateral value: $750
     * - Debt: $400
     * - Ratio: ($750 * 100) / $400 = 187 (187%)
     */
    function getCollateralRatio(address user) public view returns (uint256) {
        Position memory pos = positions[user];
        
        // No debt = infinite ratio (perfectly safe)
        if (pos.debtAmount == 0) return type(uint256).max;
        
        uint256 collateralValueUSD = getCollateralValueUSD(pos.collateralAmount);
        
        // ratio = (collateral value * 100) / debt
        return (collateralValueUSD * PRECISION) / pos.debtAmount;
    }
    
    /// @notice Check if position is healthy (above 150% ratio)
    function _isHealthy(address user) internal view returns (bool) {
        return getCollateralRatio(user) >= COLLATERAL_RATIO;
    }
    
    /**
     * @notice Get complete position info
     * @return collateral OIL deposited
     * @return debt sUSD borrowed
     * @return ratio Current ratio (percentage)
     * @return isHealthy Above minimum ratio?
     */
    function getPosition(address user) external view returns (
        uint256 collateral,
        uint256 debt,
        uint256 ratio,
        bool isHealthy
    ) {
        Position memory pos = positions[user];
        return (
            pos.collateralAmount,
            pos.debtAmount,
            getCollateralRatio(user),
            _isHealthy(user)
        );
    }
}