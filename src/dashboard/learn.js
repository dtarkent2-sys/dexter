'use strict';

const { ARTICLES, CATEGORIES } = require('./knowledge-content');

function getLearnPageCSS() {
  return `
/* ── Learn page scoped styles ── */
#page-learn { max-width: 1200px; margin: 0 auto; padding: 24px; }

#page-learn .learn-progress-bar {
  background: var(--bg-surface); border: 1px solid var(--border); border-radius: 3px;
  padding: 14px 20px; margin-bottom: 20px; display: flex; align-items: center; gap: 16px;
}
#page-learn .learn-progress-text {
  font-family: var(--font-mono); font-size: 13px; color: var(--text-secondary); white-space: nowrap;
}
#page-learn .learn-progress-track {
  flex: 1; height: 6px; background: var(--border); border-radius: 3px; overflow: hidden;
}
#page-learn .learn-progress-fill {
  height: 100%; background: var(--accent); border-radius: 3px; transition: width 0.4s ease;
}

#page-learn .learn-controls {
  display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; align-items: center;
}
#page-learn .learn-search {
  flex: 1; min-width: 200px; padding: 8px 14px;
  background: var(--bg-surface); border: 1px solid var(--border); border-radius: 3px;
  color: var(--text); font-family: var(--font-body); font-size: 14px; outline: none;
}
#page-learn .learn-search:focus { border-color: var(--accent); }
#page-learn .learn-search::placeholder { color: var(--text-muted); }

#page-learn .cat-pills {
  display: flex; gap: 6px; flex-wrap: wrap;
}
#page-learn .cat-pill {
  padding: 6px 14px; border-radius: 16px; font-family: var(--font-body); font-size: 12px;
  font-weight: 600; background: var(--bg-surface); border: 1px solid var(--border);
  color: var(--text-secondary); cursor: pointer; transition: all 0.15s ease; white-space: nowrap;
}
#page-learn .cat-pill:hover { border-color: var(--accent); color: var(--text); }
#page-learn .cat-pill.active {
  background: var(--accent); border-color: var(--accent); color: #fff;
}

#page-learn .learn-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 16px;
}
@media (max-width: 768px) {
  #page-learn .learn-grid { grid-template-columns: 1fr; }
  #page-learn .learn-controls { flex-direction: column; }
  #page-learn .learn-search { min-width: auto; width: 100%; }
}

#page-learn .learn-card {
  background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px;
  padding: 20px; cursor: pointer; transition: border-color 0.15s ease, box-shadow 0.15s ease;
  position: relative;
}
#page-learn .learn-card:hover { border-color: var(--accent); box-shadow: 0 2px 12px rgba(251,191,36,0.08); }
#page-learn .learn-card.viewed { opacity: 0.85; }
#page-learn .learn-card.expanded { border-color: var(--accent); }

#page-learn .learn-card-header {
  display: flex; align-items: flex-start; gap: 12px; margin-bottom: 8px;
}
#page-learn .learn-card-icon {
  width: 36px; height: 36px; border-radius: 3px; display: flex; align-items: center; justify-content: center;
  background: rgba(251,191,36,0.1); color: var(--accent); flex-shrink: 0;
}
#page-learn .learn-card-title {
  font-family: var(--font-heading); font-size: 15px; font-weight: 600; color: var(--text); line-height: 1.3;
  flex: 1;
}
#page-learn .learn-card-check {
  position: absolute; top: 12px; right: 12px; color: var(--green, #22c55e); opacity: 0.7;
}

#page-learn .learn-badge {
  display: inline-block; padding: 2px 8px; border-radius: 4px; font-family: var(--font-mono);
  font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.03em;
  margin-bottom: 8px;
}
#page-learn .learn-badge.beginner { background: rgba(34,197,94,0.12); color: #22c55e; }
#page-learn .learn-badge.intermediate { background: rgba(251,191,36,0.12); color: #fbbf24; }
#page-learn .learn-badge.advanced { background: rgba(234,179,8,0.12); color: #eab308; }

#page-learn .learn-card-desc {
  font-family: var(--font-body); font-size: 13px; color: var(--text-muted); line-height: 1.5;
}

#page-learn .learn-article {
  margin-top: 16px; padding-top: 16px; border-top: 2px solid var(--accent);
  font-family: var(--font-body); font-size: 14px; color: var(--text-secondary); line-height: 1.7;
  display: none;
}
#page-learn .learn-card.expanded .learn-article { display: block; }

#page-learn .learn-article p { margin-bottom: 12px; }
#page-learn .learn-article strong { color: var(--text); font-weight: 600; }
#page-learn .learn-article ul { margin: 8px 0 12px 20px; }
#page-learn .learn-article li { margin-bottom: 4px; }

#page-learn .learn-tryit {
  display: inline-flex; align-items: center; gap: 6px; margin-top: 12px;
  padding: 8px 16px; background: var(--accent); color: #fff; border: none;
  border-radius: 3px; font-family: var(--font-heading); font-size: 13px;
  font-weight: 600; cursor: pointer; transition: opacity 0.15s;
}
#page-learn .learn-tryit:hover { opacity: 0.85; }

#page-learn .learn-empty {
  grid-column: 1 / -1; text-align: center; padding: 60px 20px;
  color: var(--text-muted); font-family: var(--font-body); font-size: 14px;
}
`;
}

