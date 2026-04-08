-- ── SCHEMA ──────────────────────────────────────────────────────────────────
-- Enable RLS but allow anon reads for the dashboard (single-user, private app)

CREATE TABLE IF NOT EXISTS revenue_monthly (
  id SERIAL PRIMARY KEY,
  fiscal_year TEXT NOT NULL,
  month TEXT NOT NULL,
  total NUMERIC DEFAULT 0,
  direct NUMERIC DEFAULT 0,
  wsale NUMERIC DEFAULT 0,
  distrbn NUMERIC DEFAULT 0,
  coles NUMERIC DEFAULT 0,
  metcash NUMERIC DEFAULT 0,
  fserv NUMERIC DEFAULT 0,
  nandos NUMERIC DEFAULT 0,
  other NUMERIC DEFAULT 0,
  orders INTEGER DEFAULT 0,
  ad NUMERIC DEFAULT 0,
  roas NUMERIC DEFAULT 0,
  mtd BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS revenue_weekly (
  id SERIAL PRIMARY KEY,
  week_label TEXT NOT NULL,
  total NUMERIC DEFAULT 0,
  direct NUMERIC DEFAULT 0,
  coles NUMERIC DEFAULT 0,
  distrbn NUMERIC DEFAULT 0,
  nandos NUMERIC DEFAULT 0,
  other NUMERIC DEFAULT 0,
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS production_monthly (
  id SERIAL PRIMARY KEY,
  month TEXT NOT NULL,
  units INTEGER DEFAULT 0,
  hours NUMERIC DEFAULT 0,
  staff NUMERIC DEFAULT 0,
  uph NUMERIC DEFAULT 0,
  days INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS production_weekly (
  id SERIAL PRIMARY KEY,
  week_label TEXT NOT NULL,
  units INTEGER DEFAULT 0,
  hours NUMERIC DEFAULT 0,
  uph NUMERIC DEFAULT 0,
  staff NUMERIC DEFAULT 0,
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS production_sku (
  id SERIAL PRIMARY KEY,
  sku TEXT NOT NULL,
  units INTEGER DEFAULT 0,
  pct NUMERIC DEFAULT 0,
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS production_channel_monthly (
  id SERIAL PRIMARY KEY,
  channel TEXT NOT NULL,
  jul INTEGER DEFAULT 0,
  aug INTEGER DEFAULT 0,
  sep INTEGER DEFAULT 0,
  oct INTEGER DEFAULT 0,
  nov INTEGER DEFAULT 0,
  dec INTEGER DEFAULT 0,
  jan INTEGER DEFAULT 0,
  feb INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS issues (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  issue TEXT NOT NULL,
  category TEXT,
  ownership TEXT,
  resolved TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS calendar_events (
  id SERIAL PRIMARY KEY,
  day TEXT NOT NULL,
  month TEXT NOT NULL,
  info TEXT NOT NULL,
  category TEXT,
  color TEXT,
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS ap_categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS marketing_monthly (
  id SERIAL PRIMARY KEY,
  month TEXT NOT NULL,
  rev NUMERIC DEFAULT 0,
  orders INTEGER DEFAULT 0,
  meta_spend NUMERIC DEFAULT 0,
  google_spend NUMERIC DEFAULT 0,
  total_spend NUMERIC DEFAULT 0,
  mer NUMERIC DEFAULT 0,
  meta_roas NUMERIC,
  google_roas NUMERIC,
  conv_rate NUMERIC,
  aov NUMERIC DEFAULT 0,
  cpa NUMERIC DEFAULT 0,
  mtd BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS large_transactions (
  id SERIAL PRIMARY KEY,
  date TEXT NOT NULL,
  vendor TEXT NOT NULL,
  category TEXT,
  amount NUMERIC NOT NULL,
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS anomalies (
  id SERIAL PRIMARY KEY,
  category TEXT NOT NULL,
  average NUMERIC,
  current_val NUMERIC,
  ratio NUMERIC,
  flag TEXT
);

CREATE TABLE IF NOT EXISTS signals (
  id SERIAL PRIMARY KEY,
  signal_type TEXT NOT NULL,
  date TEXT NOT NULL,
  text TEXT NOT NULL,
  archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS dismissed_alerts (
  id SERIAL PRIMARY KEY,
  alert_id TEXT NOT NULL,
  alert_type TEXT NOT NULL,
  dismissed_date TEXT NOT NULL,
  dismissed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS dismissed_alerts_unique
  ON dismissed_alerts (alert_id, alert_type, dismissed_date);

-- ── SEED DATA ────────────────────────────────────────────────────────────────

-- FY26 monthly revenue
INSERT INTO revenue_monthly (fiscal_year, month, total, direct, wsale, distrbn, coles, metcash, fserv, nandos, other, orders, ad, roas, sort_order) VALUES
  ('fy26', 'Jul', 335477, 42285, 6072, 34217, 168611, 28310, 4143, 49540, 2300, 0, 5259, 2.73, 1),
  ('fy26', 'Aug', 297659, 34615, 10251, 58136, 124928, 31456, 5535, 32464, 275, 522, 5721, 1.79, 2),
  ('fy26', 'Sep', 260705, 32134, 4132, 58210, 110925, 12582, 4173, 38429, 120, 465, 5624, 1.62, 3),
  ('fy26', 'Oct', 248974, 32651, 4886, 43033, 103629, 12582, 4827, 45151, 2215, 490, 6121, 1.11, 4),
  ('fy26', 'Nov', 381521, 105366, 5462, 42675, 191104, 9437, 2241, 24852, 384, 1542, 16815, 3.97, 5),
  ('fy26', 'Dec', 321185, 54844, 3916, 53959, 153946, 0, 177, 54343, 0, 822, 0, 0, 6),
  ('fy26', 'Jan', 329647, 41892, 2287, 74128, 77901, 6291, 1137, 124827, 1183, 641, 0, 0, 7),
  ('fy26', 'Feb', 308340, 43423, 2977, 85093, 114637, 0, 0, 61880, 330, 569, 0, 0, 8),
  ('fy26', 'Mar', 329203, 43359, 2080, 42165, 177459, 0, 660, 61271, 2209, 645, 0, 0, 9),
  ('fy26', 'Apr', 42881, 1716, 0, 0, 41165, 0, 0, 0, 0, 21, 0, 0, 10);

UPDATE revenue_monthly SET mtd = TRUE WHERE fiscal_year = 'fy26' AND month = 'Apr';

-- FY25 monthly revenue
INSERT INTO revenue_monthly (fiscal_year, month, total, direct, wsale, distrbn, coles, metcash, fserv, nandos, other, orders, ad, roas, sort_order) VALUES
  ('fy25', 'Jul', 206258, 44841, 6320, 25431, 97401, 0, 4671, 24431, 3163, 749, 5000, 0, 1),
  ('fy25', 'Aug', 219071, 52660, 10650, 37616, 69555, 0, 2874, 45336, 379, 890, 5000, 0, 2),
  ('fy25', 'Sep', 390434, 50518, 7710, 48583, 225139, 0, 4710, 52748, 1026, 879, 5000, 0, 3),
  ('fy25', 'Oct', 345555, 58410, 12750, 47728, 146227, 0, 5022, 72765, 2653, 980, 5000, 0, 4),
  ('fy25', 'Nov', 335982, 114287, 9766, 24800, 81190, 50330, 4326, 50530, 753, 1638, 7000, 0, 5),
  ('fy25', 'Dec', 325347, 47436, 12274, 53520, 138509, 12582, 4215, 56391, 420, 742, 5000, 0, 6),
  ('fy25', 'Jan', 224612, 37375, 7864, 7049, 114637, 12582, 4863, 40183, 59, 608, 5000, 0, 7),
  ('fy25', 'Feb', 257030, 30045, 6541, 48872, 103629, 25165, 3525, 36176, 3077, 460, 5000, 0, 8),
  ('fy25', 'Mar', 284360, 35847, 6734, 30160, 146227, 25165, 4032, 30808, 5386, 538, 5000, 0, 9),
  ('fy25', 'Apr', 217226, 46816, 3901, 23651, 77184, 25165, 3819, 36563, 128, 675, 5000, 0, 10),
  ('fy25', 'May', 252646, 44753, 6904, 25705, 94771, 22019, 5028, 53466, 0, 629, 5000, 0, 11),
  ('fy25', 'Jun', 278318, 35196, 7331, 65883, 113920, 34602, 5151, 16235, 0, 499, 5000, 0, 12);

-- Weekly revenue
INSERT INTO revenue_weekly (week_label, total, direct, coles, distrbn, nandos, other, sort_order) VALUES
  ('1 Jul',74374,11338,25728,25337,9672,0,1),('8 Jul',36868,7119,21299,0,4514,2125,2),
  ('15 Jul',129937,7254,74556,1440,25517,0,3),('22 Jul',29873,9502,10291,7440,0,0,4),
  ('29 Jul',64425,7072,36736,0,9835,175,5),('5 Aug',38344,8423,26445,0,0,0,6),
  ('12 Aug',93425,6522,36019,36296,0,0,7),('19 Aug',73287,7447,25728,0,26070,100,8),
  ('26 Aug',82411,8835,11008,35680,10660,0,9),('2 Sep',66172,8320,36019,17462,3278,0,10),
  ('9 Sep',39863,7671,5146,760,16235,0,11),('16 Sep',72435,7646,37453,12390,14649,120,12),
  ('23 Sep',48191,5877,21299,13758,0,0,13),('30 Sep',34889,5981,25728,1440,0,90,14),
  ('7 Oct',31854,6307,10291,0,4328,0,15),('14 Oct',94912,8376,52173,1692,30988,0,16),
  ('21 Oct',31056,7979,15437,0,0,2125,17),('28 Oct',109396,9841,46310,39901,9835,0,18),
  ('4 Nov',97715,13784,61747,4674,9425,0,19),('11 Nov',86526,20798,54746,2196,2964,384,20),
  ('18 Nov',83272,14017,28301,34365,3278,0,21),('25 Nov',131800,56222,55462,1440,18368,0,22),
  ('2 Dec',99856,11939,62464,1512,23024,0,23),('9 Dec',81602,17183,36019,25225,0,0,24),
  ('16 Dec',61678,12321,0,27222,22135,0,25),('23 Dec',6960,6960,0,0,0,0,26),
  ('30 Dec',43385,8970,0,14256,18609,0,27),('6 Jan',113748,10448,43738,16226,36905,140,28),
  ('13 Jan',67376,9362,5862,22646,29506,0,29),('20 Jan',57121,8477,28301,7680,10375,1043,30),
  ('27 Jan',71361,11622,15437,13320,29433,0,31),('3 Feb',152497,12694,57318,43392,37702,0,32),
  ('10 Feb',70683,10950,31590,12160,15982,0,33),('17 Feb',27514,8696,10291,0,8196,330,34),
  ('24 Feb',80533,8582,41523,29541,0,220,35),('3 Mar',86263,8000,44454,20128,13156,0,36),
  ('10 Mar',76770,9708,51814,0,14753,0,37),('17 Mar',67391,10657,29376,0,25638,0,38),
  ('24 Mar',50875,12152,10291,22037,4446,1949,39),('31 Mar',47163,2679,41165,0,3278,40,40);

-- Production monthly
INSERT INTO production_monthly (month, units, hours, staff, uph, days, sort_order) VALUES
  ('Jul',25250,0,0,0,0,1),('Aug',23996,0,0,0,0,2),('Sep',25084,0,0,0,0,3),
  ('Oct',22357,0,0,0,0,4),('Nov',35087,0,0,0,0,5),('Dec',31234,0,0,0,0,6),
  ('Jan',23877,104.4,5.7,201.3,16,7),('Feb',28690,159.9,5.3,155.0,20,8),
  ('Mar',28870,113.0,5.0,196.5,19,9);

-- Production weekly
INSERT INTO production_weekly (week_label, units, hours, uph, staff, sort_order) VALUES
  ('Wk 03',6498,32.4,200.8,5.6,1),('Wk 04',5928,40.3,147.0,5.5,2),
  ('Wk 05',5397,31.7,170.3,6.0,3),('Wk 06',6747,39.6,170.2,5.4,4),
  ('Wk 07',6596,40.6,162.3,5.2,5),('Wk 08',4624,40.6,113.9,5.5,6),
  ('Wk 09',6808,39.0,174.6,5.3,7),('Wk 10',6320,40.1,157.6,5.1,8),
  ('Wk 11',3666,32.8,111.7,5.5,9),('Wk 12',7132,40.1,177.8,4.6,10);

-- Production SKU mix
INSERT INTO production_sku (sku, units, pct, sort_order) VALUES
  ('OG Large',40005,49.4,1),('ES Large',15923,19.7,2),('Chilli Egg Mayo',10764,13.3,3),
  ('Hot Honey',5935,7.3,4),('PERi Crackle 1KG',6282,7.8,5),('OG Jumbo',908,1.1,6),
  ('PERi Seed 1.5KG',474,0.6,7),('Other',706,0.9,8);

-- Issues
INSERT INTO issues (date, issue, category, ownership, resolved) VALUES
  ('2024-12-18','Wrong lids supplied by AG, buttoned lids.','Supplier','EY','YES ✔'),
  ('2024-12-18','Unreliable delivery driver from AG.','Dispatch','MT','YES ✔'),
  ('2024-12-18','AG delivery driver did not unload stock.','Dispatch','MT','YES ✔'),
  ('2024-12-19','Penomore delivery driver arrived outside business hours.','Dispatch','EY','YES ✔'),
  ('2024-12-20','Staff using mobile phone during production.','Staff','EY','YES ✔'),
  ('2025-01-31','Forklift operators do not currently hold forklift licences or training.','Staff','MT','PENDING'),
  ('2025-02-09','Set due dates in Trello for self accountability.','Operations','MT','YES ✔'),
  ('2025-02-23','Invoices not done.','Operations','MT','YES ✔'),
  ('2025-03-03','Accumulation of mayo stock and strict best before dates.','Production','EY','PENDING'),
  ('2025-03-06','Hardened bag of sugar found — likely exposed to liquid during manufacture.','Supplier','MT','PENDING'),
  ('2025-01-07','Have we been overcharged for lids this whole time?','Supplier','EY','PENDING'),
  ('2025-01-08','EDICloud invoices to be created on the day of receival.','Operations','MT','YES ✔'),
  ('2025-01-09','Office and kitchenette area accumulates clutter.','Operations','MT','PENDING'),
  ('2025-02-10','Nandos invoicing issue — system allowed it to pass through unchecked.','Operations','MT','PENDING'),
  ('2025-02-09','Ownership across starter packs and gift packs unclear.','Operations','EY','PENDING');

-- Calendar events
INSERT INTO calendar_events (day, month, info, category, color, sort_order) VALUES
  ('30','Mar','Ninja back','Annual Leave','grey',1),
  ('03','Apr','Good Friday','Public Holiday','phol',2),
  ('04','Apr','Easter Saturday','Public Holiday','phol',3),
  ('05','Apr','Easter Sunday','Public Holiday','phol',4),
  ('06','Apr','Easter Monday','Public Holiday','phol',5),
  ('13','Apr','SK Yong arrives Melbourne','Business','blue',6),
  ('17','Apr','Chadstone Pop Up (Apr 17–19)','Campaign','orange',7),
  ('22','Apr','SK Yong leaves Melbourne','Business','blue',8),
  ('25','Apr','ANZAC Day','Public Holiday','phol',9),
  ('27','Apr','Tom back from Thailand','Annual Leave','grey',10),
  ('10','May','Mother''s Day campaign','Campaign','orange',11),
  ('25','May','Food & Hospitality Week — ICC Sydney','Business','blue',12),
  ('04','Jun','Ethan away — Europe','Annual Leave','grey',13),
  ('08','Jun','King''s Birthday','Public Holiday','phol',14),
  ('26','Jun','Ethan back — Europe','Annual Leave','red',15);

-- AP Categories
INSERT INTO ap_categories (name, amount, sort_order) VALUES
  ('Ingredients',10035,1),('Jars',8819,2),('Agency Fees',8518,3),
  ('Packaging',3597,4),('Courier Delivery',2660,5),
  ('Content Creation',1039,6),('Rates and Fees',136,7);

-- Marketing monthly
INSERT INTO marketing_monthly (month, rev, orders, meta_spend, google_spend, total_spend, mer, meta_roas, google_roas, conv_rate, aov, cpa, sort_order) VALUES
  ('Jan',40809,642,12359,3256,15615,2.61,2.61,NULL,6.10,64.65,24.90,1),
  ('Feb',40034,578,7645,4901,12546,3.19,1.84,2.91,4.23,69.50,23.15,2),
  ('Mar',42886,646,9637,7168,16805,2.55,1.54,1.62,2.67,66.39,26.01,3),
  ('Apr',6072,85,800,403,1203,5.05,NULL,NULL,NULL,71.44,14.15,4);

UPDATE marketing_monthly SET mtd = TRUE WHERE month = 'Apr';

-- Large transactions
INSERT INTO large_transactions (date, vendor, category, amount, sort_order) VALUES
  ('31 Oct 25','Aussie Growers','Contract Manufacturing COGS',49875,1),
  ('24 Oct 25','Flavour Makers','Contract Manufacturing COGS',39562,2),
  ('15 Jan 26','Australia Post','Postage',23092,3),
  ('14 Nov 25','Aussie Growers','Ingredients',22204,4),
  ('19 Dec 25','Aussie Growers','Ingredients',22204,5),
  ('1 Dec 25','Green Olive','Consulting Fees',19831,6),
  ('9 Dec 25','Retcon Retail','Consulting Fees',18353,7),
  ('30 Jan 26','HELA Spices','Ingredients',18026,8),
  ('29 Oct 25','Cookers','Ingredients',17493,9),
  ('15 Jan 26','Retcon Retail','Consulting Fees',17332,10),
  ('13 Mar 26','Retcon Retail','Consulting Fees',15593,11),
  ('8 Feb 26','OP Digital','Digital Marketing',15570,12),
  ('13 Mar 26','Retcon Retail','Consulting Fees',15136,13),
  ('2 Mar 26','Cookers','Ingredients',14817,14),
  ('8 Oct 25','Retcon Retail','Consulting Fees',14341,15);

-- Anomalies
INSERT INTO anomalies (category, average, current_val, ratio, flag) VALUES
  ('Repairs & Maintenance',449,8280,18.4,'red'),
  ('Staff Welfare',1720,6500,3.8,'red'),
  ('Vehicle & Transport',782,1790,2.3,'amber');

-- Signals (current)
INSERT INTO signals (signal_type, date, text, archived) VALUES
  ('update','25 Mar','W39 · Q1 Close. Q1 Rock incomplete at deadline — close-out conversation with Mark required this week.',FALSE),
  ('update','25 Mar','Mayo pricing opportunity identified: 27pp net margin gap vs Chilli Oil. Validation with Joe + Retcon this week.',FALSE),
  ('delegation','25 Mar','Mark: Q1 formal close-out documentation — what happened, why filler trial not completed, Q2 commitment in writing EOW.',FALSE),
  ('delegation','25 Mar','Mark: ES Jumbo + PERi Seed restock timeline confirmed EOW.',FALSE),
  ('delegation','25 Mar','Richard: Build CEM margin model (COGS/jar, price floor by channel, weekly carry cost) EOW.',FALSE),
  ('delegation','25 Mar','Richard: Fix Mayo Summary #REF! errors (Flavour Makers + Aussie Growers rows) EOW.',FALSE),
  ('delegation','25 Mar','Joe: Coles Wk38 drop explanation in writing — timing or structural, with evidence EOW.',FALSE),
  ('nudge','25 Mar','Q1 Rock close-out with Mark — standards conversation, not coaching. Name the gap explicitly.',FALSE),
  ('nudge','25 Mar','Mayo Coles pricing — confirm with Joe and Retcon whether $4.58 is locked or renegotiable this week.',FALSE),
  ('nudge','25 Mar','Address Wk11 quality event escalation gap — why was it not in check-ins? Investigate with Mark this week.',FALSE),
  ('nudge','22 Mar','Trademark IP legitimate — transferring ownership to trust + licensing company.',FALSE),
  ('nudge','22 Mar','Move all system files into a System folder (Cowork, Claude, Manus, WisprFlow).',FALSE);

-- Signals (archived)
INSERT INTO signals (signal_type, date, text, archived) VALUES
  ('update','12 Jan','AY shoot on Jan 19',TRUE),
  ('update','23 Jan','New website launch on Tuesday',TRUE),
  ('update','23 Jan','Business One (UniMelb) x UmamiPapi',TRUE),
  ('update','02 Feb','Flavour Makers as R&D resource for scalability and product refinement',TRUE),
  ('update','10 Mar','Mark asking strong questions below the surface — contributing to robust discussions.',TRUE),
  ('win','07 Jan','Changed ES to include Carolina Reaper — ~$4,000/year saving',TRUE);
