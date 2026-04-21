PHASE 4: Direct Line queue architecture

Files to edit: _command-center/v2-app.js and _command-center/v2-styles.css.

Do not touch index.html except where explicitly noted below. No em dashes. No localStorage anywhere.

What this phase wires:
- Task drawer "Send to the line" silently queues to Supabase without opening the panel
- Bucket cards and prompt cards keep opening the panel; panel send now writes to Supabase
- Panel open loads an "In the queue" summary from direct_line_messages where processed = false
- direct_line_responses realtime subscription pushes CoS replies into the panel thread
- "Clear" button in queue summary marks all unprocessed items as processed without sending

Schema reference:
direct_line_messages: id, user_id, content, kind, tag, processed (bool), created_at
direct_line_responses: id, message_id, agent, content, created_at
Both tables exist. Realtime is enabled on direct_line_responses.

---

CHANGE 1: Add queueToLine() helper

Add this function after the closeLine function in v2-app.js:

```
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
  if (error) { toastErr('Queue write failed'); return false; }
  toastOk('Queued · CoS picks this up when you open the line.');
  sb.from('interaction_log').insert({
    user_id: 'bodhi',
    event_type: 'message_queued',
    event_data: { kind, tag: tagValue, length: content.length },
  }).then(({ error: e }) => { if (e) console.warn('interaction_log write failed:', e); });
  return true;
}
```

---

CHANGE 2: Rewire task drawer "Send to the line"

The drawerCopy listener currently builds a text block and calls openLine(). Replace the entire listener with this async version:

```
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
```

Bucket card clicks and prompt card clicks keep their existing openLine() calls unchanged.

---

CHANGE 3: Make openLine() async and add loadQueueSummary() call

Replace the openLine function with this async version:

```
async function openLine(opts = {}) {
  linePanel.classList.add('is-open');
  document.body.classList.add('line-open');
  linePanel.setAttribute('aria-hidden', 'false');
  if (opts.tag) setTag(opts.tag);
  if (opts.seed !== undefined) lineInput.value = opts.seed;
  lineLaunch.hidden = state.line.messages.length > 0;
  renderThread();
  if (opts.seed && opts.seed.trim().length > 0) lineEmpty.hidden = true;
  await loadQueueSummary();
  setTimeout(() => lineInput.focus(), 180);
}
```

Add the loadQueueSummary function immediately after openLine:

```
async function loadQueueSummary() {
  document.getElementById('lineQueueSummary')?.remove();
  if (!sbLive) return;

  const { data: msgs, error } = await sb
    .from('direct_line_messages')
    .select('id, content, kind, created_at')
    .eq('user_id', 'bodhi')
    .eq('processed', false)
    .order('created_at', { ascending: true })
    .limit(50);

  if (error || !msgs || msgs.length === 0) return;

  const summary = document.createElement('div');
  summary.id = 'lineQueueSummary';
  summary.className = 'line-queue-summary';

  const hdr = document.createElement('div');
  hdr.className = 'lqs-header';
  hdr.innerHTML = `
    <span class="lqs-label">In the queue</span>
    <span class="lqs-count">${msgs.length}</span>
    <button type="button" class="lqs-clear">Clear</button>
  `;
  summary.appendChild(hdr);

  const list = document.createElement('div');
  list.className = 'lqs-list';
  msgs.forEach(m => {
    const item = document.createElement('div');
    item.className = 'lqs-item';
    const preview = (m.content || '').slice(0, 60) + ((m.content || '').length > 60 ? '...' : '');
    item.innerHTML = `<span class="lqs-kind">${escapeHtml(m.kind || 'freeform')}</span><span class="lqs-preview">${escapeHtml(preview)}</span>`;
    list.appendChild(item);
  });
  summary.appendChild(list);

  lineThread.insertBefore(summary, lineThread.firstChild);
  lineEmpty.hidden = true;

  hdr.querySelector('.lqs-clear').addEventListener('click', async () => {
    const ids = msgs.map(m => m.id);
    const { error: e } = await sb
      .from('direct_line_messages')
      .update({ processed: true })
      .in('id', ids)
      .eq('user_id', 'bodhi');
    if (e) { toastErr('Clear failed'); return; }
    summary.remove();
    lineEmpty.hidden = state.line.messages.length > 0;
    toastOk('Queue cleared');
    sb.from('interaction_log').insert({
      user_id: 'bodhi',
      event_type: 'queue_cleared',
      event_data: { count: ids.length },
    }).then(() => {});
  });
}
```

