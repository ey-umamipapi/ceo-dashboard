'use client'

import { DashboardData } from '@/types'
import { MARK_KPIS, PERF_LOG } from '@/lib/utils'

const FY26_MONTHS = ['Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar','Apr','May','Jun']

// Factory staff hours per month — sourced from Employee Schedule FY26_LIVE.xlsx (weekday + Saturday)
const FACTORY_SCHEDULE: { name: string; hrs: Record<string, number>; total: number }[] = [
  { name: 'Kritsana',     total: 1162.0, hrs: { Jul:44.8, Aug:124.5, Sep:109.5, Oct:125.2, Nov:105.0, Dec:169.7, Jan:90.2, Feb:142.8, Mar:74.8, Apr:138.0, May:37.5 } },
  { name: 'Wilson',       total: 1470.5, hrs: { Jul:66.5, Aug:192.8, Sep:131.0, Oct:127.8, Nov:142.0, Dec:177.7, Jan:90.0, Feb:143.2, Mar:226.2, Apr:137.5, May:35.8 } },
  { name: 'Eduard',       total: 1406.0, hrs: { Jul:29.0, Aug:216.8, Sep:139.2, Oct:100.2, Nov:139.0, Dec:175.5, Jan:80.2, Feb:141.2, Mar:220.2, Apr:134.7, May:30.0 } },
  { name: 'Sorrapong',    total:  866.0, hrs: { Jul:74.8, Aug:212.0, Sep:140.0, Oct:134.5, Nov:150.2, Dec:154.5 } },
  { name: 'Jonathan',     total:  691.2, hrs: { Dec:138.5, Jan:76.0, Feb:135.2, Mar:228.2, Apr:75.5, May:37.8 } },
  { name: 'Lal Ma Ngaih', total:  300.7, hrs: { Aug:175.5, Sep:125.2 } },
  { name: 'Thanaphon',    total:  376.7, hrs: { Aug:153.5, Sep:140.0, Oct:83.2 } },
  { name: 'Patrick',      total:  461.4, hrs: { Dec:87.2, Jan:90.2, Feb:142.8, Mar:141.2 } },
  { name: 'Ciro',         total:  350.2, hrs: { Mar:166.2, Apr:146.2, May:37.8 } },
  { name: 'Leangheng',    total:  484.8, hrs: { Jul:38.0, Aug:128.0, Sep:81.8, Oct:43.5, Nov:68.5, Dec:110.7, Jan:14.3 } },
  { name: 'Jackson',      total:  119.0, hrs: { Dec:53.0, Jan:35.2, Feb:30.8 } },
  { name: 'Diego',        total:  112.5, hrs: { Apr:97.5, May:15.0 } },
]

const FACTORY_ROLES: { name: string; role: string; rate: number; wkndRate: number }[] = [
  { name: 'Kritsana',      role: 'Senior Crew',      rate: 37.00, wkndRate: 55.50 },
  { name: 'Wilson',        role: 'Senior Crew',      rate: 37.00, wkndRate: 55.50 },
  { name: 'Leangheng',     role: 'Senior Crew',      rate: 37.00, wkndRate: 55.50 },
  { name: 'Sorrapong',     role: 'Production Lead',  rate: 33.00, wkndRate: 49.50 },
  { name: 'Eduard',        role: 'Junior Crew',      rate: 32.00, wkndRate: 48.00 },
  { name: 'Lal Ma Ngaih',  role: 'Junior Crew',      rate: 32.00, wkndRate: 48.00 },
  { name: 'Thanaphon',     role: 'Junior Crew',      rate: 32.00, wkndRate: 48.00 },
  { name: 'Jonathan',      role: 'Junior Crew',      rate: 32.00, wkndRate: 48.00 },
  { name: 'Patrick',       role: 'Junior Crew',      rate: 32.00, wkndRate: 48.00 },
  { name: 'Ciro',          role: 'Junior Crew',      rate: 32.00, wkndRate: 48.00 },
  { name: 'Diego',         role: 'Junior Crew',      rate: 32.00, wkndRate: 48.00 },
  { name: 'Jackson',       role: 'Junior Crew',      rate: 32.00, wkndRate: 48.00 },
]

