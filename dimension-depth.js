(() => {
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const animate=(element,frames,options)=>{if(element&&!reduced.matches)element.animate(frames,options);};
 document.querySelectorAll('[data-working-map]').forEach(map=>{
  const buttons=[...map.querySelectorAll('[data-map-step]')];
  buttons.forEach(button=>button.addEventListener('click',()=>{
   buttons.forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
   map.querySelectorAll('[data-map-panel]').forEach(panel=>{
    panel.hidden=panel.dataset.mapPanel!==button.dataset.mapStep;
    if(!panel.hidden)animate(panel,[{opacity:.4,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}],{duration:300,easing:'ease-out'});
   });
  }));
 });
 document.querySelectorAll('.decision-disclosures details').forEach(item=>item.addEventListener('toggle',()=>{
  if(item.open)animate(item.querySelector('.decision-body'),[{opacity:.4,transform:'translateY(-6px)'},{opacity:1,transform:'translateY(0)'}],{duration:260,easing:'ease-out'});
 }));
 if('IntersectionObserver' in window){
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
   if(!entry.isIntersecting)return;
   const parts=entry.target.matches('[data-working-map]')?entry.target.querySelectorAll('.map-track button'):entry.target.children;
   [...parts].forEach((part,i)=>animate(part,[{opacity:.45,transform:'translateY(14px)'},{opacity:1,transform:'translateY(0)'}],{duration:550,delay:i*110,easing:'ease-out',fill:'backwards'}));
   if(entry.target.matches('.network-fabric,.continuity-schematic')){
    entry.target.querySelectorAll('.fabric-endpoints span,.continuity-channels span').forEach((node,i)=>{
     const accent=getComputedStyle(node).getPropertyValue('--dimension-light').trim()||'#9bb9d3';
     animate(node,[{boxShadow:'0 0 0 transparent'},{boxShadow:'0 0 22px '+accent+'55',borderColor:accent,offset:.45},{boxShadow:'0 0 0 transparent'}],{duration:950,delay:250+i*140,easing:'ease-in-out'});
    });
   }
   observer.unobserve(entry.target);
  }),{threshold:.25});
  document.querySelectorAll('[data-working-map],.network-fabric,.continuity-schematic,.conversation-thread').forEach(el=>observer.observe(el));
 }
 reduced.addEventListener('change',()=>{if(reduced.matches)document.getAnimations().forEach(animation=>animation.finish());});
})();
