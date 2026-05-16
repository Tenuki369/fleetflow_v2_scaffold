// Shared components — Header, PageHead, Status, ExpiryCell, Stats, LoadDrawer, Toast
const { useState, useMemo, useEffect, useRef } = React;

const STATUS_DOT = {
  'Pending':'d-pending','Dispatched':'d-disp','In Transit':'d-transit','Delivered':'d-deliv','Invoiced':'d-inv','Paid':'d-paid',
  'Available':'d-avail','On Load':'d-load','In Shop':'d-shop','Out of Service':'d-oos',
  'Active':'d-active','On Leave':'d-leave','Terminated':'d-term',
};
function Status({ s }) {
  return <span className="stat-mark"><span className={`d ${STATUS_DOT[s]||''}`}/>{s}</span>;
}

function Header({ tab, setTab, wedges }) {
  const items = [
    { id:'dispatch',  label:'Dispatch' },
    { id:'match',     label:'Match',      badge: wedges.match      ? { text:'AI',   cls:'ok'   } : null, hidden: !wedges.match },
    { id:'compliance',label:'Compliance', badge: wedges.compliance ? { text:'2',    cls:''     } : null, hidden: !wedges.compliance },
    { id:'pay',       label:'Pay',        badge: wedges.pay        ? { text:'$2k',  cls:'warn' } : null, hidden: !wedges.pay },
    { id:'roster',    label:'Roster' },
    { id:'capture',   label:'Capture' },
  ];
  return (
    <header className="bar">
      <div className="brand">
        <span className="word">FleetFlow</span>
        <span className="div"/>
        <span className="scope">NorthShore Trucking · 22 trucks</span>
      </div>
      <nav className="tabs">
        {items.filter(i => !i.hidden).map(i => (
          <button key={i.id} aria-current={tab===i.id?'page':undefined} onClick={()=>setTab(i.id)}>
            {i.label}
            {i.badge && <span className={`badge ${i.badge.cls||''}`}>{i.badge.text}</span>}
          </button>
        ))}
      </nav>
      <div className="session">
        <span className="mono">Thu · May 14 · 14:08 CT</span>
        <span className="who"><span className="dot">DR</span></span>
      </div>
    </header>
  );
}

function PageHead({ index, title, titleEm, sub, actions }) {
  return (
    <div className="page-head">
      <div className="meta">
        <div className="index">{index}</div>
        <h1>{title}{titleEm && <em> {titleEm}</em>}</h1>
        <div className="sub">{sub}</div>
      </div>
      <div className="actions">{actions}</div>
    </div>
  );
}

function ExpiryCell({ dateStr }) {
  const today = new Date('2026-05-14');
  const d = new Date(dateStr);
  const days = Math.round((d - today) / (1000*60*60*24));
  const fmt = `${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getDate()).padStart(2,'0')}/${d.getFullYear()}`;
  let cls = '';
  if (days <= 0) cls = 'bad';
  else if (days <= 30) cls = 'warn';
  return (
    <span className={`expiry ${cls}`}>
      <span className="mono">{fmt}</span>
      {cls && <I.Alert size={12} sw={2}/>}
    </span>
  );
}

function Stats({ items }) {
  return (
    <div className="overview">
      {items.map((s,i)=>(
        <div className="stat" key={i}>
          <div className="lbl">{s.lbl}</div>
          <div className="val">{s.val}</div>
          <div className={`sub ${s.cls||''}`}>{s.sub}</div>
        </div>
      ))}
    </div>
  );
}

function Toast({ msg, onDone }) {
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(onDone, 2400);
    return () => clearTimeout(t);
  }, [msg]);
  return (
    <div className={`toast ${msg ? 'show' : ''}`} role="status">
      <I.Check size={14} sw={2.4}/>
      <span>{msg}</span>
    </div>
  );
}

