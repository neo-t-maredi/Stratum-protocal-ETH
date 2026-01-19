// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title OilCollateral
 * @notice Represents tokenized oil barrel reserves
 * @dev 1 OIL token = 1 barrel of oil equivalent
 * 
 * WHAT THIS IS:
 * This is the collateral users deposit to borrow sUSD stablecoin.
 * In production, minting would require proof of physical oil reserves.
 * For demo, only owner can mint (simulating verified reserve deposits).
 */
contract OilCollateral is ERC20, Ownable {
    
    constructor() ERC20("Oil Collateral Token", "OIL") Ownable(msg.sender) {}
    
    /// @notice Mint OIL tokens (owner only - simulates reserve verification)
    /// @param to Address receiving the tokens
    /// @param amount Number of OIL tokens to mint (18 decimals)
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
    
    /// @notice Burn OIL tokens (anyone can burn their own)
    /// @param amount Number of tokens to burn
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
}