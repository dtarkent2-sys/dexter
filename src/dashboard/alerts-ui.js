function getAlertsCSS() {
  return `
  #toast-container {
    position: fixed; bottom: 20px; right: 20px; z-index: 10000;
    display: flex; flex-direction: column-reverse; gap: 8px;
    max-height: 60vh; overflow: hidden; pointer-events: none;
  }
  .toast {
    pointer-events: auto;
    background: var(--glass); border: 1px solid var(--glass-border); border-radius: 3px;
    padding: 12px 16px; min-width: 320px; max-width: 420px;
    display: flex; align-items: flex-start; gap: 10px;
    animation: toastIn 0.3s ease; cursor: pointer;
    transition: opacity 0.3s, transform 0.3s;
    backdrop-filter: blur(12px);
  }
  .toast.dismissing { opacity: 0; transform: translateX(100px); }
  .toast-icon { flex-shrink: 0; width: 20px; height: 20px; margin-top: 1px; }
  .toast-icon.high { color: var(--red); }
  .toast-icon.medium { color: var(--yellow); }
  .toast-icon.low { color: var(--accent); }
  .toast-body { flex: 1; }
  .toast-title { font-size: 0.85rem; font-weight: 600; color: var(--text); margin-bottom: 2px; }
  .toast-msg { font-size: 0.8rem; color: var(--text-muted); }
  .toast-time { font-size: 0.7rem; color: var(--text-muted); font-family: var(--font-mono); margin-top: 4px; }
  .toast-close { flex-shrink: 0; background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 16px; padding: 0 4px; }
  .toast-close:hover { color: var(--text); }
  @keyframes toastIn { from { opacity: 0; transform: translateX(100px); } to { opacity: 1; transform: translateX(0); } }

  .alert-bell { position: relative; cursor: pointer; padding: 4px; display: inline-block; }
  .alert-bell-badge {
    position: absolute; top: -2px; right: -4px;
    background: var(--red); color: #fff; font-size: 0.65rem; font-weight: 700;
    min-width: 16px; height: 16px; border-radius: 8px;
    display: none; align-items: center; justify-content: center; padding: 0 4px;
  }
  .alert-bell-badge.visible { display: flex; }

  #alert-panel {
    position: fixed; top: 0; right: -400px; width: 380px; height: 100vh;
    background: rgba(10,15,28,0.95); border-left: 1px solid var(--glass-border);
    z-index: 9999; transition: right 0.3s ease; overflow-y: auto; padding: 20px;
    backdrop-filter: blur(16px);
  }
  #alert-panel.open { right: 0; }
  #alert-panel-overlay {
    position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
    background: rgba(0,0,0,0.4); z-index: 9998; display: none;
  }
  #alert-panel-overlay.open { display: block; }
  .alert-panel-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
  .alert-panel-header h3 { font-size: 1rem; color: var(--text); font-family: var(--font-heading); }
  .alert-panel-mark-read { background: none; border: 1px solid var(--border); color: var(--text-muted); padding: 4px 10px; border-radius: 4px; font-size: 0.75rem; cursor: pointer; }
  .alert-panel-mark-read:hover { border-color: var(--accent); color: var(--accent); }
  .alert-item {
    padding: 10px 0; border-bottom: 1px solid var(--border);
    display: flex; gap: 10px; align-items: flex-start; cursor: pointer;
  }
  .alert-item:hover { background: rgba(251,191,36,0.04); }
  .alert-item-icon { flex-shrink: 0; width: 18px; height: 18px; margin-top: 2px; }
  .alert-item-text { flex: 1; }
  .alert-item-msg { font-size: 0.85rem; color: var(--text); }
  .alert-item-time { font-size: 0.7rem; color: var(--text-muted); font-family: var(--font-mono); margin-top: 2px; }
  .alert-empty { color: var(--text-muted); font-size: 0.85rem; text-align: center; padding: 40px 0; }
  `;
}

function getAlertsHTML() {
  return `
  <div id="toast-container"></div>
  <div id="alert-panel-overlay" onclick="SQ.alerts.closePanel()"></div>
  <div id="alert-panel">
    <div class="alert-panel-header">
      <h3>Alerts</h3>
      <button class="alert-panel-mark-read" onclick="SQ.alerts.markAllRead()">Mark all read</button>
    </div>
    <div id="alert-panel-list"><div class="alert-empty">No alerts yet</div></div>
  </div>
  `;
}

