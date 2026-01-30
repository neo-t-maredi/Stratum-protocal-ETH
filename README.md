cd ~/foundry-f25/stratum-protocol

# Create a professional README
cat > README.md << 'EOF'
# Stratum Protocol

> Oil-backed stablecoin using CDP mechanics - Commodity-backed DeFi for real-world assets

**Built for ETH Riyadh 2026** | [View on Sepolia Etherscan](https://sepolia.etherscan.io/address/0x5Ec12C85837439d409A550D4e7c22D950EE2148E)

---

## Overview

Stratum Protocol enables users to deposit tokenized oil barrels as collateral and mint sUSD stablecoin. Built on MakerDAO's Collateralized Debt Position (CDP) model, Stratum brings real-world commodity backing to decentralized finance.

**Key Innovation:** Access instant liquidity from physical oil reserves without selling the underlying asset - like a mortgage for your oil holdings.

---

## How It Works
```
1. User deposits OIL tokens (representing physical oil barrels)
2. Smart contract locks collateral and tracks position
3. User mints sUSD stablecoin (up to 66% of collateral value)
4. Collateral ratio must stay above 150% (liquidation at 130%)
5. User repays sUSD debt to unlock collateral
```

**Example:**
- Deposit: 100 OIL @ $75/barrel = $7,500 value
- Mint: $5,000 sUSD (150% collateralization)
- If OIL price drops below $65/barrel → Liquidation risk
- Repay $5,000 sUSD + burn to retrieve 100 OIL

---

## Deployed Contracts (Sepolia Testnet)

| Contract | Address | Etherscan |
|----------|---------|-----------|
| **OilCollateral** | `0x113a6D4D1Bec8f2632A2cAB7A469851fC8B5eCC3` | [View](https://sepolia.etherscan.io/address/0x113a6D4D1Bec8f2632A2cAB7A469851fC8B5eCC3) |
| **StratumStable** | `0x5C59f6941F418E55D35008334270Cc8dE57f4d8d` | [View](https://sepolia.etherscan.io/address/0x5C59f6941F418E55D35008334270Cc8dE57f4d8d) |
| **StratumVault** | `0x5Ec12C85837439d409A550D4e7c22D950EE2148E` | [View](https://sepolia.etherscan.io/address/0x5Ec12C85837439d409A550D4e7c22D950EE2148E) |
| **MockPriceFeed** | `0x383f83abb034EdC76B778e05f0e20D4E0E107CaA` | [View](https://sepolia.etherscan.io/address/0x383f83abb034EdC76B778e05f0e20D4E0E107CaA) |

**Deployment Block:** 10106099  
**Gas Used:** 3,678,255  
**Cost:** 0.004024 ETH

---

## Architecture

**OilCollateral.sol**
- ERC20 token representing physical oil barrels
- Total Supply: 1,000,000 OIL
- 1 OIL = 1 barrel of crude oil
- Transferable and tradeable

**StratumStable.sol**
- USD-pegged stablecoin (sUSD)
- Minted against OIL collateral
- Only minted/burned by StratumVault
- Maintains 1:1 USD peg

**StratumVault.sol**
- Core CDP mechanics
- Manages collateral positions
- Enforces 150% minimum ratio
- Liquidates unhealthy positions at 130%
- 10% liquidation penalty

**MockPriceFeed.sol**
- Simulates Chainlink oracle
- Production: Real WTI crude price feed
- Updates oil price in real-time

---

## Usage

**Open a Position:**
```solidity
// Approve vault to spend your OIL
oilCollateral.approve(vaultAddress, collateralAmount);

// Deposit and mint
stratumVault.depositAndMint(collateralAmount, mintAmount);
```

**Check Your Position:**
```solidity
(uint256 collateral, uint256 debt, uint256 ratio, bool healthy) = 
    stratumVault.getPosition(userAddress);
```

**Close Position:**
```solidity
// Approve vault to burn your sUSD
stratumStable.approve(vaultAddress, debtAmount);

// Burn and withdraw
stratumVault.burnAndWithdraw(burnAmount, withdrawAmount);
```

**Liquidate Unhealthy Position:**
```solidity
stratumVault.liquidate(userAddress);
// Liquidator receives 10% bonus
```

---

## Risk Parameters

| Parameter | Value | Purpose |
|-----------|-------|---------|
| **Minimum Collateral Ratio** | 150% | Prevents under-collateralization |
| **Liquidation Threshold** | 130% | Triggers position liquidation |
| **Liquidation Penalty** | 10% | Incentivizes liquidators |
| **Oracle Price** | $75/barrel | WTI crude oil (mock) |

**Example Scenarios:**

**Healthy Position:**
- Collateral: 100 OIL @ $75 = $7,500
- Debt: 3,000 sUSD
- Ratio: 250% ✅ Safe

**At Risk:**
- Collateral: 100 OIL @ $75 = $7,500
- Debt: 5,000 sUSD
- Ratio: 150% ⚠️ At minimum

**Liquidation:**
- Collateral: 100 OIL @ $65 = $6,500
- Debt: 5,000 sUSD
- Ratio: 130% ❌ Liquidated

---

## Testing
```bash
# Install dependencies
forge install

# Run test suite
forge test -vvv
```

**Test Coverage:**
- Deposit and mint functionality
- Position health tracking
- Collateral ratio calculations
- Liquidation mechanics
- Price feed integration

**Result:** 4/4 tests passing

---

## Local Deployment
```bash
# Setup environment
cp .env.example .env
# Add your PRIVATE_KEY and SEPOLIA_RPC_URL

# Deploy to Sepolia
forge script script/Deploy.s.sol:DeployStratum \
  --rpc-url $SEPOLIA_RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast \
  -vvvv
```

---

## Real-World Application

**For Oil Producers:**
- Unlock liquidity without selling reserves
- Hedge against price volatility
- Maintain upside exposure to oil prices

**For sUSD Holders:**
- Stable purchasing power
- Backed by real commodities
- Transparent on-chain reserves

**For DeFi Ecosystem:**
- Bridges physical assets to blockchain
- Commodity-backed stability
- Infrastructure for RWA tokenization

---

## Technical Stack

- **Solidity 0.8.19** - Smart contract language
- **Foundry** - Development framework
- **OpenZeppelin** - Security-audited libraries
- **Chainlink** - Oracle integration (production)
- **SafeERC20** - Secure token transfers

---

## Comparison to MakerDAO

| Feature | Stratum | MakerDAO |
|---------|---------|----------|
| **Collateral** | Tokenized oil | ETH, WBTC, etc. |
| **Stability** | Commodity-backed | Crypto-backed |
| **Min Ratio** | 150% | 150%+ (varies) |
| **Liquidation** | 130% | ~145% (varies) |
| **Oracle** | WTI crude price | Multiple price feeds |

---

## Regulatory Considerations

**Securities Classification:**
Both OIL tokens and sUSD likely qualify as securities under most jurisdictions. Proper registration or exemption required.

**Compliance Requirements:**
- KYC/AML for participants
- Custodian verification for physical oil
- Regular audits of reserves
- Regulatory approval in operating jurisdictions

**Risk Disclosures:**
- Oil price volatility
- Liquidation risk
- Smart contract risk
- Custody risk for physical barrels
- Regulatory uncertainty

---

## Development Roadmap

- [x] Core CDP mechanics implementation
- [x] Full test suite
- [x] Sepolia testnet deployment
- [ ] Chainlink price feed integration
- [ ] Multi-collateral support (gas, refined products)
- [ ] Governance module
- [ ] Security audit
- [ ] Mainnet deployment

---

## Known Limitations

**Current Implementation:**
- Mock price feed (production needs Chainlink)
- Single collateral type (oil only)
- No interest rate on debt
- No stability fee mechanism
- Fixed liquidation penalty

**Production Requirements:**
- Professional security audit
- Real Chainlink oracle integration
- Legal structure for oil custody
- Insurance for smart contract risk
- Multi-sig governance

---

## Disclaimer

**This is a hackathon prototype for educational and demonstration purposes.**

NOT FOR PRODUCTION USE. No audit completed. Securities laws apply. Physical custody of oil barrels not implemented. Consult legal and financial advisors before any real-world implementation.

For production deployment, requirements include:
- Professional security audit
- Legal opinion on securities classification
- Regulatory compliance framework
- Physical custody solution for oil
- Insurance policies
- Multi-sig governance structure

---

## Author

**Neo Maredi**  
Industrial Automation Engineer | Blockchain Developer  
TUV Group, Saudi Arabia

**Contact:**
- GitHub: [@neo-t-maredi](https://github.com/neo-t-maredi)
- ETH Riyadh 2026

---

## Sister Project

**UGPT Protocol** - Tokenized gas facility revenue sharing  
[github.com/neo-t-maredi/ugpt-protocol](https://github.com/neo-t-maredi/ugpt-protocol)

---

## License

MIT License - See LICENSE file for details

---

**Built for ETH Riyadh 2026 - P.O.C**
