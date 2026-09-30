/* Working kit request: posts to /api/air-submit as a "kit" request (HighLevel + email delivery),
   then opens the online worksheet. The worksheet remembers access on this device. */
(function(){
 var f=document.querySelector('#resource-form'); if(!f) return;
 var st=document.querySelector('#resource-status'), b=f.querySelector('button[type=submit]');
 function open(msg){
  try{ localStorage.setItem('air-worksheet-unlocked','1'); }catch(e){}
  st.textContent=msg; setTimeout(function(){ location.href='ai-workflow-worksheet.html'; },900);
 }
 f.addEventListener('submit',function(e){
  e.preventDefault(); if(!f.reportValidity()) return;
  var name=f.querySelector('#resource-name').value.trim(), email=f.querySelector('#resource-email').value.trim();
  var talk=!!f.querySelector('[name=conversationConsent]').checked;
  b.disabled=true; st.hidden=false; st.textContent='Sending…';
  fetch('/api/air-submit',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({
   type:'kit', source:'working-kit', page:location.pathname, referrer:document.referrer,
   name:name, email:email, deliveryConsent:true, conversationConsent:talk, contactConsent:talk,
   website:(f.querySelector('.hp')||{}).value||''
  })}).then(function(r){
   if(r.status===400) return r.json().catch(function(){return {};}).then(function(j){ throw new Error(j.error||'Please check your name and email.'); });
   open('Thanks. The fillable PDF is on its way to your inbox. Opening your worksheet…'+(talk?' A Resultant will also be in touch.':''));
  }).catch(function(err){
   if(err instanceof TypeError){ open('Opening your worksheet…'); return; }
   st.textContent=err.message; b.disabled=false;
  });
 });
})();
