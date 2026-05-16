// Seed data — short and operator-flavored
const LOADS = [
  { id:'L-1042', customer:'Midwest Foods Co.',     origin:'Joliet, IL',        dest:'Cleveland, OH',     pickup:'05/12', deliver:'05/14', miles:340, rate:2450, status:'In Transit', driver:'A. Rivera',  truck:'#T-1042', bol:true,  pod:true,  rateCon:true,  invoiced:false, dock:'08:30', deliverDock:'14:00' },
  { id:'L-1043', customer:'Heartland Steel',       origin:'Indianapolis, IN',  dest:'Kansas City, MO',   pickup:'05/11', deliver:'05/13', miles:484, rate:1875, status:'Delivered',  driver:'M. Coombs',  truck:'#T-1038', bol:true,  pod:true,  rateCon:true,  invoiced:false, dock:'06:00', deliverDock:'18:00' },
  { id:'L-1044', customer:'PrairieGrain LLC',      origin:'Des Moines, IA',    dest:'St. Louis, MO',     pickup:'05/14', deliver:'05/15', miles:344, rate:1620, status:'Dispatched', driver:'C. Brooks',  truck:'#T-1051', bol:false, pod:false, rateCon:true,  invoiced:false, dock:'07:30', deliverDock:'15:00' },
  { id:'L-1045', customer:'NorCo Auto Parts',      origin:'Detroit, MI',       dest:'Nashville, TN',     pickup:'05/15', deliver:'05/16', miles:533, rate:2280, status:'Pending',    driver:'—',          truck:'—',       bol:false, pod:false, rateCon:true,  invoiced:false, dock:'09:00', deliverDock:'17:00' },
  { id:'L-1046', customer:'Acme Distribution',     origin:'Milwaukee, WI',     dest:'Minneapolis, MN',   pickup:'05/12', deliver:'05/13', miles:336, rate:1490, status:'Delivered',  driver:'J. Patel',   truck:'#T-1029', bol:true,  pod:true,  rateCon:true,  invoiced:true,  dock:'05:30', deliverDock:'12:00' },
  { id:'L-1047', customer:'Riverside Lumber',      origin:'Green Bay, WI',     dest:'Chicago, IL',       pickup:'05/13', deliver:'05/14', miles:209, rate:1140, status:'Invoiced',   driver:'K. Nguyen',  truck:'#T-1044', bol:true,  pod:true,  rateCon:true,  invoiced:true,  dock:'10:00', deliverDock:'19:00' },
  { id:'L-1048', customer:'Great Plains Beverages',origin:'Omaha, NE',         dest:'Denver, CO',        pickup:'05/14', deliver:'05/15', miles:540, rate:2150, status:'In Transit', driver:'R. Walker',  truck:'#T-1033', bol:true,  pod:false, rateCon:true,  invoiced:false, dock:'04:00', deliverDock:'20:00' },
  { id:'L-1049', customer:'Lakeshore Logistics',   origin:'Toledo, OH',        dest:'Buffalo, NY',       pickup:'05/10', deliver:'05/12', miles:280, rate:1380, status:'Paid',       driver:'D. Chen',    truck:'#T-1019', bol:true,  pod:true,  rateCon:true,  invoiced:true,  dock:'08:00', deliverDock:'13:30' },
];

const DRIVERS = [
  { name:'A. Rivera',  cdl:'CDL-849221', phone:'(312) 555-0148', expiry:'2026/08/14', medical:'2026/05/02', status:'Active',   truck:'#T-1042' },
  { name:'M. Coombs',  cdl:'CDL-721104', phone:'(815) 555-0210', expiry:'2026/05/30', medical:'2026/06/19', status:'Active',   truck:'#T-1038' },
  { name:'C. Brooks',  cdl:'CDL-665382', phone:'(708) 555-0421', expiry:'2026/07/30', medical:'2026/11/04', status:'Active',   truck:'#T-1051' },
  { name:'J. Patel',   cdl:'CDL-552019', phone:'(414) 555-0177', expiry:'2024/01/12', medical:'2024/03/22', status:'On Leave', truck:'—' },
  { name:'K. Nguyen',  cdl:'CDL-980442', phone:'(773) 555-0612', expiry:'2026/09/18', medical:'2026/08/03', status:'Active',   truck:'#T-1044' },
  { name:'R. Walker',  cdl:'CDL-340187', phone:'(402) 555-0398', expiry:'2026/06/04', medical:'2025/12/29', status:'Active',   truck:'#T-1033' },
  { name:'D. Chen',    cdl:'CDL-118023', phone:'(716) 555-0844', expiry:'2026/06/22', medical:'2026/02/16', status:'Active',   truck:'#T-1019' },
];

