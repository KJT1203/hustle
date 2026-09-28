// ---------- helpers ----------
const $=q=>document.querySelector(q),$$=q=>document.querySelectorAll(q);
const R=Math.random,rint=(a,b)=>a+Math.floor(R()*(b-a+1)),pick=a=>a[Math.floor(R()*a.length)],clamp=(v,a,b)=>v<a?a:v>b?b:v;
let gsp=null;const gauss=()=>{if(gsp!==null){const g=gsp;gsp=null;return g}let u=0,v=0;while(!u)u=R();while(!v)v=R();const r=Math.sqrt(-2*Math.log(u));gsp=r*Math.sin(6.2832*v);return r*Math.cos(6.2832*v)}; // Box-Muller, keeping the spare
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
 {id:'crew',n:'Fast Food Worker',fld:'food',e:0,s:0,pay:60,str:2},
 {id:'rider',n:'Delivery Rider',fld:'delivery',e:0,s:0,pay:72,str:3},
 {id:'retail',n:'Retail Associate',fld:'retail',e:0,s:25,pay:88,str:2},
 {id:'chef',n:'Line Chef',fld:'food',e:0,s:25,pay:118,str:4,x:{food:1}},
 {id:'smgr',n:'Store Manager',fld:'retail',e:0,s:35,pay:165,str:3,x:{retail:2}},
 {id:'admin',n:'Office Admin',fld:'office',e:1,s:35,pay:140,str:1},
 {id:'elec',n:'Electrician',fld:'trade',e:0,dg:'cert',s:30,pay:190,str:2},
 {id:'army',n:'Soldier',fld:'military',e:0,s:15,pay:95,str:4,h:60,rk:['Private','Corporal','Sergeant','Staff Sergeant','Master Sergeant','Sergeant Major']},
 {id:'officer',n:'Army Officer',fld:'military',e:2,s:50,pay:270,str:4,h:60,rk:['Lieutenant','Captain','Major','Lieutenant Colonel','Colonel','General']},
 {id:'model',n:'Fashion Model',fld:'fashion',e:0,s:0,pay:420,str:3,lk:80,end:40,rk:['New Face','Model','Top Model','Supermodel','Icon','Legend']},
 {id:'actor',n:'Actor',fld:'film',e:0,s:30,pay:650,str:3,lk:65,f:50000,rk:['Extra','Actor','Lead Actor','Star','A-Lister','Screen Legend']},
 {id:'athlete',n:'Pro Athlete',fld:'sports',e:0,s:0,pay:1600,str:4,h:85,sk:['sport',70],young:30,end:36,rk:['Rookie','Starter','Veteran','All-Star','Captain','Legend']},
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
 {id:'cert',n:'Trade certificate',at:'City Trade Institute',lvl:1,need:0,days:365,cost:5000,sma:4,min:20},
 {id:'academy',n:'Police academy',at:'Metro Police Academy',lvl:1,need:0,days:180,cost:2000,sma:3,min:25,hea:55},
 {id:'camp',n:'Coding bootcamp',at:'ByteForge Bootcamp',lvl:1,need:0,days:90,cost:12000,sma:6,min:35,xp:'tech'},
 {id:'dip',n:'Diploma',lvl:1,need:0,days:180,cost:6000,sma:10,min:0,mj:1,sch:['online','cc']},
 {id:'ba',n:"Bachelor's degree",lvl:2,need:0,days:1095,cost:35000,sma:12,min:35,mj:1,sch:['online','state','priv','elite']},
 {id:'flight',n:'Flight school',at:'Skyline Flight School',lvl:1,need:0,days:540,cost:90000,sma:5,min:50,hea:70},
 {id:'teach',n:'Teaching certificate',at:'Midtown State University',lvl:2,need:2,days:365,cost:8000,sma:3,min:40},
 {id:'ma',n:"Master's degree",lvl:3,need:2,days:730,cost:60000,sma:10,min:55,mj:1,sch:['online','state','priv','elite']},
 {id:'mba',n:'MBA',lvl:3,need:2,days:730,cost:120000,sma:8,min:55,sch:['state','priv','elite']},
 {id:'jd',n:'Law school (JD)',lvl:3,need:2,days:1095,cost:150000,sma:12,min:65,sch:['state','priv','elite']},
 {id:'md',n:'Medical school (MD)',lvl:4,need:2,days:1460,cost:250000,sma:15,min:72,sch:['state','priv','elite']},
 {id:'phd',n:'PhD',lvl:4,need:3,days:1825,cost:0,sma:15,min:70,mj:1,stipend:60,sch:['state','priv','elite']},
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
const FIELD={fashion:'fashion',film:'film',sports:'sport',military:'the military',academia:'academia',food:'food service',delivery:'delivery',retail:'retail',office:'office work',trade:'the trades',public:'public service',creative:'creative work',tech:'tech',health:'healthcare',finance:'finance',law:'law',aviation:'aviation',exec:'management'};
const IVQ=['Why should we hire you?','Tell us about a time you solved a hard problem.','Where do you see yourself in five years?','What is your biggest weakness?','How do you handle pressure?'];
const WORK={
 hard:{n:'Work hard',cd:4,fx:()=>{s.perf=clamp(s.perf+(boss()?.bt==='micro'?7:5),0,100);add('hap',-1);return 'Long day. Your boss noticed.'}},
 slack:{n:'Slack off',cd:3,fx:()=>{s.perf=clamp(s.perf-(boss()?.bt==='micro'?12:6),0,100);add('hap',4);return 'An hour of videos. Worth it?'}},
 net:{n:'Network',cd:14,c:100,fx:()=>{s.perf=clamp(s.perf+4,0,100);if(R()<.3&&friendsN()<10){const p=meet('friend',40);return `Drinks with coworkers. You clicked with ${p.n}.`}return 'Drinks with coworkers. Good for your name around the office.'}},
 raise:{n:'Ask for a raise',cd:90,fx:()=>{if(R()<raiseOdds()){s.raise=(s.raise||0)+.08;log(`Got a raise. Now ${fmt(jobPay())} a day.`,'good');return `Yes! 8% more. Now ${fmt(jobPay())} a day.`}s.perf=clamp(s.perf-5,0,100);add('hap',-3);return 'Not this time. Your boss suggests "more ownership".'}},
};
// people: role decides decay, what you can do together, and how much they lift your mood
const PNAMES=['Mia','Leo','Ava','Noah','Zara','Ethan','Priya','Omar','Hana','Luca','Sofia','Kenji','Amara','Diego','Ivy','Farid','Nina','Theo','Aisha','Ren','Mei','Jonah','Layla','Arjun','Chloe','Malik','Yuna','Felix','Iris','Tariq','Elif','Mateo'];
const ROLE={boss:'Boss',coworker:'Coworker',spouse:'Spouse',date:'Partner',child:'Child',parent:'Parent',sibling:'Sibling',friend:'Friend',ex:'Ex'};
const PW={boss:0,coworker:0,spouse:.05,date:.04,child:.02,parent:.01,sibling:.008,friend:.008,ex:0};
const DECAY={boss:.03,coworker:.03,spouse:.08,date:.08,friend:.05,parent:.03,sibling:.03,child:.03,ex:.02};
const PACTS={
 call:{n:'Call',cd:2,roles:['parent','sibling','friend','date','spouse','child'],fx:p=>{prel(p,4);return `You caught up with ${p.n}.`}},
 time:{n:'Hang out',cd:4,c:p=>p.role==='friend'?40:0,roles:['parent','sibling','friend','child'],fx:p=>{prel(p,rint(6,10));add('hap',2);return `A good afternoon with ${p.n}.`}},
 date:{n:'Date night',cd:5,c:()=>Math.round(clamp(netWorth()*.0005,60,5000)),roles:['date','spouse'],fx:p=>{prel(p,rint(8,12)*(p.pt==='romantic'?1.5:1));add('hap',4);return `Date night with ${p.n}. You remember why.`}},
 gift:{n:'Gift',cd:14,c:()=>Math.round(clamp(netWorth()*.001,50,25000)),roles:['parent','sibling','friend','date','spouse','child'],fx:p=>{prel(p,12);return `${p.n} loves it.`}},
 propose:{n:'Propose',roles:['date'],c:()=>Math.round(Math.max(3000,netWorth()*.02)),need:p=>p.rel<60?'Propose once closeness reaches 60':s.day-p.met<90?`Propose after ${90-(s.day-p.met)} more days together`:'',
  fx:p=>{if(R()<.3+p.rel/150){married(p);prel(p,15);add('hap',15);log(`Married ${esc(p.n)}.`,'good');return `${p.n} said yes! You're married.`}prel(p,-15);add('hap',-8);return `${p.n} says they're not ready.`}},
 baby:{n:'Try for a baby',cd:60,roles:['spouse'],need:p=>kidsHome()>=4?'Four kids at home is plenty':age()>=48?'Too late for another baby':p.rel<50?'Try for a baby once closeness reaches 50':'',
  fx:()=>{if(R()<.6){const k=addChild();add('hap',12);log(`Welcome, ${esc(k.n)}!`,'good');return `It's a baby! Welcome, ${k.n}.`}return 'Not this time. You can try again in a couple of months.'}},
 ivf:{n:'Try IVF',cd:90,c:()=>Math.round(ivfCost()),roles:['spouse'],show:p=>age()>=30&&age()<52&&kidsHome()<4,fx:()=>{if(R()<.45){const k=addChild();add('hap',14);log(`Welcome, ${esc(k.n)}! IVF worked.`,'good');return `It worked! Welcome, ${k.n}.`}add('hap',-6);return 'This round didn\'t take. You can try again in a few months.'}},
 ask:{n:'Ask for money',cd:180,roles:['parent'],need:p=>p.rel<40?'Ask for money once closeness reaches 40':'',fx:p=>{const v=rint(300,3000);s.cash+=v;prel(p,-8);return `${p.n} sends ${fmt(v)}, with a lecture.`}},
 reconnect:{n:'Reach out',cd:30,roles:['ex'],need:()=>partner()?'Not while you are with someone':'',fx:p=>{if(R()<.35){p.role='date';p.rel=45;p.met=s.day;return `You and ${p.n} are giving it another go.`}prel(p,-5);return `${p.n} left you on read.`}},
 homework:{n:'Help with homework',cd:7,roles:['child'],show:p=>p.k&&ageOf(p)>=6&&ageOf(p)<18,fx:p=>{p.k.sma=Math.min(100,p.k.sma+.25*s.st.sma/60);prel(p,3);return `You and ${p.n} got through the homework.`}},
 play:{n:'Play sports together',cd:7,roles:['child'],show:p=>p.k&&ageOf(p)>=4&&ageOf(p)<18,fx:p=>{p.k.hea=Math.min(100,p.k.hea+.8);prel(p,4);add('hea',1);return `A good game with ${p.n}.`}},
 tutor:{n:'Hire a tutor',cd:30,c:()=>Math.round(400*s.eco.P),roles:['child'],show:p=>p.k&&ageOf(p)>=6&&ageOf(p)<18,fx:p=>{p.k.sma=Math.min(100,p.k.sma+.6);return `The tutor says ${p.n} is making progress.`}},
 camp:{n:'Summer camp',cd:180,c:()=>Math.round(2500*s.eco.P),roles:['child'],show:p=>p.k&&ageOf(p)>=7&&ageOf(p)<17,fx:p=>{p.k.hap=Math.min(100,p.k.hap+6);p.k.sma=Math.min(100,p.k.sma+.5);prel(p,5);return `${p.n} came back from camp with a tan and ten new friends.`}},
 school:{n:p=>p.k?.sch==='private'?'Back to public school':`Private school · ${fmt(PRIVATE*s.eco.P)}/day`,cd:30,roles:['child'],show:p=>p.k&&ageOf(p)>=5&&ageOf(p)<18,fx:p=>{p.k.sch=p.k.sch==='private'?'public':'private';return p.k.sch==='private'?`${p.n} starts at a private school next term.`:`${p.n} is back at public school.`}},
 fund:{n:'Add to college fund',cd:30,c:()=>Math.round(clamp(s.cash*.05,500,5e4*s.eco.P)),roles:['child'],show:p=>p.k&&ageOf(p)<18,need:p=>p.k.fund>=FUNDCAP*s.eco.P?'The college fund is full':'',fx:(p,v)=>{p.k.fund+=v;return `${fmt(v)} into ${p.n}'s college fund. It earns about 5% a year.`}},
 lunch:{n:'Lunch with the boss',cd:14,c:()=>Math.round(30*s.eco.P),roles:['boss'],fx:p=>{prel(p,rint(5,9));return `Lunch with ${p.n}. You talked about everything except work.`}},
 pitch:{n:'Pitch an idea',cd:30,roles:['boss'],fx:p=>{if(R()<.35+s.st.sma/200){s.perf=clamp(s.perf+8,0,100);prel(p,6);return `${p.n} loved it. Your idea is going ahead.`}prel(p,-4);s.perf=clamp(s.perf-2,0,100);return `${p.n} shot it down in front of everyone.`}},
 coffee:{n:'Grab a coffee',cd:3,c:()=>Math.round(6*s.eco.P),roles:['coworker'],fx:p=>{prel(p,rint(4,7));return `Coffee with ${p.n}. Office gossip acquired.`}},
 cover:{n:'Cover for them',cd:20,roles:['coworker'],fx:p=>{prel(p,10);s.perf=clamp(s.perf-1,0,100);add('hap',-1);return `${p.n} owes you one.`}},
 credit:{n:'Take credit for their work',cd:60,roles:['coworker'],fx:p=>{if(R()<.7){s.perf=clamp(s.perf+7,0,100);prel(p,-30);return `The boss is impressed. ${p.n} knows what you did.`}s.perf=clamp(s.perf-8,0,100);prel(p,-35);const b=boss();if(b)prel(b,-10);return `${p.n} had receipts. Everyone saw.`}},
 bff:{n:'Make them your best friend',roles:['friend'],show:p=>p.rel>=75&&s.best!==p.uid,fx:p=>{s.best=p.uid;prel(p,5);return `${p.n} is your best friend now.`}},
 split:{n:'Break up',bad:1,roles:['date'],fx:p=>endRel(p)},
 divorce:{n:'Divorce',bad:1,roles:['spouse'],fx:p=>endRel(p)},
};
const PACT_ORDER=['lunch','pitch','coffee','cover','credit','call','time','homework','play','tutor','camp','school','fund','date','gift','propose','baby','ivf','ask','reconnect','bff','split','divorce'];
const RANKS=['','Senior ','Lead ','Principal ','Head ','Chief '];
// real-world costs; income is the owner's yearly profit per unit divided by 365 (a food truck nets about half its cost a year, a hotel about 13%)
const BIZ=[
 {id:'lemon',n:'Lemonade Stand',cost:120,inc:1.8,gr:1.25}, // a few stands pay; a lemonade empire doesn't
 {id:'truck',n:'Food Truck',cost:45000,inc:60,gr:1.16},
 {id:'cafe',n:'Coffee Shop',cost:180000,inc:150},
 {id:'wash',n:'Car Wash',cost:900000,inc:600},
 {id:'gym',n:'Fitness Club',cost:3e6,inc:1600},
 {id:'app',n:'App Studio',cost:1.2e7,inc:8000},
 {id:'hotel',n:'Boutique Hotel',cost:6e7,inc:22000},
 {id:'bank',n:'Private Bank',cost:5e8,inc:1.6e5},
 {id:'rocket',n:'Rocket Company',cost:5e9,inc:2.2e6},
];
// a stable pseudo-random number per ticker, for mock data that never changes between visits
const ph=(t,i)=>{const x=Math.sin([...t].reduce((a,c)=>(a*31+c.charCodeAt(0))%1e6,i*7919)+i)*43758.5453;return x-Math.floor(x)};
const PENNY=[['GNMX','Genomix Therapeutics','Health'],['CURX','Curexa Bio','Health'],['NRVX','Neurovex','Health'],['PLSM','Plasmacell Labs','Health'],['VRLX','Viralux','Health'],['ONCB','Oncobridge','Health'],['MDLN','Medlane Devices','Health'],['SHRM','Shroomwell','Health'],
 ['LITH','Lithium Ridge','Mining'],['URNX','Uranex Fuels','Energy'],['GLDF','Goldfield Nugget','Mining'],['CBLT','Cobalt Crest','Mining'],['HYDG','Hydrogen Horizon','Energy'],['SOLP','Solpanel Works','Energy'],['SHLE','Shalewater Oil','Energy'],['GRPH','Graphene North','Mining'],['REFX','Rare Earth Frontier','Mining'],['NCKL','Nickel Point','Mining'],['BATX','Batterix Cells','Energy'],
 ['QBTX','Qubitex Quantum','Tech'],['AIRX','Aerix Drones','Tech'],['BLKC','Blockchainz','Tech'],['MTVR','Metaverso Labs','Tech'],['CLDN','Cloudnest','Tech'],['VRSE','VR Sensei','Tech'],['CYBX','Cybrix Security','Tech'],['NTWK','Netwerk Mobile','Tech'],['HOLV','Holovue Displays','Tech'],['DTNG','Datingly','Tech'],['ORBT','Orbitra Space','Tech'],
 ['CHPZ','Chipzilla Micro','Semis'],['FTNX','Fotonix Photonics','Semis'],['LDRX','Lidarix Sensors','Semis'],
 ['VOLZ','Voltz Motors','Consumer'],['ZIPR','Zippr Scooters','Consumer'],['SKYT','Skytaxi Aero','Consumer'],['HYPR','Hyperloopa Transit','Consumer'],['MEMS','Memestock Games','Consumer'],['VAPR','Vaporific','Consumer'],['BRGR','Burgerverse','Consumer'],['PETZ','Petzilla Supplies','Consumer'],['KNDL','Kindlewood Candles','Consumer'],['STRM','Streamora Media','Consumer'],['BEVX','Bevvy Energy Drinks','Consumer'],['CNBX','Cannabix Farms','Consumer'],
 ['LOAN','Loanshark Lending','Finance'],['SPAQ','SPAC Acquisition Corp IV','Finance'],['CRDX','Credix Pay','Finance'],['BTCM','Bitcoin Miners Holdings','Finance'],['INSR','Insurio','Finance'],['PAWN','Pawnstar Holdings','Finance'],['LTRY','Lottery.io','Finance']];
const pennyOf=([t,n,sec])=>{const v=.045+ph(t,3)*.04;return {t,n,sec,pn:1,p:+(.05*Math.exp(ph(t,1)*Math.log(90))).toPrecision(3),v,mu:v*v/2+(ph(t,4)-.45)*.0014,b:1.2+ph(t,5)*1.3,pe:ph(t,6)<.25?Math.round(8+ph(t,7)*40):0,sh:Math.round(3e7*Math.exp(ph(t,2)*Math.log(20)))}};
const STOCKS=[
 {t:'NOVA',n:'Nova Robotics',sec:'Tech',p:120,v:.028,mu:.0007,b:1.3,pe:38,sh:2.1e+09},
 {t:'BYTE',n:'ByteHive',sec:'Tech',p:45,v:.034,mu:.0009,b:1.4,pe:55,sh:3.4e+09},
 {t:'GRNX',n:'GreenX Energy',sec:'Energy',p:30,v:.03,mu:.00075,b:1.1,pe:0,sh:8e+08},
 {t:'PETR',n:'PetroMax',sec:'Energy',p:80,v:.017,mu:.0003,b:.8,div:.035,pe:9,sh:4e+09},
 {t:'MUNC',n:'Munch Foods',sec:'Consumer',p:55,v:.012,mu:.00025,b:.6,div:.025,pe:18,sh:1.5e+09},
 {t:'LUXE',n:'Luxe Maison',sec:'Consumer',p:210,v:.02,mu:.0005,b:1,pe:27,sh:5e+08},
 {t:'MEDI',n:'MediCore',sec:'Health',p:95,v:.022,mu:.00055,b:.7,pe:22,sh:1.1e+09},
 {t:'BANC',n:'Banco Unido',sec:'Finance',p:60,v:.015,mu:.0003,b:1.1,div:.04,pe:11,sh:6e+09},
 // big real-world names, lightly renamed: rough prices, share counts, volatility and dividends
 {t:'NVBA',n:'Nvibia',sec:'Semis',p:180,v:.028,mu:.0008,b:1.6,pe:50,sh:2.44e10},
 {t:'MSFY',n:'Microsaft',sec:'Tech',p:500,v:.015,mu:.0005,b:1,div:.007,pe:36,sh:7.43e9},
 {t:'APEL',n:'Appel',sec:'Tech',p:230,v:.016,mu:.0004,b:1.1,div:.005,pe:34,sh:1.49e10},
 {t:'ABUT',n:'Alphabut',sec:'Tech',p:240,v:.018,mu:.0005,b:1.1,div:.004,pe:25,sh:1.21e10},
 {t:'AMZM',n:'Amazin',sec:'Consumer',p:225,v:.02,mu:.0005,b:1.2,pe:35,sh:1.07e10},
 {t:'METT',n:'Metta Platforms',sec:'Tech',p:720,v:.024,mu:.0006,b:1.3,div:.003,pe:27,sh:2.52e9},
 {t:'AVGA',n:'Broadcomb',sec:'Semis',p:330,v:.026,mu:.0007,b:1.4,div:.007,pe:60,sh:4.7e9},
 {t:'ARMC',n:'Saudi Aramko',sec:'Energy',p:6.5,v:.009,mu:.0002,b:.4,div:.065,pe:16,sh:2.42e11},
 {t:'TSMS',n:'Taiwon Semiconductor',sec:'Semis',p:250,v:.022,mu:.0006,b:1.3,div:.012,pe:25,sh:5.19e9},
 {t:'TSLE',n:'Tessla',sec:'Consumer',p:400,v:.036,mu:.0007,b:1.9,pe:180,sh:3.2e9},
 {t:'BRKH',n:'Birkshire Hathaway',sec:'Finance',p:490,v:.01,mu:.00035,b:.8,pe:14,sh:2.16e9},
 {t:'JBM',n:'JB Morgen Chase',sec:'Finance',p:300,v:.015,mu:.0004,b:1.1,div:.019,pe:15,sh:2.75e9},
 {t:'WLMT',n:'Wallmart',sec:'Consumer',p:100,v:.011,mu:.0004,b:.6,div:.009,pe:38,sh:7.98e9},
 {t:'LOLY',n:'Eli Lolly',sec:'Health',p:800,v:.02,mu:.0006,b:.5,div:.007,pe:55,sh:8.97e8},
 {t:'VIZ',n:'Viza',sec:'Finance',p:345,v:.012,mu:.0004,b:.9,div:.007,pe:33,sh:1.95e9},
 {t:'ORKL',n:'Orakle',sec:'Tech',p:240,v:.026,mu:.0006,b:1.3,div:.008,pe:50,sh:2.81e9},
 {t:'TCNT',n:'Tensent',sec:'Tech',p:70,v:.022,mu:.0004,b:1.1,div:.008,pe:22,sh:9.2e9},
 {t:'MAK',n:'Masterkard',sec:'Finance',p:570,v:.013,mu:.0004,b:1,div:.005,pe:38,sh:9.1e8},
 {t:'NFLK',n:'Netflux',sec:'Consumer',p:120,v:.024,mu:.0006,b:1.2,pe:48,sh:4.25e9},
 {t:'XOMM',n:'ExxonMobeel',sec:'Energy',p:112,v:.015,mu:.0002,b:.8,div:.035,pe:15,sh:4.3e9},
 {t:'CSTK',n:'Costko',sec:'Consumer',p:950,v:.012,mu:.0004,b:.8,div:.005,pe:52,sh:4.43e8},
 {t:'JAJ',n:'Jonson & Jonson',sec:'Health',p:175,v:.01,mu:.00025,b:.5,div:.029,pe:18,sh:2.41e9},
 {t:'HDP',n:'Home Deepot',sec:'Consumer',p:400,v:.014,mu:.0003,b:1,div:.023,pe:27,sh:9.95e8},
 {t:'PLTA',n:'Palantar',sec:'Tech',p:160,v:.036,mu:.0009,b:2,pe:400,sh:2.37e9},
 {t:'PGG',n:'Procter & Gumble',sec:'Consumer',p:155,v:.009,mu:.00025,b:.4,div:.026,pe:24,sh:2.34e9},
 {t:'BOA',n:'Bank of Amerika',sec:'Finance',p:48,v:.018,mu:.0003,b:1.2,div:.022,pe:14,sh:7.6e9},
 {t:'SMSG',n:'Samsang Electronics',sec:'Semis',p:60,v:.02,mu:.0004,b:1.1,div:.02,pe:13,sh:5.9e9},
 {t:'ABVE',n:'AbbVee',sec:'Health',p:200,v:.014,mu:.0004,b:.5,div:.033,pe:20,sh:1.77e9},
 {t:'SAPP',n:'Sapp',sec:'Tech',p:280,v:.018,mu:.0004,b:1,div:.009,pe:45,sh:1.17e9},
 {t:'ASNL',n:'ASNL Holding',sec:'Semis',p:800,v:.024,mu:.0005,b:1.3,div:.009,pe:32,sh:3.93e8},
 {t:'KOKA',n:'Koka-Kola',sec:'Consumer',p:70,v:.009,mu:.00025,b:.5,div:.029,pe:24,sh:4.3e9},
 {t:'LVHM',n:'LVHM Moët Hennessey',sec:'Consumer',p:600,v:.019,mu:.0003,b:1.1,div:.02,pe:24,sh:5e8},
 {t:'BABU',n:'Alibabu',sec:'Consumer',p:130,v:.03,mu:.0005,b:1.2,div:.008,pe:16,sh:2.3e9},
 {t:'AMDD',n:'Advanced Macro Devices',sec:'Semis',p:165,v:.032,mu:.0006,b:1.7,pe:95,sh:1.62e9},
 {t:'UNHY',n:'UnitedHealthy Group',sec:'Health',p:310,v:.022,mu:.0003,b:.6,div:.028,pe:14,sh:9.05e8},
 {t:'CVXX',n:'Chevronn',sec:'Energy',p:155,v:.016,mu:.0002,b:.8,div:.043,pe:17,sh:1.75e9},
 {t:'CSKO',n:'Cisko Systems',sec:'Tech',p:68,v:.015,mu:.0003,b:.9,div:.024,pe:26,sh:3.96e9},
 {t:'TOYD',n:'Toyoda Motor',sec:'Consumer',p:190,v:.015,mu:.0003,b:.8,div:.03,pe:9,sh:1.3e9},
 {t:'IMB',n:'International Busyness Machines',sec:'Tech',p:260,v:.015,mu:.0003,b:.9,div:.026,pe:26,sh:9.3e8},
 {t:'SFRC',n:'Salesforse',sec:'Tech',p:250,v:.021,mu:.0004,b:1.1,div:.007,pe:38,sh:9.6e8},
 {t:'NVOK',n:'Novo Nordiks',sec:'Health',p:55,v:.025,mu:.0002,b:.6,div:.03,pe:15,sh:4.44e9},
 {t:'GSAX',n:'Goldmann Sax',sec:'Finance',p:720,v:.02,mu:.0004,b:1.3,div:.017,pe:16,sh:3.07e8},
 {t:'MCDD',n:"McDoonald's",sec:'Consumer',p:300,v:.01,mu:.0003,b:.6,div:.024,pe:26,sh:7.13e8},
 {t:'DIZ',n:'Dizney',sec:'Consumer',p:115,v:.018,mu:.0003,b:1.1,div:.009,pe:20,sh:1.8e9},
 {t:'UBR',n:'Ubar',sec:'Tech',p:90,v:.026,mu:.0005,b:1.3,pe:16,sh:2.09e9},
 {t:'ADBI',n:'Adobi',sec:'Tech',p:360,v:.021,mu:.0003,b:1.1,pe:22,sh:4.24e8},
 {t:'PFZ',n:'Pfyzer',sec:'Health',p:25,v:.015,mu:.0001,b:.6,div:.068,pe:10,sh:5.68e9},
 {t:'NIKA',n:'Nika',sec:'Consumer',p:75,v:.022,mu:.0002,b:1,div:.021,pe:30,sh:1.48e9},
 {t:'ITEL',n:'Intell',sec:'Semis',p:24,v:.026,mu:.0003,b:1.2,pe:0,sh:4.37e9},
 {t:'CBAS',n:'Coinbass',sec:'Finance',p:300,v:.038,mu:.0008,b:2.1,pe:30,sh:2.54e8},
 // penny stocks: tiny, wild, and sometimes bankrupt
 ...PENNY.map(pennyOf),
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
 {id:'out',n:'Night out',d:'+8 happiness, −2 health. You might make a friend.',cd:5,c:150,fx:()=>{add('hap',8);add('hea',-2);viceAdd('alc',4);{const pt=partner();if(pt?.pt==='jealous')prel(pt,-6)}if(s.cars.length&&R()<(trait('rebel')?.08:.04)*(vice('alc')>60?2:1)){openCase('dui');return 'You drove home after a few drinks and got pulled over. See Life.'}if(R()<.25&&friendsN()<10){const p=meet('friend',35);return `Great night. You made a new friend: ${p.n}.`}if(R()<.3){const f=rint(5,40)+Math.round(s.fol*.01);s.fol+=f;return `Legendary night. +${f} followers.`}return 'Great night, rough morning.'}},
 {id:'date',n:'Dating app',d:'A chance to meet someone',cd:10,c:40,show:()=>!partner(),fx:()=>{if(R()<.2+s.st.loo/250){const p=meet('date',40);add('hap',10);log(`You matched with ${esc(p.n)}. You're seeing each other.`,'good');return `It's a match with ${p.n}!`}add('hap',-2);return 'Swiped all night. Nothing.'}},
 {id:'fam',n:'Family time',d:'+5 happiness, and your family feels closer',cd:4,c:0,show:()=>s.people.some(p=>['parent','sibling','spouse','child'].includes(p.role))||s.pets.length,fx:()=>{for(const p of s.people)if(['parent','sibling','spouse','child'].includes(p.role))prel(p,p.role==='spouse'&&p.pt==='homebody'?7:3);add('hap',5);return 'Quality time with family.'}},
 {id:'club',n:'Join a club',d:'A good chance to make a friend',cd:30,c:200,fx:()=>{if(friendsN()<10&&R()<.7){const p=meet('friend',40);return `You joined a ${pick(['running','book','chess','climbing','board game'])} club and met ${p.n}.`}return 'Nice people, no real connection yet.'}},
 {id:'doc',n:'Doctor check-up',d:'+15 health',cd:30,c:400,fx:()=>{add('hea',15);const t=checkup();return t.includes('found')?'Check-up done.'+t:'Clean bill of health.'}},
 {id:'spa',n:'Spa day',d:'+8 happiness, +2 looks',cd:14,c:600,fx:()=>{add('hap',8);add('loo',2);return 'Glowing.'}},
 {id:'trip',n:'Vacation',d:'+30 happiness, +5 health',cd:120,c:5000,fx:()=>{{const pt=partner();if(pt)prel(pt,pt.pt==='adventurous'?15:5)}add('hap',30);add('hea',5);return 'Sun, sea, no emails.'}},
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
const TF={'1W':5,'1M':21,'3M':63,'All':240}; // trading days
const BYCAP=[...STOCKS].sort((a,b)=>b.p*b.sh-a.p*a.sh),WSECS=['All','Held','Penny',...new Set(STOCKS.filter(k=>!k.pn).map(k=>k.sec))];
// ---------- pace: speed 1 (Auto) runs fast while you're idle and slows while you play; speed 2 (Fast) is a second a day ----------
const PACE={idle:288,active:48,trade:13,fast:1440},AWAY=1440/900; // game minutes per real second: a day takes 5 s idle, 30 s while you play, a market session about 30 s while you trade; closed, a day takes 15 minutes
const PACE_TXT={idle:'Auto · idle, 5 seconds a day',active:'Auto · slowed while you play, 30 seconds a day',trade:'Auto · trading pace, a market session takes about 30 seconds',fast:'Fast · 1 second a day'};
let lastAct=-1e9,catching=false;
function paceNow(){const idle=performance.now()-lastAct;if(speed===2)return 'fast';if((tab==='crypto'||tab==='stock'&&inSession())&&idle<120000)return 'trade';return idle<20000?'active':'idle'}
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
 ['Propose',(s,a)=>{const p=partner();if(p?.role!=='date')return 'The moment has passed.';s.cash-=a;married(p);prel(p,15);add('hap',15);return `${p.n} said yes! You're married.`}],
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
 ['Buy with 20% of cash',(s,a)=>{const n=maxBuy(a,s.cash*.2);if(n<1)return "You can't afford a single share.";const amt=n*s.px[a].p;ACT.buy(a,n);s.later.push({d:s.day+rint(3,8),k:'shock',t:a,v:R()<.45?.25:-.2,sec:amt});return `You bought ${n} shares of $${a}. Fingers crossed.`}],
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
{id:'pet',w:1,c:s=>!s.pets.some(p=>p.t==='cat')&&s.pets.length<5,t:'Stray kitten',d:()=>'A tiny kitten follows you home, meowing at your door.',def:0,ch:[
 ['Adopt',()=>{const p=addPet('cat');add('hap',10);return `You have a cat now: ${esc(p.n)}. It owns you.`}],
 ['Take it to a shelter',()=>'It will find a good home.']]},
];

EV.push(...EV2,...EV3,...EV4,...EV5,...EV6,...EV7,...EV8,...EV9,...EV10,...EV11,...EV12,...EV13,...EV14);
const EVM=EM(EV.map(e=>[e.id,e]));

// ---------- businesses: realistic returns, and profits that ride the economy ----------
// cyc = how much demand swings with the economy, lev = operating leverage (fixed costs magnify swings), cl = yearly chance a location closes.
const BZX=[{f:1,cyc:.3,lev:1.2,cl:.05},{f:1,cyc:.6,lev:1.5,cl:.06},{f:1,cyc:.7,lev:2,cl:.08},{f:1,cyc:.8,lev:2,cl:.05},{f:1,cyc:1,lev:2.5,cl:.07},{f:1,cyc:1.2,lev:2.5,cl:.12},{f:1,cyc:1.6,lev:3,cl:.04},{f:1,cyc:1.3,lev:3,cl:.02},{f:1,cyc:1,lev:3.5,cl:.08}];
BIZ.forEach((b,i)=>{const x=BZX[i];b.inc=+(b.inc*x.f).toPrecision(3);b.cyc=x.cyc;b.lev=x.lev;b.cl=x.cl});
const CLOSE_WHY=['A competitor opened across the street.','The landlord doubled the rent when the lease ran out.','The regulars moved on.','Your best employee left and took the customers with them.','A health scare kept people away for good.'];

// ---------- prices: every price table keeps its base, and today's price is the base times the price level ----------
const PRICED=[[JOBS,['pay']],[ACTS,['c']],[SHOP,['cost','up']],[CARS,['price','up']],[PROGS,['cost','stipend']],[BIZ,['cost','inc']]];
const BASEP=PRICED.map(([arr,ks])=>arr.map(o=>Object.fromEntries(ks.filter(k=>o[k]!=null).map(k=>[k,o[k]]))));
const r3=x=>x>=100?Math.round(x):+x.toPrecision(3);
function applyPrices(){const P=s?.eco?.P||1;PRICED.forEach(([arr],i)=>arr.forEach((o,j)=>{const B=BASEP[i][j];for(const k in B)o[k]=r3(B[k]*P)}))}

