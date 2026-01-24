'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface RatioGaugeProps {
  ratio: number;
  collateral: bigint;
  debt: bigint;
}

export default function RatioGauge({ ratio, collateral, debt }: RatioGaugeProps) {
  const [displayRatio, setDisplayRatio] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayRatio(ratio);
    }, 100);
    return () => clearTimeout(timer);
  }, [ratio]);

  const getColor = () => {
    if (ratio >= 150) return '#10b981'; // Green
    if (ratio >= 130) return '#f59e0b'; // Orange
    return '#ef4444'; // Red
  };

  const getStatus = () => {
    if (ratio >= 150) return 'Healthy';
    if (ratio >= 130) return 'Warning';
    return 'Liquidation Risk';
  };

  const percentage = Math.min((ratio / 200) * 100, 100);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="backdrop-blur-xl bg-white/10 rounded-3xl p-8 border border-white/20 shadow-2xl"
    >
      <h3 className="text-2xl font-bold text-white mb-6">Your Position</h3>

      {/* Circular Gauge */}
      <div className="relative w-48 h-48 mx-auto mb-6">
        <svg className="w-full h-full transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="96"
            cy="96"
            r="80"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="12"
            fill="none"
          />
          {/* Progress circle */}
          <motion.circle
            cx="96"
            cy="96"
            r="80"
            stroke={getColor()}
            strokeWidth="12"
            fill="none"
            strokeLinecap="round"
            initial={{ strokeDashoffset: 502 }}
            animate={{ strokeDashoffset: 502 - (502 * percentage) / 100 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            style={{
              strokeDasharray: 502,
            }}
          />
        </svg>
        
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5 }}
            className="text-4xl font-bold text-white"
          >
            {displayRatio.toFixed(0)}%
          </motion.div>
          <div className="text-sm text-white/60 mt-1">{getStatus()}</div>
        </div>
      </div>

      {/* Stats */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-white/60">Collateral</span>
          <span className="text-white font-bold">
            {(Number(collateral) / 1e18).toFixed(2)} OIL
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-white/60">Debt</span>
          <span className="text-white font-bold">
            {(Number(debt) / 1e18).toFixed(2)} sUSD
          </span>
        </div>

        <div className="h-px bg-white/10 my-4" />

        <div className="flex justify-between items-center text-sm">
          <span className="text-white/60">Liquidation at</span>
          <span className="text-red-400 font-bold">130%</span>
        </div>
      </div>
    </motion.div>
  );
}
