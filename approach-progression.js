(() => {
 const steps=document.querySelectorAll('.approach-progression .editorial-rows article');
 if(!('IntersectionObserver' in window))return;
 const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
  if(entry.isIntersecting){entry.target.classList.add('step-seen');observer.unobserve(entry.target);}
 }),{threshold:.35});
 steps.forEach(step=>observer.observe(step));
})();
