/* Heading reveals for inner pages: section headings rise into place as they scroll into view.
   Skipped for reduced-motion and for headings already on screen at load. */
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
  var st = document.createElement('style');
  st.textContent = '.rv-h .w{display:inline-block;overflow:hidden;vertical-align:bottom;padding-bottom:.08em;margin-bottom:-.08em}' +
    '.rv-h .w>span{display:inline-block;transform:translateY(105%);transition:transform .9s cubic-bezier(.2,.8,.15,1)}' +
    '.rv-h.in .w>span{transform:none}';
  document.head.appendChild(st);
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: .2, rootMargin: '0px 0px -8% 0px' });
  var wrap = function (h) {
    var i = 0, tw = document.createTreeWalker(h, NodeFilter.SHOW_TEXT), nodes = [];
    while (tw.nextNode()) nodes.push(tw.currentNode);
    nodes.forEach(function (n) {
      var f = document.createDocumentFragment();
      n.textContent.split(/(\s+)/).forEach(function (part) {
        if (!part) return;
        if (/^\s+$/.test(part)) { f.appendChild(document.createTextNode(' ')); return; }
        var o = document.createElement('span'), s = document.createElement('span');
        o.className = 'w'; s.textContent = part; s.style.transitionDelay = (i++ * 60) + 'ms';
        o.appendChild(s); f.appendChild(o);
      });
      n.parentNode.replaceChild(f, n);
    });
  };
  document.querySelectorAll('main h2, section h2').forEach(function (h) {
    if (h.querySelector(':not(br):not(em):not(i):not(strong)') || h.closest('dialog') || h.getBoundingClientRect().top < window.innerHeight * .9) return;
    if (!h.textContent.trim()) return;
    wrap(h); h.classList.add('rv-h'); io.observe(h);
  });
})();
