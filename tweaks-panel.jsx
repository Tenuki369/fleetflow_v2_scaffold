// Screens — Dispatch, Match, Compliance
const { useState: _u1, useMemo: _u2 } = React;

// ============================================================
// DISPATCH — the board
// ============================================================
function DispatchScreen({ wedges, openLoad, showToast }) {
  const [filter, setFilter] = React.useState('All');
  const [q, setQ] = React.useState('');
  const tabs = ['All','Pending','Dispatched','In Transit','Delivered','Invoiced','Paid'];
  const rows = React.useMemo(()=>{
    let r = LOADS;
    if (filter !== 'All') r = r.filter(l => l.status === filter);
    if (q) r = r.filter(l => (l.id+l.customer+l.origin+l.dest+l.driver).toLowerCase().includes(q.toLowerCase()));
    return r;
  }, [filter, q]);

  const inMotion = LOADS.filter(l => ['In Transit','Dispatched'].includes(l.status)).length;
  const awaiting = LOADS.filter(l => l.status === 'Pending').length;
  const weekRev = LOADS.reduce((s,l)=>s+l.rate,0);
  const podsDue = LOADS.filter(l => l.status === 'Delivered' && !l.invoiced).length;

  return (
    <>
      <PageHead
        index="I · Dispatch"
        title="The board," titleEm="quietly."
        sub="Eight loads on the table. One driver out of HOS by sundown, two PODs waiting on the phone."
        actions={<>
          <button className="btn btn-quiet">Import CSV</button>
          <button className="btn btn-primary" onClick={()=>showToast('New load drafted (demo)')}><I.Plus size={14} sw={2}/>New load</button>
        </>}
      />

      <Stats items={[
        { lbl:'Loads in motion',    val:String(inMotion), sub:`${awaiting} awaiting a driver`, cls: awaiting>0?'warn':'up' },
        { lbl:'PODs to invoice',    val:String(podsDue),  sub:'auto-drafts ready',              cls: podsDue>0?'warn':'' },
        { lbl:'Revenue, this week', val:`$${(weekRev/1000).toFixed(1)}k`, sub:'+8.2% vs last week', cls:'up' },
        { lbl:'On-time delivery',   val:'94.6%',          sub:'rolling 30 days',                cls:'' },
      ]}/>

      {/* AI match strip — only if wedge on */}
      {wedges.match && <MatchStrip openLoad={openLoad} showToast={showToast}/>}

      <div className="toolbar">
        <div className="search">
          <I.Search/>
          <input placeholder="Search by load, customer, driver, city…" value={q} onChange={e=>setQ(e.target.value)}/>
        </div>
        <div className="filters">
          <span className="lbl">Status</span>
          <div className="group">
            {tabs.map(t => (
              <button key={t} className="chip" aria-pressed={filter===t} onClick={()=>setFilter(t)}>{t}</button>
            ))}
          </div>
        </div>
      </div>

      <table className="tbl">
        <thead>
          <tr>
            <th>Load</th>
            <th>Status</th>
            <th>Route</th>
            <th>Window</th>
            <th>Driver</th>
            <th className="r">Miles</th>
            <th className="r">Rate</th>
            <th>Docs</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(l => {
            const docsReady = l.bol && l.pod && l.rateCon;
            return (
              <tr key={l.id} onClick={()=>openLoad(l)}>
                <td>
                  <div className="id-cell"><span className="num">{l.id}</span></div>
                  <div className="customer">{l.customer}</div>
                </td>
                <td><Status s={l.status}/></td>
                <td>
                  <div className="route">
                    <span>{l.origin}</span>
                    <span className="arr">→</span>
                    <span>{l.dest}</span>
                  </div>
                </td>
                <td>
                  <div className="mono" style={{fontSize:12, color:'var(--ink)'}}>{l.pickup} → {l.deliver}</div>
                </td>
                <td>
                  <div>{l.driver}</div>
                  <div className="customer mono" style={{fontSize:11}}>{l.truck}</div>
                </td>
                <td className="r mono">{l.miles.toLocaleString()}</td>
                <td className="r mono">${l.rate.toLocaleString()}</td>
                <td onClick={e=>e.stopPropagation()}>
                  <div className="mono" style={{fontSize:11, color:'var(--ink-soft)'}}>
                    {docsReady ? <span style={{color:'var(--moss)'}}>● ● ●</span> :
                      <span>
                        <span style={{color: l.rateCon?'var(--moss)':'var(--ink-dim)'}}>●</span>{' '}
                        <span style={{color: l.bol?'var(--moss)':'var(--ink-dim)'}}>●</span>{' '}
                        <span style={{color: l.pod?'var(--moss)':'var(--ink-dim)'}}>●</span>
                      </span>
                    }
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
}

// ============================================================
// AI MATCH STRIP — embedded in Dispatch
// ============================================================
function MatchStrip({ openLoad, showToast }) {
  const m = MATCHES[0];
  return (
    <div className="match-strip">
      <div className="mhead">
        <div className="left">
          <span className="ai"><I.Sparkle size={9} sw={2}/> Next best load</span>
          <span className="ttl">
            <em>{m.driver}</em> empties in <em>{m.from.split(',')[0]}</em> at 18:00.
          </span>
        </div>
        <div className="right">
          <span className="meta">
            <span><I.Clock size={12}/></span>
            <span><span className="mono">{m.hosLeft}h</span> HOS left</span>
          </span>
          <button className="btn btn-quiet btn-sm">See all 14 boards</button>
        </div>
      </div>
      <div className="cands">
        {m.candidates.map((c, i) => (
          <div key={c.id} className={`cand ${i===0?'top':''}`}>
            <div className="fit-bar">
              <span className="num">{c.fit}</span>
              <span className="lbl">fit</span>
            </div>
            <div className="row">
              <span className="id">{c.id}</span>
            </div>
            <div className="route2">
              {c.origin.split(',')[0]}<br/>
              <span className="to">to {c.dest.split(',')[0]}.</span>
            </div>
            <div className="stats-row">
              <span><span className="v mono">${c.rate.toLocaleString()}</span><br/>rate</span>
              <span><span className="v mono">${c.rpm}</span><br/>/mile</span>
              <span><span className="v mono">{c.deadhead}mi</span><br/>deadhead</span>
              <span><span className="v mono">{c.miles}mi</span><br/>haul</span>
            </div>
            <div className="reason">{c.reason}</div>
            <div className="book">
              <button className="btn btn-primary" onClick={()=>showToast(`Booked ${c.id} from ${c.broker}`)}>Book</button>
              <button className="btn btn-ghost">Decline</button>
            </div>
            <div className="muted" style={{display:'flex', justifyContent:'space-between'}}>
              <span>{c.broker}</span>
              <span>{c.posted}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// COMPLIANCE — copilot
// ============================================================
function ComplianceScreen({ showToast }) {
  const items = COMPLIANCE;
  const crit = items.filter(i => i.severity === 'critical').length;
  const warn = items.filter(i => i.severity === 'warn').length;
  return (
    <>
      <PageHead
        index="II · Compliance"
        title="The clock," titleEm="watched for you."
        sub="What FMCSA, DOT, and your factoring company would ask about tomorrow — answered today."
        actions={<button className="btn btn-ghost"><I.File size={14}/>Audit-ready bundle</button>}
      />

      <div className="cop-wrap">
        <div className="cop-list">
          {items.map((it, i) => (
            <div key={i} className={`cop-item ${it.severity}`} onClick={()=>showToast(`Opened ${it.kind}: ${it.subject}`)}>
              <span className="dot"/>
              <span className="kind">{it.kind}</span>
              <div className="body">
                <div className="ttl">{it.subject} <em>— {it.detail.split(' · ')[0]}</em></div>
                <div className="detail">
                  {it.detail.split(' · ').slice(1).map((p, j) => <span key={j}><span className="mono">{p}</span>{j < it.detail.split(' · ').length-2 ? ' · ' : ''}</span>)}
                </div>
              </div>
              <button className="act" onClick={(e)=>{e.stopPropagation(); showToast(`Resolved: ${it.action}`)}}>
                {it.action.split(' · ')[0]} →
              </button>
            </div>
          ))}
        </div>

        <aside className="cop-aside">
          <div className="eyebrow" style={{marginBottom:10}}>Copilot summary</div>
          <div className="ttl">
            <em>One</em> driver to move,<br/> <em>two</em> trucks to schedule.
          </div>
          <div className="sub">The rest of the week is clear. We'll text the drivers and email the shop unless you tell us otherwise.</div>

          <div className="stat-line"><span className="k">Critical</span><span className="v bad">{crit}</span></div>
          <div className="stat-line"><span className="k">Due in 30 days</span><span className="v warn">{warn}</span></div>
          <div className="stat-line"><span className="k">CSA score</span><span className="v ok">52 · safe</span></div>
          <div className="stat-line"><span className="k">DOT audit risk</span><span className="v ok">low</span></div>
          <div className="stat-line"><span className="k">IFTA · Q2</span><span className="v">draft 60%</span></div>

          <button className="btn btn-primary" style={{width:'100%', marginTop:18}}>
            <I.Shield size={14} sw={1.8}/>Run weekly check
          </button>
          <div className="muted" style={{marginTop:10, textAlign:'center'}}>Last run · today 06:00 CT</div>
        </aside>
      </div>
    </>
  );
}

Object.assign(window, { DispatchScreen, ComplianceScreen });