// ---------- the economy: it follows the market's hidden cycle with a lag. g is the output gap, from about +0.4 in a boom to -1 in a slump ----------
const ecoNew=()=>({g:.3,u:.04,pi:.025,r:.04,lr:.045,P:1,rec:false});
const mrate=()=>s.eco.lr+.017; // 30-year fixed follows long rates
const pctA=x=>(x*100).toFixed(Math.abs(x)<.1?2:1)+'%';
const ecoLabel=()=>s.eco.rec?'Recession':s.eco.g>.15?'Growing':s.eco.g>-.1?'Slowing':'Contracting';
function ecoDay(){
  const E=s.eco,M=s.mkt;
  E.g=clamp(E.g+((M.bull?.35:-.75)-E.g)/60+.01*gauss(),-1.2,.8);
  E.u+=(clamp(.05-.045*E.g,.03,.14)-E.u)/60;
  E.pi=clamp(E.pi+(.025+.02*E.g-E.pi)/200+.0006*gauss(),-.02,.15);
  if(R()<1/(365*25)){E.pi+=.03+R()*.04;chirp('@MarketWire','MarketWire',`oil prices spike on a supply shock. inflation jumps to ${pctA(E.pi)}`,1);log(`A supply shock sends inflation to ${pctA(E.pi)}.`,'bad')}
  E.P*=1+E.pi/365;
  E.lr+=(E.r+.01-E.lr)/250;
  if(s.day%45===0){ // the central bank meets every six weeks and moves in quarter or half points (a Taylor rule)
    const tgt=clamp(.005+E.pi+.5*(E.pi-.025)+.015*E.g,0,.15),d=tgt-E.r;
    if(Math.abs(d)>=.002){const st=Math.abs(d)>.01?.005:.0025;E.r=Math.max(0,Math.round((E.r+Math.sign(d)*st)*400)/400);
      chirp('@CentralBank','Central Bank',`the bank ${d>0?'raises':'cuts'} interest rates by ${st===.005?'0.50':'0.25'} points to ${pctA(E.r)}${d>0?`, citing inflation of ${pctA(E.pi)}`:`, as unemployment reaches ${pctA(E.u)}`}`,1)}}
  // a recession starts deep and ends once growth is clearly back
  const rec=E.rec?E.g<-.1:E.g<-.4;if(rec!==E.rec){E.rec=rec;const m=rec?'The economy has slipped into recession. Layoffs are rising and customers are spending less.':'The recession is over. Hiring is picking up again.';log(m,rec?'bad':'good');chirp('@MarketWire','MarketWire',m.toLowerCase(),1)}
  applyPrices();
}
const bizPf=b=>1+b.lev*b.cyc*.25*((s.eco?.g??.2)-.2); // profit factor: demand swing times operating leverage; it can go below zero
function closeCheck(b,o,p=o.n*b.cl*(s.eco.rec?2.5:1)*(o.mgr?.7:1)/365){ // competition closes locations now and then
  if(!o.n||R()>=p)return;o.spent*=(o.n-1)/o.n;o.n--;log(`One of your ${plural(b.n)} closed. ${s.eco.rec&&R()<.5?'Customers stopped spending.':pick(CLOSE_WHY)}`,'bad')}

// ---------- the bank: savings, an index fund, government bonds and a retirement account ----------
const finNew=()=>({sav:0,fu:0,fc:0,bonds:[],ira:0,iraC:0,iraPct:0,iraY:0,iraYr:0});
const savRate=()=>Math.max(0,s.eco.r-.005),FUND_FEE=.0003,FUND_DY=.015;
const fundPx=()=>idx()/10; // the Hustle 500 fund: a tenth of the index
const bondY=term=>term>=10?s.eco.lr+.002:Math.max(0,s.eco.r+.001);
const bondVal=b=>b.amt*Math.max(.3,1+(b.rate-bondY(b.term))*Math.max(0,(b.mat-s.day)/365)); // a bond's price moves against rates, more so the longer it has left
const iraVal=()=>s.fin.ira*fundPx(),iraLimit=()=>25000*s.eco.P,iraRoom=()=>Math.max(0,iraLimit()-(s.fin.iraYr===dateOf(s.day).y?s.fin.iraY:0));
const finVal=()=>{const F=s.fin;return F.sav+F.fu*fundPx()+F.bonds.reduce((a,b)=>a+bondVal(b),0)+iraVal()};
function iraPut(c,match=0){taxAdd('ord',-c);const F=s.fin,y=dateOf(s.day).y;if(F.iraYr!==y){F.iraYr=y;F.iraY=0}F.iraY+=c;F.iraC+=c+match;F.ira+=(c+match)/fundPx()}
function finDay(){
  const F=s.fin,px=fundPx();
  const intr=F.sav*savRate()/365;F.sav+=intr;taxAdd('ord',intr);F.fu*=1-FUND_FEE/365;F.ira*=1-FUND_FEE/365;
  for(const b of [...F.bonds]){s.cash+=b.amt*b.rate/365;taxAdd('ord',b.amt*b.rate/365);if(s.day>=b.mat){s.cash+=b.amt;F.bonds.splice(F.bonds.indexOf(b),1);log(`Your ${b.term}-year bond matured and paid back ${fmt(b.amt)}.`,'good')}}
  if(s.job&&F.iraPct>0){const pay=jobPay(),c=Math.min(pay*F.iraPct,iraRoom(),Math.max(0,s.cash)),m=c>0?Math.min(c,pay*.06)*.5:0;if(c>0){s.cash-=c;iraPut(c,m)}} // the employer matches half, up to 6% of pay
  if(s.day%91===45){const d=F.fu*px*FUND_DY/4;if(d>0){s.cash+=d;taxAdd('lt',d);log(`The Hustle 500 fund paid ${fmt(d)} in dividends.`,'good')}F.ira*=1+FUND_DY/4}
}

// ---------- taxes: progressive income tax, capital gains by holding period, property tax. Collected as you earn ----------
// Each time income lands, the extra tax owed on the year so far is taken at once, so the progressive brackets are exact and nothing is due later.
const BRK=[[14600,0],[26200,.1],[61750,.12],[115125,.22],[206550,.24],[258325,.32],[623950,.35],[Infinity,.37]]; // single filer, the first row is the standard deduction
const LTB=[[47025,0],[518900,.15],[Infinity,.2]];
const taxNew=()=>({y:0,ord:0,st:0,lt:0,gam:0,paid:0,hist:{}});
function bracketTax(x,tbl,from=0){const P=s.eco.P;let tax=0,lo=0;for(const[hi0,r]of tbl){const hi=hi0*P,a=Math.max(lo,from),b=Math.min(hi,from+x);if(b>a)tax+=(b-a)*r;lo=hi}return tax}
function taxParts(T=s.tax){ // capital losses net against gains, and up to $3,000 of any excess offsets income
  let st=T.st,lt=T.lt,ord=T.ord+Math.max(0,T.gam);if(st<0&&lt>0){lt+=st;st=0}else if(lt<0&&st>0){st+=lt;lt=0}
  if(st+lt<0){ord+=Math.max(st+lt,-3000*s.eco.P);st=lt=0}ord=Math.max(0,ord+Math.max(0,st));return {ord,lt:Math.max(0,lt)}}
function taxDue(T=s.tax){const{ord,lt}=taxParts(T);return bracketTax(ord,BRK)+bracketTax(lt,LTB,ord)}
function taxAdd(kind,amt){ // book income (or a deduction or loss, if negative) and settle the tax difference now
  if(!amt||!s.tax)return;const T=s.tax;taxRoll();
  const before=taxDue(),b0=stateBase();T[kind]+=amt;const d=taxDue()-before,st=(stateBase()-b0)*cityTax();s.cash-=d+st;T.paid+=d+st;T.state=(T.state||0)+st} // state tax is flat on income above the deduction, booked as you earn at the rate where you live now
const stateBase=(T=s.tax)=>{const{ord,lt}=taxParts(T);return Math.max(0,ord+lt-BRK[0][0]*s.eco.P)};
function taxRoll(){const T=s.tax,y=dateOf(s.day).y; // close last year's books when a new tax year starts
  if(T.y!==y){if(T.y){const inc=taxParts(T);T.hist[T.y]={inc:inc.ord+inc.lt,tax:T.paid};if(T.paid>1)log(`Tax year ${T.y} closed: ${fmt(T.paid)} on ${fmt(inc.ord+inc.lt)} of taxable income.`)}Object.assign(T,{y,ord:0,st:0,lt:0,gam:0,paid:0,don:0})}}
function capGain(g,since){taxAdd(since!=null&&s.day-since<=365?'st':'lt',g)} // held a year or less: taxed like income
const margRate=()=>{const{ord}=taxParts(),P=s.eco.P;for(const[hi,r]of BRK)if(ord<hi*P)return r+(r>0?cityTax():0);return .37+cityTax()}; // under the standard deduction, state tax doesn't apply either
const avgDay=(d0,n0,n)=>d0==null?s.day:(d0*n0+s.day*n)/(n0+n); // the average purchase day of a holding, for the holding period

// ---------- state ----------
const SAVE='hustle-v1',GROW=1.13,CAP=10,MILES=[10,25,50,100,150,200,300,400,500];
let helpOpen={},showAll={},openP=null,tour=-1,tourSpeed=1,tourJump=false,enr=null,iv=null,bmode='1',wf='All',bd={},vmode='chart',oxp=0,oq=1,lastSpeed=1,lastIn=[],cg=null,tf='3M',cmode='candle',hov=null,ot={side:'buy',qty:10}; // screen state, not saved
let s=null,tab='dash',sel='NOVA',csel='SATS',speed=1,holding=false,wiped=false,heir={},hiddenAt=0;
const age=()=>s.startAge+s.day/365;
const add=(k,v)=>s.st[k]=clamp(s.st[k]+((k==='hap'||k==='sma'||k==='loo')&&v>0?v*clamp((100-s.st[k])/(k==='hap'?50:k==='loo'?60:70),.05,1)**2:v),0,100); // gains in happiness, smarts and looks shrink as they climb
const job=()=>s.job&&JM[s.job];
const jobPay=()=>job().pay*(1+.15*s.rank)*(1+(s.raise||0))*city().pay*hours().pay;
const jobTitle=()=>job().rk?job().rk[Math.min(s.rank,5)]:RANKS[Math.min(s.rank,5)]+job().n;
const promoNeed=()=>Math.round(55+s.rank*5-bossAdj()),topRank=()=>s.rank>=5;
const fire=()=>{s.job=null;s.rank=0;s.jobDays=0;s.raise=0};
const xpY=f=>(s.xp[f]||0)/365+((s.degs||[]).some(d=>d.mj&&MAJORS[d.mj]===f)?1:0),xpT=()=>Object.values(s.xp).reduce((a,d)=>a+d,0)/365;
const raiseOdds=()=>clamp((s.perf-30)/60+bossAdj()/40,.05,.9);
function jobMiss(j){const m=[];if(s.edu<j.e)m.push(EDU[j.e].n);if(j.dg&&!s.degs.some(d=>d.p===j.dg))m.push(PG[j.dg].n);if(j.mj&&!s.degs.some(d=>d.mj===j.mj))m.push(`a ${j.mj} major`);if(s.st.sma<j.s)m.push(`${j.s} smarts`);if(j.h&&s.st.hea<j.h)m.push(`${j.h} health`);if(j.lk&&s.st.loo<j.lk)m.push(`${j.lk} looks`);if(j.sk&&hobSk(j.sk[0])<j.sk[1])m.push(`${HM[j.sk[0]].n.toLowerCase()} skill ${j.sk[1]}`);if(j.young&&age()>=j.young)m.push(`to be under ${j.young}`);if(j.end&&age()>=j.end)m.push(`to be under ${j.end}`);if(CLEAN.has(j.id)&&crimes().length)m.push('a clean record');
  for(const f in j.x||{})if(xpY(f)<j.x[f])m.push(`${j.x[f]} yr${j.x[f]>1?'s':''} in ${FIELD[f]}`);if(j.xt&&xpT()<j.xt)m.push(`${j.xt} yrs experience`);if(j.f&&s.fol<j.f)m.push(`${big(j.f)} followers`);return m}
const jobReqText=j=>[j.dg?PG[j.dg].n:EDU[j.e].n,j.mj?`${j.mj} major`:'',j.s?`${j.s} smarts`:'',j.h?`${j.h} health`:'',j.lk?`${j.lk} looks`:'',j.sk?`${HM[j.sk[0]].n.toLowerCase()} skill ${j.sk[1]}`:'',j.young?`under ${j.young}`:'',...Object.entries(j.x||{}).map(([f,y])=>`${y} yr${y>1?'s':''} ${FIELD[f]}`),j.xt?`${j.xt} yrs experience`:'',j.f?`${big(j.f)} followers`:''].filter(Boolean).join(', ');
const ageOf=p=>(s.day-p.b)/365;
const per=u=>s.people.find(p=>p.uid===u);
const prel=(p,v)=>p.rel=clamp(p.rel+v,0,100);
const partner=()=>s.people.find(p=>p.role==='date'||p.role==='spouse');
const kids=()=>s.people.filter(p=>p.role==='child');
const kidsHome=()=>kids().filter(k=>ageOf(k)<18).length;
const friendsN=()=>s.people.filter(p=>p.role==='friend').length;
const peopleHap=()=>s.people.reduce((a,p)=>a+(PW[p.role]||0)*(p.uid===s.best?3:1)*(p.rel-40)/(p.rel<40?80:60)*(p.role==='child'&&ageOf(p)>=18?.5:1),0);
const closeWord=r=>r>=80?'Very close':r>=60?'Close':r>=40?'Friendly':r>=20?'Distant':'Strained';
function meet(role,rel,b){const used=new Set(s.people.map(p=>p.n)),n=PNAMES.find(x=>!used.has(x)&&R()<.2)||pick(PNAMES);const p={uid:uid(),n,role,rel,b:b??(-s.startAge*365+rint(-4,4)*365),met:s.day,c:{}};s.people.push(p);if(role==='date'||role==='spouse')partnerNew(p);return p}
const addChild=()=>{const p=meet('child',80,s.day);p.k=kidNew();mile(`${esc(p.n)} was born.`);return p};
function makeFamily(){const me=-s.startAge*365;for(let i=0;i<2;i++)meet('parent',rint(55,85),me-rint(24,38)*365);for(let i=rint(0,2);i>0;i--)meet('sibling',rint(40,75),me+rint(-6,6)*365);for(let i=rint(1,2);i>0;i--)meet('friend',rint(45,70),me+rint(-2,2)*365)}
function endRel(p,theyLeft){const sp=p.role==='spouse',who=theyLeft?`${p.n} left you. `:'';p.role='ex';p.rel=Math.min(p.rel,20);
  if(sp){const c=divCost(p);payOut(c);add('hap',-20);mile(`Divorced ${esc(p.n)}.`);return `${who}You and ${p.n} divorced. It cost ${fmt(c)}.`}add('hap',-12);return `${who}You and ${p.n} broke up.`}
function parentDies(p){s.people.splice(s.people.indexOf(p),1);mile(`Lost ${esc(p.n)}, a parent.`);const v=Math.round(rint(5000,40000)*(.5+p.rel/100));s.cash+=v;add('hap',-20);const m=`${p.n}, your parent, passed away at ${Math.floor(ageOf(p))}. They left you ${fmt(v)}.`;log(esc(m),'bad');toast(esc(m));return m}
function peopleDay(){
  teamDay();
  for(const p of [...s.people]){
    p.rel=clamp(p.rel-(DECAY[p.role]||0)*(p.uid===s.best?.5:1),0,100);
    const a=ageOf(p)-(p.x||0);
    if(p.role==='boss'||p.role==='coworker')continue;
    if(p.role==='spouse'&&p.pt==='ambitious'&&!s.job&&!s.su&&!s.pension)prel(p,-.05);
    if(p.role==='child')kidDay(p);
    if(p.role==='child'&&!p.out&&ageOf(p)>=18){p.out=1;if(p.k)kidLaunch(p);else log(`${esc(p.n)} turns 18 and moves out.`,'good')}
    else if(p.role==='parent'&&a>68&&R()<Math.min(.5,((a-68)/25)**3*2)/365)parentDies(p);
    else if((p.role==='date'||p.role==='spouse')&&p.rel<15&&R()<.004){const m=endRel(p,1);log(esc(m),'bad');toast(esc(m))}
    else if(p.role==='friend'&&p.rel<8&&R()<.01){s.people.splice(s.people.indexOf(p),1);log(`You and ${esc(p.n)} drifted apart.`)}
  }
  if(s.job&&friendsN()<10&&R()<1/250){const p=meet('friend',35);log(`You became friends with ${esc(p.n)} from work.`,'good')}
}
const bmul=n=>1.5**MILES.filter(m=>n>=m).length; // each milestone adds half again: bigger chains still pay, with diminishing returns
const mgrCost=b=>b.cost*2; // hiring and training a manager to run every unit of one business
const bizInc=(b,o)=>b.inc*o.n*bmul(o.n)*s.legacy*(s.day<s.boost?1.25:1)*bizPf(b)*worldBiz(b)*(o.fr?1.3:1);
const grw=b=>b.gr||GROW; // how much each extra unit costs over the last
const bcost=(b,n,q)=>{const g=grw(b);return b.cost*g**n*(g**q-1)/(g-1)};
const bmax=(b,n)=>{const g=grw(b);return Math.floor(Math.log(s.cash*(g-1)/(b.cost*g**n)+1)/Math.log(g))};
const buyout=id=>{const o=s.biz[id];return bcost(BM[id],Math.max(0,o.n-5),5)*2};
const shopSum=k=>SHOP.reduce((t,i)=>t+(s.own[i.id]?i[k]:0),0);
const sponsor=()=>s.fol<1000?0:s.fol*.0015*(.5+s.st.loo/100);
const MN=30*365,mpay=(L,rate=mrate())=>L*(rate/365)/(1-(1+rate/365)**-MN);
const uid=()=>s.nid=(s.nid||0)+1;
const pval=p=>PM[p.t].base*p.m*s.re.idx*cmul(p);
const pname=p=>`${PM[p.t].n}, ${p.loc}${p.city&&p.city!==(s.city||'suburb')?` (${CITIES[p.city].n.replace(/^The /,'')})`:''}`;
const here=p=>(p.city||'suburb')===(s.city||'suburb');
const P=u=>s.props.find(p=>p.uid===u);
const homeP=()=>s.home&&P(s.home);
const renting=p=>p.uid!==s.home&&s.day>=p.from&&!p.reno;
const rentOf=p=>renting(p)?pval(p)*PM[p.t].yld/365*stlMul(p):0;
const carSum=k=>s.cars.reduce((t,c)=>t+CM[c.t][k],0);
const bestCar=()=>s.cars.reduce((m,c)=>!m||CM[c.t].hap>CM[m.t].hap?c:m,null);
const upkeep=()=>shopSum('up')+carSum('up')+s.props.reduce((t,p)=>t+pval(p)*.02/365,0); // 1% upkeep plus 1% property tax
const salaryNow=()=>(s.job?jobPay():0)+(s.pension||0),rentNow=()=>s.rc?commFee():homeP()?0:clamp(salaryNow()*.25,20*s.eco.P*city().cost,90*s.eco.P*city().cost); // renters spend about a quarter of their pay on housing
const expenses=()=>rentNow()+(15+kidsHome()*47+(partner()?.role==='spouse'?20:0))*s.eco.P*city().cost+salaryNow()*.15+upkeep()+lifeCost(); // lifestyle grows with pay
const canBorrow=L=>{const f=flows();return credit()>=620&&!(s.bk>s.day)&&mpay(L,myRate())+f.mort<=(f.job+f.biz+f.rent)*.4};
function listing(){const nw=Math.max(netWorth(),60000),ok=PROPS.filter(p=>p.base<=nw*4),[loc,m]=pick(LOCS);return {uid:uid(),t:pick(ok.slice(-4)).id,loc,city:s.city||'suburb',m:m*(.92+R()*.16)*city().home,cond:R()<.2?rint(25,55):rint(85,100)}}
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
  s.min??=480;s.eco??=ecoNew();s.fin??=finNew();s.tax??=taxNew();s.mloan??=0;s.shorts??={};s.opts??=[];applyPrices();
  const fresh=STOCKS.filter(k=>!s.px[k.t]);if(fresh.length){for(const k of fresh)seedStock(k);for(let i=0;i<239;i++)tradeDay(1,fresh);fresh.forEach(anchor)}
  s.tr??=[];s.fl??=flNew();s.pol??=polNew();s.credit??=650;s.vice??={alc:0,gam:0};for(const p of s.people)if(p.role==='date'||p.role==='spouse'){partnerNew(p);if(p.role==='spouse')p.wedNW??=Math.max(0,netWorth()*.5)}for(const p of s.people)if(p.role==='child'&&!p.k){p.k=kidNew();const a=ageOf(p);p.k.sma=p.k.gs*(a>=18?1:.3+Math.min(1,a/10)*.7);if(a>=18)kidLaunch(p,1)}
  s.conds??=[];s.ins??='basic';s.legal??={rec:[],cases:[],jail:0};s.hob??={};if(!s.pets){s.pets=[];if(s.pet)addPet('cat',s.day-365)}delete s.pet;
  s.orders??=[];const M=s.mkt;M.h??=MVOL.bull**2/YR;M.eps??=0;M.cb??=0;for(const k of STOCKS)initStock(k);if(!M.rc){M.rc=capSum()*.6;M.div=(capSum()+M.rc)/5000;M.ic=M.ih=5000;M.lab='Bull market'} // stocks added since this save
  for(const k of STOCKS){const q=s.px[k.t];if(q.k)continue; // daily candles used to be drawn from closes alone
    q.k=q.h.map((c,i)=>{const o=i?q.h[i-1]:c;return [o,Math.max(o,c)*(1+.005*hsh(i,1)),Math.min(o,c)*(1-.005*hsh(i,2))]});[q.op,q.hi,q.lo]=q.k.at(-1)}
}
function flows(){const f={job:(s.job&&!jailed()&&!(s.rehab>s.day)?jobPay():0)+(s.pension||0)+(s.su?.st>=2?suDraw():0)+spouseInc()+polPay(),biz:0,pend:0,spon:sponsor()+chInc()+(s.roy&&s.day<s.roy.end?s.roy.v:0),exp:expenses(),rent:s.props.reduce((t,p)=>t+rentOf(p),0),mort:s.props.reduce((t,p)=>t+(p.loan>0?p.pay:0),0)+loanPay()+carPays(),own:ownInc()};f.tax=s.tax?Math.max(0,(f.job+f.biz+f.pend+f.spon+f.rent*.5)*margRate()+f.own*.15):0;for(const b of BIZ){const o=s.biz[b.id];if(o?.n)f[o.mgr?'biz':'pend']+=bizInc(b,o)}return f}
const pfmt=n=>n>=1?fmt(n):'$'+(n<1e-6?n.toExponential(1):n.toPrecision(3));
const qfmt=n=>n>=1?'$'+n.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2}):pfmt(n); // share prices to the cent, like a broker
const units=u=>u>=1000?big(u):u>=1?u.toFixed(2):u.toPrecision(3);
const coin=k=>s.cx.coins.find(c=>c.t===k);
const walletVal=()=>Object.entries(s.wallet).reduce((t,[k,w])=>t+w.u*(coin(k)?.p||0),0);
function initCrypto(){s.cx={bull:true,launched:0,coins:COINS.map(c=>({...c,o:c.p,h:[c.p]}))};for(let i=0;i<239;i++)cryptoDay(1)}
// crypto never closes: in live play each day's move is spread over its 1,440 minutes; fast simulation takes it in one step
const cdrift=c=>c.mu-c.v*c.v/2+(s.cx.bull?.0012:-.0015)*c.b;
function cstep(w){const m=gauss()*.02*Math.sqrt(w);for(const c of s.cx.coins)if(!c.stable&&!c.dead){c.p=Math.max(1e-8,c.p*Math.exp(cdrift(c)*w+m*c.b+c.v*Math.sqrt(w)*gauss()));c.h[c.h.length-1]=c.p}}
function cryptoDay(quiet,live){
  const X=s.cx;
  if(R()<(X.bull?.004:.006)){X.bull=!X.bull;if(!quiet)chirp('@coinwire','CoinWire',X.bull?'crypto is so back. green candles everywhere':'crypto winter is here. hold on to your seed phrases',1)}
  for(const c of X.coins){c.o=c.h[c.h.length-1]=r6(c.p);c.h.push(c.p);if(c.h.length>240)c.h.shift()} // the day's line starts at yesterday's close
  if(!live)cstep(1);
  for(const c of X.coins){
    if(c.fd&&s.day>=c.fd){const held=s.wallet[c.t];c.fd=0;
      if(c.fate==='moon'){const x=rint(5,40);c.p*=x;c.v=.1;chirp('@coinwire','CoinWire',`$${c.t} is up ${(x-1)*100}% this week and nobody knows why`,1);if(held)log(`$${c.t} mooned: up ${x}×.`,'good')}
      else{c.p*=.02;c.dead=s.day;chirp('@degen_dan','Degen Dan',`$${c.t} devs pulled the liquidity. it's over 💀`);if(held)log(`$${c.t} got rugged. Down 98%.`,'bad')}
      c.h[c.h.length-1]=c.p}
  }
  if(quiet)return;
  for(const c of X.coins)if(c.stable&&s.wallet[c.t])s.wallet[c.t].u*=1+c.apy/365;
  if(R()<1/45&&X.coins.filter(c=>c.meme&&!c.dead).length<7){
    let k;do k=pick(MEME)+pick(['','INU','X','AI','2']);while(coin(k));
    const p=+(10**-rint(2,5)*rint(1,9)).toPrecision(2);
    X.coins.push({t:k,n:`${k[0]+k.slice(1).toLowerCase()} ${pick(['Coin','Token','Protocol','Swap'])}`,p,o:p,h:[p],v:.13,mu:.002,b:2.5,meme:1,born:s.day,fate:R()<.22?'moon':'rug',fd:s.day+rint(15,180)});
    X.launched++;chirp('@degen_dan','Degen Dan',`$${k} just launched. still early 👀`);
  }
  if(!live)cbrackets();
  X.coins=X.coins.filter(c=>!c.dead||s.wallet[c.t]||s.day-c.dead<60);
}
const rc=n=>n===0?'g':RED.has(n)?'red':'blk';
const rlMult=(k,n)=>k[0]==='n'?(+k.slice(1)===n?36:0):n===0?0:({red:RED.has(n),black:!RED.has(n),odd:n%2===1,even:n%2===0,low:n<=18,high:n>18}[k]?2:k[0]==='d'&&Math.ceil(n/12)===+k[1]?3:0);
const hsh=(a,b)=>{const x=Math.sin(a*12.9898+b*78.233)*43758.5453;return x-Math.floor(x)}; // stable pseudo-random per day
const volAt=(k,i)=>{const h=s.px[k.t].h,r=i?Math.abs(Math.log(h[i]/h[i-1])):0,sd=par(k).sig/Math.sqrt(YR),part=i===h.length-1&&inSession()?uw(closeAt()-OPEN).slice(0,s.min-OPEN+1).reduce((a,x)=>a+x,0):1;return adv(k)*(.5+.4*Math.min(6,r/sd))*(.6+.8*hsh(s.day-h.length+1+i,k.t.length))*part}; // big moves bring big volume
function hv(h){let t=0,a=0;for(const c of h){const r=c>>2;t+=Math.min(r,10);if(r===1)a++}return a&&t+10<=21?t+10:t}
function drawCard(){const z=s.cz;if(!z.shoe||z.shoe.length<52){z.shoe=[];for(let d=0;d<6;d++)for(let c=4;c<56;c++)z.shoe.push(c);for(let i=z.shoe.length-1;i>0;i--){const j=Math.floor(R()*(i+1));[z.shoe[i],z.shoe[j]]=[z.shoe[j],z.shoe[i]]}}return z.shoe.pop()}
function slotSpin(){const W=SLOT.reduce((t,x)=>t+x[1],0),r=[0,0,0].map(()=>{let k=R()*W;for(const x of SLOT)if((k-=x[1])<0)return x[0];return SLOT[0][0]}),[a,b,c]=r;
  return {r,m:a===b&&b===c?SLOT.find(x=>x[0]===a)[2]:a===b||b===c||a===c?.7:0}}
function stake(){const z=s.cz;if(s.day<z.ban||s.cash<z.chip)return 0;s.cash-=z.chip;return z.chip}
function settle(bet,ret,game,key){const z=s.cz,d=ret-bet;viceAdd('gam',d<0?.6:.3);taxAdd('gam',d);const r=(z.g??={})[key]??={n:0,net:0};r.n++;r.net+=d;s.cash+=ret;z.net+=d;z.played++;add('hap',d>0?2:d<0?-1:0);if(Math.abs(d)>=Math.max(1e5,netWorth()*.05))log(`${d>0?'Won':'Lost'} ${fmt(Math.abs(d))} at ${game}.`,d>0?'good':'bad')}
function bjEnd(){const b=s.cz.bj,p=hv(b.p),nat=b.p.length===2&&p===21;
  if(p<21||(p===21&&!nat))while(hv(b.d)<17)b.d.push(drawCard());
  const d=hv(b.d),dnat=b.d.length===2&&d===21;
  const ret=p>21?0:nat&&!dnat?b.bet*2.5:dnat&&!nat?0:d>21||p>d?b.bet*2:p===d?b.bet:0;
  b.msg=p>21?'Bust.':nat&&!dnat?'Blackjack! Paid 3 to 2.':dnat&&!nat?'Dealer has blackjack.':ret>b.bet?(d>21?'Dealer busts. You win.':'You win.'):ret===b.bet?'Push. Your bet comes back.':'Dealer wins.';
  b.done=1;settle(b.bet,ret,'blackjack','bj')}
function netWorth(){let w=s.cash+(s.fin&&s.mkt.div?finVal():0)-(s.mloan||0);for(const t in s.shorts||{})w-=s.shorts[t].sh*s.px[t].p;if(s.opts?.length)w+=optVal();for(const t in s.port)w+=s.port[t].sh*s.px[t].p;w+=bizWorth();for(const id in s.own)w+=SM[id].cost*.6;for(const p of s.props)w+=pval(p)-p.loan;for(const c of s.cars)w+=c.v-(c.loan||0);return w+walletVal()+suWorth()+clubVal()-(s.debt||0)}
function log(t,k='info'){s.log.unshift({d:s.day,t,k});if(s.log.length>80)s.log.pop()}
function chirp(h,n,x,v){s.feed.unshift({h,n,x,v,l:0,tl:rint(3,40)*(v?40:1),d:s.day});if(s.feed.length>60)s.feed.pop()}
const decDays=()=>Math.min(s?.opt?.dec||30,s?.staff?.pa?7:90),opt=k=>!!s?.opt?.[k];
function toast(m){if(catching||opt('quiet'))return;const t=document.createElement('div');t.className='toast';t.innerHTML=m;$('#toasts').append(t);setTimeout(()=>t.remove(),2800)}

function newGame(name,bg,h={}){
  const b=BG[bg]||{cash:0,st:{hea:75,hap:60,sma:40,loo:50}};
  s={v:1,name,handle:'@'+(name.toLowerCase().replace(/[^a-z0-9]/g,'').slice(0,15)||'you'),day:0,startAge:18,cash:b.cash+(h.inherit||0),st:{...b.st},edu:b.edu||0,study:null,
     job:b.job||null,jobDays:0,rank:0,biz:{},port:{},px:{},mkt:{bull:true,h:MVOL.bull**2/YR,eps:0,cb:0,div:1,ic:1,ih:1,rc:1e13},orders:[],fol:b.fol||0,feed:[],own:{},people:[],degs:b.edu?[{p:'dip',sc:'cc',mj:'Computer science',hon:false}]:[],debt:0,xp:{},perf:50,raise:0,pension:0,wallet:{},cz:{chip:100,net:0,played:0,rh:[],ban:0},props:[],cars:[],home:null,re:{idx:1,list:[],next:0},cd:{},inbox:[],later:[],log:[],seenV:NEWSV,fl:flNew(),su:null,pol:polNew(),club:null,credit:650,vice:{alc:0,gam:0},pets:[],conds:[],ins:'basic',legal:{rec:[],cases:[],jail:0},hob:{},
     gen:h.gen||1,boost:0,lastPost:0,dead:0,lastSeen:Date.now(),goals:{...h.goals},min:480,eco:h.eco?{...h.eco}:ecoNew(),fin:finNew(),tax:taxNew(),mloan:0,shorts:{},opts:[]};applyPrices();
  s.legacy=1+.25*(s.gen-1);
  s.tr=h.tr||rollTraits().slice(0,1);s.tree=h.tree||[];s.fdn=h.fdn||0;s.city=h.city||'suburb';
  if(h.ks){for(const k in h.ks)s.st[k]=Math.round(clamp(h.ks[k],0,100));s.cash+=h.fund||0;s.debt=h.loan||0;if(h.degs){s.degs=h.degs;s.edu=h.edu}if(h.job){s.job=h.job;s.xp=h.xp||{}}if(h.study)s.study=h.study} // the heir is the person their childhood made
  else if(h.gen){s.st.sma=Math.round(s.st.sma*.7+h.sma*.3);s.st.loo=Math.round(s.st.loo*.7+h.loo*.3)} // a little of the family runs in the blood
  if(h.pets)s.pets=h.pets.map(p=>({...p,uid:uid()}));
  if(h.kid){s.startAge=h.age;add('hap',(h.rel-50)*.3)}
  for(const k of STOCKS)seedStock(k);
  for(let i=0;i<239;i++)marketDay(1);
  for(const k of STOCKS){anchor(k);initStock(k)}
  s.mkt.rc=capSum()*.6;s.mkt.div=(capSum()+s.mkt.rc)/5000;s.mkt.ic=s.mkt.ih=5000;s.mkt.lab='Bull market';
  initCrypto();relist();
  if(h.fam){for(const p of h.fam){const q={...p,uid:uid(),met:0,c:{}};if(q.role==='child'){q.rel=75;q.k=kidNew();q.k.sma=q.k.gs*(.3+Math.min(1,ageOf(q)/10)*.7)}if(q.role==='spouse'){partnerNew(q);q.wed=0;q.wedNW=0}s.people.push(q)}for(let i=rint(1,2);i>0;i--)meet('friend',rint(45,70),-s.startAge*365+rint(-2,2)*365)}else makeFamily();
  mile(h.kid?`Took over the family from ${esc(h.last)}.`:h.gen?`Inherited the family fortune from ${esc(h.last)}.`:'Turned 18 and moved out.');
  log(h.kid?`${esc(name)}, ${Math.floor(s.startAge)}, takes over from ${esc(h.last)} with a ${fmt(h.inherit)} inheritance. Generation ${s.gen} begins.`:h.gen?`${esc(name)} begins generation ${s.gen} with a ${fmt(h.inherit)} inheritance.`:`${esc(name)} turns 18 and moves out. Time to hustle.`,'good');
  chirp('@hustleculture','Hustle Culture','new week, new grind. what are you building? 👇',1);
}

