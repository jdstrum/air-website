/* Working kit request: posts to /api/air-submit as a "kit" request (HighLevel + email delivery). */
(function(){
 var f=document.querySelector('#resource-form'); if(!f) return;
 var st=document.querySelector('#resource-status'), b=f.querySelector('button[type=submit]');
 function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
 f.addEventListener('submit',function(e){
  e.preventDefault(); if(!f.reportValidity()) return;
  var name=f.querySelector('#resource-name').value.trim(), email=f.querySelector('#resource-email').value.trim();
  var talk=!!f.querySelector('[name=conversationConsent]').checked;
  b.disabled=true; st.hidden=false; st.textContent='Sending…';
  fetch('/api/air-submit',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({
   type:'kit', source:'working-kit', page:location.pathname, referrer:document.referrer,
   name:name, email:email, deliveryConsent:true, conversationConsent:talk, contactConsent:talk,
   website:(f.querySelector('.hp')||{}).value||''
  })}).then(function(r){return r.json().catch(function(){return {};}).then(function(j){if(!r.ok) throw new Error(j.error||'Something went wrong. Please try again.'); return j;});})
  .then(function(j){
   var pdf='<a href="assets/your-first-useful-ai-workflow.pdf" download>download it now</a>';
   st.innerHTML=(j.deliveryStatus==='delivered'?'Sent. Check your inbox, or '+pdf+'.':'Thanks, '+esc(name.split(/\s+/)[0])+'. You can '+pdf+', and the link is on its way to your inbox.')+(talk?' A Resultant will also be in touch.':'');
   f.reset(); st.tabIndex=-1; st.focus();
  }).catch(function(err){ st.textContent=err.message; b.disabled=false; });
 });
})();