function getAlertsJS() {
  return `
;(function() {
  var unreadCount = 0;
  var alertList = [];
  var DISMISS_MS = 8000;
  var readTs = parseInt(localStorage.getItem('sq-alerts-read') || '0', 10);

  SQ.alerts = {
    init: function() {
      SQ.socket.on('alert:gex', function(alert) {
        SQ.alerts.showToast(alert);
        SQ.alerts.addToHistory(alert);
      });
      SQ.alerts.loadHistory();
    },

    showToast: function(alert) {
      var container = document.getElementById('toast-container');
      var toast = document.createElement('div');
      toast.className = 'toast';
      var iconClass = alert.severity === 'high' ? 'high' : alert.severity === 'medium' ? 'medium' : 'low';
      toast.innerHTML = '<div class="toast-icon ' + iconClass + '"><i data-lucide="alert-triangle" style="width:20px;height:20px;"></i></div>'
        + '<div class="toast-body"><div class="toast-title">' + (alert.ticker || 'Alert') + '</div>'
        + '<div class="toast-msg">' + alert.message + '</div>'
        + '<div class="toast-time">' + new Date(alert.timestamp).toLocaleTimeString() + '</div></div>'
        + '<button class="toast-close">&times;</button>';
      toast.querySelector('.toast-close').onclick = function(e) {
        e.stopPropagation();
        toast.classList.add('dismissing');
        setTimeout(function() { toast.remove(); }, 300);
      };
      toast.onclick = function() { nav('gex'); };
      container.appendChild(toast);
      if (typeof lucide !== 'undefined') lucide.createIcons({ nodes: [toast] });
      setTimeout(function() {
        toast.classList.add('dismissing');
        setTimeout(function() { toast.remove(); }, 300);
      }, DISMISS_MS);
    },

    addToHistory: function(alert) {
      alertList.unshift(alert);
      if (alertList.length > 50) alertList.pop();
      unreadCount++;
      SQ.alerts.updateBadge();
    },

    loadHistory: function() {
      fetch('/api/alerts').then(function(r) { return r.json(); }).then(function(data) {
        alertList = data.alerts || [];
        unreadCount = alertList.filter(function(a) { return new Date(a.timestamp).getTime() > readTs; }).length;
        SQ.alerts.updateBadge();
        SQ.alerts.renderPanel();
      }).catch(function(e) {});
    },

    updateBadge: function() {
      var badge = document.getElementById('alert-bell-badge');
      if (!badge) return;
      if (unreadCount > 0) {
        badge.textContent = unreadCount > 99 ? '99+' : String(unreadCount);
        badge.classList.add('visible');
      } else {
        badge.classList.remove('visible');
      }
    },

    togglePanel: function() {
      var panel = document.getElementById('alert-panel');
      var overlay = document.getElementById('alert-panel-overlay');
      var isOpen = panel.classList.contains('open');
      if (isOpen) {
        panel.classList.remove('open');
        overlay.classList.remove('open');
      } else {
        panel.classList.add('open');
        overlay.classList.add('open');
        SQ.alerts.renderPanel();
      }
    },

    closePanel: function() {
      document.getElementById('alert-panel').classList.remove('open');
      document.getElementById('alert-panel-overlay').classList.remove('open');
    },

    renderPanel: function() {
      var list = document.getElementById('alert-panel-list');
      if (!alertList.length) { list.innerHTML = '<div class="alert-empty">No alerts yet</div>'; return; }
      var html = '';
      alertList.forEach(function(a) {
        var iconColor = a.severity === 'high' ? 'var(--red)' : a.severity === 'medium' ? 'var(--yellow)' : 'var(--accent)';
        html += '<div class="alert-item" onclick="SQ.alerts.closePanel();nav(&apos;gex&apos;)">';
        html += '<div class="alert-item-icon" style="color:' + iconColor + '"><i data-lucide="alert-triangle" style="width:18px;height:18px;"></i></div>';
        html += '<div class="alert-item-text"><div class="alert-item-msg">' + a.message + '</div>';
        html += '<div class="alert-item-time">' + new Date(a.timestamp).toLocaleString() + '</div></div></div>';
      });
      list.innerHTML = html;
      if (typeof lucide !== 'undefined') lucide.createIcons({ nodes: [list] });
    },

    markAllRead: function() {
      readTs = Date.now();
      localStorage.setItem('sq-alerts-read', String(readTs));
      unreadCount = 0;
      SQ.alerts.updateBadge();
      fetch('/api/alerts/read', { method: 'POST' }).catch(function(e) {});
    },

    destroy: function() {}
  };
})();
  `;
}

module.exports = { getAlertsCSS, getAlertsHTML, getAlertsJS };