---

CHANGE 4: Make send() async and write to Supabase

Replace the send function with this async version:

```
async function send(text, kindOverride) {
  const t = (text || lineInput.value || '').trim();
  if (!t) return;
  const kind = kindOverride || (pendingTag?.kind ?? 'freeform');
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

  pushMessage({ text: t, kind, tag, status: 'pending' });
  lineInput.value = '';
  setTag(null);
  toastOk('Sent · Chief of Staff picks this up on next run.');

  sb.from('interaction_log').insert({
    user_id: 'bodhi',
    event_type: 'message_sent',
    event_data: { kind, tag: tagValue, length: t.length },
  }).then(({ error: e }) => { if (e) console.warn('interaction_log write failed:', e); });

  await loadQueueSummary();
}
```

The lineComposer submit listener and lineInput keydown listener do not need to change.

---

CHANGE 5: Add direct_line_responses realtime in initFromSupabase()

Inside the try block of initFromSupabase(), after the portfolio-state-live subscription, add:

```
sb.channel('direct-line-responses-live')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'direct_line_responses',
  }, (payload) => {
    const resp = payload.new;
    if (!resp) return;
    pushMessage({
      role: 'cos',
      kind: 'freeform',
      tag: null,
      text: resp.content,
      ts: new Date(resp.created_at).getTime(),
      status: 'replied',
    });
    if (!linePanel.classList.contains('is-open')) {
      toastOk('Chief of Staff replied · open the line');
    }
  })
  .subscribe();
```

---

CHANGE 6: Queue summary styles

Add to the end of v2-styles.css:

```
.line-queue-summary {
  margin: 0 0 0.75rem;
  padding: 0.6rem 0.75rem;
  border-radius: 8px;
  background: hsl(0 0% 100% / 0.04);
  border: 1px solid hsl(0 0% 100% / 0.08);
}
.lqs-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.4rem;
}
.lqs-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--t-3);
  flex: 1;
}
.lqs-count {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.55rem;
  color: var(--warn);
  background: hsl(40 90% 60% / 0.12);
  padding: 0.1rem 0.4rem;
  border-radius: 99px;
}
.lqs-clear {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.5rem;
  color: var(--t-3);
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0.1rem 0.3rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.lqs-clear:hover { color: var(--red); }
.lqs-item {
  display: flex;
  gap: 0.5rem;
  padding: 0.2rem 0;
  font-size: 0.55rem;
  line-height: 1.4;
}
.lqs-kind {
  font-family: 'JetBrains Mono', monospace;
  color: var(--cyan);
  white-space: nowrap;
  min-width: 5rem;
  text-transform: lowercase;
}
.lqs-preview { color: var(--t-2); }
```

---

DO NOT CHANGE:
- Tasks, notes, portfolio_state writes from Phases 2 and 3
- save = () => {} (stays as no-op placeholder)
- pushMessage() and renderThread()
- drawerDelete listener
- Orbit nav clicks
- Bucket card openLine() calls
- Prompt card openLine() calls

---

VERIFICATION (do in order, confirm each before the next):

1. Open task drawer, add a note, click the top "Send to the line" button. Drawer closes. Toast says "Queued." Panel does NOT open. Check direct_line_messages in Supabase: row exists with processed = false.

2. Click a bucket card (e.g. Harmonic). Panel opens. Type something. Hit Send. Check Supabase: new row in direct_line_messages. Toast says "Sent · Chief of Staff picks this up on next run."

3. Click Red Phone. Panel opens. Queue summary appears above the thread showing the item queued in step 1. Count badge is amber. Kind column shows "task".

4. Click Clear in the queue summary. Summary disappears. Check Supabase: that row's processed column is now true.

5. Insert a row directly into direct_line_responses via the Supabase dashboard with any content value. Within roughly one second, the panel thread shows a new CoS message without any page reload.
