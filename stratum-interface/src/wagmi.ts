import { http, createConfig } from 'wagmi'
import { sepolia } from 'wagmi/chains'
import { getDefaultConfig } from '@rainbow-me/rainbowkit'

export const config = getDefaultConfig({
  appName: 'Stratum Protocol',
  projectId: '2f8a97914452f8cf69d97b41ae7a8db8',  // Same one from UGPT
  chains: [sepolia],
  transports: {
    [sepolia.id]: http('https://eth-sepolia.g.alchemy.com/v2/dEsaXci3hjaxTdOQMlCl6'),
  },
})

// Deployed contract addresses
export const CONTRACTS = {
  OilCollateral: '0x113a6D4D1Bec8f2632A2cAB7A469851fC8B5eCC3' as `0x${string}`,
  StratumVault: '0x5Ec12C85837439d409A550D4e7c22D950EE2148E' as `0x${string}`,
  StratumStable: '0x5C59f6941F418E55D35008334270Cc8dE57f4d8d' as `0x${string}`,
  MockPriceFeed: '0x383f83abb034EdC76B778e05f0e20D4E0E107CaA' as `0x${string}`,
}

// Simplified ABIs
export const OIL_ABI = [
  {
    inputs: [{ name: 'spender', type: 'address' }, { name: 'amount', type: 'uint256' }],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

export const VAULT_ABI = [
  {
    inputs: [{ name: 'collateralAmount', type: 'uint256' }, { name: 'mintAmount', type: 'uint256' }],
    name: 'depositAndMint',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'user', type: 'address' }],
    name: 'getPosition',
    outputs: [
      { name: 'collateral', type: 'uint256' },
      { name: 'debt', type: 'uint256' },
      { name: 'collateralRatio', type: 'uint256' },
      { name: 'isHealthy', type: 'bool' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const

export const SUSD_ABI = [
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const
