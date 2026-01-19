// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../src/OilCollateral.sol";
import "../src/StratumStable.sol";
import "../src/StratumVault.sol";
import "../src/MockPriceFeed.sol";

/**
 * @title StratumVaultTest
 * @notice Test suite for Stratum Protocol
 * 
 * TEST SCENARIOS:
 * 1. Deposit collateral and mint sUSD (happy path)
 * 2. Try to mint beyond allowed ratio (should fail)
 * 3. Burn debt and withdraw collateral
 * 4. Liquidate unhealthy position after price crash
 */
contract StratumVaultTest is Test {
    OilCollateral oil;
    StratumStable susd;
    StratumVault vault;
    MockPriceFeed priceFeed;
    
    address alice = address(0x1);
    address bob = address(0x2);
    
    /// @notice Setup runs before each test
    function setUp() public {
        // Deploy all contracts
        oil = new OilCollateral();
        susd = new StratumStable();
        priceFeed = new MockPriceFeed(75 * 10**8); // $75 per barrel
        
        // Deploy vault
        vault = new StratumVault(
            address(oil),
            address(susd),
            address(priceFeed)
        );
        
        // Give Alice 1000 OIL tokens
        oil.mint(alice, 1000 ether);
        
        // Alice approves vault to spend her OIL
        vm.prank(alice);
        oil.approve(address(vault), type(uint256).max);
    }
    
    /**
     * TEST 1: Normal deposit and mint
     * Alice deposits 10 OIL ($750) and mints 400 sUSD
     * Expected: Success (ratio = 187.5%)
     */
    function testDepositAndMint() public {
        vm.startPrank(alice);
        
        // Deposit 10 OIL, mint 400 sUSD
        vault.depositAndMint(10 ether, 400 ether);
        
        // Check Alice received sUSD
        assertEq(susd.balanceOf(alice), 400 ether);
        
        // Check position recorded correctly
        (uint256 collateral, uint256 debt,,) = vault.getPosition(alice);
        assertEq(collateral, 10 ether);
        assertEq(debt, 400 ether);
        
        vm.stopPrank();
    }
    
    /**
     * TEST 2: Try to mint beyond allowed ratio
     * Alice tries to mint $600 with $750 collateral (125% ratio)
     * Expected: Revert (below 150% minimum)
     */
    function testCannotMintBeyondRatio() public {
        vm.startPrank(alice);
        
        // Try to mint too much - should fail
        vm.expectRevert(StratumVault.InsufficientCollateralRatio.selector);
        vault.depositAndMint(10 ether, 600 ether);
        
        vm.stopPrank();
    }
    
    /**
     * TEST 3: Burn debt and withdraw collateral
     * Alice deposits, then partially repays
     * Expected: Position updated correctly
     */
    function testBurnAndWithdraw() public {
        vm.startPrank(alice);
        
        // Setup: Create position
        vault.depositAndMint(10 ether, 400 ether);
        
        // Repay half debt, withdraw half collateral
        susd.approve(address(vault), type(uint256).max);
        vault.burnAndWithdraw(200 ether, 5 ether);
        
        // Check position updated
        (uint256 collateral, uint256 debt,,) = vault.getPosition(alice);
        assertEq(collateral, 5 ether);
        assertEq(debt, 200 ether);
        
        vm.stopPrank();
    }
    
    /**
     * TEST 4: Liquidation after price crash
     * 1. Alice creates position at $75/barrel
     * 2. Price crashes to $50/barrel
     * 3. Bob liquidates Alice
     * Expected: Alice's position cleared, Bob profits
     */
    function testLiquidation() public {
        // Alice creates position
        vm.startPrank(alice);
        vault.depositAndMint(10 ether, 400 ether);
        vm.stopPrank();
        
        // Price crashes from $75 to $50
        priceFeed.setPrice(50 * 10**8);
        // Alice's collateral now: 10 OIL * $50 = $500
        // Alice's debt: 400 sUSD
        // Ratio: $500 / $400 = 125% (below 130% threshold)
        
        // Give Bob tokens to liquidate
        oil.mint(bob, 1000 ether);
        susd.mint(bob, 400 ether);
        
        // Bob liquidates Alice
        vm.startPrank(bob);
        susd.approve(address(vault), type(uint256).max);
        vault.liquidate(alice);
        vm.stopPrank();
        
        // Check Alice's position cleared
        (uint256 collateral, uint256 debt,,) = vault.getPosition(alice);
        assertEq(collateral, 0);
        assertEq(debt, 0);
    }
}