// ---------- simulation ----------
function day(live){
  s.day++;ecoDay();finDay();shortDay();const A=age(),f=flows();
  s.cash+=f.job+f.biz+f.spon+f.rent+f.own-f.exp-f.mort;taxAdd('ord',f.job+f.biz+f.spon+f.rent*.5);taxAdd('lt',f.own); // half of rent is sheltered by landlord deductions; company profits are taxed like dividends
  if(s.debt>0){s.debt=Math.max(0,s.debt*(1+.06/365)-loanPay());if(s.debt<1){s.debt=0;log('Student loans paid off.','good')}}
  carLoanDay();
  for(const p of s.props)if(p.loan>0){p.loan-=p.pay-p.loan*(p.rate||.055)/365;if(p.loan<=1){p.loan=p.pay=0;log(`Paid off the mortgage on your ${pname(p)}.`,'good')}}
  s.re.idx*=Math.exp((s.eco.pi+.012+.06*s.eco.g-2*(mrate()-.06))/365+housingDrift()+.0035*gauss());
  for(const c of s.cars){const k=CM[c.t];c.v=Math.max(k.price*.08,c.v*Math.exp(-k.dep/365+(k.vol?k.vol/19.1*gauss():0)))}
  if(s.day>=s.re.next)relist();
  for(const b of BIZ){const o=s.biz[b.id];if(!o?.n)continue;closeCheck(b,o);if(o.n&&!o.mgr){const g=bizInc(b,o);if(g<0){s.cash+=g;taxAdd('ord',g)}else o.pend=Math.min(o.pend+g,g*CAP)}} // losses come straight out of cash
  if(s.cash<0){s.cash*=1+debtAPR()/365;add('hap',-.05)}
  if(s.job){const J=job();s.jobDays++;s.xp[J.fld]=(s.xp[J.fld]||0)+1;
    s.perf=clamp(s.perf+((40+(trait('driven')?8:0)+hours().perf+s.st.sma*.3+(s.st.hap-50)*.2-J.str*2)-s.perf)*(boss()?.bt==='absent'?.012:.02),0,100);
    if(s.jobDays%120===0&&!topRank()){if(s.perf>=promoNeed()){s.rank++;s.perf-=10;mile(`Promoted to ${jobTitle()}.`);{const pt=partner();if(pt?.pt==='ambitious')prel(pt,8)}log(`Promoted to <b>${jobTitle()}</b>! Now ${fmt(jobPay())} a day.`,'good');toast('Promotion!')}else log(`Passed over for promotion. You needed a performance of ${promoNeed()}.`,'bad')}
    if(s.job&&s.eco.u>.05&&R()<(s.eco.u-.045)*2/365){const j=jobTitle(),sev=jobPay()*30;fire();s.cash+=sev;taxAdd('ord',sev);add('hap',-12);mile(`Laid off from ${j}.`);log(`Laid off from ${j} as the economy slows. Severance: ${fmt(sev)}.`,'bad');toast(`Laid off from ${j}`)}
    if(s.job&&s.perf<20&&R()<.01){const j=jobTitle();fire();mile(`Fired from ${j}.`);add('hap',-15);log(`Fired from ${j} for poor performance.`,'bad');toast(`Fired from ${j}.`)}}
  peopleDay();othersDay();
  if(s.study&&!jailed()){const st=s.study,P=PG[st.p];st.left--;st.g=clamp(st.g+((40+(trait('bright')?6:0)+s.st.sma*.4+(s.st.hap-50)*.2)-st.g)*.02,0,100);if(P.stipend)s.cash+=P.stipend;
    if(st.left<=0){if(st.g<30){st.left=60;st.g=45;log(`Failed the final exams for ${degName(st)}. One more term.`,'bad');toast('Failed the finals. One more term.')}else graduate()}}
  const J=job();
  // stats drift toward a baseline, so an idle life is dull but survivable; choices push you above or below it
  add('hap',(50+(trait('sunny')?6:0)-(trait('anxious')?6:0)-s.st.hap)*.004-(J?J.str*.02:0)-(s.study&&s.study.sc!=='online'?.03:0)+peopleHap()+mateHap()+city().hap+(s.rc?.01:0)+(diet().hap||0)+(s.job?hours().hap:0)-(s.job&&boss()?.bt==='toxic'?.04:0)+petSum('hap')+shopSum('hap')+(PM[homeP()?.t]?.hap||0)+(bestCar()?CM[bestCar().t].hap:0));
  add('hea',diet().hea+(s.job?hours().hea:0)+(85+(trait('sporty')?5:0)-Math.max(0,A-35)*1.2-s.st.hea)*.003+(s.st.hap>70?.01:0)-(s.st.hap<15?.04:0));
  if(A>30)add('loo',-.004);
  s.fol+=shopSum('fame')+carSum('fame')+s.props.reduce((t,p)=>t+(PM[p.t].fame||0),0);if(s.day-s.lastPost>30)s.fol*=.999;
  for(const p of s.feed)if(p.l<p.tl)p.l+=Math.ceil((p.tl-p.l)*.35);
  if(R()<.3)npcChatter();
  marketDay(0,live);cryptoDay(0,live);
  statsSnap();
  if(s.day%7===0){(s.nwh??=[]).push(Math.round(netWorth()));if(s.nwh.length>104)s.nwh.shift()}
  s.later=s.later.filter(p=>p.d>s.day||(runLater(p),false));
  s.inbox=s.inbox.filter(it=>{if(s.day-it.d<decDays())return true;const e=EVM[it.id];if(!e.c||e.c(s))log(`<b>${e.t}</b> ${e.ch[e.def][1](s,it.a)}<span class="auto">decided for you</span>`);return false});
  if(s.inbox.length<3&&R()<1/28)newEvent();
  flDay();if(s.su)suDay();propDay();worldDay();fdnDay();oldDay(A);polDay();clubDay();creditDay();viceDay();milDay();trustDay();stlDay();chDay();staffDay();starDay();statsDay();
  lifeDay(A);if(s.dead)return;
  const pd=s.st.hea<=0?1:A>60?Math.min(.5,((A-60)/30)**3*3)/365:0;
  if(R()<pd)die();else checkGoals();
}
// ---------- the calendar: day 0 is Monday, January 8 of year 1. Years have 365 days, so January 1 moves a weekday each year ----------
const WD=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],MON=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],MD=[31,28,31,30,31,30,31,31,30,31,30,31],CAL0=7;
const wdOf=d=>((d%7)+7)%7;
function dateOf(d){const x=d+CAL0,y=Math.floor(x/365);let r=x-y*365,m=0;while(r>=MD[m]){r-=MD[m];m++}return {y:y+1,m,dd:r+1,wd:wdOf(d)}}
const dayOf=(y,m,dd)=>(y-1)*365+MD.slice(0,m).reduce((a,x)=>a+x,0)+dd-1-CAL0;
const nthWd=(y,m,wd,n)=>{const d0=dayOf(y,m,1);return d0+(wd-wdOf(d0)+7)%7+7*(n-1)};
const lastWd=(y,m,wd)=>{const d1=dayOf(y,m,MD[m]);return d1-(wdOf(d1)-wd+7)%7};
const observed=d=>wdOf(d)===5?d-1:wdOf(d)===6?d+1:d; // Saturday holidays close the Friday before, Sunday ones the Monday after
const HOLS={};
function holidays(y){ // the exchange's closures and 1 PM early closes for one year
  if(HOLS[y])return HOLS[y];const H={},E={},ny=dayOf(y,0,1);
  if(wdOf(ny)!==5)H[observed(ny)]="New Year's Day"; // a Saturday New Year's Day is not made up on the Friday
  H[nthWd(y,0,0,3)]='Martin Luther King Jr. Day';H[nthWd(y,1,0,3)]="Presidents' Day";H[lastWd(y,4,0)]='Memorial Day';
  H[observed(dayOf(y,5,19))]='Juneteenth';H[observed(dayOf(y,6,4))]='Independence Day';H[nthWd(y,8,0,1)]='Labor Day';
  const tg=nthWd(y,10,3,4);H[tg]='Thanksgiving';H[observed(dayOf(y,11,25))]='Christmas Day';
  for(const d of [tg+1,dayOf(y,6,3),dayOf(y,11,24)])if(!H[d]&&wdOf(d)<5)E[d]=1;
  return HOLS[y]={H,E};
}
const holiday=(d=s.day)=>holidays(dateOf(d).y).H[d];
const tradingDay=(d=s.day)=>wdOf(d)<5&&!holiday(d);
const OPEN=570,closeAt=(d=s.day)=>holidays(dateOf(d).y).E[d]?780:960;
const halted=()=>s.mkt.hd===s.day&&s.min<s.mkt.hu;
const inSession=()=>tradingDay()&&s.min>=OPEN&&s.min<closeAt(),mktOpen=()=>inSession()&&!halted();
const clock=m=>`${(Math.floor(m/60)+11)%12+1}:${String(m%60).padStart(2,'0')} ${m<720?'AM':'PM'}`;
const dstr=d=>{const x=dateOf(d);return `${WD[x.wd]}, ${MON[x.m]} ${x.dd}`};
function nextTrading(d){while(!tradingDay(d))d++;return d}
function nextOpen(){if(tradingDay()&&s.min<OPEN)return `at ${clock(OPEN)}`;const d=nextTrading(s.day+1);return d===s.day+1?`tomorrow at ${clock(OPEN)}`:d-s.day<7?`${WD[wdOf(d)]} at ${clock(OPEN)}`:`${dstr(d)} at ${clock(OPEN)}`}
function minute(){
  if(++s.min>=1440){s.min=0;day(1);if(s.dead)return}
  cstep(1/1440);cbrackets();
  if(tradingDay()){const c=closeAt();if(s.min===OPEN)openBell();else if(s.min>OPEN&&s.min<=c){mtick(s.min-OPEN-1,c-OPEN);if(s.min===c)closeBell()}}
}
function marketDay(quiet,live){ // once per calendar day; live play moves prices minute by minute instead of here
  if(!live&&tradingDay())tradeDay(quiet);
  if(!quiet)for(const k of PENNIES)if(s.px[k.t].p<.01)bankrupt(k);
}

// ---------- the model: returns follow beta (CAPM), risk follows each stock's real volatility, and market volatility clusters (GJR-GARCH) ----------
// Bull markets average about 4½ years and bear markets about a year, so stocks return roughly 9% a year over a lifetime.
const YR=252,RF=.04,MU={bull:.13,bear:-.15},MVOL={bull:.12,bear:.22},KAPPA=.07,SECV=.07,GAP=.25,G_A=.02,G_G=.14,G_B=.88;
const alpha0=k=>clamp((k.mu-.0004)*365*.3,-.05,.05),PAR={},AMEAN=(()=>{const c=STOCKS.filter(k=>!k.pn);return c.reduce((a,k)=>a+alpha0(k)*k.p*k.sh,0)/c.reduce((a,k)=>a+k.p*k.sh,0)})(),BNORM=(()=>{const c=STOCKS.filter(k=>!k.pn);return c.reduce((a,k)=>a+k.b*k.p*k.sh,0)/c.reduce((a,k)=>a+k.p*k.sh,0)})(); // betas rescaled so the index's own beta is exactly 1
function par(k){ // annual volatility, beta, alpha, idiosyncratic volatility (84% of the variance; earnings jumps bring the rest), turnover
  if(PAR[k.t])return PAR[k.t];const sig=k.v*Math.sqrt(365),bn=k.b/BNORM,a=k.pn?(ph(k.t,4)-.5)*.3-.1:alpha0(k)-AMEAN;
  return PAR[k.t]={sig,b:bn,a,se:Math.sqrt(Math.max((.35*sig)**2,sig*sig*.84-(bn*MVOL.bull)**2-SECV*SECV)),turn:k.pn?.01+.03*ph(k.t,43):.004+.006*ph(k.t,43)};
}
const shOf=t=>s.px[t].sh||SK[t].sh;
const vstate=()=>clamp(s.mkt.h*YR/MVOL.bull**2,.4,40); // how stressed the market is: 1 = a calm bull market
const fear=()=>Math.sqrt(s.mkt.h*YR)*140; // like the VIX: implied volatility, which usually sits above realised
const UWS={};
function uw(n){ // share of a session's variance in each minute: busiest at the open and into the close
  if(UWS[n])return UWS[n];const w=Array.from({length:n},(_,j)=>1+2*Math.exp(-j/25)+Math.exp(-(n-1-j)/25)),t=w.reduce((a,x)=>a+x,0);return UWS[n]=w.map(x=>x/t);
}
const r6=x=>{if(!x)return x;const e=10**(5-Math.floor(Math.log10(Math.abs(x))));return Math.round(x*e)/e}; // finished bars keep 6 significant figures, which keeps the save small
function anchor(k){const q=s.px[k.t],f=k.p/q.p;for(let i=0;i<q.h.length;i++){q.h[i]=r6(q.h[i]*f);q.k[i]=q.k[i].map(x=>r6(x*f))}for(const x of ['p','o','op','hi','lo'])q[x]*=f} // history ends at the listed price
const seedStock=k=>s.px[k.t]={p:k.p,o:k.p,op:k.p,hi:k.p,lo:k.p,h:[k.p],k:[[k.p,k.p,k.p]]};
function newBar(q){const i=q.h.length-1,b=q.k[i];q.h[i]=r6(q.h[i]);for(let j=0;j<3;j++)b[j]=r6(b[j]);q.o=q.h[i];q.h.push(q.p);q.k.push([q.p,q.p,q.p]);q.op=q.hi=q.lo=q.p;if(q.h.length>240){q.h.shift();q.k.shift()}}
function mstep(w,list=STOCKS){ // one slice of a session carrying share w of the day's drift and variance (the hot loop)
  const M=s.mkt,sq=Math.sqrt(w),zm=gauss()*Math.sqrt(M.h)*sq,vi=Math.sqrt(Math.sqrt(vstate())),mm=(M.bull?MU.bull:MU.bear)-RF,mh=M.h*YR,si=Math.sqrt(vi/YR)*sq,ss=SECV*sq/Math.sqrt(YR),sec={};
  if(list===STOCKS){M.eps+=zm;M.rc*=Math.exp((RF+mm-.015-mh/2)/YR*w+zm+.03*sq/Math.sqrt(YR)*gauss())} // the other 442 companies in the index move with the market
  for(const k of list){const P=PAR[k.t]||par(k),q=s.px[k.t],b=q.k[q.k.length-1],z=sec[k.sec]??(sec[k.sec]=gauss()*ss);
    const mu=RF+P.b*mm+P.a+(q.rv||0)+(q.gr>s.day?.12:0),r=(mu-(P.b*P.b*mh+SECV*SECV+P.se*P.se*vi)/2)/YR*w+P.b*zm+z+P.se*si*gauss();
    let p=q.p*Math.exp(r);if(p<1e-4)p=1e-4;q.p=p;if(p>q.hi)q.hi=b[1]=p;if(p<q.lo)q.lo=b[2]=p;q.h[q.h.length-1]=p}
}
function openBell(){ // overnight news lands as a gap, then scheduled earnings and ex-dividend drops
  const M=s.mkt;M.eps=0;M.cb=0;for(const k of STOCKS)newBar(s.px[k.t]);mstep(GAP);events();
  for(const k of STOCKS){const q=s.px[k.t];q.op=q.hi=q.lo=q.p;q.k[q.k.length-1]=[q.p,q.p,q.p]}
  breakers();
}
function mtick(j,n){ // minute j of an n-minute session
  if(halted())return;mstep((1-GAP)*uw(n)[j]);pennyNews(1/n);if(R()<1/(25*YR*n))crash();else if(R()<.1/n)news();
  breakers();if(!halted()){fillOrders();brackets();marginCheck()}
}
function closeBell(quiet){ // the session's market move updates volatility; splits, the index and day orders settle
  const M=s.mkt,e=M.eps;M.h=clamp(M.h*G_B+(1-G_A-G_G/2-G_B)*(M.bull?MVOL.bull:MVOL.bear)**2/YR+(G_A+(e<0?G_G:0))*e*e,(.06**2)/YR,(.9**2)/YR);
  M.ra=(M.ra||0)+1;if(R()<(M.bull?1/(4.5*YR):(1+M.ra/YR)/(1.3*YR))){M.bull=!M.bull;M.ra=0} // hidden regime; bears grow likelier to end the longer they run. The label people see comes from the index
  if(!quiet)for(const k of MAIN)if(s.px[k.t].p>=1000)split(k); // not while building price history
  const cs=capSum(),lw=MAIN.map(k=>{const w=s.px[k.t].p*shOf(k.t)/cs;return [k,w,Math.log(w/W0[k.t])]}),avg=lw.reduce((a,[,w,l])=>a+w*l,0);
  for(const[k,,l]of lw)s.px[k.t].rv=-KAPPA*(l-avg); // competition: a company far bigger than it started gets a drag, a shrunken one a tailwind; it nets to zero across the index
  const x=idx();M.ic=x;if(x>M.ih){if(M.lab!=='Bull market'&&M.lab&&!quiet)chirp('@MarketWire','MarketWire',`the Hustle 500 closes at a record high of ${x.toFixed(0)}. the ${M.lab.toLowerCase()} is over`,1);M.ih=x;M.lab='Bull market'}
  const lab=mktLabel();if(lab!==M.lab){if(lab!=='Bull market'&&!quiet)chirp('@MarketWire','MarketWire',lab==='Bear market'?`the Hustle 500 is now down ${Math.round(-dd()*100)}% from its high. that's a bear market`:`the Hustle 500 has fallen ${Math.round(-dd()*100)}% from its high and is in correction`,1);M.lab=lab}
  s.orders=s.orders.filter(o=>o.tif!=='day'||(log(`Your ${o.type} order for ${big(o.n)} $${o.t} expired at the close.`),false));
  if(!quiet&&s.opts?.length)optSettle();
}
function tradeDay(quiet,list=STOCKS){ // a whole session in one step, for price history and fast simulation
  const full=list===STOCKS,M=s.mkt;if(full){M.eps=0;M.cb=0}
  for(const k of list)newBar(s.px[k.t]);
  mstep(GAP,list);if(full&&!quiet)events();
  for(const k of list){const q=s.px[k.t];q.op=q.p}
  mstep(1-GAP,list);
  for(const k of list){const q=s.px[k.t],sd=par(k).sig/Math.sqrt(YR)*.6;q.hi=Math.max(q.op,q.p)*Math.exp(Math.abs(gauss())*sd);q.lo=Math.min(q.op,q.p)*Math.exp(-Math.abs(gauss())*sd);q.k[q.k.length-1]=[q.op,q.hi,q.lo]}
  if(!full)return;
  if(!quiet){pennyNews(1);if(R()<1/(25*YR))crash(true);else if(R()<.1)news();fillOrders(1);brackets(1);marginCheck()}
  closeBell(quiet);
}
function shock(t,p,sess=true){ // outside the session a move only shifts where the next open starts
  const q=s.px[t];q.p=Math.max(1e-4,q.p*(1+p));if(!sess)return;
  const b=q.k.at(-1);q.h[q.h.length-1]=q.p;q.hi=b[1]=Math.max(q.hi,q.p);q.lo=b[2]=Math.min(q.lo,q.p)}

// ---------- the index: cap-weighted, like the S&P 500; corrections and bear markets are measured from its high ----------
const capSum=()=>MAIN.reduce((a,k)=>a+s.px[k.t].p*shOf(k.t),0),W0=(()=>{const c=STOCKS.filter(k=>!k.pn),t=c.reduce((a,k)=>a+k.p*k.sh,0);return Object.fromEntries(c.map(k=>[k.t,k.p*k.sh/t]))})();
const idx=()=>(capSum()+s.mkt.rc)/s.mkt.div,idxDay=()=>idx()/s.mkt.ic-1,dd=()=>idx()/s.mkt.ih-1;
const mktLabel=()=>dd()<=-.2?'Bear market':dd()<=-.1?'Correction':'Bull market';
function breakers(){ // market-wide halts: 15 minutes at -7% and -13% (not after 3:25), closed for the day at -20%
  const M=s.mkt,r=idxDay(),c=closeAt();let lv=r<=-.2?3:r<=-.13?2:r<=-.07?1:0;if(lv<=M.cb)return;
  M.cb=lv;M.hd=s.day;if(lv<3&&s.min>=c-35)return;M.hu=lv===3?c:s.min+15;
  const m=lv===3?'Trading is halted for the rest of the day after a 20% plunge.':`Circuit breaker: trading halts for 15 minutes with the market down ${lv===1?7:13}%.`;
  chirp('@MarketWire','MarketWire',m.toLowerCase(),1);log(m,'bad');toast(lv===3?'Market closed early':'Trading halted')
}

// ---------- scheduled events: quarterly earnings, ex-dividend dates, splits ----------
const QSTART=[0,90,181,273];
function sched(k,from,kind){ // next earnings reaction day or ex-dividend day on or after from
  const y0=dateOf(from).y;
  for(let y=y0-1;y<=y0+1;y++)for(let qn=0;qn<4;qn++){
    const doy=kind==='e'?QSTART[qn]+14+Math.floor(ph(k.t,40)*40):QSTART[qn]+5+Math.floor(ph(k.t,42)*80);let d=nextTrading((y-1)*365+doy-CAL0);
    if(kind==='e'&&ph(k.t,41)<.5)d=nextTrading(d+1); // reports after the close move the stock at the next open
    if(d>=from)return d}
}
function initStock(k){ // earnings, estimates and dividend dates for a stock, keeping whatever it already has
  const q=s.px[k.t];if(q.eps==null){const avg=q.h.reduce((a,x)=>a+x,0)/q.h.length;q.eps=k.pe?avg/k.pe:-avg*(.05+.1*ph(k.t,8))}
  q.er??=sched(k,s.day+1,'e');if(k.div)q.nd??=sched(k,s.day+1,'d');
}
function events(){
  let dv=0;const got=[];
  for(const k of STOCKS){const q=s.px[k.t];
    if(q.er<=s.day)earnings(k);
    if(k.div&&q.nd<=s.day){q.nd=sched(k,s.day+1,'d');const Sh=s.shorts[k.t];if(Sh){const owe=q.p*k.div/4*Sh.sh;s.cash-=owe;log(`You owe ${fmt(owe)} in dividends on your $${k.t} short.`,'bad')}if(controls(k.t))continue;const a=q.p*k.div/4,h=s.port[k.t];if(h){dv+=a*h.sh;got.push(k.t)}shock(k.t,-k.div/4,true)}}
  if(dv>0){s.cash+=dv;taxAdd('lt',dv);log(`Dividends: ${fmt(dv)} from ${got.map(t=>'$'+t).join(', ')}.`,'good')}
}
const epsEst=k=>{const q=s.px[k.t],P=par(k);if(q.eps<=0)return q.eps/4;const g=RF+P.b*.055+P.a-(k.div||0)+(k.pe?.3*Math.log(k.pe/(q.p/q.eps)):0);return q.eps/4*Math.exp(clamp(g,-.3,.5)/4)};
function earnings(k){ // a beat or a miss against the estimate moves the stock at the open
  const q=s.px[k.t],est=epsEst(k),z=clamp(gauss()*1.1,-4,4),act=est*(1+(est>=0?.06:-.12)*z),sE=3.2*par(k).sig/Math.sqrt(YR),mv=Math.exp(clamp((.7*z+.7*gauss())*sE,-.9,3))-1;
  q.eps=q.eps*.75+act;q.last={d:s.day,est,act,mv};q.er=sched(k,s.day+1,'e');shock(k.t,mv,true);
  const beat=act>=est,msg=`$${k.t} ${beat?'beats':'misses'}: EPS ${pfmtS(act)} vs ${pfmtS(est)} expected. shares ${mv>=0?'+':''}${(mv*100).toFixed(1)}%`;
  if(s.port[k.t]){log(`${esc(nameOf(k.t))} ${beat?'beat':'missed'} earnings. Shares ${pct(mv)}.`,beat?'good':'bad')}
  if(s.port[k.t]||q.p*shOf(k.t)>3e11)chirp('@MarketWire','MarketWire',msg,1);
}
const pfmtS=v=>(v<0?'-':'')+pfmt(Math.abs(v));
function split(k){ // a pricey stock splits so a share costs a few hundred dollars again
  const q=s.px[k.t],n=q.p>=5000?20:q.p>=2500?10:q.p>=1500?5:4;
  q.sh=shOf(k.t)*n;for(const x of ['p','o','op','hi','lo','eps'])q[x]/=n;for(let i=0;i<q.h.length;i++){q.h[i]=r6(q.h[i]/n);q.k[i]=q.k[i].map(x=>r6(x/n))}
  if(q.last){q.last.est/=n;q.last.act/=n}
  const Sp=s.shorts[k.t];if(Sp){Sp.sh*=n;Sp.px/=n}
  for(const o of s.opts||[])if(o.t===k.t){o.K/=n;o.n*=n}
  const h=s.port[k.t];if(h){h.sh*=n;if(h.tp)h.tp/=n;if(h.sl)h.sl/=n;if(h.hw)h.hw/=n;log(`$${k.t} split ${n}-for-1. You now hold ${big(h.sh)} shares.`,'good')}
  for(const o of s.orders)if(o.t===k.t){o.n*=n;o.px/=n;if(o.tp)o.tp/=n;if(o.sl)o.sl/=n}
  chirp('@MarketWire','MarketWire',`${nameOf(k.t)} completes a ${n}-for-1 stock split. $${k.t} now trades around ${pfmt(q.p)}`,1);
}

// ---------- penny stocks ----------
const PENNIES=STOCKS.filter(k=>k.pn),MAIN=STOCKS.filter(k=>!k.pn);
const PN1=['Nova','Apex','Quantum','Titan','Blue','Iron','Neo','Omni','Vertex','Polar','Echo','Zenith','Luna','Hyper','Solar','Crimson'],PN2=['Biotech','Mining','Labs','Motors','Energy','Networks','Therapeutics','Robotics','Resources','Media','Pay','Aerospace'];
function pennyNews(w){ // pumps and share-offering dumps, w = share of a session
  for(const k of PENNIES){const r=R();if(r>=.009*w)continue;const up=r<.004*w,p=up?.4+R()*2.1:-(.3+R()*.3);shock(k.t,p,true);
    chirp('@PennyPumps','Penny Pumps',up?`$${k.t} ${nameOf(k.t)} rips ${Math.round(p*100)}% 🚀 volume is insane`:`$${k.t} dumps ${Math.round(-p*100)}% after announcing a share offering`,1)}
}
function bankrupt(k){ // below a cent the company goes under; a new one lists in its place
  const q=s.px[k.t],old=nameOf(k.t),h=s.port[k.t];
  if(h){delete s.port[k.t];capGain(-h.cost,h.d);log(`${esc(old)} went bankrupt. Your ${big(h.sh)} shares are worthless.`,'bad');toast(`${esc(old)} went bankrupt`)}
  s.orders=s.orders.filter(o=>o.t!==k.t);
  const Sb=s.shorts[k.t];if(Sb){capGain(Sb.px*Sb.sh,s.day);delete s.shorts[k.t];log(`${esc(old)} went bankrupt while you were short. You keep all ${fmt(Sb.px*Sb.sh)}.`,'good')}
  const p=+(.2+R()*2.8).toPrecision(3);q.n=`${pick(PN1)} ${pick(PN2)}`;q.gr=0;q.ipo=s.day;q.p=q.o=q.op=q.hi=q.lo=p;q.h=[p];q.k=[[p,p,p]];q.eps=-p*.1;q.last=null;delete q.sh;
  chirp('@MarketWire','MarketWire',`${old} files for bankruptcy. $${k.t} now belongs to ${q.n}, listing today at ${pfmt(p)}`,1)
}
const nameOf=t=>s.px[t]?.n||SK[t].n;

// ---------- company data: made up, but consistent with the price ----------
const MARG={Tech:.22,Semis:.3,Finance:.25,Health:.18,Consumer:.07,Energy:.1,Mining:.12},RPE={Tech:9e5,Semis:1.2e6,Finance:7e5,Health:6e5,Consumer:2.5e5,Energy:2e6,Mining:8e5};
const SURN=['Okafor','Lindqvist','Tanaka','Moreau','Reyes','Kowalski','Haddad','Nakamura','Brennan','Castillo','Ivanova','Mensah','Fischer','Delgado','Sato','Novak','Achebe','Larsen','Varga','Chen'];
const HQS=['Silicon Hills','Northport','Bay City','Lakeview','Harbourton','New Amster','Port Royal','Summit Falls','Crescent City','Eastbridge','Westmoor','Taipei','Seoul','Tokyo','Zurich','London','Paris','Riyadh','Copenhagen','Hangzhou'];
const HOLDERS=['Vanguardian Group','BlackBox','State Streat','Fidelitee','Capital Wurld','Norges Pension Fund'];
const ABOUT_SEC={Tech:['builds software and online services used by millions of people and businesses.','runs a platform that sells ads, subscriptions and cloud computing.'],Semis:['designs and makes the chips inside phones, cars and AI data centres.','makes the machines and materials that chip factories depend on.'],
 Finance:['runs banking, payments and investment services.','moves money for shoppers, merchants and banks around the world.'],Health:['develops medicines and treatments, from blockbuster drugs to early trials.','runs hospitals, insurance plans and medical research.'],
 Consumer:['sells everyday products to shoppers in stores and online.','owns brands people buy, drive, watch and wear.'],Energy:['finds, pumps and refines oil and gas, and is building a renewables arm.','produces power and fuel for homes and industry.'],Mining:['explores for and digs up the metals batteries and electronics need.','owns mining claims it hopes will prove rich.']};
function fund(k){ // earnings per share come from quarterly reports; the rest is derived from them
  const q=s.px[k.t],sh=shOf(k.t),eps=q.eps,ni=eps*sh,m=eps>0?MARG[k.sec]*(.6+.8*ph(k.t,9)):-(.1+.6*ph(k.t,9)),rev=ni/m;
  return {cap:q.p*sh,eps,ni,rev,m,pe:eps>0?q.p/eps:0,ps:q.p*sh/rev,emp:Math.max(3,Math.round(rev/(RPE[k.sec]*(.7+.6*ph(k.t,10))))),
    ceo:`${PNAMES[Math.floor(ph(k.t,11)*PNAMES.length)]} ${SURN[Math.floor(ph(k.t,12)*SURN.length)]}`,hq:HQS[Math.floor(ph(k.t,13)*HQS.length)],
    yr:q.ipo!=null?2026-Math.floor(ph(k.t,14)*3):k.pn?2005+Math.floor(ph(k.t,14)*20):1880+Math.floor(ph(k.t,14)*135),fl:.6+.35*ph(k.t,15),
    about:`${esc(nameOf(k.t))} ${ABOUT_SEC[k.sec][Math.floor(ph(k.t,16)*2)]}${k.pn?' It is small, unprofitable more often than not, and trades on hype.':''}`}
}
function holders(k){ // the big funds, the founder, and you
  const me=ownFrac(k.t),rest=1-me,L=HOLDERS.slice(0,4).map((n,i)=>[n,(k.pn?.01:.03+.02*(3-i))*(.6+.8*ph(k.t,20+i))*rest]);
  L.push([`${fund(k).ceo} (CEO)`,(k.pn?.05+.2*ph(k.t,30):.001+.01*ph(k.t,30))*rest]);if(me>0)L.push(['You',me]);return L.sort((a,b)=>b[1]-a[1])
}

// ---------- trading costs: the bid-ask spread, and market impact that grows with the square root of size against daily volume ----------
const adv=k=>shOf(k.t)*par(k).turn;
function halfSpread(k){const q=s.px[k.t],cap=q.p*shOf(k.t),bp=cap>2e11?.0001:cap>1e10?.0003:cap>1e9?.001:cap>1e8?.003:.008;return Math.max(q.p<1?.0001:.01,q.p*2*bp*Math.sqrt(Math.sqrt(vstate())))/2}
const bidAsk=t=>{const q=s.px[t],h=halfSpread(SK[t]);return [Math.max(1e-4,q.p-h),q.p+h]};
function fillAt(t,n){ // n > 0 buys at the ask, n < 0 sells at the bid; big orders walk the price
  const k=SK[t],q=s.px[t],g=n>0?1:-1,x=g*.8*par(k).sig/Math.sqrt(YR)*Math.sqrt(Math.abs(n)/adv(k));
  return {avg:Math.max(1e-4,q.p*Math.exp(x*2/3)+g*halfSpread(k)),p1:q.p*Math.exp(x)}
}
function maxBuy(t,cash=s.cash,mg){let lo=0,hi=Math.floor(Math.max(0,mg?cash*2+acct().lmv:cash)/s.px[t].p)+1;while(lo<hi){const m=Math.ceil((lo+hi)/2);if(mg?canBuy(t,m,true):m*fillAt(t,m).avg<=cash)lo=m;else hi=m-1}return lo}
const ownFrac=t=>(s.port[t]?.sh||0)/shOf(t),controls=t=>ownFrac(t)>=.5;
const ctrlNeed=t=>Math.max(0,Math.floor(shOf(t)/2)+1-(s.port[t]?.sh||0));
function ctrlCheck(t,was){const now=controls(t),n=esc(nameOf(t));if(now===was)return;
  if(now){log(`You now control <b>${n}</b>. Its profits are yours.`,'good');toast(`You control ${n}`);chirp('@MarketWire','MarketWire',`${s.handle} takes control of ${nameOf(t)} ($${t}) with a majority stake`,1)}
  else log(`You no longer control ${n}.`,'bad')}
const ownInc=()=>Object.keys(s.port).reduce((a,t)=>{if(!controls(t))return a;const f=fund(SK[t]);return a+(f.ni>0?ownFrac(t)*f.ni/365:0)},0);

// ---------- margin and short selling (Reg T style: 50% initial, 25% maintenance on longs, 30% on shorts) ----------
// Penny stocks can't be bought on margin and need 100% backing when shorted; they can only be shorted above $1.
const marginable=t=>!SK[t].pn&&s.px[t].p>=5,shortable=t=>!SK[t].pn||s.px[t].p>=1;
const mRate=()=>s.eco.r+.03,borrowFee=t=>{const k=SK[t];return k.pn?.3+.7*ph(t,50):s.px[t].p*shOf(t)>1e11?.003:.005+.02*ph(t,50)}; // yearly
function acct(){ // brokerage equity and requirements; cash is shared with the rest of life
  let lmv=0,lmvM=0,smv=0,sI=0,sM=0;
  for(const t in s.port){const v=s.port[t].sh*s.px[t].p;lmv+=v;if(marginable(t))lmvM+=v}
  for(const t in s.shorts){const v=s.shorts[t].sh*s.px[t].p,pn=SK[t].pn;smv+=v;sI+=v*(pn?1:.5);sM+=v*(pn?1:.3)}
  return {lmv,smv,eq:s.cash+lmv-s.mloan-smv,init:.5*lmvM+(lmv-lmvM)+sI,maint:.25*lmvM+(lmv-lmvM)+sM};
}
const onMargin=()=>s.mloan>0||Object.keys(s.shorts).length>0;
function canBuy(t,n,mg){const c=n*fillAt(t,n).avg;if(c<=s.cash)return true;if(!mg||!marginable(t))return false;const A=acct();return A.eq>=A.init+.5*c} // buying swaps cash for stock, so equity holds and the requirement grows
function repayLoan(){if(s.mloan>0&&s.cash>0){const r=Math.min(s.mloan,s.cash);s.mloan-=r;s.cash-=r}} // sale proceeds pay down the margin loan first
function marginCheck(){ // below maintenance, the broker sells for you until you're back above it
  if(!onMargin())return;let A=acct(),sold=[],guard=0;
  while(A.eq<A.maint&&guard++<40){
    const L=Object.keys(s.port).map(t=>['L',t,s.port[t].sh*s.px[t].p]),Sh=Object.keys(s.shorts).map(t=>['S',t,s.shorts[t].sh*s.px[t].p]),all=[...L,...Sh].sort((a,b)=>b[2]-a[2]);if(!all.length)break;
    const[kind,t]=all[0],need=(A.maint-A.eq)*4+1;
    if(kind==='L'){const h=s.port[t],n=Math.min(h.sh,Math.ceil(need/s.px[t].p));execAt(t,-n,bidAsk(t)[0]);repayLoan();sold.push(`sold ${big(n)} $${t}`)}
    else{const S=s.shorts[t],n=Math.min(S.sh,Math.ceil(need/s.px[t].p));coverAt(t,n,bidAsk(t)[1]);sold.push(`bought back ${big(n)} $${t}`)}
    A=acct()}
  if(sold.length){const m=`Margin call: your broker ${sold.join(', ')} to bring your account back above the minimum.`;log(m,'bad');toast('Margin call')}
  if(s.mloan>0&&!Object.keys(s.port).length&&!Object.keys(s.shorts).length){s.cash-=s.mloan;log(`Your account went underwater. You owe your broker ${fmt(s.mloan)}.`,'bad');s.mloan=0} // nothing left to sell: the shortfall becomes plain debt
}
function coverAt(t,n,p){const S=s.shorts[t];if(!S)return;n=Math.min(n,S.sh);s.cash-=n*p;capGain((S.px-p)*n,s.day);S.sh-=n;if(S.sh<=0)delete s.shorts[t];if(s.cash<0){s.mloan-=s.cash;s.cash=0}} // short gains are always short-term
function shortDay(){ // interest on the margin loan and fees to borrow shares
  if(s.mloan>0)s.mloan*=1+mRate()/365;
  for(const t in s.shorts){const S=s.shorts[t];s.cash-=S.sh*s.px[t].p*borrowFee(t)/365}
}

