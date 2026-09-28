// The Hustle: life systems (health, the law, hobbies, pets, kids, careers, family tree, partners, cities, politics).
// Loaded before game.js. Everything here runs lazily, so it can use game.js's state and helpers.
// ---------- health: conditions come with age and lifestyle; some start hidden and only a check-up finds them ----------
// r(A) is the chance a year of getting it at age A. Treated conditions cost a little each day (med); untreated ones drain health and happiness, and the worst can kill.
const CONDS={
 flu:{n:'Flu',acute:1,r:A=>1.1*(1+Math.max(0,60-s.st.hea)/40)*(world('pandemic')?3:1),len:[5,10],hea:.4,hap:.2,tx:'See a doctor',tc:150,d:'Rest it off, or see a doctor to get over it in a couple of days.'},
 inj:{n:'Sports injury',acute:1,r:()=>.12,len:[40,70],hea:.12,hap:.08,tx:'Physiotherapy',tc:2500,d:'Heals on its own in a couple of months, or in about 10 days with physio.'},
 back:{n:'Back pain',r:A=>A<28?0:.02*(1+(A-28)/20)*(job()?.str<=2?1.6:1),hea:.02,hap:.06,tx:'Physiotherapy',tc:1800,d:'Nags every day. Physio fixes it about two times in three.'},
 dep:{n:'Depression',r:()=>.03+(s.st.hap<30?1.5*(30-s.st.hap)/30:0),hap:.14,med:20,tx:'Start therapy',d:'Drags your mood down every day. Therapy costs about $20 a day and usually lifts it within a few months.'},
 diab:{n:'Type 2 diabetes',hid:730,r:A=>A<30?0:.004*(1+(A-30)/10)*(s.st.hea<50?2:1)*diet().risk,hea:.035,thea:.005,med:8,tx:'Start medication',d:'Slowly wears down your health. Daily medication keeps it in check.'},
 heart:{n:'Heart disease',r:A=>A<40?0:.0015*((A-40)/10+1)**2*(s.st.hea<40?2:1)*diet().risk*(s.hours==='over'&&s.job?1.3:1),hea:.05,thea:.01,hz:.08,thz:.01,med:6,tx:'Bypass surgery',tc:90000,d:'Left alone, about one in twelve people die of it each year. Surgery and medication cut that to one in a hundred.'},
 cancer:{n:'Cancer',hid:1,r:A=>A<35?0:.0015*((A-35)/10+1)**2,hea:.03,d:'It spreads in stages. Caught at stage 1, treatment works 95% of the time. By stage 4, only one in five.'},
};
const CSTAGE={cost:[40e3,90e3,200e3,350e3],cure:[.95,.8,.5,.2],hz:[0,.01,.1,.8]};
const INS={va:{n:'VA healthcare',prem:0,cov:.9,ded:0,cap:2000,d:'For veterans: 90% covered, no deductible, capped at $2,000 a year.'},none:{n:'No insurance',prem:0,cov:0,ded:0,cap:Infinity,d:'You pay every bill in full.'},basic:{n:'Basic plan',prem:9,jobp:0,cov:.7,ded:3000,cap:8000,d:'Pays 70% after a $3,000 deductible. You never pay more than $8,000 a year. Free with a job.'},premium:{n:'Premium plan',prem:24,jobp:12,cov:.9,ded:500,cap:3000,d:'Pays 90% after a $500 deductible, capped at $3,000 a year.'}};
const insPrem=(k=s.ins)=>{const I=INS[k];return (s.job&&I.jobp!=null?I.jobp:I.prem)*s.eco.P};
function medYear(){const y=dateOf(s.day).y;if(s.med?.y!==y)s.med={y,ded:0,oop:0};return s.med}
function oopOf(cost,k=s.ins){const I=INS[k],m=medYear(),d=Math.min(cost,Math.max(0,I.ded*s.eco.P-m.ded)),out=d+(cost-d)*(1-I.cov);return {out:Math.min(out,Math.max(0,I.cap*s.eco.P-m.oop)),d}}
function billMed(cost){const {out,d}=oopOf(cost),m=medYear();m.ded+=d;m.oop+=out;s.cash-=out;return out} // what you pay after insurance
const cond=id=>s.conds.find(c=>c.id===id);
const condName=c=>c.id==='cancer'?`Stage ${c.st} cancer`:CONDS[c.id].n;
function addCond(id,hid){const K=CONDS[id],c={id,d:s.day};if(K.len)c.left=rint(...K.len);if(id==='cancer'){c.st=1;c.nx=s.day+rint(220,420)}if(K.hid&&hid!==0)c.hid=1;s.conds.push(c);
  if(!c.hid){if(!K.acute)mile(`Diagnosed with ${condName(c).toLowerCase()}.`);log(`Diagnosed with ${condName(c).toLowerCase()}.`,'bad');toast(`Health: ${condName(c)}`)}return c}
function checkup(){const f=s.conds.filter(c=>c.hid);for(const c of f){delete c.hid;c.dx=s.day}return f.length?` The tests found <b>${f.map(c=>condName(c).toLowerCase()).join(' and ')}</b>. See Health.`:' No hidden problems.'}
function condHaz(c){const K=CONDS[c.id];if(c.id==='cancer')return c.tx?CSTAGE.hz[c.st-1]*.3:CSTAGE.hz[c.st-1];return (c.tx?K.thz:K.hz)||0}
function medDaily(){return s.conds.reduce((t,c)=>t+(c.tx===1&&CONDS[c.id].med?CONDS[c.id].med:0),0)*s.eco.P*(1-INS[s.ins].cov)}
function healthDay(A){
  for(const id in CONDS){const K=CONDS[id];if(!cond(id)&&R()<K.r(A)/365)addCond(id)}
  for(const c of [...s.conds]){const K=CONDS[c.id],tx=c.tx===1;
    add('hea',-(tx&&K.thea!=null?K.thea:K.hea||0));if(K.hap)add('hap',-(tx?K.hap*.3:K.hap));
    if(c.hid&&(K.hid>1&&s.day-c.d>K.hid||c.id==='cancer'&&c.st>=3)){delete c.hid;c.dx=s.day;log(`Symptoms sent you to the doctor: it's ${condName(c).toLowerCase()}.`,'bad');toast(`Diagnosed: ${condName(c)}`)}
    if(K.acute&&--c.left<=0){s.conds.splice(s.conds.indexOf(c),1);continue}
    if(c.id==='dep'&&R()<(tx?1/100:1/400)+(s.st.hap>60?1/200:0)){s.conds.splice(s.conds.indexOf(c),1);log('The depression has lifted.','good');continue}
    if(c.id==='cancer'){
      if(c.tx>1&&s.day>=c.tx){if(R()<CSTAGE.cure[c.st-1]){s.conds.splice(s.conds.indexOf(c),1);add('hap',15);s.beat=1;mile('Beat cancer.');log('Treatment worked. You are cancer-free.','good');toast('Cancer-free!');continue}c.tx=0;c.dx=s.day;log(`The treatment didn't clear the cancer. It is still stage ${c.st}.`,'bad');toast('Treatment failed')}
      else if(c.tx>1)add('hea',-.1);
      else if(s.day>=c.nx&&c.st<4){c.st++;c.nx=s.day+rint(220,420);if(!c.hid)log(`The cancer has spread to stage ${c.st}.`,'bad')}}
    if(!c.hid&&!c.tx&&['cancer','heart','diab','dep'].includes(c.id)&&s.day-(c.dx??c.d)>=30&&!(c.cd>s.day))autoTreat(c);
    const hz=condHaz(c);if(hz&&R()<hz/365){s.cause=`of ${condName(c).replace(/^Stage \d /,'').toLowerCase()}`;return die()}
  }
}
const CURE={
 flu:c=>{c.left=Math.min(c.left,2);add('hea',3);return 'The doctor sends you home with meds. You feel better soon.'},
 inj:c=>{c.left=Math.min(c.left,10);return 'Physio starts. You should be fine in about 10 days.'},
 back:c=>{if(R()<.65){s.conds.splice(s.conds.indexOf(c),1);add('hap',4);return 'Physio worked. Your back feels great.'}c.cd=s.day+60;return "Physio helped a little, but the pain's back. You can try again in 60 days."},
 heart:c=>{c.tx=1;add('hea',-8);return 'Surgery went well. Take your medication and your risk drops a lot.'},
 cancer:c=>{c.tx=s.day+90;return 'Treatment starts: about 90 hard days.'},
};
function autoTreat(c){ // left alone for 30 days, your doctor starts the standard treatment if you can pay for it
  const K=CONDS[c.id];if(K.med&&!K.tc){c.tx=1;log(`Your doctor started you on ${c.id==='dep'?'therapy':'medication'} for ${condName(c).toLowerCase()}.`);return}
  const o=oopOf(txCost(c)).out;if(s.cash<o){c.cd=s.day+30;return}const v=billMed(txCost(c));CURE[c.id](c);log(`Your doctor started treatment for ${condName(c).toLowerCase()}. You paid ${fmt(v)} after insurance.`)}
const txCost=c=>c.id==='cancer'?CSTAGE.cost[c.st-1]*s.eco.P:(CONDS[c.id].tc||0)*s.eco.P;

// ---------- the law: cases open from choices you made; plead, fight with a lawyer, or represent yourself ----------
const CASES={
 sec:{n:'Insider trading charges',crim:1,fine:v=>Math.max(5e3,v*2),jail:120,conv:.55,law:25e3,d:'The SEC noticed your perfectly timed trade.'},
 dui:{n:'Drunk-driving charge',crim:1,fine:()=>2500*s.eco.P,jail:4,conv:.85,law:4e3,d:'Pulled over on the way home from a night out.'},
 tax:{n:'Tax evasion charges',crim:1,fine:v=>v*3,jail:90,conv:.6,law:15e3,d:'An audit found the cash you kept off the books.'},
 slip:{n:'Personal injury lawsuit',fine:v=>v,conv:.5,law:8e3,d:'A customer is suing over a fall at your business.'},
 nbr:{n:"Your neighbor's lawsuit",fine:v=>v,conv:.45,law:3e3,d:'Your neighbor took the fence dispute to court.'},
};
const jailed=()=>s.legal.jail>s.day;
const JAILX=new Set(['chpost','abroad','run','flt','found','suhire','act','gig','work','apply','learn','enroll','study','pp','post','deal','slot','rl','dice','flip','cbuy','pbuy','hob','hshow','adopt']);
const crimes=(yrs=7)=>s.legal.rec.filter(r=>CASES[r.t].crim&&s.day-r.d<yrs*365);
const CLEAN=new Set(['police','teacher','nurse','lawyer','pilot','resident','surgeon','army','officer']);
function openCase(t,v=0){const c={id:uid(),t,v:Math.round(v),d:s.day};s.legal.cases.push(c);log(`<b>${CASES[t].n}.</b> ${CASES[t].d} You have 30 days to decide how to answer.`,'bad');toast(CASES[t].n);return c}
function lawCost(c){return CASES[c.t].law*s.eco.P*(c.t==='sec'||c.t==='tax'?1+Math.min(3,c.v/2e5):1)}
function goJail(days){if(days<1)return '';mile(`Went to jail for ${days} day${days>1?'s':''}.`);s.legal.jail=Math.max(s.legal.jail,s.day)+days;let m=` Sentenced to <b>${days} day${days>1?'s':''}</b> in jail.`;
  if(s.job&&days>=30){const j=jobTitle();fire();m+=` You lost your job as ${j}.`}add('hap',-Math.min(25,5+days/6));return m}
function resolveCase(c,how){const K=CASES[c.t],fine=Math.round(K.fine(c.v));s.legal.cases.splice(s.legal.cases.indexOf(c),1);
  const conv=how==='plead'?1:R()<K.conv*(how==='lawyer'?.45:how==='self'?1.15:1);let m='';
  if(how==='lawyer'){const l=lawCost(c);s.cash-=l;m=`Your lawyer cost ${fmt(l)}. `}
  if(!conv){add('hap',8);return m+(K.crim?'Not guilty. The case is dismissed.':'You won the case.')}
  const f=how==='plead'?Math.round(fine*.6):fine;payOut(f);
  if(!K.crim)return m+(how==='plead'?`You settled for ${fmt(f)}.`:`You lost and owe ${fmt(f)} in damages.`);
  s.legal.rec.push({t:c.t,d:s.day});
  return m+(how==='plead'?`You pleaded guilty and paid ${fmt(f)}.`:`Guilty. Fined ${fmt(f)}.`)+goJail(Math.round(K.jail*(how==='plead'?.25:.5+R()*.5)))+' It goes on your record.';
}

// ---------- hobbies: skill grows with practice, fades if you stop, and opens small side incomes ----------
const HOBS=[
 {id:'music',n:'Guitar',c:0,show:'Play a gig',perk:'Play bars for tips and followers'},
 {id:'paint',n:'Painting',c:30,show:'Sell a painting',perk:'Sell your work. Followers raise the price'},
 {id:'write',n:'Writing',c:0,show:'Publish a book',scd:365,need:50,perk:'Publish a book for a year of royalties'},
 {id:'cook',n:'Cooking',c:25,show:'Host a dinner party',perk:'Cuts your grocery bill by up to 20% and helps food-job interviews'},
 {id:'code',n:'Coding',c:0,show:'Take a freelance project',perk:'Helps tech interviews and pays for freelance work'},
 {id:'sport',n:'Tennis',c:20,show:'Enter a tournament',perk:'+2 health a session, with a small risk of injury'},
 {id:'chess',n:'Chess',c:0,show:'Enter a tournament',perk:'+0.6 smarts a session. Strong players win prizes'},
];
const HM=Object.fromEntries(HOBS.map(h=>[h.id,h]));
const hobSk=id=>s.hob[id]?.sk||0;
const HFLD={tech:'code',food:'cook',creative:'paint'};
const hobIv=j=>hobSk(HFLD[j.fld])/400; // up to +25% interview odds in a matching field
function practice(id){const H=HM[id],h=s.hob[id]??={sk:0,last:s.day,n:0};h.sk=Math.min(100,h.sk+5*(1-h.sk/100)*(.7+s.st.sma/200)*(trait('creative')?1.5:1));h.last=s.day;h.n++;add('hap',3);
  if(id==='sport'){add('hea',2);if(R()<.03&&!cond('inj')){addCond('inj');return 'You twisted something. Sports injury.'}}
  if(id==='chess')add('sma',.6);
  return `${H.n} practice. Skill ${Math.round(h.sk)}.`}
function hobShow(id){const k=hobSk(id),P=s.eco.P,rn=.5+R();
  if(id==='music'){const v=Math.round(k*k*.6*P*rn),f=Math.round(k*3*rn);s.cash+=v;taxAdd('ord',v);s.fol+=f;return `The crowd loved it. ${fmt(v)} in tips and +${f} followers.`}
  if(id==='paint'){const v=Math.round(k**2.2*.4*P*rn*(1+s.fol/1e5));s.cash+=v;taxAdd('ord',v);return `A collector paid ${fmt(v)} for it.`}
  if(id==='write'){const best=R()<.05*k/100,v=k**3/1e4*P*(best?12:1)*rn;s.roy={v,end:s.day+365};log(best?`Your book is a <b>bestseller</b>! Royalties of ${fmt(v)} a day for a year.`:`Your book is out. Royalties of ${fmt(v)} a day for a year.`,'good');return best?'A bestseller!':'Published.'}
  if(id==='cook'){for(const p of s.people)if(p.role==='friend'||p.role==='spouse'||p.role==='date')prel(p,4+k/20);add('hap',5);return 'Everyone raved about the food. Your friends feel closer.'}
  if(id==='code'){const v=Math.round(k*k*P*rn);s.cash+=v;taxAdd('ord',v);return `Freelance project done: ${fmt(v)}.`}
  const win=R()<k/130,v=win?Math.round(500*(k/50)**3*P):0;s.cash+=v;taxAdd('ord',v);add('hap',win?6:1);if(id==='sport')add('hea',1);return win?`You won the tournament! ${fmt(v)}.`:'Knocked out early. Still fun.'}

