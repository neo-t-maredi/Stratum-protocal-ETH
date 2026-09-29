import { http, createConfig } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { sepolia } from 'wagmi/chains'
import { zeroAddress } from 'viem'

export const config = createConfig({
  chains: [sepolia],
  connectors: [injected()],
  transports: { [sepolia.id]: http() },
})

// Historical addresses are deliberately not connected to the revised UI.
// Keep writes disabled until a corrected deployment has been validated.
export const CONTRACTS_READY = false
export const CONTRACTS = {
  OilCollateral: zeroAddress,
  StratumVault: zeroAddress,
  StratumStable: zeroAddress,
  MockPriceFeed: zeroAddress,
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
