import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { CONTRACTS, VAULT_ABI, OIL_ABI } from '@/lib/contracts';

export function useStratumVault() {
  const { address } = useAccount();
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  // Read user position
  const { data: position } = useReadContract({
    address: CONTRACTS.StratumVault,
    abi: VAULT_ABI,
    functionName: 'getPosition',
    args: address ? [address] : undefined,
  });

  // Approve OIL spending
  const approveOil = async (amount: string) => {
    writeContract({
      address: CONTRACTS.OilCollateral,
      abi: OIL_ABI,
      functionName: 'approve',
      args: [CONTRACTS.StratumVault, parseEther(amount)],
    });
  };

  // Deposit and mint
  const depositAndMint = async (collateralAmount: string, mintAmount: string) => {
    writeContract({
      address: CONTRACTS.StratumVault,
      abi: VAULT_ABI,
      functionName: 'depositAndMint',
      args: [parseEther(collateralAmount), parseEther(mintAmount)],
    });
  };

  return {
    position: position ? {
      collateral: position[0],
      debt: position[1],
      ratio: position[2],
      isHealthy: position[3],
    } : null,
    approveOil,
    depositAndMint,
    isPending: isPending || isConfirming,
    isSuccess,
  };
}
