// Nerd features: terminal mode, Ctrl+K command palette, hidden terminal, Konami code.
(function () {
  'use strict';
  const root = document.documentElement;
  const $ = (s, r) => (r || document).querySelector(s);
  const instant = () => root.classList.contains('a11y-motion') || window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const SECTIONS = [
    ['work', 'Selected work'], ['support', 'Support & standards'], ['experience', 'Experience'],
    ['ai', 'AI-assisted delivery'], ['experiments', 'Builds & experiments'], ['skills', 'Skills'],
    ['writing', 'Writing'], ['contact', 'Contact']
  ];

  function goTo(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: instant() ? 'auto' : 'smooth', block: 'start' });
    if (history.replaceState) history.replaceState(null, '', '#' + id);
  }

  // ---------- Terminal mode (theme) ----------
  const termBtn = document.getElementById('termBtn');
  const themeBtn = document.getElementById('themeBtn');
  const isTerminal = () => root.classList.contains('theme-terminal');
  function setTerminal(on) {
    root.classList.toggle('theme-terminal', on);
    if (termBtn) termBtn.setAttribute('aria-pressed', String(on));
    try { localStorage.setItem('terminal', on ? '1' : '0'); } catch (e) {}
  }
  if (termBtn) {
    termBtn.setAttribute('aria-pressed', String(isTerminal()));
    termBtn.addEventListener('click', () => setTerminal(!isTerminal()));
  }
  // In terminal mode the day/night button just leaves terminal mode
  if (themeBtn) {
    themeBtn.addEventListener('click', (e) => {
      if (isTerminal()) { setTerminal(false); e.stopImmediatePropagation(); }
    }, true);
  }

  // ---------- Helpers reading the page ----------
  const linkHref = (frag) => { const a = document.querySelector('a[href*="' + frag + '"]'); return a ? a.href : ''; };
  const clickLink = (frag) => { const a = document.querySelector('a[href*="' + frag + '"]'); if (a) a.click(); };
  const mailHref = () => { const a = document.querySelector('a[href^="mailto:"]'); return a ? a.getAttribute('href').replace('mailto:', '') : ''; };
  const stackNames = () => [...document.querySelectorAll('.stack li')].map((li) => li.textContent.trim());
  const skillGroups = () => [...document.querySelectorAll('.skill-groups > div')].map((g) => {
    const h = g.querySelector('h3');
    return (h ? h.textContent.trim() : '') + ': ' + [...g.querySelectorAll('li')].map((li) => li.textContent.trim()).join(', ');
  });

  // ---------- Terminal drawer ----------
  const term = document.createElement('section');
  term.className = 'term';
  term.hidden = true;
  term.setAttribute('role', 'dialog');
  term.setAttribute('aria-label', 'Terminal');
  term.innerHTML =
    '<div class="term-bar"><span>visitor@aswin: ~/portfolio</span>' +
    '<button type="button" class="term-close" aria-label="Close terminal">&times;</button></div>' +
    '<div class="term-out" role="log" aria-live="polite"></div>' +
    '<form class="term-form" autocomplete="off"><label for="termInput"><span>visitor@aswin:~$</span></label>' +
    '<input id="termInput" type="text" spellcheck="false" autocapitalize="off" autocomplete="off" aria-label="Terminal command"></form>';
  document.body.appendChild(term);
  const out = $('.term-out', term);
  const input = $('#termInput', term);
  const history_ = [];
  let hIdx = 0;
  let termOpener = null;

  function print(text, cls) {
    const line = document.createElement('div');
    if (cls) line.className = cls;
    line.textContent = text;
    out.appendChild(line);
    out.scrollTop = out.scrollHeight;
  }
  const printLines = (arr) => arr.forEach((l) => print(l));

  const COMMANDS = {
    help: () => printLines([
      'Available commands:',
      '  whoami            who is this?',
      '  about             short summary',
      '  projects          flagship builds',
      '  skills            skills by group',
      '  stack             tools I work with',
      '  ls                list sections',
      '  cd <section>      jump to a section (e.g. cd work)',
      '  contact           where to find me',
      '  theme <x>         dark | light | terminal | toggle',
      '  clear             clear the screen',
      '  exit              close the terminal'
    ]),
    whoami: () => print('Aswin M S - Senior Technical Consultant (Microsoft Power Platform), Bengaluru.'),
    about: () => printLines([
      'I take Power Platform from scoping to live.',
      'I sit with the client, scope the work, build it, take it live and support it afterwards.',
      'Canvas apps, Power Automate, Dataverse and SharePoint, with Graph API and custom connectors.'
    ]),
    projects: () => printLines([
      '1. Quality & document platform  (global engineering services co.)  ~70,000 users, <7s loads',
      '2. Identity automation          (global IT services co.)           ~2,000 requests/day, 7+ days -> <3',
      '3. International travel approvals (automaker)                      ~1 week -> <24h',
      '4. Dealer portal & tenant admin (automaker dealer network)         1,500+ dealers',
      "Type 'cd work' to see them on the page."
    ]),
    skills: () => printLines(skillGroups()),
    stack: () => print(stackNames().join(' | ')),
    ls: () => print(SECTIONS.map((s) => s[0] + '/').join('  ')),
    contact: () => {
      const m = mailHref();
      printLines([
        m ? 'email:    ' + m : '',
        'linkedin: ' + linkHref('linkedin.com/in/'),
        'github:   ' + linkHref('github.com/')
      ].filter(Boolean));
    },
    pwd: () => print('/home/visitor/portfolio'),
    date: () => print(new Date().toString()),
    uname: () => print('PortfolioOS 1.0 (static, hosted on GitHub Pages)'),
    echo: (args) => print(args.join(' ')),
    clear: () => { out.textContent = ''; },
    exit: () => closeTerm(),
    sudo: () => print('visitor is not in the sudoers file. This incident will be reported.'),
    rm: () => print("Nice try. Nothing was harmed."),
    cd: (args) => {
      const id = (args[0] || '').replace(/\/$/, '').replace(/^#/, '');
      if (SECTIONS.some((s) => s[0] === id)) { goTo(id); print('-> ' + id + '/'); }
      else print('cd: no such section: ' + (args[0] || '') + " (try 'ls')");
    },
    theme: (args) => {
      const a = (args[0] || '').toLowerCase();
      if (a === 'terminal') { setTerminal(true); print('theme: terminal'); }
      else if (a === 'dark' || a === 'light') {
        setTerminal(false);
        root.setAttribute('data-theme', a);
        try { localStorage.setItem('theme', a); } catch (e) {}
        print('theme: ' + a);
      } else if (a === 'toggle') { setTerminal(!isTerminal()); print('theme: ' + (isTerminal() ? 'terminal' : 'normal')); }
      else print('usage: theme dark | light | terminal | toggle');
    }
  };
  COMMANDS.open = COMMANDS.cd;
  COMMANDS.cat = (args) => {
    const t = (args[0] || '').replace(/\/$/, '');
    if (t === 'work') COMMANDS.projects();
    else if (t === 'skills') COMMANDS.skills();
    else if (t === 'stack') COMMANDS.stack();
    else if (t === 'contact') COMMANDS.contact();
    else if (t === 'about') COMMANDS.about();
    else print('cat: ' + (t || '(missing file)') + ': no such file');
  };

  function run(line) {
    const trimmed = line.trim();
    print('visitor@aswin:~$ ' + line, 'cmd');
    if (!trimmed) return;
    history_.push(trimmed);
    hIdx = history_.length;
    const parts = trimmed.split(/\s+/);
    const fn = COMMANDS[parts[0].toLowerCase()];
    if (fn) fn(parts.slice(1));
    else print('command not found: ' + parts[0] + " (try 'help')");
  }

  function openTerm() {
    if (!term.hidden) { input.focus(); return; }
    termOpener = document.activeElement;
    term.hidden = false;
    if (!out.childNodes.length) {
      printLines(['Welcome. This is a tiny fake terminal.', "Type 'help' to see what it can do.", '']);
    }
    input.focus();
  }
  function closeTerm() {
    term.hidden = true;
    if (termOpener && termOpener.focus) termOpener.focus();
  }
  $('.term-close', term).addEventListener('click', closeTerm);
  term.addEventListener('click', () => { if (window.getSelection().toString() === '') input.focus(); });
  $('.term-form', term).addEventListener('submit', (e) => {
    e.preventDefault();
    run(input.value);
    input.value = '';
  });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp') { e.preventDefault(); if (hIdx > 0) { hIdx--; input.value = history_[hIdx]; } }
    else if (e.key === 'ArrowDown') { e.preventDefault(); if (hIdx < history_.length) { hIdx++; input.value = history_[hIdx] || ''; } }
  });

  // ---------- Command palette (Ctrl/Cmd + K) ----------
  const overlay = document.createElement('div');
  overlay.className = 'palette-overlay';
  overlay.hidden = true;
  overlay.innerHTML =
    '<div class="palette" role="dialog" aria-modal="true" aria-label="Command palette">' +
    '<input type="text" id="palInput" role="combobox" aria-expanded="true" aria-controls="palList" aria-autocomplete="list" ' +
    'placeholder="Type a command or section..." autocomplete="off" spellcheck="false" aria-label="Search commands">' +
    '<ul id="palList" role="listbox" aria-label="Commands"></ul>' +
    '<div class="palette-foot">Enter to run &middot; Esc to close &middot; Up/Down to move</div></div>';
  document.body.appendChild(overlay);
  const palInput = $('#palInput', overlay);
  const palList = $('#palList', overlay);

  const ACTIONS = SECTIONS.map((s) => ({ label: 'Go to ' + s[1], hint: '#' + s[0], run: () => goTo(s[0]) })).concat([
    { label: 'Toggle day / night', hint: 'theme', run: () => { if (themeBtn) themeBtn.click(); } },
    { label: 'Toggle terminal mode', hint: 'theme', run: () => setTerminal(!isTerminal()) },
    { label: 'Open accessibility options', hint: 'a11y', run: () => { const b = $('#a11yBtnTop'); if (b) b.click(); } },
    { label: 'Open the terminal', hint: '`', run: () => openTerm() },
    { label: 'Open LinkedIn', hint: 'link', run: () => clickLink('linkedin.com/in/') },
    { label: 'Open GitHub', hint: 'link', run: () => clickLink('github.com/') },
    { label: 'Back to top', hint: 'top', run: () => goTo('top') }
  ]);
  let shown = [];
  let sel = 0;
  let palOpener = null;

  function renderPalette() {
    const q = palInput.value.trim().toLowerCase();
    shown = ACTIONS.filter((a) => q.split(/\s+/).every((w) => (a.label + ' ' + a.hint).toLowerCase().indexOf(w) !== -1));
    sel = Math.min(sel, Math.max(shown.length - 1, 0));
    palList.textContent = '';
    if (!shown.length) {
      const li = document.createElement('li');
      li.className = 'empty';
      li.textContent = 'No matching commands';
      palList.appendChild(li);
      palInput.removeAttribute('aria-activedescendant');
      return;
    }
    shown.forEach((a, i) => {
      const li = document.createElement('li');
      li.id = 'pal-' + i;
      li.setAttribute('role', 'option');
      li.setAttribute('aria-selected', String(i === sel));
      const t = document.createElement('span'); t.textContent = a.label;
      const h = document.createElement('small'); h.textContent = a.hint;
      li.append(t, h);
      li.addEventListener('mousemove', () => { if (sel !== i) { sel = i; highlight(); } });
      li.addEventListener('click', () => choose(i));
      palList.appendChild(li);
    });
    palInput.setAttribute('aria-activedescendant', 'pal-' + sel);
  }
  function highlight() {
    [...palList.children].forEach((li, i) => li.setAttribute('aria-selected', String(i === sel)));
    palInput.setAttribute('aria-activedescendant', 'pal-' + sel);
    const li = palList.children[sel];
    if (li && li.scrollIntoView) li.scrollIntoView({ block: 'nearest' });
  }
  function openPalette() {
    palOpener = document.activeElement;
    overlay.hidden = false;
    palInput.value = '';
    sel = 0;
    renderPalette();
    palInput.focus();
  }
  function closePalette() {
    overlay.hidden = true;
    if (palOpener && palOpener.focus) palOpener.focus();
  }
  function choose(i) {
    const a = shown[i];
    if (!a) return;
    overlay.hidden = true;
    palOpener = null;
    a.run();
  }
  palInput.addEventListener('input', () => { sel = 0; renderPalette(); });
  palInput.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); if (shown.length) { sel = (sel + 1) % shown.length; highlight(); } }
    else if (e.key === 'ArrowUp') { e.preventDefault(); if (shown.length) { sel = (sel - 1 + shown.length) % shown.length; highlight(); } }
    else if (e.key === 'Enter') { e.preventDefault(); choose(sel); }
    else if (e.key === 'Tab') { e.preventDefault(); }
  });
  overlay.addEventListener('mousedown', (e) => { if (e.target === overlay) closePalette(); });

  // ---------- Global keys + Konami ----------
  const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  let kPos = 0;
  const typing = (el) => el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.isContentEditable);

  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (overlay.hidden) openPalette(); else closePalette();
      return;
    }
    if (e.key === 'Escape') {
      if (!overlay.hidden) { closePalette(); return; }
      if (!term.hidden) { closeTerm(); return; }
    }
    if (typing(e.target)) { kPos = 0; return; }
    if ((e.key === '`' || e.key === '~') && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      if (term.hidden) openTerm(); else closeTerm();
      return;
    }
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (k === KONAMI[kPos]) {
      kPos++;
      if (kPos === KONAMI.length) { kPos = 0; setTerminal(!isTerminal()); }
    } else {
      kPos = k === KONAMI[0] ? 1 : 0;
    }
  });

  // ---------- Console greeting ----------
  try {
    console.log('%c Hello, fellow nerd. ', 'background:#060b07;color:#4dff94;font:600 14px monospace;padding:6px 8px;border:1px solid #4dff94');
    console.log('Press Ctrl+K for the command palette, or the backtick key for a terminal.');
  } catch (e) {}
})();
