'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface DepositCardProps {
  onDeposit: (collateral: string, mintAmount: string) => void;
  isPending: boolean;
  oilBalance?: bigint;
}

export default function DepositCard({ onDeposit, isPending, oilBalance }: DepositCardProps) {
  const [collateral, setCollateral] = useState('');
  const [mintAmount, setMintAmount] = useState('');

  const handleDeposit = () => {
    if (collateral && mintAmount) {
      onDeposit(collateral, mintAmount);
    }
  };

  // Calculate collateral ratio
  const ratio = collateral && mintAmount 
    ? ((parseFloat(collateral) * 75) / parseFloat(mintAmount)) * 100 
    : 0;

  const isHealthy = ratio >= 150;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative backdrop-blur-xl bg-white/10 rounded-3xl p-8 border border-white/20 shadow-2xl"
    >
      {/* Title */}
      <h2 className="text-3xl font-bold mb-6 text-white">
        Deposit Collateral
      </h2>

      {/* OIL Balance */}
      {oilBalance !== undefined && (
        <div className="mb-6 text-sm text-white/60">
          Available: {(Number(oilBalance) / 1e18).toFixed(2)} OIL
        </div>
      )}

      {/* Collateral Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-white/80 mb-2">
          OIL Collateral
        </label>
        <div className="relative">
          <input
            type="number"
            value={collateral}
            onChange={(e) => setCollateral(e.target.value)}
            placeholder="0.00"
            className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white text-lg focus:outline-none focus:border-[#b87333] transition-all"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60">
            OIL
          </span>
        </div>
        <div className="mt-2 text-xs text-white/50">
          ≈ ${collateral ? (parseFloat(collateral) * 75).toFixed(2) : '0.00'} at $75/barrel
        </div>
      </div>

      {/* Mint Amount Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-white/80 mb-2">
          Mint sUSD
        </label>
        <div className="relative">
          <input
            type="number"
            value={mintAmount}
            onChange={(e) => setMintAmount(e.target.value)}
            placeholder="0.00"
            className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white text-lg focus:outline-none focus:border-[#b87333] transition-all"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60">
            sUSD
          </span>
        </div>
      </div>

      {/* Collateral Ratio Display */}
      {ratio > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`mb-6 p-4 rounded-xl border ${
            isHealthy 
              ? 'bg-green-500/10 border-green-500/30' 
              : 'bg-red-500/10 border-red-500/30'
          }`}
        >
          <div className="flex justify-between items-center">
            <span className="text-white/80">Collateral Ratio</span>
            <span className={`text-xl font-bold ${isHealthy ? 'text-green-400' : 'text-red-400'}`}>
              {ratio.toFixed(1)}%
            </span>
          </div>
          <div className="mt-2 text-xs text-white/60">
            {isHealthy ? '✓ Healthy (minimum 150%)' : '⚠ Below minimum ratio'}
          </div>
        </motion.div>
      )}

      {/* Deposit Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleDeposit}
        disabled={isPending || !isHealthy || !collateral || !mintAmount}
        className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
          isPending || !isHealthy || !collateral || !mintAmount
            ? 'bg-white/10 text-white/30 cursor-not-allowed'
            : 'bg-gradient-to-r from-[#b87333] to-[#d4a574] text-white shadow-lg hover:shadow-xl'
        }`}
      >
        {isPending ? 'Processing...' : 'Deposit & Mint'}
      </motion.button>

      {/* Info */}
      <div className="mt-6 text-xs text-white/50 text-center">
        Liquidation threshold: 130% · Minimum ratio: 150%
      </div>
    </motion.div>
  );
}


