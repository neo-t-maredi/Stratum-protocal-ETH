'use client';

import { useAccount, useReadContract } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import DepositCard from '@/components/DepositCard';
import RatioGauge from '@/components/RatioGauge';
import StrataBackground from '@/components/StrataBackground';
import { useStratumVault } from '@/hooks/useStratumVault';
import { CONTRACTS, OIL_ABI } from '@/lib/contracts';
import { motion } from 'framer-motion';

export default function Home() {
  const { address, isConnected } = useAccount();
  const { position, approveOil, depositAndMint, isPending } = useStratumVault();

  const { data: oilBalance } = useReadContract({
    address: CONTRACTS.OilCollateral,
    abi: OIL_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  const handleDeposit = async (collateral: string, mintAmount: string) => {
    try {
      await approveOil(collateral);
      setTimeout(() => {
        depositAndMint(collateral, mintAmount);
      }, 2000);
    } catch (error) {
      console.error('Deposit failed:', error);
    }
  };

  const collateralRatio = position?.ratio ? Number(position.ratio) / 100 : 150;

  return (
    <main className="min-h-screen relative overflow-hidden bg-[#0a0a0a]">
      <StrataBackground />

      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="relative z-10 p-6 flex justify-between items-center backdrop-blur-sm"
      >
        <div>
          <h1 className="text-4xl font-bold text-white">Stratum Protocol</h1>
          <p className="text-white/60 mt-1">Commodity-Backed Stablecoin</p>
        </div>
        <ConnectButton />
      </motion.header>

      <div className="relative z-10 container mx-auto px-6 py-12">
        
        {!isConnected ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <h2 className="text-6xl font-bold text-white mb-6">
              DeFi Meets<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#b87333] to-[#d4a574]">
                Physical Assets
              </span>
            </h2>
            <p className="text-xl text-white/60 mb-12 max-w-2xl mx-auto">
              Deposit tokenized oil barrels as collateral. Mint sUSD stablecoin.
              Access instant liquidity without selling your reserves.
            </p>
            
            <div className="relative w-full max-w-2xl mx-auto h-[400px] bg-gradient-to-br from-[#b87333]/10 to-[#d4a574]/5 rounded-3xl backdrop-blur-xl border border-white/20 overflow-hidden">
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-8xl mb-6 opacity-20">🛢️</div>
                <h3 className="text-3xl font-bold text-white mb-2">Oil Collateral Vault</h3>
                <p className="text-white/60">Connect wallet to deposit and mint sUSD</p>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#b87333] to-[#d4a574]"></div>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="relative w-full h-[400px] bg-gradient-to-br from-[#b87333]/10 to-[#d4a574]/5 rounded-3xl backdrop-blur-xl border border-white/20 overflow-hidden">
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-7xl mb-6">🛢️</div>
                    <div className="text-center">
                      <div className="text-5xl font-bold text-white mb-2">{collateralRatio.toFixed(0)}%</div>
                      <p className="text-white/60 text-lg">Collateralization Ratio</p>
                    </div>
                  </div>
                  <div 
                    className="absolute bottom-0 left-0 h-2 bg-gradient-to-r from-[#b87333] to-[#d4a574] transition-all duration-500" 
                    style={{ width: `${Math.min(collateralRatio / 2, 100)}%` }}
                  ></div>
                </div>
              </motion.div>

              {position && (
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <RatioGauge
                    ratio={collateralRatio}
                    collateral={position.collateral}
                    debt={position.debt}
                  />
                </motion.div>
              )}
            </div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <DepositCard
                onDeposit={handleDeposit}
                isPending={isPending}
                oilBalance={oilBalance}
              />
            </motion.div>
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-6 border border-white/10">
            <div className="text-white/60 text-sm mb-2">Min. Collateral Ratio</div>
            <div className="text-3xl font-bold text-white">150%</div>
          </div>
          <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-6 border border-white/10">
            <div className="text-white/60 text-sm mb-2">Liquidation Threshold</div>
            <div className="text-3xl font-bold text-[#f59e0b]">130%</div>
          </div>
          <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-6 border border-white/10">
            <div className="text-white/60 text-sm mb-2">Oracle Price (WTI)</div>
            <div className="text-3xl font-bold text-[#10b981]">$75.00</div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}