/* Talk to a Resultant: intake form used on every page.
   Any element with [data-contact] (or a link to #talk) opens it.
   Posts to /api/air-submit as a "contact" request, which goes to HighLevel. */
(function () {
  var css = '' +
    '#intake{border:0;padding:0;max-width:560px;width:calc(100% - 32px);background:#F8F7F3;color:#121417;border-radius:6px;box-shadow:0 24px 60px #0004}' +
    '#intake::backdrop{background:#12141799}' +
    '#intake .in{padding:32px;display:flex;flex-direction:column;gap:14px;font-family:"DM Sans",system-ui,sans-serif}' +
    '#intake .top{display:flex;justify-content:space-between;align-items:center}' +
    '#intake .eb{font-size:14px;font-weight:600;color:#23443A;margin:0}' +
    '#intake .x{font:inherit;font-size:24px;line-height:1;background:none;border:0;cursor:pointer;color:#575B56}' +
    '#intake h2{font-family:"Instrument Serif",Georgia,serif;font-weight:400;font-size:36px;line-height:1.08;margin:0;color:#121417}' +
    '#intake p{margin:0;color:#575B56;font-size:15px;line-height:1.5}' +
    '#intake form{display:flex;flex-direction:column;gap:10px}' +
    '#intake label{font-size:14px;color:#121417;font-weight:500}' +
    '#intake label span{color:#575B56;font-weight:400}' +
    '#intake input:not([type=checkbox]),#intake select,#intake textarea{font:inherit;font-size:15px;padding:11px 12px;border:1px solid #B4B7AE;border-radius:3px;background:#fff;color:#121417;width:100%;box-sizing:border-box}' +
    '#intake textarea{min-height:84px;resize:vertical}' +
    '#intake .row2{display:grid;grid-template-columns:1fr 1fr;gap:10px}' +
    '#intake .row2>div{display:flex;flex-direction:column;gap:6px;min-width:0}' +
    '#intake label{display:block;margin:0}' +
    '#intake .ok{display:flex !important;gap:10px;align-items:flex-start;font-weight:400;color:#575B56;grid-template-columns:none}' +
    '#intake .ok input{width:auto !important;flex:none;margin-top:3px}' +
    '#intake .ok input{margin-top:3px}' +
    '#intake .send{font:inherit;font-weight:600;background:#23443A;color:#F8F7F3;border:0;border-radius:3px;padding:14px 20px;cursor:pointer;align-self:flex-start}' +
    '#intake .send[disabled]{opacity:.5;cursor:default}' +
    '#intake .st{font-size:14px;color:#121417;min-height:1em}' +
    '#intake .hp{position:absolute;left:-9999px;width:1px;height:1px;opacity:0}' +
    '#intake :is(input,select,textarea,button):focus-visible{outline:2px solid #2E5A4C;outline-offset:2px}' +
    '@media(max-width:520px){#intake .in{padding:24px}#intake .row2{grid-template-columns:1fr}#intake h2{font-size:30px}}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  var d = document.createElement('dialog'); d.id = 'intake'; d.setAttribute('aria-labelledby', 'intake-title');
  document.body.appendChild(d);

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function form() {
    d.innerHTML = '<div class="in">' +
      '<div class="top"><p class="eb">Talk to a Resultant</p><button class="x" type="button" aria-label="Close">×</button></div>' +
      '<h2 id="intake-title">Tell us what you’re working on.</h2>' +
      '<p>A business goal, a stalled project or a decision coming up. A Resultant will reply to set up a conversation.</p>' +
      '<form novalidate>' +
      '<div class="row2"><div><label for="in-name">Name</label><input id="in-name" autocomplete="name" maxlength="100" required></div>' +
      '<div><label for="in-email">Work email</label><input id="in-email" type="email" autocomplete="email" maxlength="254" required></div></div>' +
      '<div class="row2"><div><label for="in-company">Company</label><input id="in-company" autocomplete="organization" maxlength="160"></div>' +
      '<div><label for="in-size">Company size</label><select id="in-size"><option value="">Choose one</option><option>Under 250 people</option><option>250–999 people</option><option>1,000–2,500 people</option><option>More than 2,500 people</option></select></div></div>' +
      '<label for="in-context">What are you working on? <span>(optional)</span></label><textarea id="in-context" maxlength="1400"></textarea>' +
      '<label class="ok"><input type="checkbox" id="in-consent" required><span>Contact me about this request. I’ve read the <a href="privacy.html">privacy notice</a>.</span></label>' +
      '<input class="hp" type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">' +
      '<button class="send" type="submit">Send <span aria-hidden="true">↗</span></button>' +
      '<p class="st" role="status"></p></form></div>';
    d.querySelector('.x').onclick = function () { d.close(); };
    var f = d.querySelector('form'), s = d.querySelector('.st'), b = d.querySelector('.send');
    f.onsubmit = function (e) {
      e.preventDefault();
      var name = f.querySelector('#in-name').value.trim(), email = f.querySelector('#in-email').value.trim();
      if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { s.textContent = 'Please add your name and a valid work email.'; return; }
      if (!f.querySelector('#in-consent').checked) { s.textContent = 'Please tick the box so we can contact you.'; return; }
      var size = f.querySelector('#in-size').value, ctx = f.querySelector('#in-context').value.trim();
      b.disabled = true; s.textContent = 'Sending…';
      fetch('/api/air-submit', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'contact', source: 'talk-to-a-resultant', page: location.pathname, referrer: document.referrer,
          name: name, email: email, company: f.querySelector('#in-company').value.trim(), contactConsent: true,
          website: f.querySelector('.hp').value,
          context: [size ? 'Company size: ' + size : '', ctx].filter(Boolean).join('\n\n')
        })
      }).then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { if (!r.ok) throw new Error(j.error || 'Something went wrong. Please try again.'); return j; }); })
        .then(function (j) {
          d.querySelector('.in').innerHTML = '<div class="top"><p class="eb">Talk to a Resultant</p><button class="x" type="button" aria-label="Close">×</button></div>' +
            '<h2 id="intake-title" tabindex="-1">Thanks, ' + esc(name.split(/\s+/)[0]) + '.</h2>' +
            (j.bookingUrl ? '<p>If you’d like, <a href="' + esc(j.bookingUrl) + '">pick a time</a> now. Otherwise a Resultant will be in touch.</p>' : '<p>A Resultant will be in touch to set up a conversation.</p>');
          d.querySelector('.x').onclick = function () { d.close(); };
          d.querySelector('h2').focus();
        })
        .catch(function (err) { b.disabled = false; s.textContent = err.message; });
    };
  }

  // Every "Talk to a Resultant" link now goes to the dedicated intake page.
  function open(e) { if (e) e.preventDefault(); location.href = '/talk'; }
  d.addEventListener('click', function (e) { if (e.target === d) d.close(); });

  function bind() {
    document.querySelectorAll('[data-contact],a[href="#talk"]').forEach(function (el) { el.onclick = open; });
  }
  bind();
  window.addEventListener('load', bind); // after app.js has attached its preview handlers
  window.airOpenIntake = open;
})();