// All 26 fortnightly pay runs — sourced from Employee Schedule FY26_LIVE.xlsx → Payrun Summary (Weekdays, Sat, Sun)
// wages=ordinary, ot=overtime $, allow=allowances $, super=superannuation $, total=grand total
const PAY_RUNS: { pr: number; start: string; end: string; payDate: string; wages: number; ot: number; allow: number; super_: number; total: number }[] = [
  { pr:  1, start:'7 Jul', end:'20 Jul', payDate:'23 Jul 2025',  wages:  9794.50, ot:    0.00, allow:    0.00, super_:  1175.34, total: 10969.84 },
  { pr:  2, start:'21 Jul',end:'3 Aug',  payDate:'6 Aug 2025',   wages: 12445.75, ot:    0.00, allow:    0.00, super_:  1493.49, total: 13939.24 },
  { pr:  3, start:'4 Aug', end:'17 Aug', payDate:'20 Aug 2025',  wages: 14595.00, ot:    0.00, allow:    0.00, super_:  1751.40, total: 16346.40 },
  { pr:  4, start:'18 Aug',end:'31 Aug', payDate:'3 Sep 2025',   wages: 14989.50, ot:   51.00, allow:    0.00, super_:  1804.86, total: 16845.36 },
  { pr:  5, start:'1 Sep', end:'14 Sep', payDate:'17 Sep 2025',  wages: 15618.50, ot:    0.00, allow:    0.00, super_:  1874.22, total: 17492.72 },
  { pr:  6, start:'15 Sep',end:'28 Sep', payDate:'1 Oct 2025',   wages: 14148.75, ot:    0.00, allow:    0.00, super_:  1697.85, total: 15846.60 },
  { pr:  7, start:'29 Sep',end:'12 Oct', payDate:'15 Oct 2025',  wages: 11000.25, ot:    0.00, allow:    0.00, super_:  1320.03, total: 12320.28 },
  { pr:  8, start:'13 Oct',end:'26 Oct', payDate:'29 Oct 2025',  wages: 10549.75, ot:    0.00, allow:    0.00, super_:  1265.97, total: 11815.72 },
  { pr:  9, start:'27 Oct',end:'9 Nov',  payDate:'12 Nov 2025',  wages:  8624.75, ot:    0.00, allow:    0.00, super_:  1034.97, total:  9659.72 },
  { pr: 10, start:'10 Nov',end:'23 Nov', payDate:'26 Nov 2025',  wages: 13742.63, ot:  211.50, allow: 1532.25, super_:  1674.50, total: 17160.87 },
  { pr: 11, start:'24 Nov',end:'7 Dec',  payDate:'10 Dec 2025',  wages: 17463.50, ot:   40.88, allow:    0.00, super_:  2100.53, total: 19604.90 },
  { pr: 12, start:'8 Dec', end:'21 Dec', payDate:'24 Dec 2025',  wages: 21362.75, ot:    0.00, allow:  100.50, super_:  2563.53, total: 24026.78 },
  { pr: 13, start:'22 Dec',end:'4 Jan',  payDate:'7 Jan 2026',   wages:  2493.75, ot:    0.00, allow:    0.00, super_:   299.25, total:  2793.00 },
  { pr: 14, start:'5 Jan', end:'18 Jan', payDate:'21 Jan 2026',  wages: 13860.50, ot:    0.00, allow:    0.00, super_:  1663.26, total: 15523.76 },
  { pr: 15, start:'19 Jan',end:'1 Feb',  payDate:'4 Feb 2026',   wages: 12244.00, ot:    0.00, allow:    0.00, super_:  1469.28, total: 13713.28 },
  { pr: 16, start:'2 Feb', end:'15 Feb', payDate:'18 Feb 2026',  wages: 13022.50, ot:   40.13, allow:    0.00, super_:  1567.52, total: 14630.14 },
  { pr: 17, start:'16 Feb',end:'1 Mar',  payDate:'4 Mar 2026',   wages: 12822.50, ot:    0.00, allow:    0.00, super_:  1538.70, total: 14361.20 },
  { pr: 18, start:'2 Mar', end:'15 Mar', payDate:'18 Mar 2026',  wages: 10771.75, ot:    0.00, allow:   41.63, super_:  1292.61, total: 12105.99 },
  { pr: 19, start:'16 Mar',end:'29 Mar', payDate:'1 Apr 2026',   wages: 13094.63, ot:    0.00, allow:   69.00, super_:  1571.36, total: 14734.98 },
  { pr: 20, start:'30 Mar',end:'12 Apr', payDate:'15 Apr 2026',  wages: 11459.13, ot:  109.88, allow:    0.00, super_:  1388.28, total: 12957.28 },
  { pr: 21, start:'13 Apr',end:'26 Apr', payDate:'29 Apr 2026',  wages: 15294.25, ot:   40.50, allow:    0.00, super_:  1840.17, total: 17174.92 },
  { pr: 22, start:'27 Apr',end:'10 May', payDate:'13 May 2026',  wages: 10217.00, ot:    0.00, allow:    0.00, super_:  1226.04, total: 11443.04 },
  { pr: 23, start:'11 May',end:'24 May', payDate:'27 May 2026',  wages:  2752.50, ot:    0.00, allow:    0.00, super_:   330.30, total:  3082.80 },
  { pr: 24, start:'25 May',end:'7 Jun',  payDate:'10 Jun 2026',  wages:     0.00, ot:    0.00, allow:    0.00, super_:     0.00, total:     0.00 },
  { pr: 25, start:'8 Jun', end:'21 Jun', payDate:'24 Jun 2026',  wages:     0.00, ot:    0.00, allow:    0.00, super_:     0.00, total:     0.00 },
  { pr: 26, start:'22 Jun',end:'5 Jul',  payDate:'8 Jul 2026',   wages:     0.00, ot:    0.00, allow:    0.00, super_:     0.00, total:     0.00 },
]

// Current payrun = PR 22 (today is in 27 Apr – 10 May window)
const CURRENT_PR = 22

