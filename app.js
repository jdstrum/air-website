const DIMENSIONS=[
 {name:'Strategic direction',title:'What should AI change for the business?',copy:'An owner. A measurable outcome. A clear view of the workflows that need to evolve. Start with the work you want to improve.',tags:['Business priorities','Workflow direction','Accountability'],next:'Choose one business outcome, name an accountable owner, and map the workflow that needs to change.'},
 {name:'Data readiness',title:'Can the right knowledge reach the work?',copy:'Your information lives across systems, documents, calls, and meetings. Make it reliable and connected enough for AI to put it to work.',tags:['Connected knowledge','Data quality','Integration'],next:'Trace one important workflow or decision back to its data sources. Identify the access, quality, or connection that slows the work.'},
 {name:'Technology infrastructure',title:'Can the environment carry the ambition?',copy:'Where AI runs, how it connects, and how capacity scales all matter. Match the environment to the workload, the economics, and the control you need.',tags:['Cloud & compute','Networks','Workload placement'],next:'Choose a priority workload and review its capacity, connectivity, placement, and cost requirements with a technology advisor.'},
 {name:'Governance & security',title:'Can people use AI with confidence?',copy:'Know which tools are in use, what information is protected, and how outputs and actions are checked. Turn good intentions into safeguards people can use.',tags:['Secure access','Data boundaries','Verification'],next:'Compare the AI tools in daily use with your approved policy. Identify the first gap in visibility, data protection, or verification.'},
 {name:'Experience layer',title:'Does context survive the handoff?',copy:'Customers and employees move between tools, channels, and teams. Connected experiences keep useful context from getting lost along the way.',tags:['Customer experience','Collaboration','Usable tools'],next:'Follow one customer or employee journey across its handoffs and find where useful context disappears.'},
 {name:'Workforce & adoption',title:'Does individual use become shared capability?',copy:'Useful AI adoption takes more than licenses. Equip people, share what works, and help leaders model the change they want to see.',tags:['Practical training','Shared practices','Leadership'],next:'Identify one useful AI practice, make time to teach it, and give a leader responsibility for sharing it across the team.'}
];
const DIMENSION_ROUTES=["strategic-direction", "data-readiness", "technology-infrastructure", "governance-security", "experience-layer", "workforce-adoption"];
const list=document.querySelector('.dimension-list'),panel=document.querySelector('#dimension-panel');
if(list&&panel){
DIMENSIONS.forEach((d,i)=>{let b=document.createElement('button');b.id='dimension-'+i;b.dataset.dimensionLink=DIMENSION_ROUTES[i];b.setAttribute('role','tab');b.setAttribute('aria-controls','dimension-panel');b.innerHTML=d.name+'<span aria-hidden="true">↗</span>';b.onclick=()=>selectDimension(i);b.onkeydown=e=>{let n=i;if(e.key==='ArrowDown')n=(i+1)%6;else if(e.key==='ArrowUp')n=(i+5)%6;else if(e.key==='Home')n=0;else if(e.key==='End')n=5;else return;e.preventDefault();selectDimension(n);list.children[n].focus()};list.append(b)});
function selectDimension(i){[...list.children].forEach((b,j)=>{b.setAttribute('aria-selected',String(i===j));b.tabIndex=i===j?0:-1});const d=DIMENSIONS[i];panel.setAttribute('aria-labelledby','dimension-'+i);panel.dataset.dimension=DIMENSION_ROUTES[i];panel.innerHTML='<p class="eyebrow">'+d.name.toUpperCase()+'</p><h3>'+d.title+'</h3><p>'+d.copy+'</p><div class="capabilities">'+d.tags.map(t=>'<span>'+t+'</span>').join('')+'</div>'+('<a class="dimension-deep-link" href="'+DIMENSION_ROUTES[i]+'.html?palette=cinematic">Explore '+d.name.toLowerCase()+' <span>↗</span></a>')}selectDimension(0);
}
const assessment=document.querySelector('#assessment'),contact=document.querySelector('#contact'),quiz=document.querySelector('#quiz');
const order=[0,3,6,9,12,15,1,4,7,10,13,16,2,5,8,11,14,17];
const INTENTS=['Reduce repetitive work','Improve service','Connect our data','Review technology costs','Strengthen security','Support our people'];
let step=0,answers={},intent=[],returnFocus=null;
const escapeHtml=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function openDialog(d){returnFocus=document.activeElement;d.showModal();document.body.style.overflow='hidden'}
document.querySelectorAll('[data-assessment]').forEach(b=>b.onclick=()=>{renderQuiz();openDialog(assessment)});
document.querySelectorAll('[data-contact]').forEach(b=>b.onclick=()=>openContact(false));
document.querySelectorAll('dialog').forEach(d=>{d.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>d.close());d.addEventListener('close',()=>{document.body.style.overflow=document.querySelector('dialog[open]')?'hidden':'';if(d===contact)contact.querySelector('form')?.reset();if(!document.querySelector('dialog[open]')&&returnFocus?.isConnected&&!returnFocus.closest('dialog:not([open])'))returnFocus.focus()});d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close()}})});
function focusHeading(){const h=quiz.querySelector('h2');h.tabIndex=-1;h.focus({preventScroll:true});assessment.scrollTop=0}
function renderQuiz(focus=false){
 if(step===18){renderIntent();if(focus)focusHeading();return}
 if(step>18){renderResults();if(focus)focusHeading();return}
 const q=QUESTIONS[order[step]],a=answers[q.id];
 quiz.innerHTML='<div class="quiz-meta"><span>'+DIMENSIONS[q.dimension].name+'</span><span>'+(step+1)+' of 18</span></div><div class="progress" role="progressbar" aria-label="Assessment progress" aria-valuemin="0" aria-valuemax="18" aria-valuenow="'+step+'"><div style="width:'+step/18*100+'%"></div></div><h2 id="quiz-title">'+q.title+'</h2>'+(step===0?'<p class="result-note">Answer for the business or team you know. Think about one priority workflow where relevant. You can be well prepared without deploying AI. See your initial result before sharing an email.</p>':'')+'<div class="options">'+q.options.map((t,i)=>'<button class="option" data-answer="'+i+'" aria-pressed="'+(a===i)+'"><i aria-hidden="true"></i>'+t+'</button>').join('')+'<button class="option" data-answer="unknown" aria-pressed="'+(a==='unknown')+'">I’m not sure</button>'+(q.id==='Q14'?'<button class="option" data-answer="skip" aria-pressed="'+(a==='skip')+'">Not applicable to our organization</button>':'')+'</div><div class="quiz-nav"><button class="back" '+(step===0?'disabled':'')+'>← Back</button><button class="button primary" id="next" '+(a===undefined?'disabled':'')+'>Continue <span>→</span></button></div>';
 quiz.querySelectorAll('[data-answer]').forEach(b=>b.onclick=()=>{const value=b.dataset.answer;answers[q.id]=['unknown','skip'].includes(value)?value:Number(value);quiz.querySelectorAll('[data-answer]').forEach(o=>o.setAttribute('aria-pressed',String(o===b)));quiz.querySelector('#next').disabled=false});
 quiz.querySelector('.back').onclick=()=>{step--;renderQuiz(true)};quiz.querySelector('#next').onclick=()=>{step++;renderQuiz(true)};if(focus)focusHeading();
}
function renderIntent(){
 quiz.innerHTML='<p class="eyebrow">ONE OPTIONAL LAST THOUGHT</p><h2 id="quiz-title">What would you like to work on?</h2><p class="result-note">Choose any that apply, or continue. This adds context for a conversation; it does not change your result.</p><div class="intent-options">'+INTENTS.map((t,i)=>'<button class="option" aria-pressed="'+intent.includes(i)+'" data-intent="'+i+'">'+t+'</button>').join('')+'</div><div class="quiz-nav"><button class="back">← Back</button><button class="button primary" id="see-results">See my picture <span>↗</span></button></div>';
 quiz.querySelectorAll('[data-intent]').forEach(b=>b.onclick=()=>{const i=Number(b.dataset.intent);intent=intent.includes(i)?intent.filter(n=>n!==i):[...intent,i];b.setAttribute('aria-pressed',String(intent.includes(i)))});quiz.querySelector('.back').onclick=()=>{step=17;renderQuiz(true)};quiz.querySelector('#see-results').onclick=()=>{step=19;renderQuiz(true)};
}
function summarize(a){
 const valid=v=>Number.isInteger(v)&&v>=0&&v<=3;
 const counts=DIMENSIONS.map((_,i)=>QUESTIONS.filter(q=>q.dimension===i&&valid(a[q.id])).length);
 const scores=DIMENSIONS.map((_,i)=>{const vals=QUESTIONS.filter(q=>q.dimension===i).map(q=>a[q.id]).filter(valid);return vals.length?vals.reduce((x,y)=>x+y,0)/vals.length:null});
 const ranked=scores.map((v,i)=>({v,i})).filter(x=>counts[x.i]>=2).sort((a,b)=>a.v-b.v||a.i-b.i);
 const low=ranked[0],high=ranked.at(-1);
 return {scores,counts,low,high,known:counts.reduce((a,b)=>a+b,0),unknown:QUESTIONS.filter(q=>a[q.id]==='unknown').length,skipped:QUESTIONS.filter(q=>a[q.id]==='skip').length,flat:!!low&&low.v===high.v,lows:low?ranked.filter(x=>x.v===low.v).map(x=>x.i):[],highs:high?ranked.filter(x=>x.v===high.v).map(x=>x.i):[]};
}
function resultModel(a){
 const s=summarize(a),names=indices=>indices.map(i=>DIMENSIONS[i].name).join(' · ');
 if(!s.low)return {s,headline:'Start by filling in the picture.',strength:'There is not enough information to identify a strength.',gap:'The unanswered questions are the next useful conversation.',next:'Bring one priority workflow and the people who know its data, systems, and day-to-day work. Use the unanswered questions to find what needs checking.'};
 const early=s.high.v<1.5,strong=s.low.v>=2.5;
 const strength=early?'Your answers point to foundations still taking shape. It is too early to call one a clear strength.':s.flat?'The dimensions with enough answers show a similar starting point. There is no single standout strength.':'A relative strength in your answers: '+names(s.highs)+'.';
 const gap=strong?'Your answers suggest established practices. Validate them against a real workload before expanding.':s.flat?'Choose the priority by business impact; the answers do not identify one uniquely weaker dimension.':'Areas to explore: '+names(s.lows)+'.';
 const next=strong?'Choose one priority workflow and check the practices you described against real evidence, including the effect on people.':s.lows.length===1?DIMENSIONS[s.low.i].next:'Choose the business outcome that matters most, then review the related gaps with the people responsible for the work.';
 return {s,headline:early?'Build the foundation for one useful move.':strong?'A foundation worth validating.':'A starting point for the conversation.',strength,gap,next};
}
function levelLabel(s,i){if(s.counts[i]<2)return 'More information needed';const v=s.scores[i];return v<1.5?'Foundations to develop':v<2.5?'Practices taking shape':'Practices to validate'}
function assessmentText(){
 const m=resultModel(answers),s=m.s;
 return ['AI RESULTING — YOUR INITIAL READ',m.headline,'',m.strength,m.gap,'Next step: '+m.next,'',...DIMENSIONS.map((d,i)=>d.name+': '+levelLabel(s,i)+' ('+s.counts[i]+' of 3 answered)'),'', 'Your priorities: '+(intent.map(i=>INTENTS[i]).join(', ')||'Not selected'),'', 'YOUR RESPONSES',...QUESTIONS.map(q=>q.id+' '+q.title+'\n'+(typeof answers[q.id]==='number'?q.options[answers[q.id]]:answers[q.id]==='skip'?'Not applicable':'Not sure')),'','This is a self-reported, directional interpretation, not an audit, certification, or industry benchmark. Unknown and not-applicable answers are excluded. Dimensions need at least two answers for an interpretation.','Assessment '+ASSESSMENT_VERSION].join('\n');
}
function renderResults(){
 const m=resultModel(answers),s=m.s;
 quiz.innerHTML='<p class="eyebrow">YOUR INITIAL READ</p><h2 id="quiz-title">'+m.headline+'</h2><div class="result-item"><span class="eyebrow">WHAT YOU CAN BUILD ON</span><p>'+m.strength+'</p></div><div class="result-item"><span class="eyebrow">WHAT DESERVES ATTENTION</span><p>'+m.gap+'</p></div><div class="result-item"><span class="eyebrow">ONE PRACTICAL NEXT STEP</span><p>'+m.next+'</p></div><p class="result-note">Based on '+s.known+' substantive answers; '+s.unknown+' not sure'+(s.skipped?', '+s.skipped+' not applicable':'')+'. Unknowns are excluded, not treated as low readiness. This is a self-reported starting point, not an audit or industry benchmark.</p><button class="button primary" id="result-contact">Email my full readiness picture <span>↗</span></button><p class="result-note">Share your email to receive the six-dimension summary and a copy of your responses. A conversation is optional. Delivery is being prepared for launch; this preview does not send or save information.</p><div class="result-actions"><button class="back" id="review-answers">← Review answers</button></div>';
 quiz.querySelector('#result-contact').onclick=()=>{assessment.close();openContact(true)};
 quiz.querySelector('#review-answers').onclick=()=>{step=0;renderQuiz(true)};
}
function openContact(withResults){
 let body=contact.querySelector('.contact-body');if(!body){body=document.createElement('div');body.className='contact-body';while(contact.children.length>1)contact.lastElementChild.remove();contact.append(body)}
 body.innerHTML='<h2 id="contact-title">'+(withResults?'Take the full picture<br>with you.':'Tell us what’s<br>getting in the way.')+'</h2><p>'+(withResults?'Share your email to receive your six-dimension summary and a copy of your responses. You can also ask to talk it through.':'Tell us where technology could help your business. We’ll start with the work, the people, and what needs to get better.')+'</p><div class="preview-note"><strong>Contact preview</strong><p>Delivery and booking open at launch. You can try this form; nothing entered here is sent or saved. Use sample details.</p></div>'+(withResults?'<div class="contact-context"><span class="eyebrow">YOUR PRACTICAL NEXT STEP</span><p>'+resultModel(answers).next+'</p></div>':'')+'<form id="contact-form"><label for="contact-name">Name</label><input id="contact-name" name="name" autocomplete="name" maxlength="100" required><label for="contact-email">Work email</label><input id="contact-email" name="email" type="email" autocomplete="email" maxlength="254" required><label for="contact-company">Company <span>(optional)</span></label><input id="contact-company" name="company" autocomplete="organization" maxlength="160"><label for="contact-context">What would you like to work through? <span>(optional)</span></label><textarea id="contact-context" name="context" rows="3" maxlength="1500"></textarea>'+(withResults?'<label class="contact-consent"><input type="checkbox" required name="deliveryConsent"><span>Send my readiness picture to the email above and use my assessment answers to prepare it.</span></label><label class="contact-consent"><input type="checkbox" name="contactConsent"><span>I’d also like AI Resulting to contact me about my results.</span></label><p class="result-note">Receiving your picture does not subscribe you to marketing.</p><button class="button primary" type="submit">Email my full picture <span>↗</span></button>':'<label class="contact-consent"><input type="checkbox" required name="contactConsent"><span>I’d like AI Resulting to contact me about this request.</span></label><p class="result-note">Requesting a conversation does not subscribe you to marketing.</p><button class="button primary" type="submit">Preview my request <span>↗</span></button>')+'</form>'+(withResults?'<button class="back" id="back-results">← Back to my picture</button>':'');
 body.querySelector('form').onsubmit=e=>{e.preventDefault();body.querySelector('form').reset();body.innerHTML='<h2 id="contact-title" tabindex="-1">That’s the handoff.</h2><p class="contact-status" role="status">Preview complete. Nothing was sent or saved.</p><p>'+(withResults?'At launch, the full six-dimension summary and a copy of the responses will be sent to the email provided. If a conversation was requested, AIR will follow up separately.':'At launch, this request will connect your context to the advisor conversation. The delivery and scheduling step still needs to be connected.')+'</p><button class="button primary" id="contact-done">'+(withResults?'Return to my picture':'Back to exploring')+' <span>↗</span></button>';body.querySelector('#contact-done').onclick=()=>{contact.close();if(withResults){renderResults();openDialog(assessment)}};body.querySelector('h2').focus()};
 body.querySelector('#back-results')?.addEventListener('click',()=>{contact.close();renderResults();openDialog(assessment)});
 openDialog(contact);
}
let refreshHero=()=>{};
const art=document.querySelector('.hero-art');
if(art){
const imageStage=art.querySelector('.art-image');
const pause=document.createElement('button');
pause.className='pause-motion';
const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
let motionRunning=!reducedMotion.matches;
let foldAnimations=[];
const foldCount=8;
const folds=Array.from({length:foldCount},(_,i)=>{
 const face=document.createElement('span');face.className='fold-face';face.setAttribute('aria-hidden','true');
 const texture=document.createElement('span');texture.className='fold-texture';face.append(texture);imageStage.append(face);
 return {face,texture};
});
function foldTransform(index,width,angle){
 const radians=angle*Math.PI/180;
 const projected=width*Math.cos(radians);
 const inset=(width*foldCount-projected*foldCount)/2;
 const x=inset+index*projected;
 const z=index%2 ? -width*Math.sin(radians):0;
 return 'translate3d('+x+'px,0,'+z+'px) rotateY('+(index%2?-angle:angle)+'deg)';
}
function layoutFolds(){
 const width=imageStage.clientWidth,height=imageStage.clientHeight;
 if(!width||!height)return;
 const time=foldAnimations[0]?.currentTime||0;
 foldAnimations.forEach(animation=>animation.cancel());foldAnimations=[];
 folds.forEach(({face,texture},i)=>{
  const panelWidth=width/foldCount;
  face.style.width=(panelWidth+.5)+'px';
  face.style.transform=foldTransform(i,panelWidth,0);
  texture.style.width=width+'px';texture.style.height=height+'px';texture.style.left=(-i*panelWidth)+'px';
  const cinematic=document.documentElement.dataset.palette==='cinematic';
  const angle=cinematic?32:46;
  const frames=[{transform:foldTransform(i,panelWidth,angle),offset:0},{transform:foldTransform(i,panelWidth,0),offset:cinematic?.28:.32},{transform:foldTransform(i,panelWidth,0),offset:cinematic?.88:.7},{transform:foldTransform(i,panelWidth,angle),offset:1}];
  const animation=face.animate(frames,{duration:cinematic?26000:14000,iterations:Infinity,easing:'ease-in-out'});
  animation.currentTime=reducedMotion.matches&&!motionRunning?(cinematic?10000:6500):time;
  if(!motionRunning)animation.pause();
  foldAnimations.push(animation);
 });
}
function updateMotion(){
 foldAnimations.forEach(animation=>motionRunning?animation.play():animation.pause());
 pause.textContent=motionRunning?'Pause motion':'Play motion';
 pause.setAttribute('aria-label',motionRunning?'Pause accordion animation':'Play accordion animation');
 pause.setAttribute('aria-pressed',String(motionRunning));
}
pause.onclick=()=>{motionRunning=!motionRunning;updateMotion()};
reducedMotion.addEventListener('change',()=>{
 motionRunning=!reducedMotion.matches;
 if(!motionRunning)foldAnimations.forEach(animation=>animation.currentTime=animation.effect.getTiming().duration*.5);
 updateMotion();
});
art.append(pause);layoutFolds();updateMotion();
new ResizeObserver(layoutFolds).observe(imageStage);
refreshHero=layoutFolds;
}

