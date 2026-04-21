// Bodhi 360 Command Center · interactions

const save = () => {};

let state = {
  mode: 'harmonic',
  variant: 'cockpit',
  page: 'today',
  tab: 'today',
  line: { messages: [] },
  today: [
    { id: 't1', label: 'Build brain dump buckets into the dashboard', done: true,  focus: false, meta: '360',     notes: '' },
    { id: 't2', label: 'Test the red phone in a Cowork session',       done: false, focus: false, meta: '360',     notes: '' },
    { id: 't3', label: 'Hardcover proof review: glitch-effect version',done: false, focus: true,  meta: 'BOOK',    notes: 'Proof rejected 2026-04-19.' },
    { id: 't4', label: 'Rocky Mountaineer logistics with Lee',          done: false, focus: false, meta: 'FAMILY',  notes: 'Early May trip with Dad' },
    { id: 't5', label: 'Harmonic priorities for the week',              done: false, focus: false, meta: 'HARMONIC',notes: '' },
    { id: 't6', label: 'Skills reorg Phase 1: inventory',               done: true,  focus: false, meta: '360',     notes: '' },
    { id: 't7', label: 'Skills reorg Phase 2: fix CoS skill errors',    done: true,  focus: false, meta: '360',     notes: '' },
    { id: 't8', label: 'Skills reorg Phase 3: canonical structure proposal', done: false, focus: false, meta: '360', notes: '' },
  ],
  week: [
    { id: 'w1', label: 'Skills reorg Phase 4: migration + archive',         done: false, focus: false, meta: '360',     notes: '' },
    { id: 'w2', label: 'Archive rogue Hard Hat Healthcare folder at workspace root', done: false, focus: false, meta: '360', notes: '' },
    { id: 'w3', label: 'Harmonic weekly stakeholder note',                   done: false, focus: false, meta: 'HARMONIC', notes: '' },
    { id: 'w4', label: 'Command Center v2 restyling ship',                   done: false, focus: false, meta: 'PHASE 2',  notes: '' },
  ],
};

  // --- Toast
  const toastEl = document.getElementById('toast');
  let toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 1800);
  }

  // --- Semantic toast variants
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
  function toastOk(msg)   { toastEl.classList.remove('warn','err'); toastEl.classList.add('ok'); toast(msg); }
  function toastWarn(msg) { toastEl.classList.remove('ok','err');   toastEl.classList.add('warn'); toast(msg); }
  function toastErr(msg)  { toastEl.classList.remove('ok','warn');  toastEl.classList.add('err'); toast(msg); }

  // --- Semantic button confirmation (green on success, red on error)
  function confirmBtn(btn, kind, label, ms = 1400) {
    if (!btn) return;
    const original = btn.dataset._orig || btn.innerHTML;
    btn.dataset._orig = original;
    btn.classList.remove('is-ok','is-err');
    btn.classList.add(kind === 'ok' ? 'is-ok' : 'is-err');
    const icon = kind === 'ok'
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>'
      : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>';
    btn.innerHTML = `<span>${label}</span><span class="ico">${icon}</span>`;
    setTimeout(() => {
      btn.classList.remove('is-ok','is-err');
      btn.innerHTML = original;
      delete btn.dataset._orig;
    }, ms);
  }

  async function copyWithFeedback(btn, text, okMsg, labelOk = 'Copied') {
    const doOk = () => { confirmBtn(btn, 'ok', labelOk); toastOk(okMsg); };
    try {
      await navigator.clipboard.writeText(text);
      doOk();
    } catch (e) {
      try {
        const ta = document.createElement('textarea');
        ta.value = text; ta.style.position='fixed'; ta.style.opacity='0';
        document.body.appendChild(ta); ta.select();
        document.execCommand('copy'); document.body.removeChild(ta);
        doOk();
      } catch (err) {
        confirmBtn(btn, 'err', 'Copy failed');
        toastErr('Copy failed · try again');
      }
    }
  }

  // --- State picker (collapsed-by-default)
  const stateCard = document.getElementById('stateCard');
  const statesList = document.getElementById('statesList');
  const stateToggle = document.getElementById('stateToggle');
  const stateCurrent = document.getElementById('stateCurrent');

  function renderStates() {
    document.querySelectorAll('#statesList .state').forEach(el => {
      const on = el.dataset.state === state.mode;
      el.classList.toggle('is-on', on);
      el.classList.toggle('is-active', on);
    });
    const active = document.querySelector(`#statesList .state[data-state="${state.mode}"]`);
    if (active) {
      stateCurrent.dataset.state = state.mode;
      stateCurrent.querySelector('.label').textContent = active.querySelector('.label').textContent;
      stateCurrent.querySelector('.meta').textContent  = active.querySelector('.meta').textContent;
    }
  }
  function setStateOpen(open) {
    stateCard.classList.toggle('is-open', open);
    stateToggle.textContent = open ? 'close ↑' : 'change ↓';
  }
  document.addEventListener('click', (e) => {
    if (!stateCard.contains(e.target) && stateCard.classList.contains('is-open')) setStateOpen(false);
  });
  stateToggle.addEventListener('click', () => setStateOpen(!stateCard.classList.contains('is-open')));
  stateCurrent.addEventListener('click', () => setStateOpen(!stateCard.classList.contains('is-open')));

  document.querySelectorAll('#statesList .state').forEach(el => {
    el.addEventListener('click', () => {
      state.mode = el.dataset.state;
      save(state); renderStates();
      setStateOpen(false);
      toast(`Mode · ${el.dataset.stateLabel || el.dataset.state}`);
    });
  });

  // --- Page navigation
  function setPage(name) {
    state.page = name;
    save(state);
    document.querySelectorAll('.page').forEach(p => p.classList.toggle('is-on', p.dataset.page === name));
    document.querySelectorAll('.navitem').forEach(n => n.classList.toggle('is-on', n.dataset.page === name));
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
  document.querySelectorAll('.navitem').forEach(n => {
    n.addEventListener('click', () => setPage(n.dataset.page));
  });
  document.addEventListener('keydown', (e) => {
    if (e.target.matches('input, textarea')) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const map = { h: 'today', t: 'today', b: 'buckets', p: 'prompts', m: 'roadmap', s: 'share' };
    const page = map[e.key.toLowerCase()];
    if (page) setPage(page);
  });

  // --- Today / Week tabs
  function setTab(name) {
    state.tab = name;
    save(state);
    document.querySelectorAll('.tab').forEach(t => t.classList.toggle('is-on', t.dataset.tab === name));
    document.querySelectorAll('[data-tabpane]').forEach(p => {
      const on = p.dataset.tabpane === name;
      p.hidden = !on;
    });
  }
  document.querySelectorAll('.tab').forEach(t => {
    t.addEventListener('click', () => setTab(t.dataset.tab));
  });

  // ============================================================
  // DIRECT LINE · panel (replaces compose modal + copy-to-clipboard)
  // Messages queue into state.line.messages with {id,role,kind,tag,text,ts,status}
  // role: 'me' | 'cos'
  // kind: 'redphone' | 'brain_dump' | 'prompt' | 'task' | 'launch' | 'freeform'
  // status: 'pending' | 'routed' | 'replied'
  // ============================================================
  const linePanel = document.getElementById('linePanel');
  const lineClose = document.getElementById('lineClose');
  const lineThread = document.getElementById('lineThread');
  const lineEmpty = document.getElementById('lineEmpty');
  const lineInput = document.getElementById('lineInput');
  const lineComposer = document.getElementById('lineComposer');
  const lineTagBar = document.getElementById('lineTagBar');
  const lineTag = document.getElementById('lineTag');
  const lineTagClear = document.getElementById('lineTagClear');
  const lineLaunch = document.getElementById('lineLaunch');

  let pendingTag = null; // {kind, label, seed?}

  function openLine(opts = {}) {
    linePanel.classList.add('is-open');
    document.body.classList.add('line-open');
    linePanel.setAttribute('aria-hidden', 'false');
    if (opts.tag) setTag(opts.tag);
    if (opts.seed !== undefined) {
      lineInput.value = opts.seed;
    }
    // hide/show structured launch based on whether thread has content
    lineLaunch.hidden = state.line.messages.length > 0;
    renderThread();
    setTimeout(() => lineInput.focus(), 180);
  }
  function closeLine() {
    linePanel.classList.remove('is-open');
    document.body.classList.remove('line-open');
    linePanel.setAttribute('aria-hidden', 'true');
  }
  lineClose.addEventListener('click', closeLine);

  function setTag(t) {
    pendingTag = t;
    if (!t) { lineTagBar.hidden = true; return; }
    lineTag.innerHTML = `<span class="pip"></span><span>${escapeHtml(t.label)}</span>`;
    lineTagBar.hidden = false;
  }
  lineTagClear.addEventListener('click', () => setTag(null));

  function timeFmt(ts) {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  }

  function renderThread() {
    // clear
    const msgs = state.line.messages;
    // keep empty state available, just toggle visibility
    lineThread.querySelectorAll('.msg').forEach(n => n.remove());
    lineEmpty.hidden = msgs.length > 0;
    lineLaunch.hidden = msgs.length > 0;

    msgs.forEach(m => {
      const wrap = document.createElement('div');
      wrap.className = 'msg ' + (m.role === 'me' ? 'me' : 'cos');

      const tag = document.createElement('div');
      tag.className = 'msg-tag';
      tag.dataset.kind = m.kind || '';
      const tagLabel = m.tag?.label || (m.kind === 'redphone' ? 'Red Phone' : (m.role === 'me' ? 'You' : 'Chief of staff'));
      tag.innerHTML = `<span class="pip"></span><span>${escapeHtml(tagLabel)}</span>`;
      wrap.appendChild(tag);

      const body = document.createElement('div');
      body.className = 'msg-body';
      body.textContent = m.text;
      wrap.appendChild(body);

      const meta = document.createElement('div');
      meta.className = 'msg-meta';
      const badge = m.status === 'pending'
        ? '<span class="msg-badge pending">pending</span>'
        : m.status === 'routed' ? '<span class="msg-badge routed">routed</span>' : '';
      meta.innerHTML = `${badge}<span>${timeFmt(m.ts)}</span>`;
      wrap.appendChild(meta);

      lineThread.appendChild(wrap);
    });
    lineThread.scrollTop = lineThread.scrollHeight;
  }

  function pushMessage(m) {
    const msg = Object.assign({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2,6),
      role: 'me',
      kind: 'freeform',
      tag: null,
      text: '',
      ts: Date.now(),
      status: 'pending',
    }, m);
    state.line.messages.push(msg);
    save(state);
    renderThread();
    return msg;
  }

  function send(text, kindOverride) {
    const t = (text || lineInput.value || '').trim();
    if (!t) return;
    const kind = kindOverride || (pendingTag?.kind ?? 'freeform');
    const tag = pendingTag;
    pushMessage({ text: t, kind, tag, status: 'pending' });
    lineInput.value = '';
    setTag(null);
    toastOk('On the line · queued');
  }

  lineComposer.addEventListener('submit', (e) => {
    e.preventDefault();
    send();
  });
  lineInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  });

  // structured launch buttons
  document.querySelectorAll('.launch').forEach(b => {
    b.addEventListener('click', () => {
      const k = b.dataset.launch;
      const seeds = {
        next_step: { label: 'Next step on roadmap', text: 'Read the roadmap and my current state. Tell me what\'s next and the one concrete move to begin it.' },
        issue: { label: 'I have an issue', text: '' },
        strategy: { label: 'High-level strategy', text: 'Flag this for an Opus Chat session. Here\'s the context:' },
      };
      const s = seeds[k];
      setTag({ kind: 'launch', label: s.label });
      lineInput.value = s.text;
      lineInput.focus();
      // position cursor at end
      lineInput.setSelectionRange(lineInput.value.length, lineInput.value.length);
    });
  });

  // --- Red Phone · opens the line with ritual opener
  const RED_PHONE = `Red Phone · session start. Read my current state from the Bodhi 360 brains, then give me exactly one next action. No preamble. No lists. One action, with the reason it matters right now. If something has shifted since last session, name it in one line first.`;
  const openRedPhoneBtn = document.getElementById('openRedPhone');
  openRedPhoneBtn.addEventListener('click', () => {
    openLine({
      tag: { kind: 'redphone', label: 'Red Phone' },
      seed: RED_PHONE,
    });
    confirmBtn(openRedPhoneBtn, 'ok', 'Line open');
  });

  // --- Buckets · open the line with bucket tag
  const BUCKET_LABELS = {
    bodhi360: 'bodhi360', harmonic: 'Harmonic', ldag: 'LDAG',
    book: 'The Book of Oneness', family: 'Family', creative: 'Creative',
  };
  document.querySelectorAll('.bucket').forEach(b => {
    b.addEventListener('click', () => {
      const key = b.dataset.bucket;
      openLine({
        tag: { kind: 'brain_dump', label: `Brain dump · ${BUCKET_LABELS[key] || key}`, bucket: key },
        seed: '',
      });
    });
  });

  // close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && linePanel.classList.contains('is-open')) {
      // Only close if no other scrim has focus
      if (!document.querySelector('.drawer.is-open')) closeLine();
    }
  });

  // --- Today / This week render
  function renderList(which) {
    const root = document.getElementById(which + 'List');
    const items = state[which];
    root.innerHTML = '';
    items.forEach(it => {
      const row = document.createElement('div');
      row.className = 'item' + (it.done ? ' done' : '') + (it.focus ? ' is-focus' : '') + (it.notes ? ' has-note' : '');
      row.innerHTML = `
        <div class="box" title="check"></div>
        <div class="lbl">${escapeHtml(it.label)}</div>
        <div class="note-ind">◈</div>
        <div class="meta-m">${escapeHtml(it.meta || '')}</div>
      `;
      // click the checkbox → toggle done
      row.querySelector('.box').addEventListener('click', (e) => {
        e.stopPropagation();
        it.done = !it.done;
        save(state); renderList(which); renderCounts();
      });
      // click anywhere else → open drawer
      row.addEventListener('click', () => openDrawer(which, it.id));
      root.appendChild(row);
    });
  }
  function renderCounts() {
    ['today','week'].forEach(which => {
      const items = state[which];
      const done = items.filter(i => i.done).length;
      const el = document.getElementById('count' + (which[0].toUpperCase() + which.slice(1)));
      if (el) el.textContent = `${done}/${items.length}`;
    });
    const ni = document.getElementById('ni-today');
    if (ni) {
      const t = state.today; const d = t.filter(i => i.done).length;
      ni.textContent = `${d} / ${t.length}`;
    }
  }

  function bindAdder(which) {
    const form = document.getElementById(which + 'Add');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('input');
      const v = input.value.trim();
      if (!v) return;
      state[which].push({ id: Date.now().toString(36), label: v, done: false, meta: 'NEW', notes: '' });
      input.value = '';
      save(state); renderList(which); renderCounts();
    });
  }

  // --- Drawer (context for a task)
  const drawer = document.getElementById('drawer');
  const drawerScrim = document.getElementById('drawerScrim');
  const drawerTitle = document.getElementById('drawerTitle');
  const drawerMeta = document.getElementById('drawerMeta');
  const drawerEyebrow = document.getElementById('drawerEyebrow');
  const drawerNotes = document.getElementById('drawerNotes');
  const drawerClose = document.getElementById('drawerClose');
  const drawerDelete = document.getElementById('drawerDelete');
  const drawerCopy = document.getElementById('drawerCopy');
  let drawerCtx = null; // { which, id }

  function findItem(which, id) { return state[which].find(i => i.id === id); }

  function openDrawer(which, id) {
    const it = findItem(which, id);
    if (!it) return;
    drawerCtx = { which, id };
    drawerTitle.textContent = it.label;
    drawerMeta.textContent = `${which === 'today' ? 'Today' : 'This week'} · ${it.meta || ''}${it.done ? ' · done' : ''}`;
    drawerEyebrow.textContent = 'Task context · for the agent';
    drawerNotes.value = it.notes || '';
    drawer.classList.add('is-open');
    drawerScrim.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    setTimeout(() => drawerNotes.focus(), 200);
  }
  function closeDrawer() {
    drawer.classList.remove('is-open');
    drawerScrim.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    drawerCtx = null;
  }
  drawerClose.addEventListener('click', closeDrawer);
  drawerScrim.addEventListener('click', closeDrawer);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('is-open')) closeDrawer();
  });

  // auto-save notes
  drawerNotes.addEventListener('input', () => {
    if (!drawerCtx) return;
    const it = findItem(drawerCtx.which, drawerCtx.id);
    if (!it) return;
    it.notes = drawerNotes.value;
    save(state);
    // update note indicator on the list row without full re-render
    const rows = document.querySelectorAll('#' + drawerCtx.which + 'List .item');
    // simple: full re-render is fine; it's cheap
    renderList(drawerCtx.which);
  });

  drawerDelete.addEventListener('click', () => {
    if (!drawerCtx) return;
    const { which, id } = drawerCtx;
    state[which] = state[which].filter(i => i.id !== id);
    save(state); renderList(which); renderCounts();
    closeDrawer();
    toast('Task · deleted');
  });

  drawerCopy.addEventListener('click', () => {
    if (!drawerCtx) return;
    const it = findItem(drawerCtx.which, drawerCtx.id);
    if (!it) return;
    const which = drawerCtx.which;
    const taskId = drawerCtx.id;
    const text = `Task · ${it.label}
Bucket: ${it.meta || '(none)'} · Horizon: ${which === 'today' ? 'Today' : 'This week'} · Status: ${it.done ? 'done' : 'open'}

${it.notes || '(no additional context yet)'}`;
    closeDrawer();
    openLine({
      tag: { kind: 'task', label: `Task · ${it.label}`, taskId, horizon: which },
      seed: text,
    });
  });

  // --- Key prompts
  const PROMPTS = {
    morning:    { label: 'Morning · where am I',          text: `Morning check-in. Read the current state of all brains (Harmonic, Creative, LDAG, Book/MIRROR, Family, Personal). Tell me where I am in one short paragraph, then give exactly one next action with the reason. No lists.` },
    ldag_prod:  { label: 'LDAG · pick up production',     text: `LDAG · pick up production. Read the LDAG brain: transcripts, episode briefs, dashboard status. Tell me which episode is closest to shippable and the one concrete next step to move it.` },
    ldag_draft: { label: 'LDAG · draft an episode',       text: `LDAG · draft an episode. Given the concept + moments below, produce an Opus Agent brief: title working options, cold open idea, 3–5 beats, and a CTA hypothesis.\n\n---\n[paste concept + moments here]` },
    status:          { label: 'Status update',                   text: `Status update: something changed. I'll describe it in one line. Update the brains, flag any downstream implications for the current mode, and revise today's one next action if needed.\n\n---\n[what changed]` },
    design_prd:      { label: 'Design PRD · Claude Designer',    text: `Design PRD · Claude Designer handoff. Turn the following into a product requirements doc the designer can build from: audience, job-to-be-done, screens/states needed, interaction notes, references, non-goals.\n\n---\n[paste raw context]` },
    skills_reorg_p3: { label: 'Skills reorg · Phase 3',          text: `Skills reorg Phase 3: canonical structure proposal. Review the inventory at _command-center/reorg/INVENTORY_2026-04-20.md. Propose the canonical folder structure, which skills move where, and what gets archived. One concrete migration plan, no frameworks.` },
  };
  document.querySelectorAll('.prompt').forEach(p => {
    p.addEventListener('click', () => {
      const def = PROMPTS[p.dataset.prompt];
      if (!def) return;
      openLine({
        tag: { kind: 'prompt', label: def.label, prompt: p.dataset.prompt },
        seed: def.text,
      });
    });
  });

  // --- Tweaks
  const tweaksBtn = document.getElementById('tweaksBtn');
  const tweaksPanel = document.getElementById('tweaks');
  tweaksBtn.addEventListener('click', () => tweaksPanel.classList.toggle('is-open'));

  function applyVariant() {
    document.body.classList.remove('variant-cockpit', 'variant-altar', 'variant-breathing', 'variant-orbit');
    document.body.classList.add('variant-' + state.variant);
    document.querySelectorAll('.tweak-opt[data-variant]').forEach(el => {
      el.classList.toggle('is-on', el.dataset.variant === state.variant);
    });
    if (state.variant === 'orbit') buildOrbit(); else teardownOrbit();
    if (state.variant === 'altar') setupAltar(); else teardownAltar();
  }

  // --- Altar view — single horizontal pill strip with dropdowns
  let altarPills = null;
  function setupAltar() {
    if (altarPills) return;
    const sidebar = document.querySelector('.sidebar');
    altarPills = document.createElement('div');
    altarPills.className = 'altar-pills';

    // State pill
    const currentMode = state.mode || 'green';
    const modeLabel = {green:'Go', yellow:'Hold', red:'Rest', potato:'Potato', focus:'Deep', crash:'Crashed', harmonic:'Work day'}[currentMode];
    const statePill = makePill({
      id: 'altar-state',
      head: `<span class="pip" data-mode="${currentMode}"></span><span>${modeLabel}</span><span class="chev">▾</span>`,
      items: [
        {mode:'green', label:'Go'},
        {mode:'yellow', label:'Hold'},
        {mode:'red', label:'Rest'},
        {mode:'potato', label:'Potato'},
        {mode:'focus', label:'Deep'},
        {mode:'crash', label:'Crashed'},
        {mode:'harmonic', label:'Work day'},
      ].map(o => ({
        html: `<span class="pip" data-mode="${o.mode}"></span><span>${o.label}</span>`,
        onClick: () => {
          const stateEl = document.querySelector(`.state[data-state="${o.mode}"]`);
          if (stateEl) stateEl.click();
          // Re-render Altar strip to reflect new label/pip
          teardownAltar(); setupAltar();
        }
      }))
    });

    // Page pill
    const pages = [
      {p:'today',   label:'Home · Today',   key:'H'},
      {p:'buckets', label:'Brain dump',     key:'B'},
      {p:'prompts', label:'Key prompts',    key:'P'},
      {p:'roadmap', label:'Roadmap',        key:'M'},
      {p:'share',   label:'Share with Cowork', key:'S'},
    ];
    const currentPage = pages.find(x => x.p === state.page) || pages[0];
    const pagePill = makePill({
      id: 'altar-page',
      head: `<span>${currentPage.label}</span><span class="chev">▾</span>`,
      items: pages.map(o => ({
        html: `<span>${o.label}</span><span class="am-key">${o.key}</span>`,
        onClick: () => { setPage(o.p); teardownAltar(); setupAltar(); }
      }))
    });

    // Links pill — live surfaces, collapsed behind one icon
    const surfaces = Array.from(document.querySelectorAll('.surfaces .surface'));
    const linksPill = makePill({
      id: 'altar-links',
      head: `<span>Links</span><span class="chev">▾</span>`,
      items: surfaces.map(a => ({
        html: `<span>${a.querySelector('span:nth-of-type(1)').textContent}</span><span class="am-key">↗</span>`,
        onClick: () => { window.open(a.href, '_blank', 'noopener'); }
      }))
    });

    altarPills.appendChild(statePill);
    altarPills.appendChild(pagePill);
    altarPills.appendChild(linksPill);
    sidebar.appendChild(altarPills);
    document.addEventListener('click', altarOutside, true);
  }
  function makePill({id, head, items}) {
    const el = document.createElement('div');
    el.className = 'altar-pill';
    el.id = id;
    el.innerHTML = head + '<div class="altar-menu"></div>';
    const menu = el.querySelector('.altar-menu');
    items.forEach(it => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.innerHTML = it.html;
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        it.onClick();
        document.querySelectorAll('.altar-pill.is-open').forEach(p => p.classList.remove('is-open'));
      });
      menu.appendChild(btn);
    });
    // Click head to toggle (but not when clicking menu items — they stopPropagation)
    el.addEventListener('click', (e) => {
      if (e.target.closest('.altar-menu')) return;
      const wasOpen = el.classList.contains('is-open');
      document.querySelectorAll('.altar-pill.is-open').forEach(p => p.classList.remove('is-open'));
      if (!wasOpen) el.classList.add('is-open');
    });
    return el;
  }
  function altarOutside(e) {
    if (!document.body.classList.contains('variant-altar')) return;
    if (e.target.closest('.altar-pill')) return;
    document.querySelectorAll('.altar-pill.is-open').forEach(p => p.classList.remove('is-open'));
  }
  function teardownAltar() {
    if (altarPills && altarPills.parentNode) altarPills.remove();
    altarPills = null;
    document.removeEventListener('click', altarOutside, true);
  }

  // --- Orbit view
  let orbitRoot = null;
  function buildOrbit() {
    if (orbitRoot) return;
    orbitRoot = document.createElement('div');
    orbitRoot.id = 'orbit';
    orbitRoot.innerHTML = `
      <div class="orbit-sky"></div>
      <svg class="orbit-rings" viewBox="-500 -500 1000 1000" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        <circle r="160" class="ring"/>
        <circle r="250" class="ring"/>
        <circle r="340" class="ring"/>
      </svg>
      <div class="orbit-sun" data-go="today">
        <div class="sun-glow"></div>
        <div class="sun-label"><em>bodhi 360°</em><small>home</small></div>
      </div>
      <div class="planet p-red" data-go="redphone"><span>Red Phone</span></div>
      <div class="planet p-harmonic" data-bucket="harmonic"><span>Harmonic</span></div>
      <div class="planet p-ldag"     data-bucket="ldag"><span>LDAG</span></div>
      <div class="planet p-book"     data-bucket="book"><span>Book of Oneness</span></div>
      <div class="planet p-family"   data-bucket="family"><span>Family</span></div>
      <div class="planet p-creative" data-bucket="creative"><span>Creative</span></div>
      <div class="planet p-bodhi"    data-bucket="bodhi360"><span>bodhi360</span></div>
      <div class="orbit-hint">Tap a planet · Red Phone copies · Sun returns home</div>
    `;
    document.body.appendChild(orbitRoot);
    orbitRoot.querySelectorAll('[data-go]').forEach(n => {
      n.addEventListener('click', () => {
        const t = n.dataset.go;
        if (t === 'redphone') {
          state.variant = 'cockpit'; save(state); applyVariant();
          openLine({ tag: { kind: 'redphone', label: 'Red Phone' }, seed: RED_PHONE });
        } else {
          state.variant = 'cockpit'; save(state); applyVariant();
          setPage(t);
        }
      });
    });
    orbitRoot.querySelectorAll('[data-bucket]').forEach(n => {
      n.addEventListener('click', () => {
        const key = n.dataset.bucket;
        state.variant = 'cockpit'; save(state); applyVariant();
        openLine({
          tag: { kind: 'brain_dump', label: `Brain dump · ${BUCKET_LABELS[key] || key}`, bucket: key },
          seed: '',
        });
      });
    });
  }
  function teardownOrbit() { if (orbitRoot) { orbitRoot.remove(); orbitRoot = null; } }
  document.querySelectorAll('.tweak-opt[data-variant]').forEach(el => {
    el.addEventListener('click', () => {
      state.variant = el.dataset.variant;
      save(state); applyVariant();
      toast(`Tweak · ${el.textContent.trim()}`);
    });
  });

  // --- Brand / logo → home
  const brandHome = document.getElementById('brandHome');
  if (brandHome) brandHome.addEventListener('click', () => setPage('today'));

  // --- Share with Cowork kit
  const SHARE_KIT = `Bodhi 360° · Command Center v2 — share kit
(Paste this into a new Cowork session so Cowork can see what's been built without screens.)

PURPOSE
A personal command center for a neurodivergent (AuDHD), non-dual operator running Harmonic (day job), LDAG, The Book of Oneness, Family, and Creative work in parallel. The center reduces cognitive load: every session starts with the Red Phone (one next action), brain dumps get routed, and tasks carry persistent context for the agent.

CORE PARADIGM · DIRECT LINE (v2)
v1 relied on copying prompts and pasting them into a new Cowork session every time. v2 replaces that with a Direct Line panel — a 440px conversational surface that slides in from the right. Every action (Red Phone, brain-dump bucket, key prompt, "Send to the line" from a task) opens this panel and queues a message into the chief-of-staff inbox. The chief of staff reads on its next run and replies in the same thread. No copying, no new sessions, one continuous conversation.

  • Message shape (in memory per session; Supabase \`agent_triggers\` when the backend is live):
      { id, role: 'me'|'cos', kind, tag, text, ts, status: 'pending'|'routed'|'replied' }
  • kind values: redphone · brain_dump · prompt · task · launch · freeform
  • Panel persists across page changes. Close only via the explicit X or Escape.

  • Structured launch (when thread is empty) — three taps:
      · Next step on roadmap
      · I have an issue
      · High-level strategy (flagged for an Opus Chat session)

STRUCTURE
Sidebar (always visible in Cockpit view):
  • Brand (bodhi 360°) — clicking the logo returns to Home.
  • State picker — collapsed by default, shows the current mode (Go / Hold / Rest / Potato / Deep / Crashed / Work day). Click the pill to change state.
  • Navigate: Home · Today, Brain dump, Key prompts, Roadmap, Share with Cowork.
  • Live surfaces: LDAG dashboard, MIRROR ops, Book of Oneness.

Home (default page):
  • Red Phone — pinned at the top. "Open the line" opens the Direct Line panel seeded with the session-start message, tagged RED PHONE.
  • Today / This week tabs — inside one card. Check off (the small square) or click the row label to open the task drawer.

Task drawer (per task):
  • Task + horizon + bucket + notes textarea (saved live).
  • "Send to the line" closes the drawer and opens the Direct Line panel with the task bundled as a tagged message, ready to send.

Brain dump page:
  • Buckets: bodhi360, Harmonic, LDAG, The Book of Oneness, Family, Creative.
  • Clicking a bucket opens the Direct Line panel with a brain-dump tag pre-applied.

Key prompts page:
  • Morning check-in, LDAG production, LDAG draft, Status update, Design PRD.
  • Clicking opens the Direct Line panel with the prompt text pre-seeded and tagged.

Share with Cowork page:
  • The one legitimate clipboard pattern — this kit. Cowork is a separate surface; this is how the Command Center describes itself to it.

Roadmap page:
  • Phases 00–09. Currently at 02 (Direct Line panel · queue-backed CoS). Next: 03 scheduled CoS poller.

DESIGN LANGUAGE
  • Deep still gradient background, subtle 40s breathing motion.
  • Two glass tiers: liquid-glass and liquid-glass-strong, each with a masked gradient border (no visible borders).
  • Cyan (hsl 188 90% 62%) is the system signal color (pulse, active states, checkmarks, progress).
  • Red is reserved exclusively for the Red Phone.
  • Poppins for UI, Source Serif 4 italic for emphasized phrases, JetBrains Mono for eyebrow labels.
  • One unified button style (primary cyan) across the site; ghost variant for secondary.

STATE / PERSISTENCE
  • In-memory per session. Refreshing the page resets all state. Supabase integration planned for cross-device persistence.

VIEWS (Views button, bottom-right — hidden while the Direct Line panel is open)
  • Cockpit — the full two-column dashboard (default).
  • Altar — strips the sidebar down to a single horizontal pill strip (brand + State pill + Page pill + Links pill, each with a dropdown).
  • Orbit — planetary canvas. A cyan sun ("bodhi 360°", click = Home) sits at center with orbiting planets: Red Phone (opens the line with session opener), Harmonic / LDAG / bodhi360 (middle ring, open the line with brain-dump tag), Book of Oneness / Family / Creative (outer ring, same).

[ end share kit ]`;

  const shareBtn = document.getElementById('shareCopy');
  if (shareBtn) shareBtn.addEventListener('click', () => {
    copyWithFeedback(shareBtn, SHARE_KIT, 'Share kit · copied · paste into Cowork', 'Copied');
  });
  renderStates();
  buildOrbit; teardownOrbit; // keep references live
  ['today','week'].forEach(w => { renderList(w); bindAdder(w); });
  renderCounts();
  setPage(state.page);
  setTab(state.tab);
  applyVariant();
