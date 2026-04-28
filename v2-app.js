// Bodhi 360 Command Center · interactions

const SUPABASE_URL = 'https://gcbvvausrmbbkfazojpl.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_dx9sYWtLtpXacM9ZIXoYRg_VPiKG69P';
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const save = () => {}; // replaced stage by stage with real Supabase writes

let sbLive = false;
function setLineStatus(live) {
  sbLive = live;
  const el = document.getElementById('lineStatus');
  if (!el) return;
  el.textContent = live ? 'live' : 'offline';
  el.classList.toggle('is-live', live);
  el.classList.toggle('is-offline', !live);
}

function persistState(field, value, eventType) {
  sb.from('portfolio_state')
    .update({ [field]: value, updated_at: new Date().toISOString() })
    .eq('user_id', 'bodhi')
    .then(({ error: e }) => { if (e) console.warn('portfolio_state write failed:', e); });
  sb.from('interaction_log').insert({
    user_id: 'bodhi',
    event_type: eventType,
    event_data: { field, value },
  }).then(({ error: e }) => { if (e) console.warn('interaction_log write failed:', e); });
}

const BUCKET_CANONICAL = {
  'bodhi360': 'bodhi360', 'bodhi': 'bodhi360', '360': 'bodhi360',
  'mirror': 'MIRROR',
  'harmonic': 'Harmonic',
  'family': 'Family',
  'framezero': 'FRAMEZERO', 'framezer': 'FRAMEZERO',
  'ldag': 'LDAG',
  'career': 'Career',
  'command': 'Command',
};
function normalizeBucket(v) {
  if (!v) return 'bodhi360';
  const k = v.toLowerCase().replace('ø', 'o').trim();
  return BUCKET_CANONICAL[k] || 'bodhi360';
}

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
      persistState('energy_state', state.mode, 'state_changed');
    });
  });

  // --- Page navigation
  function setPage(name) {
    state.page = name;
    save(state);
    document.querySelectorAll('.page').forEach(p => p.classList.toggle('is-on', p.dataset.page === name));
    document.querySelectorAll('.navitem').forEach(n => n.classList.toggle('is-on', n.dataset.page === name));
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (sbLive) persistState('active_page', name, 'page_changed');
  }
  document.querySelectorAll('.navitem').forEach(n => {
    n.addEventListener('click', () => setPage(n.dataset.page));
  });
  document.addEventListener('keydown', (e) => {
    // Input guard: never fire hotkeys when a text field has focus
    if (
      document.activeElement.tagName === 'INPUT' ||
      document.activeElement.tagName === 'TEXTAREA' ||
      document.activeElement.isContentEditable
    ) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const key = e.key.toLowerCase();
    // N: open add-task modal for Today
    if (key === 'n') {
      const modal = document.getElementById('addTaskModal');
      if (!modal || !modal.hidden) return; // already open, do nothing
      openAddTaskModal('today');
      return;
    }
    // F: toggle Focus mode (close modal if open, otherwise toggle selection mode)
    if (key === 'f') {
      const fModal = document.getElementById('focusModal');
      if (fModal && !fModal.hidden) { closeFocusModal(); return; }
      focusModeToggle.click();
      return;
    }
    // Page nav map
    const map = { h: 'today', b: 'buckets', k: 'bucket-view', p: 'prompts', m: 'roadmap', s: 'share' };
    const page = map[key];
    if (page) setPage(page);
    if (key === 'v') tweaksPanel.classList.toggle('is-open');
    // O toggles Direct Line panel
    if (key === 'o') {
      if (linePanel.classList.contains('is-open')) { closeLine(); } else { openLine(); }
    }
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
    if (sbLive) persistState('active_tab', name, 'tab_changed');
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
  let dlUnread = 0;

  function updateBell() {
    const btn = document.getElementById('dlNotifBtn');
    const countEl = document.getElementById('dlNotifCount');
    if (!btn || !countEl) return;
    if (dlUnread > 0) {
      countEl.textContent = dlUnread;
      btn.style.display = 'flex';
    } else {
      btn.style.display = 'none';
    }
  }

  function fireCoSNotif(content) {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    try {
      new Notification('Chief of Staff replied', {
        body: (content || '').slice(0, 120),
        silent: false,
      });
    } catch (e) {
      console.warn('Browser notification failed:', e);
    }
  }

  async function openLine(opts = {}) {
    // FIX 2: only one panel open at a time
    if (drawer.classList.contains('is-open')) closeDrawer();
    linePanel.inert = false;
    linePanel.classList.add('is-open');
    document.body.classList.add('line-open');
    dlUnread = 0;
    updateBell();
    linePanel.setAttribute('aria-hidden', 'false');
    if (opts.tag) setTag(opts.tag);
    lineInput.value = opts.seed !== undefined ? opts.seed : '';
    // FIX 7: always show start of pre-populated text, not middle
    lineInput.scrollTop = 0;
    lineInput.setSelectionRange(0, 0);
    // P5: load full conversation thread from Supabase on every open
    loadConversationThread();
    await loadQueueSummary();
    setTimeout(() => lineInput.focus(), 180);
  }
  function closeLine() {
    lineClose.blur();
    linePanel.classList.remove('is-open');
    document.body.classList.remove('line-open');
    linePanel.setAttribute('aria-hidden', 'true');
    linePanel.inert = true;
  }
  lineClose.addEventListener('click', closeLine);

  // Launch toggle (collapse/expand quick actions)
  const launchToggle = document.getElementById('launchToggle');
  const launchItems = document.getElementById('launchItems');
  launchToggle.addEventListener('click', () => {
    const open = launchItems.classList.toggle('is-open');
    launchToggle.classList.toggle('is-open', open);
  });

  const lineQueueBadge = document.getElementById('lineQueueBadge');
  const lqbCount = document.getElementById('lqbCount');
  const lqbClear = document.getElementById('lqbClear');
  let _queueIds = [];

  async function loadQueueSummary() {
    if (!sbLive) return;

    const { data: msgs, error } = await sb
      .from('direct_line_messages')
      .select('id')
      .eq('user_id', 'bodhi')
      .eq('processed', false)
      .order('created_at', { ascending: true })
      .limit(50);

    if (error || !msgs || msgs.length === 0) {
      lineQueueBadge.hidden = true;
      _queueIds = [];
      return;
    }

    _queueIds = msgs.map(m => m.id);
    lqbCount.textContent = String(_queueIds.length);
    lineQueueBadge.hidden = false;
  }

  lqbClear.addEventListener('click', async () => {
    if (!_queueIds.length) return;
    const { error: e } = await sb
      .from('direct_line_messages')
      .update({ processed: true })
      .in('id', _queueIds)
      .eq('user_id', 'bodhi');
    if (e) { toastErr('Clear failed'); return; }
    lineQueueBadge.hidden = true;
    const cleared = _queueIds.length;
    _queueIds = [];
    toastOk('Queue cleared');
    sb.from('interaction_log').insert({
      user_id: 'bodhi',
      event_type: 'queue_cleared',
      event_data: { count: cleared },
    }).then(() => {});
  });

  async function queueToLine(content, kind, tagValue) {
    const { error } = await sb
      .from('direct_line_messages')
      .insert({
        user_id: 'bodhi',
        content,
        kind,
        tag: tagValue || null,
        processed: false,
      });
    if (error) { console.error('[Supabase] direct_line_messages insert failed:', error); toastErr('Queue write failed: ' + (error.message || error.code || 'unknown')); return false; }
    toastOk('Queued · CoS picks this up when you open the line.');
    sb.from('interaction_log').insert({
      user_id: 'bodhi',
      event_type: 'message_queued',
      event_data: { kind, tag: tagValue, length: content.length },
    }).then(({ error: e }) => { if (e) console.warn('interaction_log write failed:', e); });
    return true;
  }

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

  // ── P5: Conversation thread ────────────────────────────────────
  function buildUserBubble(item) {
    const wrap = document.createElement('div');
    wrap.className = 'dl-bubble-wrap dl-bubble-wrap--user';
    const bubble = document.createElement('div');
    bubble.className = 'dl-bubble user';
    bubble.textContent = item.content;
    const time = document.createElement('div');
    time.className = 'dl-bubble-time';
    time.textContent = timeFmt(new Date(item.created_at));
    bubble.appendChild(time);
    wrap.appendChild(bubble);
    return wrap;
  }

  function buildCosBubble(item) {
    const wrap = document.createElement('div');
    wrap.className = 'dl-bubble-wrap dl-bubble-wrap--cos';
    const label = document.createElement('div');
    label.className = 'dl-bubble-label';
    label.textContent = 'CoS';
    const bubble = document.createElement('div');
    bubble.className = 'dl-bubble cos';
    bubble.textContent = item.content;
    const time = document.createElement('div');
    time.className = 'dl-bubble-time';
    time.textContent = timeFmt(new Date(item.created_at));
    bubble.appendChild(time);
    wrap.appendChild(label);
    wrap.appendChild(bubble);
    return wrap;
  }

  function renderConversationThread(items) {
    lineThread.querySelectorAll('.dl-bubble-wrap').forEach(n => n.remove());
    if (!items || items.length === 0) {
      lineEmpty.hidden = false;
      lineLaunch.hidden = false;
      return;
    }
    lineEmpty.hidden = true;
    lineLaunch.hidden = true;
    items.forEach(item => {
      lineThread.appendChild(item.type === 'user' ? buildUserBubble(item) : buildCosBubble(item));
    });
    setTimeout(() => { lineThread.scrollTop = lineThread.scrollHeight; }, 40);
  }

  async function loadConversationThread() {
    if (!sbLive) return;
    try {
      const [{ data: msgs, error: me }, { data: resps, error: re }] = await Promise.all([
        sb.from('direct_line_messages')
          .select('id, content, kind, tag, processed, created_at')
          .eq('user_id', 'bodhi')
          .order('created_at', { ascending: true }),
        sb.from('direct_line_responses')
          .select('id, message_id, agent, content, created_at')
          .order('created_at', { ascending: true }),
      ]);
      if (me || re) { console.warn('[DL] thread load error', me || re); return; }
      const userItems = (msgs || []).map(m => ({ type: 'user', id: m.id, content: m.content, kind: m.kind, created_at: m.created_at }));
      const cosItems  = (resps || []).map(r => ({ type: 'cos',  id: r.id, message_id: r.message_id, agent: r.agent, content: r.content, created_at: r.created_at }));
      const unified = [...userItems, ...cosItems].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      renderConversationThread(unified);
    } catch (err) {
      console.warn('[DL] loadConversationThread failed:', err);
    }
  }
  // ── end P5 ───────────────────────────────────────────────────

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

  async function send(text, kindOverride) {
    const t = (text || lineInput.value || '').trim();
    if (!t) return;
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
    const kind = kindOverride || (pendingTag?.kind ?? 'redphone');
    const tag = pendingTag;
    const tagValue = tag?.label || tag?.bucket || tag?.taskId || null;

    const { error } = await sb
      .from('direct_line_messages')
      .insert({
        user_id: 'bodhi',
        content: t,
        kind,
        tag: tagValue,
        processed: false,
      });

    if (error) { toastErr('Send failed · try again'); return; }

    // P5: optimistically append user bubble to thread immediately
    const _dlMsg = { type: 'user', content: t, kind, created_at: new Date().toISOString() };
    lineThread.appendChild(buildUserBubble(_dlMsg));
    lineThread.scrollTop = lineThread.scrollHeight;
    lineEmpty.hidden = true;
    lineLaunch.hidden = true;
    lineInput.value = '';
    setTag(null);
    toastOk('Sent · Chief of Staff picks this up on next run.');
    closeLine();

    sb.from('interaction_log').insert({
      user_id: 'bodhi',
      event_type: 'message_sent',
      event_data: { kind, tag: tagValue, length: t.length },
    }).then(({ error: e }) => { if (e) console.warn('interaction_log write failed:', e); });

    await loadQueueSummary();
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

  const dlNotifBtn = document.getElementById('dlNotifBtn');
  if (dlNotifBtn) {
    dlNotifBtn.addEventListener('click', () => { openLine(); });
  }

  // --- Brain Dump tiles · each opens the line with a brain_dump tag
  const BUCKET_LABELS = {
    bodhi360: 'bodhi360', harmonic: 'Harmonic', ldag: 'LDAG',
    book: 'THE BOOK OF ONENESS', family: 'Family', creative: 'Creative',
    mirror: 'MIRROR', career: 'Career', command: 'Command',
  };
  document.querySelectorAll('.bucket-dump').forEach(b => {
    b.addEventListener('click', () => {
      const key = b.dataset.bucket;
      openLine({
        tag: { kind: 'brain_dump', label: `Brain dump · ${BUCKET_LABELS[key] || key}`, bucket: key },
        seed: '',
      });
    });
  });

  // --- Buckets page · clickable filter tiles
  let bucketFilter = null;

  const bfAllBtn = document.getElementById('bucketFilterAll');

  // Sync All button active state: highlighted only when showing ALL tasks
  function syncAllBtn() {
    if (bfAllBtn) bfAllBtn.classList.toggle('is-active', bucketFilter === 'ALL');
  }

  // Initialize: null state -- no filter, no highlight, empty canvas
  syncAllBtn();

  document.querySelectorAll('.bucket').forEach(b => {
    b.addEventListener('click', () => {
      const key = b.dataset.bucket;
      // Always clear all tile active states first (prevents stale highlights)
      document.querySelectorAll('.bucket').forEach(x => x.classList.remove('is-active'));
      if (bucketFilter === key) {
        // Clicking the active tile deselects it
        bucketFilter = null;
      } else {
        // Select the new tile
        bucketFilter = key;
        b.classList.add('is-active');
      }
      syncAllBtn();
      renderBucketsPage();
      if (sbLive) persistState('bucket_filter', bucketFilter, 'bucket_filter_changed');
    });
  });

  if (bfAllBtn) {
    bfAllBtn.addEventListener('click', () => {
      // Toggle: ALL -> null (empty), anything else -> ALL
      if (bucketFilter === 'ALL') {
        bucketFilter = null;
      } else {
        bucketFilter = 'ALL';
      }
      document.querySelectorAll('.bucket').forEach(x => x.classList.remove('is-active'));
      syncAllBtn();
      renderBucketsPage();
      if (sbLive) persistState('bucket_filter', bucketFilter, 'bucket_filter_changed');
    });
  }

  // close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && linePanel.classList.contains('is-open')) {
      // Only close if no other scrim has focus
      if (!document.querySelector('.drawer.is-open')) closeLine();
    }
  });

  // --- Task filter and sort controls
  let taskFilter = { bucket: 'all', sort: 'oldest' };
  let subtaskMap = {}; // keyed by task_id; value: array of subtask objects {id, title, done, sort_order}
  let focusSelection = new Set();
  let focusSelectMode = false;
  let completedOpen = { today: false, week: false };

  const taskBucketFilter = document.getElementById('taskBucketFilter');
  const taskSortToggle = document.getElementById('taskSortToggle');

  taskBucketFilter.addEventListener('change', () => {
    taskFilter.bucket = taskBucketFilter.value;
    renderList('today'); renderList('week');
  });
  taskSortToggle.addEventListener('click', () => {
    taskFilter.sort = taskFilter.sort === 'oldest' ? 'newest' : 'oldest';
    taskSortToggle.textContent = taskFilter.sort === 'oldest' ? 'Oldest first' : 'Newest first';
    taskSortToggle.dataset.sort = taskFilter.sort;
    taskSortToggle.classList.toggle('is-sort-active', taskFilter.sort === 'newest');
    renderList('today'); renderList('week');
    if (sbLive) persistState('sort_preference', taskFilter.sort, 'sort_changed');
  });

  function updateFocusBar() {
    const bar = document.getElementById('focusSelectBar');
    const startBtn = document.getElementById('focusStartBtn');
    if (!bar || !startBtn) return;
    bar.hidden = !focusSelectMode;
    startBtn.disabled = focusSelection.size === 0;
    startBtn.textContent = focusSelection.size > 0
      ? 'Start Focus (' + focusSelection.size + ')'
      : 'Start Focus';
  }

  function openFocusModal() {
    const modal = document.getElementById('focusModal');
    const tasksEl = document.getElementById('focusModalTasks');
    if (!modal || !tasksEl) return;
    while (tasksEl.firstChild) tasksEl.removeChild(tasksEl.firstChild);
    const allTasks = [...state.today, ...state.week];
    focusSelection.forEach(id => {
      const it = allTasks.find(t => t.id === id);
      if (!it) return;
      const which = state.today.find(t => t.id === id) ? 'today' : 'week';
      const row = document.createElement('div');
      row.className = 'focus-modal-task' + (it.done ? ' done' : '');
      const boxEl = document.createElement('div');
      boxEl.className = 'box';
      boxEl.title = 'check';
      boxEl.addEventListener('click', async () => {
        it.done = !it.done;
        row.classList.toggle('done', it.done);
        renderList(which); renderCounts();
        const { error } = await sb.from('tasks').update({ done: it.done }).eq('id', it.id);
        if (error) {
          toastErr('Save failed');
          it.done = !it.done;
          row.classList.toggle('done', it.done);
          renderList(which); renderCounts();
        }
      });
      const lblEl = document.createElement('div');
      lblEl.className = 'focus-modal-lbl';
      lblEl.textContent = it.label;
      const metaEl = document.createElement('div');
      metaEl.className = 'focus-modal-meta';
      metaEl.textContent = it.meta || '';
      row.appendChild(boxEl);
      row.appendChild(lblEl);
      row.appendChild(metaEl);
      tasksEl.appendChild(row);
    });
    modal.hidden = false;
    document.body.classList.add('focus-modal-open');
  }

  function closeFocusModal() {
    const modal = document.getElementById('focusModal');
    if (modal) modal.hidden = true;
    document.body.classList.remove('focus-modal-open');
  }

  const focusModeToggle = document.getElementById('focusModeToggle');
  focusModeToggle.addEventListener('click', () => {
    focusSelectMode = !focusSelectMode;
    if (!focusSelectMode) focusSelection.clear();
    focusModeToggle.classList.toggle('is-active', focusSelectMode);
    focusModeToggle.textContent = focusSelectMode ? 'Cancel' : 'Focus';
    updateFocusBar();
    renderList('today');
    renderList('week');
  });

  const focusStartBtn = document.getElementById('focusStartBtn');
  if (focusStartBtn) {
    focusStartBtn.addEventListener('click', () => {
      if (focusSelection.size === 0) return;
      openFocusModal();
    });
  }

  const focusExitBtn = document.getElementById('focusExitBtn');
  if (focusExitBtn) {
    focusExitBtn.addEventListener('click', closeFocusModal);
  }

  // --- Today / This week render
  function renderList(which) {
    const root = document.getElementById(which + 'List');
    let items = [...state[which]];

    function buildRow(it) {
      const row = document.createElement('div');
      row.className = 'item' + (it.done ? ' done' : '') + (focusSelectMode && focusSelection.has(it.id) ? ' focus-selected' : '') + (it.notes ? ' has-note' : '');
      const boxEl = document.createElement('div');
      boxEl.className = 'box';
      boxEl.title = 'check';
      const lblWrap = document.createElement('div');
      lblWrap.className = 'lbl-wrap';
      const lblEl = document.createElement('div');
      lblEl.className = 'lbl';
      lblEl.textContent = it.label;
      const tsEl = document.createElement('div');
      tsEl.className = 'lbl-date';
      const tsText = formatTaskTs(it.createdAt);
      if (tsText) tsEl.textContent = tsText;
      lblWrap.appendChild(lblEl);
      // Subtask badge: show count + progress if this task has subtasks
      const _subs = subtaskMap[it.id];
      if (_subs && _subs.length > 0) {
        const _total = _subs.length;
        const _done  = _subs.filter(s => s.done).length;
        const _badge = document.createElement('span');
        _badge.className = 'subtask-badge' + (_done === _total ? ' all-done' : '');
        _badge.textContent = _done === 0
          ? _total + ' subtask' + (_total > 1 ? 's' : '')
          : _done + '/' + _total + ' done';
        lblWrap.appendChild(_badge);
      }
      if (tsText) lblWrap.appendChild(tsEl);
      const noteEl = document.createElement('div');
      noteEl.className = 'note-ind';
      noteEl.textContent = '◈';
      const metaEl = document.createElement('div');
      metaEl.className = 'meta-m';
      metaEl.textContent = it.meta || '';
      const moveBtn = document.createElement('button');
      moveBtn.className = 'move-horizon';
      moveBtn.type = 'button';
      moveBtn.title = which === 'today' ? 'Move to this week' : 'Move to today';
      moveBtn.textContent = which === 'today' ? 'week >' : '< today';
      row.appendChild(boxEl);
      row.appendChild(lblWrap);
      row.appendChild(noteEl);
      row.appendChild(metaEl);
      row.appendChild(moveBtn);
      row.querySelector('.box').addEventListener('click', async (e) => {
        e.stopPropagation();
        it.done = !it.done;
        renderList(which); renderCounts();
        const { error } = await sb.from('tasks').update({ done: it.done }).eq('id', it.id);
        if (error) {
          toastErr('Save failed');
          it.done = !it.done;
          renderList(which); renderCounts();
        } else {
          sb.from('interaction_log').insert({
            user_id: 'bodhi',
            event_type: 'task_checked',
            event_data: { task_id: it.id, done: it.done },
          }).then(({ error: e }) => { if (e) console.warn('interaction_log write failed:', e); });
        }
      });
      moveBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const newHorizon = which === 'today' ? 'week' : 'today';
        const { error } = await sb.from('tasks').update({ horizon: newHorizon }).eq('id', it.id);
        if (error) { toastErr('Move failed'); return; }
        state[which] = state[which].filter(i => i.id !== it.id);
        state[newHorizon].push({ ...it });
        renderList(which);
        renderList(newHorizon);
        renderCounts();
        toast(`Moved to ${newHorizon === 'today' ? 'today' : 'this week'}`);
      });
      row.addEventListener('click', () => {
        if (focusSelectMode) {
          if (focusSelection.has(it.id)) {
            focusSelection.delete(it.id);
          } else if (focusSelection.size < 3) {
            focusSelection.add(it.id);
          } else {
            row.classList.add('focus-reject');
            setTimeout(() => row.classList.remove('focus-reject'), 400);
            return;
          }
          renderList(which);
          updateFocusBar();
          return;
        }
        openDrawer(which, it.id);
      });
      row.draggable = true;
      row.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', JSON.stringify({ id: it.id, which }));
        e.dataTransfer.effectAllowed = 'move';
        setTimeout(() => row.classList.add('is-dragging'), 0);
      });
      row.addEventListener('dragend', () => {
        row.classList.remove('is-dragging');
        document.querySelectorAll('.item.drag-over').forEach(r => r.classList.remove('drag-over'));
      });
      row.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        document.querySelectorAll('.item.drag-over').forEach(r => r.classList.remove('drag-over'));
        row.classList.add('drag-over');
      });
      row.addEventListener('dragleave', () => {
        row.classList.remove('drag-over');
      });
      row.addEventListener('drop', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        row.classList.remove('drag-over');
        let src;
        try { src = JSON.parse(e.dataTransfer.getData('text/plain')); } catch { return; }
        if (!src || src.which !== which || src.id === it.id) return;
        const srcIdx = state[which].findIndex(t => t.id === src.id);
        const dstIdx = state[which].findIndex(t => t.id === it.id);
        if (srcIdx === -1 || dstIdx === -1) return;
        const [moved] = state[which].splice(srcIdx, 1);
        state[which].splice(dstIdx, 0, moved);
        renderList(which);
        const patches = state[which].map((t, i) =>
          sb.from('tasks').update({ sort_order: i }).eq('id', t.id)
        );
        try { await Promise.all(patches); } catch { toastErr('Reorder save failed'); }
      });
      return row;
    }

    // Apply bucket filter
    if (taskFilter.bucket !== 'all') {
      items = items.filter(it => (it.meta || 'bodhi360') === taskFilter.bucket);
    }
    // Apply sort by created_at timestamp
    if (taskFilter.sort === 'newest') {
      items = items.slice().sort((a, b) => {
        const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return tb - ta; // descending: largest timestamp (newest) at top
      });
    } else {
      items = items.slice().sort((a, b) => {
        const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return ta - tb; // ascending: smallest timestamp (oldest) at top
      });
    }
    while (root.firstChild) root.removeChild(root.firstChild);
    // P4: split active / done
    const activeItems = items.filter(i => !i.done);
    const doneItems   = items.filter(i =>  i.done);

    activeItems.forEach(it => root.appendChild(buildRow(it)));

    if (doneItems.length > 0) {
      const toggleBtn = document.createElement('button');
      toggleBtn.type = 'button';
      toggleBtn.className = 'completed-toggle';
      const chevron = document.createElement('span');
      chevron.className = 'completed-toggle-chevron';
      chevron.textContent = completedOpen[which] ? '▴' : '▾';
      toggleBtn.appendChild(document.createTextNode('Completed (' + doneItems.length + ')'));
      toggleBtn.appendChild(chevron);
      toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        completedOpen[which] = !completedOpen[which];
        renderList(which);
      });
      root.appendChild(toggleBtn);

      const doneSection = document.createElement('div');
      doneSection.className = 'completed-section' + (completedOpen[which] ? ' is-open' : '');
      doneItems.forEach(it => doneSection.appendChild(buildRow(it)));
      root.appendChild(doneSection);
    }
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
    // Bucket page counts and nav badge
    const all = [...state.today, ...state.week];
    const bktCounts = {};
    all.forEach(it => {
      const k = (it.meta || 'bodhi360').toLowerCase();
      bktCounts[k] = (bktCounts[k] || 0) + 1;
    });
    ['bodhi360','harmonic','ldag','book','family','creative','mirror','career','command'].forEach(k => {
      const el = document.getElementById('bkc-' + k);
      if (el) el.textContent = String(bktCounts[k] || 0);
    });
    const niBuckets = document.getElementById('ni-buckets');
    if (niBuckets) niBuckets.textContent = String(all.length);
  }

  function renderBucketsPage() {
    const container = document.getElementById('buckets-task-view');
    if (!container) return;
    const todayItems = state.today.map(t => ({ ...t, horizon: 'today' }));
    const weekItems = state.week.map(t => ({ ...t, horizon: 'week' }));
    const all = [...todayItems, ...weekItems];
    container.textContent = '';

    // Build a single task row (shared by both filtered and grouped branches)
    function makeBucketRow(it) {
      const row = document.createElement('div');
      row.className = 'item' + (it.done ? ' done' : '') + (it.notes ? ' has-note' : '');

      const boxEl = document.createElement('div');
      boxEl.className = 'box';
      boxEl.title = 'check';

      const lblEl = document.createElement('div');
      lblEl.className = 'lbl';
      lblEl.textContent = it.label;

      const noteEl = document.createElement('div');
      noteEl.className = 'note-ind';
      noteEl.textContent = '◈';

      const hzTag = document.createElement('div');
      hzTag.className = 'bucket-horizon-tag';
      hzTag.textContent = it.horizon === 'today' ? 'today' : 'week';

      const moveBtn = document.createElement('button');
      moveBtn.className = 'move-horizon';
      moveBtn.type = 'button';
      moveBtn.title = it.horizon === 'today' ? 'Move to this week' : 'Move to today';
      // FIX 3: directional arrow
      moveBtn.textContent = it.horizon === 'today' ? 'week >' : '< today';

      row.appendChild(boxEl);
      row.appendChild(lblEl);
      row.appendChild(noteEl);
      row.appendChild(hzTag);
      row.appendChild(moveBtn);

      boxEl.addEventListener('click', async (e) => {
        e.stopPropagation();
        const which = it.horizon;
        it.done = !it.done;
        const src = state[which].find(s => s.id === it.id);
        if (src) src.done = it.done;
        renderBucketsPage(); renderCounts();
        const { error } = await sb.from('tasks').update({ done: it.done }).eq('id', it.id);
        if (error) {
          toastErr('Save failed');
          it.done = !it.done;
          if (src) src.done = it.done;
          renderBucketsPage(); renderCounts();
        }
      });

      moveBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const which = it.horizon;
        const newHorizon = which === 'today' ? 'week' : 'today';
        const { error } = await sb.from('tasks').update({ horizon: newHorizon }).eq('id', it.id);
        if (error) { toastErr('Move failed'); return; }
        state[which] = state[which].filter(i => i.id !== it.id);
        state[newHorizon].push({ ...it, horizon: newHorizon });
        renderList(which); renderList(newHorizon); renderCounts(); renderBucketsPage();
        toast(`Moved to ${newHorizon === 'today' ? 'today' : 'this week'}`);
      });

      row.addEventListener('click', () => openDrawer(it.horizon, it.id));
      return row;
    }

    if (bucketFilter === null) {
      // State 1: no filter selected -- empty canvas, nothing to show
      return;
    } else if (bucketFilter === 'ALL') {
      // State 2: show all tasks grouped by bucket
      if (all.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'bt-empty';
        empty.textContent = 'No tasks yet.';
        container.appendChild(empty);
        return;
      }
      const BUCKET_ORDER = ['bodhi360','harmonic','ldag','book','family','creative','mirror','career','command'];
      const grouped = {};
      all.forEach(it => {
        const k = (it.meta || 'bodhi360').toLowerCase();
        if (!grouped[k]) grouped[k] = [];
        grouped[k].push(it);
      });
      const keys = [
        ...BUCKET_ORDER.filter(k => grouped[k]),
        ...Object.keys(grouped).filter(k => !BUCKET_ORDER.includes(k)),
      ];
      let firstGroup = true;
      keys.forEach(k => {
        const tasks = grouped[k];
        if (!tasks || !tasks.length) return;
        const hdr = document.createElement('div');
        hdr.className = 'bt-group-header' + (firstGroup ? ' bt-group-header--first' : '');
        firstGroup = false;
        hdr.textContent = BUCKET_LABELS[k] || k;
        container.appendChild(hdr);
        tasks.forEach(it => container.appendChild(makeBucketRow(it)));
      });
    } else {
      // State 3: single bucket filter -- flat list
      const visible = all.filter(t => (t.meta || 'bodhi360').toLowerCase() === bucketFilter.toLowerCase());
      if (visible.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'bt-empty';
        empty.textContent = 'No tasks in this bucket.';
        container.appendChild(empty);
        return;
      }
      visible.forEach(it => container.appendChild(makeBucketRow(it)));
    }
  }

  // P3: Add task modal
  let addTaskHorizon = null;

  function openAddTaskModal(horizon) {
    addTaskHorizon = horizon;
    const modal = document.getElementById('addTaskModal');
    const titleInput = document.getElementById('addTaskTitle');
    const errEl = document.getElementById('addTaskErr');
    if (!modal) return;
    titleInput.value = '';
    errEl.hidden = true;
    modal.hidden = false;
    setTimeout(() => titleInput.focus(), 60);
  }

  function closeAddTaskModal() {
    const modal = document.getElementById('addTaskModal');
    if (modal) modal.hidden = true;
    addTaskHorizon = null;
  }

  document.querySelectorAll('.add-task-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      openAddTaskModal(btn.dataset.horizon);
    });
  });

  const addTaskCancel = document.getElementById('addTaskCancel');
  if (addTaskCancel) addTaskCancel.addEventListener('click', closeAddTaskModal);

  // Enter key in title input triggers save
  const addTaskTitleInput = document.getElementById('addTaskTitle');
  if (addTaskTitleInput) {
    addTaskTitleInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); document.getElementById('addTaskSave').click(); }
    });
  }

  const addTaskSave = document.getElementById('addTaskSave');
  if (addTaskSave) {
    addTaskSave.addEventListener('click', async () => {
      const titleInput = document.getElementById('addTaskTitle');
      const bucketSel = document.getElementById('addTaskBucket');
      const errEl = document.getElementById('addTaskErr');
      const v = titleInput.value.trim();
      if (!v) {
        titleInput.classList.add('is-shaking');
        setTimeout(() => titleInput.classList.remove('is-shaking'), 400);
        errEl.hidden = false;
        return;
      }
      errEl.hidden = true;
      const which = addTaskHorizon || 'today';
      const bucket = normalizeBucket(bucketSel ? bucketSel.value : 'bodhi360');
      const { data, error } = await sb.from('tasks').insert({
        title: v,
        bucket,
        horizon: which,
        done: false,
        sort_order: 0,
        user_id: 'bodhi',
      }).select().single();
      if (error) { toastErr('Add failed'); return; }
      state[which].unshift({ id: data.id, label: data.title, done: false, meta: data.bucket || '', notes: '', createdAt: data.created_at || null });
      closeAddTaskModal();
      renderList(which); renderCounts();
      renderBucketsPage();
      toastOk('Task added');
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
  const drawerBucketSel = document.getElementById('drawerBucketSel');
  let drawerCtx = null; // { which, id }

  function findItem(which, id) { return state[which].find(i => i.id === id); }

  function openDrawer(which, id) {
    // FIX 2: only one panel open at a time
    if (linePanel.classList.contains('is-open')) closeLine();
    const it = findItem(which, id);
    if (!it) return;
    drawerCtx = { which, id };
    drawerTitle.textContent = it.label;
    drawerMeta.textContent = `${which === 'today' ? 'Today' : 'This week'} · ${it.meta || ''}${it.done ? ' · done' : ''}`;
    drawerEyebrow.textContent = 'Task context · for the agent';
    drawerNotes.value = it.notes || '';
    // FIX 8: populate bucket selector with current bucket
    if (drawerBucketSel) {
      const currentBucket = it.meta || 'bodhi360';
      const opt = drawerBucketSel.querySelector(`option[value="${currentBucket}"]`);
      drawerBucketSel.value = opt ? currentBucket : 'bodhi360';
    }
    drawer.inert = false;
    drawer.classList.add('is-open');
    drawerScrim.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    setTimeout(() => drawerNotes.focus(), 200);
  }
  function closeDrawer() {
    drawerClose.blur();
    drawer.classList.remove('is-open');
    drawerScrim.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    drawer.inert = true;
    drawerCtx = null;
  }
  drawerClose.addEventListener('click', closeDrawer);
  drawerScrim.addEventListener('click', closeDrawer);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('is-open')) closeDrawer();
    if (e.key === 'Escape' && document.getElementById('focusModal') && !document.getElementById('focusModal').hidden) closeFocusModal();
    if (e.key === 'Escape' && document.getElementById('addTaskModal') && !document.getElementById('addTaskModal').hidden) closeAddTaskModal();
  });

  // FIX 8: bucket change -- PATCH Supabase and update task in place
  if (drawerBucketSel) {
    drawerBucketSel.addEventListener('change', async () => {
      if (!drawerCtx) return;
      const it = findItem(drawerCtx.which, drawerCtx.id);
      if (!it) return;
      const newBucket = drawerBucketSel.value;
      const { error } = await sb.from('tasks').update({ bucket: newBucket }).eq('id', it.id);
      if (error) { toastErr('Bucket update failed'); drawerBucketSel.value = it.meta || 'bodhi360'; return; }
      it.meta = newBucket;
      drawerMeta.textContent = `${drawerCtx.which === 'today' ? 'Today' : 'This week'} · ${newBucket}${it.done ? ' · done' : ''}`;
      // re-render list (order is preserved, state array order unchanged)
      renderList(drawerCtx.which);
      renderBucketsPage();
      renderCounts();
      toastOk(`Bucket changed to ${newBucket}`);
    });
  }

  // auto-save notes (in-memory on input, persist to Supabase on blur)
  drawerNotes.addEventListener('input', () => {
    if (!drawerCtx) return;
    const it = findItem(drawerCtx.which, drawerCtx.id);
    if (!it) return;
    it.notes = drawerNotes.value;
    renderList(drawerCtx.which);
  });

  drawerNotes.addEventListener('blur', async () => {
    if (!drawerCtx) return;
    const it = findItem(drawerCtx.which, drawerCtx.id);
    if (!it || !it.notes) return;

    const { error } = await sb
      .from('task_notes')
      .upsert({
        task_id: it.id,
        user_id: 'bodhi',
        body: it.notes,
      }, { onConflict: 'task_id' });

    if (error) {
      toastErr('Note save failed');
    } else {
      toastOk('Note saved');
      sb.from('interaction_log').insert({
        user_id: 'bodhi',
        event_type: 'note_saved',
        event_data: { task_id: it.id, length: it.notes.length },
      }).then(({ error: e }) => { if (e) console.warn('interaction_log write failed:', e); });
    }
  });

  drawerDelete.addEventListener('click', () => {
    if (!drawerCtx) return;
    const { which, id } = drawerCtx;
    state[which] = state[which].filter(i => i.id !== id);
    save(state); renderList(which); renderCounts();
    closeDrawer();
    toast('Task · deleted');
  });

  drawerCopy.addEventListener('click', async () => {
    if (!drawerCtx) return;
    const it = findItem(drawerCtx.which, drawerCtx.id);
    if (!it) return;
    const which = drawerCtx.which;
    const taskId = drawerCtx.id;
    const text = `Task: ${it.label}
Bucket: ${it.meta || '(none)'} · Horizon: ${which === 'today' ? 'Today' : 'This week'} · Status: ${it.done ? 'done' : 'open'}

${it.notes || '(no additional context yet)'}`;
    closeDrawer();
    await queueToLine(text, 'task', taskId);
  });

  // --- Key prompts
  const PROMPTS = {
    cos_prompt: { label: 'Command Center CoS', text: `Load this skill and follow its instructions:\nskills/command-center-cos/SKILL.md\n\nRead the most recent handoff doc in _command-center/ for current state.\nSupabase MCP must be connected to Bodhi360 org (gcbvvausrmbbkfazojpl).\nCheck in with Bodhi before starting any build work.` },
    morning:    { label: 'Morning · where am I',          text: `Morning check-in. Read the current state of all brains (Harmonic, Creative, LDAG, Book/MIRROR, Family, Personal). Tell me where I am in one short paragraph, then give exactly one next action with the reason. No lists.` },
    ldag_prod:  { label: 'LDAG · pick up production',     text: `LDAG · pick up production. Read the LDAG brain: transcripts, episode briefs, dashboard status. Tell me which episode is closest to shippable and the one concrete next step to move it.` },
    ldag_draft: { label: 'LDAG · draft an episode',       text: `LDAG · draft an episode. Given the concept + moments below, produce an Opus Agent brief: title working options, cold open idea, 3–5 beats, and a CTA hypothesis.\n\n---\n[paste concept + moments here]` },
    status:          { label: 'Status update',                   text: `Status update: something changed. I'll describe it in one line. Update the brains, flag any downstream implications for the current mode, and revise today's one next action if needed.\n\n---\n[what changed]` },
    design_prd:      { label: 'Design PRD · Claude Designer',    text: `Design PRD · Claude Designer handoff. Turn the following into a product requirements doc the designer can build from: audience, job-to-be-done, screens/states needed, interaction notes, references, non-goals.\n\n---\n[paste raw context]` },
    session_wrap:    { label: 'Session wrap · flush and close',     text: `Before we close: check direct_line_messages for any unprocessed items and include them in the session summary. Then write everything we covered -- all tasks, decisions, status updates, and action items -- to two places:\n1. _inbox/_processed/STATUS_UPDATE_${new Date().toISOString().slice(0,10)}.md (full summary of what was discussed and decided)\n2. Supabase tasks table: insert every concrete action item as a task row with user_id='bodhi', horizon='today' or 'week' as appropriate, and the correct bucket.\nAfter writing, confirm what was inserted so I can see it in the dashboard.` },
    skills_reorg_p3: { label: 'Skills reorg · Phase 3',          text: `Skills reorg Phase 3: canonical structure proposal. Review the inventory at _command-center/reorg/INVENTORY_2026-04-20.md. Propose the canonical folder structure, which skills move where, and what gets archived. One concrete migration plan, no frameworks.` },
    build_qa:        { label: 'Build QA · did it follow the PRD?',     text: `Claude Code just finished a build. QA it against the PRD.\n\nPRD location: _command-center/PRD_dashboard_v2.md\nBuilt files: _command-center/index.html, _command-center/v2-app.js, _command-center/v2-styles.css\n\nRead the PRD in full. Then read the built files. For each major section of the PRD, check:\n- Is this section implemented?\n- Does the implementation match the spec?\n- Are there gaps, deviations, or cosmetic-only wiring?\n\nOutput a gap report in three sections:\nCORRECT: what matches the PRD\nMISSING: what the PRD specifies but the build did not implement\nWRONG: what the build implemented differently than the PRD specified\n\nBe specific. Name the file, function, and line number where possible.\nDo not suggest fixes -- just report the gaps. Bodhi decides what to fix next.` },
    ui_feedback:     { label: 'UI feedback · restyle in Claude Code', text: `You are restyling an existing file. Do NOT rebuild from scratch. CSS and visual layer only. Do not touch any Supabase connection, table names, or JS logic. No em dashes. No localStorage.\n\nProject: [name the project]\nFile to restyle: [exact path, e.g. _command-center/index.html]\n\nFeedback:\n[describe exactly what looks wrong or what you want changed]\n\nIf you need to see the file first, read it before writing a single line of output.` },
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

  // --- Altar view : single horizontal pill strip with dropdowns
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
      {p:'today',       label:'Home · Today',      key:'H'},
      {p:'buckets',     label:'Brain dump',         key:'B'},
      {p:'bucket-view', label:'Buckets',            key:'K'},
      {p:'prompts',     label:'Key prompts',        key:'P'},
      {p:'roadmap',     label:'Roadmap',            key:'M'},
      {p:'share',       label:'Share with Cowork',  key:'S'},
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

    // Links pill : live surfaces, collapsed behind one icon
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
    // Click head to toggle (but not when clicking menu items : they stopPropagation)
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
      <div class="orbit-hint">Tap a planet · Red Phone opens line · Sun returns home</div>
    `;
    document.body.appendChild(orbitRoot);
    orbitRoot.querySelectorAll('[data-go]').forEach(n => {
      n.addEventListener('click', () => {
        const t = n.dataset.go;
        if (t === 'redphone') {
          state.variant = 'cockpit'; save(state); applyVariant();
          persistState('active_view', 'cockpit', 'view_changed');
          openLine({ tag: { kind: 'redphone', label: 'Red Phone' }, seed: RED_PHONE });
        } else {
          state.variant = 'cockpit'; save(state); applyVariant();
          persistState('active_view', 'cockpit', 'view_changed');
          setPage(t);
        }
      });
    });
    orbitRoot.querySelectorAll('[data-bucket]').forEach(n => {
      n.addEventListener('click', () => {
        const key = n.dataset.bucket;
        state.variant = 'cockpit'; save(state); applyVariant();
        persistState('active_view', 'cockpit', 'view_changed');
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
      persistState('active_view', state.variant, 'view_changed');
    });
  });

  // --- Brand / logo → home
  const brandHome = document.getElementById('brandHome');
  if (brandHome) brandHome.addEventListener('click', () => setPage('today'));

  // --- Share with Cowork kit
  const SHARE_KIT = `Bodhi 360° · Command Center v2 : share kit
(Paste this into a new Cowork session so Cowork can see what's been built without screens.)

PURPOSE
A personal command center for a neurodivergent (AuDHD), non-dual operator running Harmonic (day job), LDAG, The Book of Oneness, Family, and Creative work in parallel. The center reduces cognitive load: every session starts with the Red Phone (one next action), brain dumps get routed, and tasks carry persistent context for the agent.

CORE PARADIGM · DIRECT LINE (v2)
v1 relied on copying prompts and pasting them into a new Cowork session every time. v2 replaces that with a Direct Line panel : a 440px conversational surface that slides in from the right. Every action (Red Phone, brain-dump bucket, key prompt, "Send to the line" from a task) opens this panel and queues a message into the chief-of-staff inbox. The chief of staff reads on its next run and replies in the same thread. No copying, no new sessions, one continuous conversation.

  • Message shape (in memory per session; Supabase \`direct_line_messages\` when the backend is live):
      { id, role: 'me'|'cos', kind, tag, text, ts, status: 'pending'|'routed'|'replied' }
  • kind values: redphone · brain_dump · prompt · task · launch · freeform
  • Panel persists across page changes. Close only via the explicit X or Escape.

  • Structured launch (when thread is empty) : three taps:
      · Next step on roadmap
      · I have an issue
      · High-level strategy (flagged for an Opus Chat session)

STRUCTURE
Sidebar (always visible in Cockpit view):
  • Brand (bodhi 360°) : clicking the logo returns to Home.
  • State picker : collapsed by default, shows the current mode (Go / Hold / Rest / Potato / Deep / Crashed / Work day). Click the pill to change state.
  • Navigate: Home · Today, Brain dump, Key prompts, Roadmap, Share with Cowork.
  • Live surfaces: LDAG dashboard, MIRROR ops, Book of Oneness.

Home (default page):
  • Red Phone : pinned at the top. "Open the line" opens the Direct Line panel seeded with the session-start message, tagged RED PHONE.
  • Today / This week tabs : inside one card. Check off (the small square) or click the row label to open the task drawer.

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
  • The one legitimate clipboard pattern : this kit. Cowork is a separate surface; this is how the Command Center describes itself to it.

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

VIEWS (Views button, bottom-right : hidden while the Direct Line panel is open)
  • Cockpit : the full two-column dashboard (default).
  • Altar : strips the sidebar down to a single horizontal pill strip (brand + State pill + Page pill + Links pill, each with a dropdown).
  • Orbit : planetary canvas. A cyan sun ("bodhi 360°", click = Home) sits at center with orbiting planets: Red Phone (opens the line with session opener), Harmonic / LDAG / bodhi360 (middle ring, open the line with brain-dump tag), Book of Oneness / Family / Creative (outer ring, same).

[ end share kit ]`;

  const shareBtn = document.getElementById('shareCopy');
  if (shareBtn) shareBtn.addEventListener('click', () => {
    copyWithFeedback(shareBtn, SHARE_KIT, 'Share kit · copied · paste into Cowork', 'Copied');
  });

  // ============================================================
  // SUPABASE INIT (Stage 1: load tasks)
  // ============================================================

  // Map a Supabase tasks row to the internal task object
  function formatTaskTs(isoString) {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/Los_Angeles',
        month: 'short',
        day: 'numeric',
      }).formatToParts(d);
      const get = t => (parts.find(p => p.type === t) || {}).value || '';
      return `${get('month')} ${get('day')}`;
    } catch { return ''; }
  }

  function rowToTask(row) {
    return {
      id:        row.id,
      label:     row.title,
      done:      row.done === true,
      focus:     false,
      meta:      row.bucket || 'SELF',
      notes:     '',  // loaded separately in Stage 3
      createdAt: row.created_at || null,
    };
  }

  async function initFromSupabase() {
    try {
      // Load portfolio state (energy, view, page, tab) before tasks so shell is correct
      const { data: ps, error: psErr } = await sb
        .from('portfolio_state')
        .select('energy_state, active_view, active_page, active_tab, sort_preference, bucket_filter')
        .eq('user_id', 'bodhi')
        .single();

      if (!psErr && ps) {
        if (ps.energy_state) state.mode    = ps.energy_state;
        if (ps.active_view)  state.variant = ps.active_view;
        if (ps.active_page && ps.active_page !== 'home')  state.page = ps.active_page;
        if (ps.active_tab)   state.tab     = ps.active_tab;
        renderStates();
        setPage(state.page);
        setTab(state.tab);
        applyVariant();
        // Restore sort preference
        if (ps.sort_preference) {
          taskFilter.sort = ps.sort_preference;
          if (taskSortToggle) {
            taskSortToggle.textContent = taskFilter.sort === 'oldest' ? 'Oldest first' : 'Newest first';
            taskSortToggle.dataset.sort = taskFilter.sort;
            taskSortToggle.classList.toggle('is-sort-active', taskFilter.sort === 'newest');
          }
        }
        // Restore bucket filter (null is valid -- empty canvas)
        bucketFilter = (ps.bucket_filter !== undefined) ? ps.bucket_filter : null;
        document.querySelectorAll('.bucket').forEach(x => x.classList.remove('is-active'));
        if (bucketFilter && bucketFilter !== 'ALL') {
          const tile = document.querySelector(`.bucket[data-bucket="${bucketFilter}"]`);
          if (tile) tile.classList.add('is-active');
        }
        syncAllBtn();
      }

      // Realtime: push CoS replies into the panel thread
      sb.channel('direct-line-responses-live')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'direct_line_responses',
        }, (payload) => {
          const resp = payload.new;
          if (!resp) return;
          // P5: append CoS bubble directly; toast if panel is closed
          const cosItem = { type: 'cos', id: resp.id, message_id: resp.message_id, agent: resp.agent, content: resp.content, created_at: resp.created_at };
          if (linePanel.classList.contains('is-open')) {
            lineThread.appendChild(buildCosBubble(cosItem));
            lineThread.scrollTop = lineThread.scrollHeight;
            lineEmpty.hidden = true;
            lineLaunch.hidden = true;
          } else {
            dlUnread++;
            updateBell();
            toastOk('Chief of Staff replied · open the line');
            fireCoSNotif(resp.content);
          }
        })
        .subscribe();

      // Realtime: reflect CoS-written energy_state changes immediately
      sb.channel('portfolio-state-live')
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'portfolio_state', filter: "user_id=eq.bodhi" },
          (payload) => {
            const ps = payload.new;
            if (!ps) return;
            if (ps.energy_state && ps.energy_state !== state.mode) {
              state.mode = ps.energy_state;
              renderStates();
              toast(`State updated · ${ps.energy_state}`);
            }
          })
        .subscribe();

      // Load all tasks for today and this week
      const { data: tasks, error } = await sb
        .from('tasks')
        .select('id, title, bucket, horizon, done, sort_order, created_at')
        .eq('user_id', 'bodhi')
        .in('horizon', ['today', 'week'])
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Guard: Supabase returns { data: [], error: null } when RLS blocks anon SELECT.
      // Without this guard, state.today and state.week get overwritten with [] and all
      // hardcoded defaults vanish silently about 1 second after load.
      if (!tasks || tasks.length === 0) {
        console.warn('[Supabase] tasks query returned 0 rows. RLS is likely blocking anon SELECT on the tasks table. Hardcoded defaults are preserved. Fix: run the RLS grant SQL in the Supabase dashboard for project gcbvvausrmbbkfazojpl.');
        setLineStatus(true);
      } else {
        state.today = tasks.filter(t => t.horizon === 'today').map(rowToTask);
        state.week  = tasks.filter(t => t.horizon === 'week').map(rowToTask);
        // Fetch subtasks for all loaded tasks in one request, build map
        const allTaskIds = tasks.map(t => t.id);
        if (allTaskIds.length > 0) {
          const { data: subs, error: subErr } = await sb
            .from('subtasks')
            .select('id, task_id, title, done, sort_order')
            .in('task_id', allTaskIds)
            .order('sort_order', { ascending: true });
          if (subErr) {
            console.warn('[Supabase] subtasks fetch failed:', subErr);
          } else if (subs) {
            subtaskMap = {};
            subs.forEach(s => {
              if (!subtaskMap[s.task_id]) subtaskMap[s.task_id] = [];
              subtaskMap[s.task_id].push(s);
            });
          }
        }
        ['today', 'week'].forEach(w => renderList(w));
        renderCounts();
        if (bucketFilter !== null) renderBucketsPage();
        setLineStatus(true);
      }

      // Realtime: re-render task lists when any task row changes
      sb.channel('tasks-live')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks', filter: "user_id=eq.bodhi" },
          async (payload) => {
            const updated = payload.new;
            if (!updated) return;
            // Patch the task in state rather than full re-fetch for speed
            const horizon = updated.horizon;
            const list = state[horizon];
            if (!list) return;
            const idx = list.findIndex(t => t.id === updated.id);
            const patched = rowToTask(updated);
            if (idx >= 0) {
              list[idx] = { ...list[idx], ...patched }; // preserve local notes
            } else {
              list.push(patched);
            }
            renderList(horizon);
            renderCounts();
          })
        .subscribe();

      // P5: load full conversation thread (all messages + responses, chronological)
      await loadConversationThread();

      // Log app_opened
      sb.from('interaction_log').insert({
        user_id: 'bodhi',
        event_type: 'app_opened',
        event_data: { view: state.variant, page: state.page, energy_state: state.mode },
      }).then(({ error: e }) => { if (e) console.warn('interaction_log write failed:', e); });

      document.body.classList.remove('is-loading');

    } catch (err) {
      console.error('Supabase init failed:', err);
      toastErr('Supabase: ' + (err.message || 'connection failed'));
      setLineStatus(false);
      document.body.classList.remove('is-loading');
    }
  }

  // ============================================================
  // BOOT
  // ============================================================
  // Apply loading state BEFORE renderList so hardcoded tasks are hidden during Supabase fetch
  document.body.classList.add('is-loading');
  renderStates();
  buildOrbit; teardownOrbit; // keep references live
  ['today','week'].forEach(w => { renderList(w); });
  renderCounts();
  setPage(state.page);
  setTab(state.tab);
  applyVariant();
  initFromSupabase();
