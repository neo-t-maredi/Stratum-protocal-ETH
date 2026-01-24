export const CONTRACTS = {
  OilCollateral: '0x113a6D4D1Bec8f2632A2cAB7A469851fC8B5eCC3',
  StratumStable: '0x5C59f6941F418E55D35008334270Cc8dE57f4d8d',
  StratumVault: '0x5Ec12C85837439d409A550D4e7c22D950EE2148E',
  MockPriceFeed: '0x383f83abb034EdC76B778e05f0e20D4E0E107CaA',
} as const;

export const VAULT_ABI = [
  'function depositAndMint(uint256 collateralAmount, uint256 mintAmount) external',
  'function burnAndWithdraw(uint256 burnAmount, uint256 withdrawAmount) external',
  'function getPosition(address user) external view returns (uint256 collateral, uint256 debt, uint256 ratio, bool isHealthy)',
  'function getCollateralRatio(address user) external view returns (uint256)',
] as const;

export const OIL_ABI = [
  'function approve(address spender, uint256 amount) external returns (bool)',
  'function balanceOf(address account) external view returns (uint256)',
] as const;
