// ---------- helpers ----------
const $=q=>document.querySelector(q);
const R=Math.random,rint=(a,b)=>a+Math.floor(R()*(b-a+1)),pick=a=>a[Math.floor(R()*a.length)],clamp=(v,a,b)=>v<a?a:v>b?b:v;
const gauss=()=>{let u=0,v=0;while(!u)u=R();while(!v)v=R();return Math.sqrt(-2*Math.log(u))*Math.cos(6.2832*v)};
const U=['','K','M','B','T','Qa','Qi','Sx','Sp'];
function big(n,cents){const a=Math.abs(n),sg=n<0?'-':'';if(a<1000)return sg+(cents&&a<100&&a%1?a.toFixed(2):Math.round(a));let i=0,x=a;while(x>=1000&&i<U.length-1){x/=1000;i++}return sg+x.toFixed(x<10?2:x<100?1:0)+U[i]}
const fmt=n=>(n<0?'-$':'$')+big(Math.abs(n),1);
const pct=x=>{const v=Math.round(x*1000)/10||0;return (v>=0?'+':'')+v.toFixed(1)+'%'};
const esc=t=>String(t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const hue=h=>[...h].reduce((a,c)=>a*31+c.charCodeAt(0)>>>0,7)%360;

// ---------- data ----------
const EDU=[{n:'High school'},{n:'Diploma',cost:6000,days:180,sma:10},{n:"Bachelor's degree",cost:35000,days:360,sma:12},{n:"Master's degree",cost:80000,days:240,sma:10},{n:'PhD',cost:120000,days:480,sma:15}];
// fld = career field (experience builds per field); x = years needed in a field; xt = total years; h = health; f = followers
const JOBS=[
 {id:'crew',n:'Fast Food Crew',fld:'food',e:0,s:0,pay:60,str:2},
 {id:'rider',n:'Delivery Rider',fld:'delivery',e:0,s:0,pay:72,str:3},
 {id:'retail',n:'Retail Associate',fld:'retail',e:0,s:25,pay:88,str:2},
 {id:'chef',n:'Line Chef',fld:'food',e:0,s:25,pay:118,str:4,x:{food:1}},
 {id:'smgr',n:'Store Manager',fld:'retail',e:0,s:35,pay:165,str:3,x:{retail:2}},
 {id:'admin',n:'Office Admin',fld:'office',e:1,s:35,pay:140,str:1},
 {id:'elec',n:'Electrician',fld:'trade',e:0,dg:'cert',s:30,pay:190,str:2},
 {id:'police',n:'Police Officer',fld:'public',e:0,dg:'academy',s:35,pay:205,str:4,h:60},
 {id:'design',n:'Graphic Designer',fld:'creative',e:1,s:40,pay:175,str:2},
 {id:'dev',n:'Junior Developer',fld:'tech',e:1,s:50,pay:210,str:2},
 {id:'teacher',n:'Teacher',fld:'public',e:2,dg:'teach',s:45,pay:230,str:3},
 {id:'nurse',n:'Nurse',fld:'health',e:1,mj:'Nursing',s:45,pay:260,str:3},
 {id:'analyst',n:'Financial Analyst',fld:'finance',e:2,s:60,pay:380,str:3},
 {id:'swe',n:'Software Engineer',fld:'tech',e:2,s:65,pay:480,str:2,x:{tech:1}},
 {id:'cdir',n:'Creative Director',fld:'creative',e:2,s:55,pay:520,str:3,x:{creative:3}},
 {id:'lawyer',n:'Lawyer',fld:'law',e:0,dg:'jd',s:72,pay:760,str:4},
 {id:'pilot',n:'Airline Pilot',fld:'aviation',e:0,dg:'flight',s:70,pay:900,str:3,h:70},
 {id:'resident',n:'Resident Doctor',fld:'health',e:0,dg:'md',s:72,pay:420,str:5},
 {id:'surgeon',n:'Surgeon',fld:'health',e:0,dg:'md',s:78,pay:1150,str:4,x:{health:2}},
 {id:'prof',n:'Professor',fld:'academia',e:0,dg:'phd',s:75,pay:620,str:2},
 {id:'ceo',n:'Corporate CEO',fld:'exec',e:0,dg:'mba',s:80,pay:2600,str:5,f:25000,xt:8},
];
// education: lvl = level it gives (jobs ask for a level or a specific program), need = level required to start
const MAJORS={Business:'office','Computer science':'tech',Finance:'finance',Nursing:'health',Biology:'health',Design:'creative',Engineering:'trade',Psychology:'public',Education:'public',Hospitality:'food'};
const PROGS=[
 {id:'cert',n:'Trade certificate',at:'City Trade Institute',lvl:1,need:0,days:180,cost:5000,sma:4,min:20},
 {id:'academy',n:'Police academy',at:'Metro Police Academy',lvl:1,need:0,days:120,cost:2000,sma:3,min:25,hea:55},
 {id:'camp',n:'Coding bootcamp',at:'ByteForge Bootcamp',lvl:1,need:0,days:90,cost:12000,sma:6,min:35,xp:'tech'},
 {id:'dip',n:'Diploma',lvl:1,need:0,days:180,cost:6000,sma:10,min:0,mj:1,sch:['online','cc']},
 {id:'ba',n:"Bachelor's degree",lvl:2,need:0,days:360,cost:35000,sma:12,min:35,mj:1,sch:['online','state','priv','elite']},
 {id:'flight',n:'Flight school',at:'Skyline Flight School',lvl:1,need:0,days:300,cost:90000,sma:5,min:50,hea:70},
 {id:'teach',n:'Teaching certificate',at:'Midtown State University',lvl:2,need:2,days:120,cost:8000,sma:3,min:40},
 {id:'ma',n:"Master's degree",lvl:3,need:2,days:240,cost:60000,sma:10,min:55,mj:1,sch:['online','state','priv','elite']},
 {id:'mba',n:'MBA',lvl:3,need:2,days:240,cost:120000,sma:8,min:55,sch:['state','priv','elite']},
 {id:'jd',n:'Law school (JD)',lvl:3,need:2,days:360,cost:150000,sma:12,min:65,sch:['state','priv','elite']},
 {id:'md',n:'Medical school (MD)',lvl:4,need:2,days:720,cost:250000,sma:15,min:72,sch:['state','priv','elite']},
 {id:'phd',n:'PhD',lvl:4,need:3,days:480,cost:0,sma:15,min:70,mj:1,stipend:60,sch:['state','priv','elite']},
];
const PG=Object.fromEntries(PROGS.map(x=>[x.id,x]));
const SCHOOLS={online:{n:'Open Online University',cost:.5,adm:0,pres:0,slow:1.25,note:'Study alongside work with no mood hit. Takes 25% longer.'},cc:{n:'Riverside Community College',cost:.6,adm:0,pres:0},
 state:{n:'Midtown State University',cost:1,adm:45,pres:1},priv:{n:'St. Aldric College',cost:2.2,adm:60,pres:2},elite:{n:'Kingsbridge University',cost:4,adm:78,pres:3}};
const PRES=['Open to all','Solid','Respected','Elite'];
const STUDY={
 hard:{n:'Study hard',cd:4,fx:()=>{const st=s.study;st.g=clamp(st.g+6,0,100);st.left=Math.max(1,st.left-3);add('hap',-1);add('sma',.3);return 'Library until midnight.'}},
 party:{n:'Go to a party',cd:6,fx:()=>{s.study.g=clamp(s.study.g-5,0,100);add('hap',6);if(R()<.4&&friendsN()<10){const q=meet('friend',45);return `Great party. You met ${q.n}.`}return 'Great party. Rough morning.'}},
 tutor:{n:'Hire a tutor',cd:14,c:250,fx:()=>{s.study.g=clamp(s.study.g+10,0,100);return 'Your tutor explains it in five minutes.'}},
};
const FIELD={academia:'academia',food:'food service',delivery:'delivery',retail:'retail',office:'office work',trade:'the trades',public:'public service',creative:'creative work',tech:'tech',health:'healthcare',finance:'finance',law:'law',aviation:'aviation',exec:'management'};
const IVQ=['Why should we hire you?','Tell us about a time you solved a hard problem.','Where do you see yourself in five years?','What is your biggest weakness?','How do you handle pressure?'];
const WORK={
 hard:{n:'Work hard',cd:4,fx:()=>{s.perf=clamp(s.perf+5,0,100);add('hap',-1);return 'Long day. Your boss noticed.'}},
 slack:{n:'Slack off',cd:3,fx:()=>{s.perf=clamp(s.perf-6,0,100);add('hap',4);return 'An hour of videos. Worth it?'}},
 net:{n:'Network',cd:14,c:100,fx:()=>{s.perf=clamp(s.perf+4,0,100);if(R()<.3&&friendsN()<10){const p=meet('friend',40);return `Drinks with coworkers. You clicked with ${p.n}.`}return 'Drinks with coworkers. Good for your name around the office.'}},
 raise:{n:'Ask for a raise',cd:90,fx:()=>{if(R()<raiseOdds()){s.raise=(s.raise||0)+.08;log(`Got a raise. Now ${fmt(jobPay())} a day.`,'good');return `Yes! 8% more. Now ${fmt(jobPay())} a day.`}s.perf=clamp(s.perf-5,0,100);add('hap',-3);return 'Not this time. Your boss suggests "more ownership".'}},
};
// people: role decides decay, what you can do together, and how much they lift your mood
const PNAMES=['Mia','Leo','Ava','Noah','Zara','Ethan','Priya','Omar','Hana','Luca','Sofia','Kenji','Amara','Diego','Ivy','Farid','Nina','Theo','Aisha','Ren','Mei','Jonah','Layla','Arjun','Chloe','Malik','Yuna','Felix','Iris','Tariq','Elif','Mateo'];
const ROLE={spouse:'Spouse',date:'Partner',child:'Child',parent:'Parent',sibling:'Sibling',friend:'Friend',ex:'Ex'};
const PW={spouse:.05,date:.04,child:.02,parent:.01,sibling:.008,friend:.008,ex:0};
const DECAY={spouse:.08,date:.08,friend:.05,parent:.03,sibling:.03,child:.03,ex:.02};
const PACTS={
 call:{n:'Call',cd:2,roles:['parent','sibling','friend','date','spouse','child'],fx:p=>{prel(p,4);return `You caught up with ${p.n}.`}},
 time:{n:'Hang out',cd:4,c:p=>p.role==='friend'?40:0,roles:['parent','sibling','friend','child'],fx:p=>{prel(p,rint(6,10));add('hap',2);return `A good afternoon with ${p.n}.`}},
 date:{n:'Date night',cd:5,c:()=>Math.round(clamp(netWorth()*.0005,60,5000)),roles:['date','spouse'],fx:p=>{prel(p,rint(8,12));add('hap',4);return `Date night with ${p.n}. You remember why.`}},
 gift:{n:'Gift',cd:14,c:()=>Math.round(clamp(netWorth()*.001,50,25000)),roles:['parent','sibling','friend','date','spouse','child'],fx:p=>{prel(p,12);return `${p.n} loves it.`}},
 propose:{n:'Propose',roles:['date'],c:()=>Math.round(Math.max(3000,netWorth()*.02)),need:p=>p.rel<60?'Propose once closeness reaches 60':s.day-p.met<90?`Propose after ${90-(s.day-p.met)} more days together`:'',
  fx:p=>{if(R()<.3+p.rel/150){p.role='spouse';p.wed=s.day;prel(p,15);add('hap',15);log(`Married ${esc(p.n)}.`,'good');return `${p.n} said yes! You're married.`}prel(p,-15);add('hap',-8);return `${p.n} says they're not ready.`}},
 baby:{n:'Try for a baby',cd:60,roles:['spouse'],need:p=>kidsHome()>=4?'Four kids at home is plenty':age()>=48?'Too late for another baby':p.rel<50?'Try for a baby once closeness reaches 50':'',
  fx:()=>{if(R()<.6){const k=addChild();add('hap',12);log(`Welcome, ${esc(k.n)}!`,'good');return `It's a baby! Welcome, ${k.n}.`}return 'Not this time. You can try again in a couple of months.'}},
 ask:{n:'Ask for money',cd:180,roles:['parent'],need:p=>p.rel<40?'Ask for money once closeness reaches 40':'',fx:p=>{const v=rint(300,3000);s.cash+=v;prel(p,-8);return `${p.n} sends ${fmt(v)}, with a lecture.`}},
 reconnect:{n:'Reach out',cd:30,roles:['ex'],need:()=>partner()?'Not while you are with someone':'',fx:p=>{if(R()<.35){p.role='date';p.rel=45;p.met=s.day;return `You and ${p.n} are giving it another go.`}prel(p,-5);return `${p.n} left you on read.`}},
 split:{n:'Break up',bad:1,roles:['date'],fx:p=>endRel(p)},
 divorce:{n:'Divorce',bad:1,roles:['spouse'],fx:p=>endRel(p)},
};
const PACT_ORDER=['call','time','date','gift','propose','baby','ask','reconnect','split','divorce'];
const RANKS=['','Senior ','Lead ','Principal ','Head ','Chief '];
const BIZ=[
 {id:'lemon',n:'Lemonade Stand',cost:120,inc:3},
 {id:'truck',n:'Food Truck',cost:2000,inc:30},
 {id:'cafe',n:'Coffee Shop',cost:18000,inc:190},
 {id:'wash',n:'Car Wash',cost:150000,inc:1200},
 {id:'gym',n:'Fitness Club',cost:1.2e6,inc:7500},
 {id:'app',n:'App Studio',cost:1e7,inc:48000},
 {id:'hotel',n:'Boutique Hotel',cost:9e7,inc:320000},
 {id:'bank',n:'Private Bank',cost:8e8,inc:2.2e6},
 {id:'rocket',n:'Rocket Company',cost:9e9,inc:1.6e7},
];
const STOCKS=[
 {t:'NOVA',n:'Nova Robotics',sec:'Tech',p:120,v:.028,mu:.0007,b:1.3,pe:38,sh:2.1e+09},
 {t:'BYTE',n:'ByteHive',sec:'Tech',p:45,v:.034,mu:.0009,b:1.4,pe:55,sh:3.4e+09},
 {t:'GRNX',n:'GreenX Energy',sec:'Energy',p:30,v:.03,mu:.00075,b:1.1,pe:0,sh:8e+08},
 {t:'PETR',n:'PetroMax',sec:'Energy',p:80,v:.017,mu:.0003,b:.8,div:.035,pe:9,sh:4e+09},
 {t:'MUNC',n:'Munch Foods',sec:'Consumer',p:55,v:.012,mu:.00025,b:.6,div:.025,pe:18,sh:1.5e+09},
 {t:'LUXE',n:'Luxe Maison',sec:'Consumer',p:210,v:.02,mu:.0005,b:1,pe:27,sh:5e+08},
 {t:'MEDI',n:'MediCore',sec:'Health',p:95,v:.022,mu:.00055,b:.7,pe:22,sh:1.1e+09},
 {t:'BANC',n:'Banco Unido',sec:'Finance',p:60,v:.015,mu:.0003,b:1.1,div:.04,pe:11,sh:6e+09},
];
const SHOP=[
 {id:'bike',n:'Bicycle',cost:300,up:0,hap:.02,fame:0},
 {id:'phone',n:'Flagship phone',cost:1400,up:1,hap:.02,fame:.5},
 {id:'pc',n:'Gaming rig',cost:4000,up:2,hap:.03,fame:0},
 {id:'wardrobe',n:'Designer wardrobe',cost:25000,up:10,hap:.03,fame:3},
 {id:'art',n:'Art collection',cost:2e6,up:300,hap:.06,fame:15},
 {id:'yacht',n:'Superyacht',cost:6e7,up:15000,hap:.2,fame:70},
 {id:'jet',n:'Private jet',cost:1.5e8,up:40000,hap:.22,fame:140},
];
// property value = base × location × housing index; yld = a year's rent as a share of value; biz = investment only, can't live there
const PROPS=[
 {id:'studio',n:'Studio flat',base:90000,yld:.055,hap:.03},
 {id:'condo',n:'Two-bed condo',base:260000,yld:.05,hap:.05},
 {id:'town',n:'Townhouse',base:480000,yld:.045,hap:.07},
 {id:'house',n:'Family house',base:750000,yld:.042,hap:.09},
 {id:'beach',n:'Beach house',base:1.6e6,yld:.045,hap:.12,fame:3},
 {id:'pent',n:'Penthouse',base:4e6,yld:.035,hap:.14,fame:8},
 {id:'block',n:'Apartment block',base:1.2e7,yld:.065,biz:1},
 {id:'mansion',n:'Hilltop mansion',base:2.5e7,yld:.02,hap:.18,fame:25},
 {id:'tower',n:'Office tower',base:1.5e8,yld:.07,biz:1},
 {id:'island',n:'Private island',base:1e9,yld:.01,hap:.3,fame:350},
];
const LOCS=[['Eastgate',.8],['Old Town',.9],['Riverside',1],['Parkview',1.05],['Midtown',1.15],['Harbour',1.2],['Hillside',1.3],['Northshore',1.4]];
// dep = value lost per year (negative = gains); vol = collectible price swings per year
const CARS=[
 {id:'hatch',n:'Used hatchback',price:9000,dep:.12,up:6,hap:.03,fame:0},
 {id:'sedan',n:'Family sedan',price:32000,dep:.14,up:12,hap:.04,fame:0},
 {id:'suv',n:'Luxury SUV',price:95000,dep:.16,up:28,hap:.06,fame:.5},
 {id:'ev',n:'Electric saloon',price:120000,dep:.18,up:10,hap:.06,fame:1},
 {id:'sports',n:'Sports coupé',price:240000,dep:.15,up:80,hap:.08,fame:4},
 {id:'classic',n:'1967 classic roadster',price:180000,dep:-.05,vol:.12,up:40,hap:.07,fame:3},
 {id:'super',n:'Supercar',price:650000,dep:.12,up:200,hap:.12,fame:12},
 {id:'hyper',n:'Hypercar',price:3.2e6,dep:.06,up:800,hap:.16,fame:40},
 {id:'vintage',n:'Vintage racer',price:9e6,dep:-.06,vol:.15,up:2500,hap:.15,fame:60},
];
const ACTS=[
 {id:'gym',n:'Hit the gym',d:'+3 health, +1 looks',cd:3,c:15,fx:()=>{add('hea',3);add('loo',1);add('hap',1);return 'Good pump.'}},
 {id:'read',n:'Read a book',d:'+1.5 smarts',cd:3,c:20,fx:()=>{add('sma',1.5);return 'You feel a little smarter.'}},
 {id:'med',n:'Meditate',d:'+3 happiness',cd:2,c:0,fx:()=>{add('hap',3);return 'Inner peace, briefly.'}},
 {id:'out',n:'Night out',d:'+8 happiness, −2 health. You might make a friend.',cd:5,c:150,fx:()=>{add('hap',8);add('hea',-2);if(R()<.25&&friendsN()<10){const p=meet('friend',35);return `Great night. You made a new friend: ${p.n}.`}if(R()<.3){const f=rint(5,40)+Math.round(s.fol*.01);s.fol+=f;return `Legendary night. +${f} followers.`}return 'Great night, rough morning.'}},
 {id:'date',n:'Dating app',d:'A chance to meet someone',cd:10,c:40,show:()=>!partner(),fx:()=>{if(R()<.2+s.st.loo/250){const p=meet('date',40);add('hap',10);log(`You matched with ${esc(p.n)}. You're seeing each other.`,'good');return `It's a match with ${p.n}!`}add('hap',-2);return 'Swiped all night. Nothing.'}},
 {id:'fam',n:'Family time',d:'+5 happiness, and your family feels closer',cd:4,c:0,show:()=>s.people.some(p=>['parent','sibling','spouse','child'].includes(p.role))||s.pet,fx:()=>{for(const p of s.people)if(['parent','sibling','spouse','child'].includes(p.role))prel(p,3);add('hap',5);return 'Quality time with family.'}},
 {id:'club',n:'Join a club',d:'A good chance to make a friend',cd:30,c:200,fx:()=>{if(friendsN()<10&&R()<.7){const p=meet('friend',40);return `You joined a ${pick(['running','book','chess','climbing','board game'])} club and met ${p.n}.`}return 'Nice people, no real connection yet.'}},
 {id:'doc',n:'Doctor check-up',d:'+15 health',cd:30,c:400,fx:()=>{add('hea',15);return 'Clean bill of health.'}},
 {id:'spa',n:'Spa day',d:'+8 happiness, +2 looks',cd:14,c:600,fx:()=>{add('hap',8);add('loo',2);return 'Glowing.'}},
 {id:'trip',n:'Vacation',d:'+30 happiness, +5 health',cd:120,c:5000,fx:()=>{add('hap',30);add('hea',5);return 'Sun, sea, no emails.'}},
 {id:'surg',n:'Cosmetic surgery',d:'Usually +15 looks. Sometimes it goes wrong.',cd:365,c:25000,fx:()=>{add('hea',-5);if(R()<.85){add('loo',15);return 'Looking fresh. +15 looks.'}add('loo',-10);return 'It went… badly. -10 looks.'}},
];
const BG={
 rich:{n:'Trust-fund kid',d:'$20K head start, bad at books',cash:20000,st:{hea:80,hap:75,sma:22,loo:62}},
 street:{n:'Street hustler',d:'Tough & scrappy, $150 and a fry-cook job',cash:150,job:'crew',st:{hea:92,hap:60,sma:35,loo:50}},
 nerd:{n:'Bookworm',d:'Diploma done, office job, 65 smarts',cash:600,job:'admin',st:{hea:70,hap:55,sma:65,loo:40},edu:1},
 online:{n:'Chronically online',d:'1,500 followers and a delivery gig',cash:400,job:'rider',st:{hea:65,hap:62,sma:28,loo:70},fol:1500},
};
const NAMES=['Alex','Sam','Jordan','Riley','Casey','Kai','Mika','Rin','Ari','Noa','Remy','Jules'];
const NPC=[['@stonksguy','Stonks Guy'],['@moneymira','Mira | Money'],['@techbro_tim','tim 🚀'],['@auntie_ling','Auntie Ling'],['@gymrat_raj','Raj lifts'],['@catmom88','cat mom'],['@lowkey_lena','lena'],['@dad_jokes_dan','Dan'],['@nomad_noor','Noor ✈️'],['@quietquitter','Q. Quitter']];
const CHAT=['market is cooked and so am i','just paid $7 for a latte. this is fine','day 12 of waking up at 5am. i am so tired','whoever invented mondays owes me money','bought the dip. it kept dipping','my landlord raised rent again 🙃','hot take: renting is fine actually','who else is grinding tonight 💪','the gym at 6am is a different world','if you\'re not investing at 25 what are you doing','finally paid off my credit card!!','groceries cost HOW much now','working from a café like a main character','crypto bros are real quiet today','i have 47 tabs open and all of them are job listings','my 5 year plan is to take a nap','reminder: drink water and diversify','just got promoted and immediately got more meetings. cool.'];
const ABOUT=['{h} is lowkey inspiring ngl','anyone else following {h}? the grind is real','{h} posting again 😂 love it','ok {h} what\'s your secret','saw {h} at the café today. famous behaviour'];
const GOOD=['{n} smashes earnings expectations','{n} lands a massive government contract','analysts upgrade {n} to "strong buy"','{n} unveils a breakthrough product','{n} announces record buyback'];
const BAD=['{n} misses earnings, guidance slashed','{n} CEO resigns amid scandal','regulators open probe into {n}','{n} recalls flagship product','short seller report targets {n}'];
const POSTS={
 selfie:{n:'Selfie',q:()=>s.st.loo,tx:['new haircut who dis ✂️','golden hour hits different','gym progress 💪','outfit check 🔥','sunday vibes ☀️']},
 take:{n:'Hot take',q:()=>s.st.sma,risk:.15,tx:['unpopular opinion: breakfast is overrated','the economy is a vibe, not a science','most meetings should be emails. i said what i said','{stock} is overvalued and i will die on this hill','nobody reads the terms & conditions and that\'s the real conspiracy']},
 meme:{n:'Meme',q:()=>45,viral:.07,tx:['me: i\'ll save money this month\nalso me: *buys everything*','my bank account looking at me like 👁️👄👁️','POV: you check your stocks after lunch','nobody:\nme at 3am: what if i started a business']},
 flex:{n:'Flex',q:()=>Math.min(100,Math.log10(Math.max(1,netWorth()))*12),need:()=>netWorth()>=25000,why:'Net worth $25K+',tx:['just checked my portfolio 📈 net worth: {nw}','hard work pays off. that\'s the post.','they said i couldn\'t. i did. 🏆','new week, new money 💸']},
 shill:{n:'Promote biz',q:()=>40,need:()=>BIZ.some(b=>s.biz[b.id]?.n),why:'Own a business · +25% biz income 10d',tx:['come through to my {biz}! first 10 customers get 20% off','my {biz} is hiring! DM me','new menu at my {biz} 👀','proud of what we built at {biz} 🙌']},
};
// crypto: b = sensitivity to the crypto cycle; meme coins can moon or get rugged; the stablecoin holds $1 and pays apy
const COINS=[
 {t:'SATS',n:'Satoshi Gold',p:42000,v:.035,mu:.0008,b:1},
 {t:'GAS',n:'Gasnet',p:2400,v:.045,mu:.0011,b:1.2},
 {t:'SOLR',n:'Solar Chain',p:95,v:.06,mu:.002,b:1.4},
 {t:'LINKD',n:'Linkd Oracle',p:14,v:.06,mu:.0019,b:1.3},
 {t:'WOOF',n:'Woofcoin',p:.12,v:.08,mu:.0025,b:1.8,meme:1},
 {t:'MOON',n:'MoonCoin',p:1.2,v:.075,mu:.0026,b:2,meme:1},
 {t:'USDH',n:'Hustle Dollar',p:1,v:0,mu:0,b:0,stable:1,apy:.06},
];
const MEME=['PUG','ZAP','YOLO','GIGA','CHAD','NYAN','BLOB','HODL','WAGMI','COPE','SNEK','TURBO','BEANS','GOOB','MEOW','DEGEN','FOMO','BRRR'];
const CHIPS=[10,100,1000,1e4,1e5,1e6],RK=['','A','2','3','4','5','6','7','8','9','10','J','Q','K'],ST=['♠','♥','♦','♣'];
const SLOT=[['7',2,150],['BAR',4,40],['★',6,15],['♦',8,8],['♣',10,4]]; // symbol, reel weight, three-of-a-kind multiplier
const RED=new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]);
const GAMES=[
 {id:'bj',n:'Blackjack',edge:'0.5–2%',d:'Beat the dealer to 21 without going over. Blackjack pays 3 to 2.'},
 {id:'rl',n:'Roulette',edge:'2.7%',d:'Single-zero wheel. Bet on a colour, a dozen or one number at 35 to 1.'},
 {id:'dice',n:'Dice',edge:'2–4%',d:'Two dice. Call under 7, over 7, or exactly 7.'},
 {id:'coin',n:'Coin flip',edge:'2%',d:'Heads or tails. A right call pays 1.96×.'},
 {id:'slot',n:'Slots',edge:'about 8%',d:'Three reels. Three 7s pay 150×.'},
];
const TF={'1W':7,'1M':30,'3M':90,'All':240};
const RBETS=[['red','Red'],['black','Black'],['odd','Odd'],['even','Even'],['low','1–18'],['high','19–36'],['d1','1st 12'],['d2','2nd 12'],['d3','3rd 12']];
const GM=Object.fromEntries(GAMES.map(g=>[g.id,g]));
const EM=Object.fromEntries,JM=EM(JOBS.map(j=>[j.id,j])),BM=EM(BIZ.map(b=>[b.id,b])),SK=EM(STOCKS.map(k=>[k.t,k])),SM=EM(SHOP.map(i=>[i.id,i])),AM=EM(ACTS.map(a=>[a.id,a])),PM=EM(PROPS.map(p=>[p.id,p])),CM=EM(CARS.map(c=>[c.id,c]));

