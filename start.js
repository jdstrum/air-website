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
 {id:"walk", q:()=>`If the most relied-on person in ${scope()} left Friday, how much would go with them?`, why:"Think about how the work actually gets done, not the org chart.",
  opts:[
   ["doc","Very little. It's written down.","That's rare. Written-down knowledge is exactly what AI can put to work."],
   ["some","Some shortcuts and history","The shortcuts and history are what make someone fast. They can be captured before they leave."],
   ["most","Most of how the work actually gets done","Then the real process lives in a person. AI can't use it until it's written down, and recorded conversations are enough to start."],
   ["trouble","We'd be in real trouble","That's a risk today, with or without AI. It's also the clearest place to start."]]},
 {id:"move", q:()=>"How much of your team's week goes to moving information from one system to another?", why:"Copying, re-keying, exporting, pasting.",
  opts:[
   ["none","Almost none. Our systems connect.","Connected systems are what AI works across. That's a real head start."],
   ["some","An hour or two a week","Every copy between tools is a place AI stops, because it can only use what's connected."],
   ["lot","Hours every day","That time is the clearest map of which systems to connect first."],
   ["email","It's someone's whole job","Then the first move isn't AI. It's connecting the systems that person is holding together."]]},
 {id:"ai", q:()=>"What AI are people using at work?", why:"There's always some. The question is whether anyone chose it.",
  opts:[
   ["approved","Only tools the company approved","Then the next question is what those tools can reach, and who decided."],
   ["both","Approved tools, plus their own accounts on the side","The approved tool isn't meeting the need, so people go around it. Company data goes with them."],
   ["own","Their own accounts. Nothing is approved.","Company information is already going into personal accounts. That's where governance starts."],
   ["blocked","We've blocked it","Blocking usually moves it to phones and home laptops. The demand doesn't go away."],
   ["unknown","I don't know","That's an honest answer, and it's the right place to start."]]},
 {id:"wait", q:()=>"What do customers wait on you for most?", why:"Pick the wait they'd complain about first.",
  opts:[
   ["quotes","Quotes and proposals","Speed to quote often decides who wins, and it's one of the easiest waits to shorten."],
   ["answers","Answers to questions","Most of those answers already exist somewhere in your company."],
   ["setup","Getting set up after they buy","Setup is a checklist plus judgment. AI can run the checklist."],
   ["fix","Getting problems fixed","Slow fixes are usually a routing and information problem before they're a staffing problem."],
   ["rarely","They rarely wait","Then AI can make a good experience cheaper to deliver, not just faster."],
   ["na","Not close enough to say","Fair. The people who hear the complaints will know, and it's worth asking them."]]},
 {id:"basis", q:()=>"When leadership makes a call, what's it usually based on?", why:"Most companies use all three. Pick the one that usually wins.",
  opts:[
   ["live","Live numbers from our systems","Leadership already works from data. AI can tell you what needs attention, not just what happened."],
   ["reports","Reports someone puts together each week or month","A report someone assembles is already out of date when it's read."],
   ["talk","Conversations and experience","Experience built the company. A daily read across your systems tells you when it's wrong."]]},
 {id:"limit", q:()=>"What limits how much more business you could take on?", why:"Speeding up anything else just moves the pile. This is where AI turns into revenue.",
  opts:[
   ["win","Finding and winning enough customers","Then the first move belongs in front of the customer: faster, sharper proposals."],
   ["deliver","Delivering what we've sold fast enough","Then speeding up sales would only make it worse. The first move belongs in delivery."],
   ["support","Supporting customers as we grow","Support is where growth quietly turns into cost. It's also where AI takes the most load."],
   ["hire","Hiring and training people fast enough","Then the first move shortens how long it takes someone new to be useful."],
   ["decide","Decisions and approvals take too long","Then the first move gets leadership a current picture, every morning."]]}
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
  layers:["Artificial intelligence","Data center & cloud","Cybersecurity"]},
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
  layers:["Artificial intelligence","Cybersecurity","Managed IT"]},
 account:{name:"A delivery desk that reads every system at once",
  bar:"Example · connected to CRM, ERP, project tracker",
  chat:[["you","Where are we with Meridian Supply's rollout?"],
        ["ai","Two of three sites are live. Site three is waiting on the circuit install, now scheduled Oct 14. One open item: their billing contact changed and the first invoice bounced. Their exec sponsor asked for a status update on Monday. Draft is ready."]],
  old:"Check the CRM, the ERP, the project tracker and someone's inbox, then piece it together.",
  now:"Every account's status in one answer, with the blocker already flagged.",
  gain:"Delivery speeds up when everyone sees the same picture. The next pinch is usually support, as more customers go live faster.",
  seat:{biz:"Faster delivery means revenue recognised sooner and fewer customers wondering where things stand.",
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
 move:{none:["ok","In place","Your systems already connect. AI can work across them."],
  some:["work","Partly there","A few gaps between tools. A contained integration job, on a network that can carry it."],
  lot:["start","Not in place","People are doing the work integrations should. That's a network and integration plan."],
  email:["start","Not in place","A person is the integration. Connect the systems before adding anything on top."]},
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
 basis:{live:["ok","In place","Leadership works from live data. AI decisions have something to anchor to."],
  reports:["work","Partly there","A weekly or monthly read is too slow to steer AI decisions."],
  talk:["start","Not in place","There's no shared, current view of the business for AI decisions to anchor to."]},
 work:{approved:["work","Partly there","Tools without training on a real task tend to go unused."],
  both:["work","Partly there","People want better tools than they've been given. Train them on the approved way."],
  own:["work","Partly there","The appetite is there. People need a sanctioned way to use it."],
  blocked:["work","Partly there","People want it. They need a safe version."],
  unknown:["work","Partly there","Start by asking people what they already use."]}
};

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
  <span class="eyebrow">${AGENT?"Shared with you by "+AGENT.name:"Six questions. Three minutes. No score."}</span>
  <h2 class="t-h1">See where AI already lives in your company.</h2>
  <p class="t-lede">Six questions about how your organisation actually runs. You'll see where AI is already at work, what's in the way, and the first move worth making. No score. Results on screen, no email required.</p>
  <div class="t-row"><button class="button primary" id="go">Start</button><span class="t-why">About three minutes.</span></div>
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
 const q=Q[step]; setLoc(step);
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
 const showRev=()=>{if(sel)rev.innerHTML=`<p class="t-reveal t-fade">${q.opts.find(o=>o[0]===sel)[2]}</p>`};
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
 s+={none:"Your systems connect, so a first move can start quickly.",some:"A few gaps between systems will need closing along the way.",lot:"Your team spends hours a day moving information between systems, and those gaps come first.",email:"Someone's whole job is moving information between systems, and that comes first."}[A.move];
 return {text:s, noted:notes.length};
}
function lives(){
 return {approved:"In the tools you've approved. Probably underused, and it's not clear what they can reach.",
  both:"In your approved tools, and in personal accounts alongside them. The second is where company data leaves.",
  own:"In personal ChatGPT and Claude accounts, outside anything IT can see. Company information is going in.",
  blocked:"On personal phones and home laptops, where blocking doesn't reach.",
  unknown:"Almost certainly in personal accounts. Nobody has checked yet."}[A.ai];
}
const SOURCE={"Data readiness":["Data center & cloud","Managed IT"],"Infrastructure":["Network & connectivity","Data center & cloud"],"Governance & security":["Cybersecurity"],"Customer experience":["Customer experience","Communication & collaboration"]};
function sourced(rows){const out=[];rows.forEach(r=>{if(r[1]!=="ok")(SOURCE[r[0]]||[]).forEach(c=>{if(!out.includes(c))out.push(c)})});return out}
function firstStep(rows){
 const st=Object.fromEntries(rows.map(r=>[r[0],r[1]]));
 if(st["Governance & security"]!=="ok") return ["Governance & security","Security is no longer optional, and every AI tool you add will depend on it."];
 if(st["Infrastructure"]==="start") return ["Infrastructure","AI can only work across what's connected. The network and systems come first."];
 if(st["Data readiness"]==="start") return ["Data readiness","Get what people know into systems before anything tries to use it."];
 if(st["Customer experience"]==="start") return ["Customer experience","Your phones, contact center and the systems behind them are where customers feel the difference."];
 if(st["Infrastructure"]==="work") return ["Infrastructure","Close the gaps between your systems, on a network that can carry more."];
 return [null,"The foundation is in good shape. The first move itself is the right place to start."];
}
function inTheWay(){
 return [["Data readiness",...STATUS.walk[A.walk]],["Infrastructure",...STATUS.move[A.move]],["Governance & security",...STATUS.ai[A.ai]],["Customer experience",...STATUS.wait[A.wait]],["Strategic vision",...STATUS.basis[A.basis]],["Workforce readiness",...STATUS.work[A.ai]]];
}
function supplierFit(){
 const s=[];
 if(!["rarely","na"].includes(A.wait)) s.push(["Customer experience",`Customers wait on ${low(label("wait",A.wait))}. Opens CX and contact center.`]);
 if(A.limit==="support") s.push(["Contact center",`Support is what limits growth. Strongest CX and contact center signal.`]);
 if(A.move!=="none") s.push(["Integration & network",`${label("move",A.move).replace(/\.$/,"")}. Opens integration, SD-WAN and connectivity.`]);
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
 return [`Where AI stands at ${company()||"your company"}`, sit, "", `Where AI already lives: ${lives()}`, "", `First move: ${m.name}`, m.seat[A.seat], `Where the gain lands: ${m.gain}`, "", "What it needs underneath:", ...rows.map(r=>`- ${r[0]}: ${r[2]}. ${r[3]}`), fs[0]?`Start here: ${fs[0]}. ${fs[1]}`:fs[1]].join("\n");
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
   <h2 class="t-h1">Where AI stands at ${esc(co||"your company")}</h2>
   <p class="t-why">${SEAT_LINE[A.seat]}</p>
   <p class="t-lede" id="sit">${esc(sit)}</p>
  </div>
  <div class="t-stack t-tight"><h3>Where AI already lives</h3><p>${lives()}</p></div>
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
   <p class="t-why">The AI Workflow Starter Kit is a six-page fillable PDF for scoping one AI workflow: a workflow brief and baseline, review boundaries, and a full-cost worksheet with a continue, change or stop review.</p>
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
