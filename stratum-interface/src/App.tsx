import { useState } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';

const money = (value: number) => new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value);

export default function Stratum() {
  const [oil, setOil] = useState('100');
  const [debt, setDebt] = useState('4000');
  const [price, setPrice] = useState('75');
  const { isConnected, address } = useAccount();
  const { connect, connectors, isPending, error } = useConnect();
  const { disconnect } = useDisconnect();
  const units = Number(oil), borrowed = Number(debt), quote = Number(price);
  const valid = [units, borrowed, quote].every(n => Number.isFinite(n) && n > 0) && units <= 1e9 && borrowed <= 1e12 && quote <= 150;
  const value = valid ? units * quote : 0;
  const ratio = valid ? value / borrowed * 100 : 0;
  const minimumPrice = valid ? borrowed * 1.5 / units : 0;
  const liquidationPrice = valid ? borrowed * 1.3 / units : 0;
  const status = !valid ? 'Awaiting inputs' : ratio < 130 ? 'Liquidation eligible' : ratio < 150 ? 'Below borrowing minimum' : 'Above borrowing minimum';
  const tone = !valid ? 'neutral' : ratio < 130 ? 'danger' : ratio < 150 ? 'warning' : 'healthy';
  const axisMax = valid ? Math.max(250, Math.ceil((units * 150 / borrowed * 100) / 50) * 50) : 250;
  const x = (p: number) => 50 + p / 150 * 710;
  const y = (r: number) => 258 - Math.min(r / axisMax, 1) * 208;
  const line = valid ? Array.from({ length: 151 }, (_, p) => `${x(p)},${y(units * p / borrowed * 100)}`).join(' ') : '';
  const reset = () => { setOil('100'); setDebt('4000'); setPrice('75'); };
  const exportScenario = () => {
    const blob = new Blob([JSON.stringify({ model: 'Stratum illustrative collateral scenario', source: 'User-entered assumptions; not live market data', oilTokens: units, debtSUSD: borrowed, assumedPriceUSD: quote, collateralRatioPercent: ratio, borrowingMinimumPercent: 150, liquidationBelowPercent: 130, liquidationPriceUSD: liquidationPrice }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'stratum-scenario.json'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return <div className="stratum-app">
    <header className="topbar">
      <a href="#" className="wordmark" aria-label="Stratum home"><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M2 8 16 2 30 8 16 14ZM2 15 16 21 30 15M2 23 16 29 30 23" /></svg>STRATUM<span>PROTOCOL</span></a>
      <nav aria-label="Main navigation"><a href="#workbench">01 / Workbench</a><a href="#mechanics">02 / Mechanics</a><a href="https://github.com/neo-t-maredi/rwa-lab">RWA Lab ↗</a></nav>
      <button className="wallet-button" disabled={isPending || (!isConnected && !connectors.length)} onClick={() => isConnected ? disconnect() : connect({ connector: connectors[0] })}>{isConnected ? `${address?.slice(0, 6)}…${address?.slice(-4)} · disconnect` : isPending ? 'Connecting…' : 'Connect wallet ↗'}</button>
    </header>
    {error && <p className="connection-error" role="alert">Wallet connection: {error.message}</p>}
    <main>
      <section className="intro" aria-labelledby="page-title">
        <div className="intro-copy"><p className="eyebrow">COMMODITY CREDIT / RESEARCH SERIES 01</p><h1 id="page-title">Collateral.<br/><em>Under pressure.</em></h1><p className="intro-deck">A price moves. The debt stays.<br/>Explore the margin between borrowing and liquidation.</p><a className="text-link" href="#workbench">Run a scenario <span>↓</span></a></div>
        <div className="strata-figure"><svg viewBox="0 0 650 340" role="img" aria-labelledby="strata-title"><title id="strata-title">Layered diagram: collateral supports debt, with a margin that changes with price</title><defs><pattern id="strata-grid" width="26" height="26" patternUnits="userSpaceOnUse"><path d="M26 0H0V26" fill="none" stroke="#c1c8d0" strokeWidth=".5"/></pattern></defs><rect width="650" height="340" fill="url(#strata-grid)"/><g className="strata-layers"><path d="m80 220 205-104 212 93-205 105z" fill="#bbc4cf" stroke="#647588"/><path d="m80 220 212 94v18L80 238z" fill="#8998a9"/><path d="m292 314 205-105v18L292 332z" fill="#6e8197"/><path d="m80 171 205-104 212 93-205 105z" fill="#749cda" stroke="#2a5cb7"/><path d="m80 171 212 94v18L80 189z" fill="#4678c3"/><path d="m292 265 205-105v18L292 283z" fill="#224d8c"/><path d="m80 112 205-104 212 93-205 105z" fill="#e6ebf0" fillOpacity=".92" stroke="#586c85"/><path d="m80 112 212 94v12L80 124z" fill="#c7d0db"/><path d="m292 206 205-105v12L292 218z" fill="#aab7c7"/></g><g fill="none" stroke="#60718a"><path d="M375 48h145"/><path d="M420 145h100"/><path d="M450 232h70"/></g><g className="figure-text"><text x="528" y="52">MARGIN</text><text x="528" y="149">DEBT</text><text x="528" y="236">COLLATERAL</text></g></svg><div className="figure-caption"><span>FIG. 01 / POSITION STRUCTURE</span><span>ILLUSTRATIVE MODEL</span></div></div>
      </section>
      <div className="context-strip"><span><i/> LOCAL SCENARIO</span><p>Demonstration OIL tokens · Assumed prices · No physical reserve backing</p><span>150% minimum / &lt;130% liquidation</span></div>
      <section id="workbench" className="workbench" aria-labelledby="workbench-title">
        <div className="section-heading"><div><p className="eyebrow">01 / COLLATERAL WORKBENCH</p><h2 id="workbench-title">Move the price. Read the position.</h2></div><button className="quiet-button" onClick={reset}>Reset scenario ↺</button></div>
        <div className="workbench-grid">
          <div className="chart-panel">
            <div className="chart-heading"><div><span className="chart-label">COLLATERAL RATIO</span><div className="ratio-number">{valid ? ratio.toFixed(1) : '—'}<span>%</span></div></div><div className={`position-status ${tone}`} aria-live="polite"><i/>{status}</div></div>
            <div className="chart-wrap"><svg viewBox="0 0 800 310" role="img" aria-labelledby="chart-title chart-desc"><title id="chart-title">Collateral ratio across assumed OIL prices</title><desc id="chart-desc">{valid ? `Current ratio ${ratio.toFixed(1)} percent at ${quote} dollars per OIL. Borrowing minimum is 150 percent. Liquidation is eligible below 130 percent.` : 'Enter positive values to calculate the scenario.'}</desc>
              <rect x="50" y={y(130)} width="710" height={258-y(130)} fill="#8e4141" fillOpacity=".12"/>
              {[0, 100, 200, axisMax].filter((v,i,a)=>a.indexOf(v)===i && v<=axisMax).map(r=><g key={r}><line x1="50" x2="760" y1={y(r)} y2={y(r)} stroke="#304052"/><text x="37" y={y(r)+4} textAnchor="end" className="axis-text">{r}</text></g>)}
              {[0, 30, 60, 90, 120, 150].map(p=><g key={p}><line x1={x(p)} x2={x(p)} y1="50" y2="258" stroke="#243446"/><text x={x(p)} y="284" textAnchor="middle" className="axis-text">${p}</text></g>)}
              <line x1="50" x2="760" y1={y(150)} y2={y(150)} stroke="#8498ae" strokeDasharray="4 5"/><line x1="50" x2="760" y1={y(130)} y2={y(130)} stroke="#dc9383" strokeDasharray="4 5"/>
              {valid && <><polyline points={line} fill="none" stroke="#80adfb" strokeWidth="2.5"/><line x1={x(quote)} x2={x(quote)} y1="40" y2="258" stroke="#7293bd" strokeDasharray="2 5"/><circle cx={x(quote)} cy={y(ratio)} r="7" fill="#9dc2ff" stroke="#132234" strokeWidth="3"/></>}
            </svg></div>
            <div className="chart-legend"><span><b className="legend-line"/> Scenario ratio</span><span><b className="legend-dash"/> 150% borrowing minimum</span><span><b className="legend-dash danger-line"/> 130% liquidation boundary</span><small>Assumed OIL price / USD →</small></div>
            <div className="chart-metrics"><div><span>Collateral value</span><strong>{valid ? `$${money(value)}` : '—'}</strong></div><div><span>Borrowing capacity at 150%</span><strong>{valid ? money(value/1.5) : '—'} <small>sUSD</small></strong></div><div><span>Liquidation below</span><strong>{valid ? `$${liquidationPrice.toFixed(2)}` : '—'} <small>/ OIL</small></strong></div></div>
          </div>
          <form className="scenario-panel" onSubmit={e=>e.preventDefault()}><div className="panel-title"><h3>Scenario inputs</h3><span>USD MODEL</span></div><label htmlFor="oil">Collateral quantity <span>OIL</span></label><input id="oil" type="number" min="0.01" max="1000000000" step="any" value={oil} onChange={e=>setOil(e.target.value)}/><label htmlFor="debt">Debt issued <span>sUSD</span></label><input id="debt" type="number" min="0.01" max="1000000000000" step="any" value={debt} onChange={e=>setDebt(e.target.value)}/><div className="price-label"><label htmlFor="price">Assumed OIL price</label><div><span>$</span><input id="price" aria-label="Assumed OIL price in dollars" type="number" min="1" max="150" step="any" value={price} onChange={e=>setPrice(e.target.value)}/></div></div><input aria-label="Adjust assumed OIL price" className="price-range" type="range" min="1" max="150" step="1" value={valid ? quote : 75} onChange={e=>setPrice(e.target.value)}/><div className="range-labels"><span>$1</span><span>$150 / OIL</span></div><div className="presets" aria-label="Price presets">{[['Base',75],['Pressure',60],['Shock',45]].map(([label,p])=><button key={label} type="button" aria-pressed={quote===p} onClick={()=>setPrice(String(p))}>{label} <span>${p}</span></button>)}</div>{!valid && <p className="input-error" role="alert">Enter positive quantities and a price between $0 and $150. Quantity limit: 1 billion OIL; debt limit: 1 trillion sUSD.</p>}<p className="model-note">Same collateral. Same debt. Only the assumed price changes with these presets.</p><button className="export-button" type="button" disabled={!valid} onClick={exportScenario}>Export scenario <span>↗</span></button></form>
        </div>
        <p className="calculation-note">{valid ? `At these inputs, the 150% borrowing boundary is $${minimumPrice.toFixed(2)}/OIL.` : 'Set the inputs to inspect position thresholds.'} This local calculation assumes 1 sUSD = $1; it is not a market peg or an on-chain position.</p>
      </section>
      <section id="mechanics" className="mechanics" aria-labelledby="mechanics-title"><div><p className="eyebrow">02 / THE MECHANICS</p><h2 id="mechanics-title">A position has<br/>three moving parts.</h2><a className="text-link" href="https://github.com/neo-t-maredi/Stratum-protocal-ETH">Inspect the contracts <span>↗</span></a></div><div className="mechanics-list"><article><span>01</span><h3>Collateral</h3><p>Owner-minted OIL tokens enter the vault. They model inventory; they do not certify custody of physical barrels.</p></article><article><span>02</span><h3>Debt</h3><p>The configured vault issues sUSD against collateral. New borrowing requires a collateral ratio of at least 150%.</p></article><article><span>03</span><h3>Liquidation</h3><p>Below 130%, a liquidator can cover the debt and receive the position’s entire collateral under the current contract model.</p></article></div></section>
      <aside className="deployment-note"><span>DEPLOYMENT STATUS</span><p>Contract migration pending. Wallet connection is available; transactions are disabled. The workbench runs locally without a wallet.</p><a href="https://github.com/neo-t-maredi/Stratum-protocal-ETH">Source & limitations ↗</a></aside>
    </main>
    <footer><span>STRATUM / RWA LAB</span><p>Commodity credit mechanics. Explicit assumptions.</p><span>RESEARCH PROTOTYPE · 2026</span></footer>
  </div>;
}