// ---------- events (choices) ----------
const EV=[
{id:'wallet',w:3,a:()=>rint(40,400),t:'Finders keepers?',d:(s,a)=>`You find a wallet on the train with <b>${fmt(a)}</b> in cash and an ID card inside.`,def:0,ch:[
 ['Return it',(s,a)=>{add('hap',6);if(R()<.4){const f=rint(40,200)+Math.round(s.fol*.05);s.fol+=f;chirp('@goodnews_daily','Good News Daily',`faith in humanity restored: ${s.handle} returned a lost wallet with ${fmt(a)} inside`,1);return `The owner posted about you. <b>+${big(f)} followers</b>.`}return 'The owner nearly cries. You feel great.'}],
 ['Keep the cash',(s,a)=>{s.cash+=a;add('hap',-4);return `+${fmt(a)}. The guilt lingers a little.`}]]},
{id:'crypto',w:2,c:s=>s.cash>500,a:s=>Math.round(s.cash*.15),t:'To the moon?',d:(s,a)=>`Your friend won't shut up about <b>$DOGGO</b>, a brand-new coin. "Put in ${fmt(a)}, trust me bro."`,def:1,ch:[
 ['Ape in',(s,a)=>{s.cash-=a;if(R()<.3){const w=a*rint(3,8);s.later.push({d:s.day+rint(20,60),k:'cash',v:w,m:'$DOGGO mooned! You cashed out'})}else s.later.push({d:s.day+rint(10,40),k:'msg',m:'$DOGGO got rugged. Your coins are worthless.'});return 'You bought the coin. Now you wait…'}],
 ['Pass',()=>'You pass. Your friend calls you "paper hands".']]},
{id:'overtime',w:3,c:s=>s.job,a:()=>Math.round(jobPay()*12),t:'Overtime offer',d:(s,a)=>`Your manager asks you to cover extra shifts for two weeks. It pays <b>${fmt(a)}</b>.`,def:1,ch:[
 ['Take the shifts',(s,a)=>{s.cash+=a;add('hea',-5);add('hap',-6);s.jobDays+=10;return `+${fmt(a)}. You're exhausted, but the boss noticed.`}],
 ['Protect my weekends',()=>{add('hap',3);return 'You enjoy your weekends.'}]]},
{id:'boss',w:2,c:s=>s.job,t:'Clash with the boss',d:()=>'Your boss takes credit for your work in a big meeting. Everyone is looking at you.',def:1,ch:[
 ['Call it out',()=>{if(R()<.5){s.rank=Math.min(s.rank+1,5);return `Leadership sides with you. Promoted to <b>${jobTitle()}</b>!`}const j=jobTitle();fire();return `You were fired from ${j}. Oof.`}],
 ['Let it slide',()=>{add('hap',-4);return 'You let it go. It stings.'}]]},
{id:'hunter',w:1.5,c:s=>s.job&&s.st.sma>45,t:'Headhunter calling',d:()=>'A recruiter wants to poach you for a rival firm with a big title bump.',def:1,ch:[
 ['Jump ship',()=>{s.rank=Math.min(s.rank+2,5);s.jobDays=0;add('hap',4);return `New gig: <b>${jobTitle()}</b> at ${fmt(jobPay())}/day.`}],
 ['Stay loyal',()=>{s.jobDays+=30;return 'Your loyalty gets noticed. Promotion is closer.'}]]},
{id:'date',w:2,c:()=>!partner(),t:'A spark',d:()=>`Someone cute from your ${pick(['gym','favourite café','building','evening class'])} asks you out to dinner.`,def:1,ch:[
 ['Say yes',()=>{if(partner())return 'The moment has passed.';if(R()<.7){const p=meet('date',45);add('hap',10);return `Dinner with ${p.n} turns into a second date. You're seeing each other now.`}add('hap',-2);return 'Awkward. Zero chemistry.'}],
 ['Not now',()=>'You politely decline.']]},
{id:'propose',w:1.5,c:()=>partner()?.role==='date'&&partner().rel>=50,a:()=>Math.max(3000,Math.round(netWorth()*.02)),t:'Put a ring on it?',d:(s,a)=>`Things are serious with ${partner()?.n||'your partner'}. A wedding would cost about <b>${fmt(a)}</b>.`,def:1,ch:[
 ['Propose',(s,a)=>{const p=partner();if(p?.role!=='date')return 'The moment has passed.';s.cash-=a;p.role='spouse';p.wed=s.day;prel(p,15);add('hap',15);return `${p.n} said yes! You're married.`}],
 ['Not yet',()=>{const p=partner();if(p&&R()<.25)return endRel(p,1);return 'You keep things as they are.'}]]},
{id:'baby',w:1.5,c:()=>partner()?.role==='spouse'&&kidsHome()<4&&age()<48,t:'Baby talk',d:()=>`${partner()?.n||'Your spouse'} brings up having ${kids().length?'another':'a'} kid. Kids cost about $35 a day until they turn 18, but bring joy every day.`,def:1,ch:[
 ['Grow the family',()=>{if(partner()?.role!=='spouse')return 'The moment has passed.';const k=addChild();add('hap',12);return `Welcome, ${k.n}!`}],
 ['Wait',()=>'Maybe later.']]},
{id:'breakup',w:()=>partner()?.rel<35?3:.4,c:()=>partner(),a:s=>Math.max(200,Math.round(s.cash*.05)),t:'Rough patch',d:(s,a)=>`You and ${partner()?.n||'your partner'} keep fighting. A getaway to reconnect costs <b>${fmt(a)}</b>.`,def:1,ch:[
 ['Book the getaway',(s,a)=>{s.cash-=a;const p=partner();if(p)prel(p,15);add('hap',8);return 'The trip works. You feel close again.'}],
 ['Let it be',()=>{const p=partner();if(p&&R()<.5)return endRel(p,1);return 'It blows over… for now.'}]]},
{id:'cheat',w:2,c:s=>s.study,t:'The answers',d:()=>"A classmate is selling the answers to next week's exam for $200.",def:1,ch:[
 ['Buy them',()=>{if(!s.study)return 'The moment has passed.';s.cash-=200;if(R()<.2){const n=schoolOf(s.study).n;s.study=null;add('hap',-15);log(`Expelled from ${n} for cheating.`,'bad');return 'You got caught. Expelled, and no refund.'}s.study.g=clamp(s.study.g+20,0,100);return 'Top marks on the exam. Nobody noticed. This time.'}],
 ['Study for real',()=>{if(s.study)s.study.g=clamp(s.study.g+4,0,100);add('hap',-2);return 'You earned that grade.'}]]},
{id:'abroad',w:1.2,c:s=>s.study&&!['online','inst'].includes(s.study.sc),a:()=>rint(4000,9000),t:'Semester abroad',d:(s,a)=>`Your school offers a semester abroad for <b>${fmt(a)}</b>.`,def:1,ch:[
 ['Go',(s,a)=>{s.cash-=a;add('hap',15);add('sma',3);if(friendsN()<10){const q=meet('friend',55);return `A semester you won't forget. You're still in touch with ${q.n}.`}return "A semester you won't forget."}],
 ['Stay home',()=>'Maybe next year.']]},
{id:'loan',w:2,c:s=>s.cash>1000&&s.people.some(p=>p.role==='friend'&&p.rel>=30),a:s=>{const p=pick(s.people.filter(p=>p.role==='friend'&&p.rel>=30));return {u:p.uid,n:p.n,v:Math.round(Math.max(300,s.cash*.05))}},t:'Can you spot me?',d:(s,a)=>`${a.n} is short on rent and asks to borrow <b>${fmt(a.v)}</b>. They swear they'll pay you back.`,def:1,ch:[
 ['Lend it',(s,a)=>{s.cash-=a.v;const p=per(a.u);if(p)prel(p,12);s.later.push(R()<.65?{d:s.day+rint(30,120),k:'cash',v:Math.round(a.v*1.1),m:`${a.n} paid you back, with a thank-you on top:`}:{d:s.day+rint(60,150),k:'msg',m:`${a.n} never paid you back.`});return `${a.n} hugs you. The money is gone for now.`}],
 ['Say no',(s,a)=>{const p=per(a.u);if(p)prel(p,-20);return `${a.n} says they understand. They don't.`}]]},
{id:'sickparent',w:1.5,c:s=>s.people.some(p=>p.role==='parent'&&ageOf(p)>60),a:s=>{const p=pick(s.people.filter(p=>p.role==='parent'&&ageOf(p)>60));return {u:p.uid,n:p.n,v:Math.round(Math.max(2000,netWorth()*.01))}},t:'A call from the hospital',d:(s,a)=>`${a.n}, your parent, is in hospital. Private care costs <b>${fmt(a.v)}</b>.`,def:2,ch:[
 ['Pay for the best care',(s,a)=>{s.cash-=a.v;const p=per(a.u);if(p){prel(p,20);p.x=(p.x||0)+3}return `${a.n} pulls through, and is grateful.`}],
 ['Visit every evening',(s,a)=>{const p=per(a.u);if(p)prel(p,12);add('hap',-4);return `You sit with ${a.n} every evening. It is hard, and it matters.`}],
 ['Too busy right now',(s,a)=>{const p=per(a.u);if(p){prel(p,-15);if(R()<.25)return parentDies(p)}return `${a.n} recovers, but noticed you weren't there.`}]]},
{id:'extext',w:1.5,c:s=>s.people.some(p=>p.role==='ex'),a:s=>{const p=pick(s.people.filter(p=>p.role==='ex'));return {u:p.uid,n:p.n}},t:'Hey stranger',d:(s,a)=>`Your ex, ${a.n}, texts you out of nowhere: “been thinking about you.”`,def:1,ch:[
 ['Text back',(s,a)=>{const pt=partner(),p=per(a.u);if(pt&&R()<.35){prel(pt,-35);add('hap',-8);return `${pt.n} saw the messages. Things are very tense at home.`}if(!pt&&p&&R()<.4){p.role='date';p.rel=50;p.met=s.day;return `One thing led to another. You and ${a.n} are back together.`}add('hap',3);return 'A little nostalgia, nothing more.'}],
 ['Leave it on read',()=>'Some doors are closed for a reason.']]},
{id:'romance',w:1.5,c:s=>s.job&&!partner(),t:'Office spark',d:()=>'A coworker keeps finding reasons to stop by your desk.',def:1,ch:[
 ['Ask them out',()=>{if(partner())return 'The moment has passed.';if(R()<.6){const p=meet('date',50);s.perf=clamp(s.perf-5,0,100);return `You and ${p.n} are seeing each other. HR does not need to know yet.`}add('hap',-5);return 'They just wanted your stapler. Awkward.'}],
 ['Keep it professional',()=>{s.perf=clamp(s.perf+4,0,100);return 'You stay focused. Your boss notices.'}]]},
{id:'wedding',w:1.5,c:s=>s.people.some(p=>p.role==='friend'||p.role==='sibling'),a:s=>{const p=pick(s.people.filter(p=>p.role==='friend'||p.role==='sibling'));return {u:p.uid,n:p.n,v:Math.round(Math.max(150,netWorth()*.002))}},t:'Save the date',d:(s,a)=>`${a.n} is getting married. A decent gift would be around <b>${fmt(a.v)}</b>.`,def:1,ch:[
 ['Go, with a gift',(s,a)=>{s.cash-=a.v;const p=per(a.u);if(p)prel(p,18);add('hap',5);if(R()<.3&&!partner()){const q=meet('date',40);return `Great wedding. You also met ${q.n} on the dance floor.`}return 'You cry during the speeches. Great wedding.'}],
 ['Skip it',(s,a)=>{const p=per(a.u);if(p)prel(p,-18);return `${a.n} noticed.`}]]},
{id:'school',w:1.2,c:()=>kids().some(k=>ageOf(k)>=5&&ageOf(k)<17&&!k.priv),a:()=>{const k=kids().find(k=>ageOf(k)>=5&&ageOf(k)<17&&!k.priv)||kids()[0];return {u:k.uid,n:k.n,v:Math.round(Math.max(20000,netWorth()*.03))}},t:'School choice',d:(s,a)=>`${a.n} could go to a private school for <b>${fmt(a.v)}</b>, or the public school down the road.`,def:1,ch:[
 ['Private school',(s,a)=>{s.cash-=a.v;const k=per(a.u);if(k){k.priv=1;prel(k,8)}return `${a.n} starts at the private school in a blazer that's too big.`}],
 ['Public school',(s,a)=>{const k=per(a.u);if(k)prel(k,3);return `${a.n} makes friends on the first day.`}]]},
{id:'anniv',w:1.2,c:()=>partner()?.role==='spouse',a:()=>Math.round(Math.max(300,netWorth()*.004)),t:'Anniversary',d:(s,a)=>`It's your anniversary with ${partner()?.n||'your spouse'}. A proper celebration costs about <b>${fmt(a)}</b>.`,def:1,ch:[
 ['Plan something special',(s,a)=>{s.cash-=a;const p=partner();if(p)prel(p,20);add('hap',6);return 'A night to remember.'}],
 ['Keep it low-key',()=>{const p=partner();if(!p)return 'Takeout for one.';if(R()<.5){prel(p,-20);return 'They were hoping for more. It shows.'}prel(p,2);return 'Takeout and a movie. Honestly perfect.'}]]},
{id:'layoffs',w:1.5,c:s=>s.job,a:()=>Math.round(jobPay()*60),t:'Layoffs coming',d:(s,a)=>`Your company is cutting jobs. HR offers <b>${fmt(a)}</b> to anyone who leaves voluntarily.`,def:1,ch:[
 ['Take the package',(s,a)=>{if(!s.job)return 'The moment has passed.';s.cash+=a;const j=jobTitle();fire();return `You leave your job as ${j} with ${fmt(a)} in your pocket.`}],
 ['Keep your head down',()=>{if(!s.job)return 'The moment has passed.';if(R()<.35-s.perf/400){const j=jobTitle();fire();add('hap',-12);return `You were laid off from ${j} anyway, without the package.`}s.perf=clamp(s.perf+5,0,100);return 'You survive the cuts. Everyone works harder now.'}]]},
{id:'conference',w:1.2,c:s=>s.job&&s.cash>2000,a:()=>rint(1500,4000),t:'Industry conference',d:(s,a)=>`There's a big conference in your field. The trip costs <b>${fmt(a)}</b>.`,def:1,ch:[
 ['Go and network',(s,a)=>{s.cash-=a;s.perf=clamp(s.perf+10,0,100);if(R()<.5&&friendsN()<10){const p=meet('friend',45);return `Your boss is impressed, and you made a friend: ${p.n}.`}return 'Your boss is impressed.'}],
 ['Stay home',()=>'You read the highlights online.']]},
{id:'inspect',w:2,c:s=>s.biz.truck?.n||s.biz.cafe?.n,a:()=>rint(500,3000),t:'Health inspector',d:(s,a)=>`An inspector finds problems at your ${s.biz.cafe?.n?'coffee shop':'food truck'}. They hint that <b>${fmt(a)}</b> would make it all go away.`,def:1,ch:[
 ['Pay the "fee"',(s,a)=>{s.cash-=a;if(R()<.25){const l=Math.round(s.fol*.15);s.fol-=l;add('hap',-8);chirp('@citynews','City News',`bribery scandal: local business owner ${s.handle} caught paying off a health inspector`,1);return `It leaked. <b>-${big(l)} followers</b>.`}return 'Problem solved. Quietly.'}],
 ['Fix it properly',(s,a)=>{s.cash-=a*1.5;return `Repairs cost ${fmt(a*1.5)}, but you sleep well.`}]]},
{id:'buyout',w:1.5,c:s=>BIZ.some(b=>(s.biz[b.id]?.n||0)>=10),a:s=>BIZ.filter(b=>(s.biz[b.id]?.n||0)>=10).pop().id,t:'Buyout offer',d:(s,a)=>`A national chain wants to buy <b>5 of your ${BM[a].n}</b> locations for <b>${fmt(buyout(a))}</b>, double what they'd cost to build.`,def:1,ch:[
 ['Sell 5',(s,a)=>{const o=s.biz[a];if(o.n<5)return 'You no longer have enough locations.';const p=buyout(a);o.spent*=(o.n-5)/o.n;o.n-=5;s.cash+=p;return `Sold for ${fmt(p)}.`}],
 ['Decline',()=>'Your empire stays intact.']]},
{id:'tip',w:2,c:s=>s.cash>1000,a:()=>pick(STOCKS).t,t:'Hot tip',d:(s,a)=>`A stranger in your DMs swears <b>$${a}</b> is about to explode. "Insider info bro, don't tell anyone."`,def:1,ch:[
 ['Buy with 20% of cash',(s,a)=>{const n=Math.floor(s.cash*.2/s.px[a].p);if(n<1)return "You can't afford a single share.";ACT.buy(a,n);s.later.push({d:s.day+rint(3,8),k:'shock',t:a,v:R()<.45?.25:-.2});return `You bought ${n} shares of $${a}. Fingers crossed.`}],
 ['Report as spam',()=>'Blocked. Probably wise.']]},
{id:'lotto',w:2,t:'Lottery ticket',d:()=>'The jackpot is at <b>$1M</b>. Tickets are $20.',def:1,ch:[
 ['Buy one',()=>{s.cash-=20;const r=R();if(r<.0008){s.cash+=1e6;add('hap',40);return 'YOU WON THE JACKPOT! <b>+$1M</b>'}if(r<.03){s.cash+=500;return 'Small prize: +$500.'}return 'Not a winner. Classic.'}],
 ['Nah',()=>'The house always wins.']]},
{id:'sick',w:2,a:()=>rint(200,1200),t:'Under the weather',d:(s,a)=>`You wake up feeling awful. A clinic visit costs <b>${fmt(a)}</b>.`,def:1,ch:[
 ['See a doctor',(s,a)=>{s.cash-=a;add('hea',8);return 'Diagnosis: rest. You bounce back fast.'}],
 ['Tough it out',()=>{add('hea',-12);add('hap',-4);return 'It drags on for weeks. Your health took a hit.'}]]},
{id:'uncle',w:.5,a:()=>rint(5000,60000),t:'Unexpected inheritance',d:(s,a)=>`A great-uncle you barely knew left you <b>${fmt(a)}</b>.`,def:0,ch:[
 ['Accept',(s,a)=>{s.cash+=a;return `+${fmt(a)}. Rest easy, uncle.`}],
 ['Donate it all',()=>{add('hap',12);s.fol+=Math.round(s.fol*.03);return 'A generous choice. You feel wonderful.'}]]},
{id:'celeb',w:1.5,c:s=>s.fol>100,t:'Celebrity quote-chirp',d:()=>`A famous ${pick(['rapper','actor','streamer','billionaire'])} quote-chirped your last post. Everyone is watching.`,def:1,ch:[
 ['Clap back',()=>{if(R()<.5){const f=Math.round(s.fol*.6+500);s.fol+=f;return `Legendary reply. <b>+${big(f)} followers</b>.`}const l=Math.round(s.fol*.2);s.fol-=l;add('hap',-8);return `You got ratio'd into oblivion. <b>-${big(l)} followers</b>.`}],
 ['Stay wholesome',()=>{const f=Math.round(s.fol*.15+100);s.fol+=f;return `Classy. <b>+${big(f)} followers</b>.`}]]},
{id:'scandal',w:1,c:s=>s.fol>5000,t:'Old chirps resurface',d:()=>'Someone dug up your cringe posts from years ago. The replies are brutal.',def:0,ch:[
 ['Apologize',()=>{const l=Math.round(s.fol*.08);s.fol-=l;return `The storm passes. <b>-${big(l)} followers</b>.`}],
 ['Double down',()=>{if(R()<.4){const f=Math.round(s.fol*.25);s.fol+=f;return `Somehow it worked. <b>+${big(f)} followers</b>.`}const l=Math.round(s.fol*.35);s.fol-=l;add('hap',-10);return `Cancelled. <b>-${big(l)} followers</b>.`}]]},
{id:'brand',w:2,c:s=>s.fol>2000,a:s=>Math.round(s.fol*.6),t:'Brand deal',d:(s,a)=>`A sketchy energy drink wants you to promote it for <b>${fmt(a)}</b>.`,def:1,ch:[
 ['Take the money',(s,a)=>{s.cash+=a;if(R()<.3){const l=Math.round(s.fol*.12);s.fol-=l;return `+${fmt(a)}, but fans called you a sellout. <b>-${big(l)} followers</b>.`}return `+${fmt(a)}. Easy money.`}],
 ['Decline',()=>{add('hap',2);return 'Integrity intact.'}]]},
{id:'gala',w:1.5,c:()=>netWorth()>1e6,a:()=>Math.round(netWorth()*.01),t:'Charity gala',d:(s,a)=>`You're invited to a charity gala. Guests are expected to pledge around <b>${fmt(a)}</b>.`,def:1,ch:[
 ['Pledge',(s,a)=>{s.cash-=a;add('hap',10);const f=Math.round(s.fol*.05+300);s.fol+=f;return `The photographers love you. +${big(f)} followers.`}],
 ['Skip it',()=>'You stay in and watch TV.']]},
{id:'midlife',w:1.5,c:()=>age()>=40&&age()<55,a:()=>rint(60000,150000),t:'Midlife crisis',d:(s,a)=>`You're feeling old. A shiny convertible costs <b>${fmt(a)}</b>…`,def:1,ch:[
 ['Buy the convertible',(s,a)=>{s.cash-=a;s.cars.push({uid:uid(),t:'sports',paid:a,v:a*.9,bought:s.day});add('hap',18);add('loo',3);return 'Wind in your hair. It is parked in your garage now.'}],
 ['Take up pottery',()=>{add('hap',6);return 'Your mugs are lopsided and you love them.'}]]},
{id:'burnout',w:4,c:s=>s.st.hap<20&&s.job,t:'Burning out',d:()=>"You can't remember the last time you felt rested. Something has to give.",def:1,ch:[
 ['Quit & recharge',()=>{fire();add('hap',30);add('hea',5);return 'You quit. The sun already feels brighter.'}],
 ['Push through',()=>{add('hea',-10);return 'You keep grinding. Your body keeps the score.'}]]},
{id:'marathon',w:1.5,c:()=>age()<60,t:'Marathon challenge',d:()=>'A friend dares you to train for a marathon together.',def:1,ch:[
 ['Lace up',()=>{add('hea',10);add('hap',5);add('loo',2);return 'You finished! Slowly. Proudly.'}],
 ['Couch it',()=>'You cheer from the couch.']]},
{id:'audit',w:1.5,c:()=>netWorth()>5e5,a:()=>Math.round(netWorth()*.004+2000),t:'Tax audit',d:(s,a)=>`The tax office wants to review your finances. A good accountant costs <b>${fmt(a)}</b>.`,def:1,ch:[
 ['Hire an accountant',(s,a)=>{s.cash-=a;return 'Everything checks out. Squeaky clean.'}],
 ['Wing it',()=>{if(R()<.5){const f=Math.max(0,s.cash*.12);s.cash-=f;add('hap',-8);return `They found errors. Fined ${fmt(f)}.`}return 'You got lucky. Nothing found.'}]]},
{id:'angel',w:1.5,c:s=>s.cash>5000,a:s=>Math.round(s.cash*.1),t:'Startup pitch',d:(s,a)=>`A college friend's startup, <b>${pick(['Snackr','Pawsome','Cloudly','Fitbuddy','Quikrent'])}</b>, asks for <b>${fmt(a)}</b> as an angel investment.`,def:1,ch:[
 ['Invest',(s,a)=>{s.cash-=a;const r=R();s.later.push(r<.2?{d:s.day+rint(200,500),k:'cash',v:a*rint(8,25),m:'The startup got acquired! Your angel stake paid'}:r<.45?{d:s.day+rint(150,400),k:'cash',v:a*1.5,m:'The startup had a modest exit. You got'}:{d:s.day+rint(100,300),k:'msg',m:'The startup shut down. Your angel money is gone.'});return 'You wire the money. Startups take time…'}],
 ['Pass',()=>'You wish them luck.']]},
{id:'robbery',w:1,c:s=>s.cash>5000&&homeP()?.t!=='mansion',a:s=>Math.round(s.cash*.05),t:'Mugged!',d:(s,a)=>`A mugger corners you and demands your phone and banking app. About <b>${fmt(a)}</b> at stake.`,def:1,ch:[
 ['Fight back',(s,a)=>{if(R()<.5){add('hap',5);return 'You scared them off! Pure adrenaline.'}s.cash-=a;add('hea',-18);return `You lost the fight and ${fmt(a)}.`}],
 ['Hand it over',(s,a)=>{s.cash-=a;add('hap',-5);return `You lost ${fmt(a)}, but you're safe.`}]]},
{id:'reunion',w:1,c:()=>age()>28,t:'High school reunion',d:()=>'Your class reunion is this weekend.',def:1,ch:[
 ['Go and flex',()=>{if(netWorth()>1e5){add('hap',10);return 'Everyone asks how you did it. You glow.'}add('hap',-6);return 'Everyone seems richer than you. Ouch.'}],
 ['Skip it',()=>'Some things are better left in the past.']]},
{id:'tenant',w:2,c:s=>s.props.some(renting),a:s=>{const p=pick(s.props.filter(renting));return {u:p.uid,n:pname(p),r:Math.round(rentOf(p)*30)}},t:'Tenant trouble',d:(s,a)=>`The tenant at your ${a.n} has stopped paying. They owe about <b>${fmt(a.r)}</b> and want more time.`,def:0,ch:[
 ['Give them a month',(s,a)=>{const p=P(a.u);if(p)p.from=s.day+30;add('hap',2);return 'No rent from that place for a month, but it was the kind thing to do.'}],
 ['Evict them',(s,a)=>{const p=P(a.u);if(!p)return 'You no longer own it.';s.cash-=2500;p.from=s.day+rint(25,45);add('hap',-3);return `Legal fees cost ${fmt(2500)}, and it sits empty until someone new moves in.`}]]},
{id:'leak',w:2,c:s=>s.props.length,a:s=>{const p=pick(s.props);return {u:p.uid,n:pname(p),f:Math.round(pval(p)*.012)}},t:'Burst pipe',d:(s,a)=>`A pipe burst at your ${a.n}. A good plumber quotes <b>${fmt(a.f)}</b>. A cheap one will do it for a third of that.`,def:1,ch:[
 ['Hire the good one',(s,a)=>{s.cash-=a.f;return 'Fixed properly. No more surprises.'}],
 ['Go cheap',(s,a)=>{s.cash-=a.f/3;if(R()<.5){const p=P(a.u);if(p)p.m*=.95;return 'The patch failed. Water damage took 5% off the value.'}return 'It held. Money saved.'}]]},
{id:'offer',w:1.2,c:s=>s.props.length,a:s=>{const p=pick(s.props);return {u:p.uid,n:pname(p),p:Math.round(pval(p)*(1.1+R()*.15))}},t:'An offer on the table',d:(s,a)=>`A developer wants your ${a.n} and offers <b>${fmt(a.p)}</b>, above market value.`,def:1,ch:[
 ['Accept',(s,a)=>{const i=s.props.findIndex(p=>p.uid===a.u);if(i<0)return 'You no longer own it.';const p=s.props[i];s.cash+=a.p-p.loan;s.props.splice(i,1);if(s.home===p.uid)s.home=null;return `Sold for ${fmt(a.p)}${p.loan?', mortgage cleared':''}.`}],
 ['Keep it',()=>'You hold on to it.']]},
{id:'dent',w:1.5,c:s=>s.cars.length,a:s=>{const c=pick(s.cars);return {u:c.uid,n:CM[c.t].n.toLowerCase(),f:Math.round(c.v*.08)}},t:'Fender bender',d:(s,a)=>`Someone reversed into your ${a.n} in a car park and drove off. Repairs cost <b>${fmt(a.f)}</b>.`,def:1,ch:[
 ['Get it fixed',(s,a)=>{s.cash-=a.f;return 'Good as new.'}],
 ['Drive it dented',(s,a)=>{const c=s.cars.find(c=>c.uid===a.u);if(c)c.v*=.8;add('hap',-3);return 'The dent takes 20% off its resale value.'}]]},
{id:'collector',w:1.2,c:s=>s.cars.some(c=>CM[c.t].vol),a:s=>{const c=s.cars.find(c=>CM[c.t].vol);return {u:c.uid,n:CM[c.t].n.toLowerCase(),p:Math.round(c.v*(1.25+R()*.4))}},t:'A collector calls',d:(s,a)=>`A collector offers <b>${fmt(a.p)}</b> for your ${a.n}, well above what it would fetch at auction.`,def:1,ch:[
 ['Sell it',(s,a)=>{const i=s.cars.findIndex(c=>c.uid===a.u);if(i<0)return 'You already sold it.';s.cars.splice(i,1);s.cash+=a.p;return `Sold for ${fmt(a.p)}.`}],
 ['Not for sale',()=>{add('hap',2);return 'Some things are worth keeping.'}]]},
{id:'chasing',w:4,c:s=>s.cz.net<-Math.max(20000,netWorth()*.1)&&s.day>=s.cz.ban,t:'Chasing losses',d:()=>`You're down <b>${fmt(-s.cz.net)}</b> at the casino, and you keep going back to win it back.`,def:1,ch:[
 ['Ban myself for a year',()=>{s.cz.ban=s.day+365;s.cz.net=0;add('hap',6);return 'The casino has your photo at the door now. It feels like a weight lifted.'}],
 ['One big win will fix it',()=>{add('hap',-6);return 'You tell yourself it is fine.'}]]},
{id:'seed',w:2,c:()=>walletVal()>2000,t:'Wallet support',d:()=>'Someone from "Hustle Wallet Support" DMs you. Your account has been flagged, they say, and they need your seed phrase to secure it.',def:1,ch:[
 ['Send the phrase',()=>{const v=walletVal();s.wallet={};add('hap',-15);return `It was a scam. They emptied your wallet: ${fmt(v)} gone.`}],
 ['Block and report',()=>'Nobody real ever asks for your seed phrase. Blocked.']]},
{id:'airdrop',w:1.5,c:s=>Object.keys(s.wallet).length,a:s=>({t:pick(s.cx.coins.filter(c=>!c.dead&&!c.stable)).t,v:rint(50,2000)}),t:'Free airdrop',d:(s,a)=>`A site says you qualify for a free <b>${fmt(a.v)}</b> of $${a.t}. You just need to connect your wallet.`,def:1,ch:[
 ['Connect and claim',(s,a)=>{if(R()<.35){const v=walletVal()*.3;for(const k in s.wallet)s.wallet[k].u*=.7;add('hap',-8);return `It was a wallet drainer. It took ${fmt(v)}.`}const c=coin(a.t);if(!c)return 'The coin is gone.';const w=s.wallet[a.t]??={u:0,c:0};w.u+=a.v/c.p;return `Legit, somehow. ${fmt(a.v)} of $${a.t} landed in your wallet.`}],
 ['Close the tab',()=>'Probably wise.']]},
{id:'pet',w:1,c:s=>!s.pet,t:'Stray kitten',d:()=>'A tiny kitten follows you home, meowing at your door.',def:0,ch:[
 ['Adopt',()=>{s.pet=1;add('hap',10);return 'You have a cat now. It owns you.'}],
 ['Take it to a shelter',()=>'It will find a good home.']]},
];
const EVM=EM(EV.map(e=>[e.id,e]));

