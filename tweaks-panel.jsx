// Screens — Pay, Roster, Capture

// ============================================================
// PAY — same-day settlement
// ============================================================
function PayScreen({ showToast }) {
  const [paidIds, setPaidIds] = React.useState(new Set());
  const items = PAYOUTS.map(p => paidIds.has(p.id) ? {...p, when:'paid', eta:`paid · just now`} : p);

  const pending = items.filter(p => p.when === 'pending');
  const paid    = items.filter(p => p.when === 'paid');

  const pendingTotal = pending.reduce((s,p)=>s+p.net, 0);
  const paidTotal    = paid.reduce((s,p)=>s+p.net, 0);
  const avgDaysSaved = 38;

  const payOne = (p) => {
    setPaidIds(prev => { const n = new Set(prev); n.add(p.id); return n; });
    showToast(`Paid $${p.net.toLocaleString(undefined,{minimumFractionDigits:2})} via RTP · ${p.driver}`);
  };
  const payAll = () => {
    setPaidIds(prev => { const n = new Set(prev); pending.forEach(p => n.add(p.id)); return n; });
    showToast(`Released $${pendingTotal.toLocaleString(undefined,{minimumFractionDigits:2})} to ${pending.length} carriers`);
  };

  return (
    <>
      <PageHead
        index="III · Pay"
        title="Delivered today," titleEm="paid today."
        sub="Driver hits delivered, BOL clears, ACH or RTP lands the same business day. No factor in the middle."
        actions={<button className="btn btn-ghost"><I.Settings size={14}/>Payout settings</button>}
      />

      <div className="pay-hero">
        <div className="h-cell">
          <div className="lbl">Releasing today</div>
          <div className="big mono">${pendingTotal.toLocaleString(undefined,{minimumFractionDigits:0,maximumFractionDigits:0})}</div>
          <div className="caption">{pending.length} payouts queued · funds land by 16:00 ET on RTP rails.</div>
          {pending.length > 0 && (
            <div className="pay-cta-large">
              <button className="btn btn-moss" onClick={payAll}>
                <I.Bolt size={14} sw={1.8}/>Release all
              </button>
              <button className="btn btn-ghost">Review</button>
            </div>
          )}
        </div>
        <div className="h-cell">
          <div className="lbl">Already paid this week</div>
          <div className="big mono">${paidTotal.toLocaleString(undefined,{minimumFractionDigits:0,maximumFractionDigits:0})}</div>
          <div className="caption">{paid.length} same-day settlements · saved {avgDaysSaved} days vs broker NET-30.</div>
        </div>
        <div className="h-cell">
          <div className="lbl">Effective factoring fee</div>
          <div className="big"><em>1.0</em>%</div>
          <div className="caption">vs 2.5–5% typical Quick Pay. Same money, fewer middlemen.</div>
        </div>
      </div>

      <h3 className="eyebrow" style={{marginBottom:14}}>Queued · waiting for release</h3>
      <table className="tbl" style={{marginBottom:36}}>
        <thead>
          <tr>
            <th>Payout</th>
            <th>Load · driver</th>
            <th>POD captured</th>
            <th>Rail</th>
            <th className="r">Gross</th>
            <th className="r">Net</th>
            <th>Risk</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {pending.length === 0 && (
            <tr><td colSpan="8" style={{padding:'32px 0', textAlign:'center', color:'var(--ink-soft)', cursor:'default'}}>
              All caught up. Drivers are paid.
            </td></tr>
          )}
          {pending.map(p => (
            <tr key={p.id} style={{cursor:'default'}}>
              <td><div className="id-cell"><span className="num">{p.id}</span></div><div className="customer">{p.carrier}</div></td>
              <td><div className="mono" style={{fontSize:13}}>{p.loadId}</div><div className="customer">{p.driver}</div></td>
              <td className="mono" style={{fontSize:12, color:'var(--ink-soft)'}}>{p.podAt}</td>
              <td><span className="stat-mark"><span className="d" style={{background:p.rail==='RTP'?'var(--moss)':'var(--klint-soft)'}}/>{p.rail}</span></td>
              <td className="r mono">${p.amount.toLocaleString()}</td>
              <td className="r mono" style={{fontSize:14}}>${p.net.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}</td>
              <td>{p.riskFlag
                ? <span style={{fontSize:12, color:'var(--ochre)'}}><I.Alert size={12} sw={2} style={{display:'inline-block', verticalAlign:'-2px', marginRight:4}}/>{p.riskFlag}</span>
                : <span className="muted">clean</span>}</td>
              <td className="r" onClick={e=>e.stopPropagation()}>
                <button className="btn btn-moss btn-sm" onClick={()=>payOne(p)}>
                  <I.Bolt size={12} sw={1.8}/>Pay
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 className="eyebrow" style={{marginBottom:14}}>Recent · settled</h3>
      <table className="tbl">
        <thead>
          <tr>
            <th>Payout</th>
            <th>Load · driver</th>
            <th>Settled</th>
            <th>Rail</th>
            <th className="r">Net</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {paid.map(p => (
            <tr key={p.id} style={{cursor:'default'}}>
              <td><div className="id-cell"><span className="num">{p.id}</span></div></td>
              <td><div className="mono" style={{fontSize:13}}>{p.loadId}</div><div className="customer">{p.driver}</div></td>
              <td className="mono" style={{fontSize:12, color:'var(--ink-soft)'}}>{p.eta}</td>
              <td><span className="stat-mark"><span className="d" style={{background:p.rail==='RTP'?'var(--moss)':'var(--klint-soft)'}}/>{p.rail}</span></td>
              <td className="r mono" style={{fontSize:14}}>${p.net.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}</td>
              <td className="r"><span className="stat-mark"><span className="d d-paid"/>Paid</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

// ============================================================
// ROSTER — Drivers + Trucks
// ============================================================
function RosterScreen() {
  const [view, setView] = React.useState('drivers');

  return (
    <>
      <PageHead
        index="IV · Roster"
        title="The people," titleEm="and the steel."
        sub="Seven drivers, twenty-two units. One driver needs your attention before tomorrow's dispatch."
        actions={<>
          <button className="btn btn-ghost"><I.Plus size={14} sw={2}/>{view==='drivers'?'New driver':'New truck'}</button>
        </>}
      />

      <div className="subtabs">
        <button aria-pressed={view==='drivers'} onClick={()=>setView('drivers')}>Drivers · 7</button>
        <button aria-pressed={view==='trucks'} onClick={()=>setView('trucks')}>Trucks · 22</button>
      </div>

      {view === 'drivers' && (
        <>
          <div className="banner crit">
            <div className="mark"><I.Alert sw={1.8}/></div>
            <div className="body">
              <strong>J. Patel</strong>'s CDL expired on 01/12/2024 — <span className="mono" style={{fontStyle:'normal'}}>487 days overdue</span>. Load <span className="mono" style={{fontStyle:'normal'}}>L-1045</span> still awaits a reassignment.
            </div>
            <button className="resolve">Resolve →</button>
          </div>

          <table className="tbl">
            <thead>
              <tr>
                <th>Driver</th>
                <th>CDL number</th>
                <th>Phone</th>
                <th>CDL expiry</th>
                <th>Medical cert</th>
                <th>Status</th>
                <th>Truck</th>
              </tr>
            </thead>
            <tbody>
              {DRIVERS.map(d => (
                <tr key={d.cdl} style={{cursor:'default'}}>
                  <td><div className="id-cell"><span className="num">{d.name}</span></div></td>
                  <td className="mono">{d.cdl}</td>
                  <td className="mono" style={{color:'var(--ink-soft)'}}>{d.phone}</td>
                  <td><ExpiryCell dateStr={d.expiry}/></td>
                  <td><ExpiryCell dateStr={d.medical}/></td>
                  <td><Status s={d.status}/></td>
                  <td className="mono">{d.truck}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {view === 'trucks' && (
        <table className="tbl">
          <thead>
            <tr>
              <th>Unit</th>
              <th>Make &amp; model</th>
              <th>Year</th>
              <th>VIN</th>
              <th className="r">Odometer</th>
              <th>Last service</th>
              <th>Status</th>
              <th>Driver</th>
            </tr>
          </thead>
          <tbody>
            {TRUCKS.map(t => (
              <tr key={t.unit} style={{cursor:'default'}}>
                <td><div className="id-cell"><span className="num">{t.unit}</span></div></td>
                <td>{t.make}</td>
                <td className="mono">{t.year}</td>
                <td className="mono" style={{color:'var(--ink-soft)'}}>{t.vin}</td>
                <td className="r mono">{t.miles.toLocaleString()}</td>
                <td className="mono" style={{color:'var(--ink-soft)'}}>{t.lastService.replace(/^(\d{4})\/(\d{2})\/(\d{2})$/,'$2/$3/$1')}</td>
                <td><Status s={t.status}/></td>
                <td>{t.driver}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}

// ============================================================
// CAPTURE — Driver POD mobile flow
// ============================================================
function CaptureScreen() {
  return (
    <>
      <PageHead
        index="V · Capture"
        title="Proof," titleEm="delivered."
        sub="The driver's three taps — arrival, photograph, signature — then home. Dispatch sees it in seconds, accounting sees the invoice by 16:00."
        actions={null}
      />

      <div className="pod-board">
        {/* 1. checklist */}
        <div className="pod">
          <div className="pod-inner">
            <div className="pod-statusbar"><span>9:41</span><span>5G</span></div>
            <div className="pod-head">
              <div className="back">← Loads</div>
              <h3>L-1042 · <em>Cleveland</em></h3>
              <div className="when">Midwest Foods Co. · 14:00 window</div>
            </div>
            <div className="pod-body">
              <div className="check done"><div className="b"><I.Check sw={2.6}/></div><div className="lbl">Arrived at receiver</div><div className="t">13:42</div></div>
              <div className="check done"><div className="b"><I.Check sw={2.6}/></div><div className="lbl">Doors opened</div><div className="t">13:58</div></div>
              <div className="check done"><div className="b"><I.Check sw={2.6}/></div><div className="lbl">Pallets unloaded</div><div className="t">14:24</div></div>
              <div className="check current"><div className="b">4</div><div className="lbl">Photograph BOL</div><div className="t">now</div></div>
              <div className="check todo"><div className="b" style={{color:'var(--ink-dim)'}}>5</div><div className="lbl">Signature</div><div className="t"></div></div>
              <div className="check todo"><div className="b" style={{color:'var(--ink-dim)'}}>6</div><div className="lbl">Submit</div><div className="t"></div></div>
            </div>
            <div className="pod-cta"><button className="btn btn-primary"><I.Camera size={14} sw={1.8}/>Photograph BOL</button></div>
          </div>
        </div>

        {/* 2. capture */}
        <div className="pod">
          <div className="pod-inner">
            <div className="pod-statusbar"><span>9:42</span><span>5G</span></div>
            <div className="pod-head">
              <div className="back">← Step 3</div>
              <h3>Photograph <em>the BOL.</em></h3>
              <div className="when">We'll read the numbers ourselves.</div>
            </div>
            <div className="pod-body">
              <div className="frame-shot">
                <div className="corner c1"/><div className="corner c2"/><div className="corner c3"/><div className="corner c4"/>
                <div className="ghost-line l1"/><div className="ghost-line l2"/><div className="ghost-line l3"/><div className="ghost-line l4"/>
              </div>
              <div className="pod-cap">Hold the page flat inside the marks. The BOL number, pallet count, and receiver name will be matched to <span className="mono" style={{fontStyle:'normal'}}>L-1042</span> before the camera lets go.</div>
            </div>
            <div className="pod-cta" style={{display:'flex', gap:8}}>
              <button className="btn btn-ghost" style={{flex:1}}>Skip</button>
              <button className="btn btn-primary" style={{flex:2}}><I.Camera size={14} sw={1.8}/>Capture</button>
            </div>
          </div>
        </div>

        {/* 3. paid */}
        <div className="pod">
          <div className="pod-inner">
            <div className="pod-statusbar"><span>9:44</span><span>5G</span></div>
            <div className="pod-head">
              <div className="back" style={{color:'var(--moss)'}}>Settled</div>
              <h3>You're <em>paid.</em></h3>
              <div className="when">$2,450 landed at 16:00 ET.</div>
            </div>
            <div className="pod-body">
              <div className="pod-summary">
                <div style={{display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid var(--rule)'}}><span style={{color:'var(--ink-soft)'}}>Load</span><span className="mono">L-1042</span></div>
                <div style={{display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid var(--rule)'}}><span style={{color:'var(--ink-soft)'}}>BOL number</span><span className="mono">BOL-77410-A</span></div>
                <div style={{display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid var(--rule)'}}><span style={{color:'var(--ink-soft)'}}>Delivered</span><span className="mono">14:24</span></div>
                <div style={{display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid var(--rule)'}}><span style={{color:'var(--ink-soft)'}}>Gross</span><span className="mono">$2,450.00</span></div>
                <div style={{display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid var(--rule)'}}><span style={{color:'var(--ink-soft)'}}>Platform fee</span><span className="mono" style={{color:'var(--ink-soft)'}}>−$24.50</span></div>
                <div style={{display:'flex', justifyContent:'space-between', padding:'10px 0 8px', fontSize:15}}><span style={{color:'var(--ink)'}}>Net to carrier</span><span className="mono" style={{color:'var(--moss)', fontWeight:600}}>$2,425.50</span></div>
              </div>
              <div className="pod-cap" style={{marginTop:8}}>Same day. No factor. No NET-30. The receipt is in your texts.</div>
            </div>
            <div className="pod-cta"><button className="btn btn-moss"><I.Check size={14} sw={2.4}/>Done</button></div>
          </div>
        </div>
      </div>
    </>
  );
}

Object.assign(window, { PayScreen, RosterScreen, CaptureScreen });
