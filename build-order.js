/* Data readiness: build-order illustration. Plays once when scrolled into view; buttons step through it. */
(function(){
 var root=document.getElementById('build'); if(!root) return; var st=root.querySelector('[data-build]');
 var cap=st.querySelector('.build-cap'), btns=[].slice.call(root.querySelectorAll('[data-go]')), skip=root.querySelector('.build-skip');
 var CAP={1:'Where your data is created. Each system answers only its own questions.',
  2:'Connected, cleaned and defined once. The step most companies skip.',
  3:'AI that works across all of it, and gets smarter with use.',
  skip:'Skip the floor and AI gives confident, wrong answers.'};
 var timers=[];
 function set(n){
  st.dataset.step=n; st.classList.toggle('is-skip',n==='skip');
  btns.forEach(function(b){ b.setAttribute('aria-pressed', n!=='skip' && +b.dataset.go<=+n ? 'true':'false'); });
  skip.setAttribute('aria-pressed', n==='skip'?'true':'false');
  cap.textContent=CAP[n];
 }
 function stop(){ timers.forEach(clearTimeout); timers=[]; }
 btns.forEach(function(b){ b.addEventListener('click',function(){ stop(); set(b.dataset.go); }); });
 skip.addEventListener('click',function(){ stop(); set(st.dataset.step==='skip'?'3':'skip'); });
 var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
 function play(){ if(reduce){ set('3'); return; } set('1'); timers.push(setTimeout(function(){set('2')},1300)); timers.push(setTimeout(function(){set('3')},2600)); }
 if('IntersectionObserver' in window){
  var io=new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ io.disconnect(); play(); } }); },{threshold:.45});
  io.observe(st);
 } else set('3');
})();
