/* Architecture page: blueprint of AI, the six dimensions (columns) and the technology layers (footings). */
(function(){
 var bp=document.querySelector('.bp'); if(!bp) return;
 var DIMS={
  strategic:{name:'Strategic direction',line:'Direction decides which footings get poured first, and how big.',href:'strategic-direction.html',layers:['network','cloud','data','security','collaboration','cx','ai','managed-it']},
  data:{name:'Data readiness',line:'Stands on connected data, and a home for it that can grow.',href:'data-readiness.html',layers:['data','cloud']},
  tech:{name:'Technology infrastructure',line:'Stands on the network, the right home for each workload, and someone to run it.',href:'technology-infrastructure.html',layers:['network','cloud','managed-it']},
  gov:{name:'Governance & security',line:'Stands on security, controlled access to AI, and data you can account for.',href:'governance-security.html',layers:['security','ai','data']},
  exp:{name:'Experience layer',line:'Stands on the platforms where customers and staff actually talk, with AI inside them.',href:'experience-layer.html',layers:['cx','collaboration','ai']},
  work:{name:'Workforce & adoption',line:'Stands on tools that just work, the platforms people live in, and AI they’re allowed to use.',href:'workforce-adoption.html',layers:['managed-it','collaboration','ai']}
 };
 var NAMES={network:'Network & connectivity',cloud:'Data center & cloud',data:'Data & integration',security:'Cybersecurity',collaboration:'Communication & collaboration',cx:'Customer experience',ai:'Artificial intelligence','managed-it':'Managed IT'};
 var cols=[].slice.call(bp.querySelectorAll('.bp-col')), foots=[].slice.call(bp.querySelectorAll('.bp-f'));
 var svg=bp.querySelector('.bp-svg'), stage=bp.querySelector('.bp-stage'), cap=bp.querySelector('.bp-cap p'), link=bp.querySelector('.bp-cap a');
 var paths=[]; // {d,l,el}
 function draw(){
  var r=stage.getBoundingClientRect(); svg.setAttribute('viewBox','0 0 '+r.width+' '+r.height); svg.innerHTML=''; paths=[];
  cols.forEach(function(c){
   var d=c.dataset.dim, cr=c.getBoundingClientRect(), x1=cr.left+cr.width/2-r.left, y1=cr.bottom-r.top+10;
   DIMS[d].layers.forEach(function(l,i){
    var f=bp.querySelector('.bp-f[data-layer="'+l+'"]'), fr=f.getBoundingClientRect();
    var x2=fr.left+fr.width/2-r.left+(i-1)*6, y2=fr.top-r.top, my=(y1+y2)/2;
    var p=document.createElementNS('http://www.w3.org/2000/svg','path');
    p.setAttribute('d','M'+x1+' '+y1+' C'+x1+' '+my+' '+x2+' '+my+' '+x2+' '+y2);
    svg.appendChild(p); var len=p.getTotalLength(); p.style.setProperty('--len',len);
    paths.push({d:d,l:l,el:p});
   });
  });
  apply();
 }
 var sel=null; // {type:'dim'|'layer', key}
 function apply(){
  bp.classList.toggle('has-sel',!!sel);
  cols.forEach(function(c){ var on=sel&&((sel.type==='dim'&&sel.key===c.dataset.dim)||(sel.type==='layer'&&DIMS[c.dataset.dim].layers.indexOf(sel.key)>-1&&c.dataset.dim!=='strategic')); c.classList.toggle('on',!!on); c.setAttribute('aria-pressed',on?'true':'false'); });
  foots.forEach(function(f){ var on=sel&&((sel.type==='dim'&&DIMS[sel.key].layers.indexOf(f.dataset.layer)>-1)||(sel.type==='layer'&&sel.key===f.dataset.layer)); f.classList.toggle('on',!!on); });
  paths.forEach(function(p){
   var on=sel&&((sel.type==='dim'&&sel.key===p.d)||(sel.type==='layer'&&sel.key===p.l&&p.d!=='strategic'));
   p.el.classList.remove('on'); p.el.classList.toggle('dim',!!sel&&!on);
   if(on){ void p.el.getBoundingClientRect(); p.el.classList.add('on'); }
  });
  if(!sel){ cap.innerHTML='Select a column to see what holds it up, or a footing to see what it carries.'; link.hidden=true; return; }
  if(sel.type==='dim'){ var D=DIMS[sel.key]; cap.innerHTML='<strong>'+D.name+'.</strong> '+D.line; link.hidden=false; link.href=D.href; link.textContent='Explore '+D.name+' ↗'; }
  else { var held=Object.keys(DIMS).filter(function(k){return k!=='strategic'&&DIMS[k].layers.indexOf(sel.key)>-1}).map(function(k){return DIMS[k].name});
   cap.innerHTML='<strong>'+NAMES[sel.key]+'</strong> holds up '+held.join(', ').replace(/, ([^,]*)$/,' and $1')+'.'; link.hidden=false; link.href='#'+sel.key; link.textContent='What to look for ↓'; }
 }
 var auto=null, order=['data','tech','gov','exp','work','strategic'], ai=0;
 function stopAuto(){ if(auto){ clearInterval(auto); auto=null; } }
 cols.forEach(function(c){ c.addEventListener('click',function(){ stopAuto(); sel=(sel&&sel.type==='dim'&&sel.key===c.dataset.dim)?null:{type:'dim',key:c.dataset.dim}; apply(); }); });
 foots.forEach(function(f){ f.addEventListener('click',function(){ stopAuto(); sel=(sel&&sel.type==='layer'&&sel.key===f.dataset.layer)?null:{type:'layer',key:f.dataset.layer}; apply(); }); });
 link.addEventListener('click',function(e){ var h=link.getAttribute('href'); if(h&&h.charAt(0)==='#'){ var d=document.querySelector(h); if(d&&d.tagName==='DETAILS'){ d.open=true; } } });
 var ro; window.addEventListener('resize',function(){ clearTimeout(ro); ro=setTimeout(draw,120); });
 if(document.fonts&&document.fonts.ready) document.fonts.ready.then(draw);
 draw();
 var want=new URLSearchParams(location.search).get('d');
 if(want&&DIMS[want]){ sel={type:'dim',key:want}; apply(); return; }
 var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
 if(reduce||!('IntersectionObserver' in window)) return;
 var io=new IntersectionObserver(function(es){ es.forEach(function(e){
  if(e.isIntersecting&&!auto&&sel===null&&ai>=0){ auto=setInterval(function(){ sel={type:'dim',key:order[ai%order.length]}; ai++; apply(); },3200); }
  if(!e.isIntersecting) stopAuto();
 }); },{threshold:.5});
 io.observe(bp);
})();
