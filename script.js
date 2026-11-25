// Footer year
document.getElementById('year').textContent = new Date().getFullYear();

// Mobile menu
const menuBtn = document.getElementById('menuBtn');
const navLinks = document.getElementById('navLinks');
menuBtn.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  menuBtn.setAttribute('aria-expanded', open);
});
navLinks.addEventListener('click', (e) => {
  if (e.target.tagName === 'A') {
    navLinks.classList.remove('open');
    menuBtn.setAttribute('aria-expanded', false);
  }
});

// Scroll reveal
const items = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  items.forEach((el) => io.observe(el));
} else {
  items.forEach((el) => el.classList.add('visible'));
}

// Day / night toggle (persists the choice; defaults to the system setting)
const root = document.documentElement;
document.getElementById('themeBtn').addEventListener('click', () => {
  const current = root.getAttribute('data-theme') ||
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  const next = current === 'dark' ? 'light' : 'dark';
  root.setAttribute('data-theme', next);
  try { localStorage.setItem('theme', next); } catch (e) {}
});

// Scroll progress bar
const bar = document.getElementById('progress');
const onScroll = () => {
  const h = document.documentElement;
  const max = h.scrollHeight - h.clientHeight;
  bar.style.transform = 'scaleX(' + (max > 0 ? h.scrollTop / max : 0) + ')';
};
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Active nav link
const links = [...document.querySelectorAll('.nav-links a')];
const byId = new Map(links.map((a) => [a.getAttribute('href').slice(1), a]));
if ('IntersectionObserver' in window) {
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      links.forEach((a) => a.classList.remove('active'));
      if (byId.has(e.target.id)) byId.get(e.target.id).classList.add('active');
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  document.querySelectorAll('main section[id]').forEach((el) => spy.observe(el));
}

// Count-up stats
const counters = document.querySelectorAll('[data-count]');
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const fmt = (el, v) => { el.textContent = Math.round(v).toLocaleString('en-US') + (el.dataset.suffix || ''); };
if ('IntersectionObserver' in window && !reduce) {
  const co = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target, end = +el.dataset.count, t0 = performance.now(), dur = 1400;
      const tick = (t) => {
        const p = Math.min((t - t0) / dur, 1);
        fmt(el, end * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      co.unobserve(el);
    });
  }, { threshold: 0.6 });
  counters.forEach((el) => co.observe(el));
} else {
  counters.forEach((el) => fmt(el, +el.dataset.count));
}

// Cursor spotlight on cards
document.querySelectorAll('.card, .step, .stack li').forEach((el) => {
  el.addEventListener('pointermove', (e) => {
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    el.style.setProperty('--my', (e.clientY - r.top) + 'px');
  });
});

// Subtle 3D tilt on cards (pointer devices, no reduced-motion)
if (window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.querySelectorAll('.card.case, .card.mini, .card.plain').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      const max = el.classList.contains('full') ? 1.5 : 4;
      el.style.setProperty('--ry', (px * max * 2).toFixed(2) + 'deg');
      el.style.setProperty('--rx', (-py * max * 2).toFixed(2) + 'deg');
    });
    el.addEventListener('pointerleave', () => {
      el.style.setProperty('--rx', '0deg');
      el.style.setProperty('--ry', '0deg');
    });
  });

  // Magnetic primary buttons
  document.querySelectorAll('.btn.primary').forEach((b) => {
    b.addEventListener('pointermove', (e) => {
      const r = b.getBoundingClientRect();
      const x = (e.clientX - (r.left + r.width / 2)) * 0.25;
      const y = (e.clientY - (r.top + r.height / 2)) * 0.35;
      b.style.transform = 'translate(' + x + 'px,' + y + 'px) scale(1.04)';
    });
    b.addEventListener('pointerleave', () => { b.style.transform = ''; });
  });
}

// External links: same tab by default; visitors can opt in to a new tab (remembered)
(function () {
  const toggle = document.getElementById('newTabToggle');
  if (!toggle) return;
  const ext = [...document.querySelectorAll('a[href^="http"]')].filter((a) => a.hostname !== location.hostname);
  ext.forEach((a) => {
    a.classList.add('ext');
    a.rel = 'noopener noreferrer';
    const hint = document.createElement('span');
    hint.className = 'sr-new';
    hint.textContent = ' (opens in a new tab)';
    a.appendChild(hint);
  });
  const apply = (on) => ext.forEach((a) => (on ? a.setAttribute('target', '_blank') : a.removeAttribute('target')));
  let saved = false;
  try { saved = localStorage.getItem('newTab') === '1'; } catch (e) {}
  toggle.checked = saved;
  apply(saved);
  toggle.addEventListener('change', () => {
    apply(toggle.checked);
    try { localStorage.setItem('newTab', toggle.checked ? '1' : '0'); } catch (e) {}
  });
})();

// Accessibility options (saved in localStorage as "a11y")
(function () {
  const root = document.documentElement;
  const btn = document.getElementById('a11yBtn');
  const panel = document.getElementById('a11yPanel');
  if (!btn || !panel) return;
  const KEYS = ['contrast', 'motion', 'font', 'links', 'spacing'];
  let st = { ts: 0 };
  try { st = Object.assign({ ts: 0 }, JSON.parse(localStorage.getItem('a11y') || '{}')); } catch (e) {}
  if (!('motion' in st) && window.matchMedia('(prefers-reduced-motion: reduce)').matches) st.motion = true;
  const save = () => { try { localStorage.setItem('a11y', JSON.stringify(st)); } catch (e) {} };
  const render = () => {
    root.setAttribute('data-ts', st.ts || 0);
    KEYS.forEach((k) => root.classList.toggle('a11y-' + k, !!st[k]));
    panel.querySelectorAll('input[data-opt]').forEach((i) => { i.checked = !!st[i.dataset.opt]; });
    panel.querySelectorAll('.a11y-seg button').forEach((b) => b.setAttribute('aria-pressed', String(+b.dataset.ts === +(st.ts || 0))));
  };
  const open = (on) => {
    panel.hidden = !on;
    btn.setAttribute('aria-expanded', String(on));
    if (on) { const f = panel.querySelector('button, input'); if (f) f.focus(); }
  };
  btn.addEventListener('click', () => open(panel.hidden));
  document.getElementById('a11yClose').addEventListener('click', () => { open(false); btn.focus(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !panel.hidden) { open(false); btn.focus(); } });
  panel.querySelectorAll('input[data-opt]').forEach((i) => i.addEventListener('change', () => { st[i.dataset.opt] = i.checked; save(); render(); }));
  panel.querySelectorAll('.a11y-seg button').forEach((b) => b.addEventListener('click', () => { st.ts = +b.dataset.ts; save(); render(); }));
  document.getElementById('a11yReset').addEventListener('click', () => { st = { ts: 0 }; save(); render(); });
  render();
})();