function getLearnPageHTML() {
  return `
<div class="page" id="page-learn">
  <div class="page-header">
    <div><h2>SharkLearn&trade;</h2><div class="subtitle">GEX education & platform training</div></div>
  </div>
  <div class="learn-progress-bar">
    <span class="learn-progress-text" id="learnProgressText">0 of ${ARTICLES.length} completed</span>
    <div class="learn-progress-track"><div class="learn-progress-fill" id="learnProgressFill" style="width:0%"></div></div>
  </div>
  <div class="learn-controls">
    <input type="text" class="learn-search" id="learnSearch" placeholder="Search articles...">
    <div class="cat-pills" id="learnCatPills"></div>
  </div>
  <div class="learn-grid" id="learnGrid"></div>
</div>`;
}

function getLearnPageJS() {
  // Inline the articles and categories as JSON so client-side JS can use them
  const articlesJSON = JSON.stringify(ARTICLES);
  const categoriesJSON = JSON.stringify(CATEGORIES);

  return `
;(function() {
  var ARTICLES = ${articlesJSON};
  var CATEGORIES = ${categoriesJSON};
  var STORAGE_KEY = 'sq_learn_progress';
  var activeCategory = 'all';
  var expandedId = null;

  function getProgress() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch(e) { return {}; }
  }
  function setProgress(p) { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); }

  function markViewed(id) {
    var p = getProgress();
    if (!p[id]) { p[id] = Date.now(); setProgress(p); }
  }

  function updateProgressBar() {
    var p = getProgress();
    var viewed = ARTICLES.filter(function(a) { return p[a.id]; }).length;
    var pct = Math.round((viewed / ARTICLES.length) * 100);
    var txt = document.getElementById('learnProgressText');
    var fill = document.getElementById('learnProgressFill');
    if (txt) txt.textContent = viewed + ' of ' + ARTICLES.length + ' completed';
    if (fill) fill.style.width = pct + '%';
  }

  function formatContent(raw) {
    // Simple inline formatter: **bold**, paragraphs, bullet lists
    var html = '';
    var lines = raw.split('\\n');
    var inList = false;
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i].trim();
      if (!line) {
        if (inList) { html += '</ul>'; inList = false; }
        continue;
      }
      // Bold
      line = line.replace(/\\*\\*(.+?)\\*\\*/g, '<strong>$1</strong>');
      if (line.match(/^- /)) {
        if (!inList) { html += '<ul>'; inList = true; }
        html += '<li>' + line.slice(2) + '</li>';
      } else {
        if (inList) { html += '</ul>'; inList = false; }
        html += '<p>' + line + '</p>';
      }
    }
    if (inList) html += '</ul>';
    return html;
  }

  function renderCards() {
    var grid = document.getElementById('learnGrid');
    var search = (document.getElementById('learnSearch') || {}).value || '';
    search = search.toLowerCase().trim();
    var p = getProgress();

    var filtered = ARTICLES.filter(function(a) {
      if (activeCategory !== 'all' && a.category !== activeCategory) return false;
      if (search) {
        var hay = (a.title + ' ' + a.description + ' ' + a.content).toLowerCase();
        return hay.indexOf(search) !== -1;
      }
      return true;
    });

    if (!filtered.length) {
      grid.innerHTML = '<div class="learn-empty">No articles match your search.</div>';
      return;
    }

    var html = '';
    for (var i = 0; i < filtered.length; i++) {
      var a = filtered[i];
      var viewed = !!p[a.id];
      var expanded = expandedId === a.id;
      html += '<div class="learn-card' + (viewed ? ' viewed' : '') + (expanded ? ' expanded' : '') + '" data-id="' + a.id + '">';
      html += '<div class="learn-card-header">';
      html += '<div class="learn-card-icon"><i data-lucide="' + a.icon + '" style="width:20px;height:20px;"></i></div>';
      html += '<div class="learn-card-title">' + a.title + '</div>';
      html += '</div>';
      if (viewed) html += '<div class="learn-card-check"><i data-lucide="check-circle" style="width:16px;height:16px;"></i></div>';
      html += '<span class="learn-badge ' + a.difficulty + '">' + a.difficulty + '</span>';
      html += '<div class="learn-card-desc">' + a.description + '</div>';
      html += '<div class="learn-article">' + formatContent(a.content);
      if (a.tryItLink) {
        html += '<button class="learn-tryit" onclick="event.stopPropagation();nav(\\'' + a.tryItLink.hash + '\\')">';
        html += '<i data-lucide="external-link" style="width:14px;height:14px;"></i> ' + a.tryItLink.label + '</button>';
      }
      html += '</div></div>';
    }
    grid.innerHTML = html;

    // Re-init Lucide icons in the grid
    if (typeof lucide !== 'undefined') lucide.createIcons({ nodes: [grid] });

    // Bind click
    grid.querySelectorAll('.learn-card').forEach(function(card) {
      card.addEventListener('click', function() {
        var id = card.getAttribute('data-id');
        if (expandedId === id) {
          expandedId = null;
        } else {
          expandedId = id;
          markViewed(id);
          updateProgressBar();
        }
        renderCards();
      });
    });
  }

  function renderPills() {
    var container = document.getElementById('learnCatPills');
    if (!container) return;
    var html = '<button class="cat-pill' + (activeCategory === 'all' ? ' active' : '') + '" data-cat="all">All</button>';
    for (var i = 0; i < CATEGORIES.length; i++) {
      var c = CATEGORIES[i];
      html += '<button class="cat-pill' + (activeCategory === c.id ? ' active' : '') + '" data-cat="' + c.id + '">' + c.label + '</button>';
    }
    container.innerHTML = html;
    container.querySelectorAll('.cat-pill').forEach(function(pill) {
      pill.addEventListener('click', function() {
        activeCategory = pill.getAttribute('data-cat');
        expandedId = null;
        renderPills();
        renderCards();
      });
    });
  }

  SQ.learn = {
    init: function() {
      activeCategory = 'all';
      expandedId = null;
      updateProgressBar();
      renderPills();
      renderCards();
      var searchInput = document.getElementById('learnSearch');
      if (searchInput) {
        searchInput._handler = function() { expandedId = null; renderCards(); };
        searchInput.addEventListener('input', searchInput._handler);
      }
    },
    destroy: function() {
      var searchInput = document.getElementById('learnSearch');
      if (searchInput && searchInput._handler) {
        searchInput.removeEventListener('input', searchInput._handler);
        delete searchInput._handler;
      }
    }
  };
})();
`;
}

module.exports = { getLearnPageCSS, getLearnPageHTML, getLearnPageJS };
