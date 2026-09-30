/* Working kit worksheet. Answers stay in this browser (localStorage) unless the visitor sends them. */
(function(){
 var KEY='air-worksheet-v2', form=document.getElementById('ws-form'), main=document.querySelector('main.ws');
 if(!form||!main) return;
 var fields=[].slice.call(main.querySelectorAll('.ws-hero input, #ws-form textarea'));
 var saved=document.getElementById('ws-saved'), timer;

 function read(){ try{ return JSON.parse(localStorage.getItem(KEY)||'{}'); }catch(e){ return {}; } }
 function write(data){ try{ localStorage.setItem(KEY,JSON.stringify(data)); return true; }catch(e){ return false; } }
 function grow(t){ if(t.tagName!=='TEXTAREA') return; t.style.height='auto'; t.style.height=(t.scrollHeight+2)+'px'; }
 function collect(){ var d={}; fields.forEach(function(f){ if(f.value.trim()) d[f.name]=f.value; }); return d; }
 function stamp(ok){
  if(!saved) return;
  if(!ok){ saved.textContent='This browser isn’t saving answers. Save as PDF before you leave.'; return; }
  var t=new Date(); saved.textContent='Saved on this device at '+t.toLocaleTimeString([], {hour:'numeric',minute:'2-digit'})+'.';
 }
 function counts(){
  [].forEach.call(form.querySelectorAll('[data-part]'),function(sec){
   var all=sec.querySelectorAll('textarea'), done=0;
   [].forEach.call(all,function(t){ if(t.value.trim()) done++; });
   var el=document.querySelector('[data-count="'+sec.dataset.part+'"]');
   if(el) el.textContent=done+' of '+all.length+' answered';
  });
 }

 var data=read();
 fields.forEach(function(f){ if(data[f.name]) f.value=data[f.name]; grow(f); });
 if(Object.keys(data).length && saved) saved.textContent='Your saved answers are loaded from this device.';
 counts();

 main.addEventListener('input',function(e){
  var t=e.target; if(fields.indexOf(t)<0) return;
  grow(t); counts(); clearTimeout(timer);
  timer=setTimeout(function(){ stamp(write(collect())); },400);
 });
 window.addEventListener('resize',function(){ fields.forEach(grow); });

 /* section highlight */
 var links=[].slice.call(document.querySelectorAll('.ws-steps a'));
 if('IntersectionObserver' in window){
  var io=new IntersectionObserver(function(entries){
   entries.forEach(function(en){ if(en.isIntersecting){ links.forEach(function(a){ a.classList.toggle('on',a.getAttribute('href')==='#'+en.target.id); }); } });
  },{rootMargin:'-30% 0px -60% 0px'});
  [].forEach.call(form.querySelectorAll('[data-part]'),function(s){ io.observe(s); });
 }

 /* copy instruction */
 [].forEach.call(document.querySelectorAll('[data-copy]'),function(b){
  b.addEventListener('click',function(){
   var src=document.querySelector(b.dataset.copy); if(!src) return;
   var done=function(){ b.textContent='Copied'; setTimeout(function(){ b.textContent='Copy'; },1600); };
   if(navigator.clipboard) navigator.clipboard.writeText(src.textContent.trim()).then(done,function(){});
  });
 });

 /* print / save as PDF */
 var pd=document.getElementById('ws-print-date');
 if(pd) pd.textContent=new Date().toLocaleDateString([], {year:'numeric',month:'long',day:'numeric'});
 document.getElementById('ws-print').addEventListener('click',function(){ fields.forEach(grow); window.print(); });
 window.addEventListener('beforeprint',function(){ fields.forEach(grow); });

 /* clear */
 document.getElementById('ws-clear').addEventListener('click',function(){
  if(!window.confirm('Clear every answer on this worksheet from this device?')) return;
  fields.forEach(function(f){ f.value=''; grow(f); });
  try{ localStorage.removeItem(KEY); }catch(e){}
  counts(); if(saved) saved.textContent='Answers cleared from this device.';
 });

 /* plain-text summary for the handoff */
 function summary(){
  var out=[], owner=['owner_name','owner_team','owner_date'].map(function(n){ var f=main.querySelector('[name='+n+']'); return f&&f.value.trim(); });
  out.push('Owns the result: '+(owner[0]||'-')+' | Department: '+(owner[1]||'-')+' | Decision date: '+(owner[2]||'-'));
  [].forEach.call(form.querySelectorAll('[data-part]'),function(sec){
   out.push('', '## '+sec.querySelector('.ws-kicker').textContent);
   [].forEach.call(sec.querySelectorAll('label'),function(l){
    var t=l.querySelector('textarea'); if(!t) return;
    var q=l.firstChild.textContent.trim();
    out.push(q+'\n'+(t.value.trim()||'(blank)'));
   });
  });
  return out.join('\n');
 }

 /* send to a Resultant: posts a contact request with the answers attached */
 var send=document.getElementById('ws-send'), st=document.getElementById('ws-send-status');
 if(send) send.addEventListener('submit',function(e){
  e.preventDefault(); if(!send.reportValidity()) return;
  var answered=Object.keys(collect()).filter(function(k){ return k.indexOf('owner_')!==0; }).length;
  var btn=send.querySelector('button[type=submit]'), name=send.name.value.trim();
  btn.disabled=true; st.hidden=false; st.textContent='Sending…';
  fetch('/api/air-submit',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({
   type:'contact', source:'worksheet', page:location.pathname, referrer:document.referrer,
   name:name, email:send.email.value.trim(), company:send.company.value.trim(),
   contactConsent:true,
   context:'Sent from the working kit worksheet (edition 2). '+answered+' of 23 questions answered.',
   assessmentResponses:summary(),
   website:(send.querySelector('.hp')||{}).value||''
  })}).then(function(r){ return r.json().catch(function(){ return {}; }).then(function(j){ if(!r.ok) throw new Error(j.error||'Something went wrong. Please try again.'); return j; }); })
  .then(function(j){
   st.innerHTML='Sent. A Resultant will be in touch'+(j.bookingUrl?', or <a href="'+j.bookingUrl+'">pick a time now</a>':'')+'. Your answers are still saved here.';
   send.reset(); btn.disabled=false; st.tabIndex=-1; st.focus();
  }).catch(function(err){ st.textContent=err.message; btn.disabled=false; });
 });
})();