// ---------- state ----------
const SAVE='hustle-v1',GROW=1.13,CAP=10,MILES=[10,25,50,100,150,200,300,400,500];
let helpOpen={},showAll={},openP=null,tour=-1,tourSpeed=1,tourJump=false,enr=null,iv=null,bmode='1',lastSpeed=1,lastIn=[],cg=null,tf='3M',cmode='candle',hov=null,ot={side:'buy',qty:10}; // screen state, not saved
let s=null,tab='dash',sel='NOVA',csel='SATS',speed=1,holding=false,wiped=false,heir={},hiddenAt=0;
const age=()=>s.startAge+s.day/365;
const add=(k,v)=>s.st[k]=clamp(s.st[k]+v,0,100);
const job=()=>s.job&&JM[s.job];
const jobPay=()=>job().pay*(1+.15*s.rank)*(1+(s.raise||0));
const jobTitle=()=>RANKS[Math.min(s.rank,5)]+job().n;
const promoNeed=()=>55+s.rank*5,topRank=()=>s.rank>=5;
const fire=()=>{s.job=null;s.rank=0;s.jobDays=0;s.raise=0};
const xpY=f=>(s.xp[f]||0)/365+((s.degs||[]).some(d=>d.mj&&MAJORS[d.mj]===f)?1:0),xpT=()=>Object.values(s.xp).reduce((a,d)=>a+d,0)/365;
const raiseOdds=()=>clamp((s.perf-30)/60,.05,.9);
function jobMiss(j){const m=[];if(s.edu<j.e)m.push(EDU[j.e].n);if(j.dg&&!s.degs.some(d=>d.p===j.dg))m.push(PG[j.dg].n);if(j.mj&&!s.degs.some(d=>d.mj===j.mj))m.push(`a ${j.mj} major`);if(s.st.sma<j.s)m.push(`${j.s} smarts`);if(j.h&&s.st.hea<j.h)m.push(`${j.h} health`);
  for(const f in j.x||{})if(xpY(f)<j.x[f])m.push(`${j.x[f]} yr${j.x[f]>1?'s':''} in ${FIELD[f]}`);if(j.xt&&xpT()<j.xt)m.push(`${j.xt} yrs experience`);if(j.f&&s.fol<j.f)m.push(`${big(j.f)} followers`);return m}
const jobReqText=j=>[j.dg?PG[j.dg].n:EDU[j.e].n,j.mj?`${j.mj} major`:'',j.s?`${j.s} smarts`:'',j.h?`${j.h} health`:'',...Object.entries(j.x||{}).map(([f,y])=>`${y} yr${y>1?'s':''} ${FIELD[f]}`),j.xt?`${j.xt} yrs experience`:'',j.f?`${big(j.f)} followers`:''].filter(Boolean).join(', ');
const ageOf=p=>(s.day-p.b)/365;
const per=u=>s.people.find(p=>p.uid===u);
const prel=(p,v)=>p.rel=clamp(p.rel+v,0,100);
const partner=()=>s.people.find(p=>p.role==='date'||p.role==='spouse');
const kids=()=>s.people.filter(p=>p.role==='child');
const kidsHome=()=>kids().filter(k=>ageOf(k)<18).length;
const friendsN=()=>s.people.filter(p=>p.role==='friend').length;
const peopleHap=()=>s.people.reduce((a,p)=>a+(PW[p.role]||0)*(p.rel-40)/(p.rel<40?80:60)*(p.role==='child'&&ageOf(p)>=18?.5:1),0);
const closeWord=r=>r>=80?'Very close':r>=60?'Close':r>=40?'Friendly':r>=20?'Distant':'Strained';
function meet(role,rel,b){const used=new Set(s.people.map(p=>p.n)),n=PNAMES.find(x=>!used.has(x)&&R()<.2)||pick(PNAMES);const p={uid:uid(),n,role,rel,b:b??(-s.startAge*365+rint(-4,4)*365),met:s.day,c:{}};s.people.push(p);return p}
const addChild=()=>meet('child',80,s.day);
function makeFamily(){const me=-s.startAge*365;for(let i=0;i<2;i++)meet('parent',rint(55,85),me-rint(24,38)*365);for(let i=rint(0,2);i>0;i--)meet('sibling',rint(40,75),me+rint(-6,6)*365);for(let i=rint(1,2);i>0;i--)meet('friend',rint(45,70),me+rint(-2,2)*365)}
function endRel(p,theyLeft){const sp=p.role==='spouse',who=theyLeft?`${p.n} left you. `:'';p.role='ex';p.rel=Math.min(p.rel,20);
  if(sp){const c=Math.max(0,s.cash*.4);s.cash-=c;add('hap',-20);return `${who}You and ${p.n} divorced. It cost ${fmt(c)}.`}add('hap',-12);return `${who}You and ${p.n} broke up.`}
function parentDies(p){s.people.splice(s.people.indexOf(p),1);const v=Math.round(rint(5000,40000)*(.5+p.rel/100));s.cash+=v;add('hap',-20);const m=`${p.n}, your parent, passed away at ${Math.floor(ageOf(p))}. They left you ${fmt(v)}.`;log(esc(m),'bad');toast(esc(m));return m}
function peopleDay(){
  for(const p of [...s.people]){
    p.rel=clamp(p.rel-(DECAY[p.role]||0),0,100);
    const a=ageOf(p)-(p.x||0);
    if(p.role==='child'&&!p.out&&ageOf(p)>=18){p.out=1;log(`${esc(p.n)} turns 18 and moves out.`,'good')}
    else if(p.role==='parent'&&a>68&&R()<Math.min(.5,((a-68)/25)**3*2)/365)parentDies(p);
    else if((p.role==='date'||p.role==='spouse')&&p.rel<15&&R()<.004){const m=endRel(p,1);log(esc(m),'bad');toast(esc(m))}
    else if(p.role==='friend'&&p.rel<8&&R()<.01){s.people.splice(s.people.indexOf(p),1);log(`You and ${esc(p.n)} drifted apart.`)}
  }
  if(s.job&&friendsN()<10&&R()<1/250){const p=meet('friend',35);log(`You became friends with ${esc(p.n)} from work.`,'good')}
}
const bmul=n=>2**MILES.filter(m=>n>=m).length;
const bizInc=(b,o)=>b.inc*o.n*bmul(o.n)*s.legacy*(s.day<s.boost?1.25:1);
const bcost=(b,n,q)=>b.cost*GROW**n*(GROW**q-1)/(GROW-1);
const bmax=(b,n)=>Math.floor(Math.log(s.cash*(GROW-1)/(b.cost*GROW**n)+1)/Math.log(GROW));
const buyout=id=>{const o=s.biz[id];return bcost(BM[id],Math.max(0,o.n-5),5)*2};
const shopSum=k=>SHOP.reduce((t,i)=>t+(s.own[i.id]?i[k]:0),0);
const sponsor=()=>s.fol<1000?0:s.fol*.0015*(.5+s.st.loo/100);
const MR=.055/365,MN=30*365,mpay=L=>L*MR/(1-(1+MR)**-MN);
const uid=()=>s.nid=(s.nid||0)+1;
const pval=p=>PM[p.t].base*p.m*s.re.idx;
const pname=p=>`${PM[p.t].n}, ${p.loc}`;
const P=u=>s.props.find(p=>p.uid===u);
const homeP=()=>s.home&&P(s.home);
const renting=p=>p.uid!==s.home&&s.day>=p.from;
const rentOf=p=>renting(p)?pval(p)*PM[p.t].yld/365:0;
const carSum=k=>s.cars.reduce((t,c)=>t+CM[c.t][k],0);
const bestCar=()=>s.cars.reduce((m,c)=>!m||CM[c.t].hap>CM[m.t].hap?c:m,null);
const upkeep=()=>shopSum('up')+carSum('up')+s.props.reduce((t,p)=>t+pval(p)*.01/365,0);
const expenses=()=>15+(homeP()?0:30)+kidsHome()*35+(partner()?.role==='spouse'?10:0)+upkeep();
const canBorrow=L=>{const f=flows();return mpay(L)+f.mort<=(f.job+f.biz+f.rent)*.4};
function listing(){const nw=Math.max(netWorth(),60000),ok=PROPS.filter(p=>p.base<=nw*4),[loc,m]=pick(LOCS);return {uid:uid(),t:pick(ok.slice(-4)).id,loc,m:m*(.92+R()*.16)}}
function relist(){s.re.list=Array.from({length:6},listing);s.re.next=s.day+30}
function upgrade(){ // bring older saves up to date
  if(!s.cx){s.wallet={};initCrypto();const m=s.port.MOON;if(m){s.wallet.MOON={u:m.sh,c:m.cost};delete s.port.MOON}delete s.px.MOON}
  if(!s.re){
    Object.assign(s,{props:[],cars:[],home:null,re:{idx:1,list:[],next:0}});
    for(const[k,t]of[['apt','condo'],['house','house'],['mansion','mansion'],['island','island']])if(s.own[k]){s.props.push({uid:uid(),t,loc:'Riverside',m:1,paid:PM[t].base,bought:s.day,loan:0,pay:0,from:s.day});s.home??=s.props.at(-1).uid;delete s.own[k]}
    for(const[k,t]of[['car','hatch'],['sports','sports']])if(s.own[k]){s.cars.push({uid:uid(),t,paid:CM[t].price,v:CM[t].price*.7,bought:s.day});delete s.own[k]}
    for(const k in s.own)if(!SM[k])delete s.own[k];
    relist();
  }
  s.cz??={chip:100,net:0,played:0,rh:[],ban:0};
  if(!s.degs){const lv=['dip','ba','ma','phd'];s.degs=[];for(let i=1;i<=Math.min(s.edu,4);i++)s.degs.push({p:lv[i-1],sc:i===1?'cc':'state',mj:'Business',hon:false});s.debt=0;
    if(s.study&&s.study.lvl!=null){const q=lv[s.study.lvl-1];s.study={p:q,sc:q==='dip'?'cc':'state',mj:'Business',left:s.study.left,days:PG[q].days,g:60}}}
  if(!s.people){const r=s.rel,k=s.kids||0;delete s.rel;delete s.kids;s.people=[];makeFamily();if(r)meet(r===2?'spouse':'date',65);for(let i=0;i<k;i++)addChild().b=s.day-rint(1,12)*365;
    s.xp={};if(s.job)s.xp[JM[s.job].fld]=s.jobDays;s.perf=55;s.raise=0;s.pension=0}
  if(!s.goals){s.goals={};checkGoals(1)}
}
function flows(){const f={job:(s.job?jobPay():0)+(s.pension||0),biz:0,pend:0,spon:sponsor(),exp:expenses(),rent:s.props.reduce((t,p)=>t+rentOf(p),0),mort:s.props.reduce((t,p)=>t+(p.loan>0?p.pay:0),0)+loanPay()};for(const b of BIZ){const o=s.biz[b.id];if(o?.n)f[o.mgr?'biz':'pend']+=bizInc(b,o)}return f}
const pfmt=n=>n>=1?fmt(n):'$'+(n<1e-6?n.toExponential(1):n.toPrecision(3));
const units=u=>u>=1000?big(u):u>=1?u.toFixed(2):u.toPrecision(3);
const coin=k=>s.cx.coins.find(c=>c.t===k);
const walletVal=()=>Object.entries(s.wallet).reduce((t,[k,w])=>t+w.u*(coin(k)?.p||0),0);
function initCrypto(){s.cx={bull:true,launched:0,coins:COINS.map(c=>({...c,o:c.p,h:[c.p]}))};for(let i=0;i<239;i++)cryptoDay(1)}
function cryptoDay(quiet){
  const X=s.cx;
  if(R()<(X.bull?.004:.006)){X.bull=!X.bull;if(!quiet)chirp('@coinwire','CoinWire',X.bull?'crypto is so back. green candles everywhere':'crypto winter is here. hold on to your seed phrases',1)}
  const m=(X.bull?.0012:-.0015)+gauss()*.02;
  for(const c of X.coins){
    c.o=c.p;if(!c.stable&&!c.dead)c.p=Math.max(1e-8,c.p*Math.exp(c.mu-c.v*c.v/2+m*c.b+c.v*gauss()));
    c.h.push(c.p);if(c.h.length>240)c.h.shift();
    if(c.fd&&s.day>=c.fd){const held=s.wallet[c.t];c.fd=0;
      if(c.fate==='moon'){const x=rint(5,40);c.p*=x;c.v=.1;chirp('@coinwire','CoinWire',`$${c.t} is up ${(x-1)*100}% this week and nobody knows why`,1);if(held)log(`$${c.t} mooned: up ${x}×.`,'good')}
      else{c.p*=.02;c.dead=s.day;chirp('@degen_dan','Degen Dan',`$${c.t} devs pulled the liquidity. it's over 💀`);if(held)log(`$${c.t} got rugged. Down 98%.`,'bad')}}
  }
  if(quiet)return;
  for(const c of X.coins)if(c.stable&&s.wallet[c.t])s.wallet[c.t].u*=1+c.apy/365;
  if(R()<1/45&&X.coins.filter(c=>c.meme&&!c.dead).length<7){
    let k;do k=pick(MEME)+pick(['','INU','X','AI','2']);while(coin(k));
    const p=+(10**-rint(2,5)*rint(1,9)).toPrecision(2);
    X.coins.push({t:k,n:`${k[0]+k.slice(1).toLowerCase()} ${pick(['Coin','Token','Protocol','Swap'])}`,p,o:p,h:[p],v:.13,mu:.002,b:2.5,meme:1,born:s.day,fate:R()<.22?'moon':'rug',fd:s.day+rint(15,180)});
    X.launched++;chirp('@degen_dan','Degen Dan',`$${k} just launched. still early 👀`);
  }
  X.coins=X.coins.filter(c=>!c.dead||s.wallet[c.t]||s.day-c.dead<60);
}
const rc=n=>n===0?'g':RED.has(n)?'red':'blk';
const rlMult=(k,n)=>k[0]==='n'?(+k.slice(1)===n?36:0):n===0?0:({red:RED.has(n),black:!RED.has(n),odd:n%2===1,even:n%2===0,low:n<=18,high:n>18}[k]?2:k[0]==='d'&&Math.ceil(n/12)===+k[1]?3:0);
const hsh=(a,b)=>{const x=Math.sin(a*12.9898+b*78.233)*43758.5453;return x-Math.floor(x)}; // stable pseudo-random per day
const volAt=(k,i)=>{const h=s.px[k.t].h,r=i?Math.abs(h[i]/h[i-1]-1):0;return k.sh*.004*(1+40*r)*(.6+.8*hsh(s.day-h.length+1+i,k.t.length))};
function hv(h){let t=0,a=0;for(const c of h){const r=c>>2;t+=Math.min(r,10);if(r===1)a++}return a&&t+10<=21?t+10:t}
function drawCard(){const z=s.cz;if(!z.shoe||z.shoe.length<52){z.shoe=[];for(let d=0;d<6;d++)for(let c=4;c<56;c++)z.shoe.push(c);for(let i=z.shoe.length-1;i>0;i--){const j=Math.floor(R()*(i+1));[z.shoe[i],z.shoe[j]]=[z.shoe[j],z.shoe[i]]}}return z.shoe.pop()}
function slotSpin(){const W=SLOT.reduce((t,x)=>t+x[1],0),r=[0,0,0].map(()=>{let k=R()*W;for(const x of SLOT)if((k-=x[1])<0)return x[0];return SLOT[0][0]}),[a,b,c]=r;
  return {r,m:a===b&&b===c?SLOT.find(x=>x[0]===a)[2]:a===b||b===c||a===c?.7:0}}
function stake(){const z=s.cz;if(s.day<z.ban||s.cash<z.chip)return 0;s.cash-=z.chip;return z.chip}
function settle(bet,ret,game,key){const z=s.cz,d=ret-bet,r=(z.g??={})[key]??={n:0,net:0};r.n++;r.net+=d;s.cash+=ret;z.net+=d;z.played++;add('hap',d>0?2:d<0?-1:0);if(Math.abs(d)>=Math.max(1e5,netWorth()*.05))log(`${d>0?'Won':'Lost'} ${fmt(Math.abs(d))} at ${game}.`,d>0?'good':'bad')}
function bjEnd(){const b=s.cz.bj,p=hv(b.p),nat=b.p.length===2&&p===21;
  if(p<21||(p===21&&!nat))while(hv(b.d)<17)b.d.push(drawCard());
  const d=hv(b.d),dnat=b.d.length===2&&d===21;
  const ret=p>21?0:nat&&!dnat?b.bet*2.5:dnat&&!nat?0:d>21||p>d?b.bet*2:p===d?b.bet:0;
  b.msg=p>21?'Bust.':nat&&!dnat?'Blackjack! Paid 3 to 2.':dnat&&!nat?'Dealer has blackjack.':ret>b.bet?(d>21?'Dealer busts. You win.':'You win.'):ret===b.bet?'Push. Your bet comes back.':'Dealer wins.';
  b.done=1;settle(b.bet,ret,'blackjack','bj')}
function netWorth(){let w=s.cash;for(const t in s.port)w+=s.port[t].sh*s.px[t].p;for(const id in s.biz)w+=s.biz[id].spent*.5;for(const id in s.own)w+=SM[id].cost*.6;for(const p of s.props)w+=pval(p)-p.loan;for(const c of s.cars)w+=c.v;return w+walletVal()-(s.debt||0)}
function log(t,k='info'){s.log.unshift({d:s.day,t,k});if(s.log.length>80)s.log.pop()}
function chirp(h,n,x,v){s.feed.unshift({h,n,x,v,l:0,tl:rint(3,40)*(v?40:1),d:s.day});if(s.feed.length>60)s.feed.pop()}
function toast(m){const t=document.createElement('div');t.className='toast';t.innerHTML=m;$('#toasts').append(t);setTimeout(()=>t.remove(),2800)}

