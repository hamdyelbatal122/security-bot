'use strict';

const { getHistory, subscribe } = require('./event-bus');

function safeJson(obj) {
  return JSON.stringify(obj).replace(/<\//g, '<\\/');
}

function getDashboardHTML(config) {
  const configJson = safeJson({
    connectUrl: config.connectUrl,
    publicConnectUrl: config.publicConnectUrl || '',
    appId: config.appId,
    port: config.port,
    webhookProxyUrl: config.webhookProxyUrl,
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Security Bot — Dashboard</title>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#0d1117;--surface:#161b22;--surface2:#1c2128;--border:#30363d;
  --text:#e6edf3;--muted:#7d8590;--blue:#58a6ff;--green:#3fb950;
  --red:#f85149;--orange:#d29922;--yellow:#e3b341;--radius:8px;
}
html,body{height:100%;background:var(--bg);color:var(--text);
  font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif;font-size:14px}

/* Header */
header{display:flex;align-items:center;justify-content:space-between;
  padding:0 24px;height:56px;background:var(--surface);
  border-bottom:1px solid var(--border);position:sticky;top:0;z-index:10}
.brand{font-size:16px;font-weight:600;display:flex;align-items:center;gap:10px;color:var(--text);text-decoration:none}
.brand-icon{color:var(--blue)}
.header-right{display:flex;align-items:center;gap:20px}
.status-pill{display:flex;align-items:center;gap:6px;font-size:13px;color:var(--muted)}
.status-dot{width:8px;height:8px;border-radius:50%;background:var(--green);
  box-shadow:0 0 6px var(--green);animation:pulse 2s ease-in-out infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
.uptime{font-size:12px;color:var(--muted);font-variant-numeric:tabular-nums}

/* Layout */
.layout{display:flex;height:calc(100vh - 56px);overflow:hidden}

/* Sidebar */
aside{width:300px;min-width:300px;background:var(--surface);
  border-right:1px solid var(--border);overflow-y:auto;
  padding:20px 16px;display:flex;flex-direction:column;gap:20px}
.sidebar-section h3{font-size:11px;font-weight:600;text-transform:uppercase;
  letter-spacing:.08em;color:var(--muted);margin-bottom:12px}

/* Connect card */
.connect-card{background:var(--surface2);border:1px solid var(--border);
  border-radius:var(--radius);padding:16px}
.connect-card p{color:var(--muted);font-size:12px;margin-bottom:12px;line-height:1.5}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;
  padding:8px 14px;border-radius:6px;border:1px solid;font-size:13px;font-weight:500;
  cursor:pointer;text-decoration:none;transition:opacity .15s;width:100%}
.btn:hover{opacity:.85}
.btn-primary{background:var(--blue);color:#0d1117;border-color:var(--blue)}
.btn-secondary{background:transparent;color:var(--text);border-color:var(--border);width:auto}
.url-section{margin-top:10px}
.url-label{font-size:11px;color:var(--muted);margin-bottom:4px}
.url-row{display:flex;gap:6px}
.url-input{flex:1;background:var(--bg);border:1px solid var(--border);border-radius:6px;
  padding:6px 8px;color:var(--muted);font-size:11px;
  font-family:'SFMono-Regular',Consolas,monospace;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.btn-copy{padding:5px 10px;font-size:11px;background:var(--surface2);
  border:1px solid var(--border);border-radius:6px;color:var(--text);
  cursor:pointer;white-space:nowrap;flex-shrink:0}
.btn-copy:hover{background:var(--border)}
.copy-ok{color:var(--green);font-size:11px;margin-top:4px;display:none}

/* Stats */
.stats-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.stat-card{background:var(--surface2);border:1px solid var(--border);
  border-radius:var(--radius);padding:12px 8px;text-align:center}
.stat-value{font-size:22px;font-weight:700;line-height:1;font-variant-numeric:tabular-nums}
.stat-label{font-size:11px;color:var(--muted);margin-top:4px}
.stat-card.c-total  .stat-value{color:var(--blue)}
.stat-card.c-critical .stat-value{color:var(--red)}
.stat-card.c-high   .stat-value{color:var(--orange)}
.stat-card.c-medium .stat-value{color:var(--yellow)}

/* Config */
.config-rows{display:flex;flex-direction:column;gap:8px}
.config-row{display:flex;justify-content:space-between;align-items:center;gap:8px}
.config-key{font-size:12px;color:var(--muted);flex-shrink:0}
.config-val{font-size:12px;font-family:'SFMono-Regular',Consolas,monospace;
  color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:160px;
  text-align:right}
.badge-online{background:rgba(63,185,80,.15);color:var(--green);
  border:1px solid rgba(63,185,80,.3);border-radius:20px;padding:2px 8px;
  font-size:11px;font-weight:500}

/* Main content */
main{flex:1;display:flex;flex-direction:column;overflow:hidden}
.toolbar{display:flex;align-items:center;justify-content:space-between;
  padding:12px 20px;border-bottom:1px solid var(--border);
  background:var(--surface);gap:12px;flex-wrap:wrap}
.toolbar-left{display:flex;align-items:center;gap:12px}
.toolbar h2{font-size:14px;font-weight:600}
.filter-tabs{display:flex;gap:4px}
.tab{padding:4px 12px;border-radius:20px;border:1px solid var(--border);
  background:transparent;color:var(--muted);font-size:12px;cursor:pointer;transition:all .15s}
.tab.active{background:var(--blue);color:#0d1117;border-color:var(--blue);font-weight:600}
.tab:hover:not(.active){background:var(--surface2);color:var(--text)}
.toolbar-right{display:flex;align-items:center;gap:8px}
.autoscroll-label{font-size:12px;color:var(--muted);display:flex;align-items:center;gap:6px;cursor:pointer}
input[type="checkbox"]{accent-color:var(--blue);cursor:pointer}

/* Feed */
#feed{flex:1;overflow-y:auto;padding:12px 20px;display:flex;flex-direction:column;gap:4px}
.event-item{display:flex;align-items:flex-start;gap:12px;
  padding:10px 14px;background:var(--surface);border:1px solid var(--border);
  border-radius:var(--radius);transition:border-color .15s}
.event-item:hover{border-color:#484f58}
.event-item.hidden{display:none}
.event-item.ev-error   {border-left:3px solid var(--red)}
.event-item.ev-critical{border-left:3px solid var(--red)}
.event-item.ev-high    {border-left:3px solid var(--orange)}
.event-item.ev-medium  {border-left:3px solid var(--yellow)}
.event-item.ev-success {border-left:3px solid var(--green)}
.event-time{font-size:11px;color:var(--muted);font-variant-numeric:tabular-nums;
  white-space:nowrap;min-width:56px;margin-top:2px}
.event-body{flex:1;min-width:0}
.event-type-row{display:flex;align-items:center;gap:8px;margin-bottom:4px}
.badge{padding:2px 7px;border-radius:20px;font-size:10px;font-weight:700;
  text-transform:uppercase;letter-spacing:.05em;white-space:nowrap}
.badge-scan    {background:rgba(88,166,255,.15);color:var(--blue);  border:1px solid rgba(88,166,255,.3)}
.badge-error   {background:rgba(248,81,73,.15); color:var(--red);   border:1px solid rgba(248,81,73,.3)}
.badge-push    {background:rgba(210,153,34,.15);color:var(--orange);border:1px solid rgba(210,153,34,.3)}
.badge-setup   {background:rgba(63,185,80,.15); color:var(--green); border:1px solid rgba(63,185,80,.3)}
.badge-info    {background:rgba(125,133,144,.15);color:var(--muted);border:1px solid rgba(125,133,144,.3)}
.sev-critical  {background:rgba(248,81,73,.15); color:var(--red);   border:1px solid rgba(248,81,73,.3)}
.sev-high      {background:rgba(210,153,34,.15);color:var(--orange);border:1px solid rgba(210,153,34,.3)}
.sev-medium    {background:rgba(227,179,65,.15);color:var(--yellow);border:1px solid rgba(227,179,65,.3)}
.event-title{font-size:13px;color:var(--text);line-height:1.4}
.event-detail{font-size:12px;color:var(--muted);margin-top:4px;line-height:1.5}
.mono{font-family:'SFMono-Regular',Consolas,monospace;background:var(--bg);
  border:1px solid var(--border);border-radius:4px;padding:1px 5px;font-size:11px;color:var(--text)}
.empty-state{display:flex;flex-direction:column;align-items:center;justify-content:center;
  height:100%;color:var(--muted);text-align:center;gap:10px}
.empty-state p{font-size:14px}
.empty-state small{font-size:12px}
#conn-banner{display:none;background:rgba(248,81,73,.1);border-bottom:1px solid rgba(248,81,73,.3);
  padding:8px 20px;font-size:12px;color:var(--red);text-align:center}
::-webkit-scrollbar{width:6px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:var(--border);border-radius:3px}
::-webkit-scrollbar-thumb:hover{background:#484f58}
</style>
</head>
<body>

<header>
  <a class="brand" href="/">
    <svg class="brand-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
    Security Bot
  </a>
  <div class="header-right">
    <div class="status-pill">
      <div class="status-dot" id="statusDot"></div>
      <span id="statusText">Connecting…</span>
    </div>
    <div class="uptime" id="uptime">—</div>
  </div>
</header>

<div id="conn-banner">Connection lost — reconnecting in 3s…</div>

<div class="layout">
  <aside>

    <div class="sidebar-section">
      <h3>Connect to GitHub</h3>
      <div class="connect-card">
        <p>Click below to create and install the GitHub App on your account. No manual variable copying required.</p>
        <button class="btn btn-primary" id="connectBtn" onclick="openConnect()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
          Connect GitHub Account
        </button>

        <div class="url-section">
          <div class="url-label">Local manifest URL</div>
          <div class="url-row">
            <input class="url-input" id="localUrlInput" readonly placeholder="Loading…">
            <button class="btn-copy" onclick="copyUrl('local')">Copy</button>
          </div>
          <div class="copy-ok" id="copyOk">Copied to clipboard</div>
        </div>

        <div class="url-section" id="publicSection" style="display:none">
          <div class="url-label">Shareable URL (for other users)</div>
          <div class="url-row">
            <input class="url-input" id="publicUrlInput" readonly>
            <button class="btn-copy" onclick="copyUrl('public')">Copy</button>
          </div>
        </div>
      </div>
    </div>

    <div class="sidebar-section">
      <h3>Statistics</h3>
      <div class="stats-grid">
        <div class="stat-card c-total">
          <div class="stat-value" id="statScans">0</div>
          <div class="stat-label">Scans</div>
        </div>
        <div class="stat-card">
          <div class="stat-value" id="statFindings" style="color:var(--text)">0</div>
          <div class="stat-label">Findings</div>
        </div>
        <div class="stat-card c-critical">
          <div class="stat-value" id="statCritical">0</div>
          <div class="stat-label">Critical</div>
        </div>
        <div class="stat-card c-high">
          <div class="stat-value" id="statHigh">0</div>
          <div class="stat-label">High</div>
        </div>
      </div>
    </div>

    <div class="sidebar-section">
      <h3>Configuration</h3>
      <div class="config-rows">
        <div class="config-row">
          <span class="config-key">Status</span>
          <span class="badge-online" id="cfgStatus">Online</span>
        </div>
        <div class="config-row">
          <span class="config-key">App ID</span>
          <span class="config-val" id="cfgAppId">—</span>
        </div>
        <div class="config-row">
          <span class="config-key">Port</span>
          <span class="config-val" id="cfgPort">—</span>
        </div>
        <div class="config-row">
          <span class="config-key">Webhook</span>
          <span class="config-val" id="cfgWebhook" title="">—</span>
        </div>
      </div>
    </div>

  </aside>

  <main>
    <div class="toolbar">
      <div class="toolbar-left">
        <h2>Live Event Feed</h2>
        <div class="filter-tabs">
          <button class="tab active" onclick="setFilter('all',this)">All</button>
          <button class="tab" onclick="setFilter('scan',this)">Scans</button>
          <button class="tab" onclick="setFilter('error',this)">Errors</button>
        </div>
      </div>
      <div class="toolbar-right">
        <label class="autoscroll-label">
          <input type="checkbox" id="autoScroll" checked> Auto-scroll
        </label>
        <button class="btn btn-secondary" onclick="clearFeed()">Clear</button>
      </div>
    </div>

    <div id="feed">
      <div class="empty-state" id="emptyState">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="color:var(--border)">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
        <p>Waiting for events</p>
        <small>Events appear here when the bot receives GitHub webhooks.</small>
      </div>
    </div>
  </main>
</div>

<script>
const CONFIG = ${configJson};
let activeFilter = 'all';
let startTime = Date.now();
let stats = { scans:0, findings:0, critical:0, high:0 };
let es = null;
let reconnectTimer = null;

window.addEventListener('DOMContentLoaded', () => {
  applyConfig(CONFIG);
  loadHistory();
  connectSSE();
  setInterval(updateUptime, 1000);
});

function applyConfig(cfg) {
  document.getElementById('cfgAppId').textContent  = cfg.appId        || '—';
  document.getElementById('cfgPort').textContent   = cfg.port         || '—';
  const wh = cfg.webhookProxyUrl || '—';
  const el = document.getElementById('cfgWebhook');
  el.textContent = wh; el.title = wh;
  if (cfg.connectUrl) {
    document.getElementById('localUrlInput').value = cfg.connectUrl;
    document.getElementById('connectBtn').disabled = false;
  }
  if (cfg.publicConnectUrl) {
    document.getElementById('publicSection').style.display = 'block';
    document.getElementById('publicUrlInput').value = cfg.publicConnectUrl;
  }
}

function updateUptime() {
  const s = Math.floor((Date.now() - startTime) / 1000);
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  const parts = [];
  if (h) parts.push(h + 'h');
  if (m || h) parts.push(m + 'm');
  parts.push(sec + 's');
  document.getElementById('uptime').textContent = 'uptime ' + parts.join(' ');
}

function connectSSE() {
  if (reconnectTimer) { clearTimeout(reconnectTimer); reconnectTimer = null; }
  if (es) { es.close(); es = null; }
  es = new EventSource('/api/events');
  es.onopen = () => {
    document.getElementById('conn-banner').style.display = 'none';
    document.getElementById('statusDot').style.cssText = 'background:var(--green);box-shadow:0 0 6px var(--green)';
    document.getElementById('statusText').textContent = 'Online';
  };
  es.onmessage = (e) => {
    try { handleEvent(JSON.parse(e.data)); } catch(ex) { console.error('Parse error', ex); }
  };
  es.onerror = () => {
    document.getElementById('conn-banner').style.display = 'block';
    document.getElementById('statusDot').style.cssText = 'background:var(--red);box-shadow:0 0 6px var(--red)';
    document.getElementById('statusText').textContent = 'Reconnecting…';
    es.close(); es = null;
    reconnectTimer = setTimeout(connectSSE, 3000);
  };
}

async function loadHistory() {
  try {
    const r = await fetch('/api/history');
    if (!r.ok) return;
    const events = await r.json();
    events.forEach(e => handleEvent(e, true));
  } catch(ex) { console.warn('Could not load history', ex); }
}

function handleEvent(event, fromHistory) {
  const { type, data, timestamp } = event;
  if (type === 'connected') return;
  incrementStats(type, data);
  const item = buildItem(type, data, timestamp);
  if (!item) return;
  const feed = document.getElementById('feed');
  const empty = document.getElementById('emptyState');
  if (empty) empty.remove();
  feed.appendChild(item);
  applyFilter(item, activeFilter);
  if (!fromHistory && document.getElementById('autoScroll').checked) {
    feed.scrollTop = feed.scrollHeight;
  }
}

function incrementStats(type, data) {
  if (type === 'scan.started') {
    document.getElementById('statScans').textContent = ++stats.scans;
  }
  if (type === 'scan.finding') {
    document.getElementById('statFindings').textContent = ++stats.findings;
    const sev = (data && data.severity || '').toUpperCase();
    if (sev === 'CRITICAL') document.getElementById('statCritical').textContent = ++stats.critical;
    if (sev === 'HIGH')     document.getElementById('statHigh').textContent     = ++stats.high;
  }
}

function buildItem(type, data, timestamp) {
  const div = document.createElement('div');
  const time = new Date(timestamp).toLocaleTimeString('en-US', { hour12:false });
  let badge = '', badgeCls = 'badge-info', title = '', detail = '', evCls = '', filterCls = 'other';

  if (type === 'bot.started') {
    badge = 'STARTED'; badgeCls = 'badge-setup'; evCls = 'ev-success';
    title = 'Security Bot started' + (data.version ? ' v' + esc(data.version) : '');
  } else if (type === 'scan.started') {
    badge = 'SCAN'; badgeCls = 'badge-scan'; filterCls = 'scan';
    title = 'Scanning PR #' + esc(data.pr) + ' in ' + esc(data.repo);
  } else if (type === 'scan.finding') {
    const sev = (data.severity || 'UNKNOWN').toUpperCase();
    badge = sev; filterCls = 'scan';
    badgeCls = sev === 'CRITICAL' ? 'sev-critical' : sev === 'HIGH' ? 'sev-high' : sev === 'MEDIUM' ? 'sev-medium' : 'badge-info';
    evCls = 'ev-' + sev.toLowerCase();
    title = '[' + esc(data.ruleId) + '] ' + esc(data.description);
    detail = '<span class="mono">' + esc(data.filename) + ':' + esc(data.line) + '</span>'
           + ' &mdash; <span class="mono">' + esc((data.code||'').substring(0,100)) + '</span>';
  } else if (type === 'scan.completed') {
    badge = 'DONE'; badgeCls = 'badge-scan'; filterCls = 'scan';
    evCls = data.count === 0 ? 'ev-success' : '';
    title = 'PR #' + esc(data.pr) + ' — ' + esc(data.count) + ' finding(s)';
    detail = data.count > 0
      ? 'Severity label applied: <span class="mono">' + esc(data.label) + '</span>'
      : 'No vulnerabilities detected.';
  } else if (type === 'scan.error') {
    badge = 'ERROR'; badgeCls = 'badge-error'; evCls = 'ev-error'; filterCls = 'error';
    title = 'Scan failed — PR #' + esc(data.pr || '?');
    detail = esc(data.message || 'Unknown error');
  } else if (type === 'push.scanned') {
    badge = 'PUSH'; badgeCls = 'badge-push'; filterCls = 'scan';
    title = 'Direct push scanned on ' + esc(data.repo);
    detail = esc(data.count) + ' finding(s) on branch <span class="mono">' + esc(data.branch) + '</span>';
  } else if (type === 'repo.setup') {
    badge = 'SETUP'; badgeCls = 'badge-setup'; evCls = 'ev-success';
    title = 'Repository configured: ' + esc(data.repo);
  } else {
    badge = type; title = JSON.stringify(data).substring(0, 120);
  }

  div.className = 'event-item ' + evCls;
  div.dataset.filter = filterCls;
  div.innerHTML =
    '<div class="event-time">' + time + '</div>'
    + '<div class="event-body">'
    +   '<div class="event-type-row"><span class="badge ' + badgeCls + '">' + badge + '</span></div>'
    +   '<div class="event-title">' + title + '</div>'
    +   (detail ? '<div class="event-detail">' + detail + '</div>' : '')
    + '</div>';
  return div;
}

function esc(v) {
  return String(v == null ? '' : v)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function setFilter(f, btn) {
  activeFilter = f;
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.event-item').forEach(item => applyFilter(item, f));
}

function applyFilter(item, f) {
  item.classList.toggle('hidden', f !== 'all' && item.dataset.filter !== f);
}

function clearFeed() {
  document.getElementById('feed').innerHTML =
    '<div class="empty-state" id="emptyState">'
    + '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="color:var(--border)"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>'
    + '<p>Waiting for events</p><small>Events appear here when the bot receives GitHub webhooks.</small>'
    + '</div>';
  stats = { scans:0, findings:0, critical:0, high:0 };
  ['statScans','statFindings','statCritical','statHigh'].forEach(id =>
    document.getElementById(id).textContent = '0');
}

function openConnect() {
  if (CONFIG.connectUrl) window.open(CONFIG.connectUrl, '_blank');
}

function copyUrl(type) {
  const id = type === 'public' ? 'publicUrlInput' : 'localUrlInput';
  const val = document.getElementById(id).value;
  const ok = document.getElementById('copyOk');
  navigator.clipboard.writeText(val).then(() => {
    ok.style.display = 'block';
    setTimeout(() => { ok.style.display = 'none'; }, 2000);
  }).catch(() => {
    document.getElementById(id).select();
    document.execCommand('copy');
  });
}
</script>
</body>
</html>`;
}

/**
 * Creates a Probot v14-compatible addHandler function for the dashboard.
 * The handler returns true when it handles the request, false to pass through.
 * @param {object} config
 * @returns {(req: import('http').IncomingMessage, res: import('http').ServerResponse) => Promise<boolean>}
 */
function createDashboardHandler(config) {
  return async function dashboardHandler(req, res) {
    if (req.method !== 'GET') return false;
    const path = (req.url || '/').split('?')[0];

    // ── Dashboard HTML ──────────────────────────────
    if (path === '/dashboard') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(getDashboardHTML(config));
      return true;
    }

    // ── Status JSON ────────────────────────────────
    if (path === '/api/status') {
      const body = JSON.stringify({
        status: 'online',
        uptime: Math.floor(process.uptime()),
        appId: config.appId,
        port: config.port,
        webhookProxyUrl: config.webhookProxyUrl,
        connectUrl: config.connectUrl,
        publicConnectUrl: config.publicConnectUrl || '',
      });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(body);
      return true;
    }

    // ── History JSON ───────────────────────────────
    if (path === '/api/history') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(getHistory()));
      return true;
    }

    // ── SSE live event stream ──────────────────────
    if (path === '/api/events') {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      });
      const welcome = JSON.stringify({ type: 'connected', data: {}, timestamp: new Date().toISOString() });
      res.write('data: ' + welcome + '\n\n');

      const unsubscribe = subscribe((event) => {
        try { res.write('data: ' + JSON.stringify(event) + '\n\n'); } catch { /* connection gone */ }
      });
      req.on('close', () => unsubscribe());

      // Return true — response stays open for SSE; Probot won't touch it again.
      return true;
    }

    return false;
  };
}

module.exports = { createDashboardHandler };
