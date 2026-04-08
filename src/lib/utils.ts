export function fmt(n: number): string {
  if (n >= 1000000) return '$' + (n / 1000000).toFixed(1) + 'M'
  if (n >= 1000) return '$' + (n / 1000).toFixed(0) + 'K'
  return '$' + Math.round(n)
}

export function fmtN(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(0) + 'K'
  return Math.round(n).toString()
}

export function pct(a: number, b: number): number {
  return b > 0 ? ((a - b) / b) * 100 : 0
}

export function pctFmt(v: number): string {
  return (v >= 0 ? '+' : '') + v.toFixed(1) + '%'
}

export function todayStamp(): string {
  const d = new Date()
  return (
    d.getFullYear() +
    '-' +
    String(d.getMonth() + 1).padStart(2, '0') +
    '-' +
    String(d.getDate()).padStart(2, '0')
  )
}

export const CHANNELS_DEF = [
  { key: 'coles', label: 'Coles', color: '#C0392B' },
  { key: 'direct', label: 'Direct', color: '#F5E6D0' },
  { key: 'nandos', label: "Nando's", color: '#8E44AD' },
  { key: 'distrbn', label: "Dist'n", color: '#E67E22' },
  { key: 'metcash', label: 'Metcash', color: '#2980B9' },
  { key: 'other', label: 'Other', color: '#555' },
]

export const MONTHS_ALL = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar']
export const SKUS_ALL = ['OG Large', 'ES Large', 'Chilli Egg Mayo', 'Hot Honey', 'PERi Crackle 1KG']

// Static marketing daily data (not stored in Supabase — kept as constants)
export const MKT_DAILY = {
  jan: [1300,1362,1194,1235,1089,1803,1479,1184,1548,1454,1344,1636,1247,1625,1172,810,1956,1251,1252,1258,1429,959,859,1317,1455,1200,1119,811,2056,1479,927],
  feb: [1047,1717,810,1802,1757,2293,1892,1033,1429,1576,2452,1764,1314,1748,1239,837,1521,1409,1660,1272,748,1094,915,1261,1806,1433,1285,921],
  mar: [766,1063,1040,964,1623,756,1633,934,1084,1253,925,754,2203,2023,1060,1406,1459,2167,1542,1109,1657,1689,1063,1993,1837,1257,1863,1061,1742,2404,963],
  apr: [1138,1281,2295,1358],
}
export const MKT_DAILY_META = {
  jan: [343,350,343,423,398,386,357,357,391,342,397,375,384,393,386,373,350,419,394,347,274,278,276,278,339,296,298,264,269,259,311],
  feb: [369,303,282,273,268,259,244,296,282,280,263,256,271,240,282,256,282,282,232,222,264,276,268,237,237,265,237,248],
  mar: [284,274,271,274,273,271,239,288,294,293,281,293,291,252,306,312,363,362,335,350,314,373,191,174,354,188,174,154,171,365,196],
  apr: [177,191,302,130],
}
export const MKT_DAILY_GOOGLE = {
  jan: [182,210,150,170,158,108,169,171,218,188,268,233,203,194,231,203,193,219,256,181,111,103,95,89,113,114,90,106,91,95,51],
  feb: [83,79,184,203,213,184,187,196,162,158,152,172,176,195,196,173,286,217,186,140,110,264,193,228,248,245,133,109],
  mar: [178,132,107,110,138,127,134,170,137,118,91,106,71,128,156,119,159,379,277,440,414,309,352,380,338,359,668,330,220,271,247],
  apr: [105,112,83,103],
}

