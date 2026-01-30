import { useState } from 'react';
import { 
  FaLayerGroup, 
  FaDatabase, 
  FaArrowDown, 
  FaArrowRight,
  FaDiscord,
  FaTwitter,
  FaGithub
} from "react-icons/fa";
import { FiSettings, FiDollarSign } from "react-icons/fi";
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { CONTRACTS, OIL_ABI, VAULT_ABI, SUSD_ABI } from './wagmi';

export default function StratumProtocol() {
  // ============================================
  // STATE MANAGEMENT
  // ============================================
  // Local state for deposit and mint amounts
  const [depositAmount, setDepositAmount] = useState('1000');
  const [mintAmount, setMintAmount] = useState('40000');
  
  // Get wallet connection status and address
  const { address, isConnected } = useAccount();

  // ============================================
  // READ CONTRACT DATA
  // ============================================
  // Read user's OIL token balance
  const { data: oilBalance } = useReadContract({
    address: CONTRACTS.OilCollateral,
    abi: OIL_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  // Read user's sUSD stablecoin balance
  const { data: susdBalance } = useReadContract({
    address: CONTRACTS.StratumStable,
    abi: SUSD_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  // Read user's CDP position (collateral, debt, ratio, health)
  const { data: position } = useReadContract({
    address: CONTRACTS.StratumVault,
    abi: VAULT_ABI,
    functionName: 'getPosition',
    args: address ? [address] : undefined,
  });

  // ============================================
  // WRITE CONTRACT FUNCTIONS
  // ============================================
  // Approve vault to spend OIL tokens
  const { writeContract: approveOIL, isPending: isApproving } = useWriteContract();
  
  // Deposit OIL and mint sUSD in one transaction
  const { writeContract: depositAndMint, isPending: isDepositing } = useWriteContract();

  // ============================================
  // FORMAT DATA FOR DISPLAY
  // ============================================
  // Convert balances from wei to human-readable format
  const userOilBalance = oilBalance ? formatEther(oilBalance) : '0';
  const userSusdBalance = susdBalance ? formatEther(susdBalance) : '0';
  
  // Extract position data if it exists
  const collateralAmount = position ? formatEther(position[0]) : '0';
  const debtAmount = position ? formatEther(position[1]) : '0';
  const collateralRatio = position ? Number(position[2]) / 100 : 0; // Ratio is stored as percentage * 100

  // ============================================
  // TRANSACTION HANDLERS
  // ============================================
  // Step 1: Approve vault to spend OIL tokens
  const handleApprove = () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) return;
    
    approveOIL({
      address: CONTRACTS.OilCollateral,
      abi: OIL_ABI,
      functionName: 'approve',
      args: [CONTRACTS.StratumVault, parseEther(depositAmount)],
    });
  };

  // Step 2: Deposit OIL and mint sUSD
  const handleDepositAndMint = () => {
    if (!depositAmount || !mintAmount) return;
    if (parseFloat(depositAmount) <= 0 || parseFloat(mintAmount) <= 0) return;
    
    depositAndMint({
      address: CONTRACTS.StratumVault,
      abi: VAULT_ABI,
      functionName: 'depositAndMint',
      args: [parseEther(depositAmount), parseEther(mintAmount)],
    });
  };

  // ============================================
  // RENDER UI
  // ============================================
  return (
    <div className="min-h-screen w-full bg-[#050505] font-['Space_Grotesk'] text-white selection:bg-[#F2C94C] selection:text-black">
      
      {/* ============================================ */}
      {/* HEADER / NAVIGATION */}
      {/* ============================================ */}
      <header className="fixed top-0 left-0 right-0 z-50 h-20 w-full bg-[#050505]/90 backdrop-blur-md border-b border-[#333333] px-6 md:px-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <FaLayerGroup className="text-[#F2C94C] w-6 h-6" />
          <span className="text-2xl font-bold tracking-tighter text-white">STRATUM</span>
        </div>
        
        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-10">
          <a href="#" className="text-white font-medium hover:text-[#F2C94C] transition-colors">Vaults</a>
          <a href="#" className="text-[#A3A3A3] font-regular hover:text-white transition-colors">Markets</a>
          <a href="#" className="text-[#A3A3A3] font-regular hover:text-white transition-colors">Governance</a>
          <a href="#" className="text-[#A3A3A3] font-regular hover:text-white transition-colors">Analytics</a>
        </nav>

        {/* Price Display + Wallet Connection */}
        <div className="flex items-center gap-6">
          <span className="text-[#F2C94C] text-sm font-medium">1 OIL = $75.00</span>
          <ConnectButton />
        </div>
      </header>

      {/* ============================================ */}
      {/* HERO SECTION */}
      {/* ============================================ */}
      <main className="relative w-full pt-20 bg-black overflow-hidden min-h-[800px] flex flex-col">
        {/* Background Image with Gradient Overlay */}
        <div className="absolute top-0 left-0 w-full h-[700px] z-0">
          <img 
            src="/hero-bg.jpg" 
            alt="Industrial Background" 
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/20 via-[#050505]/60 to-[#050505] w-full h-full" />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-20 flex flex-col lg:flex-row justify-between items-start gap-12">
          
          {/* ============================================ */}
          {/* LEFT COLUMN: Hero Text + Stats */}
          {/* ============================================ */}
          <div className="flex-1 pr-0 lg:pr-16 pt-10">
            {/* Live Badge */}
            <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-[#F2C94C]/10 mb-6 border border-[#F2C94C]/20">
              <span className="w-2 h-2 rounded-full bg-[#F2C94C] mr-2 animate-pulse"></span>
              <span className="text-[#F2C94C] text-xs font-bold uppercase tracking-wide">LIVE ON SEPOLIA</span>
            </div>
            
            {/* Main Headline */}
            <h1 className="text-5xl md:text-6xl leading-tight font-bold text-white mb-6">
              Liquidate your <br />
              <span className="text-[#F2C94C]">Energy Assets</span> <br />
              without selling.
            </h1>
            
            {/* Description */}
            <p className="text-lg font-light text-[#CCCCCC] leading-relaxed max-w-2xl mb-12">
              Stratum allows energy producers to deposit tokenized oil barrels (OIL) as collateral to mint sUSD, the first energy-backed stablecoin.
            </p>

            {/* User Balance Display (only show when wallet connected) */}
            {isConnected && (
              <div className="grid grid-cols-2 gap-4 p-4 bg-[#1A1A1A] border border-[#333333] rounded-lg mb-10">
                <div>
                  <div className="text-sm text-[#888888]">OIL Balance</div>
                  <div className="text-lg font-bold">{parseFloat(userOilBalance).toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-sm text-[#888888]">sUSD Balance</div>
                  <div className="text-lg font-bold text-[#56CCF2]">{parseFloat(userSusdBalance).toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-sm text-[#888888]">Collateral</div>
                  <div className="text-lg font-bold text-[#F2C94C]">{parseFloat(collateralAmount).toFixed(2)} OIL</div>
                </div>
                <div>
                  <div className="text-sm text-[#888888]">Debt</div>
                  <div className="text-lg font-bold">{parseFloat(debtAmount).toFixed(2)} sUSD</div>
                </div>
              </div>
            )}

            {/* Protocol Stats */}
            <div className="flex items-center gap-10">
              <div className="flex flex-col">
                <span className="text-[#888888] text-sm mb-2">Total Value Locked</span>
                <span className="text-3xl font-bold text-white">$142,500,000</span>
              </div>
              <div className="w-px h-16 bg-[#333333]"></div>
              <div className="flex flex-col">
                <span className="text-[#888888] text-sm mb-2">sUSD Supply</span>
                <span className="text-3xl font-bold text-white">$89,200,000</span>
              </div>
            </div>
          </div>

          {/* ============================================ */}
          {/* RIGHT COLUMN: Interaction Card */}
          {/* ============================================ */}
          <div className="w-full lg:w-[420px]">
            <div className="bg-[#1A1A1A]/80 backdrop-blur-xl border border-[#333333] rounded-2xl p-8 shadow-2xl relative overflow-hidden group">
              {/* Decorative glow effect */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#F2C94C] rounded-full blur-[120px] opacity-20 pointer-events-none group-hover:opacity-30 transition-opacity duration-700"></div>

              {/* Card Header */}
              <div className="flex justify-between items-center mb-6 relative z-10">
                <h2 className="text-xl font-bold text-white">Open Vault</h2>
                <button className="text-[#888888] hover:text-white transition-colors">
                  <FiSettings className="w-5 h-5" />
                </button>
              </div>

              {/* Check if wallet is connected */}
              {!isConnected ? (
                // Show connect prompt if not connected
                <div className="text-center py-16">
                  <div className="relative p-8 rounded-2xl bg-gradient-to-br from-white/5 to-white/0 border border-white/10 backdrop-blur-sm">
                    <FaLayerGroup className="w-16 h-16 text-[#F2C94C] mx-auto mb-4 opacity-50" />
                    <p className="text-xl font-bold text-white mb-2">Wallet Not Connected</p>
                    <p className="text-white/60">Use the Connect Wallet button above to get started</p>
                  </div>
                </div>
              ) : (
                // Show interaction form if connected
                <>
                  {/* ============================================ */}
                  {/* DEPOSIT COLLATERAL INPUT */}
                  {/* ============================================ */}
                  <div className="mb-4 relative z-10">
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-xs text-[#AAAAAA]">Deposit Collateral</span>
                      <span className="text-xs text-[#AAAAAA]">Bal: {parseFloat(userOilBalance).toFixed(2)} OIL</span>
                    </div>
                    <div className="bg-[#0A0A0A] border border-[#333333] rounded-lg p-4 flex justify-between items-center group-hover:border-[#555] transition-colors">
                      <input
                        type="number"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        className="flex-1 bg-transparent text-2xl font-medium text-white outline-none"
                        placeholder="0"
                      />
                      <div className="flex items-center gap-2 bg-[#222222] px-3 py-1.5 rounded-full border border-[#333333]">
                        <FaDatabase className="text-[#F2C94C] w-4 h-4" />
                        <span className="text-sm font-bold text-white">OIL</span>
                      </div>
                    </div>
                    <div className="flex justify-between mt-1.5 px-1">
                      <span className="text-xs text-[#666666]">≈ ${(parseFloat(depositAmount || '0') * 75).toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Arrow Divider */}
                  <div className="flex justify-center -my-3 relative z-20">
                    <div className="w-8 h-8 bg-[#222222] border border-[#333333] rounded-full flex items-center justify-center">
                      <FaArrowDown className="text-white w-3 h-3" />
                    </div>
                  </div>

                  {/* ============================================ */}
                  {/* BORROW STABLECOIN INPUT */}
                  {/* ============================================ */}
                  <div className="mb-8 relative z-10 pt-2">
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-xs text-[#AAAAAA]">Borrow Stablecoin</span>
                      <span className="text-xs text-[#AAAAAA]">Max: {(parseFloat(depositAmount || '0') * 75 * 0.66).toFixed(0)} sUSD</span>
                    </div>
                    <div className="bg-[#0A0A0A] border border-[#333333] rounded-lg p-4 flex justify-between items-center group-hover:border-[#555] transition-colors">
                      <input
                        type="number"
                        value={mintAmount}
                        onChange={(e) => setMintAmount(e.target.value)}
                        className="flex-1 bg-transparent text-2xl font-medium text-white outline-none"
                        placeholder="0"
                      />
                      <div className="flex items-center gap-2 bg-[#222222] px-3 py-1.5 rounded-full border border-[#333333]">
                        <FiDollarSign className="text-[#56CCF2] w-4 h-4" />
                        <span className="text-sm font-bold text-white">sUSD</span>
                      </div>
                    </div>
                  </div>

                  {/* ============================================ */}
                  {/* POSITION INFO */}
                  {/* ============================================ */}
                  <div className="space-y-3 mb-8 relative z-10">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[#888888]">Collateral Ratio</span>
                      <span className={`text-sm font-bold ${
                        collateralRatio > 150 ? 'text-[#56CCF2]' : 
                        collateralRatio > 130 ? 'text-[#F2C94C]' : 
                        'text-red-500'
                      }`}>
                        {collateralRatio > 0 ? `${collateralRatio.toFixed(0)}%` : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[#888888]">Liquidation Price</span>
                      <span className="text-sm font-medium text-white">$48.75</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[#888888]">Stability Fee</span>
                      <span className="text-sm font-medium text-white">0.5%</span>
                    </div>
                  </div>

                  {/* ============================================ */}
                  {/* ACTION BUTTONS */}
                  {/* ============================================ */}
                  <div className="space-y-3 relative z-10">
                    {/* Step 1: Approve OIL spending */}
                    <button 
                      onClick={handleApprove}
                      disabled={isApproving || !depositAmount || parseFloat(depositAmount) <= 0}
                      className="w-full py-4 bg-[#F2C94C] hover:bg-[#D4AF37] disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold text-base rounded-lg transition-all shadow-[0_0_20px_rgba(242,201,76,0.3)] hover:shadow-[0_0_30px_rgba(242,201,76,0.5)]"
                    >
                      {isApproving ? 'Approving...' : '1. Approve OIL'}
                    </button>
                    
                    {/* Step 2: Deposit and Mint */}
                    <button 
                      onClick={handleDepositAndMint}
                      disabled={isDepositing || !depositAmount || !mintAmount || parseFloat(depositAmount) <= 0 || parseFloat(mintAmount) <= 0}
                      className="w-full py-4 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-base rounded-lg border border-white/20 transition-all"
                    >
                      {isDepositing ? 'Processing...' : '2. Deposit & Mint sUSD'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* ============================================ */}
      {/* SECONDARY CONTENT SECTION */}
      {/* ============================================ */}
      <section className="w-full bg-[#050505] py-20 border-t border-[#222222]">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-10">
          
          {/* Asset Card */}
          <div className="bg-[#141414] border border-[#222222] rounded-2xl overflow-hidden hover:border-[#333333] transition-colors group">
            <div className="h-60 w-full overflow-hidden relative">
              <div className="absolute inset-0 bg-black/20 z-10 group-hover:bg-transparent transition-colors duration-500"></div>
              <img 
                src="/barrels.jpg" 
                alt="Oil Barrels" 
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" 
              />
            </div>
            <div className="p-8">
              <span className="inline-block text-[#F2C94C] text-xs font-bold tracking-wider uppercase mb-3 px-2 py-1 bg-[#F2C94C]/10 rounded border border-[#F2C94C]/20">Underlying Asset</span>
              <h3 className="text-2xl font-bold text-white mb-4">Arab Light Crude Oil</h3>
              <p className="text-[#999999] text-base leading-relaxed mb-6">
                The Stratum Protocol accepts audited, tokenized barrels of Arab Light crude oil from Middle Eastern producers. All assets are physically verified and stored in regulated facilities, ensuring 1:1 backing for every OIL token minted.
              </p>
              <a 
                href={`https://sepolia.etherscan.io/address/${CONTRACTS.OilCollateral}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-white font-medium hover:text-[#F2C94C] transition-colors group/link"
              >
                <span>View Smart Contract</span>
                <FaArrowRight className="w-3.5 h-3.5 transform group-hover/link:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>

          {/* Protocol Mechanics */}
          <div className="p-8 flex flex-col justify-center">
            <h3 className="text-3xl font-bold text-white mb-10">Protocol Mechanics</h3>
            
            <div className="space-y-10">
              {/* Step 01 */}
              <div className="flex gap-6 group">
                <span className="text-5xl font-light text-[#333333] leading-none select-none group-hover:text-[#555] transition-colors">01</span>
                <div>
                  <h4 className="text-xl font-bold text-white mb-2">Tokenize</h4>
                  <p className="text-[#888888] text-base leading-relaxed">
                    Partners tokenize physical inventory into ERC-20 OIL tokens through verified bridge partners.
                  </p>
                </div>
              </div>

              {/* Step 02 */}
              <div className="flex gap-6 group">
                <span className="text-5xl font-light text-[#333333] leading-none select-none group-hover:text-[#555] transition-colors">02</span>
                <div>
                  <h4 className="text-xl font-bold text-white mb-2">Deposit</h4>
                  <p className="text-[#888888] text-base leading-relaxed">
                    Users deposit OIL into the Stratum Vault smart contracts to open a Collateralized Debt Position (CDP).
                  </p>
                </div>
              </div>

              {/* Step 03 */}
              <div className="flex gap-6 group">
                <span className="text-5xl font-light text-[#333333] leading-none select-none group-hover:text-[#555] transition-colors">03</span>
                <div>
                  <h4 className="text-xl font-bold text-white mb-2">Borrow sUSD</h4>
                  <p className="text-[#888888] text-base leading-relaxed">
                    Mint sUSD against your oil collateral with low stability fees. Repay anytime to unlock your underlying assets.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ============================================ */}
      {/* FOOTER */}
      {/* ============================================ */}
      <footer className="w-full bg-black border-t border-[#222222] py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <FaLayerGroup className="text-[#444] w-5 h-5" />
            <span className="text-lg font-bold text-[#666]">STRATUM</span>
          </div>
          <div className="text-[#444] text-sm">© 2026 Stratum Protocol. All rights reserved.</div>
          <div className="flex items-center gap-6 text-[#666]">
            <FaTwitter className="w-5 h-5 hover:text-white cursor-pointer transition-colors" />
            <FaDiscord className="w-5 h-5 hover:text-white cursor-pointer transition-colors" />
            <FaGithub className="w-5 h-5 hover:text-white cursor-pointer transition-colors" />
          </div>
        </div>
      </footer>
    </div>
  );
}
