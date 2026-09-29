// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/OilCollateral.sol";
import "../src/StratumStable.sol";
import "../src/StratumVault.sol";
import "../src/MockPriceFeed.sol";

contract DeployStratum is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        console.log("Deploying Stratum Protocol...");

        OilCollateral oil = new OilCollateral();
        console.log("OilCollateral:", address(oil));

        StratumStable susd = new StratumStable();
        console.log("StratumStable:", address(susd));

        MockPriceFeed priceFeed = new MockPriceFeed(75 * 10 ** 8);
        console.log("PriceFeed:", address(priceFeed));

        StratumVault vault = new StratumVault(address(oil), address(susd), address(priceFeed));
        susd.setVault(address(vault));
        console.log("StratumVault:", address(vault));

        oil.mint(vm.addr(deployerPrivateKey), 1000 ether);
        console.log("Minted 1000 OIL");

        vm.stopBroadcast();
    }
}