// ---------- options: calls and puts on the big stocks, priced with Black-Scholes from each stock's live volatility ----------
const Ncdf=x=>{const t2=1/(1+.2316419*Math.abs(x)),d=.3989423*Math.exp(-x*x/2),p=d*t2*(.3193815+t2*(-.3565638+t2*(1.781478+t2*(-1.821256+t2*1.330274))));return x>0?1-p:p};
function optExpiries(){const out=[];let y=dateOf(s.day).y,m=dateOf(s.day).m;while(out.length<3){let d=nthWd(y,m,4,3);while(!tradingDay(d))d--;if(d>=s.day+3)out.push(d);if(++m>11){m=0;y++}}return out} // third Fridays, a Thursday if the Friday is a holiday
function optStrikes(S){const st=S<25?1:S<100?2.5:S<250?5:S<1000?10:50,c=Math.round(S/st)*st,out=[];for(let i=-4;i<=4;i++){const K=+(c+i*st*(S>=100?1:1)).toFixed(2);if(K>0)out.push(K)}return out}
const optT=exp=>Math.max(0,(exp-s.day)*1440+closeAt(exp)-s.min)/1440/365;
function optVol(k,K,exp){ // annual volatility now, a skew that makes low strikes pricier, and any earnings before expiry folded in
  const P=par(k),S=s.px[k.t].p,T=optT(exp),v=Math.sqrt(P.b*P.b*s.mkt.h*YR+SECV*SECV+P.se*P.se*Math.sqrt(vstate()))*clamp(1-.8*Math.log(K/S),.85,1.6);
  if(!(T>0))return v;const eV=s.px[k.t].er<=exp?.98*(3.2*P.sig/Math.sqrt(YR))**2:0;return Math.sqrt(v*v+eV/T)}
function bs(k,type,K,exp){const S=s.px[k.t].p,T=optT(exp),call=type==='call';if(!(T>0))return {px:Math.max(0,call?S-K:K-S),delta:call?(S>K?1:0):(S<K?-1:0)};
  const r=s.eco.r,q=k.div||0,v=optVol(k,K,exp),sd=v*Math.sqrt(T),d1=(Math.log(S/K)+(r-q+v*v/2)*T)/sd,d2=d1-sd,eq=Math.exp(-q*T),er=Math.exp(-r*T);
  return {px:call?S*eq*Ncdf(d1)-K*er*Ncdf(d2):K*er*Ncdf(-d2)-S*eq*Ncdf(-d1),delta:call?eq*Ncdf(d1):eq*(Ncdf(d1)-1),iv:v}}
const optQuote=(k,type,K,exp)=>{const m=bs(k,type,K,exp),h=Math.max(.025,m.px*.015);return {...m,bid:Math.max(0,m.px-h),ask:m.px+h}}; // a 3% spread, five cents at the least
const optLabel=o=>`${o.t} ${MON[dateOf(o.exp).m]} ${dateOf(o.exp).dd} ${qfmt(o.K)} ${o.type==='call'?'call':'put'}`;
const optVal=()=>(s.opts||[]).reduce((a,o)=>a+bs(SK[o.t],o.type,o.K,o.exp).px*100*o.n,0);
function optSettle(){ // at the close on expiry day, options in the money pay out their intrinsic value in cash
  s.opts=s.opts.filter(o=>{if(o.exp>s.day)return true;const S=s.px[o.t].p,iv=Math.max(0,o.type==='call'?S-o.K:o.K-S)*100*o.n;s.cash+=iv;capGain(iv-o.cost,o.d);
    log(`${optLabel(o)} expired ${iv>0?`in the money and paid ${fmt(iv)}`:'worthless'} (${iv-o.cost>=0?'+':''}${fmt(iv-o.cost)}).`,iv>=o.cost?'good':'bad');return false})}

// ---------- limit and stop orders ----------
function fillOrders(bulk){ // live: check against the quote each minute; fast simulation: against the day's high and low
  if(!s.orders.length)return;
  s.orders=s.orders.filter(o=>{const q=s.px[o.t];if(!q)return false;const buy=o.side==='buy';let hit,at;
    if(bulk){hit=o.type==='limit'?(buy?q.lo<=o.px:q.hi>=o.px):(buy?q.hi>=o.px:q.lo<=o.px);at=o.px}
    else{const f=fillAt(o.t,buy?o.n:-o.n).avg,[bid,ask]=bidAsk(o.t);hit=o.type==='limit'?(buy?f<=o.px:f>=o.px):(buy?ask>=o.px:bid<=o.px);at=f}
    if(!hit)return true;
    const h=s.port[o.t];if(buy?at*o.n>s.cash:!h||h.sh<o.n){log(`Your ${o.type} order for ${big(o.n)} $${o.t} was cancelled: not enough ${buy?'cash':'shares'}.`,'bad');return false}
    if(bulk)execAt(o.t,buy?o.n:-o.n,at);else ACT[o.side](o.t,o.n);
    const H=s.port[o.t];if(buy&&H){if(o.tp)H.tp=o.tp;if(o.sl)H.sl=o.sl}
    toast(`${o.type==='limit'?'Limit':'Stop'} order filled: ${o.side==='buy'?'bought':'sold'} ${big(o.n)} ${o.t}`);return false});
}
// ---------- take profit and stop loss: attached to a whole position, one cancels the other ----------
// A take profit sells at the bid once it's reached. A stop loss becomes a market sell, so a gap through it fills at the gapped price.
const stopOf=H=>Math.max(H.sl||0,H.trail?H.hw*(1-H.trail):0); // a trailing stop sits a set distance under the highest price since it was set
function brackets(bulk){
  for(const t of Object.keys(s.port)){const h=s.port[t];if(!h||!h.tp&&!h.sl&&!h.trail)continue;const q=s.px[t];let why=null,px;
    if(bulk){const sl=stopOf(h),slHit=sl&&q.lo<=sl,tpHit=h.tp&&q.hi>=h.tp;
      if(slHit&&(!tpHit||q.op<h.tp)){why='sl';px=Math.min(sl,q.op)}else if(tpHit){why='tp';px=Math.max(h.tp,q.op)} // both in one day: assume the stop went first unless it opened past the target
      if(why)execAt(t,-h.sh,px);else if(h.trail)h.hw=Math.max(h.hw,q.hi)}
    else{const bid=bidAsk(t)[0];if(h.trail)h.hw=Math.max(h.hw,bid);const sl=stopOf(h);why=sl&&bid<=sl?'sl':h.tp&&bid>=h.tp?'tp':null;if(why){px=fillAt(t,-h.sh).avg;ACT.sell(t,'all')}}
    if(why)bfired('$'+t,why,px)}
}
function cbrackets(){for(const t of Object.keys(s.wallet)){const w=s.wallet[t],c=coin(t);if(!c||!w.tp&&!w.sl&&!w.trail)continue;if(w.trail)w.hw=Math.max(w.hw,c.p);const sl=stopOf(w),why=sl&&c.p<=sl?'sl':w.tp&&c.p>=w.tp?'tp':null;if(why){ACT.xsell(t,'all');bfired('$'+t,why,c.p)}}}
function bfired(n,why,px){const m=`${why==='sl'?'Stop loss':'Take profit'} hit on ${n}: sold everything at ${qfmt(px)}.`;log(m,why==='sl'?'bad':'good');toast(m)}
function execAt(t,n,p){const was=controls(t),h=s.port[t]??={sh:0,cost:0};if(n>0){h.d=avgDay(h.d,h.sh,n);h.sh+=n;h.cost+=n*p;s.cash-=n*p}else{const m=-n,basis=h.cost*m/h.sh;h.cost-=basis;h.sh-=m;s.cash+=m*p;capGain(m*p-basis,h.d);if(!h.sh)delete s.port[t]}ctrlCheck(t,was)}

function news(){const k=pick(MAIN),up=R()<.55,p=Math.exp((up?1:-1)*(1.5+R()*2.5)*par(k).sig/Math.sqrt(YR))-1;shock(k.t,p);chirp('@MarketWire','MarketWire',`$${k.t} ${up?'▲':'▼'} ${Math.abs(p*100).toFixed(1)}% — ${pick(up?GOOD:BAD).replace('{n}',nameOf(k.t))}`,1)}
function crash(sess=inSession()){ // a rare panic: the whole market drops at once and volatility explodes
  const D=-(.07+R()*.09),M=s.mkt;if(M.bull)M.ra=0;M.bull=false;M.rc*=Math.exp(D);M.h=Math.max(M.h,.7**2/YR);s.re.idx*=.95;for(const c of s.cx.coins)if(!c.stable)c.p*=.75;
  for(const k of STOCKS)shock(k.t,Math.exp(par(k).b*D+.3*D*gauss())-1,sess);
  chirp('@MarketWire','MarketWire','PANIC: stocks plunge across the board as sellers overwhelm the market',1);log('The stock market crashed!','bad');toast('Market crash!')}
function npcChatter(){const[h,n]=pick(NPC);chirp(h,n,s.fol>300&&R()<.15?pick(ABOUT).replace('{h}',s.handle):pick(CHAT))}
function runLater(p){
  if(p.k==='cash'){s.cash+=p.v;log(`${p.m} ${fmt(p.v)}`,'good');toast(`${p.m} ${fmt(p.v)}`)}
  else if(p.k==='x')LATER[p.id]?.(p);
  else if(p.k==='shock'){if(p.sec&&p.v>0&&R()<.35)s.later.push({d:s.day+rint(30,120),k:'x',id:'sec',v:p.sec*p.v});shock(p.t,p.v,mktOpen());chirp('@MarketWire','MarketWire',`$${p.t} ${p.v>0?'rips':'tanks'} ${Math.round(Math.abs(p.v)*100)}% on rumors`,1)}
  else{log(p.m,'bad');toast(p.m)}
}
function newEvent(){
  const W=e=>typeof e.w==='function'?e.w(s):e.w,ok=EV.filter(e=>(!e.c||e.c(s))&&!s.inbox.some(i=>i.id===e.id));
  let r=R()*ok.reduce((t,e)=>t+W(e),0);
  for(const e of ok)if((r-=W(e))<=0){s.inbox.push({id:e.id,d:s.day,a:e.a?e.a(s):0});toast('A new decision is waiting');if(opt('pause')&&!catching){if(speed)lastSpeed=speed;speed=0}return}
}
function die(){s.dead=1;(s.tree??=[]).push(lifeRec());log(`${esc(s.name)} passed away at ${Math.floor(age())}${s.cause?' '+s.cause:''}.`,'bad');save();lbPost(true);deathModal()}

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
 {id:'stocks',n:'Diversified',d:'Hold 10 different stocks at once',p:()=>[STOCKS.filter(k=>s.port[k.t]?.sh>0).length,10]},
 {id:'kids3',n:'Full house',d:'Have 3 kids',p:()=>[kids().length,3]},
 {id:'grand',n:'Grandparent',d:'Have a grandchild',p:()=>has(kids().some(k=>k.k?.gk?.length))},
 {id:'college',n:'First in the family',d:'Send a kid to college',p:()=>has(kids().some(k=>/^college/.test(k.k?.path||'')))},
 {id:'master',n:'Mastery',d:'Reach skill 90 in a hobby',p:()=>[Math.max(0,...Object.values(s.hob).map(h=>h.sk)),90]},
 {id:'survivor',n:'Survivor',d:'Beat cancer',p:()=>has(s.beat)},
 {id:'pets3',n:'Menagerie',d:'Have 3 pets at once',p:()=>[s.pets.length,3]},
 {id:'rep',n:'In demand',d:'Reach 80 freelance reputation',p:()=>[s.fl?.rep||0,80]},
 {id:'close5',n:'Inner circle',d:'Be very close (80+) to 5 people',p:()=>[s.people.filter(p=>p.rel>=80).length,5]},
 {id:'fol1',n:'Influencer',d:'Reach 100K followers',p:()=>[s.fol,1e5]},
 {id:'top',n:'Top of the ladder',d:'Reach the highest rank in any job',p:()=>has(s.job&&topRank())},
 {id:'exit',n:'The exit',d:'Sell a startup you founded, or take it public',p:()=>has(s.car2?.acq||s.car2?.ipo)},
 {id:'ipo',n:'Ring the bell',d:'Take a startup public',p:()=>has(s.car2?.ipo)},
 {id:'landlord',n:'Landlord',d:'Own 5 properties',p:()=>[s.props.length,5]},
 {id:'cars',n:'Car collector',d:'Own 3 cars at once',p:()=>[s.cars.length,3]},
 {id:'casino',n:'Beat the house',d:'Be $100K up at the casino overall',p:()=>[Math.max(0,s.cz.net),1e5],m:1},
 {id:'peak',n:'Peak form',d:'Get all four stats to 80 at once',p:()=>[Math.min(...Object.values(s.st)),80]},
 {id:'doctor',n:'Doctor',d:'Finish a PhD or medical school',p:()=>has(s.degs.some(d=>d.p==='phd'||d.p==='md'))},
 {id:'crypto',n:'Crypto whale',d:'Hold $1M in crypto',p:()=>[walletVal(),1e6],m:1},
 {id:'biz100',n:'Chain',d:'Own 100 of one business',p:()=>[maxBiz(),100]},
 {id:'pension',n:'Well earned',d:'Retire on a pension',p:()=>has(s.pension>0)},
 {id:'fol2',n:'Household name',d:'Reach 1M followers',p:()=>[s.fol,1e6]},
 {id:'tycoon',n:'Tycoon',d:'Control a public company',p:()=>has(Object.keys(s.port).some(controls))},
 {id:'nest',n:'Nest egg',d:'Have $1M in your retirement account',p:()=>[iraVal(),1e6],m:1},
 {id:'nw3',n:'Nine figures',d:'Reach a net worth of $100M',p:()=>[netWorth(),1e8],m:1},
 {id:'rocket',n:'To the moon',d:'Open a Rocket Company',p:()=>has(s.biz.rocket?.n)},
 {id:'old',n:'Long life',d:'Live to 85',p:()=>[age(),85]},
 {id:'mayor',n:'City hall',d:'Get elected mayor',p:()=>has(s.pol?.held?.mayor)},
 {id:'pres',n:'Commander in chief',d:'Get elected president',p:()=>has(s.pol?.held?.pres)},
 {id:'champ',n:'Champions',d:'Win a championship with your own team',p:()=>has(s.club?.champs)},
 {id:'vet',n:'Served',d:'Finish a military enlistment',p:()=>has(s.vet)},
 {id:'credit',n:'Perfect credit',d:'Reach a credit score of 800',p:()=>[credit(),800]},
 {id:'space',n:'Leave the planet',d:'Take a flight to space',p:()=>has(s.cd?.t_space)},
 {id:'gen3',n:'Dynasty',d:'Reach the third generation',p:()=>[s.gen,3]},
 {id:'give',n:'Philanthropist',d:'Give $1M to charity in one lifetime',p:()=>[s.given||0,1e6],m:1},
 {id:'fdn',n:'A family foundation',d:'Endow a foundation that gives forever',p:()=>has(s.fdn>0)},
 {id:'rich20',n:'Rich list',d:'Make the top 20 of the world rich list',p:()=>has(richList().findIndex(x=>x.me)<20)},
 {id:'rich1',n:'Richest person alive',d:'Top the world rich list',p:()=>has(richList()[0].me)},
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
  const w=Math.max(0,netWorth()),tax=estateTax(w),h={tree:s.tree,fdn:s.fdn||0,city:s.city,inherit:(w-tax)*(k?1:.5)+(s.trust?.v||0),trust:s.trust?.v||0,tax,gen:s.gen+1,last:s.name,goals:s.goals,sma:s.st.sma,loo:s.st.loo,eco:s.eco};
  if(!k)return h;
  const skip=Math.max(0,18*365-(s.day-k.b)),carry=p=>({n:p.n,b:p.b-s.day-skip,rel:(p.rel+k.rel)/2});
  const K=k.k,x={};if(K){const age18=k.b+18*365;if(!K.path&&s.day+skip>=age18){const d=s.day;s.day+=skip;kidLaunch(k,1);s.day=d}
    Object.assign(x,{ks:{sma:K.sma,hea:K.hea,loo:K.loo,hap:K.hap},tr:K.tr,fund:K.fund,loan:K.loan||0});
    if(K.path==='colleged')Object.assign(x,{degs:[{p:'ba',sc:'state',mj:K.sma>=65?'Computer science':'Business',hon:K.sma>=75}],edu:2});
    else if(K.path==='traded')Object.assign(x,{degs:[{p:'cert',sc:'cc',mj:null,hon:false}],edu:1});
    else if(K.path==='college'){const left=Math.max(30,K.grad-s.day-skip);x.study={p:'ba',sc:'state',mj:'Business',left,days:1095,g:60}}
    if(K.job){const yrs=Math.max(0,s.day+skip-(K.grad||age18))/365;x.job=K.job;x.xp={[JM[K.job].fld]:Math.round(yrs*365)};x.loan=Math.round(x.loan*Math.max(0,1-yrs/10))} // ten years to pay off student loans
    x.fam=[...(K.sp?[{n:K.sp,b:k.b-s.day-skip+rint(-2,2)*365,rel:70,role:'spouse'}]:[]),...(K.gk||[]).map(g=>({n:g.n,b:g.b-s.day-skip,rel:75,role:'child'}))]}
  const pets=s.pets.filter(p=>p.dies>s.day+skip).map(p=>({...p,b:p.b-s.day-skip,dies:p.dies-s.day-skip}));
  return {...h,...x,pets,kid:k.n,age:(s.day-k.b+skip)/365,rel:k.rel,
    fam:[...s.people.filter(p=>p.role==='spouse').map(p=>({...carry(p),role:'parent'})),...kids().filter(p=>p!==k).map(p=>({...carry(p),role:'sibling'})),...(x.fam||[])]};
}
function skipDay(){cstep(1);if(tradingDay())tradeDay(0);s.min=1439;minute()} // a whole day in one step, from midnight to midnight
function catchUp(g,step,done){ // g game minutes: finish today minute by minute, jump whole days, then the last minutes. step(daysLeft) reports progress; sync when no step
  while(g>0&&s.min!==0&&!s.dead){minute();g--}
  const run=()=>{let n=0;while(g>=1440&&!s.dead&&(!step||n<150)){skipDay();g-=1440;n++}
    if(g>=1440&&!s.dead){step(Math.floor(g/1440));setTimeout(run,0);return}
    while(g>0&&!s.dead){minute();g--}done()};
  run();
}
function offline(ms){ // time keeps passing while the game is closed, at a day per 15 real minutes, with no cap
  const sec=ms/1000;if(sec<60)return;const g=Math.floor(sec*AWAY);if(g<1)return;
  const before=netWorth(),age0=Math.floor(age()),day0=s.day,mark=s.log[0];catching=true;
  const show=d=>modal(`<p class="kicker">Welcome back</p><h2>Catching up</h2><p>You were away for ${dur(sec)}. ${plainDays(d)} left to play out.</p>`);
  if(g>=1440*150)show(Math.floor(g/1440));
  catchUp(g,show,()=>{catching=false;const k=s.log.indexOf(mark),news=(k<0?s.log:s.log.slice(0,k)).filter(l=>l.k!=='info').slice(0,8),after=netWorth(),dn=after-before;
    save();if(s.dead){closeModal();deathModal();return}
    modal(`<p class="kicker">Welcome back</p><h2>While you were away</h2><p>You were gone for <b>${dur(sec)}</b>, and <b>${plainDays(s.day-day0)}</b> passed. ${esc(s.name)} is now ${Math.floor(age())}${Math.floor(age())>age0?` (was ${age0})`:''}.</p>
    <table class="ledger"><tr><td>Net worth</td><td class="r num">${fmt(before)} → ${fmt(after)} ${sign(dn)}</td></tr><tr><td>Cash</td><td class="r num">${fmt(s.cash)}</td></tr><tr><td>Hustle 500</td><td class="r num">${idx().toFixed(0)} · ${mktLabel().toLowerCase()}</td></tr><tr><td>Health</td><td class="r">${Math.round(s.st.hea)}${s.conds.filter(c=>!c.hid&&!c.tx&&!CONDS[c.id].acute).length?` · <span class="dn">${s.conds.filter(c=>!c.hid&&!c.tx&&!CONDS[c.id].acute).map(c=>condName(c).toLowerCase()).join(', ')} untreated</span>`:''}</td></tr>${s.su?`<tr><td>${esc(s.su.n)}</td><td class="r">${SUST[s.su.st].n} · ${suRunway(s.su)} days of runway</td></tr>`:''}${needs().length?`<tr><td>Waiting for you</td><td class="r">${needs().length} thing${needs().length>1?'s':''} on Home</td></tr>`:''}</table>
    ${news.length?`<h3 style="margin-top:var(--space-sm)">What happened</h3><div class="awaylog">${news.map(l=>`<div class="aw ${l.k}">${l.t}</div>`).join('')}</div>`:''}
    ${newsHtml()}
    <button class="pri" data-a="close" style="margin-top:var(--space-sm)">Back to it</button>`);render()});
}
const plainDays=d=>d<60?`${d} day${d===1?'':'s'}`:d<730?`${Math.round(d/30.4)} months`:`${(d/365).toFixed(1)} years`;
const dur=sec=>sec<3600?`${Math.round(sec/60)} minutes`:sec<172800?`${Math.floor(sec/3600)}h ${Math.round(sec%3600/60)}m`:`${Math.round(sec/86400)} days`;