// Per-employee payrun data — sourced from Employee Schedule FY26_LIVE.xlsx → Schedule sheet
// wdayWages = ordinary weekday wages; satWages = Saturday wages (at 1.5× rate)
// Earnings rate names should match your Xero pay items exactly
const PR_EMPLOYEE_DATA: Record<number, {emp:string; wdayHrs:number; wdayWages:number; satHrs:number; satWages:number}[]> = {
  1: [{emp:'Kritsana',wdayHrs:44.75,wdayWages:1655.75,satHrs:0,satWages:0},{emp:'Leangheng',wdayHrs:38,wdayWages:1406,satHrs:0,satWages:0},{emp:'Wilson',wdayHrs:66.5,wdayWages:2460.5,satHrs:0,satWages:0},{emp:'Eduard',wdayHrs:29,wdayWages:928,satHrs:0,satWages:0},{emp:'Sorrapong',wdayHrs:74.75,wdayWages:2616.25,satHrs:0,satWages:0}],
  2: [{emp:'Kritsana',wdayHrs:43.75,wdayWages:1618.75,satHrs:0,satWages:0},{emp:'Leangheng',wdayHrs:41.25,wdayWages:1526.25,satHrs:0,satWages:0},{emp:'Wilson',wdayHrs:58.25,wdayWages:2155.25,satHrs:0,satWages:0},{emp:'Eduard',wdayHrs:72.25,wdayWages:2312,satHrs:0,satWages:0},{emp:'Sorrapong',wdayHrs:72.5,wdayWages:2537.5,satHrs:0,satWages:0},{emp:'Lal Ma Ngaih',wdayHrs:36.25,wdayWages:1160,satHrs:0,satWages:0},{emp:'Thanaphon Idei',wdayHrs:14.5,wdayWages:464,satHrs:0,satWages:0}],
  3: [{emp:'Kritsana',wdayHrs:44,wdayWages:1628,satHrs:0,satWages:0},{emp:'Leangheng',wdayHrs:42,wdayWages:1554,satHrs:0,satWages:0},{emp:'Wilson',wdayHrs:67.75,wdayWages:2506.75,satHrs:0,satWages:0},{emp:'Eduard',wdayHrs:71.25,wdayWages:2280,satHrs:0,satWages:0},{emp:'Sorrapong',wdayHrs:64.75,wdayWages:2266.25,satHrs:0,satWages:0},{emp:'Lal Ma Ngaih',wdayHrs:72,wdayWages:2304,satHrs:0,satWages:0},{emp:'Thanaphon Idei',wdayHrs:64.25,wdayWages:2056,satHrs:0,satWages:0}],
  4: [{emp:'Kritsana',wdayHrs:36.75,wdayWages:1359.75,satHrs:0,satWages:0},{emp:'Leangheng',wdayHrs:44.75,wdayWages:1655.75,satHrs:0,satWages:0},{emp:'Wilson',wdayHrs:66.75,wdayWages:2469.75,satHrs:0,satWages:0},{emp:'Eduard',wdayHrs:73.25,wdayWages:2344,satHrs:0,satWages:0},{emp:'Sorrapong',wdayHrs:74.75,wdayWages:2616.25,satHrs:0,satWages:0},{emp:'Lal Ma Ngaih',wdayHrs:67.25,wdayWages:2152,satHrs:0,satWages:0},{emp:'Thanaphon Idei',wdayHrs:74.75,wdayWages:2392,satHrs:0,satWages:0}],
  5: [{emp:'Kritsana',wdayHrs:44.5,wdayWages:1646.5,satHrs:0,satWages:0},{emp:'Leangheng',wdayHrs:45.5,wdayWages:1683.5,satHrs:0,satWages:0},{emp:'Wilson',wdayHrs:73.5,wdayWages:2719.5,satHrs:0,satWages:0},{emp:'Eduard',wdayHrs:74.75,wdayWages:2392,satHrs:0,satWages:0},{emp:'Sorrapong',wdayHrs:75,wdayWages:2625,satHrs:0,satWages:0},{emp:'Lal Ma Ngaih',wdayHrs:67.25,wdayWages:2152,satHrs:0,satWages:0},{emp:'Thanaphon Idei',wdayHrs:75,wdayWages:2400,satHrs:0,satWages:0}],
  6: [{emp:'Kritsana',wdayHrs:65,wdayWages:2405,satHrs:0,satWages:0},{emp:'Leangheng',wdayHrs:36.25,wdayWages:1341.25,satHrs:0,satWages:0},{emp:'Wilson',wdayHrs:57.5,wdayWages:2127.5,satHrs:0,satWages:0},{emp:'Eduard',wdayHrs:64.5,wdayWages:2064,satHrs:0,satWages:0},{emp:'Sorrapong',wdayHrs:65,wdayWages:2275,satHrs:0,satWages:0},{emp:'Lal Ma Ngaih',wdayHrs:58,wdayWages:1856,satHrs:0,satWages:0},{emp:'Thanaphon Idei',wdayHrs:65,wdayWages:2080,satHrs:0,satWages:0}],
  7: [{emp:'Kritsana',wdayHrs:62.75,wdayWages:2321.75,satHrs:0,satWages:0},{emp:'Leangheng',wdayHrs:28.75,wdayWages:1063.75,satHrs:0,satWages:0},{emp:'Wilson',wdayHrs:56.5,wdayWages:2090.5,satHrs:0,satWages:0},{emp:'Eduard',wdayHrs:42,wdayWages:1344,satHrs:0,satWages:0},{emp:'Sorrapong',wdayHrs:62.75,wdayWages:2196.25,satHrs:0,satWages:0},{emp:'Thanaphon Idei',wdayHrs:62,wdayWages:1984,satHrs:0,satWages:0}],
  8: [{emp:'Kritsana',wdayHrs:62.5,wdayWages:2312.5,satHrs:0,satWages:0},{emp:'Leangheng',wdayHrs:14.75,wdayWages:545.75,satHrs:0,satWages:0},{emp:'Wilson',wdayHrs:71.25,wdayWages:2636.25,satHrs:0,satWages:0},{emp:'Eduard',wdayHrs:58.25,wdayWages:1864,satHrs:0,satWages:0},{emp:'Sorrapong',wdayHrs:71.75,wdayWages:2511.25,satHrs:0,satWages:0},{emp:'Thanaphon Idei',wdayHrs:21.25,wdayWages:680,satHrs:0,satWages:0}],
  9: [{emp:'Kritsana',wdayHrs:30,wdayWages:1110,satHrs:0,satWages:0},{emp:'Leangheng',wdayHrs:23,wdayWages:851,satHrs:0,satWages:0},{emp:'Wilson',wdayHrs:61,wdayWages:2257,satHrs:0,satWages:0},{emp:'Eduard',wdayHrs:65.25,wdayWages:2088,satHrs:0,satWages:0},{emp:'Sorrapong',wdayHrs:66.25,wdayWages:2318.75,satHrs:0,satWages:0}],
  10: [{emp:'Kritsana',wdayHrs:67.75,wdayWages:2506.75,satHrs:7.25,satWages:402.38},{emp:'Leangheng',wdayHrs:45.5,wdayWages:1683.5,satHrs:0,satWages:0},{emp:'Wilson',wdayHrs:73.75,wdayWages:2728.75,satHrs:7.25,satWages:402.38},{emp:'Eduard',wdayHrs:66.75,wdayWages:2136,satHrs:7,satWages:336},{emp:'Sorrapong',wdayHrs:76.75,wdayWages:2686.25,satHrs:7.25,satWages:380.62}],
  11: [{emp:'Kritsana',wdayHrs:77.5,wdayWages:2867.5,satHrs:8,satWages:444},{emp:'Leangheng',wdayHrs:46.75,wdayWages:1729.75,satHrs:8,satWages:444},{emp:'Wilson',wdayHrs:77.5,wdayWages:2867.5,satHrs:16,satWages:888},{emp:'Eduard',wdayHrs:77,wdayWages:2464,satHrs:14.5,satWages:696},{emp:'Sorrapong',wdayHrs:62.25,wdayWages:2178.75,satHrs:8,satWages:420},{emp:'Jackson',wdayHrs:11.25,wdayWages:360,satHrs:0,satWages:0},{emp:'Patrick',wdayHrs:7.5,wdayWages:240,satHrs:0,satWages:0},{emp:'Jonathan',wdayHrs:46.25,wdayWages:1480,satHrs:8,satWages:384}],
  12: [{emp:'Kritsana',wdayHrs:76.75,wdayWages:2839.75,satHrs:7.5,satWages:416.25},{emp:'Leangheng',wdayHrs:48.5,wdayWages:1794.5,satHrs:7.5,satWages:416.25},{emp:'Wilson',wdayHrs:76.75,wdayWages:2839.75,satHrs:7.5,satWages:416.25},{emp:'Eduard',wdayHrs:76.5,wdayWages:2448,satHrs:7.5,satWages:360},{emp:'Sorrapong',wdayHrs:76.75,wdayWages:2686.25,satHrs:7.5,satWages:393.75},{emp:'Jackson',wdayHrs:41.75,wdayWages:1336,satHrs:0,satWages:0},{emp:'Patrick',wdayHrs:76.75,wdayWages:2456,satHrs:3,satWages:144},{emp:'Jonathan',wdayHrs:76.75,wdayWages:2456,satHrs:7.5,satWages:360}],
  13: [{emp:'Kritsana',wdayHrs:14.25,wdayWages:527.25,satHrs:0,satWages:0},{emp:'Leangheng',wdayHrs:14.25,wdayWages:527.25,satHrs:0,satWages:0},{emp:'Wilson',wdayHrs:14.25,wdayWages:527.25,satHrs:0,satWages:0},{emp:'Eduard',wdayHrs:14.25,wdayWages:456,satHrs:0,satWages:0},{emp:'Patrick',wdayHrs:14.25,wdayWages:456,satHrs:0,satWages:0}],
  14: [{emp:'Kritsana',wdayHrs:76,wdayWages:2812,satHrs:0,satWages:0},{emp:'Wilson',wdayHrs:75.75,wdayWages:2878.5,satHrs:0,satWages:0},{emp:'Eduard',wdayHrs:66,wdayWages:2178,satHrs:0,satWages:0},{emp:'Jackson',wdayHrs:35.25,wdayWages:1128,satHrs:0,satWages:0},{emp:'Patrick',wdayHrs:76,wdayWages:2432,satHrs:0,satWages:0},{emp:'Jonathan',wdayHrs:76,wdayWages:2432,satHrs:0,satWages:0}],
  15: [{emp:'Kritsana',wdayHrs:67.5,wdayWages:2497.5,satHrs:0,satWages:0},{emp:'Wilson',wdayHrs:68,wdayWages:2584,satHrs:0,satWages:0},{emp:'Eduard',wdayHrs:66.5,wdayWages:2194.5,satHrs:0,satWages:0},{emp:'Jackson',wdayHrs:27.75,wdayWages:888,satHrs:0,satWages:0},{emp:'Patrick',wdayHrs:67.5,wdayWages:2160,satHrs:0,satWages:0},{emp:'Jonathan',wdayHrs:60,wdayWages:1920,satHrs:0,satWages:0}],
  16: [{emp:'Kritsana',wdayHrs:75.25,wdayWages:2784.25,satHrs:0,satWages:0},{emp:'Wilson',wdayHrs:75.25,wdayWages:2859.5,satHrs:0,satWages:0},{emp:'Eduard',wdayHrs:74.75,wdayWages:2466.75,satHrs:0,satWages:0},{emp:'Jackson',wdayHrs:3,wdayWages:96,satHrs:0,satWages:0},{emp:'Patrick',wdayHrs:75.25,wdayWages:2408,satHrs:0,satWages:0},{emp:'Jonathan',wdayHrs:75.25,wdayWages:2408,satHrs:0,satWages:0}],
  17: [{emp:'Kritsana',wdayHrs:74.75,wdayWages:2765.75,satHrs:0,satWages:0},{emp:'Wilson',wdayHrs:73.75,wdayWages:2802.5,satHrs:0,satWages:0},{emp:'Eduard',wdayHrs:62.25,wdayWages:2054.25,satHrs:0,satWages:0},{emp:'Patrick',wdayHrs:73.75,wdayWages:2360,satHrs:0,satWages:0},{emp:'Jonathan',wdayHrs:74.75,wdayWages:2392,satHrs:0,satWages:0},{emp:'Ciro',wdayHrs:14,wdayWages:448,satHrs:0,satWages:0}],
  18: [{emp:'Wilson',wdayHrs:60.25,wdayWages:2289.5,satHrs:0,satWages:0},{emp:'Eduard',wdayHrs:66.25,wdayWages:2186.25,satHrs:0,satWages:0},{emp:'Patrick',wdayHrs:67.5,wdayWages:2160,satHrs:0,satWages:0},{emp:'Jonathan',wdayHrs:68.5,wdayWages:2192,satHrs:0,satWages:0},{emp:'Ciro',wdayHrs:60.75,wdayWages:1944,satHrs:0,satWages:0}],
  19: [{emp:'Wilson',wdayHrs:77,wdayWages:2926,satHrs:15.25,satWages:869.25},{emp:'Eduard',wdayHrs:76.5,wdayWages:2524.5,satHrs:15.25,satWages:754.88},{emp:'Jonathan',wdayHrs:77,wdayWages:2464,satHrs:8,satWages:384},{emp:'Ciro',wdayHrs:76.25,wdayWages:2440,satHrs:15.25,satWages:732}],
  20: [{emp:'Kritsana',wdayHrs:62.5,wdayWages:2756.5,satHrs:0,satWages:0},{emp:'Wilson',wdayHrs:69.25,wdayWages:3059,satHrs:0,satWages:0},{emp:'Eduard',wdayHrs:60.75,wdayWages:2363.62,satHrs:0,satWages:0},{emp:'Ciro',wdayHrs:69.25,wdayWages:2576,satHrs:0,satWages:0},{emp:'Diego',wdayHrs:22,wdayWages:704,satHrs:0,satWages:0}],
  21: [{emp:'Kritsana',wdayHrs:75.5,wdayWages:2793.5,satHrs:0,satWages:0},{emp:'Wilson',wdayHrs:68.25,wdayWages:2593.5,satHrs:0,satWages:0},{emp:'Eduard',wdayHrs:71.5,wdayWages:2359.5,satHrs:2.5,satWages:123.75},{emp:'Jonathan',wdayHrs:75.5,wdayWages:2416,satHrs:0,satWages:0},{emp:'Ciro',wdayHrs:69,wdayWages:2208,satHrs:8,satWages:384},{emp:'Diego',wdayHrs:75.5,wdayWages:2416,satHrs:0,satWages:0}],
  22: [{emp:'Kritsana',wdayHrs:60,wdayWages:2220,satHrs:0,satWages:0},{emp:'Wilson',wdayHrs:50.75,wdayWages:1928.5,satHrs:0,satWages:0},{emp:'Eduard',wdayHrs:52.5,wdayWages:1732.5,satHrs:0,satWages:0},{emp:'Jonathan',wdayHrs:60.25,wdayWages:1928,satHrs:0,satWages:0},{emp:'Ciro',wdayHrs:60.25,wdayWages:1928,satHrs:0,satWages:0},{emp:'Diego',wdayHrs:15,wdayWages:480,satHrs:0,satWages:0}],
  23: [{emp:'Wilson',wdayHrs:15,wdayWages:570,satHrs:0,satWages:0},{emp:'Eduard',wdayHrs:22.5,wdayWages:742.5,satHrs:0,satWages:0},{emp:'Jonathan',wdayHrs:22.5,wdayWages:720,satHrs:0,satWages:0},{emp:'Ciro',wdayHrs:22.5,wdayWages:720,satHrs:0,satWages:0}],
  24: [], 25: [], 26: [],
}