const TRUCKS = [
  { unit:'#T-1042', vin:'1FUJA6CK57L', make:'Freightliner Cascadia', year:2022, miles:284120, lastService:'2026/02/18', status:'On Load',        driver:'A. Rivera' },
  { unit:'#T-1038', vin:'1FUJA6CK22L', make:'Freightliner Cascadia', year:2021, miles:341802, lastService:'2026/01/30', status:'Available',      driver:'M. Coombs' },
  { unit:'#T-1051', vin:'1FUJA6CK91L', make:'Freightliner Cascadia', year:2023, miles:118445, lastService:'2026/03/01', status:'On Load',        driver:'C. Brooks' },
  { unit:'#T-1029', vin:'1FUJA6CK04L', make:'Kenworth T680',         year:2020, miles:412006, lastService:'2026/03/04', status:'In Shop',        driver:'—' },
  { unit:'#T-1044', vin:'1FUJA6CK63L', make:'Freightliner Cascadia', year:2022, miles:201338, lastService:'2025/12/22', status:'On Load',        driver:'K. Nguyen' },
  { unit:'#T-1033', vin:'1FUJA6CK19L', make:'Peterbilt 579',         year:2021, miles:298502, lastService:'2026/02/05', status:'On Load',        driver:'R. Walker' },
  { unit:'#T-1019', vin:'1FUJA6CK85L', make:'Freightliner Cascadia', year:2019, miles:498117, lastService:'2025/11/14', status:'Out of Service', driver:'—' },
];

// AI Match — candidate loads from DAT/Truckstop board for empty trucks
const MATCHES = [
  {
    truck:'#T-1038', driver:'M. Coombs', from:'Kansas City, MO', hosLeft:8.5,
    candidates:[
      { id:'DAT-883201', broker:'Coyote Logistics', origin:'Kansas City, MO', dest:'Chicago, IL',     miles:512, rate:1980, rpm:3.87, deadhead:12, fit:96, posted:'12 min ago', reason:'On the way home · 12mi deadhead · driver has run Coyote 9× clean' },
      { id:'DAT-883415', broker:'CH Robinson',      origin:'Lawrence, KS',    dest:'Indianapolis, IN', miles:594, rate:2140, rpm:3.60, deadhead:42, fit:88, posted:'34 min ago', reason:'Strong lane, longer deadhead, broker pays NET-15' },
      { id:'DAT-883102', broker:'Echo Global',      origin:'Topeka, KS',      dest:'Memphis, TN',      miles:476, rate:1620, rpm:3.40, deadhead:68, fit:71, posted:'1 hr ago',  reason:'Heavier deadhead, lower margin, lane back home is thin' },
    ],
  },
];

// Compliance — items the copilot watches
const COMPLIANCE = [
  { kind:'Driver',    subject:'J. Patel',  detail:'CDL expired 01/12/2024 · 487 days overdue',  severity:'critical', due:-487, action:'Move to On Leave · reassign L-1045' },
  { kind:'Driver',    subject:'M. Coombs', detail:'CDL expires 05/30/2026 · 16 days',           severity:'warn',     due:16,   action:'Schedule DMV renewal · text driver' },
  { kind:'Truck',     subject:'#T-1019',   detail:'DOT annual inspection due 06/14/2026',       severity:'warn',     due:31,   action:'Book inspection · already in shop' },
  { kind:'IFTA',      subject:'Q2 2026',   detail:'Filing window opens 07/01 · 11k mi logged',  severity:'info',     due:48,   action:'Pre-populate jurisdictional miles' },
  { kind:'Clearing-', subject:'Pre-trip',  detail:'New hire query for C. Brooks · 24h window',  severity:'warn',     due:1,    action:'Send query · sign with consent' },
  { kind:'Driver',    subject:'D. Chen',   detail:'Medical cert expires 02/16/2027',            severity:'ok',       due:278,  action:'No action — within window' },
];

// Pay — same-day settlement candidates and history
const PAYOUTS = [
  { id:'PAY-2614', loadId:'L-1046', driver:'J. Patel',    carrier:'NorthShore Trucking LLC', amount:1490, fee:14.90, net:1475.10, rail:'RTP', eta:'today · 16:00 ET', when:'pending',  podAt:'05/13 12:18', riskFlag:null },
  { id:'PAY-2613', loadId:'L-1042', driver:'A. Rivera',   carrier:'NorthShore Trucking LLC', amount:2450, fee:24.50, net:2425.50, rail:'RTP', eta:'today · 16:00 ET', when:'pending',  podAt:'05/13 14:24', riskFlag:'Broker rate-con mismatch · $50' },
  { id:'PAY-2612', loadId:'L-1049', driver:'D. Chen',     carrier:'NorthShore Trucking LLC', amount:1380, fee:13.80, net:1366.20, rail:'RTP', eta:'paid 05/12 09:14', when:'paid',     podAt:'05/12 08:30', riskFlag:null },
  { id:'PAY-2611', loadId:'L-1047', driver:'K. Nguyen',   carrier:'NorthShore Trucking LLC', amount:1140, fee:11.40, net:1128.60, rail:'ACH', eta:'paid 05/13 11:02', when:'paid',     podAt:'05/13 09:55', riskFlag:null },
  { id:'PAY-2610', loadId:'L-1043', driver:'M. Coombs',   carrier:'NorthShore Trucking LLC', amount:1875, fee:18.75, net:1856.25, rail:'RTP', eta:'paid 05/11 17:48', when:'paid',     podAt:'05/11 17:30', riskFlag:null },
];

const STATUS_TO_CLASS = {
  'Pending':'p-pending','Dispatched':'p-disp','In Transit':'p-transit','Delivered':'p-deliv','Invoiced':'p-inv','Paid':'p-paid',
  'Available':'p-avail','On Load':'p-load','In Shop':'p-shop','Out of Service':'p-oos',
  'Active':'p-active','On Leave':'p-leave','Terminated':'p-term',
};

Object.assign(window, { LOADS, DRIVERS, TRUCKS, MATCHES, COMPLIANCE, PAYOUTS, STATUS_TO_CLASS });
