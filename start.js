(function(){
const SEATS=[
 ["biz","I run the business","CEO, president, owner","the company"],
 ["tech","I run technology","CIO, CTO, IT director","your technology team"],
 ["fn","I run a function","Finance, sales, marketing, operations, HR","your area"]];
const scope=()=>(SEATS.find(s=>s[0]===A.seat)||SEATS[0])[3];
// Agents with branded links (/a/<slug>). Add an entry to show their name on the page.
// Example: nate: {name:"Nate Cruz", first:"Nate"}
const AGENTS={};
const REF=(document.cookie.match(/(?:^|;\s*)_air_ref=([^;]+)/)||[])[1];
const AGENT=REF&&AGENTS[decodeURIComponent(REF)]||null;

const Q=[
 {id:"limit", q:()=>"What limits how much more business you could take on?", why:"Speeding up anything else just moves the pile.",
  opts:[["win","Finding and winning enough customers"],["deliver","Delivering what we've sold fast enough"],["support","Supporting customers as we grow"],["hire","Hiring and training people fast enough"],["decide","Decisions and approvals take too long"]]},
 {id:"numbers", q:()=>"When you need a number, like margin by customer or cash next month, how do you get it?", why:"Think about the last time someone asked.",
  opts:[["live","We pull it up ourselves, current to the day"],["ask","We ask finance and wait a day or two"],["close","We wait for month-end close"],["sheet","Someone builds a spreadsheet each time"]]},
 {id:"walk", q:()=>`If the most relied-on person in ${scope()} left Friday, how much would go with them?`, why:"Think about how the work actually gets done, not the org chart.",
  opts:[["doc","Very little. It's written down."],["some","Some shortcuts and history"],["most","Most of how the work actually gets done"],["trouble","We'd be in real trouble"]]},
 {id:"systems", q:()=>"How would you describe your systems?", why:"CRM, ERP, finance, operations, the tools people use every day.",
  opts:[["few","A few core systems that talk to each other"],["some","Many systems, some connected"],["rollup","Many systems from acquisitions or roll-ups, mostly separate"],["sheets","Spreadsheets and people hold it together"]]},
 {id:"network", q:()=>"What is your network set up for today?", why:"Offices, remote work, cloud apps and the internet connections behind them.",
  opts:[["basic","Email, files and video calls"],["cloud","Cloud apps across several locations"],["grow","Built with room to grow"],["unsure","Not sure. It works until it doesn't."]]},
 {id:"ai", q:()=>"What AI are people using at work?", why:"There's always some. The question is whether anyone chose it.",
  opts:[["approved","Only tools the company approved"],["both","Approved tools, plus their own accounts on the side"],["own","Their own accounts. Nothing is approved."],["blocked","We've blocked it"],["unknown","I don't know"]]},
 {id:"wait", q:()=>"What do customers wait on you for most?", why:"Pick the wait they'd complain about first.",
  opts:[["quotes","Quotes and proposals"],["answers","Answers to questions"],["setup","Getting set up after they buy"],["fix","Getting problems fixed"],["rarely","They rarely wait"],["na","Not close enough to say"]]},
 {id:"collab", q:()=>"How does your team work together day to day?", why:"Meetings, messages, calls and shared files.",
  opts:[["one","One platform everyone uses"],["mix","A mix of tools, depending on the team"],["email","Mostly email and phone"],["scattered","Scattered across chat, email and texts"]]},
 {id:"leaders", q:()=>"How is leadership approaching AI?", why:"What people see leaders do, not what they say.",
  opts:[["model","Using it themselves and showing others"],["support","Supportive, but not using it much"],["wait","Waiting to see"],["skeptic","Cautious or skeptical"]]},
 {id:"feel", q:()=>"What's the general feeling about AI in your company?", why:"The mood in the hallway, not the official line.",
  opts:[["excited","Excited. People are trying things."],["curious","Curious, but not sure where to begin"],["worried","Worried about jobs or mistakes"],["indifferent","Mostly indifferent"]]}
];

const MOVES={
 quote:{name:"A proposal desk that knows every deal you've priced",
  bar:"Example · connected to CRM, contracts, past proposals",
  chat:[["you","Pricing for Hartwell Dental. Three locations, 40 seats."],
        ["ai","Four similar deals in the last 18 months. Median discount 12%. Anything over 15% needs Dana's approval. Draft proposal is ready for review."]],
  old:"Someone digs through old proposals, messages the one person who knows the margin rules, and waits a day.",
  now:"A priced draft in minutes. The expert reviews only the exceptions.",
  gain:"More proposals out means more deals to set up. Make sure onboarding and delivery can take the extra volume before you speed up sales.",
  seat:{biz:"Win rate and speed to quote are the numbers this moves. Every day a proposal sits is a day a competitor can get there first.",
   tech:"You'd connect the CRM and the proposal archive, decide who can see margin data, and log every answer so pricing decisions can be audited.",
   fn:"Your team stops rebuilding proposals from old files. The person who knows the pricing rules reviews exceptions instead of answering the same questions."},
  layers:["Data & integration","Artificial intelligence","Cybersecurity"]},
 know:{name:"A knowledge desk built on how your company actually works",
  bar:"Example · connected to shared drives, SOPs, HR, finance",
  chat:[["you","First week here. How do we handle a rush order for an existing customer?"],
        ["ai","Rush orders need Ops sign-off if they're under 5 business days. Check credit status first, then flag it in the order system with RUSH. Source: Order Handling SOP, updated August. Maria in Ops approves these. Want me to draft the request?"]],
  old:"The new hire asks the one person who knows. That person stops what they're doing, again.",
  now:"New people get the answer, the source and the next step. Your experts get their time back.",
  gain:"People ramp faster and move faster. Watch the step after them: approvals and handoffs will see more volume.",
  seat:{biz:"This protects you from key-person risk and shortens how long a new hire takes to pay for themselves.",
   tech:"You'd gather documents into one governed place, keep existing permissions so people only see what they're allowed to, and point the AI at that.",
   fn:"Your team stops being the help desk for everyone else. New people ramp without pulling your best people off their work."},
  layers:["Data & integration","Artificial intelligence","Cybersecurity"]},
 account:{name:"A delivery desk that reads every system at once",
  bar:"Example · connected to CRM, ERP, project tracker",
  chat:[["you","Where are we with Meridian Supply's rollout?"],
        ["ai","Two of three sites are live. Site three is waiting on the circuit install, now scheduled Oct 14. One open item: their billing contact changed and the first invoice bounced. Their exec sponsor asked for a status update on Monday. Draft is ready."]],
  old:"Check the CRM, the ERP, the project tracker and someone's inbox, then piece it together.",
  now:"Every account's status in one answer, with the blocker already flagged.",
  gain:"Delivery speeds up when everyone sees the same picture. The next pinch is usually support, as more customers go live faster.",
  seat:{biz:"Faster delivery means revenue recognized sooner and fewer customers wondering where things stand.",
   tech:"You'd connect the CRM, ERP and project tools, which is an integration and network job before it's an AI job.",
   fn:"Your team stops chasing status across four systems and spends that time moving the work forward."},
  layers:["Network & connectivity","Customer experience","Artificial intelligence"]},
 support:{name:"A support desk that answers from everything you know",
  bar:"Example · customer support · 7:40 pm",
  chat:[["you","Customer: Our invoice shows 45 seats but we only have 40."],
        ["ai","Five seats were added on Sept 3 by their admin, Josh Park. They were removed on Sept 20, so October will bill for 40. Suggested reply drafted, with a credit for the overlap. Anything over $500 goes to billing for approval."]],
  old:"The customer waits until morning. Someone checks three systems and writes back.",
  now:"An accurate answer in minutes, day or night. People handle only what needs judgment.",
  gain:"Faster support keeps customers you'd otherwise lose. If volume keeps climbing, look upstream at what's creating the questions.",
  seat:{biz:"Support is where growth turns into cost. This lets you grow without support headcount growing at the same rate.",
   tech:"You'd connect the contact center, billing and CRM, and set clear limits on what the AI can do on its own versus hand off.",
   fn:"Your team handles the conversations that need a person. The repeat questions stop reaching them."},
  layers:["Customer experience","Communication & collaboration","Artificial intelligence"]},
 brief:{name:"A morning brief across every system you run",
  bar:"Example · morning brief · 7:02 am",
  chat:[["ai","Three things need you today. Approve the Q4 budget move before noon. Dana is waiting on your call about Hartwell. The board deck draft is ready. There were 41 messages overnight, and 2 matter."],
        ["you","Tell Dana I'll call at 2."],
        ["ai","Sent in Teams and added to your calendar."]],
  old:"Someone spends Thursday building the report. Leadership reads it Monday.",
  now:"A daily read, written for you, with anything that isn't yours handed off in a click.",
  gain:"Faster decisions push work downstream faster. Make sure the teams acting on them have room to move.",
  seat:{biz:"Decisions stop waiting on the weekly meeting. You see what needs you, and hand off the rest.",
   tech:"You'd connect email, calendar, chat and core systems with strict access rules, since this sees more than any other use.",
   fn:"Leadership stops asking your team for status. The brief answers it before they ask."},
  layers:["Communication & collaboration","Artificial intelligence","Cybersecurity"]}
};
const LIMIT_NP={win:"finding and winning enough customers",deliver:"delivering what you've sold fast enough",support:"supporting customers as you grow",hire:"hiring and training people fast enough",decide:"how long decisions and approvals take"};
function pickMove(){
 return {win:"quote", deliver:"account", support:"support", hire:"know", decide:"brief"}[A.limit]||"brief";
}

const SEAT_LINE={
 biz:"Written for someone who runs the business: what's limiting growth, and what fixing it is worth.",
 tech:"Written for someone who runs technology: what connects to what, and what has to be secured.",
 fn:"Written for someone who runs a function: what changes for your team, and what you'll need from IT."
};

const STATUS={
 walk:{doc:["ok","In place","Your knowledge is written down. That's the hardest part done."],
  some:["work","Partly there","The shortcuts and history live with people. Capture them before anything else."],
  most:["start","Not in place","How the work gets done lives in people's heads. It has to be captured first."],
  trouble:["start","Not in place","Critical knowledge sits with one person. That's the first thing to fix."]},
 systems:{few:["ok","In place","A few core systems that connect. AI can work across them."],
  some:["work","Partly there","Some systems connect and some don't. A contained integration job closes the gaps."],
  rollup:["start","Not in place","Systems from acquisitions still run separately. Connecting them comes before AI."],
  sheets:["start","Not in place","Spreadsheets and people are the integration. Connect the systems before adding anything on top."]},
 network:{basic:["work","Partly there","Built for email, files and calls. AI and more cloud apps will ask more of it."],
  cloud:["work","Partly there","Carrying cloud apps across locations. Check capacity and resilience before AI adds load."],
  grow:["ok","In place","Built with room to grow. AI has something to lean on."],
  unsure:["start","Not in place","Nobody is sure what it can carry. Find out before adding anything that depends on it."]},
 ai:{approved:["ok","In place","Approved tools. Next is controlling what they can reach and who can ask what."],
  both:["start","Not in place","People are working around the approved tool, and company data goes with them."],
  own:["start","Not in place","Company data is leaving through personal accounts. A policy and an AI gateway close that gap."],
  blocked:["start","Not in place","Blocking pushes use out of sight. A controlled way in works better."],
  unknown:["start","Not in place","You can't govern what you can't see. Start by finding out what's in use."]},
 wait:{quotes:["work","Partly there","Quote speed depends on the systems and knowledge behind the quote."],
  answers:["work","Partly there","Customers wait for answers you already have."],
  setup:["work","Partly there","Setup depends on people remembering the steps."],
  fix:["start","Not in place","Fix time is what customers feel most. It's where contact center and AI meet."],
  rarely:["ok","In place","Customers rarely wait. AI can keep it that way as you grow."],
  na:["work","Partly there","Not visible from your seat. Ask the people who handle customer complaints."]},
 collab:{one:["ok","In place","One platform everyone uses. Context has a place to live."],
  mix:["work","Partly there","A mix of tools by team. Context gets lost between them."],
  email:["work","Partly there","Mostly email and phone. Conversations don't carry into the next step."],
  scattered:["start","Not in place","Work is scattered across chat, email and texts. Nothing carries the context forward."]},
 numbers:{live:["ok","In place","Leaders see current numbers when they need them. AI has something to anchor to."],
  ask:["work","Partly there","Answers wait on finance. AI can put the number in front of the person asking."],
  close:["start","Not in place","The business steers by last month. There's no current view for AI decisions to anchor to."],
  sheet:["start","Not in place","Every number is a one-off spreadsheet. The data behind it needs a home first."]},
 leaders:{model:["ok","In place","Leaders use AI and show others. That's what makes adoption stick."],
  support:["work","Partly there","Leaders support it but don't use it much. People notice."],
  wait:["start","Not in place","Leadership is waiting to see. Adoption stalls without a visible lead."],
  skeptic:["start","Not in place","Leadership is cautious. A small, visible result is the way in."]},
 feel:{excited:["ok","In place","People are already trying things. Channel it into approved tools and shared practice."],
  curious:["work","Partly there","People are curious but unsure where to begin. A real task and some training unlock it."],
  worried:["work","Partly there","People are worried about jobs or mistakes. Say what AI is for, and what stays with them."],
  indifferent:["start","Not in place","AI hasn't touched their work yet. One useful result changes that."]}
};
const RANK={start:0,work:1,ok:2};
const worst=(a,b)=>RANK[b[0]]<RANK[a[0]]?b:a;

let step=-1, A={}, sel=null;
const app=document.getElementById("tool");
const locBars=[...document.querySelectorAll("#toolLoc i")];
function setLoc(n){locBars.forEach((b,i)=>b.classList.toggle("on",i<n));const L=document.getElementById("toolLoc");if(L)L.classList.toggle("done",n>=6)}
function esc(s){return String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]))}
function company(){return (A.url||"").trim().replace(/^https?:\/\//,"").replace(/^www\./,"").split("/")[0]}
const label=(id,k)=>(Q.find(q=>q.id===id).opts.find(o=>o[0]===k)||[,""])[1];
const low=s=>s.replace(/\.$/,"").replace(/^./,c=>c.toLowerCase());

function intro(){
 setLoc(0);
 app.innerHTML=`<section class="t-stack t-fade">
  <span class="eyebrow">${AGENT?"Shared with you by "+AGENT.name:"Ten questions. About four minutes. No score."}</span>
  <h2 class="t-h1">See where AI fits in your company.</h2>
  <p class="t-lede">Ten questions about how your company actually runs. You'll see where AI would pay off first, what it needs underneath, and the first move worth making. No score. Results on screen, no email required.</p>
  <div class="t-row"><button class="button primary" id="go">Start</button><span class="t-why">About four minutes.</span></div>
 </section>`;
 document.getElementById("go").onclick=()=>{step=-1;render()};
}

function seatScreen(){
 setLoc(0);
 app.innerHTML=`<section class="t-stack t-fade">
  <h2>What's your view of the company?</h2>
  <p class="t-why">Everyone gets the same questions. This sets their scope and how your results are written.</p>
  <div class="t-opts">${SEATS.map(s=>`<button class="t-opt" id="seat-${s[0]}" data-k="${s[0]}" aria-pressed="${A.seat===s[0]}">${s[1]}<br><span class="t-why">${s[2]}</span></button>`).join("")}</div>
  <div class="t-field"><label for="url">Company website (optional). We use what's public to make your results specific.</label><input id="url" placeholder="yourcompany.com" value="${esc(A.url||"")}" autocomplete="url"></div>
  <div class="t-row"><button class="button primary" id="next" ${A.seat?"":"disabled"}>Next</button></div>
 </section>`;
 const next=document.getElementById("next");
 app.querySelectorAll(".t-opt").forEach(b=>b.onclick=()=>{A.seat=b.dataset.k;app.querySelectorAll(".t-opt").forEach(x=>x.setAttribute("aria-pressed",x===b));next.disabled=false});
 next.onclick=()=>{A.url=document.getElementById("url").value;step=0;render()};
}

function render(){
 if(step===-2) return intro();
 if(step===-1) return seatScreen();
 if(step>=Q.length) return result();
 const q=Q[step]; setLoc(Math.round(step*6/Q.length));
 sel=A[q.id]||null;
 app.innerHTML=`<section class="t-stack t-fade">
  <h2>${esc(q.q())}</h2>
  <p class="t-why">${q.why}</p>
  <div class="t-opts">${q.opts.map(o=>`<button class="t-opt" id="o-${q.id}-${o[0]}" data-k="${o[0]}" aria-pressed="${sel===o[0]}">${esc(o[1])}</button>`).join("")}</div>
  <div id="rev" aria-live="polite"></div>
  <div class="t-field"><label for="note-${q.id}">Anything specific? (optional)</label><textarea id="note-${q.id}" placeholder="A sentence is plenty">${esc((A.notes||{})[q.id]||"")}</textarea></div>
  <div class="t-row"><button class="button primary" id="next" ${sel?"":"disabled"}>${step===Q.length-1?"See my results":"Next"}</button>
  <button class="t-link" id="back">Back</button></div>
 </section>`;
 const rev=document.getElementById("rev"), next=document.getElementById("next");
 const showRev=()=>{};
 showRev();
 app.querySelectorAll(".t-opt").forEach(b=>b.onclick=()=>{sel=b.dataset.k;app.querySelectorAll(".t-opt").forEach(x=>x.setAttribute("aria-pressed",x.dataset.k===sel));next.disabled=false;showRev()});
 const save=()=>{A.notes=A.notes||{};A.notes[q.id]=document.getElementById("note-"+q.id).value};
 next.onclick=()=>{save();A[q.id]=sel;step++;render();app.scrollIntoView({block:"start"})};
 document.getElementById("back").onclick=()=>{save();step--;render()};
}

function situation(){
 const co=company()||"your company";
 const notes=Object.values(A.notes||{}).filter(x=>x&&x.trim());
 let s=`What limits growth at ${co} is ${LIMIT_NP[A.limit]}. `;
 s+={doc:"Your knowledge is written down, which puts you ahead. ",some:"Some of what makes your people fast still lives only with them. ",most:"Most of how the work gets done lives in people's heads. ",trouble:"Critical knowledge sits with one person. "}[A.walk];
 s+={few:"Your core systems talk to each other, so a first move can start quickly. ",some:"Some of your systems connect and some don't, so a few gaps will need closing. ",rollup:"Systems inherited from acquisitions still run separately, and connecting them comes first. ",sheets:"Spreadsheets and people hold your systems together, and that comes first. "}[A.systems];
 s+={model:"Leadership is using AI and showing others the way.",support:"Leadership supports AI but isn't using it much yet.",wait:"Leadership is waiting to see.",skeptic:"Leadership is cautious about AI."}[A.leaders];
 return {text:s, noted:notes.length};
}
function lives(){
 return {approved:"In the tools you've approved. Probably underused, and it's not clear what they can reach.",
  both:"In your approved tools, and in personal accounts alongside them. The second is where company data leaves.",
  own:"In personal ChatGPT and Claude accounts, outside anything IT can see. Company information is going in.",
  blocked:"On personal phones and home laptops, where blocking doesn't reach.",
  unknown:"Almost certainly in personal accounts. Nobody has checked yet."}[A.ai];
}
const SOURCE={"Workforce & adoption":["Managed IT"],"Data readiness":["Data & integration"],"Technology infrastructure":["Network & connectivity","Data center & cloud"],"Governance & security":["Cybersecurity"],"Experience layer":["Customer experience","Communication & collaboration"]};
function sourced(rows){const out=[];rows.forEach(r=>{if(r[1]!=="ok")(SOURCE[r[0]]||[]).forEach(c=>{if(!out.includes(c))out.push(c)})});return out}
function firstStep(rows){
 const st=Object.fromEntries(rows.map(r=>[r[0],r[1]]));
 if(st["Governance & security"]!=="ok") return ["Governance & security","Security is no longer optional, and every AI tool you add will depend on it."];
 if(st["Technology infrastructure"]==="start") return ["Technology infrastructure","AI can only work across what's connected. The network and systems come first."];
 if(st["Data readiness"]==="start") return ["Data readiness","Get what people know into systems before anything tries to use it."];
 if(st["Experience layer"]==="start") return ["Experience layer","Your phones, contact center and the systems behind them are where customers feel the difference."];
 if(st["Workforce & adoption"]==="start") return ["Workforce & adoption","Tools don't change anything until people use them. Leadership goes first."];
 if(st["Technology infrastructure"]==="work") return ["Technology infrastructure","Close the gaps between your systems, on a network that can carry more."];
 return [null,"The foundation is in good shape. The first move itself is the right place to start."];
}
function inTheWay(){
 return [["Data readiness",...worst(STATUS.walk[A.walk],STATUS.systems[A.systems])],["Technology infrastructure",...STATUS.network[A.network]],["Governance & security",...STATUS.ai[A.ai]],["Experience layer",...worst(STATUS.wait[A.wait],STATUS.collab[A.collab])],["Strategic direction",...STATUS.numbers[A.numbers]],["Workforce & adoption",...worst(STATUS.leaders[A.leaders],STATUS.feel[A.feel])]];
}
function supplierFit(){
 const s=[];
 if(!["rarely","na"].includes(A.wait)) s.push(["Customer experience",`Customers wait on ${low(label("wait",A.wait))}. Opens CX and contact center.`]);
 if(A.limit==="support") s.push(["Contact center",`Support is what limits growth. Strongest CX and contact center signal.`]);
 if(A.systems!=="few") s.push(["Data & integration",`Systems: ${low(label("systems",A.systems))}. Opens integration and data platforms.`]);
 if(A.network!=="grow") s.push(["Network & connectivity",`Network: ${low(label("network",A.network))}. Opens SD-WAN, internet and managed network.`]);
 if(!["one"].includes(A.collab)) s.push(["Communication & collaboration",`Team works: ${low(label("collab",A.collab))}. Opens UCaaS and collaboration.`]);
 if(["wait","skeptic"].includes(A.leaders)||["worried","indifferent"].includes(A.feel)) s.push(["Training & enablement",`Leadership: ${low(label("leaders",A.leaders))}. Mood: ${low(label("feel",A.feel))}. Opens AI training and adoption.`]);
 s.push(["Governance & AI gateway",`AI in use: ${low(label("ai",A.ai))}. Opens governance, security and AI gateway (e.g. Expedient).`]);
 return s;
}
function opener(){
 const ai={approved:"your people only use approved AI tools",both:"people use their own AI accounts alongside the approved ones",own:"your people use their own AI accounts",blocked:"you've blocked AI",unknown:"you're not sure what AI your people are using"}[A.ai];
 return `You said ${LIMIT_NP[A.limit]} is what limits growth, and that ${ai}. Can I show you what a first move on that limit looks like, with the security side handled first?`;
}


function answersText(){
 const seat=SEATS.find(s=>s[0]===A.seat)[1];
 const lines=[`Seat: ${seat}`, `Company website: ${company()||"not given"}`];
 Q.forEach(q=>{lines.push(`${q.q()} ${label(q.id,A[q.id])}`); const n=(A.notes||{})[q.id]; if(n&&n.trim()) lines.push(`  Note: ${n.trim()}`)});
 return lines.join("\n");
}
function resultsText(m,rows,fs,sit){
 return [`Where AI fits at ${company()||"your company"}`, sit, "", `Where AI is already in use: ${lives()}`, "", `First move: ${m.name}`, m.seat[A.seat], `Where the gain lands: ${m.gain}`, "", "What it needs underneath:", ...rows.map(r=>`- ${r[0]}: ${r[2]}. ${r[3]}`), fs[0]?`Start here: ${fs[0]}. ${fs[1]}`:fs[1]].join("\n");
}
async function post(url,body){
 const r=await fetch(url,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
 let j={}; try{j=await r.json()}catch(e){}
 if(!r.ok) throw new Error(j.error||"Something went wrong. Please try again.");
 return j;
}
function base(){return {page:location.pathname, referrer:document.referrer, source:"where-ai-starts"}}

function result(){
 setLoc(6);
 const key=pickMove(), m=MOVES[key], co=company(), rows=inTheWay(), fs=firstStep(rows);
 const ordered=fs[0]?[rows.find(r=>r[0]===fs[0]),...rows.filter(r=>r[0]!==fs[0])]:rows;
 const sit=situation().text;
 const who=AGENT?AGENT.first:"a Resultant";
 app.innerHTML=`<section class="t-stack t-fade" style="gap:44px">
  <div class="t-stack">
   <p class="eyebrow">Results${co?" for "+esc(co):""}</p>
   <h2 class="t-h1">Where AI fits at ${esc(co||"your company")}</h2>
   <p class="t-why">${SEAT_LINE[A.seat]}</p>
   <p class="t-lede" id="sit">${esc(sit)}</p>
  </div>
  <div class="t-stack t-tight"><h3>Where AI is already in use</h3><p>${lives()}</p></div>
  <div class="t-stack">
   <p class="eyebrow">The first move worth making</p>
   <h2>${m.name}</h2>
   <p>${m.seat[A.seat]}</p>
   <div class="t-screen"><div class="t-screen-bar"><span>${esc(m.bar)}</span><span>Illustration</span></div>
    <div class="t-msgs">${m.chat.map(x=>`<div class="t-msg ${x[0]}"><span class="who">${x[0]==="ai"?"AI":"You"}</span>${esc(x[1])}</div>`).join("")}</div></div>
   <div class="t-compare"><div class="t-stack t-tight"><p class="eyebrow">Today</p><p>${m.old}</p></div><div class="t-stack t-tight"><p class="eyebrow">After the first move</p><p>${m.now}</p></div></div>
   <div class="t-stack t-tight"><h3>Where the gain lands</h3><p>${m.gain}</p></div>
  </div>
  <div class="t-stack t-tight">
   <h2>What it needs underneath</h2>
   <p class="t-why">You'll use AI either way. Whether it works depends on what's underneath it. Mapped to the six dimensions of AI readiness.</p>
   ${fs[0]?"":`<p class="t-reveal">${fs[1]}</p>`}
   <div class="t-needs">${ordered.map(r=>{const top=r[0]===fs[0];return `<div class="t-need${top?" top":""}"><div>${top?`<p class="eyebrow">Start here</p>`:""}<h3>${r[0]}</h3><span class="t-chip ${r[1]}">${r[2]}</span></div><div class="t-stack" style="gap:6px"><p>${r[3]}</p>${top?`<p><strong>${fs[1]}</strong></p>`:""}</div></div>`}).join("")}</div>
  </div>

  <div class="t-panel" id="talkPanel">
   <h2>Before you buy AI, make sure the foundation underneath it is built right.</h2>
   <p>30 minutes with ${AGENT?esc(AGENT.name):"a Resultant"} on what ${esc(co||"your company")} has, what the first move needs, and what it would cost. No vendors in the room.</p>
   <form id="talkForm" class="t-form">
    <div class="t-fields"><input id="t-name" name="name" placeholder="Name" autocomplete="name" required><input id="t-email" name="email" type="email" placeholder="Work email" autocomplete="email" required><input id="t-company" name="company" placeholder="Company" autocomplete="organization" value="${esc(co)}"></div>
    <label class="t-check"><input type="checkbox" id="t-consent" required> Contact me to set up the conversation. I've read the <a href="privacy.html">privacy notice</a>.</label>
    <input type="text" name="website" tabindex="-1" autocomplete="off" class="t-hp" aria-hidden="true">
    <div class="t-row"><button class="button primary" type="submit">Talk to ${esc(who)} <span>↗</span></button></div>
    <p class="t-status" role="status"></p>
   </form>
  </div>

  <form class="t-stack t-tight t-email" id="emailForm">
   <h3>Email me these results</h3>
   <p class="t-why">Forward them to a colleague in another seat. Everyone answers the same questions, so you can see where your answers differ.</p>
   <div class="t-fields"><input id="e-name" placeholder="Name" autocomplete="name" required><input id="e-email" type="email" placeholder="Work email" autocomplete="email" required></div>
   <label class="t-check"><input type="checkbox" id="e-consent" required> Email me my results. I've read the <a href="privacy.html">privacy notice</a>.</label>
   <div class="t-row"><button class="button" type="submit">Email my results</button></div>
   <p class="t-status" role="status"></p>
  </form>

  <div class="t-stack t-tight">
   <h3>Planning the first move?</h3>
   <p class="t-why">The AI Workflow Starter Kit is a worksheet, online or as a fillable PDF, for scoping one AI workflow: a workflow brief and baseline, review boundaries, a check of what it depends on underneath, and a full-cost worksheet with a continue, change or stop review.</p>
   <p><a class="tlink" href="ai-workflow-starter-kit.html">Get the working kit</a></p>
  </div>
  <p><button class="t-link" type="button" id="again">Start over</button></p>
 </section>`;

 const summary=()=>resultsText(m,rows,fs,document.getElementById("sit").textContent);
 const priorities=()=>["Growth limit: "+label("limit",A.limit),"First move: "+m.name,"Start here: "+(fs[0]||"none"),...supplierFit().map(s=>`${s[0]}: ${s[1]}`),"Suggested opener: "+opener()].join("\n");
 const tf=document.getElementById("talkForm");
 tf.onsubmit=async ev=>{ev.preventDefault();const st=tf.querySelector(".t-status");st.textContent="Sending…";
  try{const j=await post("/api/air-submit",{...base(),type:"contact",name:tf.querySelector("#t-name").value,email:tf.querySelector("#t-email").value,company:tf.querySelector("#t-company").value,contactConsent:tf.querySelector("#t-consent").checked,website:tf.querySelector(".t-hp").value,context:"Requested from Where AI Starts results.\n\n"+answersText(),assessmentSummary:summary(),assessmentPriorities:priorities(),assessmentResponses:answersText()});
   st.innerHTML=j.bookingUrl?`Thanks. <a href="${esc(j.bookingUrl)}">Pick a time</a> that works for you.`:`Thanks. ${AGENT?esc(AGENT.first):"A Resultant"} will be in touch to set a time.`;tf.querySelector("button").disabled=true}
  catch(e){st.textContent=e.message}};
 const ef=document.getElementById("emailForm");
 ef.onsubmit=async ev=>{ev.preventDefault();const st=ef.querySelector(".t-status");st.textContent="Sending…";
  try{const j2=await post("/api/air-submit",{...base(),type:"assessment",name:ef.querySelector("#e-name").value,email:ef.querySelector("#e-email").value,company:co,deliveryConsent:ef.querySelector("#e-consent").checked,assessmentSummary:summary(),assessmentPriorities:priorities(),assessmentResponses:summary()+"\n\nYour answers\n"+answersText()});
   st.textContent=j2&&j2.deliveryStatus==="delivered"?"Sent. Check your inbox.":"Got it. Your results are on their way to your inbox.";ef.querySelector("button").disabled=true}
  catch(e){st.textContent=e.message}};
 document.getElementById("again").onclick=()=>{A={};step=-1;render();app.scrollIntoView({block:"start"})};

 // AI-written situation paragraph. The prewritten version stays if this fails or isn't configured.
 fetch("/api/air-read",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({answers:answersText(),url:A.url||"",fallback:sit})})
  .then(r=>r.status===200?r.json():null).then(j=>{if(j&&j.situation){const el=document.getElementById("sit");if(el)el.textContent=j.situation}}).catch(()=>{});
}
render();

})();