// ---------- pets ----------
const PETS=[
 {id:'cat',n:'Cat',c:150,up:3,hap:.015,life:15},
 {id:'dog',n:'Dog',c:800,up:5,hap:.025,hea:.006,life:12},
 {id:'fish',n:'Fish tank',c:120,up:.6,hap:.006,life:5},
 {id:'parrot',n:'Parrot',c:1500,up:2,hap:.012,life:45},
 {id:'horse',n:'Horse',c:20000,up:45,hap:.04,life:28,fame:.3},
];
const PTM=Object.fromEntries(PETS.map(p=>[p.id,p])),PETN=['Mochi','Biscuit','Luna','Pepper','Ziggy','Nala','Oreo','Pickles','Bean','Maple','Kiwi','Tofu','Waffles','Juniper','Rocket'];
function addPet(t,b=s.day){const K=PTM[t],used=new Set(s.pets.map(p=>p.n)),n=PETN.find(x=>!used.has(x)&&R()<.25)||pick(PETN),p={uid:uid(),t,n,b,dies:b+Math.round(K.life*(.75+R()*.5)*365)};s.pets.push(p);return p}
const petSum=k=>s.pets.reduce((t,p)=>t+(PTM[p.t][k]||0),0);
const petOf=p=>`${p.n} the ${PTM[p.t].n.toLowerCase().replace(' tank','')}`;
function petsDay(){for(const p of [...s.pets])if(s.day>=p.dies){s.pets.splice(s.pets.indexOf(p),1);add('hap',-12);const m=`${p.n}, your ${PTM[p.t].n.toLowerCase().replace(' tank','')}, passed away at ${Math.floor((s.day-p.b)/365)}.`;log(esc(m),'bad');toast(esc(m))}
  if(s.pets.length&&R()<s.pets.length*.4/365){const v=Math.round(rint(200,2500)*s.eco.P);s.cash-=v;log(`A vet bill for ${esc(pick(s.pets).n)}: ${fmt(v)}.`,'bad')}}

// ---------- the daily tick for all of the above ----------
const lifeCost=()=>(s.staff?.pa?paCost():0)+dietCost()+careCost()+insPrem()+medDaily()+kidsCost()+petSum('up')*s.eco.P-Math.min(.2,hobSk('cook')/500)*(15+kidsHome()*47)*s.eco.P;
function lifeDay(A){
  if(jailed())add('hap',-.25);else if(s.legal.jail&&s.legal.jail===s.day){log('Released from jail.','good');toast('Released from jail')}
  for(const id in s.hob){const h=s.hob[id];if(s.day-h.last>30)h.sk=Math.max(0,h.sk-.03)}
  if(s.roy&&s.day>=s.roy.end)delete s.roy; // royalties are paid with the day's other income
  for(const c of [...s.legal.cases])if(s.day-c.d>=30){const m=resolveCase(c,'pd');log(`<b>${CASES[c.t].n}</b> You never answered, so it went to trial with a public defender. ${m}`,'bad')}
  petsDay();add('hea',petSum('hea'));s.fol+=petSum('fame');
  healthDay(A);
}

// ---------- decisions that play out later: each schedules a follow-up handled in LATER ----------
const LATER={
 lend(p){const f=per(p.u),r=R();if(!f||r>=.8){if(f)prel(f,-30);return log(`${f?esc(f.n):'Your old friend'} never paid back the ${fmt(p.v)}. It's awkward now.`,'bad')}
  const v=r<.6?p.v:Math.round(p.v/2);s.cash+=v;prel(f,r<.6?6:-5);log(r<.6?`${esc(f.n)} paid back the full ${fmt(v)}, with a thank-you card.`:`${esc(f.n)} paid back ${fmt(v)} and went quiet about the rest.`,r<.6?'good':'info')},
 nbr(){if(R()<.45)openCase('nbr',rint(8e3,25e3)*s.eco.P);else log('Your neighbor grumbled for a while, then dropped the fence dispute.')},
 fstart(p){const f=per(p.u),r=R(),x=r<.6?0:r<.85?1+R()*2:r<.97?5+R()*15:50,v=Math.round(p.v*x);if(v){s.cash+=v;capGain(v-p.v,s.day-730)}else capGain(-p.v,s.day-730);if(f)prel(f,x>1?10:x?0:-5);
  log(x?`${f?esc(f.n)+"'s":"Your friend's"} startup ${x>=5?'was bought out':'paid back investors'}: your ${fmt(p.v)} became <b>${fmt(v)}</b>.`:`${f?esc(f.n)+"'s":"Your friend's"} startup shut down. The ${fmt(p.v)} is gone.`,x>1?'good':'bad')},
 fmiss(){log(`The startup you passed on just sold for $${rint(40,400)}M. Oh well.`)},
 audit(p){if(R()<.3)openCase('tax',p.v)},
 sec(p){openCase('sec',p.v)},
};
const EV2=[
{id:'lend',w:1.2,c:s=>friendsN()>0&&s.cash>2000,a:s=>({u:pick(s.people.filter(p=>p.role==='friend'))?.uid,v:Math.round(Math.min(s.cash*.1,rint(5,40)*100*s.eco.P))}),t:'Can I borrow some money?',d:(s,a)=>`${esc(per(a.u)?.n||'A friend')} asks to borrow <b>${fmt(a.v)}</b> to cover rent. "I'll pay you back, I swear."`,def:1,ch:[
 ['Lend it',(s,a)=>{if(s.cash<a.v)return "You don't have it to lend.";s.cash-=a.v;s.later.push({d:s.day+rint(45,180),k:'x',id:'lend',u:a.u,v:a.v});const f=per(a.u);if(f)prel(f,5);return 'They hug you. Now you wait.'}],
 ['Say no',(s,a)=>{const f=per(a.u);if(f)prel(f,-8);return 'They say they understand. They seem hurt.'}]]},
{id:'lump',w:.35,c:()=>age()>30&&!cond('cancer'),t:'Something feels off',d:()=>'You notice a small lump. It doesn\'t hurt.',def:0,ch:[
 ['Get it checked',()=>{const v=billMed(300*s.eco.P);if(R()<.02+Math.max(0,age()-30)*.002){addCond('cancer',0);return `You paid ${fmt(v)}. It's early-stage cancer, and caught early, treatment works 95% of the time. See Health.`}return `You paid ${fmt(v)}. It's benign. Relief.`}],
 ['Wait and see',()=>{if(R()<.02+Math.max(0,age()-30)*.002)addCond('cancer');return 'It seems to go away. Probably nothing.'}]]},
{id:'nbr',w:.8,c:s=>s.props.length>0,t:'Fence feud',d:()=>`Your neighbor says your tree cracked their fence and wants ${fmt(3000*s.eco.P)} for a new one.`,def:1,ch:[
 ['Pay for the fence',()=>{s.cash-=3000*s.eco.P;add('hap',1);return 'New fence, happy neighbor.'}],
 ['Tell them to get lost',()=>{s.later.push({d:s.day+rint(20,60),k:'x',id:'nbr'});add('hap',2);return 'That felt good. They looked furious.'}]]},
{id:'fstart',w:.8,c:s=>friendsN()>0&&s.cash>5000,a:s=>({u:pick(s.people.filter(p=>p.role==='friend'))?.uid,v:Math.round(Math.min(s.cash*.1,5e4*s.eco.P))}),t:'Get in early',d:(s,a)=>`${esc(per(a.u)?.n||'A friend')} is starting a company and asks you to invest <b>${fmt(a.v)}</b>. Most startups fail. A few make their backers rich.`,def:1,ch:[
 ['Invest',(s,a)=>{if(s.cash<a.v)return "You don't have it any more.";s.cash-=a.v;s.later.push({d:s.day+rint(365,1460),k:'x',id:'fstart',u:a.u,v:a.v});return "You're in. It'll be a few years before you know."}],
 ['Pass',()=>{if(R()<.06)s.later.push({d:s.day+rint(700,1400),k:'x',id:'fmiss'});return 'You wish them luck.'}]]},
{id:'slip',w:.8,c:()=>nOwned()>0,a:()=>Math.round(clamp(Object.values(s.biz).reduce((t,o)=>t+(o.spent||0),0)*.05,2e3,4e4)*(.5+R())*s.eco.P),t:'Wet floor',d:(s,a)=>`A customer slipped at one of your businesses. Their lawyer offers to settle for <b>${fmt(a)}</b>.`,def:0,ch:[
 ['Settle',(s,a)=>{s.cash-=a;return `Paid ${fmt(a)}. Done.`}],
 ['See you in court',(s,a)=>{openCase('slip',a*2.5);return 'Your case is on the Life screen.'}]]},
{id:'cashonly',w:.8,c:()=>nOwned()>0,a:()=>Math.round(Math.max(2000,BIZ.reduce((t,b)=>t+(s.biz[b.id]?.n?bizInc(b,s.biz[b.id]):0),0)*30)),t:'Cash only',d:(s,a)=>`Your manager says a month of cash takings, <b>${fmt(a)}</b>, never touched a card machine. Nobody would know if you didn't report it.`,def:1,ch:[
 ['Keep it off the books',(s,a)=>{const v=Math.round(a*margRate());taxAdd("ord",-a);s.later.push({d:s.day+rint(90,540),k:'x',id:'audit',v:a});return `You save about ${fmt(v)} in tax. Hopefully nobody checks.`}],
 ['Report every dollar',()=>{add('hap',1);return 'Clean books, clear conscience.'}]]},
];

// ---------- kids: born with traits and some of your stats, shaped by how you raise them; your heir starts as the person they became ----------
const TRAITS={
 bright:{n:'Bright',d:'learns faster at school',sma:12},
 sporty:{n:'Sporty',d:'healthier all life',hea:8},
 charming:{n:'Charming',d:'wins people over in interviews',loo:8},
 sunny:{n:'Sunny',d:'naturally happier',hap:10},
 anxious:{n:'Anxious',d:'moods run lower',hap:-10},
 rebel:{n:'Rebellious',d:'finds trouble',loo:3},
 creative:{n:'Creative',d:'picks up hobbies fast'},
 driven:{n:'Driven',d:'works harder',sma:3},
};
const trait=t=>!!s.tr?.includes(t);
const trTxt=tr=>(tr||[]).map(t=>TRAITS[t].n).join(', ');
function rollTraits(from=[]){const ks=Object.keys(TRAITS),tr=[];if(from.length&&R()<.5)tr.push(pick(from));
  while(tr.length<2){const t=pick(ks);if(!tr.includes(t)&&!(t==='sunny'&&tr.includes('anxious'))&&!(t==='anxious'&&tr.includes('sunny')))tr.push(t)}return tr}
const trSum=(tr,k)=>(tr||[]).reduce((a,t)=>a+(TRAITS[t][k]||0),0);
function kidNew(){const sp=partner(),tr=rollTraits(s.tr||[]),gs=clamp((s.st.sma+(sp?.gs??rint(35,70)))/2+rint(-10,10)+trSum(tr,'sma'),5,95),gl=clamp((s.st.loo+(sp?.gl??rint(35,70)))/2+rint(-10,10)+trSum(tr,'loo'),5,95);
  return {gs,sma:gs*.3,hea:clamp(78+trSum(tr,'hea')+rint(-5,5),0,100),loo:gl,hap:clamp(62+trSum(tr,'hap'),0,100),tr,sch:'public',fund:0}}