// ---------- actions ----------
const ACT={
  staff:k=>{if(k!=='pa'&&k!=='adv')return;const S=s.staff??={};S[k]=S[k]?0:1;toast(S[k]?(k==='pa'?'You hired a personal assistant':'You hired a financial advisor'):'You let them go')},
  rich:()=>modal(richHtml()),
  stl:u=>{const p=P(+u);if(!p||p.uid===s.home||PM[p.t].biz)return;p.stl=p.stl?0:1;toast(p.stl?'Now a holiday let: more rent, more wear, more empty nights':'Back to a long let')},
  chstart:()=>{const C=s.ch??=chNew();if(C.on||s.cash<500*s.eco.P)return;s.cash-=500*s.eco.P;C.on=1;C.last=s.day;mile('Started a channel.');toast('Your channel is live')},
  chpost:()=>{const m=chPost();if(m)toast(m)},
  abroad:()=>{const m=abroad();if(m){log(m,'good');toast(m)}},
  trust:v=>{v=+v;if(!(v>0)||s.cash<v)return;const gt=trustAdd(v);log(`Moved ${fmt(v)} into the family trust${gt?`, paying ${fmt(gt)} in gift tax`:''}.`,'good');toast(`Trust: +${fmt(v)}`)},
  comm:()=>{moveComm()},
  petplay:u=>{const m=petPlay(u);if(m)toast(esc(m))},
  setopt:(k,v)=>{const O=s.opt??={};if(k==='dec'){if([7,30,90].includes(+v))O.dec=+v}else if(k==='pause'||k==='quiet')O[k]=!O[k];ACT.help()},
  hours:k=>{if(HOURS[k]){s.hours=k;toast(`Work hours: ${HOURS[k].n.toLowerCase()}`)}},
  diet:k=>{if(DIETS[k]){s.diet=k;toast(`Food: ${DIETS[k].n.toLowerCase()}`)}},
  bsell:(id,y)=>{const b=BM[id],o=s.biz[id];if(!b||!o?.n)return;const v=Math.round(bizVal(b,o)*.95);
    if(y!=='yes')return modal(`<h2>Sell your ${o.n>1?`${o.n} ${plural(b.n)}`:b.n}?</h2><p>A buyer offers about <b class="num">${fmt(v)}</b> after fees: ${BIZMULT[id]+(o.fr?1:0)} times a year's profit${o.mgr?'':', less a discount because it only runs with you there'}. You put ${fmt(o.spent)} into it.</p><div class="row"><button class="bad" data-a="bsell" data-x="${id}" data-y="yes">Sell</button><button data-a="close">Keep it</button></div>`);
    closeModal();s.cash+=v+(o.pend||0);capGain(v-o.spent,o.d??s.day-400);delete s.biz[id];mile(`Sold the ${b.n.toLowerCase()} business for ${fmt(v)}.`);log(`Sold your ${b.n} business for ${fmt(v)}.`,'good');toast(`Sold for ${fmt(v)}`)},
  bfr:id=>{const b=BM[id],o=s.biz[id];if(!b||!o||o.n<25||!o.mgr||o.fr||s.cash<frCost(b))return;s.cash-=frCost(b);o.fr=1;mile(`Franchised the ${b.n.toLowerCase()} business.`);log(`Your ${b.n} is a franchise now: royalties add 30% to its income.`,'good');toast('Franchised!')},
  storyall:()=>{showAll.story=!showAll.story},
  bankrupt:y=>{if(!(s.cash<0&&netWorth()<0))return;if(y!=='yes')return modal(`<h2>Declare bankruptcy?</h2><p>Your negative balance is wiped out, but you lose your stocks, crypto, index fund, savings, businesses, rentals and all but one car. You keep your home and your retirement account. Your credit score drops to about 380 and the bankruptcy stays on file for 7 years, so no mortgages until then.</p><div class="row"><button class="bad" data-a="bankrupt" data-x="yes">Declare bankruptcy</button><button data-a="close">Not yet</button></div>`);closeModal();bankruptcy()},
  rehab:()=>{if(vice('alc')<=60&&vice('gam')<=60)return;const o=oopOf(rehabCost()).out;if(s.cash<o)return;const v=billMed(rehabCost());s.vice={alc:0,gam:0};s.rehab=s.day+30;add('hap',6);log(`Checked into rehab for 30 days. You paid ${fmt(v)} after insurance.`,'good');toast('Off to rehab. You will come back clean.')},
  travel:id=>{const m=travel(id);if(m){log(m,'good');toast(m)}},
  run:id=>{const c=runFor(id);if(c)toast(`Campaign launched: ${Math.round(c.odds*100)}% odds`)},
  tbuy:id=>{const K=CLM[id];if(!K||s.club||s.cash<K.price*s.eco.P)return;const v=K.price*s.eco.P;s.cash-=v;s.club={id,v,paid:v,d:s.day,pay:1};add('hap',10);log(`You bought a ${K.n.toLowerCase()} for ${fmt(v)}.`,'good');toast('You own a team!')},
  tpay:x=>{if(s.club&&[.6,1,1.6].includes(+x))s.club.pay=+x},
  tsell:()=>{const T=s.club;if(!T)return;const v=T.v*.97;s.cash+=v;capGain(v-T.paid,T.d);s.club=null;log(`Sold your team for ${fmt(v)}.`,'good')},
  move:k=>{const c=moveTo(k);if(c)toast(`Moved to ${CITIES[k].n.toLowerCase()}`)},
  reno:u=>{const p=P(+u);if(!p||p.reno)return;const c=renoCost(p);if(s.cash<c)return;s.cash-=c;p.reno=s.day+60;toast(`Renovation started: ${fmt(c)}, about 60 days.`)},
  give:(v,to)=>{v=+v;if(!(v>0)||s.cash<v)return;const ded=donate(v,to);log(to==='fdn'?`Put ${fmt(v)} into the family foundation.`:`Donated ${fmt(v)} to charity.`,'good');toast(`${to==='fdn'?'Foundation':'Donation'}: ${fmt(v)}${ded?`, ${fmt(ded)} tax-deductible`:''}`)},
  flt:id=>{const F=s.fl,i=F.offers.findIndex(o=>o.id===+id);if(i<0||F.jobs.length>=flCap())return;const o=F.offers.splice(i,1)[0];F.jobs.push({...o,left:o.days});toast(`Contract started: ${o.n}`)},
  fldrop:id=>{const F=s.fl,i=F.jobs.findIndex(o=>o.id===+id);if(i<0)return;F.jobs.splice(i,1);F.rep=Math.max(0,F.rep-10);toast('Contract dropped. Your reputation took a hit.')},
  found:(id,y)=>{const I=IM[id];if(!I||s.su||s.cash<suSeed())return;if(y!=='yes')return modal(`<p class="kicker">Start a company</p><h2>Found a ${I.n.toLowerCase()} startup?</h2><p>You put in <b class="num">${fmt(suSeed())}</b> of your own money${s.job?` and quit your job as ${jobTitle()}`:''}. The company burns cash every day. Grow it until investors fund the next round, or it runs out of money and dies. Most startups do. The few that make it end in an acquisition or an IPO.</p><div class="row"><button class="pri" data-a="found" data-x="${id}" data-y="yes">Found it</button><button data-a="close">Not yet</button></div>`);closeModal();const u=found(id);if(u)toast(`${esc(u.n)} is born`)},
  suhire:x=>{const u=s.su,n=+x||1;if(!u||u.cash<HIRE*s.eco.P*90*n)return;u.hires+=n;toast(n>1?`Hired ${n} people. The team is ${u.hires} strong.`:`Hired employee number ${u.hires}`)},
  sufire:()=>{const u=s.su;if(!u||!u.hires)return;u.hires--;add('hap',-2);toast('You let someone go. It never gets easier.')},
  sufund:()=>{const u=s.su,v=Math.max(1e4*s.eco.P,s.cash*.25);if(!u||s.cash<v)return;s.cash-=v;u.cash+=v;u.basis+=v;toast(`Put ${fmt(v)} into ${esc(u.n)}`)},
  suraise:()=>{const m=suRaise();if(m)toast(m)},
  sudecline:()=>{const u=s.su;if(u?.offer){delete u.offer;u.retry=s.day+30}},
  suacq:()=>{const u=s.su;if(u?.acq)suExit(u.acq.v,'acq')},
  suacqno:()=>{if(s.su)delete s.su.acq},
  sukill:y=>{const u=s.su;if(!u)return;if(y!=='yes')return modal(`<h2>Shut down ${esc(u.n)}?</h2><p>You get back your ${(u.own*100).toFixed(1)}% of the ${fmt(Math.max(0,u.cash))} left in the bank.</p><div class="row"><button class="bad" data-a="sukill" data-x="yes">Shut it down</button><button data-a="close">Keep going</button></div>`);closeModal();const back=Math.max(0,u.cash)*u.own;s.cash+=back;capGain(back-u.basis,u.d);s.su=null;add('hap',-8);log(`You shut down ${esc(u.n)} and got back ${fmt(back)}.`)},
  treat:id=>{const c=cond(id);if(!c||c.hid||c.tx||c.cd>s.day)return;const K=CONDS[id];if(K.med&&!K.tc){c.tx=1;toast(id==='dep'?'You started therapy.':'You started medication.');return}const o=oopOf(txCost(c)).out;if(s.cash<o)return;const v=billMed(txCost(c));const m=CURE[id](c);log(`${condName(c)}: ${m} You paid ${fmt(v)} after insurance.`);toast(m)},
  untreat:id=>{const c=cond(id);if(c)c.tx=0},
  ins:k=>{if(INS[k]&&(k!=='va'||isVet())){s.ins=k;toast(`Switched to ${INS[k].n.toLowerCase()}.`)}},
  case:(id,how)=>{const c=s.legal.cases.find(c=>c.id===+id);if(!c||!['plead','lawyer','self'].includes(how))return;if(how==='lawyer'&&s.cash<lawCost(c))return;const m=resolveCase(c,how);log(`<b>${CASES[c.t].n}</b> ${m}`);toast(m)},
  hob:id=>{const H=HM[id];if(!H||s.day<(s.cd['h_'+id]||0)||s.cash<H.c*s.eco.P)return;s.cash-=H.c*s.eco.P;s.cd['h_'+id]=s.day+2;toast(practice(id))},
  hshow:id=>{const H=HM[id];if(!H||hobSk(id)<(H.need||30)||s.day<(s.cd['hs_'+id]||0))return;s.cd['hs_'+id]=s.day+(H.scd||30);const m=hobShow(id);log(m,'good');toast(m)},
  adopt:t=>{const K=PTM[t];if(!K||s.pets.length>=5||s.cash<K.c*s.eco.P)return;s.cash-=K.c*s.eco.P;const p=addPet(t);add('hap',8);log(`Welcome home, ${esc(petOf(p))}.`,'good');toast(`Welcome home, ${esc(p.n)}!`)},
  rehome:u=>{const i=s.pets.findIndex(p=>p.uid===+u);if(i<0)return;const p=s.pets.splice(i,1)[0];add('hap',-6);toast(`${esc(p.n)} went to a good new home.`)},
  tab:x=>{tab=x;const g=BAR.findIndex(b=>b[1].includes(x));if(g>=0)lastIn[g]=x;$('#view').scrollTop=0;if(innerWidth<=860)scrollTo(0,0)},
  grp:x=>{const ks=BAR[+x][1];ACT.tab(ks.includes(tab)?tab:lastIn[+x]||ks[0])},
  spd:x=>{if(speed)lastSpeed=speed;speed=+x},
  bmode:x=>{bmode=x},
  gobj:()=>{ACT.tab('casino');cg='bj'},
  pick:(id,c)=>{const i=s.inbox.findIndex(x=>x.id===id);if(i<0)return;const it=s.inbox.splice(i,1)[0],e=EVM[id],msg=e.c&&!e.c(s)?'The moment has passed.':e.ch[+c][1](s,it.a);log(`<b>${e.t}</b> ${msg}`);toast(msg)},
  sel:x=>{sel=x;ot.px=null;if(ot.type!=='market')ot.type='market'},
  wf:x=>{wf=x},
  close:()=>closeModal(),
  act:id=>{const a=AM[id];if(s.day<(s.cd[id]||0)||s.cash<a.c)return;s.cash-=a.c;s.cd[id]=s.day+a.cd;toast(a.fx())},
  learn:id=>{const P=PG[id];if(!P||s.study||progMiss(P).length)return;enr={p:id,mj:P.mj?'Business':null};modal(enrHtml(),1)},
  mj:x=>{if(!enr)return;enr.mj=x;modal(enrHtml(),1)},
  enroll:(sid,pay)=>{const P=PG[enr?.p];if(!P||s.study||progMiss(P).length)return;const sc=schoolsFor(P).find(x=>x.id===sid);if(!sc)return;let c=tuition(P,sc);if(pay==='cash'&&s.cash<c)return;
    if(R()>admOdds(P,sc)){s.cd[`adm_${P.id}_${sid}`]=s.day+180;closeModal();log(`${sc.n} turned down your application.`,'bad');toast(`${sc.n} said no. You can reapply in 180 days.`);return}
    let sch='';if(sc.adm&&c&&s.st.sma>=sc.adm+10&&R()<.4){c=Math.round(c/2);sch=' with a half scholarship'}if(isVet()&&!s.giUsed&&!c){s.giUsed=1;sch=' on the GI Bill'}
    if(pay==='cash')s.cash-=c;else s.debt=(s.debt||0)+c;
    const days=Math.round(P.days*(sc.slow||1));s.study={p:P.id,sc:sid,mj:P.mj?enr.mj:null,left:days,days,g:60};closeModal();
    log(`Accepted at ${sc.n}${sch}. Studying for ${degName(s.study)}.`,'good');toast(`Accepted at ${sc.n}${sch}!`)},
  study:k=>{const A=STUDY[k];if(!s.study||s.day<(s.cd['s_'+k]||0)||s.cash<(A.c||0))return;s.cash-=A.c||0;s.cd['s_'+k]=s.day+A.cd;toast(A.fx())},
  dropout:x=>{if(!s.study)return;if(x!=='yes')return modal(`<h2>Drop out of ${degName(s.study)}?</h2><p>You won't get your tuition back, and any student loan stays.</p><div class="row"><button class="bad" data-a="dropout" data-x="yes">Drop out</button><button data-a="close">Keep studying</button></div>`);log(`Dropped out of ${degName(s.study)}.`,'bad');s.study=null;closeModal()},
  payloan:()=>{if(!s.debt||s.cash<s.debt)return;s.cash-=s.debt;s.debt=0;log('Paid off your student loans.','good')},
  help:()=>modal(`<p class="kicker">Help and settings</p><h2>The Hustle</h2><div class="choices"><button data-a="guide2">Replay the guide</button><button data-a="exp">Back up your save</button><button data-a="imp">Load a saved game</button><button class="bad" data-a="reset">Start a new life</button><button class="pri" data-a="close">Back to the game</button></div>
    <h3 style="margin-top:var(--space-lg)">Settings</h3><table class="ledger"><tbody>
     <tr><td>Pause when a decision arrives</td><td class="act"><button class="${opt('pause')?'pri':''}" data-a="setopt" data-x="pause">${opt('pause')?'On':'Off'}</button></td></tr>
     <tr><td>Decisions decide themselves after</td><td class="act">${[7,30,90].map(d=>`<button class="${decDays()===d?'pri':''}" data-a="setopt" data-x="dec" data-y="${d}">${d} days</button>`).join('')}</td></tr>
     <tr><td>Quiet mode: no pop-up messages (everything still goes in The Record)</td><td class="act"><button class="${opt('quiet')?'pri':''}" data-a="setopt" data-x="quiet">${opt('quiet')?'On':'Off'}</button></td></tr></tbody></table>
    <h3 style="margin-top:var(--space-lg)">Keyboard</h3><table class="ledger"><tbody><tr><td class="num">1 to 0</td><td>Switch screens</td></tr><tr><td>Space</td><td>Pause or resume</td></tr><tr><td>C</td><td>Collect every till</td></tr><tr><td>?</td><td>Replay the guide</td></tr><tr><td>Esc</td><td>Close the guide</td></tr></tbody></table>`),
  guide2:()=>{closeModal();ACT.guide()},
  exp:()=>{modal('<p class="kicker">Back up</p><h2>Preparing your save…</h2>');packSave().then(code=>{expCode=code;modal(`<p class="kicker">Back up</p><h2>Your save</h2>
    <p>Your game lives only in this browser. Keep a copy somewhere safe, or use it to move your family to another device. It holds ${esc(s.name)}, generation ${s.gen}, and everything they own.</p>
    <textarea id="savecode" readonly rows="5" style="width:100%;font-size:var(--text-xs)">${code}</textarea><p class="mut sess">${Math.round(code.length/1024)} KB</p>
    <div class="row" style="margin-top:var(--space-xs)"><button class="pri" data-a="expcopy">Copy the code</button><button data-a="expfile">Download a file</button><button data-a="close">Done</button></div>`)})},
  expcopy:()=>{const el=$('#savecode');el.select();(navigator.clipboard?.writeText(expCode)||Promise.reject()).then(()=>toast('Save code copied'),()=>{try{document.execCommand('copy');toast('Save code copied')}catch{toast('Select the code and copy it')}})},
  expfile:()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([expCode],{type:'text/plain'}));a.download=`hustle-${s.name.replace(/[^a-z0-9]+/gi,'-').toLowerCase()}-year-${dateOf(s.day).y}.hustle`;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),5000)},
  imp:()=>modal(`<p class="kicker">Load a saved game</p><h2>Load a save</h2><p>Paste a save code, or pick a save file. It replaces the game you're playing now, so back that up first if you want to keep it.</p>
    <textarea id="impcode" rows="5" style="width:100%;font-size:var(--text-xs)" placeholder="Paste your save code here"></textarea>
    <label style="margin-top:var(--space-xs)">Or choose a file<input id="impfile" type="file" accept=".hustle,.txt,.json"></label>
    <p id="imperr" class="dn sess"></p>
    <div class="row" style="margin-top:var(--space-xs)"><button class="pri" data-a="imp2">Load it</button><button data-a="close">Cancel</button></div>`),
  imp2:()=>{const code=$('#impcode').value;unpackSave(code).then(d=>{if(d?.v!==1||!d.px||!d.name||!d.st)throw 0;
      s=d;upgrade();save();closeModal();tab='dash';render();toast(`Loaded ${esc(s.name)}, generation ${s.gen}`)},
    ()=>{$('#imperr').textContent="That doesn't look like a save from this game. Check you copied all of it."})},
  howto:()=>{helpOpen[tab]=!helpOpen[tab]},
  showall:()=>{showAll[tab]=!showAll[tab]},
  pmore:x=>{openP=openP===+x?null:+x},
  guide:()=>{if(tour<0){tourSpeed=speed||lastSpeed||1;speed=0}tour=0;ACT.tab(TOUR[0].tab);tourJump=true},
  tnext:()=>{if(tour>=TOUR.length-1)return ACT.tend();tour++;ACT.tab(TOUR[tour].tab);tourJump=true},
  tback:()=>{if(tour>0){tour--;ACT.tab(TOUR[tour].tab);tourJump=true}},
  tend:()=>{if(tour<0)return;tour=-1;s.tour=1;speed=tourSpeed;coach()},
  tskip:()=>{s.tour=1},
  apply:id=>{if(s.su)return toast('You run a startup full time. Shut it down or sell it first.');if(s.pol?.cur&&!OM[s.pol.cur].part)return toast(`You're the ${OM[s.pol.cur].n.toLowerCase()}. That is a full-time job.`);const j=JM[id];if(!canJob(j)||s.day<(s.cd['job_'+id]||0))return;iv={id,q:pick(IVQ)};modal(ivHtml())},
  answer:k=>{const j=JM[iv.id],ch=ivOdds(j,k);closeModal();
    if(R()<ch){s.job=j.id;s.rank=0;s.jobDays=0;s.perf=50;s.raise=k==='pay'?.1:0;teamDay();mile(`Hired as ${art(j.n.toLowerCase())}.`);log(`Hired as <b>${j.n}</b>${k==='pay'?' at 10% over the posted pay':''}.`,'good');toast(`You got the job: ${j.n}`)}
    else{s.cd['job_'+j.id]=s.day+30;log(`${j.n}: they went with someone else.`,'bad');toast(`No offer after the ${j.n} interview. You can reapply in 30 days.`)}},
  work:k=>{const W=WORK[k];if(!s.job||s.day<(s.cd['w_'+k]||0)||s.cash<(W.c||0))return;s.cash-=W.c||0;s.cd['w_'+k]=s.day+W.cd;toast(W.fx())},
  retire:()=>{if(!s.job||age()<55)return;s.pension=(s.pension||0)+jobPay()*.45;const j=jobTitle();fire();mile(`Retired from ${j}.`);log(`Retired from ${j} with a pension of ${fmt(s.pension)} a day.`,'good')},
  pp:(u,k)=>{const sure=k.endsWith('!');k=k.replace('!','');const p=per(+u),A=PACTS[k];if(!p||!A||!A.roles.includes(p.role)||A.show&&!A.show(p))return;
    if(A.bad&&!sure)return modal(`<h2>${A.n} with ${esc(p.n)}?</h2><p>${k==='divorce'?`Lawyers and the settlement will cost about <b class="num">${fmt(divCost(p))}</b>: half of what you've built since the wedding${p.pre?'. Your prenup protects the rest.':', plus a quarter of what you had before it. There is no prenup.'}`:'This cannot be undone.'}</p><div class="row"><button class="bad" data-a="pp" data-x="${p.uid}" data-y="${k}!">${A.n}</button><button data-a="close">Cancel</button></div>`);
    const cost=A.c?A.c(p):0;if((p.c?.[k]||0)>s.day||s.cash<cost||A.need?.(p))return;
    s.cash-=cost;(p.c??={})[k]=s.day+(A.cd||0);const m=A.fx(p,cost);if(sure)closeModal();toast(esc(m));if(A.bad)log(esc(m),'bad')},
  quit:()=>{log(`Quit your job as ${jobTitle()}.`);fire()},
  gig:()=>{if(gigsLeft()<1)return;const g=gig();s.cash+=g;taxAdd('ord',g);s.gigs=(s.gigs||0)+1;if(s.gd!==s.day){s.gd=s.day;s.gn=0}s.gn++},
  bbuy:(id,x)=>{const b=BM[id],o=s.biz[id]??={n:0,mgr:0,pend:0,spent:0},q=x==='max'?bmax(b,o.n):+x;if(q<1)return;const c=bcost(b,o.n,q);if(c>s.cash)return;
    const first=!o.n;s.cash-=c;o.spent+=c;const before=bmul(o.n);o.n+=q;
    if(first){mile(`Opened a ${b.n.toLowerCase()}.`);log(`Opened your first ${b.n}`,'good');if(s.fol>100&&R()<.6)chirp(...pick(NPC),`just walked past ${s.handle}'s new ${b.n.toLowerCase()} ${pick(['love to see it','entrepreneur arc','the grind pays'])}`)}
    if(bmul(o.n)>before){log(`${b.n} milestone: ${o.n} units → income ×${bmul(o.n)}!`,'good');toast(`${b.n} income doubled`)}},
  mgr:id=>{const b=BM[id],o=s.biz[id],c=mgrCost(b);if(!o||o.mgr||s.cash<c)return;s.cash-=c;o.spent+=c;o.mgr=1;s.cash+=o.pend;taxAdd('ord',o.pend);o.pend=0;log(`Hired a manager for your ${b.n}. It runs itself now.`,'good')},
  col:id=>{const o=s.biz[id];s.cash+=o.pend;taxAdd('ord',o.pend);o.pend=0},
  colAll:()=>{for(const id in s.biz){const v=s.biz[id].pend;s.cash+=v;taxAdd('ord',v);s.biz[id].pend=0}},
  buy:(t,x,mg)=>{const n=x==='max'?maxBuy(t,s.cash,mg):+x;if(n<1)return;const{avg,p1}=fillAt(t,n);if(!canBuy(t,n,mg))return;if(n*avg>s.cash){const need=n*avg-Math.max(0,s.cash);s.mloan+=need;s.cash+=need}const was=controls(t),h=s.port[t]??={sh:0,cost:0};
    h.d=avgDay(h.d,h.sh,n);h.sh+=n;h.cost+=n*avg;s.cash-=n*avg;shock(t,p1/s.px[t].p-1,mktOpen());log(`Bought ${big(n)} $${t} @ ${pfmt(avg)}`);ctrlCheck(t,was)},
  short:(t,x)=>{const n=+x;if(!mktOpen()||n<1||!shortable(t))return;const q=s.px[t],{avg,p1}=fillAt(t,-n),v=n*avg,A=acct();
    if(A.eq-n*(q.p-avg)<A.init+v*(SK[t].pn?1:.5))return toast('Not enough equity to short that much.');
    s.cash+=v;const S=s.shorts[t]??={sh:0,px:0,d:s.day};S.px=(S.px*S.sh+v)/(S.sh+n);S.sh+=n;shock(t,p1/q.p-1,true);log(`Shorted ${big(n)} $${t} @ ${qfmt(avg)}.`)},
  cover:(t,x)=>{const S=s.shorts[t];if(!S||!mktOpen())return;const n=x==='all'?S.sh:Math.min(S.sh,+x),{avg,p1}=fillAt(t,n),g=(S.px-avg)*n;coverAt(t,n,avg);shock(t,p1/s.px[t].p-1,true);log(`Bought back ${big(n)} $${t} @ ${qfmt(avg)} (${g>=0?'+':''}${fmt(g)}).`,g>=0?'good':'bad')},
  mgtog:()=>{ot.mg=!ot.mg},
  lbtog:()=>{s.lbOff=!s.lbOff;if(s.lbOff&&lb&&lbMe)lb.doc('board/'+lbMe).delete().catch(()=>{});else lbPost(true)},
  vm:x=>{vmode=x},oexp:x=>{oxp=+x},oqn:x=>{oq=+x},
  obuy:(key)=>{const[type,K,exp]=key.split('|'),k=SK[sel];if(!mktOpen()||k.pn)return;const q=optQuote(k,type,+K,+exp),c=q.ask*100*oq;if(c>s.cash||q.ask<=0)return;
    s.cash-=c;s.opts.push({id:uid(),t:sel,type,K:+K,exp:+exp,n:oq,cost:c,d:s.day});log(`Bought ${oq} ${optLabel({t:sel,type,K:+K,exp:+exp})} for ${fmt(c)}.`)},
  osell:id=>{if(!mktOpen())return;const i=s.opts.findIndex(o=>o.id===+id);if(i<0)return;const o=s.opts[i],v=optQuote(SK[o.t],o.type,o.K,o.exp).bid*100*o.n;s.cash+=v;capGain(v-o.cost,o.d);s.opts.splice(i,1);log(`Sold ${o.n} ${optLabel(o)} for ${fmt(v)} (${v>=o.cost?'+':''}${fmt(v-o.cost)}).`,v>=o.cost?'good':'bad')},
  repay:x=>{const a=x==='all'?Math.min(s.mloan,s.cash):Math.min(+x,s.mloan,s.cash);if(a>0){s.mloan-=a;s.cash-=a}},
  sell:(t,x)=>{const h=s.port[t];if(!h?.sh)return;const was=controls(t),n=x==='all'?h.sh:Math.min(h.sh,+x),{avg:p,p1}=fillAt(t,-n),basis=h.cost*n/h.sh,g=n*p-basis;
    h.cost-=basis;h.sh-=n;s.cash+=n*p;capGain(g,h.d);repayLoan();shock(t,p1/s.px[t].p-1,mktOpen());log(`Sold ${big(n)} $${t} @ ${pfmt(p)} (${g>=0?'+':''}${fmt(g)})`,g>=0?'good':'bad');if(!h.sh)delete s.port[t];ctrlCheck(t,was)},
  ctrl:t=>{if(!mktOpen())return;const n=ctrlNeed(t);if(n<1||n*fillAt(t,n).avg>s.cash)return;ACT.buy(t,n)},
  grow:t=>{const q=s.px[t],c=.02*q.p*shOf(t);if(!controls(t)||s.cash<c||cdLeft('grow_'+t))return;s.cash-=c;q.gr=s.day+365;s.cd['grow_'+t]=s.day+180;log(`Invested ${fmt(c)} to grow ${esc(nameOf(t))}. Expect a stronger year.`,'good')},
  sdiv:t=>{const q=s.px[t];if(!controls(t)||cdLeft('sdiv_'+t))return;const v=.1*q.p*shOf(t)*ownFrac(t);s.cash+=v;taxAdd('lt',v);shock(t,-.1,mktOpen());s.cd['sdiv_'+t]=s.day+90;log(`${esc(nameOf(t))} paid a special dividend. Your cut: ${fmt(v)}.`,'good')},
  rename:t=>{if(!controls(t))return;modal(`<p class="kicker">Rename</p><h2>${esc(nameOf(t))}</h2><label>New name<input id="cname" maxlength="28" value="${esc(nameOf(t))}"></label><div class="row" style="margin-top:var(--space-sm)"><button class="pri" data-a="rename2" data-x="${t}">Rename</button><button data-a="close">Cancel</button></div>`)},
  rename2:t=>{const n=$('#cname').value.trim().slice(0,28);if(n&&controls(t)){const o=nameOf(t);s.px[t].n=n;log(`${esc(o)} is now called <b>${esc(n)}</b>.`,'good')}closeModal()},
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
  pbuy:(u,x)=>{const i=s.re.list.findIndex(l=>l.uid===+u);if(i<0)return;const l=s.re.list[i],v=lval(l),mort=x==='m';
    if(s.cash<(mort?v*.2:v)||(mort&&!canBorrow(v*.8)))return;
    s.cash-=mort?v*.2:v;const p={...l,paid:v,bought:s.day,loan:mort?v*.8:0,pay:mort?mpay(v*.8,myRate()):0,rate:mort?myRate():0,from:s.day+rint(5,20)};
    s.props.push(p);s.re.list.splice(i,1,listing());if(!homeP()&&!PM[p.t].biz)s.home=p.uid;add('hap',5);
    mile(`Bought ${art(pname(p))}${s.home===p.uid?' and moved in':''}.`);log(`Bought ${art(pname(p))} for ${fmt(v)}${mort?' with a mortgage':''}${s.home===p.uid?', and moved in':''}.`,'good')},
  live:u=>{const p=P(+u);if(!p||PM[p.t].biz||!here(p))return;s.rc=0;const o=homeP();if(o)o.from=s.day+rint(5,20);s.home=p.uid;log(`Moved into your ${pname(p)}.`)},
  moveout:u=>{const p=P(+u);if(!p||s.home!==p.uid)return;s.home=null;p.from=s.day+rint(5,20);log(`Moved out of your ${pname(p)}. It goes up for rent.`)},
  payoff:u=>{const p=P(+u);if(!p?.loan||s.cash<p.loan)return;s.cash-=p.loan;p.loan=p.pay=0;log(`Paid off the mortgage on your ${pname(p)}.`,'good')},
  psell:u=>{const i=s.props.findIndex(p=>p.uid===+u);if(i<0)return;const p=s.props[i],v=pval(p),gn=v*.97-p.paid;s.cash+=v*.97-p.loan;capGain(s.home===p.uid&&gn>0?Math.max(0,gn-250000*s.eco.P):gn,p.bought);s.props.splice(i,1);if(s.home===p.uid)s.home=null; // the home you live in: first $250K of gain is tax-free
   
    log(`Sold your ${pname(p)} for ${fmt(v)} (${v>=p.paid?'+':''}${fmt(v-p.paid)} on what you paid).`,v>=p.paid?'good':'bad')},
  cfin:id=>{const k=CM[id];if(!k||!canCarLoan(k.price))return;const L=k.price*.9,r=carRate();s.cash-=k.price*.1;s.cars.push({uid:uid(),t:id,paid:k.price,v:k.dep>0?k.price*.9:k.price,bought:s.day,loan:L,pay:carPay(L,r),rate:r});add('hap',4);log(`Bought ${art(k.n.toLowerCase())} with ${fmt(k.price*.1)} down and a 5-year loan at ${pctA(r)}.`,'good')},
  kidadopt:()=>{const p=adoptKid();if(p)toast(`Welcome home, ${esc(p.n)}!`)},
  cbuy:id=>{const k=CM[id];if(s.cash<k.price)return;s.cash-=k.price;s.cars.push({uid:uid(),t:id,paid:k.price,v:k.dep>0?k.price*.9:k.price,bought:s.day});add('hap',4);log(`Bought ${art(k.n.toLowerCase())}.`,'good')},
  csell:u=>{const i=s.cars.findIndex(c=>c.uid===+u);if(i<0)return;const c=s.cars[i];s.cash+=c.v-(c.loan||0);s.cars.splice(i,1);log(`Sold your ${CM[c.t].n.toLowerCase()} for ${fmt(c.v)}.`,c.v>=c.paid?'good':'bad')},
  xsel:x=>csel=x,
  xbuy:(k,x)=>{const c=coin(k),amt=x==='all'?s.cash:+x;if(!c||c.dead||amt<=0||amt>s.cash)return;const w=s.wallet[k]??={u:0,c:0};w.d=avgDay(w.d,w.u,amt*.99/c.p);w.u+=amt*.99/c.p;w.c+=amt;s.cash-=amt;log(`Bought ${fmt(amt)} of $${k}.`)},
  xsell:(k,x)=>{const c=coin(k),w=s.wallet[k];if(!c||!w)return;const f=x==='all'?1:+x,u=w.u*f,v=u*c.p*.99,cost=w.c*f;w.u-=u;w.c-=cost;s.cash+=v;capGain(v-cost,w.d);if(f===1)delete s.wallet[k];log(`Sold ${fmt(v)} of $${k} (${v>=cost?'+':''}${fmt(v-cost)}).`,v>=cost?'good':'bad')},
  chip:x=>{s.cz.chip=+x},
  cg:x=>{cg=x||null;$('#view').scrollTop=0},
  dice:k=>{const b=stake();if(!b)return;const a=rint(1,6),c=rint(1,6),n=a+c,m=k==='seven'?(n===7?5.8:0):(k==='under'?n<7:n>7)?2.35:0;s.cz.dice={a,b:c,w:b*m};settle(b,b*m,'dice','dice')},
  flip:k=>{const b=stake();if(!b)return;const r=R()<.5?'h':'t',m=r===k?1.96:0;s.cz.flip={r,w:b*m};settle(b,b*m,'the coin flip','coin')},
  tf:x=>{tf=x},cmode:x=>{cmode=x},
  side:x=>{ot.side=x;if(x==='short'||x==='cover')ot.type='market'},
  otype:x=>{ot.type=x;if(x!=='market'&&!(ot.px>0))ot.px=+s.px[sel].p.toPrecision(4)},
  tif:x=>{ot.tif=x},
  bset:key=>{const[kind,t]=key.split(':'),H=kind==='coin'?s.wallet[t]:s.port[t],d=bd[key]||{};if(!H)return;const now=kind==='coin'?coin(t).p:bidAsk(t)[0];
    const tp=d.tp===''?null:d.tp??H.tp,sl=d.sl===''?null:d.sl??H.sl;
    if(tp!=null&&!(tp>now))return toast('A take profit has to be above the current price.');if(sl!=null&&!(sl>0&&sl<now))return toast('A stop loss has to be below the current price.');
    if(tp)H.tp=tp;else delete H.tp;if(sl)H.sl=sl;else delete H.sl;delete bd[key];toast(tp||sl?'Take profit and stop loss saved':'Cleared')},
  bq:(key,y)=>{const[kind,t]=key.split(':'),[w,f]=y.split(':'),H=kind==='coin'?s.wallet[t]:s.port[t];if(!H)return;const now=kind==='coin'?coin(t).p:s.px[t].p,v=+(now*(1+ +f)).toPrecision(5);
    (bd[key]??={})[w]=v;ACT.bset(key)},
  bclr:key=>{const[kind,t]=key.split(':'),H=kind==='coin'?s.wallet[t]:s.port[t];if(H){delete H.tp;delete H.sl;delete H.trail;delete H.hw}delete bd[key]},
  btrail:(key,y)=>{const[kind,t]=key.split(':'),H=kind==='coin'?s.wallet[t]:s.port[t];if(!H)return;if(!+y){delete H.trail;delete H.hw;return}H.trail=+y;H.hw=kind==='coin'?coin(t).p:bidAsk(t)[0];toast(`Trailing stop set ${+y*100}% under the price`)},
  sdep:x=>{const a=x==='all'?Math.max(0,s.cash):Math.min(+x,s.cash);if(a<=0)return;s.cash-=a;s.fin.sav+=a},
  swd:x=>{const F=s.fin,a=x==='all'?F.sav:Math.min(+x,F.sav);if(a<=0)return;F.sav-=a;s.cash+=a},
  fbuy:x=>{if(!mktOpen())return;const a=x==='all'?Math.max(0,s.cash):Math.min(+x,s.cash);if(a<=0)return;s.cash-=a;s.fin.fd=avgDay(s.fin.fd,s.fin.fu,a/fundPx());s.fin.fu+=a/fundPx();s.fin.fc+=a;log(`Put ${fmt(a)} into the Hustle 500 fund.`)},
  fsell:x=>{if(!mktOpen())return;const F=s.fin,f=x==='all'?1:+x,u=F.fu*f,v=u*fundPx(),c=F.fc*f;if(u<=0)return;F.fu-=u;F.fc-=c;s.cash+=v;capGain(v-c,F.fd);log(`Sold ${fmt(v)} of the Hustle 500 fund (${v>=c?'+':''}${fmt(v-c)}).`,v>=c?'good':'bad')},
  bnd:(term,x)=>{const a=Math.min(+x,s.cash),n=+term;if(a<=0)return;s.cash-=a;s.fin.bonds.push({amt:a,rate:bondY(n),term:n,mat:s.day+n*365,start:s.day});log(`Bought a ${n}-year government bond: ${fmt(a)} at ${pctA(bondY(n))}.`)},
  bndsell:i=>{const F=s.fin,b=F.bonds[+i];if(!b)return;const v=bondVal(b);s.cash+=v;capGain(v-b.amt,b.start);F.bonds.splice(+i,1);log(`Sold a ${b.term}-year bond early for ${fmt(v)} (${v>=b.amt?'+':''}${fmt(v-b.amt)}).`,v>=b.amt?'good':'bad')},
  irapct:x=>{s.fin.iraPct=+x},
  iradep:x=>{const a=Math.min(+x,s.cash,iraRoom());if(a<=0)return;s.cash-=a;iraPut(a);log(`Put ${fmt(a)} into your retirement account.`)},
  iraw:x=>{const F=s.fin,v=iraVal(),a=x==='all'?v:Math.min(+x,v);if(a<=0)return;const pen=age()<60?a*.1:0;F.ira-=a/fundPx();F.iraC*=v?1-a/v:0;s.cash+=a-pen;taxAdd('ord',a);log(`Took ${fmt(a)} out of your retirement account${pen?`, paying a ${fmt(pen)} early-withdrawal penalty`:''}.`,pen?'bad':'good')},
  ocancel:id=>{s.orders=s.orders.filter(o=>o.id!==+id)},
  qty:x=>{const st=10**Math.max(0,Math.floor(Math.log10(Math.max(1,ot.qty-(x==='-'?1:0)))));ot.qty=Math.max(1,ot.qty+(x==='+'?st:-st))},
  qset:x=>{const h=s.port[sel],S=s.shorts[sel];ot.qty=x==='max'?Math.max(1,ot.side==='buy'?maxBuy(sel,s.cash,ot.mg):ot.side==='cover'?S?.sh||1:ot.side==='short'?Math.floor(Math.max(0,acct().eq-acct().init)/(s.px[sel].p*(SK[sel].pn?1:.5))):h?.sh||1):+x},
  order:()=>{const n=ot.qty,buy=ot.side==='buy';
    if(ot.type&&ot.type!=='market'){const px=+ot.px,tp=buy&&+ot.tp>px?+ot.tp:0,sl=buy&&+ot.sl>0&&+ot.sl<px?+ot.sl:0;if(!(px>0)||(buy?n*px>s.cash:!(s.port[sel]?.sh>=n)))return;if(buy&&(ot.tp&&!tp||ot.sl&&!sl))return toast('Set the take profit above your buy price and the stop loss below it.');s.orders.push({id:uid(),t:sel,side:ot.side,type:ot.type,px,n,tif:ot.tif||'day',d:s.day,tp,sl});ot.tp=ot.sl=null;toast(`${ot.type==='limit'?'Limit':'Stop'} ${ot.side} order placed`);return}
    if(!mktOpen())return;if(ot.side==='short'||ot.side==='cover')return ACT[ot.side](sel,n);const p=fillAt(sel,buy?n:-n).avg;if(ot.side==='buy'){if(!canBuy(sel,n,ot.mg))return;ACT.buy(sel,n,ot.mg)}else{const h=s.port[sel];if(!h||h.sh<n)return;ACT.sell(sel,n)}toast(`Filled: ${ot.side==='buy'?'bought':'sold'} ${big(n)} ${sel} at ${qfmt(p)}`)},
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
const gigsLeft=()=>3-(s.gd===s.day?s.gn||0:0); // a gig takes a few hours: three a day at most
const gig=()=>(4+s.st.sma*.15+(s.cars.length?12:0))*s.eco.P+(s.job?jobPay()*.02:0); // with a car, the gig is rideshare driving and pays more
const canJob=j=>!jobMiss(j).length;
function ivOdds(j,k){const sc=k==='exp'?xpY(j.fld)*15+(s.st.sma-j.s)*.8:k==='charm'?(s.st.loo-50)*.8+(s.fol>1000?10:0)+(trait('charming')?10:0):-10;return clamp(.55+sc/100+eduBonus(j)+hobIv(j)-crimes().length*.12-Math.max(0,s.eco.u-.045)*3,.1,.95)} // a weak job market makes interviews harder
const eduBonus=j=>Math.max(0,...s.degs.map(d=>(SCHOOLS[d.sc]?.pres||0)*.04+(d.hon?.03:0)+(d.mj&&MAJORS[d.mj]===j.fld?.1:0)));
const schoolOf=st=>st.sc==='inst'?{id:'inst',n:PG[st.p].at,pres:0}:{id:st.sc,...SCHOOLS[st.sc]};
const schoolsFor=P=>P.at?[{id:'inst',n:P.at,cost:1,adm:0,pres:0}]:P.sch.map(id=>({id,...SCHOOLS[id]}));
const admOdds=(P,sc)=>sc.adm?clamp(.35+(s.st.sma-Math.max(P.min,sc.adm))/30,.05,.97):1;
const tuition=(P,sc)=>isVet()&&!s.giUsed?0:Math.round(P.cost*sc.cost); // the GI Bill pays for one program
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
function graduate(){const st=s.study,P=PG[st.p],d={p:st.p,sc:st.sc,mj:st.mj||null,hon:st.g>=80};s.degs.push(d);s.edu=Math.max(s.edu,P.lvl);add('sma',P.sma);if(P.xp)s.xp[P.xp]=(s.xp[P.xp]||0)+180;s.study=null;mile(`Graduated: ${degName(d)}${d.hon?', with honors':''}.`);log(`Graduated: ${degName(d)}${d.hon?', with honors':''}.`,'good');toast('Graduated!')}
function ivHtml(){const j=JM[iv.id],o=k=>`${Math.round(ivOdds(j,k)*100)}% chance`;
  return `<p class="kicker">Interview · ${j.n}</p><h2>“${iv.q}”</h2><p>How do you answer?</p><div class="choices">
  <button data-a="answer" data-x="exp">Walk them through your experience<br><small class="mut">${xpY(j.fld)>=.1?`${xpY(j.fld).toFixed(1)} years in ${FIELD[j.fld]}`:`No ${FIELD[j.fld]} experience yet`} · ${o('exp')}</small></button>
  <button data-a="answer" data-x="charm">Charm them<br><small class="mut">Leans on your looks · ${o('charm')}</small></button>
  <button data-a="answer" data-x="pay">Ask about the pay first<br><small class="mut">Riskier, but you start 10% higher · ${o('pay')}</small></button>
  <button data-a="close">Not today</button></div>`}

// ---------- modals ----------
// ---------- save backups: gzip + base64 when the browser can, plain base64 otherwise ----------
let expCode='';
const b64=u=>{let s2='';for(let i=0;i<u.length;i+=0x8000)s2+=String.fromCharCode.apply(null,u.subarray(i,i+0x8000));return btoa(s2)};
async function packSave(o=s){const j=JSON.stringify(o);if(typeof CompressionStream==='undefined')return 'HJ'+btoa(unescape(encodeURIComponent(j)));
  return 'HG'+b64(new Uint8Array(await new Response(new Blob([j]).stream().pipeThrough(new CompressionStream('gzip'))).arrayBuffer()))}
async function unpackSave(code){code=code.replace(/\s+/g,'');if(code[0]==='{')return JSON.parse(code);const kind=code.slice(0,2),raw=atob(code.slice(2));
  if(kind==='HJ')return JSON.parse(decodeURIComponent(escape(raw)));if(kind!=='HG')throw 0;
  return JSON.parse(await new Response(new Blob([Uint8Array.from(raw,c=>c.charCodeAt(0))]).stream().pipeThrough(new DecompressionStream('gzip'))).text())}
document.addEventListener('change',e=>{if(e.target.id==='impfile'&&e.target.files[0])e.target.files[0].text().then(x=>{$('#impcode').value=x.trim()})});
function modal(h,wide){$('#mbox').innerHTML=h;$('#mbox').classList.toggle('wide',!!wide);$('#modal').hidden=false}
function closeModal(){$('#modal').hidden=true;render()}
function startModal(h={}){
  heir=h;
  const fam=h.fam?.length?` ${h.fam.map(p=>`${esc(p.n)} (your ${p.role==='child'?'kid':p.role})`).join(', ').replace(/, ([^,]*)$/,' and $1')} ${h.fam.length>1?'are':'is'} still around.`:'';
  modal(`<p class="kicker">${h.gen?`Generation ${h.gen}`:'The Hustle'}</p><h2>${h.kid?`${esc(h.kid)} takes over`:h.gen?'The family business continues':'You just turned eighteen'}</h2>
  <p>${h.kid?`You are ${esc(h.last)}'s kid, starting at ${Math.floor(h.age)}. You inherit <b class="num">${fmt(h.inherit)}</b>${h.fund>=1?` plus your ${fmt(h.fund)} college fund`:''} and a permanent <b>+${(h.gen-1)*25}%</b> business income bonus.${fam}`:h.gen?`With no children, a relative inherits <b class="num">${fmt(h.inherit)}</b> and a permanent <b>+${(h.gen-1)*25}%</b> business income bonus.`:'Work your way up or start a company, invest, fall in love, raise kids, stay healthy, maybe run for office. Decisions will land on your desk along the way, and some come back years later. When you die, one of your kids carries on the family. Time flies while you’re idle, slows down while you play, and keeps passing when you’re away.'}</p>
  <label>Your name<input id="nm" maxlength="20" value="${h.kid?esc(h.kid):h.last?esc(h.last.split(' ')[0])+' Jr.':pick(NAMES)}"></label>
  ${h.ks?`<table class="ledger"><tr><td>Grew up</td><td>${trTxt(h.tr)||'Ordinary'}${h.tr?.length?` <span class="mut">(${h.tr.map(t=>TRAITS[t].d).join('; ')})</span>`:''}</td></tr><tr><td>Stats</td><td>Health ${Math.round(h.ks.hea)} · Happiness ${Math.round(h.ks.hap)} · Smarts ${Math.round(h.ks.sma)} · Looks ${Math.round(h.ks.loo)}</td></tr><tr><td>Path</td><td>${h.job?`Working as ${art(JM[h.job].n.toLowerCase())}`:h.study?'At college':'No job yet'}${h.degs?`, ${h.degs.map(degName).join(', ')}`:''}${h.loan?`, ${fmt(h.loan)} in student loans`:''}</td></tr></table>
  <button class="pri big" data-a="begin" data-x="heir" style="margin-top:var(--space-sm)">Begin</button>`:`<label>Pick your start</label>
  <div class="bgs">${Object.entries(BG).map(([k,b])=>`<button data-a="begin" data-x="${k}"><b>${b.n}</b><small>${b.d}</small></button>`).join('')}</div>`}`);
}
function deathModal(){
  const w=netWorth(),nb=BIZ.reduce((t,b)=>t+(s.biz[b.id]?.n||0),0),ks=kids().sort((a,b)=>a.b-b.b),ng=Object.values(s.goals).filter(g=>g.gen===s.gen).length;
  modal(`<p class="kicker">Obituary</p><h2>${esc(s.name)}, ${Math.floor(age())}</h2>
  <table class="ledger"><tr><td>Net worth</td><td class="r num">${fmt(w)}</td></tr><tr><td>Businesses</td><td>${nb}</td></tr><tr><td>Followers</td><td>${big(s.fol)}</td></tr><tr><td>Career</td><td>${s.job?jobTitle():'—'}</td></tr><tr><td>Family</td><td>${partner()?(partner().role==='spouse'?'Married to ':'Seeing ')+esc(partner().n):'Single'}${kids().length?`, ${kids().length} kid${kids().length>1?'s':''}`:''}</td></tr><tr><td>Goals reached</td><td>${ng}</td></tr></table>
  <p style="margin-top:var(--space-sm)">${estateTax(Math.max(0,w))?`Estate tax takes ${fmt(estateTax(w))} (40% above ${fmt(exemptLeft())} of exemption left). `:''}${ks.length?`Your heir inherits <b class="num">${fmt(Math.max(0,w-estateTax(Math.max(0,w)))+(s.trust?.v||0))}</b>${s.trust?.v?`, including the ${fmt(s.trust.v)} family trust`:''}, plus their own college fund.`:`With no children, a relative inherits half: <b class="num">${fmt(Math.max(0,(w-estateTax(Math.max(0,w)))*.5))}</b>.`}${ks.length>1?' Pick which of your kids takes over. Each starts as the person they grew into: their smarts, health, traits, degree and job. Younger ones have more years ahead, and closer ones start happier.':''}</p>
  ${ks.length?`<div class="choices">${ks.map(k=>{const a=ageOf(k);return `<button data-a="heir" data-x="${k.uid}"><b>Continue as ${esc(k.n)}</b><br><small class="mut">${a<18?`${Math.floor(a)} now, takes over at 18`:`Age ${Math.floor(a)}`} · ${closeWord(k.rel)} to you${k.k?`<br>${kidStat(k)}`:''}</small></button>`}).join('')}</div>`:'<button class="pri big" data-a="heir">Continue as your heir</button>'}`);
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
  b.push(s.rc?'lives in a retirement community':homeP()?`lives in ${art(PM[homeP().t].n.toLowerCase())} in ${homeP().loc}`:'rents a room');if((s.city||'suburb')!=='suburb')b[b.length-1]+=` in ${city().n.toLowerCase().replace(/^the /,'the ')}`;
  if(bestCar())b.push(`drives ${art(CM[bestCar().t].n.toLowerCase())}`);
  if(s.pets.length)b.push(s.pets.length===1?`has ${art(PTM[s.pets[0].t].n.toLowerCase().replace(' tank',''))} called ${esc(s.pets[0].n)}`:`has ${s.pets.length} pets`);
  if(jailed())b.push(`is in jail for ${s.legal.jail-s.day} more day${s.legal.jail-s.day>1?'s':''}`);
  return b.join(', ').replace(/, ([^,]*)$/,' and $1')+'.';
}
const howto=x=>`<div class="howto"><button class="link2" data-a="howto" aria-expanded="${!!helpOpen[tab]}">${helpOpen[tab]?'Hide the details':'How this works'}</button>${helpOpen[tab]?`<p>${x}</p>`:''}</div>`;
const pendAll=()=>BIZ.reduce((t,b)=>t+(s.biz[b.id]?.pend||0),0);
const plural=w=>/(sh|ch|s)$/.test(w)?w+'es':/[^aeiou]y$/.test(w)?w.slice(0,-1)+'ies':w+'s';
const LOWFIX={hea:['doc','gym'],hap:['trip','spa','med','fam','out']};
// ---------- next steps: a few suggestions that fit where you are in life, most useful first ----------
function tips(){const T=[],P=s.eco.P,A=age(),f=flows(),bb=bestBuy(),idle=s.cash-Math.max(2e3*P,f.exp*60);
  const t=(k,ti,d,btn)=>T.push({k,ti,d,btn});
  if(!s.job&&!s.study&&!s.su&&!(s.pol?.cur&&!OM[s.pol.cur].part)&&!s.pension&&A<62)t('job','Find a job','A steady salary is the fastest way to get going. Interview for anything on the board you qualify for.','<button data-a="tab" data-x="work">Job board</button>');
  if(!nOwned()&&bb)t('biz',`Open a ${bb.b.n}`,`It costs ${fmt(bb.c)} and earns about ${fmt(bizInc(bb.b,{n:bb.k}))} a day.`,'<button data-a="tab" data-x="biz">Businesses</button>');
  if(s.edu<1&&!s.study&&A<40&&s.day>60)t('edu','Get a diploma','Most better jobs ask for one. Study online so you can keep working.','<button data-a="tab" data-x="school">Education</button>');
  if(s.cash<0&&credit()<640)t('credit','Get your balance above zero',`Every day in the red costs you credit (now ${credit()}) and interest at ${pctA(debtAPR())}.`,'<button data-a="tab" data-x="bank">Bank</button>');
  if(s.ins==='none')t('ins','Get health insurance','One bad diagnosis can cost more than everything you own.','<button data-a="tab" data-x="health">Health</button>');
  if(A>=30&&s.day-((s.cd.doc||0)-30)>730&&s.cash>AM.doc.c*3)t('doc','Get a check-up',"It's been a while. Some illnesses only show up on tests, and they're cheaper to treat early.",'<button data-a="act" data-x="doc">Check-up · '+fmt(AM.doc.c)+'</button>');
  if(idle>2e4*P&&!s.fin.fu&&!Object.keys(s.port).length)t('fund','Put idle cash to work',`${fmt(idle)} is sitting in cash, losing ${pctA(s.eco.pi)} a year to inflation. The index fund grows with the whole market.`,'<button data-a="tab" data-x="bank">Bank</button>');
  if(s.job&&!s.fin.iraPct&&A>=22)t('ira','Save for retirement','Put 6% of your pay into the retirement account and your employer adds half as much again.','<button data-a="irapct" data-x=".06">Save 6%</button>');
  if(!homeP()&&s.re.list.some(l=>!PM[l.t].biz&&s.cash>=lval(l)*.2&&canBorrow(lval(l)*.8)))t('home','Buy instead of renting',`You pay ${fmt(rentNow())} a day in rent. A mortgage on a place of your own builds equity instead.`,'<button data-a="tab" data-x="home">Property</button>');
  if(kidsHome()&&!kids().some(k=>k.k?.fund>0)&&s.cash>3e4*P)t('fund529','Start a college fund','It grows about 5% a year and pays tuition first when they turn 18.','<button data-a="tab" data-x="people">People</button>');
  if(s.st.hap<40)t('hap','Look after your mood','Low happiness drags down your work, your grades and your health. Take a trip, see people, or pick up a hobby.','<button data-a="tab" data-x="life">Life</button>');
  if(!Object.keys(s.hob).length&&s.day>90)t('hob','Pick up a hobby','A hobby lifts your mood, and once you are good it can pay: gigs, commissions, prizes.','<button data-a="tab" data-x="hobby">Hobbies</button>');
  if(s.fol>=4e3&&!s.pol?.cur&&!s.pol?.camp&&A>=21&&!s.pol?.held?.council)t('pol','Run for city council',`With ${big(s.fol)} followers you have a real shot. It's part time, so you keep your job.`,'<button data-a="tab" data-x="office">Politics</button>');
  if(s.cash>1e5*P&&!s.su&&!s.fl.jobs.length&&xpT()>=3&&!s.car2?.dead)t('found','Think about a startup','You have savings and a few years of experience. Most startups fail, but the ones that work change everything.','<button data-a="tab" data-x="work">Work</button>');
  if(!s.job&&s.st.loo>=80&&age()<38&&canJob(JM.model))t('model','Try modeling',`With ${Math.round(s.st.loo)} looks, agencies would sign you today.`,'<button data-a="tab" data-x="work">Job board</button>');
  if(nOwned()>=3&&!s.staff?.pa&&s.cash>1e5*P)t('pa','Hire a personal assistant','They collect every till each day, so your businesses never stop earning while you are busy.','<button data-a="tab" data-x="shop">Lifestyle</button>');
  if(netWorth()>8e6*P&&kids().length&&!s.trust?.v&&A>=45)t('trust','Plan your estate','A family trust moves money to your heirs now, so its growth escapes the 40% estate tax.','<button data-a="tab" data-x="legacy">Family tree</button>');
  return T.slice(0,3)}
const tipHtml=x=>`<div class="need tip"><div><div class="k">Next step</div><div class="t">${x.ti}</div><div class="d">${x.d}</div></div><div class="acts2">${x.btn}</div></div>`;
function needs(){
  const L=[];
  for(const it of s.inbox){const e=EVM[it.id];if(!e.c||e.c(s))L.push({k:'dec',it,e})}
  if(s.su?.offer)L.push({k:'su',t:'offer'});if(s.su?.acq)L.push({k:'su',t:'acq'});if(s.su&&suRunway(s.su)<60)L.push({k:'su',t:'run'});
  for(const c of s.legal.cases)L.push({k:'case',c});if(jailed())L.push({k:'jail'});
  for(const c of s.conds)if(!c.hid&&!c.tx&&!CONDS[c.id].acute)L.push({k:'cond',c});
  let pend=0;const full=[];for(const b of BIZ){const o=s.biz[b.id];if(o?.n&&!o.mgr&&o.pend>0){pend+=o.pend;if(o.pend>=bizInc(b,o)*CAP*.999)full.push(b.n)}}
  if(pend>=1&&(full.length||pend>=Math.max(50,s.cash*.02)))L.push({k:'till',pend,full});
  const m=BIZ.find(b=>{const o=s.biz[b.id];return o?.n&&!o.mgr&&s.cash>=mgrCost(b)});if(m)L.push({k:'mgr',b:m});
  for(const k of ['hea','hap'])if(s.st[k]<25)L.push({k:'low',st:k,a:LOWFIX[k].map(id=>AM[id]).find(a=>(!a.show||a.show())&&!cdLeft(a.id)&&s.cash>=a.c)});
  if(!homeP()){const l=[...s.re.list].sort((a,b)=>PM[a.t].base*a.m-PM[b.t].base*b.m).find(l=>{const v=PM[l.t].base*l.m*s.re.idx;return !PM[l.t].biz&&(s.cash>=v||(s.cash>=v*.2&&canBorrow(v*.8)))});if(l)L.push({k:'home',l})}
  if(s.cz.bj&&!s.cz.bj.done)L.push({k:'bj'});
  const pt=partner();if(pt&&pt.rel<30)L.push({k:'rel',p:pt});
  if(s.job&&s.perf<25)L.push({k:'perf'});
  if(s.study&&s.study.g<40)L.push({k:'grade'});
  if(!s.tour)L.unshift({k:'guide'});
  return L;
}
function legalHtml(){const L=s.legal;if(!jailed()&&!L.cases.length&&!L.rec.length)return '';
  const pc=c=>Math.round(CASES[c.t].conv*100);
  return `<div class="sec-h"><h2>Legal</h2><span>${jailed()?`<span class="dn">in jail for ${L.jail-s.day} more days</span>`:L.cases.length?`${L.cases.length} open case${L.cases.length>1?'s':''}`:'no open cases'}</span></div>
  ${L.cases.map(c=>{const K=CASES[c.t],f=K.fine(c.v),lc=lawCost(c);return `<div class="need"><div><div class="k hot">${30-(s.day-c.d)} days to answer</div><div class="t">${K.n}</div><div class="d">${K.d} ${K.crim?`If convicted: a fine of about ${fmt(f)}${K.jail>9?` and up to ${K.jail} days in jail`:K.jail?' and a few days in jail':''}, and a criminal record.`:`They want ${fmt(f)}.`} Odds of losing: about ${Math.round(pc(c)*.45)}% with a lawyer, ${Math.min(99,Math.round(pc(c)*1.15))}% on your own.</div></div>
   <div class="acts2"><button data-a="case" data-x="${c.id}" data-y="plead">${K.crim?'Plead guilty':'Settle'} · ${fmt(f*.6)}</button><button class="pri" data-a="case" data-x="${c.id}" data-y="lawyer" ${s.cash<lc?'disabled':''}>Hire a lawyer · ${fmt(lc)}</button><button data-a="case" data-x="${c.id}" data-y="self">Represent yourself</button></div></div>`}).join('')}
  ${L.rec.length?`<p class="mut" style="margin-top:var(--space-2xs)">Record: ${L.rec.map(r=>`${CASES[r.t].n.replace(/ charges?$/,'').toLowerCase()} (year ${dateOf(r.d).y})`).join(', ')}. ${crimes().length?'Convictions from the last 7 years hurt interviews and rule out police, teaching, nursing, law, medicine and flying.':'Old enough that employers no longer care.'}</p>`:''}`}
function needHtml(n){
  const row=(k,ti,d,acts,hot)=>`<div class="need"><div><div class="k ${hot?'hot':''}">${k}</div><div class="t">${ti}</div><div class="d">${d}</div></div><div class="acts2">${acts}</div></div>`;
  if(n.k==='dec'){const left=decDays()-(s.day-n.it.d);return row(`Decision · ${left} day${left===1?'':'s'} left`,n.e.t,n.e.d(s,n.it.a),n.e.ch.map((c,j)=>`<button data-a="pick" data-x="${n.it.id}" data-y="${j}">${c[0]}</button>`).join(''),1)}
  if(n.k==='case'){const c=n.c,K=CASES[c.t];return row(`Legal · ${30-(s.day-c.d)} days left`,K.n,`${K.d} Answer it on the Life screen, or it goes to trial with a public defender.`,`<button data-a="tab" data-x="life">Deal with it</button>`,1)}
  if(n.k==='su'){const u=s.su;return row('Startup',n.t==='offer'?`${SUST[u.st+1].n} offer for ${esc(u.n)}`:n.t==='acq'?`Someone wants to buy ${esc(u.n)}`:`${esc(u.n)} has ${suRunway(u)} days of cash left`,n.t==='offer'?`${fmt(u.offer.raise)} at a ${fmt(u.offer.pre)} valuation.`:n.t==='acq'?`${fmt(u.acq.v)} for the company. Your share: ${fmt(u.own*u.acq.v)}.`:'Raise money, cut staff or put in more of your own, or it shuts down.',`<button data-a="tab" data-x="work">Open</button>`,1)}
  if(n.k==='jail')return row('Jail',`${s.legal.jail-s.day} days left inside`,'No work, school, gigs or activities until you get out. Your money keeps working.','');
  if(n.k==='cond')return row('Health',`Untreated ${condName(n.c).toLowerCase()}`,CONDS[n.c.id].d+(['cancer','heart','diab','dep'].includes(n.c.id)?` If you do nothing, your doctor starts treatment in ${Math.max(1,30-(s.day-(n.c.dx??n.c.d)))} days.`:''),`<button data-a="tab" data-x="health">See Health</button>`,n.c.id==='heart'||n.c.id==='cancer');
  if(n.k==='till'){const f=n.full;return row('Business',f.length?(f.length===1?`${f[0]}'s till is full`:`${f.length} tills are full`):'Tills are filling up',f.length?`${f.join(' and ')} ${f.length===1?'has':'have'} stopped earning until you collect.`:'Collect before they stop earning.',`<span class="amt">${fmt(n.pend)}</span><button class="pri" data-a="colAll">Collect</button>`)}
  if(n.k==='mgr')return row('Worth it now',`Hire a manager for ${n.b.n}`,`It earns ${fmt(bizInc(n.b,s.biz[n.b.id]))} a day, but only while you keep collecting.`,`<button data-a="mgr" data-x="${n.b.id}">Hire for ${fmt(mgrCost(n.b))}</button>`);
  if(n.k==='low')return row(n.st==='hea'?'Health':'Mood',`${n.st==='hea'?'Health':'Happiness'} is low`,n.st==='hea'?'If it hits zero, your life ends.':'Unhappy people stop getting promoted, and their health slips.',n.a?`<button data-a="act" data-x="${n.a.id}">${n.a.n}${n.a.c?` · ${fmt(n.a.c)}`:''}</button>`:'');
  if(n.k==='home'){const k=PM[n.l.t],v=k.base*n.l.m*s.re.idx;return row('Save on rent',`You pay ${fmt(rentNow())} a day in rent`,`${k.n}, ${n.l.loc} is for sale for ${fmt(v)}. On a mortgage it would cost ${fmt(mpay(v*.8))} a day.`,`<button data-a="tab" data-x="home">See listings</button>`)}
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
      const gain=b.inc*((o.n+k)*bmul(o.n+k)-o.n*bmul(o.n))*s.legacy*bizPf(b),pb=gain>0?c/gain:Infinity;if(!best||pb<best.pb)best={b,k,c,pb,m:bmul(o.n+k)>bmul(o.n)?o.n+k:0}}}
  return best;
}
function personRow(p){
  const all=PACT_ORDER.filter(k=>PACTS[k].roles.includes(p.role)&&(!PACTS[k].show||PACTS[k].show(p))),main=['date','call','reconnect'].find(k=>all.includes(k)),open=openP===p.uid,lo=p.rel<30;
  const btn=k=>{const A=PACTS[k],w=Math.max(0,(p.c?.[k]||0)-s.day),cost=A.c?A.c(p):0,why=A.need?.(p);if(why)return `<span class="hint">${why}</span>`;
    return `<button class="${A.bad?'bad':k==='propose'||k==='baby'?'pri':''}" data-a="pp" data-x="${p.uid}" data-y="${k}" ${w||s.cash<cost?'disabled':''}>${typeof A.n==='function'?A.n(p):A.n}${cost?` · ${fmt(cost)}`:''}${w?` · ${w}d`:''}</button>`};
  return `<div class="prow"><div class="who"><span class="av">${esc(p.n[0])}</span><div><div class="pn">${esc(p.n)}</div><div class="mut" style="font-size:var(--text-xs)">${p.uid===s.best&&p.role==='friend'?'Best friend':ROLE[p.role]}${p.out?', moved out':''} · ${Math.max(0,Math.floor(ageOf(p)))}</div>${p.role==='child'&&p.k?`<div class="mut kstat">${kidStat(p)}</div>`:p.role==='boss'&&BOSSES[p.bt]?`<div class="mut kstat">${BOSSES[p.bt].n}</div>`:(p.role==='date'||p.role==='spouse')&&p.pt?`<div class="mut kstat">${persLine(p)}</div>`:(p.sp||p.nk||p.away||p.care)?`<div class="mut kstat">${[p.sp?`Married to ${esc(p.sp)}`:'',p.nk?`${p.nk} kid${p.nk>1?'s':''}`:'',p.away?'Moved away':'',p.care==='home'?'In a care home':p.care==='you'?'Lives with you':''].filter(Boolean).join(' · ')}</div>`:''}</div></div>
   <div class="close"><div class="top2"><span class="${lo?'dn':'mut'}">${closeWord(p.rel)}</span><span class="num">${Math.round(p.rel)}</span></div>${meter(p.rel,lo?'low':'')}</div>
   <div class="acts3">${main?btn(main):''}${all.length>1?`<button data-a="pmore" data-x="${p.uid}" aria-expanded="${open}">${open?'Less':'More'}</button>`:''}</div>
   ${open?`<div class="pmore">${all.filter(k=>k!==main).map(btn).join('')}</div>`:''}</div>`;
}
function bizRow(b,i,last){
  const o=s.biz[b.id]||{n:0,pend:0,mgr:0},n=o.n;if(i>last+1&&!n)return '';
  if(!n&&s.cash<b.cost)return `<div class="brow locked"><div><div class="nm">${b.n}</div><div class="ms">Earns ${fmt(b.inc*s.legacy)} a day each</div></div><span class="own num">0</span><span class="inc num">—</span><span>Opens at ${fmt(b.cost)}</span><div class="acts3"><button disabled>${fmt(b.cost-s.cash)} to go</button></div></div>`;
  const g=n?bizInc(b,o):0,nm=MILES.find(m=>m>n),mx=bmax(b,n),q=Math.min(bmode==='max'?mx:+bmode,mx),mc=mgrCost(b),full=n&&!o.mgr&&o.pend>=g*CAP*.999;
  const buy=q>=1?`<button class="pri" data-a="bbuy" data-x="${b.id}" data-y="${q}">Buy ${q} · ${fmt(bcost(b,n,q))}</button>`:`<button disabled>Buy 1 · ${fmt(bcost(b,n,1))}</button>`;
  const val=bizVal(b,o),frOk=n>=25&&o.mgr&&!o.fr;
  return `<div class="brow"><div><div class="nm">${b.n}${o.fr?' <span class="tag">franchised</span>':''}</div><div class="ms">${nm?`${meter(n/nm*100)}<span>${n} / ${nm} to +50%</span>`:'<span>Every milestone reached</span>'}</div>${n?`<div class="bx mut">Worth about ${fmt(val)} · <button class="link2" data-a="bsell" data-x="${b.id}">Sell</button>${frOk?` · <button class="link2" data-a="bfr" data-x="${b.id}" ${s.cash<frCost(b)?'disabled':''}>Franchise for ${fmt(frCost(b))}</button>`:''}</div>`:''}</div>
   <span class="own num">${n}<small class="m"> owned</small></span><span class="inc num ${g?'up':''}">${fmt(g)}<small class="m"> a day</small></span>
   <div class="till">${!n?'<span class="mut">Not open yet</span>':o.mgr?'<span class="mut">Managed, pays itself</span>':`<div class="top2"><span class="${full?'full':'mut'}">${full?'Full':'Filling'}</span><span class="num">${fmt(o.pend)}</span></div>${meter(o.pend/(g*CAP)*100,'warn')}`}</div>
   <div class="acts3">${n&&!o.mgr?`<button data-a="col" data-x="${b.id}" ${o.pend<.01?'disabled':''}>Collect</button><button data-a="mgr" data-x="${b.id}" ${s.cash<mc?'disabled':''}>Manager ${fmt(mc)}</button>`:''}${buy}</div></div>`;
}
function bracketHtml(kind,t,now,avg,f){ // take profit / stop loss panel for a holding
  const key=`${kind}:${t}`,H=kind==='coin'?s.wallet[t]:s.port[t],d=bd[key]||{},val=w=>d[w]!==undefined?d[w]:H[w]??'',vs=v=>v?` <span class="${v>=avg?'up':'dn'}">${pct(v/avg-1)} vs your cost</span>`:'';
  return `<div class="brk"><h4>Take profit and stop loss</h4>
   <p class="mut sess">${H.tp||H.sl||H.trail?`Active: ${[H.tp?`take profit at <b>${f(H.tp)}</b>${vs(H.tp)}`:'',H.sl?`stop loss at <b>${f(H.sl)}</b>${vs(H.sl)}`:'',H.trail?`trailing stop at <b>${f(H.hw*(1-H.trail))}</b>`:''].filter(Boolean).join(', ')}. Whichever is hit first sells the whole position and cancels the other.`:'Sell the whole position automatically when the price reaches a target, or falls to a floor.'}</p>
   <div class="brow2"><label>Take profit at<input data-bk="${key}" data-w="tp" type="number" inputmode="decimal" step="any" min="0" value="${val('tp')}" placeholder="above ${f(now)}"></label><div class="row">${['.05','.1','.25'].map(x=>`<button data-a="bq" data-x="${key}" data-y="tp:${x}">+${x*100}%</button>`).join('')}</div></div>
   <div class="brow2"><label>Stop loss at<input data-bk="${key}" data-w="sl" type="number" inputmode="decimal" step="any" min="0" value="${val('sl')}" placeholder="below ${f(now)}"></label><div class="row">${['-.03','-.05','-.1'].map(x=>`<button data-a="bq" data-x="${key}" data-y="sl:${x}">${x*100}%</button>`).join('')}</div></div>
   <div class="brow2"><span class="mut sess">Trailing stop${H.trail?`: ${H.trail*100}% under the high of ${f(H.hw)}, so it sells at ${f(H.hw*(1-H.trail))}. It rises with the price and never falls.`:', which follows the price up and never down'}</span><div class="row">${[0,.05,.1,.2].map(x=>`<button class="${(H.trail||0)===x?'on':''}" data-a="btrail" data-x="${key}" data-y="${x}">${x?x*100+'%':'Off'}</button>`).join('')}</div></div>
   <div class="row"><button class="pri" data-a="bset" data-x="${key}">Save</button>${H.tp||H.sl||H.trail?`<button data-a="bclr" data-x="${key}">Remove all</button>`:''}<span class="mut sess">Quick buttons set a level from the current price.</span></div></div>`;
}
function shortTicket(k,live){ // sell borrowed shares now, buy them back later
  const t=k.t,S=s.shorts[t],sh=ot.side==='short',n=ot.qty,f=fillAt(t,sh?-n:n),v=n*f.avg,A=acct(),need=A.init+(sh?v*(k.pn?1:.5):0),okS=live&&(sh?shortable(t)&&A.eq-n*(s.px[t].p-f.avg)>=need:S&&S.sh>=n),[bid,ask]=bidAsk(t);
  return `<dl><dt>Bid / Ask</dt><dd class="num">${qfmt(bid)} / ${qfmt(ask)}</dd><dt>Borrow fee</dt><dd class="num">${pctA(borrowFee(t))} a year</dd>${S?`<dt>You're short</dt><dd class="num">${big(S.sh)} at ${qfmt(S.px)}</dd>`:''}</dl>
   <div class="qty"><button data-a="qty" data-x="-" aria-label="Fewer shares">−</button><b class="num">${big(n)}</b><button data-a="qty" data-x="+" aria-label="More shares">+</button></div>
   <div class="presets">${[['10','10'],['1000','1K'],['100000','100K']].map(([v,l])=>`<button data-a="qset" data-x="${v}">${l}</button>`).join('')}<button data-a="qset" data-x="max">Max</button></div>
   <dl><dt>Estimated ${sh?'proceeds':'cost'}</dt><dd class="num">${fmt(v)}</dd><dt>Account equity</dt><dd class="num">${fmt(A.eq)}</dd>${sh?`<dt>Equity needed</dt><dd class="num">${fmt(need)}</dd>`:''}</dl>
   <button class="place ${sh?'sell':'buy'}" data-a="order" ${okS?'':'disabled'}>${sh?'Short':'Buy to cover'} ${big(n)} ${t}</button>
   <p class="mut" style="font-size:var(--text-xs)">${!live?`The market is closed. It opens ${nextOpen()}.`:sh?!shortable(t)?'Penny stocks under $1 can\'t be shorted.':!okS?`Not enough equity. Shorting needs ${k.pn?'100%':'50%'} of the value in equity.`:`You profit if the price falls. If it rises, your loss has no ceiling. You pay the borrow fee daily and any dividends.`:!S?`You aren't short ${t}.`:!okS?`You're only short ${big(S.sh)}.`:'Buying back closes the short.'}</p>`;
}
function marginPanel(){
  if(!onMargin())return '';const A=acct(),ex=A.eq-A.maint,sh=Object.keys(s.shorts);
  return `<h3>Margin account</h3><div class="stats4">${[['Equity',fmt(A.eq)],['Margin loan',fmt(s.mloan)],['Loan rate',pctA(mRate())],['Maintenance',fmt(A.maint)],['Cushion',`<span class="${ex<A.maint*.2?'dn':''}">${fmt(ex)}</span>`],['Shorts',fmt(A.smv)]].map(([l,v])=>`<div><span>${l}</span><b class="num">${v}</b></div>`).join('')}</div>
  ${ex<A.maint*.2?'<p class="dn sess">Close to a margin call. Add cash, repay the loan or cut positions.</p>':''}
  ${s.mloan>0?`<div class="row" style="margin-top:var(--space-2xs)"><button data-a="repay" data-x="10000" ${s.cash<1?'disabled':''}>Repay ${fmt(Math.min(1e4,s.mloan))}</button><button data-a="repay" data-x="all" ${s.cash<1?'disabled':''}>Repay all you can</button></div>`:''}
  ${sh.length?`<div class="scroll"><table class="ledger"><thead><tr><th>Short</th><th class="r">Shares</th><th class="r">Sold at</th><th class="r">Last</th><th class="r">P/L</th><th class="r">Fee</th><th></th></tr></thead><tbody>
   ${sh.map(t=>{const S=s.shorts[t],pl=(S.px-s.px[t].p)*S.sh;return `<tr class="pick ${t===sel?'on':''}" data-a="sel" data-x="${t}"><td><b>${t}</b></td><td class="r num">${big(S.sh)}</td><td class="r num">${qfmt(S.px)}</td><td class="r num">${qfmt(s.px[t].p)}</td><td class="r"><span class="num ${pl>=0?'up':'dn'}">${pl>=0?'+':''}${fmt(pl)}</span></td><td class="r num">${pctA(borrowFee(t))}</td><td class="act"><button data-a="sel" data-x="${t}">Open</button></td></tr>`}).join('')}</tbody></table></div>`:''}`;
}
function optionsHtml(k,live){
  const ex=optExpiries();if(!ex.includes(oxp))oxp=ex[0];const S=s.px[k.t].p,Ks=optStrikes(S),mine=s.opts;
  const cell=(type,K)=>{const q=optQuote(k,type,K,oxp),c=q.ask*100*oq,itm=type==='call'?K<S:K>S;return `<td class="r num ${itm?'itm':''}">${qfmt(q.bid)} / ${qfmt(q.ask)}<div class="sub">Δ ${q.delta.toFixed(2)}</div></td><td class="act ${itm?'itm':''}"><button data-a="obuy" data-x="${type}|${K}|${oxp}" ${!live||c>s.cash?'disabled':''} title="${oq} contract${oq>1?'s':''} for ${fmt(c)}">Buy</button></td>`};
  return `<div class="ochain"><p class="mut sess">An option is the right to buy (a call) or sell (a put) 100 shares at the strike price until expiry. Calls pay if the price rises past the strike, puts if it falls below it. The most you can lose is what you pay.${s.px[k.t].er<=ex[ex.length-1]?` Earnings on ${dstr(s.px[k.t].er)} are priced in, so options expiring after that cost more until the report.`:''}</p>
   <div class="row" style="margin:var(--space-2xs) 0"><span class="mut sess">Expires</span>${ex.map(d=>`<button class="${oxp===d?'on':''}" data-a="oexp" data-x="${d}">${MON[dateOf(d).m]} ${dateOf(d).dd} · ${d-s.day}d</button>`).join('')}<span class="mut sess" style="margin-left:auto">Contracts</span>${[1,5,10,50].map(n=>`<button class="${oq===n?'on':''}" data-a="oqn" data-x="${n}">${n}</button>`).join('')}</div>
   <div class="scroll"><table class="ledger chain"><thead><tr><th class="r">Calls: bid / ask</th><th></th><th class="c">Strike</th><th class="r">Puts: bid / ask</th><th></th></tr></thead><tbody>
   ${Ks.map(K=>`<tr>${cell('call',K)}<td class="c num"><b>${qfmt(K)}</b></td>${cell('put',K)}</tr>`).join('')}</tbody></table></div>
   <p class="mut sess">Prices are per share; a contract is 100 shares. Last ${qfmt(S)}. Highlighted rows are in the money.${live?'':` Options trade while the market is open; it opens ${nextOpen()}.`}</p>
   ${mine.length?`<h3>Your options</h3><div class="scroll"><table class="ledger"><thead><tr><th>Contract</th><th class="r">Qty</th><th class="r">Paid</th><th class="r">Worth</th><th class="r">P/L</th><th class="r">Break-even</th><th></th></tr></thead><tbody>${mine.map(o=>{const q=optQuote(SK[o.t],o.type,o.K,o.exp),v=q.bid*100*o.n,be=o.type==='call'?o.K+o.cost/100/o.n:o.K-o.cost/100/o.n;
     return `<tr><td><b>${optLabel(o)}</b><div class="sub">${o.exp-s.day} days left</div></td><td class="r num">${o.n}</td><td class="r num">${fmt(o.cost)}</td><td class="r num">${fmt(v)}</td><td class="r"><span class="num ${v>=o.cost?'up':'dn'}">${pct(v/o.cost-1)}</span></td><td class="r num">${qfmt(be)}</td><td class="act"><button data-a="osell" data-x="${o.id}" ${live?'':'disabled'}>Sell</button></td></tr>`}).join('')}</tbody></table></div>`:''}</div>`;
}
const ownPct=v=>(v*100).toFixed(v<.001?4:v<.01?3:1)+'%';
function companyHtml(k,live){
  const f=fund(k),q=s.px[k.t],H=q.h,me=ownFrac(k.t),c=controls(k.t),n=esc(nameOf(k.t)),st=(l,v)=>`<div><span>${l}</span><b class="num">${v}</b></div>`;
  const nv=Math.min(30,H.length),avgVol=Array.from({length:nv},(_,i)=>volAt(k,H.length-1-i)).reduce((a,v)=>a+v,0)/nv,need=ctrlNeed(k.t),nc=need?need*fillAt(k.t,need).avg:0;
  const gc=.02*f.cap,gw=cdLeft('grow_'+k.t),dw=cdLeft('sdiv_'+k.t);
  return `<h3>About ${n}</h3><p class="about">${f.about}${q.ipo!=null?` Listed ${s.day-q.ipo} days ago, after the last company on this ticker went bankrupt.`:''}</p>
  <div class="stats4">${st('CEO',f.ceo)}${st('Founded',f.yr)}${st('Headquarters',f.hq)}${st('Employees',big(f.emp))}</div>
  <h3>Financials <span class="mut sess">last 12 months, estimated</span></h3>
  <div class="stats4">${st('Revenue',fmt(f.rev))}${st('Net income',`<span class="${f.ni>=0?'':'dn'}">${fmt(f.ni)}</span>`)}${st('EPS',(f.eps<0?'-':'')+qfmt(Math.abs(f.eps)))}${st('Profit margin',pct(f.m))}${st('P/S',f.ps.toFixed(1))}${st('Shares out',big(shOf(k.t)))}${st('Float',big(shOf(k.t)*f.fl))}${st('Avg volume',big(avgVol))}${st('Beta',k.b.toFixed(2))}${st('Div yield',k.div?(k.div*100).toFixed(1)+'%':'—')}</div>
  <h3>Earnings and dividends</h3>
  <p class="about">Earnings next move the stock at the open on ${dstr(q.er)}, reported ${ph(k.t,41)<.5?'after the close the evening before':'that morning'}. The estimate is ${pfmtS(epsEst(k))} a share.${q.last?` Last quarter it ${q.last.act>=q.last.est?'beat':'missed'} with ${pfmtS(q.last.act)} against ${pfmtS(q.last.est)}, and the stock moved <span class="${q.last.mv>=0?'up':'dn'}">${pct(q.last.mv)}</span>.`:''}${k.div?` It pays ${qfmt(q.p*k.div/4)} a share each quarter. The next ex-dividend date is ${dstr(q.nd)}; own the stock before then to get paid, and expect the price to drop by the payout that morning.`:' It pays no dividend.'}</p>
  <h3>Shareholders</h3>
  <table class="ledger holders"><tbody>${holders(k).map(([h,v])=>`<tr class="${h==='You'?'me':''}"><td>${esc(h)}</td><td class="r num">${ownPct(v)}</td></tr>`).join('')}</tbody></table>
  <div class="ctrl">${c?`<p><b>You control ${n}</b> with ${ownPct(me)} of the shares. ${f.ni>0?`Its profits pay you <b class="num">${fmt(me*f.ni/365)}</b> a day, in place of dividends.`:`It loses ${fmt(-f.ni/365)} a day, so there are no profits to take yet.`}</p>
    <div class="row"><button data-a="grow" data-x="${k.t}" ${gw||s.cash<gc?'disabled':''}>Invest in growth · ${fmt(gc)}${gw?` · ${gw}d`:''}</button><button data-a="sdiv" data-x="${k.t}" ${dw?'disabled':''}>Special dividend · +${fmt(.1*f.cap*me)}${dw?` · ${dw}d`:''}</button><button data-a="rename" data-x="${k.t}">Rename</button></div>
    <p class="mut sess">Growth money makes the stock climb faster for a year. A special dividend pays out 10% of the company, and the price drops by the same amount. Sell below 50% and you lose control.</p>`
   :`<p>Own more than half of ${n} to take control and collect its profits. ${me?`You hold ${ownPct(me)}.`:''}</p>
    <div class="row"><button class="pri" data-a="ctrl" data-x="${k.t}" ${!live||nc>s.cash?'disabled':''}>Buy a controlling stake · ${fmt(nc)}</button>${!live?`<span class="mut sess">The market opens ${nextOpen()}.</span>`:nc>s.cash?`<span class="mut sess">You need ${fmt(nc-s.cash)} more.</span>`:''}</div>
    <p class="mut sess">That is ${big(need)} shares. Buying this many pushes the price up as you go.</p>`}</div>`;
}
function bankView(){
  const F=s.fin,E=s.eco,px=fundPx(),fv=F.fu*px,live=mktOpen(),room=iraRoom(),old=age()>=60,btn=(a,x,l,dis)=>`<button data-a="${a}" data-x="${x}" ${dis?'disabled':''}>${l}</button>`;
  return `<section class="lede"><div><h2 class="headline">Bank</h2>
    <p class="dek">The central bank's rate is <b>${pctA(E.r)}</b> and inflation is <b>${pctA(E.pi)}</b>. Cash in your pocket loses that much a year. Savings earn <b>${pctA(savRate())}</b>, the index fund tracks the whole market, and bonds lock in today's rates.</p></div>
    <div class="side"><p class="mut"><span class="figure">${fmt(finVal())}</span><br>in the bank and invested</p></div></section>
  <div class="sec-h"><h2>Savings account</h2><span>${pctA(savRate())} a year, paid daily</span></div>
  <p><b class="num">${fmt(F.sav)}</b> saved.${savRate()<E.pi?' <span class="mut">Right now that trails inflation, so savings are slowly losing buying power.</span>':''}</p>
  <div class="quick">${['1000','10000','100000'].map(x=>btn('sdep',x,`Deposit ${fmt(+x)}`,s.cash<+x)).join('')}${btn('sdep','all','Deposit all cash',s.cash<1)}${btn('swd','1000',`Withdraw ${fmt(1000)}`,F.sav<1000)}${btn('swd','all','Withdraw all',F.sav<1)}</div>
  <div class="sec-h"><h2>Hustle 500 index fund</h2><span>${qfmt(px)} a unit · ${pct(idxDay())} today</span></div>
  <p>${F.fu?`You hold <b class="num">${fmt(fv)}</b>, <span class="num ${fv>=F.fc?'up':'dn'}">${pct(fv/F.fc-1)}</span> on the ${fmt(F.fc)} you put in.`:'The whole market in one purchase: every company in the Hustle 500, weighted by size.'} It charges 0.03% a year and pays about 1.5% a year in dividends each quarter.${live?'':` <span class="mut">It trades while the market is open; it opens ${nextOpen()}.</span>`}</p>
  <div class="quick">${['1000','10000','100000'].map(x=>btn('fbuy',x,`Buy ${fmt(+x)}`,!live||s.cash<+x)).join('')}${btn('fbuy','all','Invest all cash',!live||s.cash<1)}${btn('fsell','.5','Sell half',!live||!F.fu)}${btn('fsell','all','Sell all',!live||!F.fu)}</div>
  <div class="sec-h"><h2>Government bonds</h2><span>safe, and paid daily</span></div>
  <div class="scroll"><table class="ledger"><thead><tr><th>Bond</th><th class="r">Yield</th><th></th></tr></thead><tbody>
   ${[[1,'1-year bill'],[10,'10-year note']].map(([n,l])=>`<tr><td><b>${l}</b><div class="sub">${n===1?'Follows the central bank closely.':'Locks in a rate for a decade. If rates rise, its price falls if you sell early.'}</div></td><td class="r num">${pctA(bondY(n))}</td><td class="act">${['10000','100000','1000000'].map(x=>`<button data-a="bnd" data-x="${n}" data-y="${x}" ${s.cash<+x?'disabled':''}>${fmt(+x)}</button>`).join('')}</td></tr>`).join('')}
  </tbody></table></div>
  ${F.bonds.length?`<div class="scroll"><table class="ledger"><thead><tr><th>You hold</th><th class="r">Rate</th><th class="r">Matures</th><th class="r">Worth today</th><th></th></tr></thead><tbody>${F.bonds.map((b,i)=>{const v=bondVal(b);return `<tr><td>${fmt(b.amt)} ${b.term}-year</td><td class="r num">${pctA(b.rate)}</td><td class="r">${dstr(b.mat)}, year ${dateOf(b.mat).y}</td><td class="r num ${v>=b.amt?'':'dn'}">${fmt(v)}</td><td class="act"><button data-a="bndsell" data-x="${i}">Sell</button></td></tr>`}).join('')}</tbody></table></div>`:''}
  <div class="sec-h"><h2>Retirement account</h2><span>invested in the index fund</span></div>
  <p><b class="num">${fmt(iraVal())}</b>${F.iraC?`, from ${fmt(F.iraC)} put in`:''}. You can add ${fmt(room)} more this year. ${s.job?'Your employer adds 50 cents for every dollar, up to 6% of your pay.':'Get a job and your employer will match part of what you put in.'} ${old?'You are old enough to take money out freely.':'Taking money out before 60 costs a 10% penalty.'}</p>
  <p class="mut" style="margin-top:var(--space-2xs)">Automatically put in this much of your pay each day</p>
  <div class="seg2" style="display:inline-flex;margin-top:4px">${[0,.03,.06,.1,.15].map(x=>`<button class="${F.iraPct===x?'on':''}" data-a="irapct" data-x="${x}">${x?x*100+'%':'None'}</button>`).join('')}</div>
  <div class="quick" style="margin-top:var(--space-xs)">${['1000','5000'].map(x=>btn('iradep',x,`Add ${fmt(+x)}`,s.cash<+x||room<+x)).join('')}${btn('iraw','10000',`Take out ${fmt(10000)}`,iraVal()<10000)}${btn('iraw','all','Take out everything',iraVal()<1)}</div>
  ${howto('A savings account is safe and follows interest rates. The index fund owns the whole market, so it rises about 7% a year on average but can fall by half in a bad bear market. Bonds pay a fixed rate; a 1-year bill is nearly cash, a 10-year note pays more but its price drops when rates rise. The retirement account grows in the index fund, gets your employer\'s match, and is meant to be left alone until 60.')}
  ${creditHtml()}`;
}
function taxHtml(){
  const T=s.tax,y=dateOf(s.day).y,cur=T.y===y,pp=cur?taxParts(T):{ord:0,lt:0},inc=pp.ord+pp.lt,last=T.hist[y-1];
  const row=(l,v)=>`<tr><td>${l}</td><td class="r num">${fmt(v)}</td></tr>`;
  return `<div class="sec-h"><h2>Taxes this year</h2><span>year ${y}</span></div>
  <table class="ledger budget"><tbody>${row('Income, business profit, interest',cur?T.ord+Math.max(0,T.gam):0)}${row('Short-term gains (held a year or less)',cur?T.st:0)}${row('Long-term gains and dividends',cur?T.lt:0)}${row('Taxable after the standard deduction',Math.max(0,inc-14600*s.eco.P))}<tr><td><b>Tax paid so far</b></td><td class="r num"><b>${fmt(cur?T.paid:0)}</b></td></tr></tbody></table>
  <p class="mut" style="margin-top:var(--space-2xs)">Your next dollar of income is taxed at <b>${Math.round(margRate()*100)}%</b>${inc>0&&cur?`, and you're paying ${pctA((T.paid)/Math.max(1,inc))} of your taxable income overall`:''}. Hold investments longer than a year and the gain is taxed at 0-20% instead. Money you put in your retirement account comes off your taxable income.${last?` Last year you paid ${fmt(last.tax)}.`:''}</p>`;
}
const VIEWS={
office(){return polHtml()},
legacy(){return legacyHtml()},
health(){
  const f=s.conds.filter(c=>!c.hid),I=INS[s.ins],m=medYear(),P=s.eco.P,doc=AM.doc,w=cdLeft('doc');
  const st=c=>CONDS[c.id].acute?`${c.left} day${c.left===1?'':'s'} to go`:c.tx>1?`In treatment · ${c.tx-s.day}d left`:c.tx===1?'<span class="up">Treated</span>':'<span class="dn">Untreated</span>';
  const btn=c=>{const K=CONDS[c.id];if(c.tx>1)return '';
    if(K.med&&!K.tc)return c.tx?`<button data-a="untreat" data-x="${c.id}">Stop</button>`:`<button class="pri" data-a="treat" data-x="${c.id}">${K.tx} · about ${fmt(K.med*P*(1-I.cov))}/day</button>`;
    if(c.tx)return '<span class="mut">On medication</span>';if(c.cd>s.day)return `<span class="mut">Try again in ${c.cd-s.day}d</span>`;
    const o=oopOf(txCost(c)).out;return `<button class="pri" data-a="treat" data-x="${c.id}" ${s.cash<o?'disabled':''}>${K.tx||'Start treatment'} · you pay ${fmt(o)}</button>`};
  return `<section class="lede">
    <div><h2 class="headline">Health</h2><p class="dek">Health ${Math.round(s.st.hea)} of 100. ${f.length?`You're dealing with ${f.map(c=>condName(c).toLowerCase()).join(', ')}.`:'Nothing wrong that anyone knows of.'} Some illnesses stay hidden until a check-up finds them, and the earlier they're caught the cheaper they are to treat.</p></div>
    <div class="side"><p class="mut">Get checked</p><div class="row"><button data-a="act" data-x="doc" ${w||s.cash<doc.c?'disabled':''}>${doc.n} · ${fmt(doc.c)}${w?` · ${w}d`:''}</button></div></div>
  </section>
  <div class="sec-h"><h2>Conditions</h2><span>${f.length||'none'}</span></div>
  ${f.length?`<table class="ledger"><tbody>${f.map(c=>`<tr><td><b>${condName(c)}</b><div class="mut">${CONDS[c.id].d}</div></td><td>${st(c)}</td><td class="act">${btn(c)}</td></tr>`).join('')}</tbody></table>`:'<p class="mut">You are healthy. Keep it that way: exercise, see a doctor now and then, and don\'t let your mood sink too low for too long.</p>'}
  ${viceHtml()}
  <div class="sec-h"><h2>Insurance</h2><span>this year: ${fmt(m.oop)} paid out of pocket</span></div>
  <div class="acards">${Object.entries(INS).filter(([k])=>k!=='va'||isVet()).map(([k,x])=>`<button class="acard${s.ins===k?' on':''}" data-a="ins" data-x="${k}" aria-pressed="${s.ins===k}"><b>${x.n}</b><span>${x.d}</span><small>${insPrem(k)?`${fmt(insPrem(k))} a day`:'Free'}${s.ins===k?' · your plan':''}</small></button>`).join('')}</div>
  ${I.ded?`<p class="mut" style="margin-top:var(--space-2xs)">Deductible used: ${fmt(m.ded)} of ${fmt(I.ded*P)}. Out-of-pocket cap: ${fmt(I.cap*P)}.</p>`:''}
  ${howto('Every day there is a small chance of getting ill, and it grows with age, poor health and low mood. Colds and injuries pass on their own. Chronic conditions stay, draining your health and happiness until treated. Diabetes and cancer can go unnoticed for a long time, so a check-up every year or so is cheap insurance. Heart disease and late-stage cancer can kill you. Insurance pays most of your medical bills after a yearly deductible.')}`;
},
hobby(){
  const P=s.eco.P,H=HOBS.map(h=>{const k=hobSk(h.id),w=cdLeft('h_'+h.id),ws=cdLeft('hs_'+h.id),need=h.need||30,x=s.hob[h.id];
    return `<div class="acard hcard"><b>${h.n}</b><span>${h.perk}</span><span class="hsk">${meter(k)} <b class="num">${Math.round(k)}</b>${x&&s.day-x.last>30?' <em class="dn">rusty</em>':''}</span>
     <div class="row"><button data-a="hob" data-x="${h.id}" ${w||s.cash<h.c*P?'disabled':''}>Practice${h.c?` · ${fmt(h.c*P)}`:''}${w?` · ${w}d`:''}</button>${k>=need?`<button data-a="hshow" data-x="${h.id}" ${ws?'disabled':''}>${h.show}${ws?` · ${ws}d`:''}</button>`:`<small>${h.show} at skill ${need}</small>`}</div></div>`}).join('');
  return `<section class="lede solo"><div><h2 class="headline">Hobbies and pets</h2><p class="dek">Hobbies lift your mood, and once you're good they open doors: gigs, commissions, royalties, prizes, and an edge in interviews. Skills fade if you leave them for more than a month.</p></div></section>
  <div class="sec-h"><h2>Hobbies</h2><span>practice every couple of days</span></div>
  <div class="acards">${H}</div>
  <div class="sec-h"><h2>Pets</h2><span>${s.pets.length?`${s.pets.length} of 5`:'none yet'}</span></div>
  ${s.pets.length?`<table class="ledger"><tbody>${s.pets.map(p=>`<tr><td><b>${esc(p.n)}</b> <span class="mut">${PTM[p.t].n.replace(' tank','')}, ${Math.floor((s.day-p.b)/365)} years old</span></td><td class="r">${fmt(PTM[p.t].up*P)}/day</td><td class="act">${p.t==='fish'?'':`<button data-a="petplay" data-x="${p.uid}" ${(p.cd||0)>s.day?'disabled':''}>${p.t==='dog'?'Walk':p.t==='horse'?'Ride':'Play'}</button>`}<button data-a="rehome" data-x="${p.uid}">Rehome</button></td></tr>`).join('')}</tbody></table>`:''}
  <div class="acards" style="margin-top:var(--space-xs)">${PETS.map(k=>`<button class="acard" data-a="adopt" data-x="${k.id}" ${s.pets.length>=5||s.cash<k.c*P?'disabled':''}><b>${k.id==='fish'?'Get a fish tank':'Adopt a '+k.n.toLowerCase()}</b><span>+${(k.hap*100).toFixed(1)} happiness a day${k.hea?', walks keep you healthier':''}${k.fame?', and people notice':''}. Lives about ${k.life} years.</span><small>${fmt(k.c*P)} · then ${fmt(k.up*P)} a day</small></button>`).join('')}</div>
  ${howto('Practice raises a skill quickly at first, then more slowly. Smarter people learn faster. At skill 30 a hobby can earn: gigs and freelance work pay by skill, paintings sell for more if you have followers, and a book pays royalties every day for a year. Cooking cuts your grocery bill, and coding, cooking and painting help interviews in tech, food and creative jobs. Pets cost a little every day, lift your mood, and one day they will leave you. Vet bills happen.')}`;
},
bank(){return bankView()},
dash(){
  const f=flows(),N=needs(),net=f.job+f.biz+f.pend+f.spon+f.rent+f.own-f.exp-f.mort-f.tax,h=s.nwh||[];
  const parts=[['Cash',Math.max(0,s.cash)],['Businesses',bizWorth()],['Stocks',Object.entries(s.port).reduce((a,[k,o])=>a+o.sh*s.px[k].p,0)+optVal()],['Crypto',walletVal()],['Bank',s.fin.sav+s.fin.fu*fundPx()+s.fin.bonds.reduce((a,b)=>a+bondVal(b),0)],['Retirement',iraVal()],['Property',s.props.reduce((a,p)=>a+Math.max(0,pval(p)-p.loan),0)],['Cars',s.cars.reduce((a,c)=>a+c.v,0)],['Lifestyle',Object.keys(s.own).reduce((a,k)=>a+SM[k].cost*.6,0)]].map((x,i)=>[...x,`var(--cat-${i+1})`]).filter(x=>x[1]>=1);
  const tot=parts.reduce((a,x)=>a+x[1],0)||1,gl=goalsLeft().slice(0,3);
  return `<section class="lede solo"><div><h2 class="headline">${esc(s.name)}, ${Math.floor(age())}</h2><p class="dek">${esc(s.name)} ${lifeLine()}</p></div></section>
  <div class="sec-h"><h2>Needs you</h2><span>${N.length?`${N.length} thing${N.length>1?'s':''}`:'all clear'}</span></div>
  <div class="needs">${N.length?N.map(needHtml).join(''):'<p class="mut" style="padding:var(--space-sm) 0">Nothing needs you right now. Your money is working.</p>'}</div>
  ${(T=>T.length?`<div class="sec-h"><h2>Next steps</h2><span>suggestions</span></div><div class="needs">${T.map(tipHtml).join('')}</div>`:'')(tips())}
  <div class="sec-h"><h2>Quick actions</h2></div>
  <div class="quick"><button class="pri" data-a="gig" ${gigsLeft()?'':'disabled'}>Take a gig · +${fmt(gig())} · ${gigsLeft()} left today</button>${ACTS.filter(a=>!a.show||a.show()).map(a=>{const w=cdLeft(a.id);return `<button data-a="act" data-x="${a.id}" ${w||s.cash<a.c?'disabled':''}>${a.n}${a.c?` · ${fmt(a.c)}`:''}${w?` · in ${w}d`:''}</button>`}).join('')}${cdLeft('post')?'':'<button data-a="post" data-x="meme">Post a meme</button>'}</div>
  <section class="snap">
   <div><div class="sec-row"><h2>Net worth</h2><button class="link2" data-a="rich">${(()=>{const L=richList(),me=L.findIndex(x=>x.me);return me<20?`#${me+1} on the rich list`:'Rich list'})()}</button>${h.length>1?`<span class="${h.at(-1)>=h[0]?'up':'dn'}">${h.at(-1)>=h[0]?'+':''}${fmt(h.at(-1)-h[0])} over ${h.length-1} weeks</span>`:''}</div>
    ${h.length>1?nwChart(h):'<p class="mut" style="margin-top:var(--space-xs)">The chart fills in after a couple of weeks.</p>'}
    <p class="mut" style="margin-top:var(--space-2xs)">Earning ${sign(net)} a day: salary ${fmt(f.job)}, businesses ${fmt(f.biz+f.pend)}${f.rent?`, rent ${fmt(f.rent)}`:''}${f.spon?`, sponsors and ads ${fmt(f.spon)}`:''}${f.own?`, companies ${fmt(f.own)}`:''}, costs −${fmt(f.exp+f.mort)}, tax about −${fmt(f.tax)}.</p></div>
   <div><h2>Where it sits</h2><div class="stack">${parts.map(x=>`<span style="width:${x[1]/tot*100}%;background:${x[2]}"></span>`).join('')}</div>
    <div class="legend">${parts.map(x=>`<div><i style="background:${x[2]}"></i>${x[0]}<b>${fmt(x[1])}</b></div>`).join('')}</div></div>
  </section>
  <div class="sec-h"><h2>The economy</h2><span class="${s.eco.rec?'dn':s.eco.g>.15?'up':''}">${ecoLabel()}</span></div>
  <div class="stats4 eco">${[['Unemployment',s.eco.u],['Inflation',s.eco.pi],['Interest rate',s.eco.r],['Mortgage rate',mrate()]].map(([l,v])=>`<div><span>${l}</span><b class="num">${pctA(v)}</b></div>`).join('')}<div><span>Prices since you started</span><b class="num">${pct(s.eco.P-1)}</b></div></div>
  <div class="sec-h"><h2>Goals</h2><span>${Object.keys(s.goals).length} of ${GOALS.length} reached</span><button class="link2" data-a="goals">See all</button></div>
  <div class="glist">${gl.map(({g,c,t})=>`<div><b>${g.n}</b><span class="mut">${g.d}</span><small>${goalProg(g,c,t)}</small></div>`).join('')||'<p class="mut">Every goal is done. The family legend is complete.</p>'}</div>
  ${lbHtml()}`;
},
life(){
  const f=flows(),rows=[[spouseInc()?'Salary, pension and your spouse':'Salary and pension',f.job],['Managed businesses',f.biz],['Tills to collect',f.pend],['Sponsors, ads and royalties',f.spon],['Companies you control',f.own],['Rent from tenants',f.rent],['Loan payments',-f.mort],['Income tax, about',-f.tax],[`Living costs${homeP()?'':', rent included'}`,-f.exp]].filter(r=>Math.abs(r[1])>=.01);
  return `<section class="lede solo"><div><h2 class="headline">${esc(s.name)}, ${Math.floor(age())}</h2><p class="dek">${esc(s.name)} ${lifeLine()}</p>${s.tr?.length?`<p class="mut">${s.tr.map(t=>`<b>${TRAITS[t].n}</b>: ${TRAITS[t].d}`).join(' · ')}</p>`:''}</div></section>
  ${storyHtml()}
  <div class="sec-h"><h2>Activities</h2><span>each one has a cooldown</span></div>
  <div class="acards">${ACTS.filter(a=>!a.show||a.show()).map(a=>{const w=cdLeft(a.id);return `<button class="acard" data-a="act" data-x="${a.id}" ${w||s.cash<a.c?'disabled':''}><b>${a.n}</b><span>${a.d}</span><small>${a.c?fmt(a.c):'Free'}${w?` · ready in ${w}d`:''}</small></button>`}).join('')}</div>
  ${travelHtml()}
  ${styleHtml()}
  <div class="sec-h"><h2>Money in and out</h2><span>a day</span></div>
  <table class="ledger budget"><tbody>${rows.map(([n,v])=>`<tr><td>${n}</td><td class="r">${sign(v)}</td></tr>`).join('')}<tr><td><b>Net</b></td><td class="r"><b>${sign(rows.reduce((a,r)=>a+r[1],0))}</b></td></tr></tbody></table>
  ${legalHtml()}
  ${taxHtml()}`;
},
work(){
  const J=job(),yrs=Object.entries(s.xp).filter(([,d])=>d>=30).sort((a,b)=>b[1]-a[1]),toPromo=120-s.jobDays%120;
  const wbtn=(k,extra='')=>{const W=WORK[k],w=Math.max(0,(s.cd['w_'+k]||0)-s.day);return `<button data-a="work" data-x="${k}" ${w||s.cash<(W.c||0)?'disabled':''}>${W.n}${W.c?` · ${fmt(W.c)}`:''}${extra}${w?` · in ${w}d`:''}</button>`};
  return `<section class="lede">
    <div><h2 class="headline">${J?jobTitle():s.su?`Founder of ${esc(s.su.n)}`:s.pension?'Retired':'Out of work'}</h2>
     <p class="dek">${J?`Paid <b class="num">${fmt(jobPay())}</b> a day in ${FIELD[J.fld]}. ${topRank()?'You are at the top of this ladder. Switch jobs to earn more.':s.perf>=promoNeed()?`On track for promotion in ${toPromo} days.`:`Promotion review in ${toPromo} days. You need a performance of ${promoNeed()}.`}`:s.su?`Your startup is your job now: ${SUST[s.su.st].n}, with ${suRunway(s.su)} days of runway.`:'No salary coming in. Pick a position from the board below, freelance, or start a company.'}${s.pension?` Your pension pays <b class="num">${fmt(s.pension)}</b> a day.`:''}</p></div>
    ${J?`<div class="side"><p class="mut">Performance</p><span class="figure ${s.perf<25?'dn':s.perf>=promoNeed()?'up':''}">${Math.round(s.perf)}</span>${meter(s.perf,s.perf<25?'low':'')}<p class="mut" style="font-size:var(--text-xs)">${s.perf<25?'At risk of being fired.':s.perf>=promoNeed()||topRank()?'Your boss is happy.':`Get it to ${promoNeed()} for the next promotion.`}</p></div>`:''}
  </section>
  ${J?`<div class="sec-h"><h2>At work</h2></div><div class="quick">${wbtn('hard')}${wbtn('slack')}${wbtn('net')}${wbtn('raise',` · ${Math.round(raiseOdds()*100)}% odds`)}<button data-a="gig" ${gigsLeft()?'':'disabled'}>Side gig · +${fmt(gig())} · ${gigsLeft()} left</button>${age()>=55?'<button data-a="retire">Retire on a pension</button>':''}<button class="bad" data-a="quit">Resign</button></div>`
     :`<div class="quick" style="margin-top:var(--space-md)"><button class="pri" data-a="gig" ${gigsLeft()?'':'disabled'}>Take a gig · +${fmt(gig())} · ${gigsLeft()} left today</button></div>`}
  ${teamHtml()}${suHtml()}${flHtml()}
  <div class="sec-h"><h2>Job board</h2><span>${JOBS.filter(j=>canJob(j)&&s.job!==j.id).length} you qualify for</span></div>
  <div class="scroll"><table class="ledger"><thead><tr><th>Position</th><th>Field</th><th>Requires</th><th class="r">Stress</th><th class="r">Per day</th><th></th></tr></thead><tbody>
  ${JOBS.map(j=>{const miss=jobMiss(j),cur=s.job===j.id,wait=Math.max(0,(s.cd['job_'+j.id]||0)-s.day);if(miss.length&&!cur&&!showAll.work)return '';return `<tr class="${miss.length&&!cur?'dim':''}"><td><b>${j.n}</b></td><td class="mut">${FIELD[j.fld]}</td><td>${jobReqText(j)}${miss.length&&!cur?`<div class="sub dn">Missing ${miss.join(', ')}</div>`:''}</td><td class="r num">${j.str}/5</td><td class="r num">${fmt(j.pay)}</td>
   <td class="act">${cur?'<span class="mut">Current</span>':wait?`<span class="mut">Reapply in ${wait}d</span>`:`<button ${miss.length?'disabled':'class="pri"'} data-a="apply" data-x="${j.id}">Interview</button>`}</td></tr>`}).join('')}
  </tbody></table></div>
  ${(n=>n?`<div class="more-row"><button class="link2" data-a="showall">${showAll.work?'Hide the jobs you can\'t get yet':`Show ${n} more job${n>1?'s':''} you can't get yet`}</button></div>`:'')(JOBS.filter(j=>jobMiss(j).length&&s.job!==j.id).length)}
  ${foundHtml()}
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
    <div class="acts2">${sbtn('hard')}${sbtn('party')}${sbtn('tutor')}${st.sc!=='online'&&!st.abroad?`<button data-a="abroad" ${s.cash<abroadCost()?'disabled':''}>Semester abroad · ${fmt(abroadCost())}</button>`:''}<button class="bad" data-a="dropout">Drop out</button></div></div></div>`:''}
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
  const pt=partner(),G=[['Partner',['date','spouse']],['Family',['child','parent','sibling']],['Friends',['friend']],['Work',['boss','coworker']],['Exes',['ex']]];
  return `<section class="lede">
    <div><h2 class="headline">People</h2><p class="dek">${pt?`You are ${pt.role==='spouse'?'married to':'seeing'} <b>${esc(pt.n)}</b>.`:'You are single.'} Staying close to people keeps you happy.</p></div>
    <div class="side"><p class="mut">Meet people</p><div class="row">${['date','out','club'].map(id=>{const a=AM[id];if(a.show&&!a.show())return '';const w=cdLeft(id);return `<button data-a="act" data-x="${id}" ${w||s.cash<a.c?'disabled':''}>${a.n}${a.c?` · ${fmt(a.c)}`:''}${w?` · ${w}d`:''}</button>`}).join('')}${age()>=25&&age()<56?`<button data-a="kidadopt" ${canAdopt()?'':'disabled'}>Adopt a child · ${fmt(adoptCost())}</button>`:''}</div></div>
  </section>
  ${G.map(([g,rs])=>{const L=s.people.filter(p=>rs.includes(p.role)).sort((a,b)=>b.rel-a.rel);return L.length?`<div class="sec-h"><h2>${g}</h2><span>${L.length}</span></div><div class="plist">${L.map(personRow).join('')}</div>`:''}).join('')||'<p class="mut">Nobody yet. Go out and meet people.</p>'}
  ${howto('Closeness fades a little every day. Call, hang out, give gifts and plan date nights to keep it up. Close relationships lift your mood every day, and neglected ones drag it down. A neglected partner may leave. Propose once you are close and have been together a while, and try for a baby once you are married.')}`;
},
biz(){
  const f=flows(),last=BIZ.reduce((m,b,i)=>s.biz[b.id]?.n?i:m,-1),bb=bestBuy();
  return `<section class="lede">
    <div><h2 class="headline">Businesses</h2>
     <p class="dek">Managers pay <b class="num">${fmt(f.biz)}</b> a day on their own. Your tills take in <b class="num">${fmt(f.pend)}</b> a day until you collect, and stop filling after ${CAP} days. ${s.eco.rec?'<span class="dn">The recession has customers holding back: hotels, banks and app studios feel it most, and some may run at a loss.</span>':s.eco.g>.3?'The economy is strong and customers are spending.':''}${s.day<s.boost?` Your promotion adds 25% for ${s.boost-s.day} more days.`:''}</p></div>
    <div class="bmode"><span class="mut" style="font-size:var(--text-xs)">Buy at a time</span><div class="seg2">${['1','10','100','max'].map(m=>`<button class="${bmode===m?'on':''}" data-a="bmode" data-x="${m}">${m==='max'?'Max':'×'+m}</button>`).join('')}</div></div>
  </section>
  ${bb?`<div class="bestbuy"><p><b>Best next buy:</b> ${bb.k} ${bb.k>1?plural(bb.b.n):bb.b.n} for ${fmt(bb.c)}${bb.m?`, reaching ${bb.m} and doubling its income`:''}. Pays for itself in about ${Math.max(1,Math.round(bb.pb))} days.</p><button class="pri" data-a="bbuy" data-x="${bb.b.id}" data-y="${bb.k}">Buy ${bb.k}</button></div>`:''}
  <div class="blist"><div class="brow head"><span>Business</span><span class="own">Owned</span><span class="inc">Per day</span><span>Till</span><span></span></div>
  ${BIZ.map((b,i)=>bizRow(b,i,last)).join('')}</div>
  ${howto(`The buy button follows the switch above and shrinks to what you can afford. Milestones at ${MILES.slice(0,5).join(', ')} and on each add 50% to a business's income. Small businesses return far more on the money you put in, but big ones earn far more in total. Profits follow the economy: a lemonade stand barely notices a recession, while a hotel can run at a loss. Competition closes a location now and then, more often in a recession and less often with a manager. Managers keep earning while you're away.`)}`;
},
stock(){
  const k=SK[sel],q=s.px[sel],h=s.port[sel],M=s.mkt,d=q.p/q.o-1,H=q.h,buy=ot.side==='buy'||!ot.side,ext=ot.side==='short'||ot.side==='cover',wl=BYCAP.filter(k=>wf==='All'||(wf==='Held'?s.port[k.t]:wf==='Penny'?k.pn:k.sec===wf&&!k.pn));
  let val=0,cost=0,dpl=0;for(const x in s.port){const o=s.port[x],y=s.px[x];val+=o.sh*y.p;cost+=o.cost;dpl+=o.sh*(y.p-y.o)}
  const ix=idx(),idxd=idxDay(),lab=mktLabel(),[bid,ask]=bidAsk(sel);
  const live=mktOpen();
  const ty=ot.type||'market',okP=+ot.px>0&&(buy?ot.qty*ot.px<=s.cash:h&&h.sh>=ot.qty),myo=s.orders.filter(o=>o.t===sel),fl=fillAt(sel,buy?ot.qty:-ot.qty),est=ot.qty*fl.avg,imp=fl.avg/q.p-1,ok=live&&(buy?canBuy(sel,ot.qty,ot.mg):h&&h.sh>=ot.qty),news=s.feed.filter(p=>p.h==='@MarketWire'&&p.x.includes('$'+sel)).slice(0,5);
  const st=(l,v)=>`<div><span>${l}</span><b class="num">${v}</b></div>`,pl=(n)=>`<span class="num ${n>=0?'up':'dn'}">${n>=0?'+':''}${fmt(n)}</span>`;
  return `<div class="tbar">
    <div><small>Hustle 500</small><b class="num">${ix.toFixed(2)}</b> <span class="num ${idxd>=0?'up':'dn'}">${pct(idxd)}</span></div>
    <div><small>Market</small><b class="${lab==='Bull market'?'up':'dn'}">${lab}</b> <span class="mut sess">${dd()<-.005?`${pct(dd())} from high`:'at a record'}</span></div>
    <div><small>Fear index</small><b class="num ${fear()>30?'dn':''}">${fear().toFixed(1)}</b></div>
    <div><small>Session</small>${halted()?`<b class="dn">Halted</b> <span class="mut sess">${s.mkt.hu>=closeAt()?'for the rest of the day':`until ${clock(s.mkt.hu)}`}</span>`:live?`<b class="up">Open</b> <span class="mut sess">until ${clock(closeAt())}${closeAt()<960?', closing early':''}</span>`:`<b>Closed</b> <span class="mut sess">${holiday()?`${holiday()}. `:''}opens ${nextOpen()}</span>`}</div>
    <div><small>Market value</small><b class="num">${fmt(val)}</b></div>
    <div><small>Day P/L</small><b>${pl(dpl)}</b></div>
    <div><small>Total P/L</small><b>${pl(val-cost)}</b></div>
  </div>
  <div class="tui">
   <div class="watch"><div class="wf">${WSECS.map(x=>`<button class="${wf===x?'on':''}" data-a="wf" data-x="${x}">${x}</button>`).join('')}</div><div class="wh"><span>${wl.length} stock${wl.length===1?'':'s'}</span><span>Day</span></div>
    <div class="wlist" data-keep="w-${wf}">${wl.length?'':`<p class="mut" style="padding:var(--space-xs)">You don't hold any stocks yet.</p>`}${wl.map(k=>{const q=s.px[k.t],d=q.p/q.o-1;return `<button class="wrow ${k.t===sel?'on':''}" data-a="sel" data-x="${k.t}"><span><b>${k.t}</b>${controls(k.t)?' <span class="up">·yours</span>':s.port[k.t]?' <span class="mut">·held</span>':''}<small>${esc(nameOf(k.t))}</small></span><span class="num">${qfmt(q.p)}</span><span class="pill ${d>=0?'up':'dn'}">${pct(d)}</span></button>`}).join('')}</div>
   </div>
   <section>
    <div class="qhead"><div><h2 class="qt">${k.t} <span class="mut">${esc(nameOf(k.t))}</span></h2>
      <p><span class="price ${d>=0?'up':'dn'}">${qfmt(q.p)}</span> <span class="num ${d>=0?'up':'dn'}">${d>=0?'+':'-'}${qfmt(Math.abs(q.p-q.o))} (${pct(d)})</span></p></div><span class="chip">${k.pn?'Penny · ':''}${k.sec}</span></div>
    <div class="stats4">${st('Open',qfmt(q.op))}${st('High',qfmt(q.hi))}${st('Low',qfmt(q.lo))}${st('Prev close',qfmt(q.o))}${st('240d high',qfmt(Math.max(...H)))}${st('240d low',qfmt(Math.min(...H)))}${st('Volume',big(volAt(k,H.length-1)))}${st('Bid',qfmt(bid))}${st('Ask',qfmt(ask))}${st('Mkt cap',fmt(q.p*shOf(k.t)))}${st('P/E',fund(k).pe>0?fund(k).pe.toFixed(1):'—')}${st('Div yield',k.div?(k.div*100).toFixed(1)+'%':'—')}</div>
    ${k.pn?'':`<div class="seg2 vmode">${[['chart','Chart and company'],['options','Options']].map(([v,l])=>`<button class="${vmode===v?'on':''}" data-a="vm" data-x="${v}">${l}</button>`).join('')}</div>`}
    ${vmode==='options'&&!k.pn?optionsHtml(k,live):`<div class="tfbar">${Object.keys(TF).map(x=>`<button class="${tf===x?'on':''}" data-a="tf" data-x="${x}">${x}</button>`).join('')}<span class="sp"></span><button class="${cmode==='line'?'on':''}" data-a="cmode" data-x="line">Line</button><button class="${cmode==='candle'?'on':''}" data-a="cmode" data-x="candle">Candles</button></div>
    <canvas id="tchart"></canvas>
    ${companyHtml(k,live)}
    <h3>News</h3>
    ${news.length?`<ul class="news">${news.map(p=>`<li><small>${s.day-p.d?`${s.day-p.d}d ago`:'today'}</small>${esc(p.x)}</li>`).join('')}</ul>`:`<p class="mut">No headlines about ${k.t} lately.</p>`}`}
   </section>
   <div class="ticket">
    <div class="seg seg4">${[['buy','Buy','buy'],['sell','Sell','sell'],['short','Short','sell'],['cover','Cover','buy']].map(([v,l,c])=>`<button class="${(ot.side||'buy')===v?'on '+c:''}" data-a="side" data-x="${v}">${l}</button>`).join('')}</div>
    ${ext?shortTicket(k,live):`<div class="seg otype">${[['market','Market'],['limit','Limit'],['stop','Stop']].map(([v,l])=>`<button class="${ty===v?'on':''}" data-a="otype" data-x="${v}">${l}</button>`).join('')}</div>
    <dl><dt>Bid / Ask</dt><dd class="num">${qfmt(bid)} / ${qfmt(ask)}</dd></dl>
    ${ty!=='market'?`<label class="opx">${ty==='limit'?`${buy?'Buy at or below':'Sell at or above'}`:`${buy?'Buy if it rises to':'Sell if it falls to'}`}<input id="opx" type="number" inputmode="decimal" step="any" min="0" value="${ot.px??''}"></label>
    ${buy?`<div class="obrk"><label>Then take profit at<input id="otp" type="number" inputmode="decimal" step="any" min="0" value="${ot.tp??''}" placeholder="optional"></label><label>and stop loss at<input id="osl" type="number" inputmode="decimal" step="any" min="0" value="${ot.sl??''}" placeholder="optional"></label></div>`:''}
    <div class="seg tifs"><button class="${(ot.tif||'day')==='day'?'on':''}" data-a="tif" data-x="day">Today only</button><button class="${ot.tif==='gtc'?'on':''}" data-a="tif" data-x="gtc">Until cancelled</button></div>`:''}
    ${buy&&ty==='market'?marginable(sel)?`<label class="mg"><input type="checkbox" data-a="mgtog" ${ot.mg?'checked':''}> Borrow on margin, up to half, at ${pctA(mRate())} a year</label>`:`<p class="mut sess">${k.pn?'Penny stocks':'Stocks under $5'} can't be bought on margin.</p>`:''}
    <div class="qty"><button data-a="qty" data-x="-" aria-label="Fewer shares">−</button><b class="num">${big(ot.qty)}</b><button data-a="qty" data-x="+" aria-label="More shares">+</button></div>
    <div class="presets">${[['10','10'],['1000','1K'],['100000','100K']].map(([v,l])=>`<button data-a="qset" data-x="${v}">${l}</button>`).join('')}<button data-a="qset" data-x="max">Max</button></div>
    <dl>${Math.abs(imp)>=.001?`<dt>Average fill</dt><dd class="num">${qfmt(fl.avg)} <span class="${buy?'dn':'dn'}">${pct(imp)}</span></dd>`:''}<dt>Estimated ${buy?'cost':'proceeds'}</dt><dd class="num">${fmt(est)}</dd><dt>${buy?'Buying power':'Shares held'}</dt><dd class="num">${buy?fmt(ot.mg&&marginable(sel)?Math.max(s.cash,2*Math.max(0,acct().eq-acct().init)):s.cash):big(h?.sh||0)}</dd>${h?`<dt>Your avg cost</dt><dd class="num">${qfmt(h.cost/h.sh)}</dd>${ownFrac(sel)>=1e-4?`<dt>Your stake</dt><dd class="num">${ownPct(ownFrac(sel))}</dd>`:''}`:''}</dl>
    ${ty!=='market'?`<button class="place ${buy?'buy':'sell'}" data-a="order" ${okP?'':'disabled'}>Place ${ty} ${buy?'buy':'sell'} · ${big(ot.qty)} ${k.t}</button>
    <p class="mut" style="font-size:var(--text-xs)">${!(+ot.px>0)?'Enter a price.':buy&&ot.qty*ot.px>s.cash?'Not enough cash to cover this order.':!buy&&!okP?"You don't hold that many shares.":ty==='limit'?`Fills only at ${qfmt(+ot.px)} or better${live?'':', once the market opens'}.`:`Becomes a market order if the price ${buy?'rises':'falls'} to ${qfmt(+ot.px)}. It can fill worse than that in a fast market.`}</p>`:`<button class="place ${buy?'buy':'sell'}" data-a="order" ${ok?'':'disabled'}>${buy?'Buy':'Sell'} ${big(ot.qty)} ${k.t}</button>
    ${ok?Math.abs(imp)>=.01?`<p class="mut" style="font-size:var(--text-xs)">An order this size moves the price. Big buys push it up, big sells push it down.</p>`:'':`<p class="mut" style="font-size:var(--text-xs)">${!live?`The market is closed. It opens ${nextOpen()}.`:buy?'Not enough buying power.':"You don't hold that many shares."}</p>`}`}${buy&&ot.mg&&est>s.cash&&ok?`<p class="mut" style="font-size:var(--text-xs)">You'll borrow ${fmt(est-Math.max(0,s.cash))} at ${pctA(mRate())}. If your equity drops below 25% of what you hold, your broker sells to cover the loan.</p>`:''}
    `}
    ${h?bracketHtml('stock',sel,q.p,h.cost/h.sh,qfmt):''}
    ${myo.length?`<h4>Open orders</h4>${myo.map(o=>`<div class="oord"><span>${o.type==='limit'?'Limit':'Stop'} ${o.side} ${big(o.n)} ${o.t} at ${qfmt(o.px)}<small class="mut">${o.tif==='day'?'today only':'until cancelled'}${o.tp?` · then take profit at ${qfmt(o.tp)}`:''}${o.sl?` · stop loss at ${qfmt(o.sl)}`:''}</small></span><button data-a="ocancel" data-x="${o.id}">Cancel</button></div>`).join('')}`:''}
   </div>
  </div>
  ${marginPanel()}
  <h3>Positions</h3>
  ${Object.keys(s.port).length?`<div class="scroll"><table class="ledger"><thead><tr><th>Symbol</th><th class="r">Qty</th><th class="r">Avg cost</th><th class="r">Last</th><th class="r">Market value</th><th class="r">Day P/L</th><th class="r">Total P/L</th><th class="r">TP / SL</th></tr></thead><tbody>
   ${Object.entries(s.port).map(([x,o])=>{const y=s.px[x],v=o.sh*y.p;return `<tr class="pick ${x===sel?'on':''}" data-a="sel" data-x="${x}" tabindex="0"><td><b>${x}</b>${controls(x)?' <span class="up">·yours</span>':''}</td><td class="r num">${big(o.sh)}</td><td class="r num">${qfmt(o.cost/o.sh)}</td><td class="r num">${qfmt(y.p)}</td><td class="r num">${fmt(v)}</td><td class="r">${pl(o.sh*(y.p-y.o))}</td><td class="r">${pl(v-o.cost)} <span class="num ${v>=o.cost?'up':'dn'}">${pct(v/o.cost-1)}</span></td><td class="r num">${o.tp?qfmt(o.tp):'—'} / ${o.sl?qfmt(o.sl):'—'}</td></tr>`}).join('')}
  </tbody></table></div>`:'<p class="mut">No positions yet. Pick a stock from the watchlist and place an order.</p>'}`;
},
chirp(){
  const w=cdLeft('post'),sp=sponsor();
  return `<div class="chirp"><section class="lede" style="grid-template-columns:minmax(0,1fr)">
    <div><h2 class="headline">Chirp</h2>
     <p class="dek">${esc(s.name)} posts as ${s.handle} to <b class="num">${big(s.fol)}</b> followers. ${sp?`Sponsors pay <b class="num">${fmt(sp)}</b> a day.`:'Sponsors start paying at 1K followers.'}</p></div></section>
   <div class="compose"><p class="mut">${w?`You can post again in ${w} day${w>1?'s':''}.`:'What will you post?'}</p>
    ${Object.entries(POSTS).map(([k,P])=>`<button data-a="post" data-x="${k}" ${!w&&(!P.need||P.need())?'':'disabled'}>${P.n}</button>`).join('')}</div>
   ${chHtml()}
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
   ${X.coins.map(k=>{const d=k.p/k.o-1;return `<tr class="pick ${k.t===c.t?'on':''} ${k.dead?'dim':''}" data-a="xsel" data-x="${k.t}" tabindex="0"><td><b>${k.t}</b>${s.wallet[k.t]?` <span class="mut">·held${s.wallet[k.t].tp||s.wallet[k.t].sl?' ·TP/SL':''}</span>`:''}</td><td class="mut">${k.n}${k.dead?' · rugged':k.born!=null&&s.day-k.born<30?' · new':''}</td><td class="r num">${pfmt(k.p)}</td><td class="r num ${k.stable?'':d>=0?'up':'dn'}">${k.stable?'—':pct(d)}</td></tr>`}).join('')}
   </tbody></table></div>
   <section>
    <h3 style="margin-top:0">${c.n}</h3>
    <p class="mut">${c.t} · ${c.stable?`stablecoin, pays ${(c.apy*100).toFixed(0)}% a year just for holding it`:c.dead?'rugged, the developers are gone':c.meme?'meme coin, anything can happen':'blockchain'}</p>
    <p style="margin-top:var(--space-2xs)"><span class="price">${pfmt(c.p)}</span> ${c.stable?'':`<span class="num ${d>=0?'up':'dn'}">${pct(d)}</span> <span class="mut">today, ${pct(d30)} over 30 days</span>`}</p>
    <canvas id="chart"></canvas>
    <p>${w?`You hold <b class="num">${units(w.u)} ${c.t}</b>, worth <b class="num">${fmt(w.u*c.p)}</b> (<span class="num ${w.u*c.p>=w.c?'up':'dn'}">${pct(w.u*c.p/w.c-1)}</span>).`:'<span class="mut">You hold none of this one.</span>'}</p>
    <div class="trade">${['100','1000','10000'].map(n=>`<button data-a="xbuy" data-x="${c.t}" data-y="${n}" ${c.dead||s.cash<+n?'disabled':''}>Buy ${fmt(+n)}</button>`).join('')}<button class="pri" data-a="xbuy" data-x="${c.t}" data-y="all" ${c.dead||s.cash<1?'disabled':''}>All in</button>
     <button data-a="xsell" data-x="${c.t}" data-y=".25" ${w?'':'disabled'}>Sell 25%</button><button data-a="xsell" data-x="${c.t}" data-y=".5" ${w?'':'disabled'}>Sell 50%</button><button class="bad" data-a="xsell" data-x="${c.t}" data-y="all" ${w?'':'disabled'}>Sell all</button></div>
    ${w&&!c.stable?bracketHtml('coin',c.t,c.p,w.c/w.u,pfmt):''}
   </section>
  </div>
  ${howto(`Crypto never closes: prices move every minute, day and night, weekends included. Every trade costs a 1% fee. New meme coins launch every few weeks. A few go up a hundredfold; most get rugged. Hustle Dollar holds at $1 and pays interest every day.`)}`;
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
    <p class="dek">${s.props.length?`You own ${s.props.length===1?'one property':s.props.length+' properties'} worth <b class="num">${fmt(val)}</b>${debt?`, with <b class="num">${fmt(debt)}</b> still owed to the bank`:''}. Tenants pay you <b class="num">${fmt(f.rent)}</b> a day.`:`You own nothing yet, so rent costs you ${fmt(rentNow())} a day. A small flat on a mortgage can cost less than that.`}</p></div>
    <div class="side"><p class="mut"><span class="figure ${idx>=1?'up':'dn'}">${pct(idx-1)}</span><br>house prices this lifetime</p></div></section>
  ${cityHtml()}
  ${s.props.length?`<h3>Your properties</h3><div class="scroll"><table class="ledger"><thead><tr><th>Property</th><th class="r">Paid</th><th class="r">Worth now</th><th class="r">Owed</th><th class="r">Rent a day</th><th>Condition</th><th>Status</th><th></th></tr></thead><tbody>
   ${s.props.map(p=>{const v=pval(p),k=PM[p.t],home=s.home===p.uid;return `<tr><td><b>${pname(p)}</b></td><td class="r num">${fmt(p.paid)}</td><td class="r num ${v>=p.paid?'up':'dn'}">${fmt(v)}</td><td class="r num">${p.loan?fmt(p.loan):'—'}</td><td class="r num">${home?'—':fmt(v*k.yld/365)}</td>
    <td class="${(p.cond??100)<60?'dn':''}">${condWord(p.cond)}${p.rv?' · renovated':''}</td><td>${p.reno?`Renovating, ${p.reno-s.day}d`:home?'Your home':s.day<p.from?`Finding a tenant, ${p.from-s.day}d`:p.stl?'Holiday let':'Rented out'}${!home&&!k.biz?`<div class="sub"><button class="link2" data-a="stl" data-x="${p.uid}">${p.stl?'Switch to a long let':'Make it a holiday let'}</button></div>`:''}</td>
    <td class="act">${!p.reno&&((p.cond??100)<95||!p.rv)?`<button data-a="reno" data-x="${p.uid}" ${s.cash<renoCost(p)?'disabled':''}>${(p.cond??100)<85?'Renovate':'Upgrade'} · ${fmt(renoCost(p))}</button>`:''}${home?`<button data-a="moveout" data-x="${p.uid}">Move out</button>`:k.biz||!here(p)?'':`<button data-a="live" data-x="${p.uid}">Live here</button>`}${p.loan?`<button data-a="payoff" data-x="${p.uid}" ${s.cash<p.loan?'disabled':''}>Pay off</button>`:''}<button class="bad" data-a="psell" data-x="${p.uid}">Sell for ${fmt(v*.97-p.loan)}</button></td></tr>`}).join('')}
   </tbody></table></div>`:''}
  <h3>For sale</h3>
  <div class="scroll"><table class="ledger"><thead><tr><th>Listing</th><th class="r">Price</th><th class="r">Rent a day</th><th class="r">Mortgage a day</th><th></th></tr></thead><tbody>
  ${s.re.list.map(l=>{const k=PM[l.t],v=lval(l),ok=s.cash>=v*.2&&canBorrow(v*.8);return `<tr class="${s.cash>=v||ok?'':'dim'}"><td><b>${k.n}, ${l.loc}</b>${k.biz?' <span class="mut">· investment only</span>':''}${(l.cond??100)<60?' <span class="tag">fixer-upper</span>':''}</td><td class="r num">${fmt(v)}</td><td class="r num">${fmt(v*k.yld/365)}</td><td class="r num">${fmt(mpay(v*.8,myRate()))}</td>
   <td class="act"><button data-a="pbuy" data-x="${l.uid}" ${s.cash<v?'disabled':''}>Buy outright</button><button class="pri" data-a="pbuy" data-x="${l.uid}" data-y="m" ${ok?'':'disabled'}>Mortgage, ${fmt(v*.2)} down</button></td></tr>`}).join('')}
  </tbody></table></div>
  ${howto(`New listings in ${s.re.next-s.day} days. Mortgages take 20% down and run 30 years at a fixed rate that follows the economy, ${pctA(mrate())} today, and the bank only lends while repayments stay under 40% of your income. Selling costs 3% in fees. Anything you don't live in gets rented out once a tenant is found, and tenants move on every few years. Places wear slowly, and faster when rented; a worn place is worth less and rents for less. Fixer-uppers sell cheap: renovating takes 60 days, restores the condition and adds a modern finish worth 8%.`)}`;
},
garage(){
  let val=0;for(const c of s.cars)val+=c.v;const b=bestCar();
  return `<section class="lede"><div><h2 class="headline">Garage</h2>
    <p class="dek">${s.cars.length?`${s.cars.length===1?'One car':s.cars.length+' cars'} worth <b class="num">${fmt(val)}</b>. Your ${CM[b.t].n.toLowerCase()} is the one that lifts your mood. Every car adds followers and upkeep.`:'No car yet. Most lose value the moment you drive them off the lot. Classics are the exception.'}</p></div></section>
  ${s.cars.length?`<h3>Your cars</h3><div class="scroll"><table class="ledger"><thead><tr><th>Car</th><th class="r">Paid</th><th class="r">Worth now</th><th class="r">Upkeep a day</th><th></th></tr></thead><tbody>
   ${s.cars.map(c=>`<tr><td><b>${CM[c.t].n}</b><div class="sub">owned ${Math.floor((s.day-c.bought)/365)}y ${(s.day-c.bought)%365}d${c.loan>0?` · owes ${fmt(c.loan)} at ${fmt(c.pay)} a day`:''}</div></td><td class="r num">${fmt(c.paid)}</td><td class="r num ${c.v>=c.paid?'up':'dn'}">${fmt(c.v)}</td><td class="r num">${fmt(CM[c.t].up)}</td><td class="act"><button class="bad" data-a="csell" data-x="${c.uid}">Sell for ${fmt(c.v-(c.loan||0))}</button></td></tr>`).join('')}
   </tbody></table></div>`:''}
  <h3>Dealership</h3>
  <div class="scroll"><table class="ledger"><thead><tr><th>Model</th><th class="r">Price</th><th class="r">Value a year</th><th class="r">Upkeep a day</th><th class="r">Mood</th><th class="r">Followers a year</th><th></th></tr></thead><tbody>
  ${CARS.map(k=>`<tr class="${s.cash>=k.price?'':'dim'}"><td><b>${k.n}</b>${k.vol?' <span class="mut">· collectible</span>':''}</td><td class="r num">${fmt(k.price)}</td><td class="r num ${k.dep<0?'up':'dn'}">${k.dep<0?'+':'−'}${Math.abs(k.dep*100).toFixed(0)}%</td><td class="r num">${fmt(k.up)}</td><td class="r num">+${Math.round(k.hap/.004)}</td><td class="r num">${k.fame?big(k.fame*365):'—'}</td><td class="act"><button class="pri" data-a="cbuy" data-x="${k.id}" ${s.cash<k.price?'disabled':''}>Buy</button>${k.price<2e6*s.eco.P?`<button data-a="cfin" data-x="${k.id}" ${canCarLoan(k.price)?'':'disabled'}>Finance · ${fmt(k.price*.1)} down</button>`:''}</td></tr>`).join('')}
  </tbody></table></div>
  ${howto(`Only your best car lifts your mood, but every car adds followers. New cars lose 10% the day you drive them away. Collectibles swing in value and tend to climb. Financing takes 10% down and five years at ${pctA(carRate())} for your credit; lenders want a score of at least 580 and payments under a fifth of your income.`)}`;
},
shop(){
  return `<section class="lede"><div><h2 class="headline">Lifestyle</h2>
    <p class="dek">Nice things lift your everyday mood, and flashy ones pull in followers. All of them cost upkeep. Sell anything back for 60%. Homes are under Property and cars are in the Garage.</p></div></section>
  <div class="scroll"><table class="ledger"><thead><tr><th>Item</th><th class="r">Price</th><th class="r">Mood</th><th class="r">Followers a year</th><th class="r">Upkeep a day</th><th></th></tr></thead><tbody>
  ${SHOP.map(i=>{const o=s.own[i.id];return `<tr class="${o||s.cash>=i.cost?'':'dim'}"><td><b>${i.n}</b></td><td class="r num">${fmt(i.cost)}</td><td class="r num">+${Math.round(i.hap/.004)}</td><td class="r num">${i.fame?big(i.fame*365):'—'}</td><td class="r num">${i.up?fmt(i.up):'—'}</td>
   <td class="act">${o?`<button class="bad" data-a="unown" data-x="${i.id}">Sell for ${fmt(i.cost*.6)}</button>`:`<button class="pri" data-a="own" data-x="${i.id}" ${s.cash<i.cost?'disabled':''}>Buy</button>`}</td></tr>`}).join('')}
  </tbody></table></div>
  ${staffHtml()}
  ${clubHtml()}`;
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
const ICON={bank:ic('<path d="M3 10l9-6 9 6M5 10v8M10 10v8M14 10v8M19 10v8M3 20h18"/>'),home:ic('<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>'),user:ic('<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4.5-6 8-6s7 2 8 6"/>'),work:ic('<rect x="3" y="7" width="18" height="13" rx="1"/><path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M3 12h18"/>'),
 store:ic('<path d="M4 9l1.5-5h13L20 9M4 9v11h16V9M4 9h16M9 20v-6h6v6"/>'),chart:ic('<path d="M4 19h16M6 15l4-5 3 3 5-7"/>'),coin:ic('<circle cx="12" cy="12" r="8"/><path d="M10 8h3a2 2 0 0 1 0 4h-3m0 0h3.5a2 2 0 0 1 0 4H10m0-8v8"/>'),building:ic('<path d="M5 21V4h9v17M14 9h5v12M8 8h3M8 12h3M8 16h3M3 21h18"/>'),
 car:ic('<path d="M5 16l1.5-5.5A2 2 0 0 1 8.4 9h7.2a2 2 0 0 1 1.9 1.5L19 16M4 16h16v3H4zM7 19v1.5M17 19v1.5"/>'),bag:ic('<path d="M6 8h12l-1 12H7zM9 8a3 3 0 0 1 6 0"/>'),chat:ic('<path d="M4 5h16v11H9l-5 4z"/>'),cap:ic('<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v5c0 1.5 3 3 6 3s6-1.5 6-3v-5"/>'),heart:ic('<path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/>'),
 dice:ic('<rect x="4" y="4" width="16" height="16" rx="2"/><circle cx="9" cy="9" r="1"/><circle cx="15" cy="15" r="1"/><circle cx="15" cy="9" r="1"/><circle cx="9" cy="15" r="1"/>'),tree:ic('<circle cx="12" cy="5" r="2"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="18" r="2"/><path d="M12 7v5M12 12H6v4M12 12h6v4"/>'),flag:ic('<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>'),pulse:ic('<path d="M3 12h4l2-5 4 10 2-5h6"/>'),leaf:ic('<path d="M5 19c0-8 5-14 14-14 0 9-6 14-14 14zM5 19l7-7"/>'),pause:ic('<path d="M8 5v14M16 5v14"/>')};
const TABS={dash:['Home','home'],bank:['Bank','bank'],life:['Life','user'],work:['Work','work'],people:['People','heart'],school:['Education','cap'],health:['Health','pulse'],hobby:['Hobbies','leaf'],legacy:['Family tree','tree'],biz:['Business','store'],stock:['Markets','chart'],crypto:['Crypto','coin'],home:['Property','building'],garage:['Garage','car'],shop:['Lifestyle','bag'],chirp:['Chirp','chat'],office:['Politics','flag'],casino:['Casino','dice']};
const GROUPS=[['',['dash']],['You',['life','work','people','school','health','hobby','legacy']],['Money',['biz','stock','crypto','bank','home']],['Spend',['garage','shop']],['Fun',['chirp','office','casino']]];
const BAR=[['Home',['dash'],'home'],['Life',['life','work','people','school','health','hobby','legacy'],'user'],['Money',['biz','stock','crypto','bank','home'],'chart'],['Spend',['garage','shop'],'bag'],['Fun',['chirp','office','casino'],'dice']];
const KEYTABS=['dash','life','work','people','school','biz','stock','crypto','home','garage'];
const TOUR=[
 {tab:'dash',t:'Welcome to The Hustle',x:'Time runs on Auto: a day passes in about 5 seconds while you’re idle, slows to 30 seconds while you’re playing, and slows further while you trade on Markets. Fast skips ahead at a second a day. Time keeps passing while the game is closed, at a day every 15 minutes. The game is paused while this guide is open. The ? button replays it, and holds settings and keyboard shortcuts.',hi:['#guideBtn']},
 {tab:'dash',t:'Your numbers',x:'The top bar shows your cash, net worth, what you earn each day, and your age. Pause or speed up time with the buttons on the right.',hi:['.ticker','#speed']},
 {tab:'dash',t:'Needs you',x:'Home lists everything that needs your attention: decisions, money waiting to collect, and warnings. A decision left alone for 30 days decides itself.',hi:['.needs']},
 {tab:'dash',t:'Quick actions',x:'Gigs pay a little cash right away. Activities raise your health, happiness, smarts and looks, and each one has a cooldown.',hi:['.quick']},
 {tab:'work',t:'Work',x:'Your job pays every day, and it comes with a boss and coworkers worth keeping on side. Working hard raises your performance, and promotions come every 120 days. Freelance contracts pay on the side, and once you have savings you can quit to found a startup.',hi:['#view .ledger']},
 {tab:'health',t:'Health',x:'Illness comes with age, stress and low mood, and some of it stays hidden until a check-up finds it. Insurance covers most bills. Legal trouble from your choices shows up on the Life screen.',hi:['#view .acards']},
 {tab:'school',t:'Education',x:'Degrees and certificates unlock better jobs. Better schools cost more and are harder to get into, but they impress employers. Student loans pay themselves off over time.',hi:['#view .ledger']},
 {tab:'people',t:'People',x:'Call, hang out and give gifts to stay close. Close relationships make you happier every day. Neglected ones fade, and a neglected partner may leave. Kids grow into whoever you help them become, and one of them carries on the family when you die.',hi:['.plist']},
 {tab:'biz',t:'Businesses',x:'This is how you get rich. Buy a Lemonade Stand first. Tills fill up until you collect them. Hire a manager and the money comes in on its own, even when you are away.',hi:['.blist','#collectBtn']},
 {tab:'stock',t:'Grow your money',x:'Markets, Crypto and Property are other places to put spare cash. Stocks trade from 9:30 to 4:00 on weekdays, closed on exchange holidays, and behave like the real market: about 7% a year on average, with bad years and crashes along the way.',hi:['#nav [data-x="stock"]','#nav [data-x="crypto"]','#nav [data-x="home"]','#tabbar [data-x="2"]']},
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
  if(!s)return;const f=flows(),net=f.job+f.biz+f.pend+f.spon+f.rent+f.own-f.exp-f.mort-f.tax,p=pendAll();
  $('#dateline').innerHTML=`<span class="clk">${dstr(s.day)} · ${clock(s.min)}</span><span class="yd"> · year ${dateOf(s.day).y}</span>`;
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
  const pc=paceNow(),pl={idle:'Auto',active:'Auto · slow',trade:'Auto · trade'}[pc]||'Auto';
  $('#speed').innerHTML=[[0,ICON.pause,'Pause'],[1,pl,PACE_TXT[pc==='fast'?'idle':pc]],[2,'Fast',PACE_TXT.fast]].map(([v,l,a])=>`<button class="${speed===v?'on':''}" data-a="spd" data-x="${v}" aria-label="${a}" title="${a}">${l}</button>`).join('');
  $('#nav').innerHTML=railHtml();$('#tabbar').innerHTML=barHtml();
  const keep=[...$$('#view [data-keep]')].map(e=>[e.dataset.keep,e.scrollTop]); // inner scroll boxes survive the rebuild
  $('#view').innerHTML=subtabs()+VIEWS[tab]();
  for(const[k,y]of keep){const e=$(`#view [data-keep="${k}"]`);if(e)e.scrollTop=y}
  if(tab==='stock')drawStock();
  if(tab==='crypto'){const c=coin(csel),w=s.wallet[csel];if(c)drawChart(c.h,w&&w.c/w.u,pfmt)}
  coach();
}
function drawStock(){
  const c=$('#tchart');if(!c)return;const dpr=devicePixelRatio||1,W=c.clientWidth,H=c.clientHeight;c.width=W*dpr;c.height=H*dpr;
  const T=n=>getComputedStyle(document.documentElement).getPropertyValue(n).trim(),g=c.getContext('2d');g.scale(dpr,dpr);
  const k=SK[sel],all=s.px[sel].h,K=s.px[sel].k,n=Math.min(TF[tf],all.length),st=all.length-n,grp=cmode==='candle'?Math.max(1,Math.ceil(n/60)):1,bars=[],live=mktOpen();
  for(let i=0;i<n;i+=grp){const ix=Array.from({length:Math.min(grp,n-i)},(_,j)=>st+i+j);
    bars.push({o:K[ix[0]][0],c:all[ix.at(-1)],hi:Math.max(...ix.map(j=>K[j][1])),lo:Math.min(...ix.map(j=>K[j][2])),v:ix.reduce((t,j)=>t+volAt(k,j),0),ago:all.length-1-ix.at(-1)})}
  const AX=62,PW=W-AX,PH=H*.76,VT=PH+10,VH=H-VT-16,lo0=Math.min(...bars.map(b=>b.lo)),hi0=Math.max(...bars.map(b=>b.hi)),pad=(hi0-lo0||hi0*.02)*.06,lo=lo0-pad,hi=hi0+pad,vmax=Math.max(...bars.map(b=>b.v));
  const X=i=>(i+.5)*PW/bars.length,Y=v=>6+(hi-v)/(hi-lo)*(PH-6),up=T('--color-up'),dn=T('--color-down'),mono=T('--font-mono');
  g.font=`11px ${mono}`;g.strokeStyle=T('--color-rule');g.fillStyle=T('--color-ink-3');g.lineWidth=1;
  for(let j=0;j<=4;j++){const v=lo+(hi-lo)*j/4,y=Y(v);g.beginPath();g.moveTo(0,y);g.lineTo(PW,y);g.stroke();g.fillText(pfmt(v),PW+6,y+4)}
  g.fillText(`${n} sessions ago`,0,H-3);g.textAlign='right';g.fillText(live?'Now':'Last close',PW,H-3);g.textAlign='left';
  const rise=bars.at(-1).c>=bars[0].o;
  if(cmode==='line'){g.beginPath();bars.forEach((b,i)=>i?g.lineTo(X(i),Y(b.c)):g.moveTo(X(i),Y(b.c)));g.strokeStyle=rise?up:dn;g.lineWidth=1.6;g.lineJoin='round';g.stroke();
    g.lineTo(X(bars.length-1),PH);g.lineTo(X(0),PH);g.globalAlpha=.12;g.fillStyle=rise?up:dn;g.fill();g.globalAlpha=1}
  else{const bw=Math.max(1,PW/bars.length*.64);for(const[i,b]of bars.entries()){const col=b.c>=b.o?up:dn,x=X(i);g.strokeStyle=g.fillStyle=col;g.beginPath();g.moveTo(x,Y(b.hi));g.lineTo(x,Y(b.lo));g.stroke();
    const y1=Y(Math.max(b.o,b.c)),y2=Y(Math.min(b.o,b.c));g.fillRect(x-bw/2,y1,bw,Math.max(1,y2-y1))}}
  g.globalAlpha=.45;for(const[i,b]of bars.entries()){g.fillStyle=b.c>=b.o?up:dn;const bh=b.v/vmax*VH,bw=Math.max(1,PW/bars.length*.64);g.fillRect(X(i)-bw/2,VT+VH-bh,bw,bh)}g.globalAlpha=1;
  const last=all.at(-1),ly=Y(last);g.setLineDash([2,3]);g.strokeStyle=rise?up:dn;g.beginPath();g.moveTo(0,ly);g.lineTo(PW,ly);g.stroke();
  const p=s.port[sel];if(p){const a=p.cost/p.sh;if(a>lo&&a<hi){g.strokeStyle=T('--color-accent');g.beginPath();g.moveTo(0,Y(a));g.lineTo(PW,Y(a));g.stroke();g.fillStyle=T('--color-accent');g.fillText('your avg',4,Y(a)-4)}}
  g.setLineDash([]);g.fillStyle=rise?up:dn;g.fillRect(PW+2,ly-9,AX-2,18);g.fillStyle=T('--color-paper');g.fillText(pfmt(last),PW+6,ly+4);
  if(hov!=null&&hov<PW){const i=clamp(Math.floor(hov/PW*bars.length),0,bars.length-1),b=bars[i],x=X(i);
    g.strokeStyle=T('--color-ink-3');g.setLineDash([3,3]);g.beginPath();g.moveTo(x,0);g.lineTo(x,H-16);g.stroke();g.setLineDash([]);
    const lines=[b.ago?`${b.ago} session${b.ago>1?'s':''} ago`:live?'Today, trading':'Last session',`O ${pfmt(b.o)}  H ${pfmt(b.hi)}`,`L ${pfmt(b.lo)}  C ${pfmt(b.c)}`,`Vol ${big(b.v)}`],bx=x>PW/2?8:PW-200;
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
document.addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(!b||b.disabled)return;if(s&&!s.dead&&jailed()&&JAILX.has(b.dataset.a)){toast("You can't do that from a jail cell.");return}ACT[b.dataset.a](b.dataset.x,b.dataset.y);if(s&&!s.dead)checkGoals();if(s&&$('#modal').hidden)render();else hdr()});
document.addEventListener('input',e=>{if(e.target.id==='opx')ot.px=parseFloat(e.target.value)||null;if(e.target.id==='otp')ot.tp=parseFloat(e.target.value)||null;if(e.target.id==='osl')ot.sl=parseFloat(e.target.value)||null;if(e.target.dataset.bk){const v=e.target.value.trim();(bd[e.target.dataset.bk]??={})[e.target.dataset.w]=v===''?'':parseFloat(v)||''}});
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
for(const ev of ['pointerdown','keydown','wheel','input','touchstart'])addEventListener(ev,()=>lastAct=performance.now(),{passive:true,capture:true}); // what counts as playing
addEventListener('pointermove',e=>{if(e.target.id==='tchart'||e.target.id==='chart')lastAct=performance.now()},{passive:true}); // studying a chart counts too
addEventListener('pointerdown',()=>holding=true);
addEventListener('pointerup',()=>holding=false);addEventListener('pointercancel',()=>holding=false);
let last=performance.now(),acc=0;
setInterval(()=>{
  const now=performance.now(),dt=now-last;last=now;
  if(!s||s.dead||!speed||catching||document.hidden||!$('#modal').hidden)return; // decisions & dialogs pause time
  acc=Math.min(acc+dt*PACE[paceNow()]/1000,2880);let n=0;
  while(acc>=1){acc--;minute();n++;if(s.dead)break}
  if(n){if(holding||document.activeElement?.matches?.('#view input'))hdr();else render()} // ponytail: skip DOM rebuild mid-click so buttons don't vanish under the cursor
},100);
function save(){if(!s||wiped)return;s.lastSeen=Date.now();try{localStorage.setItem(SAVE,JSON.stringify(s))}catch{}lbPost()}

// ---------- the leaderboard: only on the published page, where claude.use('db') is served; hidden everywhere else ----------
// Each player writes one row, board/<their id>; everyone reads the board. Names come from their Claude profile at render time and are never stored.
let lb=null,lbUser=null,lbMe=null,lbRows=[],lbNames={},lbLast=0,lbSent=null;
(async()=>{try{if(!window.claude?.use)return;const[db,user]=await Promise.all([claude.use('db'),claude.use('user')]);if(!db)return;
  lb=db;lbUser=user;lbMe=user?await user.id():null;
  db.collection('board').orderBy('nw','desc').limit(50).onSnapshot(q=>{lbRows=q.docs.map(d=>({id:d.id,...d.data()}));lbResolve()},()=>{lb=null;lbRows=[];if(s&&tab==='dash')render()});
  lbPost(true)}catch{lb=null}})();
async function lbResolve(){if(lbUser)lbNames=await lbUser.profiles(lbRows.map(r=>r.id));if(s&&tab==='dash'&&!holding)render()}
function lbPost(force){ // at most once a minute, and only when something moved
  if(!lb||!lbMe||!s||s.lbOff||wiped)return;const nw=Math.round(netWorth()),row={fam:String(s.name).slice(0,20),gen:s.gen,nw,age:Math.floor(age()),yr:dateOf(s.day).y,goals:Object.keys(s.goals).length,dead:!!s.dead,t:Date.now()};
  if(!force&&(Date.now()-lbLast<60000||lbSent&&row.gen===lbSent.gen&&row.dead===lbSent.dead&&Math.abs(nw-lbSent.nw)<Math.max(1000,Math.abs(lbSent.nw)*.05)))return;
  lbLast=Date.now();lbSent=row;lb.doc('board/'+lbMe).set(row).catch(e=>{if(e?.code==='invalid_argument')lbMe=null})}
function lbHtml(){ // rows are other players' input: every field is checked and escaped
  if(!lb&&!lbRows.length)return '';const rows=lbRows.filter(r=>Number.isFinite(+r.nw)).slice(0,10),mine=lbRows.findIndex(r=>r.id===lbMe);
  return `<div class="sec-h"><h2>Leaderboard</h2><span>everyone who plays this page</span>${lbMe?`<button class="link2" data-a="lbtog">${s.lbOff?'Show my family':'Hide my family'}</button>`:''}</div>
  ${rows.length?`<table class="ledger lboard"><tbody>${rows.map((r,i)=>`<tr class="${r.id===lbMe?'me':''}"><td class="num">${i+1}</td><td><b>${esc(String(r.fam||'A family').slice(0,20))}</b> <span class="mut">generation ${Math.max(1,+r.gen|0)}${r.dead?' · passed on':''}</span><div class="sub">${esc(lbNames[r.id]?.name||'A player')}${r.id===lbMe?' (you)':''} · ${Math.max(0,+r.goals|0)} goals</div></td><td class="r num">${fmt(+r.nw)}</td></tr>`).join('')}</tbody></table>
  ${mine>=10?`<p class="mut sess">You're number ${mine+1}.</p>`:''}`:'<p class="mut">No one is on the board yet.</p>'}
  <p class="mut sess">${s.lbOff?'Your family is hidden from the board.':'Your family shows here for everyone who opens this page: its name, generation, net worth and goals.'}</p>`;
}
setInterval(save,5000);addEventListener('beforeunload',save);
document.addEventListener('visibilitychange',()=>{if(!s||s.dead)return;if(document.hidden){save();hiddenAt=Date.now()}else if(hiddenAt){offline(Date.now()-hiddenAt);hiddenAt=0;render()}});


if('serviceWorker' in navigator&&(location.protocol==='https:'||location.hostname==='localhost'||location.hostname==='127.0.0.1'))navigator.serviceWorker.register('sw.js').catch(()=>{}); // makes it installable and offline-capable when served
(function boot(){
  const go=()=>{let d=null;if(!wiped)try{d=JSON.parse(localStorage.getItem(SAVE))}catch{}
    if(d?.v===1){s=d;upgrade();render();if(s.dead)deathModal();else{offline(Date.now()-s.lastSeen);if($('#modal').hidden&&(s.seenV||1)<NEWSV)modal(`<p class="kicker">Welcome back</p><h2>The game has been updated</h2>${newsHtml()}<button class="pri" data-a="close" style="margin-top:var(--space-sm)">Back to it</button>`)}}
    else startModal()};
  if(!location.search.includes('test'))return go();
  const sc=document.createElement('script');sc.src='test.js'; // the self-test only loads when asked for
  sc.onload=()=>{try{selfTest()}catch(e){console.error('self-test FAILED:',e.message,(e.stack||'').split('\n').slice(1,4).join(' | '))}s=null;tab='dash';go()};
  sc.onerror=()=>{console.error('self-test FAILED: test.js did not load');go()};document.head.append(sc);
})();