function newGame(name,bg,h={}){
  const b=BG[bg];
  s={v:1,name,handle:'@'+(name.toLowerCase().replace(/[^a-z0-9]/g,'').slice(0,15)||'you'),day:0,startAge:18,cash:b.cash+(h.inherit||0),st:{...b.st},edu:b.edu||0,study:null,
     job:b.job||null,jobDays:0,rank:0,biz:{},port:{},px:{},mkt:{bull:true},fol:b.fol||0,feed:[],own:{},people:[],degs:b.edu?[{p:'dip',sc:'cc',mj:'Computer science',hon:false}]:[],debt:0,xp:{},perf:50,raise:0,pension:0,wallet:{},cz:{chip:100,net:0,played:0,rh:[],ban:0},props:[],cars:[],home:null,re:{idx:1,list:[],next:0},cd:{},inbox:[],later:[],log:[],pet:0,
     gen:h.gen||1,boost:0,lastPost:0,dead:0,lastSeen:Date.now(),goals:{...h.goals}};
  s.legacy=1+.25*(s.gen-1);
  if(h.gen){s.st.sma=Math.round(s.st.sma*.7+h.sma*.3);s.st.loo=Math.round(s.st.loo*.7+h.loo*.3)} // a little of the family runs in the blood
  if(h.kid){s.startAge=h.age;add('hap',(h.rel-50)*.3)}
  for(const k of STOCKS)s.px[k.t]={p:k.p,o:k.p,h:[k.p]};
  for(let i=0;i<239;i++)marketDay(1);
  initCrypto();relist();
  if(h.fam){for(const p of h.fam)s.people.push({...p,uid:uid(),met:0,c:{}});for(let i=rint(1,2);i>0;i--)meet('friend',rint(45,70),-s.startAge*365+rint(-2,2)*365)}else makeFamily();
  log(h.kid?`${esc(name)}, ${Math.floor(s.startAge)}, takes over from ${esc(h.last)} with a ${fmt(h.inherit)} inheritance. Generation ${s.gen} begins.`:h.gen?`${esc(name)} begins generation ${s.gen} with a ${fmt(h.inherit)} inheritance.`:`${esc(name)} turns 18 and moves out. Time to hustle.`,'good');
  chirp('@hustleculture','Hustle Culture','new week, new grind. what are you building? 👇',1);
}

// ---------- simulation ----------
function day(){
  s.day++;const A=age(),f=flows();
  s.cash+=f.job+f.biz+f.spon+f.rent-f.exp-f.mort;
  if(s.debt>0){s.debt=Math.max(0,s.debt*(1+.06/365)-loanPay());if(s.debt<1){s.debt=0;log('Student loans paid off.','good')}}
  for(const p of s.props)if(p.loan>0){p.loan-=p.pay-p.loan*MR;if(p.loan<=1){p.loan=p.pay=0;log(`Paid off the mortgage on your ${pname(p)}.`,'good')}}
  s.re.idx*=Math.exp((s.mkt.bull?.00016:-.0001)+.0035*gauss());
  for(const c of s.cars){const k=CM[c.t];c.v=Math.max(k.price*.08,c.v*Math.exp(-k.dep/365+(k.vol?k.vol/19.1*gauss():0)))}
  if(s.day>=s.re.next)relist();
  for(const b of BIZ){const o=s.biz[b.id];if(o?.n&&!o.mgr){const g=bizInc(b,o);o.pend=Math.min(o.pend+g,g*CAP)}}
  if(s.cash<0){s.cash*=1.0003;add('hap',-.05)}
  if(s.job){const J=job();s.jobDays++;s.xp[J.fld]=(s.xp[J.fld]||0)+1;
    s.perf=clamp(s.perf+((40+s.st.sma*.3+(s.st.hap-50)*.2-J.str*2)-s.perf)*.02,0,100);
    if(s.jobDays%120===0&&!topRank()){if(s.perf>=promoNeed()){s.rank++;s.perf-=10;log(`Promoted to <b>${jobTitle()}</b>! Now ${fmt(jobPay())} a day.`,'good');toast('Promotion!')}else log(`Passed over for promotion. You needed a performance of ${promoNeed()}.`,'bad')}
    if(s.perf<20&&R()<.01){const j=jobTitle();fire();add('hap',-15);log(`Fired from ${j} for poor performance.`,'bad');toast(`Fired from ${j}.`)}}
  peopleDay();
  if(s.study){const st=s.study,P=PG[st.p];st.left--;st.g=clamp(st.g+((40+s.st.sma*.4+(s.st.hap-50)*.2)-st.g)*.02,0,100);if(P.stipend)s.cash+=P.stipend;
    if(st.left<=0){if(st.g<30){st.left=60;st.g=45;log(`Failed the final exams for ${degName(st)}. One more term.`,'bad');toast('Failed the finals. One more term.')}else graduate()}}
  const J=job();
  // stats drift toward a baseline, so an idle life is dull but survivable; choices push you above or below it
  add('hap',(50-s.st.hap)*.004-(J?J.str*.02:0)-(s.study&&s.study.sc!=='online'?.03:0)+peopleHap()+s.pet*.015+shopSum('hap')+(PM[homeP()?.t]?.hap||0)+(bestCar()?CM[bestCar().t].hap:0));
  add('hea',(85-Math.max(0,A-35)*1.2-s.st.hea)*.003+(s.st.hap>70?.01:0)-(s.st.hap<15?.04:0));
  if(A>30)add('loo',-.004);
  s.fol+=shopSum('fame')+carSum('fame')+s.props.reduce((t,p)=>t+(PM[p.t].fame||0),0);if(s.day-s.lastPost>30)s.fol*=.999;
  for(const p of s.feed)if(p.l<p.tl)p.l+=Math.ceil((p.tl-p.l)*.35);
  if(R()<.3)npcChatter();
  marketDay();cryptoDay();
  if(s.day%91===0)dividends();
  if(s.day%7===0){(s.nwh??=[]).push(Math.round(netWorth()));if(s.nwh.length>104)s.nwh.shift()}
  s.later=s.later.filter(p=>p.d>s.day||(runLater(p),false));
  s.inbox=s.inbox.filter(it=>{if(s.day-it.d<30)return true;const e=EVM[it.id];if(!e.c||e.c(s))log(`<b>${e.t}</b> ${e.ch[e.def][1](s,it.a)}<span class="auto">decided for you</span>`);return false});
  if(s.inbox.length<3&&R()<1/28)newEvent();
  const pd=s.st.hea<=0?1:A>60?Math.min(.5,((A-60)/30)**3*3)/365:0;
  if(R()<pd)die();else checkGoals();
}
function marketDay(quiet){
  const M=s.mkt;
  if(R()<(M.bull?.003:.008)){M.bull=!M.bull;if(!quiet)chirp('@MarketWire','MarketWire',M.bull?'analysts call it: a new bull market has begun.':'stocks slide as recession fears grow. bear market territory.',1)}
  const m=(M.bull?.0005:-.0008)+gauss()*.007,sec={};
  for(const k of STOCKS){sec[k.sec]??=gauss()*.006;const q=s.px[k.t];q.o=q.p;q.p=Math.max(.01,q.p*Math.exp(k.mu-k.v*k.v/2+m*k.b+sec[k.sec]+k.v*gauss()));q.h.push(q.p);if(q.h.length>240)q.h.shift()}
  if(quiet)return;
  if(R()<.0006)crash();else if(R()<.05)news();
}
function shock(t,p){const q=s.px[t];q.p=Math.max(.01,q.p*(1+p));q.h[q.h.length-1]=q.p}
function news(){const k=pick(STOCKS),up=R()<.55,p=(up?1:-1)*(.06+R()*.16);shock(k.t,p);chirp('@MarketWire','MarketWire',`$${k.t} ${up?'▲':'▼'} ${Math.abs(p*100).toFixed(0)}% — ${pick(up?GOOD:BAD).replace('{n}',k.n)}`,1)}
function crash(){s.mkt.bull=false;s.re.idx*=.9;for(const c of s.cx.coins)if(!c.stable)c.p*=.7;for(const k of STOCKS)shock(k.t,-(.12+R()*.2));chirp('@MarketWire','MarketWire','FLASH CRASH: markets plunge across the board',1);log('The stock market crashed!','bad');toast('Market crash!')}
function dividends(){let t=0;for(const k of STOCKS){const h=s.port[k.t];if(h&&k.div)t+=h.sh*s.px[k.t].p*k.div/4}if(t>0){s.cash+=t;log(`Dividends paid: ${fmt(t)}`,'good')}}
function npcChatter(){const[h,n]=pick(NPC);chirp(h,n,s.fol>300&&R()<.15?pick(ABOUT).replace('{h}',s.handle):pick(CHAT))}
function runLater(p){
  if(p.k==='cash'){s.cash+=p.v;log(`${p.m} ${fmt(p.v)}`,'good');toast(`${p.m} ${fmt(p.v)}`)}
  else if(p.k==='shock'){shock(p.t,p.v);chirp('@MarketWire','MarketWire',`$${p.t} ${p.v>0?'rips':'tanks'} ${Math.round(Math.abs(p.v)*100)}% on rumors`,1)}
  else{log(p.m,'bad');toast(p.m)}
}
function newEvent(){
  const W=e=>typeof e.w==='function'?e.w(s):e.w,ok=EV.filter(e=>(!e.c||e.c(s))&&!s.inbox.some(i=>i.id===e.id));
  let r=R()*ok.reduce((t,e)=>t+W(e),0);
  for(const e of ok)if((r-=W(e))<=0){s.inbox.push({id:e.id,d:s.day,a:e.a?e.a(s):0});toast('A new decision is waiting');return}
}
function die(){s.dead=1;log(`${esc(s.name)} passed away at ${Math.floor(age())}.`,'bad');save();deathModal()}

// ---------- goals: a family trophy case, kept across generations ----------
const nOwned=()=>BIZ.filter(b=>s.biz[b.id]?.n).length,maxBiz=()=>Math.max(0,...Object.values(s.biz).map(o=>o.n)),has=c=>[c?1:0,1];
const GOALS=[
 {id:'biz1',n:'Open for business',d:'Open your first business',p:()=>[nOwned(),1]},
 {id:'nw1',n:'Six figures',d:'Reach a net worth of $100K',p:()=>[netWorth(),1e5],m:1},
 {id:'grad',n:'Graduate',d:"Earn a bachelor's degree",p:()=>has(s.edu>=2)},
 {id:'wed',n:'Tie the knot',d:'Get married',p:()=>has(s.people.some(p=>p.role==='spouse'))},
 {id:'home',n:'Homeowner',d:'Live in a home with no mortgage on it',p:()=>has(homeP()&&homeP().loan<=0)},
 {id:'mgr3',n:'Delegate',d:'Have managers running 3 businesses',p:()=>[Object.values(s.biz).filter(o=>o.mgr).length,3]},
 {id:'pay',n:'Four figures a day',d:'Earn a $1K a day salary',p:()=>[s.job?jobPay():0,1000],m:1},
 {id:'nw2',n:'Millionaire',d:'Reach a net worth of $1M',p:()=>[netWorth(),1e6],m:1},
 {id:'honors',n:'With honors',d:'Graduate with a grade of A',p:()=>has(s.degs.some(d=>d.hon))},
 {id:'stocks',n:'Diversified',d:`Hold all ${STOCKS.length} stocks at once`,p:()=>[STOCKS.filter(k=>s.port[k.t]?.sh>0).length,STOCKS.length]},
 {id:'kids3',n:'Full house',d:'Have 3 kids',p:()=>[kids().length,3]},
 {id:'close5',n:'Inner circle',d:'Be very close (80+) to 5 people',p:()=>[s.people.filter(p=>p.rel>=80).length,5]},
 {id:'fol1',n:'Influencer',d:'Reach 100K followers',p:()=>[s.fol,1e5]},
 {id:'top',n:'Top of the ladder',d:'Reach the highest rank in any job',p:()=>has(s.job&&topRank())},
 {id:'landlord',n:'Landlord',d:'Own 5 properties',p:()=>[s.props.length,5]},
 {id:'cars',n:'Car collector',d:'Own 3 cars at once',p:()=>[s.cars.length,3]},
 {id:'casino',n:'Beat the house',d:'Be $100K up at the casino overall',p:()=>[Math.max(0,s.cz.net),1e5],m:1},
 {id:'peak',n:'Peak form',d:'Get all four stats to 80 at once',p:()=>[Math.min(...Object.values(s.st)),80]},
 {id:'doctor',n:'Doctor',d:'Finish a PhD or medical school',p:()=>has(s.degs.some(d=>d.p==='phd'||d.p==='md'))},
 {id:'crypto',n:'Crypto whale',d:'Hold $1M in crypto',p:()=>[walletVal(),1e6],m:1},
 {id:'biz100',n:'Chain',d:'Own 100 of one business',p:()=>[maxBiz(),100]},
 {id:'pension',n:'Well earned',d:'Retire on a pension',p:()=>has(s.pension>0)},
 {id:'fol2',n:'Household name',d:'Reach 1M followers',p:()=>[s.fol,1e6]},
 {id:'nw3',n:'Nine figures',d:'Reach a net worth of $100M',p:()=>[netWorth(),1e8],m:1},
 {id:'rocket',n:'To the moon',d:'Open a Rocket Company',p:()=>has(s.biz.rocket?.n)},
 {id:'old',n:'Long life',d:'Live to 85',p:()=>[age(),85]},
 {id:'gen3',n:'Dynasty',d:'Reach the third generation',p:()=>[s.gen,3]},
 {id:'nw4',n:'Billionaire',d:'Reach a net worth of $1B',p:()=>[netWorth(),1e9],m:1},
];
function checkGoals(quiet){
  const got=GOALS.filter(g=>{if(s.goals[g.id])return false;const[c,t]=g.p();return c>=t});
  for(const g of got){s.goals[g.id]={who:s.name,a:Math.floor(age()),gen:s.gen};if(!quiet)log(`Goal reached: <b>${g.n}</b>. ${g.d}.`,'good')}
  if(quiet){if(got.length)log(`${got.length} goal${got.length>1?'s':''} already reached. See them on Home.`,'good')}
  else if(got.length)toast(got.length>1?`${got.length} goals reached`:`Goal reached: ${got[0].n}`);
}
const goalsLeft=()=>GOALS.filter(g=>!s.goals[g.id]).map(g=>{const[c,t]=g.p();return {g,c,t}});
const goalProg=(g,c,t)=>t===1&&!g.m?'<span class="mut">Not yet</span>':`${meter(clamp(c/t,0,1)*100)}<span class="num">${goalAmt(g,c)} / ${goalAmt(g,t)}</span>`;
const goalAmt=(g,v)=>g.m?fmt(v):g.id==='old'||g.id==='peak'||g.id==='gen3'?Math.floor(v):big(Math.floor(v));

// ---------- the heir: one of your kids, or a relative if you had none ----------
function heirOf(k){
  const h={inherit:Math.max(0,netWorth()*.5),gen:s.gen+1,last:s.name,goals:s.goals,sma:s.st.sma,loo:s.st.loo};
  if(!k)return h;
  const skip=Math.max(0,18*365-(s.day-k.b)),carry=p=>({n:p.n,b:p.b-s.day-skip,rel:(p.rel+k.rel)/2});
  return {...h,kid:k.n,age:(s.day-k.b+skip)/365,rel:k.rel,
    fam:[...s.people.filter(p=>p.role==='spouse').map(p=>({...carry(p),role:'parent'})),...kids().filter(p=>p!==k).map(p=>({...carry(p),role:'sibling'}))]};
}
function offline(ms){
  const sec=Math.min(ms,8*36e5)/1000;if(sec<60)return;
  let g=0;for(const b of BIZ){const o=s.biz[b.id];if(!o?.n)continue;const i=bizInc(b,o);if(o.mgr)g+=i;else o.pend=Math.min(i*CAP,o.pend+i*sec*.1)}
  const earn=g*sec*.1;if(earn<1)return; // ponytail: offline = 10% of real-time managed income, no aging, 8h cap
  s.cash+=earn;log(`Your managers earned ${fmt(earn)} while you were away.`,'good');
  modal(`<h2>While you were out</h2><p>You were away for <b>${dur(sec)}</b>. Your managers kept the lights on and earned <b class="num">${fmt(earn)}</b>.</p><button class="pri" data-a="close">Nice</button>`);
}
const dur=sec=>sec<3600?`${Math.round(sec/60)}m`:`${Math.floor(sec/3600)}h ${Math.round(sec%3600/60)}m`;