const paletteButtons=document.querySelectorAll('button[data-palette]');
function setPalette(name,updateUrl=false){
 if(!['blue','evergreen','vermilion','nocturne','cinematic'].includes(name))name='blue';
 document.documentElement.dataset.palette=name;
 refreshHero();
 paletteButtons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.palette===name)));
 if(updateUrl){const url=new URL(window.location.href);url.searchParams.set('palette',name);history.replaceState(null,'',url)}
}
paletteButtons.forEach(b=>b.addEventListener('click',()=>setPalette(b.dataset.palette,true)));
setPalette(new URLSearchParams(window.location.search).get('palette')||document.documentElement.dataset.palette||'blue');

const readinessMenu=document.querySelector('.readiness-menu');
if(readinessMenu){
 document.addEventListener('click',event=>{if(!readinessMenu.contains(event.target))readinessMenu.open=false});
 readinessMenu.addEventListener('keydown',event=>{if(event.key==='Escape'&&readinessMenu.open){readinessMenu.open=false;readinessMenu.querySelector('summary').focus();event.preventDefault()}});
 readinessMenu.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{readinessMenu.open=false}));
}

// A single quiet entrance adds depth without another perpetual animation.
const motionPreference=window.matchMedia('(prefers-reduced-motion: reduce)');
const entranceAnimations=new Set();
if('IntersectionObserver' in window){
 const entrances=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(!entry.isIntersecting)return;entrances.unobserve(entry.target);if(motionPreference.matches)return;const animation=entry.target.animate([{opacity:.75,translate:'0 12px'},{opacity:1,translate:'0 0'}],{duration:500,easing:'ease-out'});entranceAnimations.add(animation);animation.onfinish=()=>entranceAnimations.delete(animation)})},{threshold:.12});
 document.querySelectorAll('.path-schematic,.working-brief,.brief-next,.network-fabric,.condition-rows article').forEach(element=>entrances.observe(element));
 motionPreference.addEventListener('change',()=>{if(motionPreference.matches){entranceAnimations.forEach(a=>a.cancel());entranceAnimations.clear()}});
}
