// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../src/StratumStable.sol";

contract AuthorizedVault {
    function mint(StratumStable token, address recipient, uint256 amount) external {
        token.mint(recipient, amount);
    }
}

contract StratumStableTest is Test {
    StratumStable token;
    AuthorizedVault vault;
    address user = address(0x1234);

    function setUp() public {
        token = new StratumStable();
        vault = new AuthorizedVault();
    }

    function testMintBlockedBeforeConfiguration() public {
        vm.expectRevert(StratumStable.NotVault.selector);
        token.mint(user, 1 ether);
    }

    function testOnlyDeployerCanConfigureVault() public {
        vm.prank(user);
        vm.expectRevert(StratumStable.NotDeployer.selector);
        token.setVault(address(vault));
        assertEq(token.vault(), address(0));
    }

    function testRejectZeroAndNonContractVault() public {
        vm.expectRevert(StratumStable.InvalidVault.selector);
        token.setVault(address(0));
        vm.expectRevert(StratumStable.InvalidVault.selector);
        token.setVault(user);
    }

    function testVaultCannotBeReplaced() public {
        token.setVault(address(vault));
        AuthorizedVault replacement = new AuthorizedVault();
        vm.expectRevert(StratumStable.VaultAlreadySet.selector);
        token.setVault(address(replacement));
        assertEq(token.vault(), address(vault));
    }

    function testFuzzUnauthorizedMintBlocked(address caller, uint96 amount) public {
        token.setVault(address(vault));
        vm.assume(caller != address(vault));
        vm.prank(caller);
        vm.expectRevert(StratumStable.NotVault.selector);
        token.mint(user, amount);
        assertEq(token.totalSupply(), 0);
    }

    function testAuthorizedMintAndOwnBalanceBurn() public {
        token.setVault(address(vault));
        vault.mint(token, user, 2 ether);
        vm.prank(user);
        token.burn(1 ether);
        assertEq(token.balanceOf(user), 1 ether);
        assertEq(token.totalSupply(), 1 ether);
    }
}