const FUNDCAP=5e5,COLLEGE=1e5,PRIVATE=70; // a college fund caps at $500K; four years of college cost $100K; private school $70 a day (all in today's prices)
const kidAge=p=>ageOf(p);
function kidDay(p){const K=p.k,a=kidAge(p);if(!K)return;
  if(a<18){const pv=K.sch==='private'?6:0;
    K.sma=clamp(K.sma+((a<6?K.gs*(.3+a/10):K.gs+pv+(p.rel-50)*.08)-K.sma)*.003,0,100);
    K.hap=clamp(K.hap+((55+(p.rel-50)*.5+trSum(K.tr,'hap'))-K.hap)*.003,0,100);
    K.hea=clamp(K.hea+((80+trSum(K.tr,'hea'))-K.hea)*.002,0,100)}
  K.fund*=1+.05/365;
  if(K.path==='college'||K.path==='trade'){if(s.day>=K.grad){K.done=1;K.job=K.path==='college'?(K.sma>=65?'swe':K.sma>=58?'analyst':pick(['teacher','design','dev','admin'])):'elec';K.path+='d';log(`${esc(p.n)} ${K.path==='colleged'?'graduated from college':'finished a trade certificate'} and started work as ${art(JM[K.job].n.toLowerCase())}.`,'good');add('hap',6)}}
  if(a>=24&&a<38&&!K.sp&&R()<1/2500){K.sp=pick(PNAMES.filter(n=>n!==p.n));log(`${esc(p.n)} married ${esc(K.sp)}.`,'good');add('hap',5)}
  if(K.sp&&a>=26&&a<42&&(K.gk||[]).length<3&&R()<1/1400){(K.gk??=[]).push({n:pick(PNAMES),b:s.day});add('hap',8);if(K.gk.length===1&&!kids().some(k=>k!==p&&k.k?.gk?.length))mile('Became a grandparent.');log(`${esc(p.n)} had a baby, ${esc(K.gk.at(-1).n)}. You're a grandparent!`,'good');toast('A grandchild!')}
}
function kidLaunch(p,quiet){const K=p.k;if(!K||K.path)return;const P=s.eco.P,cost=COLLEGE*P;
  if(K.sma>=55){const use=Math.min(K.fund,cost);K.fund-=use;K.loan=Math.round(cost-use);K.path='college';K.grad=p.b+22*365;
    if(!quiet)log(`${esc(p.n)} turns 18 and heads to college.${use?` The college fund covers ${fmt(use)}.`:''}${K.loan?` The rest, ${fmt(K.loan)}, is student loans.`:''}`,'good')}
  else if(K.sma>=35){const use=Math.min(K.fund,8000*P);K.fund-=use;K.path='trade';K.grad=p.b+19*365;if(!quiet)log(`${esc(p.n)} turns 18 and starts a trade course.`,'good')}
  else{K.path='work';K.job=pick(['crew','retail','rider']);if(!quiet)log(`${esc(p.n)} turns 18 and goes straight to work as ${art(JM[K.job].n.toLowerCase())}.`)}
  if(quiet&&K.grad<=s.day){K.path+='d';K.done=1;K.job=K.path==='colleged'?(K.sma>=65?'swe':K.sma>=58?'analyst':'admin'):'elec'}
}
const kidStat=p=>{const K=p.k;return K?`Smarts ${Math.round(K.sma)} · Health ${Math.round(K.hea)} · Mood ${Math.round(K.hap)}${K.tr?.length?` · ${trTxt(K.tr)}`:''}${kidAge(p)<18&&K.sch==='private'?' · Private school':''}${K.fund>=1?` · Fund ${fmt(K.fund)}`:''}${K.job&&kidAge(p)>=18?` · ${JM[K.job].n}`:K.path==='college'?' · At college':K.path==='trade'?' · Trade course':''}${K.sp?` · Married to ${esc(K.sp)}`:''}${K.gk?.length?` · ${K.gk.length} kid${K.gk.length>1?'s':''}`:''}`:''};
const kidsCost=()=>kids().filter(k=>k.k?.sch==='private'&&kidAge(k)<18).length*PRIVATE*s.eco.P;
const estateTax=w=>Math.max(0,w-exemptLeft())*.4; // 40% above what's left of the $13M lifetime exemption
const EV3=[
{id:'report',w:1.5,c:()=>kids().some(k=>k.k&&kidAge(k)>=6&&kidAge(k)<18),a:()=>pick(kids().filter(k=>k.k&&kidAge(k)>=6&&kidAge(k)<18))?.uid,t:'Report card',d:(s,a)=>{const k=per(a);if(!k)return 'A report card came home.';const g=k.k.sma;return `${esc(k.n)}'s report card is in: <b>${g>=75?'straight As':g>=60?'mostly As and Bs':g>=45?'Bs and Cs':g>=30?'mostly Cs, a D in maths':'failing two classes'}</b>.`},def:0,ch:[
 ['Praise the effort',(s,a)=>{const k=per(a);if(!k)return 'The moment has passed.';prel(k,5);k.k.hap=Math.min(100,k.k.hap+4);return `${k.n} beams.`}],
 ['Push them harder',(s,a)=>{const k=per(a);if(!k)return 'The moment has passed.';prel(k,-5);k.k.sma=Math.min(100,k.k.sma+2);k.k.hap=Math.max(0,k.k.hap-4);return `${k.n} sulks, but studies more.`}]]},
{id:'ktrouble',w:s=>kids().some(k=>k.k&&kidAge(k)>=12&&kidAge(k)<18&&(k.k.tr.includes('rebel')||k.rel<40))?2:.3,c:()=>kids().some(k=>k.k&&kidAge(k)>=12&&kidAge(k)<18),a:()=>pick(kids().filter(k=>k.k&&kidAge(k)>=12&&kidAge(k)<18))?.uid,t:'A call from school',d:(s,a)=>`${esc(per(a)?.n||'Your kid')} was caught ${pick(['skipping class','spray-painting the gym','selling answers to a test','in a fight behind the bleachers'])}.`,def:1,ch:[
 ['Ground them',(s,a)=>{const k=per(a);if(!k)return 'The moment has passed.';prel(k,-8);k.k.sma=Math.min(100,k.k.sma+1);return `Phone confiscated. ${k.n} is furious.`}],
 ['Talk it through',(s,a)=>{const k=per(a);if(!k)return 'The moment has passed.';prel(k,4);k.k.hap=Math.min(100,k.k.hap+2);return `A long talk. ${k.n} actually listened, you think.`}]]},
{id:'ktalent',w:1,c:()=>kids().some(k=>k.k&&kidAge(k)>=5&&kidAge(k)<16&&k.k.tr.length<3),a:()=>pick(kids().filter(k=>k.k&&kidAge(k)>=5&&kidAge(k)<16&&k.k.tr.length<3))?.uid,t:'A hidden talent',d:(s,a)=>`${esc(per(a)?.n||'Your kid')}'s teacher says they have a real gift, and lessons would make the most of it. About ${fmt(3000*s.eco.P)} a year.`,def:1,ch:[
 ['Pay for lessons',(s,a)=>{const k=per(a);if(!k)return 'The moment has passed.';s.cash-=3000*s.eco.P;const t=pick(['creative','sporty','bright'].filter(x=>!k.k.tr.includes(x)));if(t){k.k.tr.push(t);if(t==='bright')k.k.gs=Math.min(95,k.k.gs+12);if(t==='sporty')k.k.hea=Math.min(100,k.k.hea+8)}prel(k,6);return `${k.n} loves it.${t?` They're ${TRAITS[t].n.toLowerCase()} now.`:''}`}],
 ['Maybe later',()=>'Money is tight. Maybe next year.']]},
{id:'kcar',w:1,c:()=>kids().some(k=>kidAge(k)>=16&&kidAge(k)<18),a:()=>pick(kids().filter(k=>kidAge(k)>=16&&kidAge(k)<18))?.uid,t:'Can I have a car?',d:(s,a)=>`${esc(per(a)?.n||'Your teen')} just passed their driving test and wants a car. A used one is about ${fmt(9000*s.eco.P)}.`,def:1,ch:[
 ['Buy one',(s,a)=>{const k=per(a);if(!k)return 'The moment has passed.';s.cash-=9000*s.eco.P;prel(k,15);return `${k.n} screams with joy.`}],
 ['Save up for it',(s,a)=>{const k=per(a);if(!k)return 'The moment has passed.';prel(k,-5);return `${k.n} rolls their eyes and gets a weekend job.`}]]},
{id:'kask',w:1,c:()=>kids().some(k=>kidAge(k)>=22)&&s.cash>2e4,a:()=>pick(kids().filter(k=>kidAge(k)>=22))?.uid,t:'A down payment',d:(s,a)=>`${esc(per(a)?.n||'Your kid')} found a first home and asks if you can help with the down payment: <b>${fmt(Math.min(s.cash*.05,2e5*s.eco.P))}</b>.`,def:1,ch:[
 ['Help out',(s,a)=>{const k=per(a),v=Math.min(s.cash*.05,2e5*s.eco.P);if(!k)return 'The moment has passed.';s.cash-=v;prel(k,15);add('hap',4);return `${k.n} gets the keys. You get a lot of hugs.`}],
 ['They need to stand on their own',(s,a)=>{const k=per(a);if(k)prel(k,-10);return 'They say they understand.'}]]},
];

// ---------- the team: every job comes with a boss and coworkers you can win over or cross ----------
const BOSSES={fair:{n:'Fair',d:'rewards good work',w:4},micro:{n:'Micromanager',d:'hard work counts more, and slacking off costs double',w:2},absent:{n:'Hands-off',d:'rarely around, so your performance moves slowly either way',w:2},toxic:{n:'Toxic',d:'takes credit and yells, a daily drag on your mood',w:1}};
const boss=()=>s.people.find(p=>p.role==='boss'),mates=()=>s.people.filter(p=>p.role==='coworker');
function makeTeam(){const W=Object.entries(BOSSES);let r=R()*W.reduce((a,[,b])=>a+b.w,0),bt='fair';for(const[k,b]of W)if((r-=b.w)<0){bt=k;break}
  const b=meet('boss',rint(40,60),s.day-rint(35,58)*365);b.bt=bt;for(let i=rint(2,3);i>0;i--)meet('coworker',rint(30,55),s.day-rint(22,50)*365)}
function teamDay(){if(s.teamJ===s.job)return;
  for(const p of [...s.people])if(p.role==='boss'||p.role==='coworker'){if(p.role==='coworker'&&p.rel>=60&&friendsN()<10){p.role='friend';log(`You stay in touch with ${esc(p.n)} from your old job.`)}else s.people.splice(s.people.indexOf(p),1)}
  if(s.job)makeTeam();s.teamJ=s.job}
const bossAdj=()=>{const b=boss();return b?(b.rel-50)/5:0}; // a boss who likes you lowers the bar for promotion by up to 10 points
const mateHap=()=>{const m=mates();return m.length?(m.reduce((a,p)=>a+p.rel,0)/m.length-50)*.0006:0};

// ---------- freelancing: contracts in fields you know; reputation raises your rates ----------
const FLT=[
 {n:'Build a small website',fld:'tech',s:45,base:180},{n:'Clear a bug backlog',fld:'tech',s:55,base:240},{n:'Design a logo',fld:'creative',s:30,base:120},{n:'Brand refresh',fld:'creative',s:45,base:210},
 {n:'Bookkeeping for a shop',fld:'finance',s:40,base:150},{n:'Model a startup\'s finances',fld:'finance',s:60,base:320},{n:'Cater a party',fld:'food',s:15,base:90},{n:'Write product copy',fld:'office',s:35,base:100},
 {n:'Data entry',fld:'office',s:10,base:55},{n:'Wire a renovation',fld:'trade',s:30,base:210,dg:'cert'},{n:'Review contracts',fld:'law',s:65,base:650,dg:'jd'},{n:'Locum shifts',fld:'health',s:60,base:520,dg:'md'},
 {n:'Private tutoring',fld:'public',s:50,base:110},{n:'Courier runs',fld:'delivery',s:0,base:65},{n:'Guest lectures',fld:'academia',s:70,base:300,dg:'phd'},{n:'Interim management',fld:'exec',s:70,base:900,dg:'mba'},
];
const flNew=()=>({rep:10,jobs:[],offers:[],next:0});
const flCap=()=>s.su?0:s.job?1:3;
const flOk=t=>s.st.sma>=t.s&&(!t.dg||s.degs.some(d=>d.p===t.dg));
function flOffers(){const F=s.fl,ok=FLT.filter(flOk),w=t=>1+xpY(t.fld)*2;F.offers=[];
  for(let i=0;i<3&&ok.length;i++){let r=R()*ok.reduce((a,t)=>a+w(t),0),t=ok[0];for(const x of ok)if((r-=w(x))<0){t=x;break}
    const days=rint(5,30),pay=Math.round(t.base*days*(1+Math.min(2,xpY(t.fld)*.25))*(.7+F.rep/100)*s.eco.P*(.85+R()*.3));F.offers.push({id:uid(),n:t.n,fld:t.fld,s:t.s,days,pay})}
  F.next=s.day+7}
function flDay(){const F=s.fl;if(s.day>=F.next)flOffers();
  for(const c of [...F.jobs]){add('hap',-.02);if(s.job)s.perf=clamp(s.perf-.05,0,100);s.xp[c.fld]=(s.xp[c.fld]||0)+1;
    if(--c.left<=0){F.jobs.splice(F.jobs.indexOf(c),1);const q=clamp(.35+(s.st.sma-c.s)/100+xpY(c.fld)/10+R()*.4,0,1),v=Math.round(c.pay*(.7+.3*q));s.cash+=v;taxAdd('ord',v);F.rep=clamp(F.rep+(q-.5)*12,0,100);
      log(`Freelance: <b>${c.n}</b> done. ${q>.75?'The client raved':q>.45?'The client was happy':'The client was lukewarm'}. Paid ${fmt(v)}.`,q>.45?'good':'info')}}}

// ---------- founding a startup: a full-time career with a burn rate, funding rounds, dilution and an exit ----------
const IDEAS=[
 {id:'saas',n:'B2B software',fld:'tech',risk:.3,mult:.8,d:'Steady, sells to businesses, rarely spectacular'},
 {id:'app',n:'Consumer app',fld:'tech',risk:.5,mult:1,d:'Hits or misses on whether people love it'},
 {id:'fin',n:'Fintech',fld:'finance',risk:.45,mult:1.2,d:'Big markets, heavy regulation'},
 {id:'food',n:'Food brand',fld:'food',risk:.35,mult:.5,d:'Easier to start, harder to make huge'},
 {id:'bio',n:'Biotech',fld:'health',risk:.65,mult:2.2,d:'Years of burn for a shot at a cure'},
 {id:'ai',n:'AI lab',fld:'tech',risk:.6,mult:2.5,d:'Everyone wants in, and the costs are enormous'},
];
const IM=Object.fromEntries(IDEAS.map(x=>[x.id,x]));
const SUST=[{n:'Pre-seed',at:0},{n:'Seed',at:150,raise:3e6,val:8e6,team:0,odds:.5},{n:'Series A',at:450,raise:1.5e7,val:3.5e7,team:12,odds:.42},{n:'Series B',at:1050,raise:4e7,val:1.2e8,team:35,odds:.45},{n:'Series C',at:1950,raise:1e8,val:4.5e8,team:90,odds:.5},{n:'IPO',at:3300,val:2e9,team:180}];
const HIRE=550; // a day, per employee: salary, benefits and a desk
const SUNAME=['Nimbus','Quanta','Brightside','Loop','Kettle','Parallax','Orbit','Sprout','Vanta','Fable','Pilot','Harbor','Keystone','Mosaic','Tandem'];
const suBurn=u=>(60+u.hires*HIRE)*s.eco.P+(u.st>=2?suDraw():0);
const suDraw=()=>250*s.eco.P; // founders pay themselves once they raise a Series A
const suRunway=u=>Math.floor(u.cash/Math.max(1,suBurn(u)));
const suWorth=()=>s.su?s.su.own*s.su.val*.5:0; // private shares count at half: you can't sell them yet
const suSeed=()=>clamp(s.cash*.25,1e4*s.eco.P,5e6*s.eco.P);
function found(id){const I=IM[id],v=suSeed();if(!I||s.su||s.cash<v||jailed())return;if(s.job){log(`Quit your job as ${jobTitle()} to start a company.`);fire()}
  mile(`Founded a ${I.n.toLowerCase()} startup.`);s.cash-=v;s.su={idea:id,n:pick(SUNAME)+pick(['',' Labs',' AI',' Co',' HQ']),st:0,prog:0,cash:v,basis:v,own:1,hires:0,val:v,d:s.day,retry:0,fails:0};
  log(`You founded <b>${esc(s.su.n)}</b>, a ${I.n.toLowerCase()} startup, with ${fmt(v)} of your own money.`,'good');return s.su}
function suDay(){const u=s.su,I=IM[u.idea],P=s.eco.P;
  u.cash-=suBurn(u);add('hap',-.04);add('hea',-.01);s.xp[I.fld]=(s.xp[I.fld]||0)+1;
  const nx0=SUST[u.st+1];u.prog=Math.min(nx0&&u.hires<nx0.team?nx0.at:Infinity,u.prog+(.2+s.st.sma/300+Math.min(.3,xpY(I.fld)*.03))*(1+Math.sqrt(u.hires)*.5)*(s.st.hap/60)*(s.eco.rec?.7:1)*(.5+R())); // investors won't talk to you without a team
  if(u.st>=1&&R()<I.risk*.3/365){s.su=null;add('hap',-20);mile(`${esc(u.n)} went under.`);const k=pick(['A regulator shut the product down','The market you built for collapsed','Your co-founder walked out and took the customers','A giant copied you and gave it away free']);log(`<b>${esc(u.n)}</b> is finished. ${k}.`,'bad');toast(`${esc(u.n)} shut down`);(s.car2??={}).dead=(s.car2.dead||0)+1;return}
  if(R()<1/200){const k=pick(['A competitor launched the same thing, cheaper','Your lead engineer quit','A big customer walked away','A server outage lost a week of work']);u.prog=Math.max(0,u.prog-rint(15,40));log(`${esc(u.n)}: ${k}.`,'bad')}
  const nx=SUST[u.st+1];
  if(nx&&u.prog>=nx.at&&!u.offer&&s.day>=u.retry){
    if(nx.n==='IPO'){if(u.hires<nx.team)return;const V=nx.val*I.mult*(.5+R())*(s.eco.rec?.6:1)*P;return suExit(V,'ipo')}
    if(u.hires<nx.team){}
    else if(R()<nx.odds*(1-I.risk*.5)+(u.prog-nx.at)/(nx.at*4)-(s.eco.rec?.25:0)+(world('techboom')?.15:0)){const pre=Math.round(nx.val*I.mult*(.6+R()*.9)*(s.eco.rec?.6:1)*(world('techboom')?1.5:1)*P),raise=Math.round(nx.raise*P*(.8+R()*.4));u.offer={pre,raise,d:s.day};log(`${esc(u.n)}: investors offer <b>${fmt(raise)}</b> at a ${fmt(pre)} valuation for a ${nx.n}.`,'good');toast(`${nx.n} offer for ${esc(u.n)}`)}
    else if(++u.fails>=3){const back=Math.max(0,u.cash)*u.own;s.cash+=back;capGain(back-u.basis,u.d);s.su=null;add('hap',-20);mile(`Wound down ${esc(u.n)}.`);(s.car2??={}).dead=(s.car2.dead||0)+1;log(`Nobody will fund <b>${esc(u.n)}</b>'s ${nx.n}. You wind it down and get back ${fmt(back)}.`,'bad');toast(`${esc(u.n)} wound down`);return}
    else{u.retry=s.day+90;u.prog-=(nx.at-SUST[u.st].at)*.2;log(`${esc(u.n)}: investors passed on your ${nx.n}. You rework the plan and can pitch again in 90 days. ${u.fails===2?'One more no and the company is finished.':''}`,'bad')}}
  if(u.offer&&s.day-u.offer.d>30){delete u.offer;u.retry=s.day+30;log(`${esc(u.n)}: the funding offer expired.`)}
  if(u.st>=1&&!u.acq&&R()<1/900){const v=Math.round(u.val*(.4+R()*.8));u.acq={v,d:s.day};log(`${esc(u.n)}: a big company offers to buy you for <b>${fmt(v)}</b>.`,'good');toast('Acquisition offer!')}
  if(u.acq&&s.day-u.acq.d>30)delete u.acq;
  if(u.cash<0){s.su=null;add('hap',-20);mile(`${esc(u.n)} ran out of money.`);log(`<b>${esc(u.n)}</b> ran out of money and shut down. Most startups do.`,'bad');toast(`${esc(u.n)} shut down`);(s.car2??={}).dead=(s.car2.dead||0)+1}
}
function suRaise(){const u=s.su,o=u?.offer;if(!o)return;u.fails=0;u.cash+=o.raise;u.own*=o.pre/(o.pre+o.raise);u.val=o.pre+o.raise;u.st++;delete u.offer;add('hap',8);
  const m=`${esc(u.n)} closed its ${SUST[u.st].n}: ${fmt(o.raise)} at a ${fmt(u.val)} valuation. You own ${(u.own*100).toFixed(1)}%.`;log(m,'good');return m}
function suExit(v,kind){const u=s.su,mine=Math.round(u.own*v);s.su=null;(s.car2??={})[kind]=(s.car2[kind]||0)+1;add('hap',kind==='ipo'?30:20);
  mile(kind==='ipo'?`Took ${esc(u.n)} public.`:`Sold ${esc(u.n)} for ${fmt(v)}.`);
  if(kind==='ipo'){const now=Math.round(mine*.2);s.cash+=now;capGain(now-u.basis*.2,u.d);s.later.push({d:s.day+180,k:'x',id:'lockup',v:mine-now,b:u.basis*.8,f:u.d,n:u.n});
    const m=`<b>${esc(u.n)}</b> went public at a ${fmt(v)} valuation! You sold ${fmt(now)} of shares; the rest, ${fmt(mine-now)}, unlocks in 180 days.`;log(m,'good');toast(`${esc(u.n)} IPO!`);return m}
  s.cash+=mine;capGain(mine-u.basis,u.d);const m=`You sold <b>${esc(u.n)}</b> for ${fmt(v)}. Your ${(u.own*100).toFixed(1)}% came to ${fmt(mine)}.`;log(m,'good');toast('Sold your startup!');return m}
LATER.lockup=p=>{const v=Math.round(p.v*(.6+R()));s.cash+=v;capGain(v-p.b,p.f);log(`Your ${esc(p.n)} lockup ended. The rest of your shares sold for ${fmt(v)}.`,'good')};
LATER.ethics=()=>{if(s.job&&R()<.25){const j=jobTitle(),sev=Math.round(jobPay()*30);fire();s.cash+=sev;taxAdd('ord',sev);log(`The expense scandal broke and your team was cut. You lost your job as ${j}, with ${fmt(sev)} severance.`,'bad')}};
const EV4=[
{id:'rival',w:1.5,c:()=>s.job&&!topRank()&&mates().length>0,a:()=>pick(mates())?.uid,t:'A rival',d:(s,a)=>`${esc(per(a)?.n||'A coworker')} is going for the same promotion as you, and they're good.`,def:0,ch:[
 ['Outwork them',()=>{s.perf=clamp(s.perf+4,0,100);add('hap',-3);return 'Late nights. Your numbers look great.'}],
 ['Undermine them',(s,a)=>{const p=per(a);if(!p)return 'The moment has passed.';if(R()<.6){s.perf=clamp(s.perf+6,0,100);prel(p,-30);return `A few well-placed doubts. ${p.n} is out of the running.`}s.perf=clamp(s.perf-10,0,100);prel(p,-30);const b=boss();if(b)prel(b,-15);return 'It got back to your boss. Not a good look.'}],
 ['Offer to team up',(s,a)=>{const p=per(a);if(!p)return 'The moment has passed.';prel(p,12);s.perf=clamp(s.perf+2,0,100);return `You and ${p.n} are a team now.`}]]},
{id:'weekend',w:1.5,c:()=>!!(s.job&&boss()),t:'Working the weekend',d:()=>`${esc(boss()?.n||'Your boss')} asks you to come in this weekend to finish a project.`,def:0,ch:[
 ['Sure',()=>{s.perf=clamp(s.perf+5,0,100);add('hap',-4);const b=boss();if(b)prel(b,6);return 'Your boss owes you one.'}],
 ['I have plans',()=>{add('hap',2);const b=boss();if(b)prel(b,-6);return 'Your boss says "no worries" in the tone that means worries.'}]]},
{id:'ethics',w:.8,c:()=>!!(s.job&&boss()),t:'Creative accounting',d:()=>`You notice ${esc(boss()?.n||'your boss')} padding expense reports. A lot.`,def:1,ch:[
 ['Report it',()=>{const b=boss();if(!b)return 'The moment has passed.';if(R()<.5){s.people.splice(s.people.indexOf(b),1);const nb=meet('boss',60,s.day-rint(35,55)*365);nb.bt=pick(['fair','fair','micro','absent']);s.perf=clamp(s.perf+5,0,100);add('hap',4);return `${b.n} was fired. Your new boss, ${nb.n}, respects what you did.`}s.perf=clamp(s.perf-15,0,100);prel(b,-30);add('hap',-6);return `HR "looked into it". Now ${b.n} knows it was you.`}],
 ['Stay quiet',()=>{s.later.push({d:s.day+rint(60,300),k:'x',id:'ethics'});return 'Not your problem. Probably.'}]]},
];
function suHtml(){const u=s.su;if(!u)return '';const I=IM[u.idea],nx=SUST[u.st+1],P=s.eco.P,rw=suRunway(u),hc=HIRE*P*90,cur=SUST[u.st];
  const offer=u.offer?`<div class="need"><div><div class="k hot">${nx.n} offer · ${30-(s.day-u.offer.d)} days left</div><div class="t">${fmt(u.offer.raise)} at a ${fmt(u.offer.pre)} valuation</div><div class="d">You would own ${(u.own*u.offer.pre/(u.offer.pre+u.offer.raise)*100).toFixed(1)}% afterwards, and the company would have ${fmt(u.cash+u.offer.raise)} to grow with.</div></div><div class="acts2"><button class="pri" data-a="suraise">Take the money</button><button data-a="sudecline">Pass</button></div></div>`:'';
  const acq=u.acq?`<div class="need"><div><div class="k hot">Acquisition offer · ${30-(s.day-u.acq.d)} days left</div><div class="t">Sell for ${fmt(u.acq.v)}</div><div class="d">Your ${(u.own*100).toFixed(1)}% would come to <b class="num">${fmt(u.own*u.acq.v)}</b>, taxed as a capital gain (long-term after a year).</div></div><div class="acts2"><button class="pri" data-a="suacq">Sell</button><button data-a="suacqno">Decline</button></div></div>`:'';
  return `<div class="sec-h"><h2>${esc(u.n)}</h2><span>${I.n} · ${cur.n} · ${((s.day-u.d)/365).toFixed(1)} years old</span></div>
  ${offer||acq?`<div class="needs">${offer}${acq}</div>`:''}
  <div class="stats4 eco">${[[nx?`Progress to ${nx.n}`:'Progress',nx?`${Math.floor(u.prog)} / ${nx.at}`:'—'],['Company cash',fmt(u.cash)],['Runway',`<span class="${rw<90?'dn':''}">${rw} days</span>`],['You own',`${(u.own*100).toFixed(1)}%`],['Valuation',fmt(u.val)]].map(([l,v])=>`<div><span>${l}</span><b class="num">${v}</b></div>`).join('')}</div>
  ${nx?meter(Math.min(100,(u.prog-cur.at)/(nx.at-cur.at)*100)):''}
  <div class="quick" style="margin-top:var(--space-xs)"><button class="pri" data-a="suhire" ${u.cash<hc?'disabled':''}>Hire · ${fmt(HIRE*P)}/day</button><button data-a="suhire" data-x="5" ${u.cash<hc*5?'disabled':''}>Hire 5</button><button data-a="sufire" ${u.hires?'':'disabled'}>Let someone go</button><button data-a="sufund" ${s.cash<1e4*P?'disabled':''}>Put in ${fmt(Math.max(1e4*P,s.cash*.25))} more</button><button class="bad" data-a="sukill">Shut it down</button></div>
  <p class="mut" style="margin-top:var(--space-2xs)">${u.hires} employee${u.hires===1?'':'s'}${nx&&u.hires<nx.team?`. <span class="dn">Investors want a team of ${nx.team} before a ${nx.n}</span>`:''}. Burning ${fmt(suBurn(u))} a day${u.st>=2?`, including your ${fmt(suDraw())} salary`:', and you pay yourself nothing until a Series A'}. Hiring speeds progress but shortens your runway; you need 90 days of their pay in the bank to hire.</p>`}
function flHtml(){const F=s.fl,cap=flCap();if(!cap)return '';
  return `<div class="sec-h"><h2>Freelance</h2><span>reputation ${Math.round(F.rep)} · ${F.jobs.length} of ${cap} contract${cap>1?'s':''}${s.job?' alongside your job':''}</span></div>
  ${F.jobs.length?`<table class="ledger"><tbody>${F.jobs.map(c=>`<tr><td><b>${c.n}</b> <span class="mut">${FIELD[c.fld]}</span></td><td style="width:25%">${meter((1-c.left/c.days)*100)}</td><td class="r">${c.left}d left</td><td class="r num">${fmt(c.pay)}</td><td class="act"><button data-a="fldrop" data-x="${c.id}">Drop</button></td></tr>`).join('')}</tbody></table>`:''}
  ${F.offers.length?`<div class="scroll"><table class="ledger"><thead><tr><th>Offer</th><th>Field</th><th class="r">Days</th><th class="r">Pays about</th><th></th></tr></thead><tbody>${F.offers.map(o=>`<tr><td><b>${o.n}</b></td><td class="mut">${FIELD[o.fld]}</td><td class="r num">${o.days}</td><td class="r num">${fmt(o.pay)}</td><td class="act"><button class="pri" data-a="flt" data-x="${o.id}" ${F.jobs.length>=cap?'disabled':''}>Take it</button></td></tr>`).join('')}</tbody></table></div>`:'<p class="mut">No offers right now. New ones come in every 7 days.</p>'}`}
const teamHtml=()=>{const b=boss(),m=mates();if(!s.job||!b&&!m.length)return '';return `<div class="sec-h"><h2>Your team</h2>${b&&BOSSES[b.bt]?`<span>${esc(b.n)} is a ${BOSSES[b.bt].n.toLowerCase()} boss: ${BOSSES[b.bt].d}</span>`:''}</div><div class="plist">${[b,...m].filter(Boolean).map(personRow).join('')}</div>`};
const foundHtml=()=>s.su?'':`<div class="sec-h"><h2>Start a company</h2><span>a full-time career: you quit your job to found it</span></div>
  <div class="acards">${IDEAS.map(I=>`<button class="acard" data-a="found" data-x="${I.id}" ${s.cash<suSeed()||jailed()?'disabled':''}><b>${I.n}</b><span>${I.d}.${xpY(I.fld)>=1?` Your ${FIELD[I.fld]} experience helps.`:''}</span><small>${s.cash<suSeed()?`Needs ${fmt(1e4*s.eco.P)} to start`:`Found with ${fmt(suSeed())}`}</small></button>`).join('')}</div>`;

// ---------- the family tree: a record of every generation, carried from heir to heir ----------
function lifeRec(){const w=netWorth(),pt=partner();return {gen:s.gen,n:s.name,age:Math.floor(age()),cause:s.dead?(s.cause||'of old age'):null,nw:Math.round(w),real:Math.round(w/s.eco.P),
  job:s.job?jobTitle():s.su?`Founder of ${s.su.n}`:s.pension?'Retired':'Out of work',kids:kids().length,sp:pt?.role==='spouse'?pt.n:null,tr:s.tr||[],edu:EDU[s.edu].n,
  exits:(s.car2?.acq||0)+(s.car2?.ipo||0),rec:s.legal.rec.length,mile:(s.mile||[]).slice(-40),given:Math.round(s.given||0),goals:Object.values(s.goals).filter(g=>g.gen===s.gen).length}}
function legacyHtml(){const T=[...(s.tree||[]),lifeRec()],top=Math.max(1,...T.map(r=>r.real)),founder=T[0].n,tot=T.reduce((a,r)=>a+r.real,0);
  return `<section class="lede solo"><div><h2 class="headline">The family of ${esc(founder)}</h2><p class="dek">${T.length===1?`The first generation. Everything starts with ${esc(s.name)}.`:`${T.length} generations so far. Together they built <b class="num">${fmt(tot)}</b> in today's money, and reached ${Object.keys(s.goals).length} of ${GOALS.length} family goals.`}${s.given?` They have given away <b class="num">${fmt(T.reduce((a,r)=>a+r.given,0))}</b>.`:''}</p></div></section>
  <div class="sec-h"><h2>Fortune by generation</h2><span>net worth in today's money${T.length>1?', at death':''}</span></div>
  <div class="gbars">${T.map(r=>`<div><span class="mut">${r.gen}</span><i style="width:${Math.max(1,Math.sqrt(Math.max(0,r.real)/top)*100)}%"></i><b class="num">${fmt(r.real)}</b></div>`).join('')}</div>
  <div class="sec-h"><h2>Every generation</h2></div>
  <div class="gens">${T.map((r,i)=>{const now=i===T.length-1,known=[trTxt(r.tr),r.exits?`${r.exits} startup exit${r.exits>1?'s':''}`:'',r.given>=1e6?`gave ${fmt(r.given)}`:'',r.rec?`${r.rec} conviction${r.rec>1?'s':''}`:'',r.goals?`${r.goals} goal${r.goals>1?'s':''}`:''].filter(Boolean).join(' · ');
    return `<div class="gen${now?' now':''}"><div class="gh"><span class="mut">Generation ${r.gen}</span><b>${esc(r.n)}${now?' <span class="mut">(you)</span>':''}</b><span class="num">${fmt(r.nw)}</span></div>
    <p>${r.cause?`Lived to ${r.age}, died ${esc(r.cause)}.`:`${r.age} and counting.`} ${esc(r.job)}, ${r.edu.toLowerCase()}. ${r.sp?`Married to ${esc(r.sp)}`:'Single'}${r.kids?`, ${r.kids} kid${r.kids>1?'s':''}`:''}.</p>
    ${known?`<p class="mut">${known}</p>`:''}
    ${r.mile?.length&&!now?`<details><summary>Their story</summary><ol class="story">${r.mile.map(m=>`<li><span class="num">${m.a}</span><span>${m.t}</span></li>`).join('')}</ol></details>`:''}</div>`}).join('')}</div>
  ${trustHtml()}
  ${givingHtml()}`}

// ---------- giving: donations are tax-deductible up to 60% of the year's income; a foundation keeps giving after you're gone ----------
function donate(v,to){v=Math.min(v,Math.max(0,s.cash));if(v<1)return 0;s.cash-=v;taxRoll();const T=s.tax,room=donRoom(),ded=Math.min(v,room);T.don=(T.don||0)+ded;if(ded)taxAdd('ord',-ded);
  if(to==='fdn'){s.fdn=(s.fdn||0)+v}else{s.given=(s.given||0)+v;add('hap',Math.min(15,2+Math.log10(v)*1.5));s.fol+=Math.round(Math.sqrt(v)/5)}return ded}
function fdnDay(){if(!s.fdn)return;const g=s.fdn*.05/365;s.fdn*=1+.07/365;s.fdn-=g;s.given=(s.given||0)+g;add('hap',Math.min(.02,Math.log10(1+g)*.004));s.fol+=g/2000}
const donRoom=()=>{const T=s.tax;return Math.max(0,(T.ord+(T.don||0))*.6-(T.don||0))}; // 60% of the year's income before deductions
function givingHtml(){const P=s.eco.P,c=s.cash,room=donRoom();
  const amts=[.01,.1,.25].map(f=>Math.round(c*f)).filter(v=>v>=100);
  return `<div class="sec-h"><h2>Giving</h2><span>${s.given?`${fmt(s.given)} given this lifetime`:'nothing given yet'}</span></div>
  <p class="mut">Donations lift your mood and your name, and cut your income tax: up to ${fmt(room)} more this year is deductible (60% of your income).${s.fdn?'':` Put ${fmt(1e6*P)} or more into a family foundation and it grants 5% a year forever, even after you die.`}</p>
  <div class="quick" style="margin-top:var(--space-xs)">${amts.map(v=>`<button data-a="give" data-x="${v}">Donate ${fmt(v)}</button>`).join('')||'<span class="mut">Save a little first.</span>'}${c>=1e6*P||s.fdn?`<button class="pri" data-a="give" data-x="${Math.round(Math.max(1e6*P,c*.1))}" data-y="fdn">${s.fdn?'Add':'Endow a foundation with'} ${fmt(Math.max(1e6*P,c*.1))}</button>`:''}</div>
  ${s.fdn?`<p class="mut" style="margin-top:var(--space-2xs)">The family foundation holds <b class="num">${fmt(s.fdn)}</b> and grants about <b class="num">${fmt(s.fdn*.05)}</b> a year. It isn't part of your net worth, and it passes to your heir.</p>`:''}`}

// ---------- property condition: wear, fixer-uppers and renovation ----------
const cmul=p=>(.7+.3*(p.cond??100)/100)*(p.rv?1.08:1);
const lval=l=>PM[l.t].base*l.m*s.re.idx*cmul(l);
const renoCost=p=>PM[p.t].base*p.m*s.re.idx*(.02+.18*(100-(p.cond??100))/100+(p.rv?0:.05));
const condWord=c=>(c??100)>=85?'Good':(c??100)>=60?'Worn':'Needs work';
function propDay(){for(const p of s.props){
  if(p.reno){if(s.day>=p.reno){p.cond=100;p.rv=1;delete p.reno;if(s.home!==p.uid)p.from=s.day+rint(10,30);log(`The renovation of your ${pname(p)} is finished. It's worth ${fmt(pval(p))} now.`,'good')}continue}
  p.cond=Math.max(0,(p.cond??100)-(renting(p)?1.5:.8)/365);
  if(renting(p)&&!p.reno&&R()<1/(3*365)){p.from=s.day+Math.round(rint(10,40)*(s.eco.rec?2:1));log(`Your tenants at ${pname(p)} moved out. Finding new ones.`)}}}
const EV5=[
{id:'latepay',w:s=>s.props.some(p=>renting(p))?1.2:0,c:s=>s.props.some(p=>renting(p)),a:s=>pick(s.props.filter(p=>renting(p)))?.uid,t:'Rent is late',d:(s,a)=>`The tenants at your ${P(a)?pname(P(a)):'rental'} have stopped paying. They say they lost their jobs.`,def:1,ch:[
 ['Evict them',(s,a)=>{const p=P(a);if(!p)return 'The moment has passed.';const v=Math.round(2500*s.eco.P);s.cash-=v;p.from=s.day+rint(45,90);add('hap',-2);return `Lawyers cost ${fmt(v)}, and the place sits empty for a while.`}],
 ['Offer a payment plan',(s,a)=>{const p=P(a);if(!p)return 'The moment has passed.';p.from=s.day+30;if(R()<.7)s.later.push({d:s.day+120,k:'cash',v:Math.round(rentOf({...p,from:0})*30),m:'Your tenants caught up on the back rent:'});add('hap',2);return 'A month without rent. They promise to catch up.'}]]},
{id:'damage',w:s=>s.props.some(p=>renting(p))?1:0,c:s=>s.props.some(p=>renting(p)),a:s=>pick(s.props.filter(p=>renting(p)))?.uid,t:'Trashed',d:(s,a)=>`A neighbor sends photos: your tenants at ${P(a)?pname(P(a)):'your rental'} threw a party that went very wrong.`,def:0,ch:[
 ['Keep the deposit and repair it',(s,a)=>{const p=P(a);if(!p)return 'The moment has passed.';p.cond=Math.max(0,(p.cond??100)-8);return 'The deposit covers most of it. Most.'}],
 ['Take them to court',(s,a)=>{const p=P(a);if(!p)return 'The moment has passed.';p.cond=Math.max(0,(p.cond??100)-15);if(R()<.6){const v=Math.round(5000*s.eco.P);s.cash+=v;return `You won ${fmt(v)} in damages.`}return 'The judge sided with them. You pay for the repairs.'}]]},
{id:'roof',w:s=>s.props.length?1:0,c:s=>s.props.length>0,a:s=>pick(s.props)?.uid,t:'The roof',d:(s,a)=>{const p=P(a);return p?`The roof on your ${pname(p)} is leaking. A proper fix is <b>${fmt(pval(p)*.015)}</b>.`:'A leak.'},def:1,ch:[
 ['Fix it properly',(s,a)=>{const p=P(a);if(!p)return 'The moment has passed.';s.cash-=pval(p)*.015;return 'Good as new.'}],
 ['Patch it',(s,a)=>{const p=P(a);if(!p)return 'The moment has passed.';s.cash-=pval(p)*.003;p.cond=Math.max(0,(p.cond??100)-12);return 'It holds, for now. The place looks tired.'}]]},
];

// ---------- world events: rare shocks that hit health, the economy, markets and property at once ----------
const WORLD={
 pandemic:{n:'Pandemic',rate:1/40,len:[400,700],d:'Illness spreads fast, restaurants and gyms empty out, and apps boom.'},
 techboom:{n:'Tech boom',rate:1/25,len:[600,1100],d:'Tech stocks run hot and investors throw money at startups.'},
};
const world=k=>s.world?.id===k&&s.day<s.world.end;
const worldBiz=b=>world('pandemic')?(['lemon','truck','cafe','gym','hotel','wash'].includes(b.id)?.55:b.id==='app'?1.25:1):1;
function worldDay(){
  if(s.world&&s.day>=s.world.end){log(`The ${WORLD[s.world.id].n.toLowerCase()} is over.`,'good');s.world=null}
  if(s.world)return;
  for(const k in WORLD)if(R()<WORLD[k].rate/365){const W=WORLD[k];s.world={id:k,start:s.day,end:s.day+rint(...W.len)};log(`<b>${W.n}.</b> ${W.d}`,k==='pandemic'?'bad':'info');toast(W.n);chirp('@MarketWire','MarketWire',{pandemic:'BREAKING: health officials declare a pandemic. markets in freefall',techboom:'tech is on fire. every startup is raising',housing:'house prices up double digits again. buyers lining up around the block'}[k],1);
    if(k==='pandemic'){crash(false);s.eco.g=Math.min(s.eco.g,-.8);if(!cond('flu')&&R()<.4)addCond('flu')}
    if(k==='techboom')for(const t of STOCKS)if(t.sec==='Tech'||t.sec==='Semis')s.px[t.t].gr=s.world.end;
    return}
  if(R()<1/(15*365)&&s.props.length){const hit=s.props.filter(()=>R()<.5);if(!hit.length)return;for(const p of hit)p.cond=Math.max(0,(p.cond??100)-rint(10,35));add('hap',-5);
    const m=`A storm tore through town and damaged ${hit.length===1?`your ${pname(hit[0])}`:`${hit.length} of your properties`}.`;log(m,'bad');toast('Storm damage')}
}

// ---------- partners: a personality, a career of their own, weddings, prenups and what divorce really costs ----------
const PERS={romantic:{n:'Romantic',d:'date nights mean the world to them'},ambitious:{n:'Ambitious',d:'admires drive, and minds when you have no work'},homebody:{n:'Homebody',d:'happiest at home with family'},adventurous:{n:'Adventurous',d:'lives for trips away'},jealous:{n:'Jealous',d:'hates it when you go out without them'}};
const PJOBS=['retail','chef','admin','elec','police','design','dev','teacher','nurse','analyst','swe','lawyer','resident'];
function partnerNew(p){if(p.pt)return p;p.pt=pick(Object.keys(PERS));p.gs??=rint(30,80);p.gl??=rint(30,80);const ok=PJOBS.filter(j=>JM[j].s<=p.gs+5);p.job=ok.length&&R()<.85?pick(ok.slice(-5)):null;return p}
const spouseInc=()=>{const p=partner();return p?.role==='spouse'&&p.job?JM[p.job].pay*.5*city().pay:0}; // half of their pay goes into the household (job pay already follows prices)
function married(p){p.role='spouse';p.wed=s.day;mile(`Married ${esc(p.n)}.`);p.wedNW=Math.max(0,netWorth());if(!s.inbox.some(i=>i.id==='wedding'))s.inbox.push({id:'wedding',d:s.day,a:p.uid})}
function payOut(v){ // a big bill: cash first, then savings, then the index fund at today's price; whatever is left becomes debt
  let r=v;const c=Math.min(r,Math.max(0,s.cash));s.cash-=c;r-=c;const F=s.fin;
  if(r>0&&F){const a=Math.min(r,F.sav);F.sav-=a;r-=a;
    if(r>0&&F.fu>0){const px=fundPx(),f=Math.min(1,r/(F.fu*px)),u=F.fu*f,v=u*px,cb=F.fc*f;F.fu-=u;F.fc-=cb;capGain(v-cb,F.fd);const t=Math.min(r,v);r-=t;s.cash+=v-t;log(`Sold ${fmt(v)} of your index fund to cover it.`)}}
  s.cash-=r;return v}
function divCost(p){const gain=Math.max(0,netWorth()-(p.wedNW||0));return Math.round(gain*.5+(p.pre?0:(p.wedNW||0)*.25)+2e4*s.eco.P)} // half of what you built together, and without a prenup a share of what you brought in
const persLine=p=>p.pt?`${PERS[p.pt].n}: ${PERS[p.pt].d}${p.job?` · ${JM[p.job].n}`:''}${p.role==='spouse'&&p.pre?' · prenup signed':''}`:'';
const EV6=[
{id:'wedding',w:0,c:()=>partner()?.role==='spouse',t:'The wedding',d:()=>`Time to plan the wedding with ${esc(partner()?.n||'your partner')}.`,def:0,ch:[
 ['Courthouse, then pizza',()=>{const p=partner();if(!p)return 'The moment has passed.';s.cash-=500*s.eco.P;add('hap',5);return 'Quick, cheap and perfect.'}],
 ['A classic wedding',()=>{const p=partner();if(!p)return 'The moment has passed.';s.cash-=3e4*s.eco.P;prel(p,10);add('hap',12);for(const q of s.people)if(q.role==='friend'||q.role==='parent')prel(q,5);return 'Everyone you love, in one room. A day to remember.'}],
 ['Go big',()=>{const p=partner();if(!p)return 'The moment has passed.';const v=Math.max(2.5e5*s.eco.P,netWorth()*.01);s.cash-=v;prel(p,15);add('hap',18);const f=Math.round(1000+s.fol*.1);s.fol+=f;return `A wedding people will talk about for years. It cost ${fmt(v)}, and brought +${big(f)} followers.`}]]},
{id:'prenup',w:1.5,c:()=>partner()?.role==='date'&&partner().rel>=45&&netWorth()>2.5e5*s.eco.P&&!partner().pre,t:'The prenup talk',d:()=>`Things are getting serious with ${esc(partner()?.n||'your partner')}. Your lawyer says to get a prenup before any wedding: it keeps what you have now out of a divorce.`,def:1,ch:[
 ['Ask for a prenup',()=>{const p=partner();if(!p)return 'The moment has passed.';if(R()<.75){p.pre=1;prel(p,-8);return `${p.n} signs, a little hurt.`}prel(p,-20);return `${p.n} is offended you even asked.`}],
 ['Trust them',()=>{const p=partner();if(p)prel(p,3);return 'Love conquers all. Hopefully.'}]]},
{id:'tempt',w:s=>partner()?.role==='spouse'&&partner().rel<60?1.2:.2,c:()=>partner()?.role==='spouse',t:'Temptation',d:()=>`${pick(['An old flame','A coworker','Someone at the gym'])} has been flirting with you, and ${esc(partner()?.n||'your spouse')} has felt distant lately.`,def:1,ch:[
 ['Go for it',()=>{const p=partner();if(!p)return 'The moment has passed.';add('hap',8);if(R()<.35){prel(p,-50);if(p.rel<15&&R()<.5){const m=endRel(p,1);log(esc(m),'bad');return `${p.n} found out. ${m}`}return `${p.n} found out. Things are very bad at home.`}return 'Nobody knows. You tell yourself it meant nothing.'}],
 ['Walk away',()=>{const p=partner();if(p)prel(p,4);return 'You go home and plan a date night instead.'}]]},
{id:'anniv',w:s=>{const p=partner();return p?.role==='spouse'&&(s.day-p.wed)%365<30&&s.day-p.wed>300?3:0},c:()=>partner()?.role==='spouse'&&s.day-partner().wed>300,t:'Your anniversary',d:()=>`It's your anniversary with ${esc(partner()?.n||'your spouse')}.`,def:1,ch:[
 ['Plan something special',()=>{const p=partner();if(!p)return 'The moment has passed.';const v=Math.round(clamp(netWorth()*.002,200,5e4));s.cash-=v;prel(p,p.pt==='romantic'?16:10);add('hap',5);return `${fmt(v)} well spent. ${p.n} is glowing.`}],
 ['Oops, forgot',()=>{const p=partner();if(p)prel(p,p.pt==='romantic'?-18:-10);return 'The silence at dinner is deafening.'}]]},
];

// ---------- cities: where you live sets your pay, your costs, house prices and state income tax ----------
const CITIES={
 suburb:{n:'The suburbs',d:'Where you grew up. Average pay, average prices',pay:1,cost:1,home:1,tax:.045,hap:0},
 metro:{n:'Big city',d:'Top salaries, sky-high rents and a state income tax',pay:1.3,cost:1.45,home:1.8,tax:.065,hap:-.005},
 coast:{n:'Coastal city',d:'Beautiful, expensive, great hospitals, and the highest state tax',pay:1.2,cost:1.35,home:1.6,tax:.08,hap:.02},
 sun:{n:'Sunbelt city',d:'No state income tax, warm winters, and a boom in jobs',pay:1.05,cost:1.05,home:1.1,tax:0,hap:.008},
 town:{n:'Small town',d:'Cheap living and quiet streets, but lower pay',pay:.8,cost:.72,home:.55,tax:.04,hap:.01},
};
const city=()=>CITIES[s.city||'suburb'];
const cityTax=()=>city().tax;
const moveCost=()=>Math.round((5000+s.props.length*0+kids().filter(k=>ageOf(k)<18).length*1500)*s.eco.P*(1+s.cars.length*.1));
function moveTo(id){const C=CITIES[id];if(!C||id===(s.city||'suburb')||jailed())return;const c=moveCost();if(s.cash<c)return;s.cash-=c;
  const old=city().n,lost=[];if(s.job&&!(R()<.3)){lost.push(`left your job as ${jobTitle()}`);fire()}
  const h=homeP();if(h){s.home=null;h.from=s.day+rint(10,30);lost.push(`put your ${pname(h)} up for rent`)}
  for(const p of s.people)if(p.role==='friend'||p.role==='parent'||p.role==='sibling')prel(p,p.role==='friend'?-15:-6);
  s.city=id;relist();add('hap',-4);mile(`Moved to ${C.n.toLowerCase().replace(/^the /,'the ')}.`);
  log(`Moved from ${old.toLowerCase()} to ${C.n.toLowerCase()} for ${fmt(c)}.${lost.length?` You ${lost.join(' and ')}.`:''}${s.job?' Your employer let you transfer.':''}`,'good');return c}
function cityHtml(){const cur=s.city||'suburb',c=moveCost();
  return `<div class="sec-h"><h2>Where you live</h2><span>${city().n}</span></div>
  <div class="acards">${Object.entries(CITIES).map(([k,C])=>`<button class="acard${k===cur?' on':''}" data-a="move" data-x="${k}" ${k===cur||s.cash<c?'disabled':''} aria-pressed="${k===cur}"><b>${C.n}</b><span>${C.d}. Pay ${C.pay>=1?'+':''}${Math.round((C.pay-1)*100)}%, living costs ${C.cost>=1?'+':''}${Math.round((C.cost-1)*100)}%, homes ${C.home>=1?'+':''}${Math.round((C.home-1)*100)}%, state tax ${(C.tax*100).toFixed(1)}%.</span><small>${k===cur?'You live here':`Move for ${fmt(c)}`}</small></button>`).join('')}</div>
  <p class="mut" style="margin-top:var(--space-2xs)">Moving usually means a new job (about one employer in three lets you transfer), your home goes up for rent, and friends drift a little. Properties you own stay where they are.</p>`}

// ---------- old age: Social Security from 67 for anyone who worked, and care when health fails ----------
const SS_AGE=67;
function ssBenefit(){const yrs=(s.wage||0)>0?Math.min(35,xpT()):0,avg=(s.wage||0)/Math.max(35*365,1);return Math.round(Math.min(130*s.eco.P,avg*.42+(yrs>=10?10*s.eco.P:0)))} // about 40% of your average pay over 35 years, capped
const careCost=()=>!s.rc&&age()>=75&&s.st.hea<35?160*s.eco.P:0; // a retirement community includes care
function oldDay(A){
  if(s.job)s.wage=(s.wage||0)+jobPay();
  if(A>=SS_AGE&&!s.ss&&(s.wage||0)>0){s.ss=ssBenefit();s.pension=(s.pension||0)+s.ss;log(`Social Security starts: ${fmt(s.ss)} a day for life.`,'good');toast('Social Security starts')}
  if(careCost()&&!s.care){s.care=1;log(`You need help at home now. Care costs ${fmt(careCost())} a day.`,'bad')}else if(!careCost())s.care=0;
}

// ---------- politics: campaigns cost money and need a following; in office, approval decides what happens next ----------
const OFFICES=[
 {id:'council',n:'City council',fol:5e3,cost:5e4,pay:120,part:1,limit:0,d:'A part-time seat. You can keep your day job.'},
 {id:'mayor',n:'Mayor',fol:5e4,cost:6e5,pay:450,limit:0,need:'council',d:'Run the city. It is a full-time job.'},
 {id:'gov',n:'Governor',fol:5e5,cost:2.5e7,pay:650,limit:2,need:'mayor',d:'Run the state, for at most two terms.'},
 {id:'pres',n:'President',fol:5e6,cost:6e8,pay:1100,limit:2,need:'gov',d:'The top job, for at most two terms.'},
];
const OM=Object.fromEntries(OFFICES.map(o=>[o.id,o])),TERM=4*365,CAMP=90;
const polNew=()=>({held:{},cur:null,camp:null,app:50,terms:0});
const polCost=o=>o.cost*s.eco.P;
function polOdds(o){const P=s.pol,f=Math.log10(Math.max(1,s.fol)/o.fol);return clamp(.35+f*.25+(s.st.loo-50)/300+(s.st.sma-50)/300-crimes(10).length*.2+(P.cur?(P.app-50)/120:0)+(s.eco.rec?-.05:0),.03,.9)}
function polMiss(o){const P=s.pol,m=[];if(o.need&&!P.held[o.need])m.push(`serve as ${OM[o.need].n.toLowerCase()} first`);if(age()<(o.id==='pres'?35:21))m.push(`be ${o.id==='pres'?35:21}`);if(s.fol<o.fol*.2)m.push(`${big(o.fol*.2)} followers`);if(o.limit&&(P.held[o.id]||0)>=o.limit&&P.cur!==o.id)m.push('term limit reached');return m}
function runFor(id){const o=OM[id],P=s.pol;if(!o||P.camp||polMiss(o).length||s.cash<polCost(o)||jailed())return;s.cash-=polCost(o);P.camp={id,end:s.day+CAMP,odds:polOdds(o)};log(`You launched a campaign for ${o.n.toLowerCase()}, spending ${fmt(polCost(o))}.`,'good');return P.camp}
function polDay(){const P=s.pol;if(!P)return;
  if(P.camp&&s.day>=P.camp.end){const o=OM[P.camp.id],re=P.cur===o.id,won=R()<P.camp.odds;P.camp=null;
    if(won){if(!re){if(!o.part&&s.job){log(`You left your job as ${jobTitle()} to take office.`);fire()}P.cur=o.id;P.app=55;P.terms=0}P.terms++;P.held[o.id]=(P.held[o.id]||0)+1;P.until=s.day+TERM;add('hap',15);s.fol+=Math.round(o.fol*.2);const to=o.id==='council'?'to city council':o.n.toLowerCase();mile(`${re?'Re-elected':'Elected'} ${to}.`);log(`<b>You won!</b> ${re?'Re-elected':'Elected'} ${to}.`,'good');toast(`Elected ${to}!`)}
    else{if(re){P.cur=null;log(`You lost your re-election as ${o.n.toLowerCase()}.`,'bad')}else log(`You lost the race for ${o.n.toLowerCase()}.`,'bad');add('hap',-12);toast('You lost the election')}}
  if(!P.cur)return;const o=OM[P.cur];
  P.app=clamp(P.app+(50+s.eco.g*25-(s.eco.u-.05)*300-P.app)*.004+gauss()*.4,0,100);add('hap',(P.app-50)*.0004-.02);s.fol+=o.fol*.00005*(P.app/50);
  if(s.day>=P.until){if(o.limit&&P.held[o.id]>=o.limit){log(`Your time as ${o.n.toLowerCase()} is over: you served the maximum ${o.limit} terms.`,'good');P.cur=null}
    else if(!P.camp){P.until=s.day+CAMP+1;s.inbox.push({id:'rerun',d:s.day,a:0})}}
}
const polPay=()=>s.pol?.cur?OM[s.pol.cur].pay*s.eco.P:0;
const EV7=[
{id:'rerun',w:0,c:()=>!!s.pol?.cur,t:'Four more years?',d:()=>`Your term as ${OM[s.pol.cur]?.n.toLowerCase()||'an official'} is ending. A re-election campaign costs about ${fmt(polCost(OM[s.pol.cur])*.5)}, and your approval is ${Math.round(s.pol.app)}%.`,def:0,ch:[
 ['Run again',()=>{const P=s.pol,o=OM[P.cur];if(!o)return 'The moment has passed.';const c=polCost(o)*.5;s.cash-=c;P.camp={id:o.id,end:s.day+CAMP,odds:polOdds(o)};return `The campaign is on. About ${Math.round(P.camp.odds*100)}% odds.`}],
 ['Step down',()=>{const P=s.pol;const o=OM[P.cur];P.cur=null;return o?`You step down as ${o.n.toLowerCase()} with your head high.`:'Done.'}]]},
{id:'crisis',w:s=>s.pol?.cur&&s.pol.cur!=='council'?2:0,c:()=>!!s.pol?.cur&&s.pol.cur!=='council',t:'A crisis',d:()=>pick(['A water main bursts downtown and half the city is without water.','A budget hole opens up: spending cuts or a tax rise?','A viral video shows police misconduct. The city is angry.','A hurricane is heading your way.']),def:1,ch:[
 ['Take charge, on camera',()=>{const P=s.pol;if(R()<.6){P.app=Math.min(100,P.app+8);return 'You handled it. People noticed.'}P.app=Math.max(0,P.app-10);return 'A gaffe on live TV. It will be a meme for weeks.'}],
 ['Let your staff handle it',()=>{s.pol.app=Math.max(0,s.pol.app-3);return 'It gets sorted, slowly. Nobody is impressed.'}]]},
{id:'polscandal',w:s=>s.pol?.cur?1:0,c:()=>!!s.pol?.cur,t:'A reporter calls',d:()=>'A journalist has questions about a donor who got a very convenient contract.',def:1,ch:[
 ['Come clean',()=>{s.pol.app=Math.max(0,s.pol.app-6);return 'A rough news cycle, but it blows over.'}],
 ['Deny everything',()=>{if(R()<.6)return 'The story dies. For now.';s.pol.app=Math.max(0,s.pol.app-20);if(R()<.3)openCase('sec',rint(1e5,1e6)*s.eco.P);return 'The documents leak. Approval collapses.'}]]},
];
function polHtml(){const P=s.pol,o=P.cur&&OM[P.cur],c=P.camp&&OM[P.camp.id];
  return `<section class="lede"><div><h2 class="headline">${o?o.n:'Politics'}</h2><p class="dek">${o?`Approval <b class="num">${Math.round(P.app)}%</b>, paid ${fmt(polPay())} a day, ${Math.max(0,P.until-s.day)} days left in this term. Approval follows the economy and how you handle what comes up.`:'Run for office. Campaigns cost money, and your odds depend on your following, your looks and smarts, your record and the economy. Start with city council.'}${c?` <b>Campaigning for ${c.n.toLowerCase()}</b>: election in ${P.camp.end-s.day} days, about ${Math.round(P.camp.odds*100)}% odds.`:''}</p></div>
  ${o?`<div class="side"><p class="mut">Approval</p><span class="figure ${P.app<40?'dn':P.app>=55?'up':''}">${Math.round(P.app)}%</span>${meter(P.app,P.app<40?'low':'')}</div>`:''}</section>
  <div class="sec-h"><h2>Offices</h2></div>
  <div class="scroll"><table class="ledger"><thead><tr><th>Office</th><th>Needs</th><th class="r">Campaign</th><th class="r">Pay a day</th><th class="r">Odds</th><th></th></tr></thead><tbody>
  ${OFFICES.map(x=>{const m=polMiss(x),held=P.held[x.id];return `<tr class="${m.length?'dim':''}"><td><b>${x.n}</b><div class="sub">${x.d}${held?` Served ${held} term${held>1?'s':''}.`:''}</div></td><td>${big(x.fol)} followers${x.need?`, ${OM[x.need].n.toLowerCase()} first`:''}${m.length?`<div class="sub dn">Missing: ${m.join(', ')}</div>`:''}</td><td class="r num">${fmt(polCost(x))}</td><td class="r num">${fmt(x.pay*s.eco.P)}</td><td class="r num">${m.length?'—':Math.round(polOdds(x)*100)+'%'}</td>
   <td class="act">${P.cur===x.id?'<span class="mut">In office</span>':`<button class="pri" data-a="run" data-x="${x.id}" ${m.length||P.camp||s.cash<polCost(x)?'disabled':''}>Run</button>`}</td></tr>`}).join('')}
  </tbody></table></div>
  ${howto('Each campaign takes 90 days, then the votes are counted. Followers matter most: at the listed number your odds are about a third, and they rise from there. Convictions in the last 10 years hurt badly. Every office but city council is full time, so winning ends your day job. Terms last 4 years, and governors and presidents can serve two.')}`}

// ---------- a sports team: a trophy asset with seasons, payroll and championships ----------
const CLUBS=[{id:'minor',n:'Minor-league baseball team',price:2.5e7,rev:.09,fame:40},{id:'soccer',n:'Pro soccer club',price:4e8,rev:.08,fame:400},{id:'hoops',n:'Pro basketball team',price:3.5e9,rev:.07,fame:3000},{id:'nfl',n:'Pro football team',price:6e9,rev:.065,fame:5000}];
const CLM=Object.fromEntries(CLUBS.map(t=>[t.id,t]));
const clubVal=()=>s.club?s.club.v:0;
function clubDay(){const T=s.club;if(!T)return;const K=CLM[T.id];T.v*=Math.exp(.07/365+.08*gauss()/Math.sqrt(365));s.fol+=K.fame*(T.pay||1)/365*(T.champs?1.5:1);
  const d=dateOf(s.day);if(d.m===9&&d.dd===1&&T.season!==d.y){T.season=d.y;const pay=T.pay||1,prof=T.v*(K.rev-.05*pay)*(.7+R()*.6),odds=clamp(.06*pay**1.5*(.7+R()*.6),.01,.45);s.cash+=prof;taxAdd('ord',prof);
    if(R()<odds){T.champs=(T.champs||0)+1;mile(`Your ${K.n.toLowerCase()} won the championship.`);T.v*=1.12;add('hap',20);s.fol+=K.fame*50;log(`<b>Your ${K.n.toLowerCase()} won the championship!</b> The season made ${fmt(prof)}.`,'good');toast('Champions!')}
    else log(`Your ${K.n.toLowerCase()}'s season is over: ${pick(['a playoff exit','a middling year','a rebuilding year','heartbreak in the final'])}. ${prof>=0?`It made ${fmt(prof)}`:`It lost ${fmt(-prof)}`}.`,prof>=0?'info':'bad')}}
function clubHtml(){const T=s.club,P=s.eco.P;
  return `<div class="sec-h"><h2>Own a team</h2><span>${T?`${CLM[T.id].n}${T.champs?` · ${T.champs} championship${T.champs>1?'s':''}`:''}`:'for the very rich'}</span></div>
  ${T?`<p class="mut">Worth about <b class="num">${fmt(T.v)}</b>. Team values tend to rise about 7% a year. Each October the season settles: profit or loss depends on payroll, and so do your odds of a title.</p>
  <div class="quick" style="margin-top:var(--space-xs)">${[[.6,'Cheap'],[1,'Normal'],[1.6,'All in']].map(([v,l])=>`<button class="${(T.pay||1)===v?'pri':''}" data-a="tpay" data-x="${v}">${l} payroll</button>`).join('')}<button class="bad" data-a="tsell">Sell for ${fmt(T.v*.97)}</button></div>`
  :`<div class="acards">${CLUBS.map(k=>`<button class="acard" data-a="tbuy" data-x="${k.id}" ${s.cash<k.price*P?'disabled':''}><b>${k.n}</b><span>Profits a few percent of its value in a good year, a loss in a bad one, and a lot of attention.</span><small>${fmt(k.price*P)}</small></button>`).join('')}</div>`}`}

// ---------- credit: a score from 300 to 850 that sets whether banks lend to you, and at what rate ----------
const credit=()=>Math.round(s.credit??650);
const creditWord=c=>c>=800?'Exceptional':c>=740?'Very good':c>=670?'Good':c>=580?'Fair':'Poor';
const rateSpread=()=>Math.max(0,(740-credit())/100*.01); // each 100 points under 740 adds a point to your mortgage rate
const myRate=()=>mrate()+rateSpread();
const debtAPR=()=>.15+(850-credit())/550*.15; // what a negative balance costs you: 15% a year with perfect credit, 30% with the worst
function creditDay(){let c=s.credit??650;
  if(s.cash<0)c-=.6; // missed payments
  else{const loans=(s.debt>0?1:0)+s.props.filter(p=>p.loan>0).length+s.cars.filter(c=>c.loan>0).length;c+=(.012+loans*.012)*(c<760?1:.3)} // paying on time builds it, slowly
  if(s.bk&&s.day<s.bk)c=Math.min(c,560);s.credit=clamp(c,300,850)}
function bankruptcy(){ // wipes what you owe on your balance, and most of what you own, but keeps your home and retirement money
  const lost=[];for(const t in s.port){lost.push('stocks');delete s.port[t]}s.shorts={};s.opts=[];s.mloan=0;
  for(const t in s.wallet)delete s.wallet[t];if(s.fin.fu){s.fin.fu=0;s.fin.fc=0;lost.push('the index fund')}s.fin.sav=0;
  for(const id in s.biz)if(s.biz[id].n){lost.push('your businesses');break}s.biz={};
  const keep=s.props.filter(p=>p.uid===s.home);if(s.props.length>keep.length)lost.push('your rentals');s.props=keep;s.cars=s.cars.slice(0,1);s.own={};
  s.cash=0;s.credit=380;s.bk=s.day+7*365;add('hap',-25);log(`You declared bankruptcy. The debt is gone, and so are ${[...new Set(lost)].join(', ')||'most of your things'}. It stays on your credit report for 7 years.`,'bad')}
function creditHtml(){const c=credit(),neg=s.cash<0;
  return `<div class="sec-h"><h2>Credit score</h2><span>${creditWord(c)}</span></div>
  <div class="stats4 eco"><div><span>Your score</span><b class="num ${c<620?'dn':c>=740?'up':''}">${c}</b></div><div><span>Your mortgage rate</span><b class="num">${pctA(myRate())}</b></div><div><span>A negative balance costs</span><b class="num">${pctA(debtAPR())}</b></div><div><span>Mortgages</span><b>${c<620||s.bk>s.day?'<span class="dn">Refused</span>':'Available'}</b></div></div>
  <p class="mut" style="margin-top:var(--space-2xs)">Every day your balance is negative counts as a missed payment and costs about half a point. Loans and mortgages paid on time build it back up slowly. Banks won't give a mortgage under 620.${s.bk>s.day?` Your bankruptcy stays on file for another ${Math.ceil((s.bk-s.day)/365)} years.`:''}</p>
  ${neg&&netWorth()<0?`<div class="quick" style="margin-top:var(--space-xs)"><button class="bad" data-a="bankrupt">Declare bankruptcy</button></div>`:''}`}

// ---------- habits: drinking and gambling can turn into problems; rehab resets them ----------
const vice=k=>s.vice?.[k]||0;
function viceAdd(k,v){(s.vice??={alc:0,gam:0})[k]=clamp(vice(k)+v,0,100)}
function viceDay(){const V=s.vice;if(!V)return;V.alc=Math.max(0,V.alc-.06);V.gam=Math.max(0,V.gam-.05);
  if(V.alc>60){add('hea',-.05);add('hap',-.04);if(s.job)s.perf=clamp(s.perf-.03,0,100)}
  if(V.gam>60&&R()<1/45&&s.cash>100){const v=Math.round(s.cash*.04);s.cash-=v;taxAdd('gam',-v);add('hap',-3);log(`The itch got you again: ${fmt(v)} gone on a gambling binge.`,'bad')}
  for(const k of ['alc','gam']){const on=V[k]>60,was=V[k+'On'];if(on&&!was)log(k==='alc'?'Your drinking has become a problem. It is wearing down your health and your work.':'Gambling has become a problem. You keep chasing losses.','bad');V[k+'On']=on}}
const rehabCost=()=>2e4*s.eco.P;
function viceHtml(){const V=s.vice||{alc:0,gam:0},bad=V.alc>60||V.gam>60;
  return `<div class="sec-h"><h2>Habits</h2><span>${bad?'<span class="dn">a problem</span>':'under control'}</span></div>
  <table class="ledger"><tbody>${[['Drinking','alc','Every night out adds to it. It fades if you ease off.'],['Gambling','gam','Every casino bet adds to it, and so does chasing losses.']].map(([n,k,d])=>`<tr><td><b>${n}</b><div class="mut">${d}</div></td><td style="width:30%">${meter(V[k],V[k]>60?'low':'')}</td><td class="r">${V[k]>60?'<span class="dn">Problem</span>':V[k]>35?'Watch it':'Fine'}</td></tr>`).join('')}</tbody></table>
  ${bad?`<div class="quick" style="margin-top:var(--space-xs)"><button class="pri" data-a="rehab" ${s.cash<oopOf(rehabCost()).out?'disabled':''}>Go to rehab · you pay ${fmt(oopOf(rehabCost()).out)}</button></div><p class="mut" style="margin-top:var(--space-2xs)">Thirty days away: no work pay while you're there, and you come back clean.</p>`:''}`}

// ---------- travel: somewhere for every budget, from a beach week to low orbit ----------
const TRIPS=[
 {id:'beach',n:'Beach week',c:3000,cd:90,hap:22,hea:4,d:'Sun, sea and no emails'},
 {id:'city',n:'European city break',c:6000,cd:120,hap:25,sma:2,d:'Museums, cafés, and a little culture'},
 {id:'ski',n:'Ski trip',c:8000,cd:150,hap:26,hea:3,risk:.06,d:'Great fun, until someone breaks a leg'},
 {id:'safari',n:'Safari',c:18000,cd:240,hap:32,fol:300,d:'Lions at dawn. Your feed has never looked better'},
 {id:'cruise',n:'Round-the-world cruise',c:90000,cd:365,hap:42,hea:3,fol:800,d:'Three months at sea'},
 {id:'space',n:'A flight to space',c:3e7,cd:1825,hap:60,fol:2e5,d:'Eleven minutes of weightlessness and a view nobody forgets'},
];
const TRM=Object.fromEntries(TRIPS.map(t=>[t.id,t]));
function travel(id){const T=TRM[id],c=T.c*s.eco.P;if(!T||s.cash<c||cdLeft('t_'+id)||jailed())return;s.cash-=c;s.cd['t_'+id]=s.day+T.cd;
  add('hap',T.hap);if(T.hea)add('hea',T.hea);if(T.sma)add('sma',T.sma);if(T.fol)s.fol+=Math.round(T.fol*(1+s.fol/1e5));
  const pt=partner();if(pt)prel(pt,pt.pt==='adventurous'?15:6);if(T.risk&&R()<T.risk&&!cond('inj'))addCond('inj');
  if(id==='space'||id==='cruise'||id==='safari')mile(id==='space'?'Flew to space.':`Went on ${id==='cruise'?'a round-the-world cruise':'safari'}.`);let m=`${T.n}: ${T.d.toLowerCase()}.`;if(!pt&&R()<.15){const p=meet('date',45);m+=` You met ${p.n} along the way, and you're seeing each other.`}return m}
function travelHtml(){return `<div class="sec-h"><h2>Travel</h2><span>each trip has its own wait</span></div>
  <div class="acards">${TRIPS.map(T=>{const w=cdLeft('t_'+T.id),c=T.c*s.eco.P;return `<button class="acard" data-a="travel" data-x="${T.id}" ${w||s.cash<c?'disabled':''}><b>${T.n}</b><span>${T.d}. +${T.hap} happiness${T.fol?', and followers':''}.</span><small>${fmt(c)}${w?` · again in ${w}d`:''}</small></button>`}).join('')}</div>`}

// ---------- the military: a steady career that pays for college and healthcare afterwards ----------
const VET=4*365; // a full enlistment
const isVet=()=>!!s.vet;
function milDay(){if((s.job==='army'||s.job==='officer')&&s.jobDays>=VET&&!s.vet){s.vet=1;mile('Finished an enlistment.');log('You finished your enlistment. As a veteran, the GI Bill pays your tuition and VA healthcare covers you for life.','good');toast('You are a veteran')}}
const EV8=[
{id:'deploy',w:s=>s.job==='army'||s.job==='officer'?3:0,c:()=>s.job==='army'||s.job==='officer',t:'Deployment',d:()=>'Your unit is shipping out for six months. There is hazard pay, and real danger.',def:0,ch:[
 ['Go with your unit',()=>{const v=Math.round(jobPay()*90);s.cash+=v;taxAdd('ord',v);s.perf=clamp(s.perf+8,0,100);add('hap',-6);if(R()<.08){addCond('inj');add('hea',-15);return `You came home hurt, with ${fmt(v)} in hazard pay.`}return `Six hard months. You came home with ${fmt(v)} in hazard pay.`}],
 ['Ask for a posting at home',()=>{s.perf=clamp(s.perf-6,0,100);return 'You stay stateside. Your commander remembers.'}]]},
];

// ---------- the life story: the big moments of this life, by age; and how you've felt over the years ----------
function mile(t){if(!s)return;(s.mile??=[]).push({a:Math.floor(age()),t});if(s.mile.length>80)s.mile.splice(1,1)}
function statsSnap(){if(s.day%30)return;(s.sth??=[]).push([s.st.hea,s.st.hap,s.st.sma,s.st.loo].map(Math.round));if(s.sth.length>1300)s.sth.shift()}
function statsChart(h){const W=480,H=120,n=h.length;if(n<2)return '<p class="mut">The chart fills in after a couple of months.</p>';
  const L=[['Health',0],['Happiness',1],['Smarts',2],['Looks',3]],pts=k=>h.map((v,i)=>`${(i/(n-1)*W).toFixed(1)},${(H-4-v[k]/100*(H-8)).toFixed(1)}`).join(' ');
  return `<svg class="nwc" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="Your stats over ${plainDays(n*30)}">${L.map(([,k])=>`<polyline points="${pts(k)}" style="fill:none;stroke:var(--cat-${k+1});stroke-width:2" vector-effect="non-scaling-stroke"></polyline>`).join('')}</svg>
  <div class="legend">${L.map(([l,k])=>`<div><i style="background:var(--cat-${k+1})"></i>${l}<b class="num">${h.at(-1)[k]}</b></div>`).join('')}</div>`}
function storyHtml(){const M=s.mile||[];
  return `<div class="sec-h"><h2>Your life so far</h2><span>${M.length?`${M.length} moment${M.length>1?'s':''}`:'just getting started'}</span></div>
  ${statsChart(s.sth||[])}
  ${M.length?`<ol class="story">${M.slice().reverse().slice(0,showAll.story?80:10).map(m=>`<li><span class="num">${m.a}</span><span>${m.t}</span></li>`).join('')}</ol>${M.length>10?`<div class="more-row"><button class="link2" data-a="storyall">${showAll.story?'Show less':`Show all ${M.length}`}</button></div>`:''}`:''}`}

// ---------- what a business is worth: a multiple of its yearly profit, like a buyer would pay ----------
const BIZMULT={lemon:1,truck:2.5,cafe:3.2,wash:4,gym:4.8,app:6,hotel:6.8,bank:7.6,rocket:8.4};
function bizVal(b,o){if(!o?.n)return 0;const yr=bizInc(b,o)*365,m=(BIZMULT[b.id]||3)+(o.fr?1:0),eco=clamp(1+s.eco.g*.2,.75,1.15);
  return Math.max(o.spent*.15,yr*m*eco*(o.mgr?1:.75))} // a business that runs without you sells for more; one losing money is worth its equipment
const bizWorth=()=>BIZ.reduce((t,b)=>t+bizVal(b,s.biz[b.id]),0);
const frCost=b=>mgrCost(b)*10;
const EV9=[
{id:'bday',w:s=>s.people.some(p=>(p.role==='spouse'||p.role==='child'&&ageOf(p)<18)&&((s.day-p.b)%365+365)%365>=340)?4:0,c:s=>s.people.some(p=>(p.role==='spouse'||p.role==='child'&&ageOf(p)<18)&&((s.day-p.b)%365+365)%365>=340),a:s=>pick(s.people.filter(p=>(p.role==='spouse'||p.role==='child'&&ageOf(p)<18)&&((s.day-p.b)%365+365)%365>=340))?.uid,t:'A birthday',d:(s,a)=>{const p=per(a);return p?`${esc(p.n)} turns ${Math.floor(ageOf(p))+1} soon.`:'A birthday is coming up.'},def:1,ch:[
 ['Throw a party',(s,a)=>{const p=per(a);if(!p)return 'The moment has passed.';const v=Math.round((p.role==='spouse'?800:400)*s.eco.P);s.cash-=v;prel(p,12);add('hap',4);return `${p.n} had the best day. It cost ${fmt(v)}.`}],
 ['A card and a hug',(s,a)=>{const p=per(a);if(p)prel(p,3);return 'Small, sweet, appreciated.'}]]},
{id:'holiday',w:s=>dateOf(s.day).m===11&&s.people.some(p=>['spouse','child','parent','sibling'].includes(p.role))?5:0,c:s=>dateOf(s.day).m===11,t:'The holidays',d:()=>'December again. How are you spending the holidays?',def:2,ch:[
 ['A big family gathering',()=>{const fam=s.people.filter(p=>['spouse','child','parent','sibling'].includes(p.role)),v=Math.round((300+fam.length*150)*s.eco.P);s.cash-=v;for(const p of fam)prel(p,6);add('hap',8);return `Chaos, food and everyone together. It cost ${fmt(v)}.`}],
 ['Get away somewhere warm',()=>{const v=Math.round(3000*s.eco.P);s.cash-=v;add('hap',10);const pt=partner();if(pt)prel(pt,6);return `Sun instead of snow, for ${fmt(v)}.`}],
 ['Keep it quiet',()=>{add('hap',2);return 'A calm, quiet week.'}]]},
];

// ---------- more of life's surprises ----------
const EV10=[
{id:'idtheft',w:.7,t:'Identity theft',d:()=>'Someone opened credit cards in your name and ran them up.',def:1,ch:[
 ['Freeze your credit and file reports',()=>{s.credit=Math.max(300,(s.credit??650)-15);add('hap',-3);return 'A week of phone calls, but it is contained. Your score dipped a little.'}],
 ['Deal with it later',()=>{s.credit=Math.max(300,(s.credit??650)-90);add('hap',-5);return 'Collectors started calling. Your credit score took a beating.'}]]},
{id:'crash',w:s=>s.cars.length?1:0,c:s=>s.cars.length>0,t:'Fender bender',d:()=>'Someone ran a red light and hit your car.',def:0,ch:[
 ['Go through insurance',()=>{const c=s.cars[0];c.v*=.9;add('hap',-3);if(R()<.25){addCond('inj');return 'The car is fixed, but your neck is not right. Sports injury.'}return 'Paperwork, a rental, and the car is back in a couple of weeks.'}],
 ['Settle it with cash on the spot',()=>{const v=Math.round(1500*s.eco.P);s.cash-=v;return `${fmt(v)} and a handshake. No claim on your record.`}]]},
{id:'jury',w:.8,c:()=>age()>=18&&!jailed(),t:'Jury duty',d:()=>'A summons came: you are called for jury duty, possibly for a couple of weeks.',def:0,ch:[
 ['Serve',()=>{add('hap',2);add('sma',1);if(s.job)s.perf=clamp(s.perf-3,0,100);return 'Two weeks in a courtroom. It was more interesting than you expected.'}],
 ['Ask to be excused',()=>R()<.5?'Excused. Back to work.':(add('hap',-2),'Denied. You serve anyway, grumbling.')]]},
{id:'volunteer',w:.8,t:'Give some time',d:()=>'The food bank down the street is short of volunteers this winter.',def:1,ch:[
 ['Volunteer every weekend',()=>{add('hap',7);s.fol+=rint(10,60);if(friendsN()<10&&R()<.4){const p=meet('friend',45);return `Hard work, good people. You became friends with ${p.n}.`}return 'Hard work, good people. You feel great.'}],
 ['Donate instead',()=>{const v=Math.round(200*s.eco.P);if(s.cash<v)return 'Money is tight right now.';donate(v);return `You donated ${fmt(v)}.`}]]},
{id:'sibhelp',w:s=>s.people.some(p=>p.role==='sibling')&&s.cash>5e3?.9:0,c:s=>s.people.some(p=>p.role==='sibling')&&s.cash>5e3,a:s=>pick(s.people.filter(p=>p.role==='sibling'))?.uid,t:'Family first',d:(s,a)=>`${esc(per(a)?.n||'Your sibling')} is going through a divorce and needs somewhere to stay for a few months.`,def:0,ch:[
 ['Take them in',(s,a)=>{const p=per(a);if(!p)return 'The moment has passed.';prel(p,20);add('hap',-2);s.cash-=Math.round(1500*s.eco.P);return `A crowded few months, but ${p.n} will never forget it.`}],
 ['Help them find a place',(s,a)=>{const p=per(a);if(!p)return 'The moment has passed.';const v=Math.round(3000*s.eco.P);s.cash-=v;prel(p,10);return `You covered the deposit: ${fmt(v)}.`}],
 ['You can\'t right now',(s,a)=>{const p=per(a);if(p)prel(p,-15);return 'They say they understand. They do not.'}]]},
{id:'fire',w:s=>homeP()?.35:0,c:s=>!!homeP(),t:'Fire!',d:()=>`A kitchen fire spread through part of your ${homeP()?pname(homeP()):'home'}. Everyone got out safely.`,def:0,ch:[
 ['Claim on the home insurance and rebuild',()=>{const p=homeP();if(!p)return 'The moment has passed.';const v=Math.round(pval(p)*.01);s.cash-=v;p.cond=Math.max(p.cond??100,90);add('hap',-6);return `The insurer paid for most of it. Your deductible was ${fmt(v)}.`}],
 ['Patch it up yourself',()=>{const p=homeP();if(!p)return 'The moment has passed.';p.cond=Math.max(0,(p.cond??100)-40);add('hap',-8);return 'You saved money, but the place is a mess now.'}]]},
];

// ---------- everyday choices: how many hours you work and how you eat ----------
const HOURS={part:{n:'Part time',d:'About half the pay. More time, less stress, and slower to promote',pay:.55,hap:.03,perf:-8,hea:0},full:{n:'Full time',d:'The standard week',pay:1,hap:0,perf:0,hea:0},over:{n:'Overtime',d:'A quarter more pay and a faster climb, at a cost to mood and health',pay:1.25,hap:-.04,perf:8,hea:-.012}};
const DIETS={cheap:{n:'Cheap and fast',d:'Instant noodles and takeout',c:-6,hea:-.012,risk:1.5},normal:{n:'Normal',d:'A bit of everything',c:0,hea:0,risk:1},healthy:{n:'Healthy',d:'Fresh food, cooked at home',c:9,hea:.01,risk:.7},chef:{n:'Private chef',d:'Someone else cooks, beautifully',c:220,hea:.015,risk:.6,hap:.02}};
const hours=()=>HOURS[s.hours||'full'],diet=()=>DIETS[s.diet||'normal'];
const dietCost=()=>diet().c*s.eco.P*(1+(partner()?.role==='spouse'?.6:0)+kidsHome()*.4);
function styleHtml(){const H=s.hours||'full',D=s.diet||'normal';
  return `<div class="sec-h"><h2>How you live</h2><span>change these any time</span></div>
  <div class="styles"><div><p class="mut">Work hours${s.job?'':' (when you have a job)'}</p><div class="seg2 wrap">${Object.entries(HOURS).map(([k,x])=>`<button class="${H===k?'on':''}" data-a="hours" data-x="${k}" title="${x.d}">${x.n}</button>`).join('')}</div><p class="mut sm">${hours().d}.</p></div>
  <div><p class="mut">Food</p><div class="seg2 wrap">${Object.entries(DIETS).map(([k,x])=>`<button class="${D===k?'on':''}" data-a="diet" data-x="${k}" title="${x.d}">${x.n}</button>`).join('')}</div><p class="mut sm">${diet().d}. ${dietCost()?`${dietCost()>0?'+':'−'}${fmt(Math.abs(dietCost()))} a day on groceries.`:''}</p></div></div>
  ${s.rc?`<p class="mut" style="margin-top:var(--space-xs)">You live in a retirement community: meals and care included for ${fmt(commFee())} a day.</p>`:age()>=65?`<div class="quick" style="margin-top:var(--space-xs)"><button data-a="comm">Move into a retirement community · ${fmt(commFee())} a day, care included${homeP()?', selling your home':''}</button></div>`:''}`}

// ---------- a housing cycle: a couple of boom years, then a bust ----------
WORLD.housing={n:'Housing boom',rate:1/30,len:[900,1400],d:'House prices are climbing fast. Everyone says they only go up.'};
function housingDrift(){if(!world('housing'))return 0;const W=s.world,f=(s.day-(W.start??W.end-1100))/(W.end-(W.start??W.end-1100));
  if(f>=.6&&!W.bust){W.bust=1;log('<b>The housing bubble burst.</b> Prices are falling and banks are nervous.','bad');toast('Housing bust');chirp('@MarketWire','MarketWire','home prices post their biggest monthly drop in years. is the bubble bursting?',1);s.eco.g=Math.min(s.eco.g,s.eco.g-.3)}
  return f<.6?.0004:-.0008} // about +15% a year on the way up, -25% a year on the way down

// ---------- time with your pets ----------
function petPlay(u){const p=s.pets.find(x=>x.uid===+u);if(!p||(p.cd||0)>s.day)return;p.cd=s.day+3;add('hap',2);if(p.t==='dog'){add('hea',1);return `A long walk with ${p.n}. Good for both of you.`}if(p.t==='horse'){add('hea',1.5);return `A ride out with ${p.n}.`}return `${p.n} is delighted with the attention.`}
const EV11=[
{id:'petsick',w:s=>s.pets.some(p=>p.t!=='fish')?.7:0,c:s=>s.pets.some(p=>p.t!=='fish'),a:s=>pick(s.pets.filter(p=>p.t!=='fish'))?.uid,t:'A trip to the vet',d:(s,a)=>{const p=s.pets.find(x=>x.uid===a);return p?`${esc(p.n)} has been off their food, and the vet found something serious. Surgery would cost about <b>${fmt(2500*s.eco.P*(p.t==='horse'?4:1))}</b>.`:'A vet visit.'},def:0,ch:[
 ['Pay for the surgery',(s,a)=>{const p=s.pets.find(x=>x.uid===a);if(!p)return 'The moment has passed.';s.cash-=2500*s.eco.P*(p.t==='horse'?4:1);if(R()<.8){p.dies+=rint(365,1460);add('hap',4);return `${p.n} pulled through, and has years left in them.`}s.pets.splice(s.pets.indexOf(p),1);add('hap',-12);return `The vets did everything they could. ${p.n} didn't make it.`}],
 ['Keep them comfortable',(s,a)=>{const p=s.pets.find(x=>x.uid===a);if(!p)return 'The moment has passed.';p.dies=Math.min(p.dies,s.day+rint(30,120));add('hap',-4);return `You make the most of the time ${p.n} has left.`}]]},
];

// ---------- a family trust: gifts to your heirs now, using up the lifetime exemption; growth after that escapes estate tax ----------
const EXEMPT=13e6;
const trust=()=>s.trust??={v:0,used:0};
const exemptLeft=()=>Math.max(0,EXEMPT*s.eco.P-trust().used);
function trustAdd(v){const T=trust();v=Math.min(v,Math.max(0,s.cash));if(v<1)return 0;const room=exemptLeft(),over=Math.max(0,v-room),gt=over*.4;
  if(s.cash<v+gt){v=Math.max(0,(s.cash+room*.4)/1.4);return trustAdd(v)} // leave room for the gift tax
  s.cash-=v+gt;T.v+=v;T.used+=v;T.gt=(T.gt||0)+gt;return gt}
function trustDay(){const T=s.trust;if(T?.v)T.v*=1+.06/365}
function trustHtml(){const T=trust(),P=s.eco.P,c=s.cash,amts=[.1,.25].map(f=>Math.round(c*f)).filter(v=>v>=1e4*P);
  return `<div class="sec-h"><h2>Family trust</h2><span>${T.v?`${fmt(T.v)} held for your heirs`:'empty'}</span></div>
  <p class="mut">Money you move into the trust is a gift to your heirs: it leaves your net worth, grows about 6% a year, and passes to your heir with no estate tax. Gifts use up your ${fmt(EXEMPT*P)} lifetime exemption first (${fmt(exemptLeft())} left); beyond that, you pay 40% gift tax up front. The earlier you give, the more of the growth escapes the estate tax.${T.gt?` You've paid ${fmt(T.gt)} in gift tax.`:''}</p>
  ${amts.length?`<div class="quick" style="margin-top:var(--space-xs)">${amts.map(v=>`<button data-a="trust" data-x="${v}">Move ${fmt(v)} into the trust${v>exemptLeft()?` (+${fmt((v-exemptLeft())*.4)} gift tax)`:''}</button>`).join('')}</div>`:''}`}

// ---------- old age: a retirement community, and grandkids who visit ----------
const commFee=()=>140*s.eco.P*city().cost; // a day, with meals and care included
function moveComm(){if(s.rc||age()<65)return;const h=homeP();if(h){const i=s.props.indexOf(h),v=pval(h),gn=v*.97-h.paid;s.cash+=v*.97-h.loan;capGain(gn>0?Math.max(0,gn-250000*s.eco.P):gn,h.bought);s.props.splice(i,1);s.home=null}
  s.rc=1;add('hap',6);if(friendsN()<10){const p=meet('friend',50,s.day-rint(65,85)*365);mile(`Moved into a retirement community and met ${esc(p.n)}.`)}else mile('Moved into a retirement community.');log(`You moved into a retirement community${h?` and sold your ${pname(h)}`:''}. Meals and care are included for ${fmt(commFee())} a day.`,'good')}
const EV12=[
{id:'gkvisit',w:s=>age()>=55&&kids().some(k=>k.k?.gk?.length)?2:0,c:s=>age()>=55&&kids().some(k=>k.k?.gk?.length),a:s=>pick(kids().filter(k=>k.k?.gk?.length))?.uid,t:'The grandkids are visiting',d:(s,a)=>{const k=per(a);return k?`${esc(k.n)} is bringing ${k.k.gk.length===1?esc(k.k.gk[0].n):'the grandkids'} for the weekend.`:'The grandkids are coming.'},def:0,ch:[
 ['Spoil them rotten',(s,a)=>{const k=per(a);if(!k)return 'The moment has passed.';const v=Math.round(300*s.eco.P*k.k.gk.length);s.cash-=v;prel(k,6);add('hap',9);return `Ice cream, toys and zero bedtimes. ${fmt(v)} well spent.`}],
 ['A quiet weekend in',(s,a)=>{const k=per(a);if(k)prel(k,3);add('hap',5);return 'Board games and stories. Lovely.'}]]},
];

// ---------- what's new: shown once after an update, listing what changed since you last played ----------
const NEWS=[
 {v:2,t:['Health: illnesses, check-ups and insurance','The law: lawsuits, trials, jail and a record','Hobbies and pets','Decisions whose consequences arrive later']},
 {v:3,t:['Kids are born with traits and shaped by how you raise them','Your heir starts as the person they became','Estate tax replaces the flat 50% cut']},
 {v:4,t:['A boss and coworkers at every job','Freelance contracts','Found a startup and take it to an exit']},
 {v:5,t:['A family tree of every generation','Fixer-uppers, renovations and tenants','Giving and a family foundation','Pandemics, tech booms and storms','Partners with personalities, weddings and prenups','Five cities with their own pay, costs and taxes','Social Security']},
 {v:6,t:['Politics: from city council to president','Own a sports team','Credit scores and bankruptcy','Habits, addiction and rehab','Travel, up to a flight to space','Military service and the GI Bill','A life story timeline','Next steps suggestions on Home']},
 {v:7,t:['Businesses valued at a multiple of profit: sell or franchise a chain','Work hours and diet','Settings in the ? menu','A housing boom and bust','Walk your dog, and vet decisions','A family trust, a best friend, and retirement communities']},
 {v:8,t:['Holiday lets for your rentals','Start a podcast or video channel','A semester abroad']},
 {v:9,t:['Car loans','Adopt a child','IVF']},
 {v:10,t:['The world rich list: see where you rank']},
 {v:11,t:['Hire a personal assistant and a financial advisor (Lifestyle)']},
 {v:12,t:['Aging parents who need care','Friends and siblings marry, have kids, move away and grow old']},
];
const NEWSV=NEWS.at(-1).v;
function newsHtml(){const seen=s.seenV||1,L=NEWS.filter(n=>n.v>seen);if(!L.length)return '';s.seenV=NEWSV;
  return `<h3 style="margin-top:var(--space-sm)">What's new since you last played</h3><ul class="news">${L.flatMap(n=>n.t).map(t=>`<li>${t}</li>`).join('')}</ul>`}

// ---------- short-term lets: more rent, more wear, more empty weeks, and cities that push back ----------
const stl=p=>!!p.stl;
function stlDay(){for(const p of s.props)if(p.stl){if(renting(p))p.cond=Math.max(0,(p.cond??100)-2/365); // twice the wear of a long let
  if(R()<1/(25*365)&&s.props.some(q=>q.stl)){for(const q of s.props)if(q.stl){q.stl=0}log('The city banned short-term lets. Your holiday rentals are back to ordinary tenants.','bad');toast('Short-term lets banned');break}}}
const stlMul=p=>p.stl?1.6*.72:1; // 60% more a night, but about 28% of nights sit empty

// ---------- a channel of your own: episodes build an audience, and ads pay by the view ----------
const chNew=()=>({on:0,subs:0,eps:0,last:0});
function chDay(){const C=s.ch;if(!C?.on)return;const fresh=s.day-C.last<14;C.subs=Math.max(0,C.subs*(fresh?1.0005:.998))} // ad money is paid with the day's other income
function chPost(){const C=s.ch??=chNew();if(!C.on||cdLeft('ep'))return;s.cd.ep=s.day+5;C.eps++;C.last=s.day;const q=(s.st.sma+s.st.loo)/2+(hobSk('music')+hobSk('write'))/4,g=Math.round((20+Math.sqrt(s.fol)*2)*(q/50)*(.5+R()));C.subs+=g;s.fol+=Math.round(g*.3);add('hap',1);
  if(R()<.03*q/50){const v=Math.round(g*20+C.subs*.5);C.subs+=v;s.fol+=Math.round(v*.3);return `Episode ${C.eps} went viral! +${big(g+v)} subscribers.`}return `Episode ${C.eps} is out. +${big(g)} subscribers.`}
const chInc=()=>s.ch?.on?s.ch.subs*.004*s.eco.P*(s.day-s.ch.last<14?1:.4):0;
function chHtml(){const C=s.ch||chNew(),w=cdLeft('ep');
  return `<div class="sec-h"><h2>Your channel</h2><span>${C.on?`${big(C.subs)} subscribers · ${C.eps} episode${C.eps===1?'':'s'}`:'not started'}</span></div>
  ${C.on?`<p class="mut">Ads pay about <b class="num">${fmt(chInc())}</b> a day. Post at least every two weeks or the algorithm forgets you and subscribers drift away. Smarts, looks, and skill at music or writing make better episodes.</p>
  <div class="quick" style="margin-top:var(--space-xs)"><button class="pri" data-a="chpost" ${w?'disabled':''}>Post an episode${w?` · in ${w}d`:''}</button></div>`
  :`<p class="mut">Start a podcast or video channel. It grows with every episode, pays ad money by the subscriber, and feeds your Chirp following.</p><div class="quick" style="margin-top:var(--space-xs)"><button data-a="chstart" ${s.cash<500*s.eco.P?'disabled':''}>Start a channel · ${fmt(500*s.eco.P)} for gear</button></div>`}`}

// ---------- a semester abroad ----------
const abroadCost=()=>8000*s.eco.P;
function abroad(){const st=s.study;if(!st||st.abroad||s.cash<abroadCost()||st.sc==='online')return;s.cash-=abroadCost();st.abroad=1;st.g=clamp(st.g+4,0,100);add('sma',3);add('hap',15);s.fol+=rint(30,150);mile('Spent a semester abroad.');
  if(friendsN()<10){const p=meet('friend',55);return `A semester abroad: new languages, late nights, and a friend for life in ${p.n}.`}return 'A semester abroad. You come home a little different.'}

// ---------- car loans: 10% down, five years, at a rate your credit sets ----------
const carRate=()=>myRate()+.025;
const CARN=5*365,carPay=(L,r=carRate())=>L*(r/365)/(1-(1+r/365)**-CARN);
const carPays=()=>s.cars.reduce((t,c)=>t+(c.loan>0?c.pay:0),0);
function canCarLoan(price){const f=flows(),pay=carPay(price*.9);return credit()>=580&&!(s.bk>s.day)&&s.cash>=price*.1&&pay+carPays()<=(f.job+f.biz+f.rent)*.2}
function carLoanDay(){for(const c of s.cars)if(c.loan>0){c.loan-=c.pay-c.loan*(c.rate||carRate())/365;if(c.loan<=1){c.loan=c.pay=0;log(`Paid off the loan on your ${CM[c.t].n.toLowerCase()}.`,'good')}}}

// ---------- adoption and IVF ----------
const adoptCost=()=>4e4*s.eco.P,ivfCost=()=>2e4*s.eco.P;
const canAdopt=()=>age()>=25&&age()<56&&kidsHome()<4&&s.cash>=adoptCost()&&!jailed();
function adoptKid(){if(!canAdopt())return;s.cash-=adoptCost();const p=meet('child',70,s.day-rint(0,8)*365);const tr=rollTraits();p.k={...kidNew(),tr,gs:rint(30,80),loo:rint(30,80)};p.k.sma=p.k.gs*(.3+Math.min(1,ageOf(p)/10)*.7);p.adopt=1;add('hap',14);mile(`Adopted ${esc(p.n)}.`);log(`You adopted ${esc(p.n)}, ${Math.floor(ageOf(p))}. Welcome home.`,'good');return p}

// ---------- the rich list: the world's richest people, whose fortunes ride on their companies' shares ----------
const RICH=[['Elon Mask','TSLE',2.5e11,5e10],['Jeff Bezoz','AMZM',2e11,1e10],['Bernard Arnoh','LVHM',1.8e11,0],['Mark Zuckerbird','METT',1.8e11,0],['Larry Elison','ORKL',1.7e11,5e9],['Warren Buffit','BRKH',1.4e11,0],['Larry Paige','ABUT',1.4e11,0],['Sergei Brinn','ABUT',1.3e11,0],['Steve Balmer','MSFY',1.2e11,0],['Jensen Huong','NVBA',1.1e11,0],['Bill Gaytes','MSFY',6e10,4e10],['Michael Dull','',0,1e11],['Mukesh Ambanee','',0,1e11],['Amancio Ortegga','',0,9e10],['Françoise Bettencort','',0,9e10],['Carlos Slimm','',0,8e10],['Ma Hwa-teng','TCNT',6e10,0],['Tadashi Yanaii','',0,4.5e10],['Changpeng Zhow','CBAS',2e10,2e10],['Phil Nite','NIKA',3.5e10,0]];
function richList(){const ix=s.mkt?.div?idx()/5000:1,L=RICH.map(([n,t,stake,other])=>{const k=t&&SK[t];return {n,t,w:(k?stake/k.p*s.px[t].p:0)+other*ix}});L.push({n:s.name,me:1,w:netWorth()});return L.sort((a,b)=>b.w-a.w)}
const worldRank=w=>w<1e6?0:Math.max(1,Math.round(2700*(1e9/w)**1.5)); // roughly how many people are richer, from the shape of real wealth
function richHtml(){const L=richList(),me=L.findIndex(x=>x.me),top=L.slice(0,20);
  return `<p class="kicker">The Hustle Rich List</p><h2>The world's richest</h2><p>${me<20?`You're <b>number ${me+1}</b> in the world.`:netWorth()>=1e6?`About <b class="num">${big(worldRank(netWorth()))}</b> people in the world are richer than you.`:'Most of the world. Keep going.'} Fortunes move with their companies' share prices.</p>
  <table class="ledger"><tbody>${top.map((x,i)=>`<tr${x.me?' class="now"':''}><td class="num">${i+1}</td><td><b>${esc(x.n)}</b>${x.t?` <span class="mut">${nameOf(x.t)}</span>`:''}${x.me?' <span class="mut">(you)</span>':''}</td><td class="r num">${fmt(x.w)}</td></tr>`).join('')}${me>=20?`<tr class="now"><td class="num">—</td><td><b>${esc(s.name)}</b> <span class="mut">(you)</span></td><td class="r num">${fmt(netWorth())}</td></tr>`:''}</tbody></table>
  <button class="pri" data-a="close" style="margin-top:var(--space-sm)">Back</button>`}

// ---------- staff: people you pay to run the boring parts of a rich life ----------
const paCost=()=>80*s.eco.P;
function staffDay(){const S=s.staff;if(!S)return;
  if(S.pa){for(const id in s.biz){const v=s.biz[id].pend;if(v){s.cash+=v;taxAdd('ord',v);s.biz[id].pend=0}}}
  if(S.adv){const F=s.fin,px=fundPx();s.cash-=F.fu*px*.01/365; // 1% a year of what they manage
    if(s.day%7===0){const keep=Math.max(5e3*s.eco.P,flows().exp*90),a=s.cash-keep;if(a>1e3*s.eco.P){s.cash-=a;F.fd=avgDay(F.fd,F.fu,a/px);F.fu+=a/px;F.fc+=a}}}}
function staffHtml(){const S=s.staff||{};
  return `<div class="sec-h"><h2>Staff</h2><span>for when life runs itself</span></div>
  <div class="acards"><button class="acard${S.pa?' on':''}" data-a="staff" data-x="pa" aria-pressed="${!!S.pa}"><b>Personal assistant</b><span>Collects every till each day and answers decisions after 7 days with the sensible choice.</span><small>${S.pa?'Hired · tap to let go':`${fmt(paCost())} a day`}</small></button>
  <button class="acard${S.adv?' on':''}" data-a="staff" data-x="adv" aria-pressed="${!!S.adv}"><b>Financial advisor</b><span>Each week, invests spare cash in the index fund, keeping about 90 days of spending in cash.</span><small>${S.adv?'Hired · tap to let go':'1% a year of what they manage'}</small></button></div>`}

// ---------- other people's lives: parents who need care, friends and siblings who move on ----------
function othersDay(){for(const p of [...s.people]){const a=ageOf(p);
  if(p.role==='parent'&&a>=78&&!p.care&&!p.askedCare&&R()<1/900){p.askedCare=1;s.inbox.push({id:'pcare',d:s.day,a:p.uid})}
  if(p.role==='parent'&&p.care==='home')s.cash-=180*s.eco.P; // a care home, every day
  if(p.role==='friend'||p.role==='sibling'){
    if(!p.sp&&a>=24&&a<45&&R()<1/3000){p.sp=pick(PNAMES.filter(n=>n!==p.n));if(p.rel>=50)log(`${esc(p.n)} got married to ${esc(p.sp)}.`,'good')}
    if(p.sp&&a>=26&&a<44&&(p.nk||0)<3&&R()<1/1800){p.nk=(p.nk||0)+1;if(p.role==='sibling')log(`${esc(p.n)} had a baby. You're an aunt or uncle${p.nk>1?' again':''}.`,'good')}
    if(p.role==='friend'&&a>40&&R()<1/(20*365)){p.away=1;p.rel=Math.max(0,p.rel-15);log(`${esc(p.n)} moved across the country. You'll have to try harder to stay close.`)}
    if(a>72&&R()<Math.min(.5,((a-72)/22)**3*2)/365){s.people.splice(s.people.indexOf(p),1);add('hap',p.rel>=60?-12:-4);mile(`Lost ${esc(p.n)}, ${p.role==='sibling'?'a sibling':'an old friend'}.`);log(`${esc(p.n)} passed away at ${Math.floor(a)}.`,'bad')}}}}
const EV13=[
{id:'pcare',w:0,c:s=>s.people.some(p=>p.role==='parent'),t:'A parent needs care',d:(s,a)=>{const p=per(a);return p?`${esc(p.n)} can't manage alone any more. A care home costs about <b>${fmt(180*s.eco.P)}</b> a day.`:'A parent needs help.'},def:1,ch:[
 ['Move them in with you',(s,a)=>{const p=per(a);if(!p)return 'The moment has passed.';p.care='you';prel(p,20);add('hap',-6);if(s.job)s.perf=clamp(s.perf-5,0,100);return `${p.n} moves in. It's hard, and it's the right thing.`}],
 ['Pay for a good care home',(s,a)=>{const p=per(a);if(!p)return 'The moment has passed.';p.care='home';prel(p,8);return `${p.n} settles into a care home. You visit on Sundays.`}],
 ['They\'ll have to cope',(s,a)=>{const p=per(a);if(!p)return 'The moment has passed.';p.care='none';prel(p,-25);add('hap',-4);p.x=(p.x||0)-3;return 'You tell yourself they are fine. They are not.'}]]},
];
