// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @notice Demonstration debt token. Only the configured vault can issue sUSD.
contract StratumStable is ERC20 {
    address public immutable deployer;
    address public vault;

    error NotDeployer();
    error VaultAlreadySet();
    error InvalidVault();
    error NotVault();

    event VaultConfigured(address indexed vault);

    constructor() ERC20("Stratum Stable", "sUSD") {
        deployer = msg.sender;
    }

    /// @notice Bind the vault once, after both contracts have been deployed.
    function setVault(address newVault) external {
        if (msg.sender != deployer) revert NotDeployer();
        if (vault != address(0)) revert VaultAlreadySet();
        if (newVault.code.length == 0) revert InvalidVault();
        vault = newVault;
        emit VaultConfigured(newVault);
    }

    function mint(address to, uint256 amount) external {
        if (msg.sender != vault) revert NotVault();
        _mint(to, amount);
    }

    /// @notice Burn the caller's own balance; the vault uses this for repayment.
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
}