// ---------- actions ----------
const ACT={
  tab:x=>{tab=x;const g=BAR.findIndex(b=>b[1].includes(x));if(g>=0)lastIn[g]=x;$('#view').scrollTop=0;if(innerWidth<=860)scrollTo(0,0)},
  grp:x=>{const ks=BAR[+x][1];ACT.tab(ks.includes(tab)?tab:lastIn[+x]||ks[0])},
  spd:x=>{if(speed)lastSpeed=speed;speed=+x},
  bmode:x=>{bmode=x},
  gobj:()=>{ACT.tab('casino');cg='bj'},
  pick:(id,c)=>{const i=s.inbox.findIndex(x=>x.id===id);if(i<0)return;const it=s.inbox.splice(i,1)[0],e=EVM[id],msg=e.c&&!e.c(s)?'The moment has passed.':e.ch[+c][1](s,it.a);log(`<b>${e.t}</b> ${msg}`);toast(msg)},
  sel:x=>sel=x,
  close:()=>closeModal(),
  act:id=>{const a=AM[id];if(s.day<(s.cd[id]||0)||s.cash<a.c)return;s.cash-=a.c;s.cd[id]=s.day+a.cd;toast(a.fx())},
  learn:id=>{const P=PG[id];if(!P||s.study||progMiss(P).length)return;enr={p:id,mj:P.mj?'Business':null};modal(enrHtml(),1)},
  mj:x=>{if(!enr)return;enr.mj=x;modal(enrHtml(),1)},
  enroll:(sid,pay)=>{const P=PG[enr?.p];if(!P||s.study||progMiss(P).length)return;const sc=schoolsFor(P).find(x=>x.id===sid);if(!sc)return;let c=tuition(P,sc);if(pay==='cash'&&s.cash<c)return;
    if(R()>admOdds(P,sc)){s.cd[`adm_${P.id}_${sid}`]=s.day+180;closeModal();log(`${sc.n} turned down your application.`,'bad');toast(`${sc.n} said no. You can reapply in 180 days.`);return}
    let sch='';if(sc.adm&&c&&s.st.sma>=sc.adm+10&&R()<.4){c=Math.round(c/2);sch=' with a half scholarship'}
    if(pay==='cash')s.cash-=c;else s.debt=(s.debt||0)+c;
    const days=Math.round(P.days*(sc.slow||1));s.study={p:P.id,sc:sid,mj:P.mj?enr.mj:null,left:days,days,g:60};closeModal();
    log(`Accepted at ${sc.n}${sch}. Studying for ${degName(s.study)}.`,'good');toast(`Accepted at ${sc.n}${sch}!`)},
  study:k=>{const A=STUDY[k];if(!s.study||s.day<(s.cd['s_'+k]||0)||s.cash<(A.c||0))return;s.cash-=A.c||0;s.cd['s_'+k]=s.day+A.cd;toast(A.fx())},
  dropout:x=>{if(!s.study)return;if(x!=='yes')return modal(`<h2>Drop out of ${degName(s.study)}?</h2><p>You won't get your tuition back, and any student loan stays.</p><div class="row"><button class="bad" data-a="dropout" data-x="yes">Drop out</button><button data-a="close">Keep studying</button></div>`);log(`Dropped out of ${degName(s.study)}.`,'bad');s.study=null;closeModal()},
  payloan:()=>{if(!s.debt||s.cash<s.debt)return;s.cash-=s.debt;s.debt=0;log('Paid off your student loans.','good')},
  help:()=>modal(`<p class="kicker">Help and settings</p><h2>The Hustle</h2><div class="choices"><button data-a="guide2">Replay the guide</button><button class="bad" data-a="reset">Start a new life</button><button class="pri" data-a="close">Back to the game</button></div>
    <h3 style="margin-top:var(--space-lg)">Keyboard</h3><table class="ledger"><tbody><tr><td class="num">1 to 0</td><td>Switch screens</td></tr><tr><td>Space</td><td>Pause or resume</td></tr><tr><td>C</td><td>Collect every till</td></tr><tr><td>?</td><td>Replay the guide</td></tr><tr><td>Esc</td><td>Close the guide</td></tr></tbody></table>`),
  guide2:()=>{closeModal();ACT.guide()},
  howto:()=>{helpOpen[tab]=!helpOpen[tab]},
  showall:()=>{showAll[tab]=!showAll[tab]},
  pmore:x=>{openP=openP===+x?null:+x},
  guide:()=>{if(tour<0){tourSpeed=speed||lastSpeed||1;speed=0}tour=0;ACT.tab(TOUR[0].tab);tourJump=true},
  tnext:()=>{if(tour>=TOUR.length-1)return ACT.tend();tour++;ACT.tab(TOUR[tour].tab);tourJump=true},
  tback:()=>{if(tour>0){tour--;ACT.tab(TOUR[tour].tab);tourJump=true}},
  tend:()=>{if(tour<0)return;tour=-1;s.tour=1;speed=tourSpeed;coach()},
  tskip:()=>{s.tour=1},
  apply:id=>{const j=JM[id];if(!canJob(j)||s.day<(s.cd['job_'+id]||0))return;iv={id,q:pick(IVQ)};modal(ivHtml())},
  answer:k=>{const j=JM[iv.id],ch=ivOdds(j,k);closeModal();
    if(R()<ch){s.job=j.id;s.rank=0;s.jobDays=0;s.perf=50;s.raise=k==='pay'?.1:0;log(`Hired as <b>${j.n}</b>${k==='pay'?' at 10% over the posted pay':''}.`,'good');toast(`You got the job: ${j.n}`)}
    else{s.cd['job_'+j.id]=s.day+30;log(`${j.n}: they went with someone else.`,'bad');toast(`No offer after the ${j.n} interview. You can reapply in 30 days.`)}},
  work:k=>{const W=WORK[k];if(!s.job||s.day<(s.cd['w_'+k]||0)||s.cash<(W.c||0))return;s.cash-=W.c||0;s.cd['w_'+k]=s.day+W.cd;toast(W.fx())},
  retire:()=>{if(!s.job||age()<55)return;s.pension=(s.pension||0)+jobPay()*.45;const j=jobTitle();fire();log(`Retired from ${j} with a pension of ${fmt(s.pension)} a day.`,'good')},
  pp:(u,k)=>{const sure=k.endsWith('!');k=k.replace('!','');const p=per(+u),A=PACTS[k];if(!p||!A||!A.roles.includes(p.role))return;
    if(A.bad&&!sure)return modal(`<h2>${A.n} with ${esc(p.n)}?</h2><p>${k==='divorce'?`Lawyers and the settlement will cost about <b class="num">${fmt(Math.max(0,s.cash*.4))}</b>.`:'This cannot be undone.'}</p><div class="row"><button class="bad" data-a="pp" data-x="${p.uid}" data-y="${k}!">${A.n}</button><button data-a="close">Cancel</button></div>`);
    const cost=A.c?A.c(p):0;if((p.c?.[k]||0)>s.day||s.cash<cost||A.need?.(p))return;
    s.cash-=cost;(p.c??={})[k]=s.day+(A.cd||0);const m=A.fx(p);if(sure)closeModal();toast(esc(m));if(A.bad)log(esc(m),'bad')},
  quit:()=>{log(`Quit your job as ${jobTitle()}.`);fire()},
  gig:()=>{s.cash+=gig();s.gigs=(s.gigs||0)+1},
  bbuy:(id,x)=>{const b=BM[id],o=s.biz[id]??={n:0,mgr:0,pend:0,spent:0},q=x==='max'?bmax(b,o.n):+x;if(q<1)return;const c=bcost(b,o.n,q);if(c>s.cash)return;
    const first=!o.n;s.cash-=c;o.spent+=c;const before=bmul(o.n);o.n+=q;
    if(first){log(`Opened your first ${b.n}`,'good');if(s.fol>100&&R()<.6)chirp(...pick(NPC),`just walked past ${s.handle}'s new ${b.n.toLowerCase()} ${pick(['love to see it','entrepreneur arc','the grind pays'])}`)}
    if(bmul(o.n)>before){log(`${b.n} milestone: ${o.n} units → income ×${bmul(o.n)}!`,'good');toast(`${b.n} income doubled`)}},
  mgr:id=>{const b=BM[id],o=s.biz[id],c=b.cost*12;if(!o||o.mgr||s.cash<c)return;s.cash-=c;o.spent+=c;o.mgr=1;s.cash+=o.pend;o.pend=0;log(`Hired a manager for your ${b.n}. It runs itself now.`,'good')},
  col:id=>{const o=s.biz[id];s.cash+=o.pend;o.pend=0},
  colAll:()=>{for(const id in s.biz){s.cash+=s.biz[id].pend;s.biz[id].pend=0}},
  buy:(t,x)=>{const p=s.px[t].p,n=x==='max'?Math.floor(s.cash/p):+x;if(n<1||n*p>s.cash)return;const h=s.port[t]??={sh:0,cost:0};h.sh+=n;h.cost+=n*p;s.cash-=n*p;log(`Bought ${big(n)} $${t} @ ${fmt(p)}`)},
  sell:(t,x)=>{const h=s.port[t];if(!h?.sh)return;const n=x==='all'?h.sh:Math.min(h.sh,+x),p=s.px[t].p,basis=h.cost*n/h.sh,g=n*p-basis;
    h.cost-=basis;h.sh-=n;s.cash+=n*p;log(`Sold ${big(n)} $${t} @ ${fmt(p)} (${g>=0?'+':''}${fmt(g)})`,g>=0?'good':'bad');if(!h.sh)delete s.port[t]},
  post:k=>{const P=POSTS[k];if(s.day<(s.cd.post||0)||(P.need&&!P.need()))return;
    const q=P.q()/100,viral=R()<(P.viral||.025),bad=P.risk&&R()<P.risk;
    let reach=(s.fol*.1+80)*(.4+q)*(.6+R()*.8);if(viral)reach*=8+R()*20;
    const gain=Math.round(bad?-s.fol*.03-5:reach*.07*(.5+q));s.fol=Math.max(0,s.fol+gain);
    const bz=BIZ.filter(b=>s.biz[b.id]?.n).pop();
    const x=pick(P.tx).replace('{nw}',fmt(netWorth())).replace('{stock}','$'+pick(STOCKS).t).replace('{biz}',bz?bz.n.toLowerCase():'business');
    s.feed.unshift({h:s.handle,n:s.name,x,me:1,l:0,tl:Math.round(reach*(bad?.1:.3)),d:s.day,tag:bad?"ratio'd":viral?'went viral':'',bad:bad?1:0});
    if(k==='shill')s.boost=s.day+10;
    s.cd.post=s.day+4;s.lastPost=s.day;add('hap',bad?-5:2);
    toast(`${P.n}: ${gain>=0?'+':''}${big(gain)} followers${viral?', it went viral':bad?', and it backfired':''}`);
    if(viral)log(`Your ${P.n.toLowerCase()} went viral! +${big(gain)} followers`,'good')},
  pbuy:(u,x)=>{const i=s.re.list.findIndex(l=>l.uid===+u);if(i<0)return;const l=s.re.list[i],v=PM[l.t].base*l.m*s.re.idx,mort=x==='m';
    if(s.cash<(mort?v*.2:v)||(mort&&!canBorrow(v*.8)))return;
    s.cash-=mort?v*.2:v;const p={...l,paid:v,bought:s.day,loan:mort?v*.8:0,pay:mort?mpay(v*.8):0,from:s.day+rint(5,20)};
    s.props.push(p);s.re.list.splice(i,1,listing());if(!homeP()&&!PM[p.t].biz)s.home=p.uid;add('hap',5);
    log(`Bought ${art(pname(p))} for ${fmt(v)}${mort?' with a mortgage':''}${s.home===p.uid?', and moved in':''}.`,'good')},
  live:u=>{const p=P(+u);if(!p||PM[p.t].biz)return;const o=homeP();if(o)o.from=s.day+rint(5,20);s.home=p.uid;log(`Moved into your ${pname(p)}.`)},
  moveout:u=>{const p=P(+u);if(!p||s.home!==p.uid)return;s.home=null;p.from=s.day+rint(5,20);log(`Moved out of your ${pname(p)}. It goes up for rent.`)},
  payoff:u=>{const p=P(+u);if(!p?.loan||s.cash<p.loan)return;s.cash-=p.loan;p.loan=p.pay=0;log(`Paid off the mortgage on your ${pname(p)}.`,'good')},
  psell:u=>{const i=s.props.findIndex(p=>p.uid===+u);if(i<0)return;const p=s.props[i],v=pval(p);s.cash+=v*.97-p.loan;s.props.splice(i,1);if(s.home===p.uid)s.home=null;
    log(`Sold your ${pname(p)} for ${fmt(v)} (${v>=p.paid?'+':''}${fmt(v-p.paid)} on what you paid).`,v>=p.paid?'good':'bad')},
  cbuy:id=>{const k=CM[id];if(s.cash<k.price)return;s.cash-=k.price;s.cars.push({uid:uid(),t:id,paid:k.price,v:k.dep>0?k.price*.9:k.price,bought:s.day});add('hap',4);log(`Bought ${art(k.n.toLowerCase())}.`,'good')},
  csell:u=>{const i=s.cars.findIndex(c=>c.uid===+u);if(i<0)return;const c=s.cars[i];s.cash+=c.v;s.cars.splice(i,1);log(`Sold your ${CM[c.t].n.toLowerCase()} for ${fmt(c.v)}.`,c.v>=c.paid?'good':'bad')},
  xsel:x=>csel=x,
  xbuy:(k,x)=>{const c=coin(k),amt=x==='all'?s.cash:+x;if(!c||c.dead||amt<=0||amt>s.cash)return;const w=s.wallet[k]??={u:0,c:0};w.u+=amt*.99/c.p;w.c+=amt;s.cash-=amt;log(`Bought ${fmt(amt)} of $${k}.`)},
  xsell:(k,x)=>{const c=coin(k),w=s.wallet[k];if(!c||!w)return;const f=x==='all'?1:+x,u=w.u*f,v=u*c.p*.99,cost=w.c*f;w.u-=u;w.c-=cost;s.cash+=v;if(f===1)delete s.wallet[k];log(`Sold ${fmt(v)} of $${k} (${v>=cost?'+':''}${fmt(v-cost)}).`,v>=cost?'good':'bad')},
  chip:x=>{s.cz.chip=+x},
  cg:x=>{cg=x||null;$('#view').scrollTop=0},
  dice:k=>{const b=stake();if(!b)return;const a=rint(1,6),c=rint(1,6),n=a+c,m=k==='seven'?(n===7?5.8:0):(k==='under'?n<7:n>7)?2.35:0;s.cz.dice={a,b:c,w:b*m};settle(b,b*m,'dice','dice')},
  flip:k=>{const b=stake();if(!b)return;const r=R()<.5?'h':'t',m=r===k?1.96:0;s.cz.flip={r,w:b*m};settle(b,b*m,'the coin flip','coin')},
  tf:x=>{tf=x},cmode:x=>{cmode=x},
  side:x=>{ot.side=x},
  qty:x=>{const st=10**Math.max(0,Math.floor(Math.log10(Math.max(1,ot.qty-(x==='-'?1:0)))));ot.qty=Math.max(1,ot.qty+(x==='+'?st:-st))},
  qset:x=>{const p=s.px[sel].p,h=s.port[sel];ot.qty=x==='max'?Math.max(1,ot.side==='buy'?Math.floor(s.cash/p):h?.sh||1):+x},
  order:()=>{const n=ot.qty,p=s.px[sel].p;if(ot.side==='buy'){if(n*p>s.cash)return;ACT.buy(sel,n)}else{const h=s.port[sel];if(!h||h.sh<n)return;ACT.sell(sel,n)}toast(`Filled: ${ot.side==='buy'?'bought':'sold'} ${big(n)} ${sel} at ${fmt(p)}`)},
  deal:()=>{const b=stake();if(!b)return;const z=s.cz;z.bj={p:[drawCard(),drawCard()],d:[drawCard(),drawCard()],bet:b,done:0,msg:''};if(hv(z.bj.p)===21||hv(z.bj.d)===21)bjEnd()},
  hit:()=>{const b=s.cz.bj;if(!b||b.done)return;b.p.push(drawCard());if(hv(b.p)>=21)bjEnd()},
  stand:()=>{const b=s.cz.bj;if(b&&!b.done)bjEnd()},
  dbl:()=>{const b=s.cz.bj;if(!b||b.done||b.p.length!==2||s.cash<b.bet)return;s.cash-=b.bet;b.bet*=2;b.p.push(drawCard());bjEnd()},
  slot:()=>{const b=stake();if(!b)return;const{r,m}=slotSpin();s.cz.slot={r,w:b*m};settle(b,b*m,'the slots','slot')},
  rl:k=>{const b=stake();if(!b)return;const z=s.cz,n=rint(0,36),m=rlMult(k,n);z.rh.unshift(n);z.rh.length=Math.min(z.rh.length,14);z.rlast={n,k,w:b*m};settle(b,b*m,'roulette','rl')},
  own:id=>{const i=SM[id];if(s.own[id]||s.cash<i.cost)return;s.cash-=i.cost;s.own[id]=1;add('hap',5);log(`Bought ${art(i.n)}`,'good')},
  unown:id=>{if(!s.own[id])return;s.cash+=SM[id].cost*.6;delete s.own[id];log(`Sold your ${SM[id].n}.`)},
  reset:()=>modal(`<h2>Start over?</h2><p>This wipes your save for good.</p><div class="row"><button class="bad" data-a="wipe">Wipe my save</button><button data-a="close">Cancel</button></div>`),
  wipe:()=>{wiped=true;localStorage.removeItem(SAVE);location.reload()},
  heir:u=>startModal(heirOf(u&&per(+u))),
  goals:()=>goalsModal(),
  begin:bg=>{newGame(($('#nm').value.trim()||pick(NAMES)).slice(0,20),bg,heir);closeModal();save();if(heir.gen)s.tour=1;else ACT.guide()},
};
const gig=()=>4+s.st.sma*.15+(s.job?jobPay()*.02:0);
const canJob=j=>!jobMiss(j).length;
function ivOdds(j,k){const sc=k==='exp'?xpY(j.fld)*15+(s.st.sma-j.s)*.8:k==='charm'?(s.st.loo-50)*.8+(s.fol>1000?10:0):-10;return clamp(.55+sc/100+eduBonus(j),.1,.95)}
const eduBonus=j=>Math.max(0,...s.degs.map(d=>(SCHOOLS[d.sc]?.pres||0)*.04+(d.hon?.03:0)+(d.mj&&MAJORS[d.mj]===j.fld?.1:0)));
const schoolOf=st=>st.sc==='inst'?{id:'inst',n:PG[st.p].at,pres:0}:{id:st.sc,...SCHOOLS[st.sc]};
const schoolsFor=P=>P.at?[{id:'inst',n:P.at,cost:1,adm:0,pres:0}]:P.sch.map(id=>({id,...SCHOOLS[id]}));
const admOdds=(P,sc)=>sc.adm?clamp(.35+(s.st.sma-Math.max(P.min,sc.adm))/30,.05,.97):1;
const tuition=(P,sc)=>Math.round(P.cost*sc.cost);
const degName=d=>`${PG[d.p].n}${d.mj?` in ${d.mj}`:''}`;
const grade=g=>`${g>=80?'A':g>=65?'B':g>=50?'C':g>=35?'D':'F'} (${Math.round(g)})`;
const loanPay=()=>s.debt>0?Math.min(s.debt*(1+.06/365),Math.max(5,s.debt*.0009)):0;
function progMiss(P){const m=[];if(s.edu<P.need)m.push(EDU[P.need].n);if(s.st.sma<P.min)m.push(`${P.min} smarts`);if(P.hea&&s.st.hea<P.hea)m.push(`${P.hea} health`);return m}
function leadsTo(P){const js=JOBS.filter(j=>j.dg===P.id).map(j=>j.n);return [js.length?`Leads to ${js.join(' and ')}.`:'',P.mj?'Your major counts as a year of experience in its field.':'',P.lvl>1&&!js.length?`Counts as ${art(EDU[P.lvl].n.toLowerCase())} for jobs.`:''].filter(Boolean).join(' ')}
function enrHtml(){const P=PG[enr.p];
  return `<p class="kicker">Enroll</p><h2>${P.n}</h2><p>${P.days} days of study, +${P.sma} smarts.${P.stipend?` It pays you ${fmt(P.stipend)} a day while you study.`:''} ${leadsTo(P)}</p>
  ${P.mj?`<label>Major</label><div class="row majors">${Object.keys(MAJORS).map(m=>`<button class="${enr.mj===m?'on':''}" data-a="mj" data-x="${m}">${m}</button>`).join('')}</div>`:''}
  <label>School</label><div class="scroll"><table class="ledger"><thead><tr><th>School</th><th>Standing</th><th class="r">Odds</th><th class="r">Tuition</th><th></th></tr></thead><tbody>
  ${schoolsFor(P).map(sc=>{const c=tuition(P,sc),w=Math.max(0,(s.cd[`adm_${P.id}_${sc.id}`]||0)-s.day);return `<tr><td><b>${sc.n}</b>${sc.note?`<div class="sub">${sc.note}</div>`:''}</td><td>${PRES[sc.pres]}</td><td class="r num">${Math.round(admOdds(P,sc)*100)}%</td><td class="r num">${c?fmt(c):'Free'}</td>
   <td class="act">${w?`<span class="mut">Reapply in ${w}d</span>`:`<button class="pri" data-a="enroll" data-x="${sc.id}" data-y="cash" ${s.cash<c?'disabled':''}>Pay</button>${c?`<button data-a="enroll" data-x="${sc.id}" data-y="loan">Loan</button>`:''}`}</td></tr>`}).join('')}
  </tbody></table></div><div class="row" style="margin-top:var(--space-sm)"><button data-a="close">Cancel</button></div>`}
function graduate(){const st=s.study,P=PG[st.p],d={p:st.p,sc:st.sc,mj:st.mj||null,hon:st.g>=80};s.degs.push(d);s.edu=Math.max(s.edu,P.lvl);add('sma',P.sma);if(P.xp)s.xp[P.xp]=(s.xp[P.xp]||0)+180;s.study=null;log(`Graduated: ${degName(d)}${d.hon?', with honors':''}.`,'good');toast('Graduated!')}
function ivHtml(){const j=JM[iv.id],o=k=>`${Math.round(ivOdds(j,k)*100)}% chance`;
  return `<p class="kicker">Interview · ${j.n}</p><h2>“${iv.q}”</h2><p>How do you answer?</p><div class="choices">
  <button data-a="answer" data-x="exp">Walk them through your experience<br><small class="mut">${xpY(j.fld)>=.1?`${xpY(j.fld).toFixed(1)} years in ${FIELD[j.fld]}`:`No ${FIELD[j.fld]} experience yet`} · ${o('exp')}</small></button>
  <button data-a="answer" data-x="charm">Charm them<br><small class="mut">Leans on your looks · ${o('charm')}</small></button>
  <button data-a="answer" data-x="pay">Ask about the pay first<br><small class="mut">Riskier, but you start 10% higher · ${o('pay')}</small></button>
  <button data-a="close">Not today</button></div>`}

