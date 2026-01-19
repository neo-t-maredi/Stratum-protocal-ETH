// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title StratumStable
 * @notice The sUSD stablecoin - oil-backed stable token
 * @dev Minted when users deposit collateral, burned when debt is repaid
 * 
 * WHAT THIS IS:
 * This is the stablecoin users receive when they deposit OIL collateral.
 * Think of it like borrowing against your house - you lock up OIL, get sUSD.
 * 
 * SECURITY NOTE:
 * In production, only the vault should be able to mint.
 * For demo simplicity, we're leaving it open.
 * TODO: Add access control before mainnet deployment.
 */
contract StratumStable is ERC20 {
    
    constructor() ERC20("Stratum Stable", "sUSD") {}
    
    /// @notice Mint new sUSD tokens
    /// @param to Address receiving tokens
    /// @param amount Amount to mint (18 decimals)
    /// @dev In production, restrict this to vault only
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
    
    /// @notice Burn sUSD tokens (anyone can burn their own)
    /// @param amount Amount to burn (18 decimals)
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
}