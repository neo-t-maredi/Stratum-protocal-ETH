
// pragma solidity ^0.8.19;

// import "forge-std/Script.sol";
// import "../src/OilCollateral.sol";
// import "../src/StratumStable.sol";
// import "../src/StratumVault.sol";
// import "../src/MockPriceFeed.sol";

// /**
//  * @title DeployStratum
//  * @notice Deployment script for Stratum Protocol
//  * 
//  * DEPLOYMENT STEPS:
//  * 1. Deploy OilCollateral (ERC20 token)
//  * 2. Deploy StratumStable (sUSD stablecoin)
//  * 3. Deploy MockPriceFeed (oracle - use real Chainlink in production)
//  * 4. Deploy StratumVault (the engine)
//  * 5. Mint demo tokens for testing
//  */
// contract DeployStratum is Script {
//     function run() external {
//         // Get deployer private key from environment
//         uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
//         vm.startBroadcast(deployerPrivateKey);

//         console.log("==============================================");
//         console.log("DEPLOYING STRATUM PROTOCOL");
//         console.log("==============================================");
//         console.log("Deployer:", vm.addr(deployerPrivateKey));
//         console.log("");

//         // 1. Deploy OilCollateral
//         OilCollateral oil = new OilCollateral();
//         console.log("1. OilCollateral deployed:", address(oil));

//         // 2. Deploy StratumStable
//         StratumStable susd = new StratumStable();
//         console.log("2. StratumStable deployed:", address(susd));

//         // 3. Deploy MockPriceFeed at $75/barrel
//         MockPriceFeed priceFeed = new MockPriceFeed(75 * 10**8);
//         console.log("3. MockPriceFeed deployed:", address(priceFeed));
//         console.log("   Initial price: $75.00");

//         // 4. Deploy StratumVault
//         StratumVault vault = new StratumVault(
//             address(oil),
//             address(susd),
//             address(priceFeed)
//         );
//         console.log("4. StratumVault deployed:", address(vault));
//         console.log("");

//         // 5. Mint demo tokens (1000 OIL to deployer)
//         oil.mint(msg.sender, 1000 ether);
//         console.log("5. Minted 1000 OIL to deployer");

//         vm.stopBroadcast();

//         console.log("");
//         console.log("==============================================");
//         console.log("DEPLOYMENT COMPLETE");
//         console.log("==============================================");
//         console.log("SAVE THESE ADDRESSES:");
//         console.log("- OilCollateral:", address(oil));
//         console.log("- StratumStable:", address(susd));
//         console.log("- StratumVault:", address(vault));
//         console.log("- MockPriceFeed:", address(priceFeed));
//         console.log("==============================================");
//     }
// }

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

        MockPriceFeed priceFeed = new MockPriceFeed(75 * 10**8);
        console.log("PriceFeed:", address(priceFeed));

        StratumVault vault = new StratumVault(address(oil), address(susd), address(priceFeed));
        console.log("StratumVault:", address(vault));

        oil.mint(msg.sender, 1000 ether);
        console.log("Minted 1000 OIL");

        vm.stopBroadcast();
    }
}