export const SOCIAL_DATA = {
  feb: {
    month: 'Feb 2026', asOf: '16 Mar 2026',
    posts: [
      {id:'UMPI-01',pillar:'Candid Q&A',status:'POSTED',scheduled:'5 Feb',idea:'Rejected in stores',views:12013,likes:272,skipRate:42.9,saves:101,shares:96,comments:21},
      {id:'UMPI-02',pillar:'Candid Q&A',status:'POSTED',scheduled:'11 Feb',idea:'Name origin',views:22262,likes:410,skipRate:31.9,saves:43,shares:55,comments:8},
      {id:'UMPI-03',pillar:'Founder-Led',status:'POSTED',scheduled:'18 Feb',idea:'The turning point',views:14825,likes:400,skipRate:null,saves:40,shares:64,comments:37},
      {id:'UMPI-04',pillar:'Founder-Led',status:'POSTED',scheduled:'26 Feb',idea:'Best startup advice',views:33878,likes:1072,skipRate:39.5,saves:895,shares:612,comments:30},
    ]
  },
  mar: {
    month: 'Mar 2026', asOf: null,
    posts: [
      {id:'UMPI-01',pillar:'Founder-Led',status:'POSTED',scheduled:'6 Mar',idea:'Still learning as a CEO'},
      {id:'UMPI-02',pillar:'Founder-Led',status:'POSTED',scheduled:'11 Mar',idea:'Imposter syndrome'},
      {id:'UMPI-03',pillar:'Memes',status:'POSTED',scheduled:'23 Mar',idea:'Channing Tatum Oscars meme'},
      {id:'UMPI-04',pillar:'Candid Q&A',status:'IDEATED',scheduled:'31 Mar',idea:'Gordon Ramsay retake'},
      {id:'UMPI-05',pillar:'Candid Q&A',status:'POSTED',scheduled:'26 Mar',idea:'Canola oil (Coles)'},
      {id:'UMPI-06',pillar:'Candid Q&A',status:'POSTED',scheduled:'17 Mar',idea:'MSG in Coles'},
      {id:'UMPI-07',pillar:'Education',status:'POSTED',scheduled:'13 Mar',idea:'Paul Saladino duet'},
      {id:'UMPI-08',pillar:'Candid Q&A',status:'IDEATED',scheduled:'2 Apr',idea:'Reality TV experience'},
    ]
  },
  apr: {
    month: 'Apr 2026 (MTD)', asOf: null,
    posts: [
      {id:'UMPI-01',pillar:'Community',status:'SHOT',scheduled:null,idea:'UmamiPapi Customer Story #1'},
      {id:'UMPI-02',pillar:'Community',status:'IDEATED',scheduled:null,idea:'UmamiPapi Customer Story #2'},
      {id:'UMPI-03',pillar:'Memes',status:'POSTED',scheduled:'3 Apr',idea:'AI is taking over your job meme'},
      {id:'UMPI-04',pillar:'Promo/Collabs',status:'POSTED',scheduled:'1 Apr',idea:'UmamiPapi X Remedy April Fools'},
      {id:'UMPI-05',pillar:'Promo/Collabs',status:'IDEATED',scheduled:null,idea:'UmamiPapi X Chadstone Collab Announcement'},
      {id:'UMPI-06',pillar:'Promo/Collabs',status:'IDEATED',scheduled:null,idea:'UmamiPapi X Chadstone Collab'},
      {id:'UMPI-07',pillar:'Candid / Q&A',status:'SHOT',scheduled:null,idea:'Quick Questions'},
      {id:'UMPI-08',pillar:'Candid / Q&A',status:'SHOT',scheduled:null,idea:'Ninja Q&A'},
    ]
  }
}

export const PROD_PROD = [
  {p:'OG Large',Jul:15163,Aug:13281,Sep:11732,Oct:12372,Nov:12773,Dec:15441,Jan:11679,Feb:12990,Mar:15336,ytd:120767},
  {p:'ES Large',Jul:4872,Aug:5791,Sep:5241,Oct:5438,Nov:7286,Dec:5673,Jan:4332,Feb:7438,Mar:4153,ytd:50224},
  {p:'Chilli Egg Mayo',Jul:3116,Aug:3202,Sep:6333,Oct:2032,Nov:2581,Dec:5085,Jan:2440,Feb:3341,Mar:4983,ytd:33113},
  {p:'Hot Honey',Jul:0,Aug:0,Sep:0,Oct:640,Nov:9210,Dec:2497,Jan:1309,Feb:2270,Mar:2356,ytd:18282},
  {p:'PERi Crackle 1KG',Jul:1230,Aug:900,Sep:930,Oct:1248,Nov:612,Dec:1320,Jan:2940,Feb:1812,Mar:1530,ytd:12522},
]

export const MARK_KPIS = [
  {wk:'Week 1',cal:'Y',mon:'Y',fri:'Y'},{wk:'Week 2',cal:'Y',mon:'Y',fri:'Y'},
  {wk:'Week 3',cal:'Y',mon:'Y',fri:'Y'},{wk:'Week 4',cal:'Y',mon:'N',fri:'N'},
  {wk:'Week 5',cal:'Y',mon:'Y',fri:'Y'},{wk:'Week 6',cal:'Y',mon:'Y',fri:'N'},
  {wk:'Week 7',cal:'N',mon:'Y',fri:'Y'},{wk:'Week 8',cal:'Y',mon:'Y',fri:'Y'},
  {wk:'Week 9',cal:'Y',mon:'Y',fri:'Y'},
]

export const PERF_LOG = [
  {d:'Feb 2026',i:'Soy reform trial — successfully ran through labeller and filler on first attempt.',e:'Mark'},
  {d:'Feb 2026',i:'Proactively organised warehouse racking reallocation ahead of large Coles delivery.',e:'Mark'},
  {d:'Jan 2026',i:'Changed ES formula to Carolina Reaper — ~$4,000/year saving identified and implemented.',e:'Mark'},
  {d:'Jan 2026',i:'Resolved ABBE overpayment discrepancy — tracked, confirmed, and escalated correctly.',e:'Mark'},
  {d:'Jan 2026',i:'Implemented daily production scheduling whiteboard system independently.',e:'Mark'},
  {d:'Dec 2025',i:'Executed largest single-week dispatch in FY26 — no errors or delays.',e:'Mark'},
  {d:'Nov 2025',i:'Gift pack launch executed on time — all materials confirmed and assembled without prompting.',e:'Mark'},
]

export const DATA_UPDATED = {
  masterPapi: '4 Apr 2026',
  ecom: '4 Apr 2026',
  seo: '6 Apr 2026',
  financial: 'Mar 2026',
  social: 'Apr 2026',
  margin: '25 Mar 2026',
}
