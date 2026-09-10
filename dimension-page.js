const wheelContent=document.querySelector('#wheel-content');
if(wheelContent){
 const entries=JSON.parse(wheelContent.textContent),buttons=document.querySelectorAll('[data-wheel]'),detail=document.querySelector('#wheel-detail');
 buttons.forEach(button=>button.addEventListener('click',()=>{
  const entry=entries[Number(button.dataset.wheel)];
  buttons.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
  detail.querySelector('.eyebrow').textContent=entry[0];
  detail.querySelector('h3').textContent=entry[1];
  detail.querySelector('p:last-child').textContent=entry[2];
 }));
}