function exportXeroCSV(pr: number, payDate: string) {
  const rows = PR_EMPLOYEE_DATA[pr] ?? []
  if (rows.length === 0) return
  const lines: string[] = [
    `# Xero Pay Run Import — PR ${pr} — Pay Date: ${payDate}`,
    `# Match 'Earnings Rate Name' to your Xero pay items exactly`,
    `Employee Name,Earnings Rate Name,Units,Amount`,
  ]
  for (const r of rows) {
    if (r.wdayWages > 0) lines.push(`${r.emp},Ordinary Hours,${r.wdayHrs.toFixed(2)},${r.wdayWages.toFixed(2)}`)
    if (r.satWages > 0)  lines.push(`${r.emp},Saturday,${r.satHrs.toFixed(2)},${r.satWages.toFixed(2)}`)
  }
  const blob = new Blob([lines.join('\n')], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `xero-payrun-pr${pr}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

function hrsColor(h: number): { bg: string; color: string } {
  if (h === 0) return { bg: 'transparent', color: '#333' }
  if (h >= 110) return { bg: 'rgba(39,174,96,0.15)', color: '#27AE60' }
  if (h >= 50)  return { bg: 'rgba(41,128,185,0.15)', color: '#2980B9' }
  return { bg: 'rgba(230,126,34,0.15)', color: '#E67E22' }
}

function formatSyncTime(syncMetadata: any[] | undefined, source: string): string {
  if (!syncMetadata || syncMetadata.length === 0) return 'Not synced'
  const meta = syncMetadata.find(m => m.source === source)
  if (!meta || !meta.last_sync_at) return 'Not synced'
  const d = new Date(meta.last_sync_at)
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function PeopleTeam({ data }: { data: DashboardData }) {
  const issues = data.issues ?? []
  const signals = data.signals ?? []

  const pendingIssues = issues.filter(i => i.resolved === 'PENDING')
  const mtIssues = pendingIssues.filter(i => i.ownership === 'MT' || i.ownership?.includes('Mark'))
  const delegations = signals.filter(s => s.signal_type === 'delegation' && !s.archived)

  // Live KPI data from prodMonthly — latest month by sort_order
  const prodMonthly = data.prodMonthly ?? []
  const latestProdMonth = [...prodMonthly].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)).at(-1)

  return (
    <div className="page">
      {/* DSB */}
      <div className="dsb">
        <div className="dsb-item"><div className="dsb-dot" /><span className="dsb-label">Master Papi</span><span>{formatSyncTime(data.syncMetadata, 'masterpapi')}</span></div>
      </div>

      {/* Team Roster */}
      <div className="g2" style={{ marginBottom: 16 }}>
        <div className="panel">
          <div className="ph"><span className="pt">Management Team</span><span className="pg">May 2026</span></div>
          <div className="pb" style={{ padding: 0 }}>
            <table className="tbl" style={{ margin: 0 }}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th className="c">Type</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'Ethan',      role: 'CEO / Founder',         type: 'Full-time' },
                  { name: 'Mark',       role: 'Head of Operations',    type: 'Full-time' },
                  { name: 'Richard',    role: 'Finance & Costing',     type: 'Part-time' },
                  { name: 'OP Digital', role: 'Marketing Agency',      type: 'Agency' },
                ].map(m => (
                  <tr key={m.name}>
                    <td style={{ fontWeight: 600 }}>{m.name}</td>
                    <td style={{ fontSize: 12 }}>{m.role}</td>
                    <td className="c">
                      <span className={`tag ${m.type === 'Full-time' ? 'tag-green' : m.type === 'Part-time' ? 'tag-blue' : 'tag-grey'}`}>{m.type}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="panel">
          <div className="ph"><span className="pt">Factory Staff Rates</span><span className="pg">FY26 · incl. 12% super</span></div>
          <div className="pb" style={{ padding: 0 }}>
            <table className="tbl" style={{ margin: 0 }}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th className="c">Weekday</th>
                  <th className="c">Weekend</th>
                </tr>
              </thead>
              <tbody>
                {FACTORY_ROLES.map(f => {
                  const roleColor = f.role === 'Senior Crew' ? 'tag-green' : f.role === 'Production Lead' ? 'tag-blue' : 'tag-grey'
                  return (
                    <tr key={f.name}>
                      <td style={{ fontWeight: 600, fontSize: 12 }}>{f.name}</td>
                      <td><span className={`tag ${roleColor}`} style={{ fontSize: 10 }}>{f.role}</span></td>
                      <td className="c" style={{ fontSize: 12 }}>${f.rate.toFixed(2)}/hr</td>
                      <td className="c" style={{ fontSize: 12, color: 'var(--mid)' }}>${f.wkndRate.toFixed(2)}/hr</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* FY26 Factory Staff Schedule */}
      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="ph">
          <span className="pt">Factory Staff Schedule</span>
          <span className="pg">FY26 · hours worked (weekday + Saturday)</span>
        </div>
        <div className="pb" style={{ padding: 0, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 760 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--row-sep)' }}>
                <th style={{ textAlign: 'left', padding: '6px 14px', fontSize: 11, color: 'var(--mid)', fontWeight: 500, width: 120 }}>Staff</th>
                {FY26_MONTHS.map(mo => (
                  <th key={mo} style={{ textAlign: 'center', padding: '6px 4px', fontSize: 11, color: 'var(--mid)', fontWeight: 500, width: 52 }}>{mo}</th>
                ))}
                <th style={{ textAlign: 'right', padding: '6px 14px', fontSize: 11, color: 'var(--mid)', fontWeight: 500 }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {FACTORY_SCHEDULE.map(person => (
                <tr key={person.name} style={{ borderBottom: '1px solid var(--row-sep)' }}>
                  <td style={{ padding: '5px 14px', fontWeight: 600, fontSize: 12, color: 'var(--creme)', whiteSpace: 'nowrap' }}>{person.name}</td>
                  {FY26_MONTHS.map(mo => {
                    const h = person.hrs[mo] ?? 0
                    const { bg, color } = hrsColor(h)
                    return (
                      <td key={mo} style={{ textAlign: 'center', padding: '4px 3px' }}>
                        {h > 0 ? (
                          <div style={{ fontSize: 10, fontWeight: 600, padding: '2px 4px', borderRadius: 3, background: bg, color, display: 'inline-block', minWidth: 34 }}>
                            {h % 1 === 0 ? h : h.toFixed(0)}h
                          </div>
                        ) : (
                          <div style={{ fontSize: 10, color: '#333' }}>—</div>
                        )}
                      </td>
                    )
                  })}
                  <td style={{ textAlign: 'right', padding: '5px 14px', fontSize: 11, fontWeight: 600, color: 'var(--mid)', whiteSpace: 'nowrap' }}>{person.total.toFixed(0)}h</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ padding: '8px 14px 10px', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {[
            { label: '110h+ (full-time equiv)', bg: 'rgba(39,174,96,0.15)', color: '#27AE60' },
            { label: '50–109h (regular casual)', bg: 'rgba(41,128,185,0.15)', color: '#2980B9' },
            { label: '<50h (light month)',       bg: 'rgba(230,126,34,0.15)', color: '#E67E22' },
          ].map(l => (
            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: l.bg, border: `1px solid ${l.color}40` }} />
              <span style={{ fontSize: 10, color: '#666' }}>{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* KPI Row */}
      <div className="kpi-row cols-4">
        <div className="kpi">
          <div className="kpi-lbl">Avg Staff on Floor</div>
          <div className="kpi-val">{latestProdMonth?.staff ?? '—'}</div>
          <div className="kpi-sub">Production days</div>
        </div>
        <div className="kpi blue">
          <div className="kpi-lbl">Prod Hours Latest Month</div>
          <div className="kpi-val">{latestProdMonth?.hours ? `${Math.round(latestProdMonth.hours)}h` : '—'}</div>
          <div className="kpi-sub">{latestProdMonth?.month ?? '—'}</div>
        </div>
        <div className={`kpi ${mtIssues.length > 3 ? 'red' : mtIssues.length > 1 ? 'orange' : 'green'}`}>
          <div className="kpi-lbl">Mark's Open Issues</div>
          <div className="kpi-val">{mtIssues.length}</div>
          <div className="kpi-sub">PENDING, owned by MT</div>
        </div>
        <div className="kpi purple">
          <div className="kpi-lbl">CEO→Mark Tasks</div>
          <div className="kpi-val">{delegations.length}</div>
          <div className="kpi-sub">Active delegations</div>
        </div>
      </div>

      {/* Main g2 */}
      <div className="g2">
        {/* Mark's Open Issues */}
        <div className="panel">
          <div className="ph">
            <span className="pt">Mark's Open Issues</span>
            <span className="pg">{mtIssues.length} pending</span>
          </div>
          <div className="pb min-h-[120px]">
            {mtIssues.length === 0 ? (
              <div style={{ fontSize: 12, color: 'var(--mid)' }}>No open issues.</div>
            ) : (
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Issue</th>
                    <th>Category</th>
                    <th className="c">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {mtIssues.map((issue, i) => (
                    <tr key={issue.id ?? i}>
                      <td style={{ whiteSpace: 'nowrap', fontSize: 11 }}>{issue.date}</td>
                      <td style={{ fontSize: 11 }}>{issue.issue}</td>
                      <td>
                        <span className="tag tag-grey">{issue.category}</span>
                      </td>
                      <td className="c">
                        <span className="tag tag-orange">PENDING</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {mtIssues.length === 0 && pendingIssues.length > 0 && (
              <div style={{ marginTop: 12 }}>
                <div className="slbl">Other Pending Issues</div>
                <table className="tbl">
                  <thead>
                    <tr><th>Date</th><th>Issue</th><th>Owner</th></tr>
                  </thead>
                  <tbody>
                    {pendingIssues.map((issue, i) => (
                      <tr key={issue.id ?? i}>
                        <td style={{ fontSize: 11 }}>{issue.date}</td>
                        <td style={{ fontSize: 11 }}>{issue.issue}</td>
                        <td style={{ fontSize: 11 }}>{issue.ownership}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {pendingIssues.length === 0 && (
              <div style={{ fontSize: 12, color: 'var(--mid)', padding: '8px 0' }}>No pending issues logged.</div>
            )}
          </div>
        </div>

        {/* What I Need from Mark */}
        <div className="panel">
          <div className="ph">
            <span className="pt">What I Need from Mark This Week</span>
            <span className="pg">{delegations.length} open</span>
          </div>
          <div className="pb min-h-[120px]">
            {delegations.length === 0 ? (
              <div style={{ fontSize: 12, color: 'var(--mid)' }}>No active delegations.</div>
            ) : (
              delegations.map((s, i) => (
                <div key={s.id ?? i} className="feed-item">
                  <div className="feed-date">{s.date}</div>
                  <div className="feed-text">{s.text}</div>
                </div>
              ))
            )}

            {/* Performance Log */}
            <div className="slbl" style={{ marginTop: 16 }}>Performance Log</div>
            {PERF_LOG.map((entry, i) => (
              <div key={i} className="feed-item">
                <div className="feed-date">{entry.d} · {entry.e}</div>
                <div className="feed-text">{entry.i}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Xero Pay Run Schedule */}
      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="ph">
          <span className="pt">Xero Pay Run Schedule</span>
          <span className="pg">FY26 · 26 fortnightly runs · PR{CURRENT_PR} current</span>
        </div>
        <div className="pb" style={{ padding: 0, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 680 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--row-sep)' }}>
                {['PR #','Period','Pay Date','Wages','OT','Allow','Super','Total',''].map(h => (
                  <th key={h} style={{ textAlign: h === 'PR #' ? 'left' : 'right', padding: '6px 10px', fontSize: 11, color: 'var(--mid)', fontWeight: 500, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PAY_RUNS.map(r => {
                const isCurrent = r.pr === CURRENT_PR
                const isPast = r.pr < CURRENT_PR
                const isFuture = r.total === 0 && r.pr > CURRENT_PR
                const rowBg = isCurrent ? 'rgba(230,126,34,0.08)' : undefined
                const numColor = isFuture ? '#555' : isPast ? 'var(--mid)' : 'var(--creme)'
                const dolFmt = (v: number) => v > 0 ? `$${v.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'
                return (
                  <tr key={r.pr} style={{ borderBottom: '1px solid var(--row-sep)', background: rowBg }}>
                    <td style={{ padding: '5px 10px', fontWeight: 700, fontSize: 12, color: isCurrent ? '#E67E22' : isPast ? 'var(--mid)' : 'var(--creme)', whiteSpace: 'nowrap' }}>
                      PR {r.pr}{isCurrent ? ' ←' : ''}
                    </td>
                    <td style={{ textAlign: 'right', padding: '5px 10px', fontSize: 11, color: numColor, whiteSpace: 'nowrap' }}>{r.start} – {r.end}</td>
                    <td style={{ textAlign: 'right', padding: '5px 10px', fontSize: 11, color: numColor, whiteSpace: 'nowrap' }}>{r.payDate}</td>
                    <td style={{ textAlign: 'right', padding: '5px 10px', fontSize: 11, color: numColor, whiteSpace: 'nowrap' }}>{dolFmt(r.wages)}</td>
                    <td style={{ textAlign: 'right', padding: '5px 10px', fontSize: 11, color: r.ot > 0 ? '#E67E22' : numColor, whiteSpace: 'nowrap' }}>{dolFmt(r.ot)}</td>
                    <td style={{ textAlign: 'right', padding: '5px 10px', fontSize: 11, color: r.allow > 0 ? '#2980B9' : numColor, whiteSpace: 'nowrap' }}>{dolFmt(r.allow)}</td>
                    <td style={{ textAlign: 'right', padding: '5px 10px', fontSize: 11, color: numColor, whiteSpace: 'nowrap' }}>{dolFmt(r.super_)}</td>
                    <td style={{ textAlign: 'right', padding: '5px 10px', fontSize: 12, fontWeight: 700, color: isFuture ? '#555' : isCurrent ? '#E67E22' : 'var(--creme)', whiteSpace: 'nowrap' }}>{dolFmt(r.total)}</td>
                    <td style={{ textAlign: 'right', padding: '4px 10px' }}>
                      {!isFuture && r.total > 0 && (
                        <button
                          onClick={() => exportXeroCSV(r.pr, r.payDate)}
                          style={{ fontSize: 10, padding: '2px 7px', borderRadius: 4, border: '1px solid #2980B9', background: 'rgba(41,128,185,0.12)', color: '#2980B9', cursor: 'pointer', whiteSpace: 'nowrap', fontWeight: 600 }}
                        >
                          Export →
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div style={{ padding: '8px 14px 10px', fontSize: 11, color: 'var(--mid)' }}>
          Source: Employee Schedule FY26_LIVE.xlsx · Super 12% · OT at 1.5× · Weekend at 1.5×
        </div>
      </div>

      {/* Mark's KPI Tracker */}
      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="ph"><span className="pt">Mark's Weekly KPI Completion</span><span className="pg">FY26</span></div>
        <div className="pb">
          <table className="tbl">
            <thead>
              <tr>
                <th>Week</th>
                <th className="c">Calendar Updated</th>
                <th className="c">Mon KPIs</th>
                <th className="c">Fri KPIs</th>
              </tr>
            </thead>
            <tbody>
              {MARK_KPIS.map(row => (
                <tr key={row.wk}>
                  <td>{row.wk}</td>
                  <td className="c">
                    <span className={`tag ${row.cal === 'Y' ? 'tag-green' : 'tag-red'}`}>{row.cal}</span>
                  </td>
                  <td className="c">
                    <span className={`tag ${row.mon === 'Y' ? 'tag-green' : 'tag-red'}`}>{row.mon}</span>
                  </td>
                  <td className="c">
                    <span className={`tag ${row.fri === 'Y' ? 'tag-green' : 'tag-red'}`}>{row.fri}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
