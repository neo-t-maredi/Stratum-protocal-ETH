# Stratum Protocol

> Commodity-backed stablecoin using MakerDAO-style CDP mechanics

Built for **ETH Riyadh 2026** by Neo Maredi

---

## What Is This?

Stratum Protocol lets you deposit tokenized oil barrels and borrow a stablecoin (sUSD) against them.

**Think of it like a mortgage:**
- Your collateral = Oil tokens  
- Your loan = sUSD stablecoin  
- The protocol = Smart contracts managing everything  

**Key Rule:** You must maintain 150% collateralization at all times.

---

## Quick Example

1. **Alice deposits 10 OIL tokens** (worth $750 at $75/barrel)
2. **Alice borrows 400 sUSD** (ratio: $750/$400 = 187.5% ✓)
3. **Oil price crashes to $50/barrel** → collateral now worth $500
4. **Ratio drops to 125%** (below 130% liquidation threshold)
5. **Bob liquidates Alice** → pays 400 sUSD, receives all 10 OIL ($500 value)
6. Bob profits $100, system stays solvent

---

## Architecture
```
OilCollateral.sol    → ERC20 token (1 token = 1 barrel)
StratumStable.sol    → sUSD stablecoin (ERC20)
MockPriceFeed.sol    → Simulates Chainlink oracle
StratumVault.sol     → Core CDP engine
```

---

## Key Parameters

- **Minimum Collateral Ratio:** 150%
- **Liquidation Threshold:** 130%
- **Liquidation Incentive:** Full collateral (natural arbitrage)

---

## Running Tests
```bash
forge test -vvv
```

**All 4 tests pass:**
- ✅ Deposit and mint sUSD
- ✅ Cannot mint beyond ratio
- ✅ Burn debt and withdraw collateral
- ✅ Liquidation after price crash

---

## Tech Stack

- Solidity 0.8.19
- Foundry
- OpenZeppelin Contracts
- Chainlink Price Feeds (mocked for testing)

---

## Why "Stratum"?

In geology, a stratum is a layer of rock where oil is extracted. Each layer of the protocol provides structural integrity - surface (user interface), subsurface (vault mechanics), foundation (price oracles).

---

## Next Steps

- [ ] Deploy to Sepolia testnet
- [ ] Build frontend demo
- [ ] Integrate real Chainlink WTI/USD feed
- [ ] Production security audit

---

## Live on Sepolia Testnet

**Deployed Contracts:**
- OilCollateral: [`0x113a6D4D1Bec8f2632A2cAB7A469851fC8B5eCC3`](https://sepolia.etherscan.io/address/0x113a6D4D1Bec8f2632A2cAB7A469851fC8B5eCC3)
- StratumStable: [`0x5C59f6941F418E55D35008334270Cc8dE57f4d8d`](https://sepolia.etherscan.io/address/0x5C59f6941F418E55D35008334270Cc8dE57f4d8d)
- StratumVault: [`0x5Ec12C85837439d409A550D4e7c22D950EE2148E`](https://sepolia.etherscan.io/address/0x5Ec12C85837439d409A550D4e7c22D950EE2148E)
- MockPriceFeed: [`0x383f83abb034EdC76B778e05f0e20D4E0E107CaA`](https://sepolia.etherscan.io/address/0x383f83abb034EdC76B778e05f0e20D4E0E107CaA)

**Deployment Block:** 10106099  
**Network:** Sepolia Testnet  
**Status:** ✅ Live and Verified

**Built by Neo Maredi**  
Industrial Automation Engineer → Blockchain Developer  
ETH Riyadh 2026