// ---------- Load detail drawer with Same-day Pay ----------
function LoadDrawer({ load, onClose, wedges, onPay }) {
  const open = !!load;
  if (!load) return (
    <>
      <div className={`scrim ${open?'open':''}`} onClick={onClose}/>
      <aside className={`drawer ${open?'open':''}`}/>
    </>
  );

  const rpm = (load.rate / load.miles).toFixed(2);
  const eligibleForPay = wedges.pay && load.pod && load.bol && load.rateCon && !['Paid'].includes(load.status);
  const fee = load.rate * 0.01;
  const net = load.rate - fee;

  return (
    <>
      <div className={`scrim ${open?'open':''}`} onClick={onClose}/>
      <aside className={`drawer ${open?'open':''}`}>
        <div className="drawer-pad">
          <button className="close" onClick={onClose}><I.X size={16} sw={1.6}/></button>
          <div className="eyebrow">Load {load.id} · <Status s={load.status}/></div>
          <h2 style={{marginTop:8}}>{load.origin.split(',')[0]}<br/><em>to {load.dest.split(',')[0]}.</em></h2>
          <div className="lead">{load.customer} · {load.miles.toLocaleString()} miles, ${rpm}/mi</div>

          {/* Same-day pay card */}
          {eligibleForPay && (
            <div className="paycard">
              <div className="pay-head">
                <div className="ttl">Pay <em>now,</em> not in 30 days.</div>
                <div className="amt">${net.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}</div>
              </div>
              <div className="pay-rail">
                <span className="pill">RTP</span>
                <span>Funds land in <strong style={{color:'var(--ink)'}}>~90 seconds</strong></span>
                <span className="eta">No factoring fee</span>
              </div>
              <div className="pay-cta">
                <button className="btn btn-moss" onClick={() => onPay(load)}>
                  <I.Bolt size={14} sw={1.8}/>Pay carrier now
                </button>
                <button className="btn btn-ghost">Invoice broker · NET-30</button>
              </div>
              <div className="muted" style={{marginTop:10}}>
                ${fee.toFixed(2)} platform fee · vs ~${(load.rate * 0.03).toFixed(0)} typical Quick Pay
              </div>
            </div>
          )}

          <section>
            <h3>Route</h3>
            <div className="leg">
              <div className="gut">
                <div className="dotL" style={{background:'var(--moss)'}}/>
                <div className="line"/>
              </div>
              <div>
                <div className="city">{load.origin}</div>
                <div className="when">Pickup · <span className="mono">{load.pickup}</span> · {load.dock} dock-in</div>
              </div>
              <div className="miles">{load.miles.toLocaleString()} mi</div>
            </div>
            <div className="leg">
              <div className="gut">
                <div className="dotL" style={{background:'var(--klint)'}}/>
              </div>
              <div>
                <div className="city">{load.dest}</div>
                <div className="when">Deliver · <span className="mono">{load.deliver}</span> · {load.deliverDock} window</div>
              </div>
              <div className="miles">{(load.miles/55).toFixed(1)} hrs</div>
            </div>
          </section>

          <section>
            <h3>Assignment</h3>
            <div className="kv">
              <div className="k">Driver</div><div className="v">{load.driver}</div>
              <div className="k">Truck</div><div className="v mono">{load.truck}</div>
              <div className="k">Rate</div><div className="v mono">${load.rate.toLocaleString()}</div>
              <div className="k">Rate / mile</div><div className="v mono">${rpm}</div>
            </div>
          </section>

          <section>
            <h3>Documents</h3>
            <div style={{display:'flex', flexDirection:'column'}}>
              <div className="doc-row">
                <span>Rate confirmation</span>
                <span className={`right ${load.rateCon?'ok':'pend'}`}>{load.rateCon?'received':'pending'}</span>
              </div>
              <div className="doc-row">
                <span>Bill of Lading</span>
                <span className={`right ${load.bol?'ok':'pend'}`}>{load.bol?'attached':'awaiting driver'}</span>
              </div>
              <div className="doc-row">
                <span>Proof of Delivery</span>
                <span className={`right ${load.pod?'ok':'pend'}`}>{load.pod?'attached':'pending'}</span>
              </div>
              <div className="doc-row">
                <span>Invoice</span>
                <span className={`right ${load.invoiced?'ok':'due'}`}>{load.invoiced?'sent':'auto-draft ready'}</span>
              </div>
            </div>
          </section>

          <div className="cta">
            <button className="btn btn-primary"><I.Phone size={14}/>Call driver</button>
            <button className="btn btn-ghost">Edit load</button>
          </div>
        </div>
      </aside>
    </>
  );
}

Object.assign(window, { Status, Header, PageHead, ExpiryCell, Stats, Toast, LoadDrawer });