// ---------- modals ----------
function modal(h,wide){$('#mbox').innerHTML=h;$('#mbox').classList.toggle('wide',!!wide);$('#modal').hidden=false}
function closeModal(){$('#modal').hidden=true;render()}
function startModal(h={}){
  heir=h;
  const fam=h.fam?.length?` ${h.fam.map(p=>`${esc(p.n)} (${p.role==='parent'?'your parent':'your sibling'})`).join(', ').replace(/, ([^,]*)$/,' and $1')} ${h.fam.length>1?'are':'is'} still around.`:'';
  modal(`<p class="kicker">${h.gen?`Generation ${h.gen}`:'The Hustle'}</p><h2>${h.kid?`${esc(h.kid)} takes over`:h.gen?'The family business continues':'You just turned eighteen'}</h2>
  <p>${h.kid?`You are ${esc(h.last)}'s kid, starting at ${Math.floor(h.age)}. You inherit <b class="num">${fmt(h.inherit)}</b> and a permanent <b>+${(h.gen-1)*25}%</b> business income bonus.${fam}`:h.gen?`With no children, a relative inherits <b class="num">${fmt(h.inherit)}</b> and a permanent <b>+${(h.gen-1)*25}%</b> business income bonus.`:'Work, study, open businesses, trade stocks and build a following. Decisions will land on your desk along the way. One second is one day, and the clock keeps running.'}</p>
  <label>Your name<input id="nm" maxlength="20" value="${h.kid?esc(h.kid):h.last?esc(h.last.split(' ')[0])+' Jr.':pick(NAMES)}"></label>
  <label>Pick your start</label>
  <div class="bgs">${Object.entries(BG).map(([k,b])=>`<button data-a="begin" data-x="${k}"><b>${b.n}</b><small>${b.d}</small></button>`).join('')}</div>`);
}
function deathModal(){
  const w=netWorth(),nb=BIZ.reduce((t,b)=>t+(s.biz[b.id]?.n||0),0),ks=kids().sort((a,b)=>a.b-b.b),ng=Object.values(s.goals).filter(g=>g.gen===s.gen).length;
  modal(`<p class="kicker">Obituary</p><h2>${esc(s.name)}, ${Math.floor(age())}</h2>
  <table class="ledger"><tr><td>Net worth</td><td class="r num">${fmt(w)}</td></tr><tr><td>Businesses</td><td>${nb}</td></tr><tr><td>Followers</td><td>${big(s.fol)}</td></tr><tr><td>Career</td><td>${s.job?jobTitle():'—'}</td></tr><tr><td>Family</td><td>${partner()?(partner().role==='spouse'?'Married to ':'Seeing ')+esc(partner().n):'Single'}${kids().length?`, ${kids().length} kid${kids().length>1?'s':''}`:''}</td></tr><tr><td>Goals reached</td><td>${ng}</td></tr></table>
  <p style="margin-top:var(--space-sm)">Your heir inherits half your net worth: <b class="num">${fmt(Math.max(0,w*.5))}</b>.${ks.length>1?' Pick which of your kids takes over. Younger ones have more years ahead of them, and closer ones start happier.':''}</p>
  ${ks.length?`<div class="choices">${ks.map(k=>{const a=ageOf(k);return `<button data-a="heir" data-x="${k.uid}"><b>Continue as ${esc(k.n)}</b><br><small class="mut">${a<18?`${Math.floor(a)} now, takes over at 18`:`Age ${Math.floor(a)}`} · ${closeWord(k.rel)} to you</small></button>`}).join('')}</div>`:'<button class="pri big" data-a="heir">Continue as your heir</button>'}`);
}
function goalsModal(){
  const done=GOALS.filter(g=>s.goals[g.id]),left=goalsLeft();
  modal(`<p class="kicker">The family trophy case</p><h2>Goals · ${done.length} of ${GOALS.length}</h2><p>Goals stay with the family when you pass them on, so each generation can chase the ones still open.</p>
  <table class="ledger goals"><tbody>${left.map(({g,c,t})=>`<tr><td><b>${g.n}</b><div class="sub">${g.d}</div></td><td class="gp">${goalProg(g,c,t)}</td></tr>`).join('')}
  ${done.map(g=>{const w=s.goals[g.id];return `<tr class="dim"><td><b>${g.n}</b><div class="sub">${g.d}</div></td><td class="gp"><span>${esc(w.who)}, at ${w.a}${w.gen!==s.gen?` · gen ${w.gen}`:''}</span></td></tr>`}).join('')}</tbody></table>
  <div class="row" style="margin-top:var(--space-sm)"><button class="pri" data-a="close">Back to the game</button></div>`,1);
}

// ---------- views ----------
const meter=(v,c='')=>`<span class="meter ${c}"><i style="width:${clamp(v,0,100)}%"></i></span>`;
const cdLeft=k=>Math.max(0,(s.cd[k]||0)-s.day);
const art=w=>(/^(?:[aeio]|u(?!s))/i.test(w)?'an ':'a ')+w;
const sign=(n,cls=true)=>`<span class="num${cls?n>=0?' up':' dn':''}">${n>=0?'+':''}${fmt(n)}</span>`;
function lifeLine(){
  const pt=partner(),kn=kids().length,b=[s.job?`works as ${art(jobTitle())}`:s.pension?'is retired':'is between jobs',pt?`${pt.role==='spouse'?'is married to':'is seeing'} ${esc(pt.n)}`:'is single'];
  if(kn)b.push(`has ${kn===1?'one kid':kn+' kids'}`);
  b.push(homeP()?`lives in ${art(PM[homeP().t].n.toLowerCase())} in ${homeP().loc}`:'rents a room');
  if(bestCar())b.push(`drives ${art(CM[bestCar().t].n.toLowerCase())}`);
  if(s.pet)b.push('has a cat');
  return b.join(', ').replace(/, ([^,]*)$/,' and $1')+'.';
}
const howto=x=>`<div class="howto"><button class="link2" data-a="howto" aria-expanded="${!!helpOpen[tab]}">${helpOpen[tab]?'Hide the details':'How this works'}</button>${helpOpen[tab]?`<p>${x}</p>`:''}</div>`;
const pendAll=()=>BIZ.reduce((t,b)=>t+(s.biz[b.id]?.pend||0),0);
const idxDay=()=>STOCKS.reduce((t,k)=>t+s.px[k.t].p/s.px[k.t].o,0)/STOCKS.length-1;
const plural=w=>/(sh|ch|s)$/.test(w)?w+'es':/[^aeiou]y$/.test(w)?w.slice(0,-1)+'ies':w+'s';
const LOWFIX={hea:['doc','gym'],hap:['trip','spa','med','fam','out']};
function needs(){
  const L=[];
  for(const it of s.inbox){const e=EVM[it.id];if(!e.c||e.c(s))L.push({k:'dec',it,e})}
  let pend=0;const full=[];for(const b of BIZ){const o=s.biz[b.id];if(o?.n&&!o.mgr&&o.pend>0){pend+=o.pend;if(o.pend>=bizInc(b,o)*CAP*.999)full.push(b.n)}}
  if(pend>=1&&(full.length||pend>=Math.max(50,s.cash*.02)))L.push({k:'till',pend,full});
  const m=BIZ.find(b=>{const o=s.biz[b.id];return o?.n&&!o.mgr&&s.cash>=b.cost*12});if(m)L.push({k:'mgr',b:m});
  for(const k of ['hea','hap'])if(s.st[k]<25)L.push({k:'low',st:k,a:LOWFIX[k].map(id=>AM[id]).find(a=>(!a.show||a.show())&&!cdLeft(a.id)&&s.cash>=a.c)});
  if(!homeP()){const l=[...s.re.list].sort((a,b)=>PM[a.t].base*a.m-PM[b.t].base*b.m).find(l=>{const v=PM[l.t].base*l.m*s.re.idx;return !PM[l.t].biz&&(s.cash>=v||(s.cash>=v*.2&&canBorrow(v*.8)))});if(l)L.push({k:'home',l})}
  if(s.cz.bj&&!s.cz.bj.done)L.push({k:'bj'});
  const pt=partner();if(pt&&pt.rel<30)L.push({k:'rel',p:pt});
  if(s.job&&s.perf<25)L.push({k:'perf'});
  if(s.study&&s.study.g<40)L.push({k:'grade'});
  if(!s.tour)L.unshift({k:'guide'});
  return L;
}
function needHtml(n){
  const row=(k,ti,d,acts,hot)=>`<div class="need"><div><div class="k ${hot?'hot':''}">${k}</div><div class="t">${ti}</div><div class="d">${d}</div></div><div class="acts2">${acts}</div></div>`;
  if(n.k==='dec'){const left=30-(s.day-n.it.d);return row(`Decision · ${left} day${left===1?'':'s'} left`,n.e.t,n.e.d(s,n.it.a),n.e.ch.map((c,j)=>`<button data-a="pick" data-x="${n.it.id}" data-y="${j}">${c[0]}</button>`).join(''),1)}
  if(n.k==='till'){const f=n.full;return row('Business',f.length?(f.length===1?`${f[0]}'s till is full`:`${f.length} tills are full`):'Tills are filling up',f.length?`${f.join(' and ')} ${f.length===1?'has':'have'} stopped earning until you collect.`:'Collect before they stop earning.',`<span class="amt">${fmt(n.pend)}</span><button class="pri" data-a="colAll">Collect</button>`)}
  if(n.k==='mgr')return row('Worth it now',`Hire a manager for ${n.b.n}`,`It earns ${fmt(bizInc(n.b,s.biz[n.b.id]))} a day, but only while you keep collecting.`,`<button data-a="mgr" data-x="${n.b.id}">Hire for ${fmt(n.b.cost*12)}</button>`);
  if(n.k==='low')return row(n.st==='hea'?'Health':'Mood',`${n.st==='hea'?'Health':'Happiness'} is low`,n.st==='hea'?'If it hits zero, your life ends.':'Unhappy people stop getting promoted, and their health slips.',n.a?`<button data-a="act" data-x="${n.a.id}">${n.a.n}${n.a.c?` · ${fmt(n.a.c)}`:''}</button>`:'');
  if(n.k==='home'){const k=PM[n.l.t],v=k.base*n.l.m*s.re.idx;return row('Save on rent','You pay $30 a day in rent',`${k.n}, ${n.l.loc} is for sale for ${fmt(v)}. On a mortgage it would cost ${fmt(mpay(v*.8))} a day.`,`<button data-a="tab" data-x="home">See listings</button>`)}
  if(n.k==='rel'){const A=PACTS.date,w=(n.p.c?.date||0)>s.day,c=A.c(n.p);return row('Relationship',`${esc(n.p.n)} feels neglected`,`Closeness is down to ${Math.round(n.p.rel)}. If it keeps falling, they may leave.`,`<button data-a="pp" data-x="${n.p.uid}" data-y="date" ${w||s.cash<c?'disabled':''}>Date night · ${fmt(c)}</button>`)}
  if(n.k==='perf'){const w=(s.cd.w_hard||0)>s.day;return row('Work','You could be fired',`Your performance is ${Math.round(s.perf)}. Below 20, your boss starts looking for a replacement.`,`<button data-a="work" data-x="hard" ${w?'disabled':''}>Work hard</button>`)}
  if(n.k==='guide')return row('New here?','Take the one-minute tour','It shows where everything is and how to make your first money.','<button class="pri" data-a="guide">Start the tour</button><button data-a="tskip">No thanks</button>',1);
  if(n.k==='grade'){const w=(s.cd.s_hard||0)>s.day;return row('School','Your grades are slipping',`Your grade is ${grade(s.study.g)}. Below 30 at the end, you repeat a term.`,`<button data-a="study" data-x="hard" ${w?'disabled':''}>Study hard</button>`)}
  if(n.k==='bj')return row('Casino','Your blackjack hand is still open','The dealer is waiting on you.',`<button data-a="gobj">Back to the table</button>`);
  return '';
}
function nwChart(h){
  const W=480,H=120,lo=Math.min(...h),hi=Math.max(...h),r=hi-lo||1,pts=h.map((v,i)=>`${(i/(h.length-1)*W).toFixed(1)},${(H-6-(v-lo)/r*(H-12)).toFixed(1)}`).join(' '),col=h.at(-1)>=h[0]?'var(--color-up)':'var(--color-down)';
  return `<svg class="nwc" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="Net worth over the last ${h.length-1} weeks"><polygon points="0,${H} ${pts} ${W},${H}" style="fill:${col};fill-opacity:.1"></polygon><polyline points="${pts}" style="fill:none;stroke:${col};stroke-width:2" vector-effect="non-scaling-stroke"></polyline></svg>`;
}
function bestBuy(){ // cheapest income per dollar, counting milestone doublings
  let best=null;
  for(const b of BIZ){const o=s.biz[b.id]||{n:0};if(!o.n&&s.cash<b.cost)continue;const nm=MILES.find(m=>m>o.n);
    for(const k of [1,nm?nm-o.n:1]){if(k<1||k>100)continue;const c=bcost(b,o.n,k);if(c>s.cash)continue;
      const gain=b.inc*((o.n+k)*bmul(o.n+k)-o.n*bmul(o.n))*s.legacy,pb=c/gain;if(!best||pb<best.pb)best={b,k,c,pb,m:bmul(o.n+k)>bmul(o.n)?o.n+k:0}}}
  return best;
}
function personRow(p){
  const all=PACT_ORDER.filter(k=>PACTS[k].roles.includes(p.role)),main=['date','call','reconnect'].find(k=>all.includes(k)),open=openP===p.uid,lo=p.rel<30;
  const btn=k=>{const A=PACTS[k],w=Math.max(0,(p.c?.[k]||0)-s.day),cost=A.c?A.c(p):0,why=A.need?.(p);if(why)return `<span class="hint">${why}</span>`;
    return `<button class="${A.bad?'bad':k==='propose'||k==='baby'?'pri':''}" data-a="pp" data-x="${p.uid}" data-y="${k}" ${w||s.cash<cost?'disabled':''}>${A.n}${cost?` · ${fmt(cost)}`:''}${w?` · ${w}d`:''}</button>`};
  return `<div class="prow"><div class="who"><span class="av">${esc(p.n[0])}</span><div><div class="pn">${esc(p.n)}</div><div class="mut" style="font-size:var(--text-xs)">${ROLE[p.role]}${p.out?', moved out':''} · ${Math.max(0,Math.floor(ageOf(p)))}</div></div></div>
   <div class="close"><div class="top2"><span class="${lo?'dn':'mut'}">${closeWord(p.rel)}</span><span class="num">${Math.round(p.rel)}</span></div>${meter(p.rel,lo?'low':'')}</div>
   <div class="acts3">${main?btn(main):''}${all.length>1?`<button data-a="pmore" data-x="${p.uid}" aria-expanded="${open}">${open?'Less':'More'}</button>`:''}</div>
   ${open?`<div class="pmore">${all.filter(k=>k!==main).map(btn).join('')}</div>`:''}</div>`;
}
function bizRow(b,i,last){
  const o=s.biz[b.id]||{n:0,pend:0,mgr:0},n=o.n;if(i>last+1&&!n)return '';
  if(!n&&s.cash<b.cost)return `<div class="brow locked"><div><div class="nm">${b.n}</div><div class="ms">Earns ${fmt(b.inc*s.legacy)} a day each</div></div><span class="own num">0</span><span class="inc num">—</span><span>Opens at ${fmt(b.cost)}</span><div class="acts3"><button disabled>${fmt(b.cost-s.cash)} to go</button></div></div>`;
  const g=n?bizInc(b,o):0,nm=MILES.find(m=>m>n),mx=bmax(b,n),q=Math.min(bmode==='max'?mx:+bmode,mx),mc=b.cost*12,full=n&&!o.mgr&&o.pend>=g*CAP*.999;
  const buy=q>=1?`<button class="pri" data-a="bbuy" data-x="${b.id}" data-y="${q}">Buy ${q} · ${fmt(bcost(b,n,q))}</button>`:`<button disabled>Buy 1 · ${fmt(bcost(b,n,1))}</button>`;
  return `<div class="brow"><div><div class="nm">${b.n}</div><div class="ms">${nm?`${meter(n/nm*100)}<span>${n} / ${nm} to ×2</span>`:'<span>Every milestone reached</span>'}</div></div>
   <span class="own num">${n}<small class="m"> owned</small></span><span class="inc num ${g?'up':''}">${fmt(g)}<small class="m"> a day</small></span>
   <div class="till">${!n?'<span class="mut">Not open yet</span>':o.mgr?'<span class="mut">Managed, pays itself</span>':`<div class="top2"><span class="${full?'full':'mut'}">${full?'Full':'Filling'}</span><span class="num">${fmt(o.pend)}</span></div>${meter(o.pend/(g*CAP)*100,'warn')}`}</div>
   <div class="acts3">${n&&!o.mgr?`<button data-a="col" data-x="${b.id}" ${o.pend<.01?'disabled':''}>Collect</button><button data-a="mgr" data-x="${b.id}" ${s.cash<mc?'disabled':''}>Manager ${fmt(mc)}</button>`:''}${buy}</div></div>`;
}
const VIEWS={
dash(){
  const f=flows(),N=needs(),net=f.job+f.biz+f.pend+f.spon+f.rent-f.exp-f.mort,h=s.nwh||[];
  const parts=[['Cash',Math.max(0,s.cash)],['Businesses',Object.values(s.biz).reduce((a,o)=>a+o.spent*.5,0)],['Stocks',Object.entries(s.port).reduce((a,[k,o])=>a+o.sh*s.px[k].p,0)],['Crypto',walletVal()],['Property',s.props.reduce((a,p)=>a+Math.max(0,pval(p)-p.loan),0)],['Cars',s.cars.reduce((a,c)=>a+c.v,0)],['Lifestyle',Object.keys(s.own).reduce((a,k)=>a+SM[k].cost*.6,0)]].map((x,i)=>[...x,`var(--cat-${i+1})`]).filter(x=>x[1]>=1);
  const tot=parts.reduce((a,x)=>a+x[1],0)||1,gl=goalsLeft().slice(0,3);
  return `<section class="lede solo"><div><h2 class="headline">${esc(s.name)}, ${Math.floor(age())}</h2><p class="dek">${esc(s.name)} ${lifeLine()}</p></div></section>
  <div class="sec-h"><h2>Needs you</h2><span>${N.length?`${N.length} thing${N.length>1?'s':''}`:'all clear'}</span></div>
  <div class="needs">${N.length?N.map(needHtml).join(''):'<p class="mut" style="padding:var(--space-sm) 0">Nothing needs you right now. Your money is working.</p>'}</div>
  <div class="sec-h"><h2>Quick actions</h2></div>
  <div class="quick"><button class="pri" data-a="gig">Take a gig · +${fmt(gig())}</button>${ACTS.filter(a=>!a.show||a.show()).map(a=>{const w=cdLeft(a.id);return `<button data-a="act" data-x="${a.id}" ${w||s.cash<a.c?'disabled':''}>${a.n}${a.c?` · ${fmt(a.c)}`:''}${w?` · in ${w}d`:''}</button>`}).join('')}${cdLeft('post')?'':'<button data-a="post" data-x="meme">Post a meme</button>'}</div>
  <section class="snap">
   <div><div class="sec-row"><h2>Net worth</h2>${h.length>1?`<span class="${h.at(-1)>=h[0]?'up':'dn'}">${h.at(-1)>=h[0]?'+':''}${fmt(h.at(-1)-h[0])} over ${h.length-1} weeks</span>`:''}</div>
    ${h.length>1?nwChart(h):'<p class="mut" style="margin-top:var(--space-xs)">The chart fills in after a couple of weeks.</p>'}
    <p class="mut" style="margin-top:var(--space-2xs)">Earning ${sign(net)} a day: salary ${fmt(f.job)}, businesses ${fmt(f.biz+f.pend)}${f.rent?`, rent ${fmt(f.rent)}`:''}${f.spon?`, sponsors ${fmt(f.spon)}`:''}, costs −${fmt(f.exp+f.mort)}.</p></div>
   <div><h2>Where it sits</h2><div class="stack">${parts.map(x=>`<span style="width:${x[1]/tot*100}%;background:${x[2]}"></span>`).join('')}</div>
    <div class="legend">${parts.map(x=>`<div><i style="background:${x[2]}"></i>${x[0]}<b>${fmt(x[1])}</b></div>`).join('')}</div></div>
  </section>
  <div class="sec-h"><h2>Goals</h2><span>${Object.keys(s.goals).length} of ${GOALS.length} reached</span><button class="link2" data-a="goals">See all</button></div>
  <div class="glist">${gl.map(({g,c,t})=>`<div><b>${g.n}</b><span class="mut">${g.d}</span><small>${goalProg(g,c,t)}</small></div>`).join('')||'<p class="mut">Every goal is done. The family legend is complete.</p>'}</div>`;
},
life(){
  const f=flows(),rows=[['Salary and pension',f.job],['Managed businesses',f.biz],['Tills to collect',f.pend],['Sponsorships',f.spon],['Rent from tenants',f.rent],['Loan payments',-f.mort],[`Living costs${homeP()?'':', rent included'}`,-f.exp]].filter(r=>Math.abs(r[1])>=.01);
  return `<section class="lede solo"><div><h2 class="headline">${esc(s.name)}, ${Math.floor(age())}</h2><p class="dek">${esc(s.name)} ${lifeLine()}</p></div></section>
  <div class="sec-h"><h2>Activities</h2><span>each one has a cooldown</span></div>
  <div class="acards">${ACTS.filter(a=>!a.show||a.show()).map(a=>{const w=cdLeft(a.id);return `<button class="acard" data-a="act" data-x="${a.id}" ${w||s.cash<a.c?'disabled':''}><b>${a.n}</b><span>${a.d}</span><small>${a.c?fmt(a.c):'Free'}${w?` · ready in ${w}d`:''}</small></button>`}).join('')}</div>
  <div class="sec-h"><h2>Money in and out</h2><span>a day</span></div>
  <table class="ledger budget"><tbody>${rows.map(([n,v])=>`<tr><td>${n}</td><td class="r">${sign(v)}</td></tr>`).join('')}<tr><td><b>Net</b></td><td class="r"><b>${sign(rows.reduce((a,r)=>a+r[1],0))}</b></td></tr></tbody></table>`;
},
work(){
  const J=job(),yrs=Object.entries(s.xp).filter(([,d])=>d>=30).sort((a,b)=>b[1]-a[1]),toPromo=120-s.jobDays%120;
  const wbtn=(k,extra='')=>{const W=WORK[k],w=Math.max(0,(s.cd['w_'+k]||0)-s.day);return `<button data-a="work" data-x="${k}" ${w||s.cash<(W.c||0)?'disabled':''}>${W.n}${W.c?` · ${fmt(W.c)}`:''}${extra}${w?` · in ${w}d`:''}</button>`};
  return `<section class="lede">
    <div><h2 class="headline">${J?jobTitle():s.pension?'Retired':'Out of work'}</h2>
     <p class="dek">${J?`Paid <b class="num">${fmt(jobPay())}</b> a day in ${FIELD[J.fld]}. ${topRank()?'You are at the top of this ladder. Switch jobs to earn more.':s.perf>=promoNeed()?`On track for promotion in ${toPromo} days.`:`Promotion review in ${toPromo} days. You need a performance of ${promoNeed()}.`}`:'No salary coming in. Pick a position from the board below and go to the interview.'}${s.pension?` Your pension pays <b class="num">${fmt(s.pension)}</b> a day.`:''}</p></div>
    ${J?`<div class="side"><p class="mut">Performance</p><span class="figure ${s.perf<25?'dn':s.perf>=promoNeed()?'up':''}">${Math.round(s.perf)}</span>${meter(s.perf,s.perf<25?'low':'')}<p class="mut" style="font-size:var(--text-xs)">${s.perf<25?'At risk of being fired.':s.perf>=promoNeed()||topRank()?'Your boss is happy.':`Get it to ${promoNeed()} for the next promotion.`}</p></div>`:''}
  </section>
  ${J?`<div class="sec-h"><h2>At work</h2></div><div class="quick">${wbtn('hard')}${wbtn('slack')}${wbtn('net')}${wbtn('raise',` · ${Math.round(raiseOdds()*100)}% odds`)}<button data-a="gig">Side gig · +${fmt(gig())}</button>${age()>=55?'<button data-a="retire">Retire on a pension</button>':''}<button class="bad" data-a="quit">Resign</button></div>`
     :`<div class="quick" style="margin-top:var(--space-md)"><button class="pri" data-a="gig">Take a gig · +${fmt(gig())}</button></div>`}
  <div class="sec-h"><h2>Job board</h2><span>${JOBS.filter(j=>canJob(j)&&s.job!==j.id).length} you qualify for</span></div>
  <div class="scroll"><table class="ledger"><thead><tr><th>Position</th><th>Field</th><th>Requires</th><th class="r">Stress</th><th class="r">Per day</th><th></th></tr></thead><tbody>
  ${JOBS.map(j=>{const miss=jobMiss(j),cur=s.job===j.id,wait=Math.max(0,(s.cd['job_'+j.id]||0)-s.day);if(miss.length&&!cur&&!showAll.work)return '';return `<tr class="${miss.length&&!cur?'dim':''}"><td><b>${j.n}</b></td><td class="mut">${FIELD[j.fld]}</td><td>${jobReqText(j)}${miss.length&&!cur?`<div class="sub dn">Missing ${miss.join(', ')}</div>`:''}</td><td class="r num">${j.str}/5</td><td class="r num">${fmt(j.pay)}</td>
   <td class="act">${cur?'<span class="mut">Current</span>':wait?`<span class="mut">Reapply in ${wait}d</span>`:`<button ${miss.length?'disabled':'class="pri"'} data-a="apply" data-x="${j.id}">Interview</button>`}</td></tr>`}).join('')}
  </tbody></table></div>
  ${(n=>n?`<div class="more-row"><button class="link2" data-a="showall">${showAll.work?'Hide the jobs you can\'t get yet':`Show ${n} more job${n>1?'s':''} you can't get yet`}</button></div>`:'')(JOBS.filter(j=>jobMiss(j).length&&s.job!==j.id).length)}
  ${howto(`Experience builds in whatever field you work in, and better jobs ask for it. Promotion reviews come every 120 days, and each step up asks for a higher performance, starting at 55. Below 20, you can be fired.${yrs.length?` You have ${yrs.map(([f,d])=>`${(d/365).toFixed(1)} years in ${FIELD[f]}`).join(', ')}.`:''}`)}`;
},
school(){
  const st=s.study,P=st&&PG[st.p],sbtn=k=>{const A=STUDY[k],w=Math.max(0,(s.cd['s_'+k]||0)-s.day);return `<button data-a="study" data-x="${k}" ${w||s.cash<(A.c||0)?'disabled':''}>${A.n}${A.c?` · ${fmt(A.c)}`:''}${w?` · in ${w}d`:''}</button>`};
  const open=PROGS.filter(P=>!progMiss(P).length&&(P.mj||!s.degs.some(d=>d.p===P.id))).length;
  return `<section class="lede"><div><h2 class="headline">Education</h2>
    <p class="dek">Your highest level is ${EDU[s.edu].n.toLowerCase()}${s.degs.length?`, from ${s.degs.length} program${s.degs.length>1?'s':''}`:''}.${s.debt?` You owe <b class="num">${fmt(s.debt)}</b> in student loans, repaid a little every day.`:''}</p></div>
    ${s.debt?`<div class="side"><p class="mut"><span class="figure">${fmt(s.debt)}</span><br>student loans</p><button data-a="payloan" ${s.cash<s.debt?'disabled':''}>Pay it all off</button></div>`:''}
  </section>
  ${st?`<div class="sec-h"><h2>Studying now</h2></div><div class="needs"><div class="need"><div><div class="k hot">${schoolOf(st).n}</div><div class="t">${degName(st)}</div>
    <div class="d">${st.left} days left · grade ${grade(st.g)}${P.stipend?` · paid ${fmt(P.stipend)} a day`:''}</div>${meter((1-st.left/st.days)*100)}</div>
    <div class="acts2">${sbtn('hard')}${sbtn('party')}${sbtn('tutor')}<button class="bad" data-a="dropout">Drop out</button></div></div></div>`:''}
  <div class="sec-h"><h2>Programs</h2><span>${st?'finish your current program to start another':`${open} open to you`}</span></div>
  <div class="scroll"><table class="ledger"><thead><tr><th>Program</th><th>Where</th><th>Needs</th><th class="r">Days</th><th class="r">Tuition from</th><th></th></tr></thead><tbody>
  ${PROGS.map(P=>{const miss=progMiss(P),done=!P.mj&&s.degs.some(d=>d.p===P.id),from=Math.min(...schoolsFor(P).map(sc=>tuition(P,sc)));if((miss.length||done)&&!showAll.school)return '';
    return `<tr class="${miss.length||done?'dim':''}"><td><b>${P.n}</b><div class="sub">${leadsTo(P)}</div>${miss.length?`<div class="sub dn">Missing ${miss.join(', ')}</div>`:''}</td><td class="mut">${P.at||`${P.sch.length} schools`}</td>
     <td>${[P.need?EDU[P.need].n:'',P.min?`${P.min} smarts`:'',P.hea?`${P.hea} health`:''].filter(Boolean).join(', ')||'Nothing'}</td><td class="r num">${P.days}</td><td class="r num">${P.stipend?`paid ${fmt(P.stipend)}/d`:fmt(from)}</td>
     <td class="act">${done?'<span class="mut">Done</span>':`<button ${miss.length||st?'disabled':'class="pri"'} data-a="learn" data-x="${P.id}">Enroll</button>`}</td></tr>`}).join('')}
  </tbody></table></div>
  ${(n=>n?`<div class="more-row"><button class="link2" data-a="showall">${showAll.school?'Hide the programs you can\'t start':`Show ${n} more program${n>1?'s':''}`}</button></div>`:'')(PROGS.filter(P=>progMiss(P).length||(!P.mj&&s.degs.some(d=>d.p===P.id))).length)}
  ${s.degs.length?`<div class="sec-h"><h2>Your qualifications</h2></div><div class="scroll"><table class="ledger"><tbody>${s.degs.map(d=>`<tr><td><b>${degName(d)}</b></td><td class="mut">${schoolOf(d).n}</td><td class="r">${d.hon?'<span class="up">Honors</span>':''}</td></tr>`).join('')}</tbody></table></div>`:''}
  ${howto(`Better schools cost more and are harder to get into, but impress interviewers. Strong students can win a half scholarship. Online study doesn't hurt your mood and fits around a job, but takes longer.`)}`;
},
people(){
  const pt=partner(),G=[['Partner',['date','spouse']],['Family',['child','parent','sibling']],['Friends',['friend']],['Exes',['ex']]];
  return `<section class="lede">
    <div><h2 class="headline">People</h2><p class="dek">${pt?`You are ${pt.role==='spouse'?'married to':'seeing'} <b>${esc(pt.n)}</b>.`:'You are single.'} Staying close to people keeps you happy.</p></div>
    <div class="side"><p class="mut">Meet people</p><div class="row">${['date','out','club'].map(id=>{const a=AM[id];if(a.show&&!a.show())return '';const w=cdLeft(id);return `<button data-a="act" data-x="${id}" ${w||s.cash<a.c?'disabled':''}>${a.n}${a.c?` · ${fmt(a.c)}`:''}${w?` · ${w}d`:''}</button>`}).join('')}</div></div>
  </section>
  ${G.map(([g,rs])=>{const L=s.people.filter(p=>rs.includes(p.role)).sort((a,b)=>b.rel-a.rel);return L.length?`<div class="sec-h"><h2>${g}</h2><span>${L.length}</span></div><div class="plist">${L.map(personRow).join('')}</div>`:''}).join('')||'<p class="mut">Nobody yet. Go out and meet people.</p>'}
  ${howto('Closeness fades a little every day. Call, hang out, give gifts and plan date nights to keep it up. Close relationships lift your mood every day, and neglected ones drag it down. A neglected partner may leave. Propose once you are close and have been together a while, and try for a baby once you are married.')}`;
},
biz(){
  const f=flows(),last=BIZ.reduce((m,b,i)=>s.biz[b.id]?.n?i:m,-1),bb=bestBuy();
  return `<section class="lede">
    <div><h2 class="headline">Businesses</h2>
     <p class="dek">Managers pay <b class="num">${fmt(f.biz)}</b> a day on their own. Your tills take in <b class="num">${fmt(f.pend)}</b> a day until you collect, and stop filling after ${CAP} days.${s.day<s.boost?` Your promotion adds 25% for ${s.boost-s.day} more days.`:''}</p></div>
    <div class="bmode"><span class="mut" style="font-size:var(--text-xs)">Buy at a time</span><div class="seg2">${['1','10','100','max'].map(m=>`<button class="${bmode===m?'on':''}" data-a="bmode" data-x="${m}">${m==='max'?'Max':'×'+m}</button>`).join('')}</div></div>
  </section>
  ${bb?`<div class="bestbuy"><p><b>Best next buy:</b> ${bb.k} ${bb.k>1?plural(bb.b.n):bb.b.n} for ${fmt(bb.c)}${bb.m?`, reaching ${bb.m} and doubling its income`:''}. Pays for itself in about ${Math.max(1,Math.round(bb.pb))} days.</p><button class="pri" data-a="bbuy" data-x="${bb.b.id}" data-y="${bb.k}">Buy ${bb.k}</button></div>`:''}
  <div class="blist"><div class="brow head"><span>Business</span><span class="own">Owned</span><span class="inc">Per day</span><span>Till</span><span></span></div>
  ${BIZ.map((b,i)=>bizRow(b,i,last)).join('')}</div>
  ${howto(`The buy button follows the switch above and shrinks to what you can afford. Milestones at ${MILES.slice(0,5).join(', ')} and on double a business's income. Managers keep earning while you're away.`)}`;
},
stock(){
  const k=SK[sel],q=s.px[sel],h=s.port[sel],M=s.mkt,d=q.p/q.o-1,H=q.h,buy=ot.side==='buy';
  let val=0,cost=0,dpl=0;for(const x in s.port){const o=s.port[x],y=s.px[x];val+=o.sh*y.p;cost+=o.cost;dpl+=o.sh*(y.p-y.o)}
  const idx=STOCKS.reduce((t,k)=>t+s.px[k.t].p/k.p,0)/STOCKS.length*1000,idxd=STOCKS.reduce((t,k)=>t+s.px[k.t].p/s.px[k.t].o,0)/STOCKS.length-1;
  const dh=Math.max(q.o,q.p)*(1+.006*hsh(s.day,3)),dl=Math.min(q.o,q.p)*(1-.006*hsh(s.day,5));
  const ok=buy?ot.qty*q.p<=s.cash:h&&h.sh>=ot.qty,news=s.feed.filter(p=>p.h==='@MarketWire'&&p.x.includes('$'+sel)).slice(0,5);
  const st=(l,v)=>`<div><span>${l}</span><b class="num">${v}</b></div>`,pl=(n)=>`<span class="num ${n>=0?'up':'dn'}">${n>=0?'+':''}${fmt(n)}</span>`;
  return `<div class="tbar">
    <div><small>Hustle 500</small><b class="num">${idx.toFixed(2)}</b> <span class="num ${idxd>=0?'up':'dn'}">${pct(idxd)}</span></div>
    <div><small>Market</small><b class="${M.bull?'up':'dn'}">${M.bull?'Bull':'Bear'}</b></div>
    <div><small>Total assets</small><b class="num">${fmt(val+s.cash)}</b></div>
    <div><small>Market value</small><b class="num">${fmt(val)}</b></div>
    <div><small>Day P/L</small><b>${pl(dpl)}</b></div>
    <div><small>Total P/L</small><b>${pl(val-cost)}</b></div>
  </div>
  <div class="tui">
   <div class="watch"><div class="wh"><span>Watchlist</span><span>Day</span></div>
    ${STOCKS.map(k=>{const q=s.px[k.t],d=q.p/q.o-1;return `<button class="wrow ${k.t===sel?'on':''}" data-a="sel" data-x="${k.t}"><span><b>${k.t}</b>${s.port[k.t]?' <span class="mut">·held</span>':''}<small>${k.n}</small></span><span class="num">${fmt(q.p)}</span><span class="pill ${d>=0?'up':'dn'}">${pct(d)}</span></button>`}).join('')}
   </div>
   <section>
    <div class="qhead"><div><h2 class="qt">${k.t} <span class="mut">${k.n}</span></h2>
      <p><span class="price ${d>=0?'up':'dn'}">${fmt(q.p)}</span> <span class="num ${d>=0?'up':'dn'}">${d>=0?'+':''}${fmt(q.p-q.o)} (${pct(d)})</span></p></div><span class="chip">${k.sec}</span></div>
    <div class="stats4">${st('Open',fmt(q.o))}${st('High',fmt(dh))}${st('Low',fmt(dl))}${st('Prev close',fmt(q.o))}${st('240d high',fmt(Math.max(...H)))}${st('240d low',fmt(Math.min(...H)))}${st('Volume',big(volAt(k,H.length-1)))}${st('Mkt cap',fmt(q.p*k.sh))}${st('P/E',k.pe?(k.pe*q.p/k.p).toFixed(1):'—')}${st('Div yield',k.div?(k.div*100).toFixed(1)+'%':'—')}</div>
    <div class="tfbar">${Object.keys(TF).map(x=>`<button class="${tf===x?'on':''}" data-a="tf" data-x="${x}">${x}</button>`).join('')}<span class="sp"></span><button class="${cmode==='line'?'on':''}" data-a="cmode" data-x="line">Line</button><button class="${cmode==='candle'?'on':''}" data-a="cmode" data-x="candle">Candles</button></div>
    <canvas id="tchart"></canvas>
    <h3>News</h3>
    ${news.length?`<ul class="news">${news.map(p=>`<li><small>${s.day-p.d?`${s.day-p.d}d ago`:'today'}</small>${esc(p.x)}</li>`).join('')}</ul>`:`<p class="mut">No headlines about ${k.t} lately.</p>`}
   </section>
   <div class="ticket">
    <div class="seg"><button class="${buy?'on buy':''}" data-a="side" data-x="buy">Buy</button><button class="${buy?'':'on sell'}" data-a="side" data-x="sell">Sell</button></div>
    <dl><dt>Order type</dt><dd>Market</dd><dt>Last price</dt><dd class="num">${fmt(q.p)}</dd></dl>
    <div class="qty"><button data-a="qty" data-x="-" aria-label="Fewer shares">−</button><b class="num">${big(ot.qty)}</b><button data-a="qty" data-x="+" aria-label="More shares">+</button></div>
    <div class="presets">${['1','10','100'].map(v=>`<button data-a="qset" data-x="${v}">${v}</button>`).join('')}<button data-a="qset" data-x="max">Max</button></div>
    <dl><dt>Estimated ${buy?'cost':'proceeds'}</dt><dd class="num">${fmt(ot.qty*q.p)}</dd><dt>${buy?'Buying power':'Shares held'}</dt><dd class="num">${buy?fmt(s.cash):big(h?.sh||0)}</dd>${h?`<dt>Your avg cost</dt><dd class="num">${fmt(h.cost/h.sh)}</dd>`:''}</dl>
    <button class="place ${buy?'buy':'sell'}" data-a="order" ${ok?'':'disabled'}>${buy?'Buy':'Sell'} ${big(ot.qty)} ${k.t}</button>
    ${ok?'':`<p class="mut" style="font-size:var(--text-xs)">${buy?'Not enough buying power.':"You don't hold that many shares."}</p>`}
   </div>
  </div>
  <h3>Positions</h3>
  ${Object.keys(s.port).length?`<div class="scroll"><table class="ledger"><thead><tr><th>Symbol</th><th class="r">Qty</th><th class="r">Avg cost</th><th class="r">Last</th><th class="r">Market value</th><th class="r">Day P/L</th><th class="r">Total P/L</th></tr></thead><tbody>
   ${Object.entries(s.port).map(([x,o])=>{const y=s.px[x],v=o.sh*y.p;return `<tr class="pick ${x===sel?'on':''}" data-a="sel" data-x="${x}" tabindex="0"><td><b>${x}</b></td><td class="r num">${big(o.sh)}</td><td class="r num">${fmt(o.cost/o.sh)}</td><td class="r num">${fmt(y.p)}</td><td class="r num">${fmt(v)}</td><td class="r">${pl(o.sh*(y.p-y.o))}</td><td class="r">${pl(v-o.cost)} <span class="num ${v>=o.cost?'up':'dn'}">${pct(v/o.cost-1)}</span></td></tr>`}).join('')}
  </tbody></table></div>`:'<p class="mut">No positions yet. Pick a stock from the watchlist and place an order.</p>'}`;
},
chirp(){
  const w=cdLeft('post'),sp=sponsor();
  return `<div class="chirp"><section class="lede" style="grid-template-columns:minmax(0,1fr)">
    <div><h2 class="headline">Chirp</h2>
     <p class="dek">${esc(s.name)} posts as ${s.handle} to <b class="num">${big(s.fol)}</b> followers. ${sp?`Sponsors pay <b class="num">${fmt(sp)}</b> a day.`:'Sponsors start paying at 1K followers.'}</p></div></section>
   <div class="compose"><p class="mut">${w?`You can post again in ${w} day${w>1?'s':''}.`:'What will you post?'}</p>
    ${Object.entries(POSTS).map(([k,P])=>`<button data-a="post" data-x="${k}" ${!w&&(!P.need||P.need())?'':'disabled'}>${P.n}</button>`).join('')}</div>
   ${howto('Selfies ride on looks. Hot takes ride on smarts and can backfire. Memes go viral more often. Flexes need $25K net worth. Promoting a business lifts its income 25% for 10 days. At 1K followers, sponsors start paying you every day.')}
   <ol class="feed">${s.feed.map(p=>`<li class="post ${p.me?'mine':''}"><span class="av">${esc(p.n[0].toUpperCase())}</span><div>
     <div class="by"><b>${esc(p.n)}</b>${p.v?' <span class="ver" title="Verified">✓</span>':''} <span class="mut">${p.h} · ${s.day-p.d?`${s.day-p.d}d`:'now'}</span>${p.tag?`<span class="tag ${p.bad?'dn':''}">${p.tag}</span>`:''}</div>
     <p>${esc(p.x)}</p><div class="mut num" style="font-size:var(--text-xs)">${big(p.l)} likes</div></div></li>`).join('')}</ol></div>`;
},
crypto(){
  const X=s.cx,c=coin(csel)||X.coins[0],w=s.wallet[c.t];csel=c.t;let val=0,cost=0;for(const k in s.wallet){val+=s.wallet[k].u*(coin(k)?.p||0);cost+=s.wallet[k].c}
  const d=c.p/c.o-1,d30=c.p/c.h[Math.max(0,c.h.length-31)]-1;
  return `<section class="lede"><div><h2 class="headline">Crypto</h2>
    <p class="dek">${X.bull?'A bull run. Everything is green and everyone is a genius.':'Crypto winter. Prices are bleeding and the timeline has gone quiet.'} ${val?`Your wallet holds <b class="num">${fmt(val)}</b>, ${sign(val-cost)} on what you put in.`:'Your wallet is empty.'}</p></div>
    <div class="side"><p class="mut"><span class="figure">${fmt(s.cash)}</span><br>ready to buy</p></div></section>
  <div class="mkt">
   <div class="scroll"><table class="ledger"><thead><tr><th>Coin</th><th>Name</th><th class="r">Price</th><th class="r">Day</th></tr></thead><tbody>
   ${X.coins.map(k=>{const d=k.p/k.o-1;return `<tr class="pick ${k.t===c.t?'on':''} ${k.dead?'dim':''}" data-a="xsel" data-x="${k.t}" tabindex="0"><td><b>${k.t}</b>${s.wallet[k.t]?' <span class="mut">·held</span>':''}</td><td class="mut">${k.n}${k.dead?' · rugged':k.born!=null&&s.day-k.born<30?' · new':''}</td><td class="r num">${pfmt(k.p)}</td><td class="r num ${k.stable?'':d>=0?'up':'dn'}">${k.stable?'—':pct(d)}</td></tr>`}).join('')}
   </tbody></table></div>
   <section>
    <h3 style="margin-top:0">${c.n}</h3>
    <p class="mut">${c.t} · ${c.stable?`stablecoin, pays ${(c.apy*100).toFixed(0)}% a year just for holding it`:c.dead?'rugged, the developers are gone':c.meme?'meme coin, anything can happen':'blockchain'}</p>
    <p style="margin-top:var(--space-2xs)"><span class="price">${pfmt(c.p)}</span> ${c.stable?'':`<span class="num ${d>=0?'up':'dn'}">${pct(d)}</span> <span class="mut">today, ${pct(d30)} over 30 days</span>`}</p>
    <canvas id="chart"></canvas>
    <p>${w?`You hold <b class="num">${units(w.u)} ${c.t}</b>, worth <b class="num">${fmt(w.u*c.p)}</b> (<span class="num ${w.u*c.p>=w.c?'up':'dn'}">${pct(w.u*c.p/w.c-1)}</span>).`:'<span class="mut">You hold none of this one.</span>'}</p>
    <div class="trade">${['100','1000','10000'].map(n=>`<button data-a="xbuy" data-x="${c.t}" data-y="${n}" ${c.dead||s.cash<+n?'disabled':''}>Buy ${fmt(+n)}</button>`).join('')}<button class="pri" data-a="xbuy" data-x="${c.t}" data-y="all" ${c.dead||s.cash<1?'disabled':''}>All in</button>
     <button data-a="xsell" data-x="${c.t}" data-y=".25" ${w?'':'disabled'}>Sell 25%</button><button data-a="xsell" data-x="${c.t}" data-y=".5" ${w?'':'disabled'}>Sell 50%</button><button class="bad" data-a="xsell" data-x="${c.t}" data-y="all" ${w?'':'disabled'}>Sell all</button></div>
   </section>
  </div>
  ${howto(`Every trade costs a 1% fee. New meme coins launch every few weeks. A few go up a hundredfold; most get rugged. Hustle Dollar holds at $1 and pays interest every day.`)}`;
},
casino(){
  const z=s.cz,ban=s.day<z.ban,can=!ban&&s.cash>=z.chip;
  const intro=`${z.played?`You're <b class="num ${z.net>=0?'up':'dn'}">${z.net>=0?'up':'down'} ${fmt(Math.abs(z.net))}</b> across ${z.played} games.`:'The house always wins in the end. Tonight might be different.'}${ban?` You've barred yourself for ${z.ban-s.day} more days.`:''}`;
  if(!cg)return `<section class="lede"><div><h2 class="headline">Casino</h2><p class="dek">${intro}</p></div></section>
  <div class="scroll"><table class="ledger"><thead><tr><th>Game</th><th>How it works</th><th class="r">House edge</th><th class="r">Played</th><th class="r">Your result</th><th></th></tr></thead><tbody>
  ${GAMES.map(g=>{const r=z.g?.[g.id];return `<tr class="pick" data-a="cg" data-x="${g.id}" tabindex="0"><td><b>${g.n}</b></td><td class="mut">${g.d}</td><td class="r num">${g.edge}</td><td class="r num">${r?.n||0}</td><td class="r num ${r?r.net>=0?'up':'dn':''}">${r?(r.net>=0?'+':'')+fmt(r.net):'—'}</td><td class="act"><button class="pri" data-a="cg" data-x="${g.id}">Play</button></td></tr>`}).join('')}
  </tbody></table></div>`;
  const G=GM[cg];
  return `<button class="back" data-a="cg">← All games</button>
  <section class="lede"><div><h2 class="headline">${G.n}</h2><p class="dek">${G.d} ${(r=>r?`You have played ${r.n} time${r.n>1?"s":""} and are <b class="num ${r.net>=0?"up":"dn"}">${r.net>=0?"up":"down"} ${fmt(Math.abs(r.net))}</b>.`:"")(z.g?.[cg])}${ban?` Barred for ${z.ban-s.day} more days.`:""}</p></div>
   <div class="side"><p class="mut">Bet per game</p><div class="row chips">${CHIPS.map(v=>`<button class="${z.chip===v?'on':''}" data-a="chip" data-x="${v}" ${s.cash<v&&z.chip!==v?'disabled':''}>${fmt(v)}</button>`).join('')}</div></div></section>
  <div class="table">${TABLES[cg](z,can)}</div>`;
},
home(){
  const f=flows(),idx=s.re.idx;let val=0,debt=0;for(const p of s.props){val+=pval(p);debt+=p.loan}
  return `<section class="lede"><div><h2 class="headline">Property</h2>
    <p class="dek">${s.props.length?`You own ${s.props.length===1?'one property':s.props.length+' properties'} worth <b class="num">${fmt(val)}</b>${debt?`, with <b class="num">${fmt(debt)}</b> still owed to the bank`:''}. Tenants pay you <b class="num">${fmt(f.rent)}</b> a day.`:'You own nothing yet, so rent costs you $30 a day. A small flat on a mortgage can cost less than that.'}</p></div>
    <div class="side"><p class="mut"><span class="figure ${idx>=1?'up':'dn'}">${pct(idx-1)}</span><br>house prices this lifetime</p></div></section>
  ${s.props.length?`<h3>Your properties</h3><div class="scroll"><table class="ledger"><thead><tr><th>Property</th><th class="r">Paid</th><th class="r">Worth now</th><th class="r">Owed</th><th class="r">Rent a day</th><th>Status</th><th></th></tr></thead><tbody>
   ${s.props.map(p=>{const v=pval(p),k=PM[p.t],home=s.home===p.uid;return `<tr><td><b>${pname(p)}</b></td><td class="r num">${fmt(p.paid)}</td><td class="r num ${v>=p.paid?'up':'dn'}">${fmt(v)}</td><td class="r num">${p.loan?fmt(p.loan):'—'}</td><td class="r num">${home?'—':fmt(v*k.yld/365)}</td>
    <td>${home?'Your home':s.day<p.from?`Finding a tenant, ${p.from-s.day}d`:'Rented out'}</td>
    <td class="act">${home?`<button data-a="moveout" data-x="${p.uid}">Move out</button>`:k.biz?'':`<button data-a="live" data-x="${p.uid}">Live here</button>`}${p.loan?`<button data-a="payoff" data-x="${p.uid}" ${s.cash<p.loan?'disabled':''}>Pay off</button>`:''}<button class="bad" data-a="psell" data-x="${p.uid}">Sell for ${fmt(v*.97-p.loan)}</button></td></tr>`}).join('')}
   </tbody></table></div>`:''}
  <h3>For sale</h3>
  <div class="scroll"><table class="ledger"><thead><tr><th>Listing</th><th class="r">Price</th><th class="r">Rent a day</th><th class="r">Mortgage a day</th><th></th></tr></thead><tbody>
  ${s.re.list.map(l=>{const k=PM[l.t],v=k.base*l.m*idx,ok=s.cash>=v*.2&&canBorrow(v*.8);return `<tr class="${s.cash>=v||ok?'':'dim'}"><td><b>${k.n}, ${l.loc}</b>${k.biz?' <span class="mut">· investment only</span>':''}</td><td class="r num">${fmt(v)}</td><td class="r num">${fmt(v*k.yld/365)}</td><td class="r num">${fmt(mpay(v*.8))}</td>
   <td class="act"><button data-a="pbuy" data-x="${l.uid}" ${s.cash<v?'disabled':''}>Buy outright</button><button class="pri" data-a="pbuy" data-x="${l.uid}" data-y="m" ${ok?'':'disabled'}>Mortgage, ${fmt(v*.2)} down</button></td></tr>`}).join('')}
  </tbody></table></div>
  ${howto(`New listings in ${s.re.next-s.day} days. Mortgages take 20% down and run 30 years at 5.5%, and the bank only lends while repayments stay under 40% of your income. Selling costs 3% in fees. Anything you don't live in gets rented out once a tenant is found.`)}`;
},
garage(){
  let val=0;for(const c of s.cars)val+=c.v;const b=bestCar();
  return `<section class="lede"><div><h2 class="headline">Garage</h2>
    <p class="dek">${s.cars.length?`${s.cars.length===1?'One car':s.cars.length+' cars'} worth <b class="num">${fmt(val)}</b>. Your ${CM[b.t].n.toLowerCase()} is the one that lifts your mood. Every car adds followers and upkeep.`:'No car yet. Most lose value the moment you drive them off the lot. Classics are the exception.'}</p></div></section>
  ${s.cars.length?`<h3>Your cars</h3><div class="scroll"><table class="ledger"><thead><tr><th>Car</th><th class="r">Paid</th><th class="r">Worth now</th><th class="r">Upkeep a day</th><th></th></tr></thead><tbody>
   ${s.cars.map(c=>`<tr><td><b>${CM[c.t].n}</b><div class="sub">owned ${Math.floor((s.day-c.bought)/365)}y ${(s.day-c.bought)%365}d</div></td><td class="r num">${fmt(c.paid)}</td><td class="r num ${c.v>=c.paid?'up':'dn'}">${fmt(c.v)}</td><td class="r num">${fmt(CM[c.t].up)}</td><td class="act"><button class="bad" data-a="csell" data-x="${c.uid}">Sell for ${fmt(c.v)}</button></td></tr>`).join('')}
   </tbody></table></div>`:''}
  <h3>Dealership</h3>
  <div class="scroll"><table class="ledger"><thead><tr><th>Model</th><th class="r">Price</th><th class="r">Value a year</th><th class="r">Upkeep a day</th><th class="r">Mood</th><th class="r">Followers a year</th><th></th></tr></thead><tbody>
  ${CARS.map(k=>`<tr class="${s.cash>=k.price?'':'dim'}"><td><b>${k.n}</b>${k.vol?' <span class="mut">· collectible</span>':''}</td><td class="r num">${fmt(k.price)}</td><td class="r num ${k.dep<0?'up':'dn'}">${k.dep<0?'+':'−'}${Math.abs(k.dep*100).toFixed(0)}%</td><td class="r num">${fmt(k.up)}</td><td class="r num">+${Math.round(k.hap/.004)}</td><td class="r num">${k.fame?big(k.fame*365):'—'}</td><td class="act"><button class="pri" data-a="cbuy" data-x="${k.id}" ${s.cash<k.price?'disabled':''}>Buy</button></td></tr>`).join('')}
  </tbody></table></div>
  ${howto(`Only your best car lifts your mood, but every car adds followers. New cars lose 10% the day you drive them away. Collectibles swing in value and tend to climb.`)}`;
},
shop(){
  return `<section class="lede"><div><h2 class="headline">Lifestyle</h2>
    <p class="dek">Nice things lift your everyday mood, and flashy ones pull in followers. All of them cost upkeep. Sell anything back for 60%. Homes are under Property and cars are in the Garage.</p></div></section>
  <div class="scroll"><table class="ledger"><thead><tr><th>Item</th><th class="r">Price</th><th class="r">Mood</th><th class="r">Followers a year</th><th class="r">Upkeep a day</th><th></th></tr></thead><tbody>
  ${SHOP.map(i=>{const o=s.own[i.id];return `<tr class="${o||s.cash>=i.cost?'':'dim'}"><td><b>${i.n}</b></td><td class="r num">${fmt(i.cost)}</td><td class="r num">+${Math.round(i.hap/.004)}</td><td class="r num">${i.fame?big(i.fame*365):'—'}</td><td class="r num">${i.up?fmt(i.up):'—'}</td>
   <td class="act">${o?`<button class="bad" data-a="unown" data-x="${i.id}">Sell for ${fmt(i.cost*.6)}</button>`:`<button class="pri" data-a="own" data-x="${i.id}" ${s.cash<i.cost?'disabled':''}>Buy</button>`}</td></tr>`}).join('')}
  </tbody></table></div>`;
},
};
const cardHtml=(h,hide)=>h.map((c,i)=>hide&&i===1?'<span class="pc back"></span>':`<span class="pc ${(c&3)===1||(c&3)===2?'red':''}">${RK[c>>2]}${ST[c&3]}</span>`).join('');
const TABLES={
bj:(z,can)=>{const b=z.bj,live=b&&!b.done;return `<div class="felt"><div class="hand"><span class="mut">Dealer${b&&!live?` · ${hv(b.d)}`:''}</span><div>${b?cardHtml(b.d,live):''}</div></div>
   <div class="hand"><span class="mut">You${b?` · ${hv(b.p)}`:''}</span><div>${b?cardHtml(b.p):''}</div></div></div>
  <p class="result">${b?.msg||'Dealer stands on 17. Blackjack pays 3 to 2.'}</p>
  <div class="row">${live?`<button data-a="hit">Hit</button><button class="pri" data-a="stand">Stand</button><button data-a="dbl" ${b.p.length===2&&s.cash>=b.bet?'':'disabled'}>Double</button>`:`<button class="pri" data-a="deal" ${can?'':'disabled'}>Deal for ${fmt(z.chip)}</button>`}</div>`},
slot:(z,can)=>`<div class="reels">${(z.slot?.r||['7','BAR','★']).map(x=>`<span>${x}</span>`).join('')}</div>
  <p class="result">${z.slot?(z.slot.w?`Paid <b class="num">${fmt(z.slot.w)}</b>.`:'Nothing this time.'):'Three 7s pay 150×, three BARs 40×, three stars 15×. Any pair gives back 0.7×.'}</p>
  <button class="pri" data-a="slot" ${can?'':'disabled'}>Spin for ${fmt(z.chip)}</button>`,
rl:(z,can)=>{const L=z.rlast;return `<div class="wheel"><span class="rn big ${L?rc(L.n):''}">${L?L.n:'—'}</span><div class="hist">${z.rh.slice(1).map(n=>`<span class="rn ${rc(n)}">${n}</span>`).join('')}</div></div>
  <p class="result">${L?`${L.n}, ${L.n===0?'green':RED.has(L.n)?'red':'black'}. ${L.w?`You win <b class="num">${fmt(L.w)}</b>.`:'You lose.'}`:'Outside bets pay even money, dozens pay 2 to 1, a single number pays 35 to 1.'}</p>
  <div class="row">${RBETS.map(([k,l])=>`<button data-a="rl" data-x="${k}" ${can?'':'disabled'}>${l}</button>`).join('')}</div>
  <div class="scroll"><div class="board"><button class="rn g" data-a="rl" data-x="n0" ${can?'':'disabled'}>0</button>${[3,2,1].flatMap(r=>Array.from({length:12},(_,i)=>i*3+r)).map(n=>`<button class="rn ${rc(n)}" data-a="rl" data-x="n${n}" ${can?'':'disabled'}>${n}</button>`).join('')}</div></div>`},
dice:(z,can)=>{const D=z.dice;return `<div class="dice">${D?`<span>${D.a}</span><span>${D.b}</span>`:'<span>–</span><span>–</span>'}</div>
  <p class="result">${D?`Rolled ${D.a+D.b}. ${D.w?`You win <b class="num">${fmt(D.w)}</b>.`:'You lose.'}`:'Under 7 or over 7 pays 2.35×. Exactly 7 pays 5.8×.'}</p>
  <div class="row">${[['under','Under 7'],['seven','Exactly 7'],['over','Over 7']].map(([k,l])=>`<button class="pri" data-a="dice" data-x="${k}" ${can?'':'disabled'}>${l}</button>`).join('')}</div>`},
coin:(z,can)=>{const F=z.flip;return `<div class="coin">${F?(F.r==='h'?'Heads':'Tails'):'?'}</div>
  <p class="result">${F?(F.w?`Right call. Paid <b class="num">${fmt(F.w)}</b>.`:'Wrong call.'):'Call it. A right call pays 1.96×.'}</p>
  <div class="row"><button class="pri" data-a="flip" data-x="h" ${can?'':'disabled'}>Heads</button><button class="pri" data-a="flip" data-x="t" ${can?'':'disabled'}>Tails</button></div>`},
};
const ic=d=>`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const ICON={home:ic('<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>'),user:ic('<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4.5-6 8-6s7 2 8 6"/>'),work:ic('<rect x="3" y="7" width="18" height="13" rx="1"/><path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M3 12h18"/>'),
 store:ic('<path d="M4 9l1.5-5h13L20 9M4 9v11h16V9M4 9h16M9 20v-6h6v6"/>'),chart:ic('<path d="M4 19h16M6 15l4-5 3 3 5-7"/>'),coin:ic('<circle cx="12" cy="12" r="8"/><path d="M10 8h3a2 2 0 0 1 0 4h-3m0 0h3.5a2 2 0 0 1 0 4H10m0-8v8"/>'),building:ic('<path d="M5 21V4h9v17M14 9h5v12M8 8h3M8 12h3M8 16h3M3 21h18"/>'),
 car:ic('<path d="M5 16l1.5-5.5A2 2 0 0 1 8.4 9h7.2a2 2 0 0 1 1.9 1.5L19 16M4 16h16v3H4zM7 19v1.5M17 19v1.5"/>'),bag:ic('<path d="M6 8h12l-1 12H7zM9 8a3 3 0 0 1 6 0"/>'),chat:ic('<path d="M4 5h16v11H9l-5 4z"/>'),cap:ic('<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v5c0 1.5 3 3 6 3s6-1.5 6-3v-5"/>'),heart:ic('<path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/>'),
 dice:ic('<rect x="4" y="4" width="16" height="16" rx="2"/><circle cx="9" cy="9" r="1"/><circle cx="15" cy="15" r="1"/><circle cx="15" cy="9" r="1"/><circle cx="9" cy="15" r="1"/>'),pause:ic('<path d="M8 5v14M16 5v14"/>')};
const TABS={dash:['Home','home'],life:['Life','user'],work:['Work','work'],people:['People','heart'],school:['Education','cap'],biz:['Business','store'],stock:['Markets','chart'],crypto:['Crypto','coin'],home:['Property','building'],garage:['Garage','car'],shop:['Lifestyle','bag'],chirp:['Chirp','chat'],casino:['Casino','dice']};
const GROUPS=[['',['dash']],['You',['life','work','people','school']],['Money',['biz','stock','crypto','home']],['Spend',['garage','shop']],['Fun',['chirp','casino']]];
const BAR=[['Home',['dash'],'home'],['Life',['life','work','people','school'],'user'],['Money',['biz','stock','crypto','home'],'chart'],['Spend',['garage','shop'],'bag'],['Fun',['chirp','casino'],'dice']];
const KEYTABS=['dash','life','work','people','school','biz','stock','crypto','home','garage'];
const TOUR=[
 {tab:'dash',t:'Welcome to The Hustle',x:'One second of real time is one day of your life, and the clock keeps running while you play. The game is paused while this guide is open. The ? button replays it, and holds settings and keyboard shortcuts.',hi:['#guideBtn']},
 {tab:'dash',t:'Your numbers',x:'The top bar shows your cash, net worth, what you earn each day, and your age. Pause or speed up time with the buttons on the right.',hi:['.ticker','#speed']},
 {tab:'dash',t:'Needs you',x:'Home lists everything that needs your attention: decisions, money waiting to collect, and warnings. A decision left alone for 30 days decides itself.',hi:['.needs']},
 {tab:'dash',t:'Quick actions',x:'Gigs pay a little cash right away. Activities raise your health, happiness, smarts and looks, and each one has a cooldown.',hi:['.quick']},
 {tab:'work',t:'Work',x:'Your job pays every day. Interview for better jobs on the board. Working hard raises your performance, and promotions come every 120 days.',hi:['#view .ledger']},
 {tab:'school',t:'Education',x:'Degrees and certificates unlock better jobs. Better schools cost more and are harder to get into, but they impress employers. Student loans pay themselves off over time.',hi:['#view .ledger']},
 {tab:'people',t:'People',x:'Call, hang out and give gifts to stay close. Close relationships make you happier every day. Neglected ones fade, and a neglected partner may leave.',hi:['.plist']},
 {tab:'biz',t:'Businesses',x:'This is how you get rich. Buy a Lemonade Stand first. Tills fill up until you collect them. Hire a manager and the money comes in on its own, even when you are away.',hi:['.blist','#collectBtn']},
 {tab:'stock',t:'Grow your money',x:'Markets, Crypto and Property are other places to put spare cash. Prices move every day, so they can fall as well as rise.',hi:['#nav [data-x="stock"]','#nav [data-x="crypto"]','#nav [data-x="home"]','#tabbar [data-x="2"]']},
 {tab:'dash',t:'Getting around',x:'The menu groups every screen, and on a phone it sits at the bottom. Keys 1 to 0 switch screens, Space pauses, and C collects every till. That is everything. Enjoy your life.',hi:['#nav','#tabbar']},
];
function coach(){
  document.querySelectorAll('.tour-hi').forEach(e=>e.classList.remove('tour-hi'));
  const c=$('#coach');if(tour<0||!s){c.hidden=true;return}
  const T=TOUR[tour],last=tour===TOUR.length-1;
  c.innerHTML=`<p class="kicker">Guide · ${tour+1} of ${TOUR.length}</p><h3>${T.t}</h3><p>${T.x}</p><div class="row"><button data-a="tback" ${tour?'':'disabled'}>Back</button><button class="pri" data-a="tnext">${last?'Start playing':'Next'}</button><button class="link" data-a="tend">Skip the guide</button></div>`;c.hidden=false;
  let first=null;for(const q of T.hi)for(const el of document.querySelectorAll(q)){el.classList.add('tour-hi');if(!first&&el.offsetParent)first=el}
  if(tourJump&&first){first.scrollIntoView({block:'center'});tourJump=false}
}
function badge(k){
  if(k==='dash'){const n=needs().length;return n?`<span class="badge">${n}</span>`:''}
  if(k==='biz'){const p=pendAll();return p>=1?`<span class="tag gold">${fmt(p)}</span>`:''}
  if(k==='stock'){const d=idxDay();return `<span class="tag ${d>=0?'up':'dn'}">${pct(d)}</span>`}
  if(k==='crypto'){const c=coin('SATS'),d=c?c.p/c.o-1:0;return `<span class="tag ${d>=0?'up':'dn'}">${pct(d)}</span>`}
  if(k==='chirp')return cdLeft('post')?'':'<span class="tag mut">ready</span>';
  if(k==='life')return ['hea','hap'].some(x=>s.st[x]<25)?'<span class="tag dn">low</span>':'';
  if(k==='work')return s.job&&s.perf<25?'<span class="tag dn">at risk</span>':'';
  if(k==='school')return s.study?`<span class="tag gold">${Math.round((1-s.study.left/s.study.days)*100)}%</span>`:'';
  if(k==='people')return partner()?.rel<30?'<span class="tag dn">low</span>':'';
  if(k==='casino')return s.cz.bj&&!s.cz.bj.done?'<span class="tag gold">hand open</span>':'';
  return '';
}
const railHtml=()=>GROUPS.map(([g,ks])=>(g?`<div class="grp">${g.toUpperCase()}</div>`:'')+ks.map(k=>`<button class="${tab===k?'on':''}" data-a="tab" data-x="${k}" ${tab===k?'aria-current="page"':''}>${ICON[TABS[k][1]]}${TABS[k][0]}${badge(k)}</button>`).join('')).join('')
  ;
const barHtml=()=>BAR.map(([n,ks,ico],i)=>{const nb=i===0?needs().length:0;return `<button class="${ks.includes(tab)?'on':''}" data-a="grp" data-x="${i}">${ICON[ico]}${n}${nb?`<span class="badge">${nb}</span>`:''}</button>`}).join('');
const subtabs=()=>{const b=BAR.find(b=>b[1].includes(tab));return b&&b[1].length>1?`<div class="subtabs">${b[1].map(k=>`<button class="${k===tab?'on':''}" data-a="tab" data-x="${k}">${TABS[k][0]}</button>`).join('')}</div>`:''};

function hdr(){
  if(!s)return;const f=flows(),net=f.job+f.biz+f.pend+f.spon+f.rent-f.exp-f.mort,p=pendAll();
  $('#dateline').textContent=`year ${Math.floor(s.day/365)+1}, day ${s.day%365+1}`;
  $('#hCash').textContent=fmt(s.cash);$('#hCash').className=s.cash<0?'dn':'';
  $('#hNw').textContent=fmt(netWorth());
  $('#hInc').textContent=(net>=0?'+':'')+fmt(net);$('#hInc').className=net>=0?'up':'dn';
  $('#hAge').textContent=Math.floor(age());
  const cb=$('#collectBtn');cb.hidden=p<1;cb.textContent=`Collect all · ${fmt(p)}`;
  $('#statsH').textContent=`How ${s.name} is doing`;
  $('#sbars').innerHTML=[['hea','Health'],['hap','Happiness'],['sma','Smarts'],['loo','Looks']].map(([k,n])=>{const v=s.st[k],lo=v<25?'low':'';return `<span class="${lo}">${n}</span>${meter(v,lo)}<span class="n ${lo}">${Math.round(v)}</span>`}).join('');
  $('#log').innerHTML=s.log.map(l=>`<div class="lg ${l.k}"><small>${Math.floor(s.startAge+l.d/365)}</small><span>${l.t}</span></div>`).join('');
}
function render(){
  if(!s)return;hdr();
  document.body.classList.toggle('wide',!['dash','life'].includes(tab));
  $('#speed').innerHTML=[[0,'Pause'],[1,'1×'],[2,'2×'],[5,'5×'],[10,'10×']].map(([v,l])=>`<button class="${speed===v?'on':''}" data-a="spd" data-x="${v}" ${v?'':'aria-label="Pause"'}>${v?l:ICON.pause}</button>`).join('');
  $('#nav').innerHTML=railHtml();$('#tabbar').innerHTML=barHtml();
  $('#view').innerHTML=subtabs()+VIEWS[tab]();
  if(tab==='stock')drawStock();
  if(tab==='crypto'){const c=coin(csel),w=s.wallet[csel];if(c)drawChart(c.h,w&&w.c/w.u,pfmt)}
  coach();
}
function drawStock(){
  const c=$('#tchart');if(!c)return;const dpr=devicePixelRatio||1,W=c.clientWidth,H=c.clientHeight;c.width=W*dpr;c.height=H*dpr;
  const T=n=>getComputedStyle(document.documentElement).getPropertyValue(n).trim(),g=c.getContext('2d');g.scale(dpr,dpr);
  const k=SK[sel],all=s.px[sel].h,n=Math.min(TF[tf],all.length),st=all.length-n,grp=cmode==='candle'?Math.max(1,Math.ceil(n/60)):1,bars=[];
  for(let i=0;i<n;i+=grp){const ix=Array.from({length:Math.min(grp,n-i)},(_,j)=>st+i+j),seg=ix.map(j=>all[j]),o=ix[0]?all[ix[0]-1]:seg[0],cl=seg.at(-1),day=s.day-all.length+1+ix[0];
    bars.push({o,c:cl,hi:Math.max(o,...seg)*(1+.005*hsh(day,1)),lo:Math.min(o,...seg)*(1-.005*hsh(day,2)),v:ix.reduce((t,j)=>t+volAt(k,j),0),ago:all.length-1-ix.at(-1)})}
  const AX=62,PW=W-AX,PH=H*.76,VT=PH+10,VH=H-VT-16,lo0=Math.min(...bars.map(b=>b.lo)),hi0=Math.max(...bars.map(b=>b.hi)),pad=(hi0-lo0||hi0*.02)*.06,lo=lo0-pad,hi=hi0+pad,vmax=Math.max(...bars.map(b=>b.v));
  const X=i=>(i+.5)*PW/bars.length,Y=v=>6+(hi-v)/(hi-lo)*(PH-6),up=T('--color-up'),dn=T('--color-down'),mono=T('--font-mono');
  g.font=`11px ${mono}`;g.strokeStyle=T('--color-rule');g.fillStyle=T('--color-ink-3');g.lineWidth=1;
  for(let j=0;j<=4;j++){const v=lo+(hi-lo)*j/4,y=Y(v);g.beginPath();g.moveTo(0,y);g.lineTo(PW,y);g.stroke();g.fillText(fmt(v),PW+6,y+4)}
  g.fillText(`${n} days ago`,0,H-3);g.textAlign='right';g.fillText('Today',PW,H-3);g.textAlign='left';
  const rise=bars.at(-1).c>=bars[0].o;
  if(cmode==='line'){g.beginPath();bars.forEach((b,i)=>i?g.lineTo(X(i),Y(b.c)):g.moveTo(X(i),Y(b.c)));g.strokeStyle=rise?up:dn;g.lineWidth=1.6;g.lineJoin='round';g.stroke();
    g.lineTo(X(bars.length-1),PH);g.lineTo(X(0),PH);g.globalAlpha=.12;g.fillStyle=rise?up:dn;g.fill();g.globalAlpha=1}
  else{const bw=Math.max(1,PW/bars.length*.64);for(const[i,b]of bars.entries()){const col=b.c>=b.o?up:dn,x=X(i);g.strokeStyle=g.fillStyle=col;g.beginPath();g.moveTo(x,Y(b.hi));g.lineTo(x,Y(b.lo));g.stroke();
    const y1=Y(Math.max(b.o,b.c)),y2=Y(Math.min(b.o,b.c));g.fillRect(x-bw/2,y1,bw,Math.max(1,y2-y1))}}
  g.globalAlpha=.45;for(const[i,b]of bars.entries()){g.fillStyle=b.c>=b.o?up:dn;const bh=b.v/vmax*VH,bw=Math.max(1,PW/bars.length*.64);g.fillRect(X(i)-bw/2,VT+VH-bh,bw,bh)}g.globalAlpha=1;
  const last=all.at(-1),ly=Y(last);g.setLineDash([2,3]);g.strokeStyle=rise?up:dn;g.beginPath();g.moveTo(0,ly);g.lineTo(PW,ly);g.stroke();
  const p=s.port[sel];if(p){const a=p.cost/p.sh;if(a>lo&&a<hi){g.strokeStyle=T('--color-accent');g.beginPath();g.moveTo(0,Y(a));g.lineTo(PW,Y(a));g.stroke();g.fillStyle=T('--color-accent');g.fillText('your avg',4,Y(a)-4)}}
  g.setLineDash([]);g.fillStyle=rise?up:dn;g.fillRect(PW+2,ly-9,AX-2,18);g.fillStyle=T('--color-paper');g.fillText(fmt(last),PW+6,ly+4);
  if(hov!=null&&hov<PW){const i=clamp(Math.floor(hov/PW*bars.length),0,bars.length-1),b=bars[i],x=X(i);
    g.strokeStyle=T('--color-ink-3');g.setLineDash([3,3]);g.beginPath();g.moveTo(x,0);g.lineTo(x,H-16);g.stroke();g.setLineDash([]);
    const lines=[b.ago?`${b.ago} days ago`:'Today',`O ${fmt(b.o)}  H ${fmt(b.hi)}`,`L ${fmt(b.lo)}  C ${fmt(b.c)}`,`Vol ${big(b.v)}`],bx=x>PW/2?8:PW-200;
    g.fillStyle=T('--color-paper-2');g.fillRect(bx,8,192,lines.length*16+10);g.strokeStyle=T('--color-rule');g.strokeRect(bx,8,192,lines.length*16+10);
    g.fillStyle=T('--color-ink');lines.forEach((l,j)=>g.fillText(l,bx+8,26+j*16))}
}
function drawChart(h,avg,f=fmt){
  const c=$('#chart');if(!c)return;const dpr=devicePixelRatio||1,W=c.clientWidth,H=c.clientHeight;c.width=W*dpr;c.height=H*dpr;
  const T=n=>getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const g=c.getContext('2d');g.scale(dpr,dpr);const lo=Math.min(...h),hi=Math.max(...h),P=6;
  const X=i=>P+i/(h.length-1)*(W-P*2),Y=v=>H-P-(v-lo)/(hi-lo||1)*(H-P*2-14);
  g.beginPath();h.forEach((v,i)=>i?g.lineTo(X(i),Y(v)):g.moveTo(X(i),Y(v)));
  g.strokeStyle=T(h[h.length-1]>=h[0]?'--color-up':'--color-down');g.lineWidth=1.5;g.lineJoin='round';g.stroke();
  if(avg){const a=avg;if(a>=lo&&a<=hi){g.setLineDash([3,4]);g.strokeStyle=T('--color-ink-3');g.lineWidth=1;g.beginPath();g.moveTo(P,Y(a));g.lineTo(W-P,Y(a));g.stroke();g.setLineDash([]);g.fillStyle=T('--color-ink-3');g.font=`11px ${T('--font-mono')}`;g.fillText('your average',W-P-80,Y(a)-4)}}
  g.fillStyle=T('--color-ink-2');g.font=`11px ${T('--font-mono')}`;g.fillText(`${f(hi)} · ${h.length}-day high`,P,12);g.fillText(`${f(lo)} low`,P,H-5);
}

// ---------- loop, input, save ----------
document.addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(!b||b.disabled)return;ACT[b.dataset.a](b.dataset.x,b.dataset.y);if(s&&!s.dead)checkGoals();if(s&&$('#modal').hidden)render();else hdr()});
document.addEventListener('mousemove',e=>{if(e.target.id==='tchart'){hov=e.offsetX;drawStock()}});
document.addEventListener('mouseout',e=>{if(e.target.id==='tchart'){hov=null;drawStock()}});
document.addEventListener('keydown',e=>{ // 1–0 screens, Space pause, C collect
  if(!s||s.dead||!$('#modal').hidden||e.ctrlKey||e.metaKey||e.altKey||e.target.closest?.('input,textarea,select'))return;
  const k='1234567890'.indexOf(e.key);
  if(e.key==='?'){ACT.guide();render()}
  else if(e.key==='Escape'&&tour>=0){ACT.tend();render()}
  else if(k>=0){ACT.tab(KEYTABS[k]);render()}
  else if(e.key===' '&&!e.target.closest?.('button,tr,a')){e.preventDefault();ACT.spd(speed?0:lastSpeed||1);render()}
  else if(e.key==='c'||e.key==='C'){ACT.colAll();render()}
});
document.addEventListener('keydown',e=>{const r=e.target.closest?.('tr[data-a]');if(r&&(e.key==='Enter'||e.key===' ')){e.preventDefault();r.click()}});
addEventListener('pointerdown',()=>holding=true);
addEventListener('pointerup',()=>holding=false);addEventListener('pointercancel',()=>holding=false);
let last=performance.now(),acc=0;
setInterval(()=>{
  const now=performance.now(),dt=now-last;last=now;
  if(!s||s.dead||!speed||document.hidden||!$('#modal').hidden)return; // decisions & dialogs pause time
  acc=Math.min(acc+dt*speed/1000,20);let n=0;
  while(acc>=1){acc--;day();n++;if(s.dead)break}
  if(n){if(holding)hdr();else render()} // ponytail: skip DOM rebuild mid-click so buttons don't vanish under the cursor
},100);
function save(){if(!s||wiped)return;s.lastSeen=Date.now();try{localStorage.setItem(SAVE,JSON.stringify(s))}catch{}}
setInterval(save,5000);addEventListener('beforeunload',save);
document.addEventListener('visibilitychange',()=>{if(!s||s.dead)return;if(document.hidden){save();hiddenAt=Date.now()}else if(hiddenAt){offline(Date.now()-hiddenAt);hiddenAt=0;render()}});

function selfTest(){ // open with ?test=1 — never touches your real save
  wiped=true;const ok=(c,m)=>{if(!c)throw Error(m)};
  ok(fmt(1234)==='$1.23K','fmt K');ok(fmt(12.5)==='$12.50','fmt cents');ok(fmt(-2e6)==='-$2.00M','fmt neg');ok(bmul(25)===4,'milestones');
  ok(Math.abs(bcost(BIZ[0],0,2)-(120+120*GROW))<1e-6,'bcost sum');
  newGame('Test','street');s.cash=1e7;ACT.bbuy('lemon','max');ok(s.biz.lemon.n>=25&&bmax(BIZ[0],s.biz.lemon.n)===0,'buy max spends down');
  s.cash=1e6;ACT.buy('NOVA','10');ACT.sell('NOVA','all');ok(!s.port.NOVA,'sell all');
  s.cash=2e5;s.job='crew';relist();s.re.list[0]={...s.re.list[0],t:'studio'};const lu=s.re.list[0].uid;ACT.pbuy(lu,'m');
  const hp=homeP();ok(hp&&hp.loan>0&&s.home===hp.uid,'mortgage buy moves you in');const l0=hp.loan;for(let i=0;i<365;i++)day();ok(P(hp.uid).loan<l0,'mortgage amortises');
  s.cash=2e7;ACT.cbuy('hatch');ACT.cbuy('classic');const h0=s.cars[0].v;for(let i=0;i<365;i++)day();ok(s.cars[0].v<h0,'cars depreciate');
  ACT.live(hp.uid);ACT.moveout(hp.uid);ok(!s.home,'move out');ACT.psell(hp.uid);ok(!s.props.length,'sell property');
  let tot=0;for(let i=0;i<200000;i++)tot+=slotSpin().m;const rtp=tot/2e5;ok(rtp>.86&&rtp<.97,'slots RTP '+rtp.toFixed(3));
  ok(rlMult('red',1)===2&&rlMult('red',0)===0&&rlMult('black',1)===0&&rlMult('n17',17)===36&&rlMult('n17',18)===0&&rlMult('d2',13)===3&&rlMult('low',18)===2,'roulette payouts');
  ok(hv([4,52])===21&&hv([4,5,36])===21&&hv([40,44,48])===30&&hv([4,20])===16,'hand values');
  s.cash=1e7;s.cz.chip=100;const c0=s.cash;for(let i=0;i<3000;i++){ACT.deal();while(!s.cz.bj.done)hv(s.cz.bj.p)<17?ACT.hit():ACT.stand()}
  const edge=(s.cash-c0)/3e5;ok(s.cz.played===3000&&edge>-.15&&edge<.08,'blackjack edge '+edge.toFixed(3));
  s.cash=1e5;ACT.xbuy('SATS','10000');const u0=s.wallet.SATS.u;ok(u0>0&&s.cash===9e4,'crypto buy');ACT.xsell('SATS','.5');ok(Math.abs(s.wallet.SATS.u-u0/2)<1e-12,'crypto sell half');
  s.cash=5e9;relist();ACT.pbuy(s.re.list[0].uid);ACT.pbuy(s.re.list[1].uid);s.props.at(-1).from=0;s.home=s.props[0].uid;ok(s.props.length===2,'two properties');s.cash=5e6;
  for(let i=0;i<1500;i++)cryptoDay();ok(s.cx.launched>0,'meme coins launch');ACT.xbuy(s.cx.coins[0].t,'1000');
  s.people=[];makeFamily();ok(s.people.filter(p=>p.role==='parent').length===2,'family made');
  const dt=meet('date',100);dt.met=-1000;s.cash=1e11;for(let i=0;i<30&&dt.role==='date';i++){dt.rel=100;ACT.pp(dt.uid,'propose')}ok(dt.role==='spouse','propose');
  for(let i=0;i<30&&!kids().length;i++){dt.c.baby=0;dt.rel=100;ACT.pp(dt.uid,'baby')}ok(kids().length===1,'baby');
  const r0=dt.rel;for(let i=0;i<100;i++)peopleDay();ok(dt.rel<r0,'relationships fade');
  ACT.pp(dt.uid,'divorce');ok(dt.role==='spouse'&&!$('#modal').hidden,'divorce asks first');ACT.pp(dt.uid,'divorce!');ok(dt.role==='ex'&&$('#modal').hidden,'divorce');
  ok(jobMiss(JM.surgeon).length&&canJob(JM.crew),'job requirements');s.job=null;ACT.apply('crew');ok(iv&&!$('#modal').hidden,'interview opens');ACT.answer('exp');ok(s.job==='crew'||s.cd.job_crew>s.day,'interview resolves');
  s.job='crew';s.perf=40;ACT.work('hard');ok(s.perf===45,'work hard');
  s.study=null;s.st.sma=90;s.cash=1e7;ACT.learn('ba');ok(enr&&!$('#modal').hidden,'enroll opens');ACT.mj('Nursing');ACT.enroll('online','cash');ok(s.study?.mj==='Nursing','enrolled');
  s.study.g=90;for(let i=0;i<500&&s.study;i++)day();ok(s.degs.some(d=>d.p==='ba'&&d.mj==='Nursing')&&s.edu>=2&&canJob(JM.nurse),'graduated as nurse');
  s.cash=0;s.debt=0;ACT.learn('ma');ACT.enroll('online','loan');ok(s.study&&s.debt>0,'student loan');const d0=s.debt;for(let i=0;i<30;i++)day();ok(s.debt<d0,'loan repays');
  ok(xpY('health')>=1,'major counts as experience');tab='school';VIEWS.school();
  s.tour=0;ACT.guide();ok(tour===0&&speed===0,'guide starts paused');for(let i=0;i<TOUR.length;i++)ACT.tnext();ok(tour===-1&&s.tour===1&&speed>0,'guide finishes');
  const sp=meet('spouse',60),ex=meet('ex',20),kd=addChild();kd.b=s.day-8*365;meet('friend',60);(s.people.find(p=>p.role==='parent')||meet('parent',60)).b=s.day-66*365;s.inbox=[];for(const q of s.props)if(q.uid!==s.home)q.from=0;for(const p of s.people)if(p.role==='friend')p.rel=60;
  const base=JSON.stringify({...s,job:'swe',fol:20000,cash:2e6,biz:{truck:{n:12,mgr:0,pend:0,spent:1e5},cafe:{n:3,mgr:1,pend:0,spent:1e5}},port:{NOVA:{sh:50,cost:5000}}});
  for(const e of EV)for(const[,fx]of e.ch){s=JSON.parse(base);s.st.hap=10;const m=fx(s,e.a?e.a(s):0);ok(typeof m==='string','event '+e.id)}
  for(const k in POSTS){s=JSON.parse(base);ACT.post(k)}
  for(const k in VIEWS){tab=k;VIEWS[k]()}ok(railHtml().includes('Markets')&&barHtml().includes('Money')&&typeof subtabs()==='string','navigation');
  s.inbox=[{id:'lotto',d:s.day,a:0}];ok(needs().some(n=>n.k==='dec'),'decision shows in needs');ACT.pick('lotto','1');ok(!s.inbox.length,'inline decision');
  ok(plural('Car Wash')==='Car Washes'&&plural('Rocket Company')==='Rocket Companies'&&plural('Food Truck')==='Food Trucks','plurals');
  bmode='10';tab='biz';VIEWS.biz();bmode='1';for(const g of GAMES){cg=g.id;VIEWS.casino()}cg=null;
  s.cash=1e6;sel='NOVA';ot={side:'buy',qty:7};const n0=s.port.NOVA?.sh||0;ACT.order();ok(s.port.NOVA.sh===n0+7,'order ticket buys');ot.side='sell';ot.qty=3;ACT.order();ok(s.port.NOVA.sh===n0+4,'order ticket sells');ot={side:'buy',qty:10};
  s.cz.chip=100;for(let i=0;i<20000;i++){ACT.dice(['under','over','seven'][i%3]);ACT.flip(i%2?'h':'t')}const dg=s.cz.g.dice,cf=s.cz.g.coin;
  ok(dg.n===20000&&cf.n===20000&&dg.net/2e6>-.08&&dg.net/2e6<.02&&cf.net/2e6>-.05&&cf.net/2e6<.01,'dice and coin edges');
  newGame('Old','street');delete s.re;delete s.cx;delete s.cz;delete s.people;delete s.degs;s.edu=2;s.study={lvl:3,left:50};s.rel=2;s.kids=2;s.own={apt:1,car:1,bike:1};s.port.MOON={sh:10,cost:12};upgrade();ok(partner()?.role==='spouse'&&kids().length===2&&!('rel' in s),'old relationships upgrade');ok(s.degs.length===2&&s.study.p==='ma','old education upgrade');ok(s.props.length===1&&s.cars.length===1&&s.own.bike&&homeP()&&s.wallet.MOON.u===10&&!s.port.MOON&&s.cz,'old saves upgrade');
  newGame('Goal','street');s.cash=2e6;checkGoals();ok(s.goals.nw1&&s.goals.nw2&&!s.goals.nw3,'goals unlock');const gn=Object.keys(s.goals).length;checkGoals();ok(Object.keys(s.goals).length===gn,'goals unlock once');delete s.goals;upgrade();ok(s.goals.nw2&&s.log[0].t.includes('already reached'),'old saves backfill goals quietly');
  tab='dash';ok(VIEWS.dash().includes('Goals'),'goals on home');goalsModal();
  const sp2=meet('spouse',70),k1=addChild(),k2=addChild(),k3=addChild();k1.b=s.day-40*365;k2.b=s.day-30*365;k3.b=s.day-5*365;k1.rel=90;
  deathModal();ok($('#mbox').innerHTML.includes('Continue as '+k1.n),'death lists the kids');ACT.heir(String(k1.uid));
  ok(heir.kid===k1.n&&Math.floor(heir.age)===40&&heir.fam.length===3,'heir from a kid');newGame(k1.n,'street',heir);
  ok(s.gen===2&&Math.floor(age())===40&&s.goals.nw2&&s.people.some(p=>p.role==='parent'&&p.n===sp2.n)&&s.people.filter(p=>p.role==='sibling').map(p=>Math.floor(ageOf(p))).sort((a,b)=>a-b).join()==='5,30','heir keeps family and goals');
  newGame('Young','street');const y1=addChild(),y2=addChild();y1.b=-5*365;y2.b=-2*365;const hy=heirOf(y1);ok(Math.round(hy.age)===18&&Math.round(-hy.fam[0].b/365)===15,'a young heir comes of age');
  newGame('Solo','street');ACT.heir();ok(!heir.kid&&!heir.fam&&heir.gen===2,'no kids, a relative inherits');$('#modal').hidden=true;
  newGame('Sim','rich');let d=0;for(;d<40000&&!s.dead;d++){day();if(d%7===0){s.inbox=[];ACT.colAll()}}
  const vals=[s.cash,netWorth(),s.fol,...Object.values(s.st),...Object.values(s.px).map(q=>q.p),...s.cx.coins.map(c=>c.p),walletVal()];
  ok(vals.every(Number.isFinite),'finite after sim');ok(s.dead,'eventually dies');
  console.log(`self-test passed · simulated ${d} days, died at ${Math.floor(age())}`);
}

(function boot(){
  if(location.search.includes('test')){try{selfTest()}catch(e){console.error('self-test FAILED:',e.message)}s=null;tab='dash';}
  let d=null;if(!wiped)try{d=JSON.parse(localStorage.getItem(SAVE))}catch{}
  if(d?.v===1){s=d;upgrade();render();if(s.dead)deathModal();else offline(Date.now()-s.lastSeen)}
  else startModal();
})();
