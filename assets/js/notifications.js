/**
 * cert-quiz-hub 共通お知らせ機能
 *
 * 使い方:
 *   <script src="path/to/notifications.js"></script>
 *   <script>
 *     CertQuizNotifications.init('announcements.json', document.querySelector('.header-nav'));
 *   </script>
 *
 * announcements.json フォーマット:
 *   {
 *     "maxDisplay": 5,        // 最大表示件数
 *     "expiryDays": 30,       // 期限切れ日数（今日から何日前まで表示するか）
 *     "notices": [
 *       { "date": "yyyy/mm/dd", "content": "お知らせ内容" }
 *     ]
 *   }
 */
(function (global) {
  'use strict';

  var STYLE_ID = 'cert-quiz-nf-style';

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    var s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = [
      /* ---- 通知ボタン ---- */
      '.nf-btn {',
      '  position: relative;',
      '  display: inline-flex;',
      '  align-items: center;',
      '  gap: 5px;',
      '  color: rgba(255,255,255,0.85);',
      '  font-size: 0.78rem;',
      '  font-weight: 500;',
      '  background: transparent;',
      '  border: none;',
      '  cursor: pointer;',
      '  padding: 5px 10px;',
      '  border-radius: 6px;',
      '  transition: color 0.18s, background-color 0.18s;',
      '  white-space: nowrap;',
      '  font-family: inherit;',
      '}',
      '.nf-btn:hover { color: #fff; background: rgba(255,255,255,0.16); }',
      /* ---- バッジ ---- */
      '.nf-badge {',
      '  position: absolute;',
      '  top: 3px;',
      '  right: 5px;',
      '  background: #e53935;',
      '  color: #fff;',
      '  font-size: 0.55rem;',
      '  font-weight: 700;',
      '  min-width: 14px;',
      '  height: 14px;',
      '  border-radius: 999px;',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: center;',
      '  padding: 0 3px;',
      '  line-height: 1;',
      '  pointer-events: none;',
      '}',
      /* ---- モーダルオーバーレイ ---- */
      '.nf-modal {',
      '  display: none;',
      '  position: fixed;',
      '  z-index: 1200;',
      '  inset: 0;',
      '  background-color: rgba(0,0,0,0.55);',
      '  align-items: center;',
      '  justify-content: center;',
      '  padding: 1rem;',
      '}',
      '.nf-modal.show { display: flex; }',
      /* ---- モーダル本体 ---- */
      '.nf-modal-content {',
      '  background: #fff;',
      '  border-radius: 16px;',
      '  padding: 1.5rem;',
      '  max-width: 480px;',
      '  width: 100%;',
      '  position: relative;',
      '  box-shadow: 0 20px 50px rgba(0,0,0,0.3);',
      '  max-height: 80vh;',
      '  display: flex;',
      '  flex-direction: column;',
      '}',
      '.nf-modal-header {',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: space-between;',
      '  margin-bottom: 1rem;',
      '  padding-bottom: 0.75rem;',
      '  border-bottom: 1px solid #e2e5e9;',
      '  flex-shrink: 0;',
      '}',
      '.nf-modal-title {',
      '  font-size: 1rem;',
      '  font-weight: 700;',
      '  color: #1f2933;',
      '  margin: 0;',
      '  display: flex;',
      '  align-items: center;',
      '  gap: 6px;',
      '}',
      '.nf-modal-close {',
      '  width: 32px;',
      '  height: 32px;',
      '  border-radius: 50%;',
      '  border: 1px solid #e2e5e9;',
      '  background: #fff;',
      '  color: #6b7280;',
      '  font-size: 1.1rem;',
      '  line-height: 1;',
      '  cursor: pointer;',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: center;',
      '  transition: all 0.18s;',
      '  flex-shrink: 0;',
      '}',
      '.nf-modal-close:hover { color: #1f2933; border-color: #1f2933; }',
      /* ---- お知らせリスト ---- */
      '.nf-list { overflow-y: auto; flex: 1; }',
      '.nf-item {',
      '  padding: 0.75rem 0;',
      '  border-bottom: 1px solid #f0f2f4;',
      '}',
      '.nf-item:last-child { border-bottom: none; }',
      '.nf-item-date {',
      '  font-size: 0.75rem;',
      '  color: #6b7280;',
      '  margin-bottom: 4px;',
      '}',
      '.nf-item-content {',
      '  font-size: 0.9rem;',
      '  color: #1f2933;',
      '  line-height: 1.6;',
      '  white-space: pre-wrap;',
      '}'
    ].join('\n');
    document.head.appendChild(s);
  }

  function bellSVG() {
    return '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">'
      + '<path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2zm.995-14.901a1 1 0 1 0-1.99 0A5.002 5.002 0 0 0 3 6c0 1.098-.5 6-2 7h14c-1.5-1-2-5.902-2-7 0-2.42-1.72-4.44-4.005-4.901z"/>'
      + '</svg>';
  }

  function esc(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function parseDate(dateStr) {
    var p = String(dateStr).split('/');
    if (p.length !== 3) return null;
    var d = new Date(parseInt(p[0], 10), parseInt(p[1], 10) - 1, parseInt(p[2], 10));
    return isNaN(d.getTime()) ? null : d;
  }

  function filterNotices(data) {
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    var maxDisplay = parseInt(data.maxDisplay, 10) || 5;
    var expiryDays = parseInt(data.expiryDays, 10) || 30;

    var list = (data.notices || []).filter(function (n) {
      var d = parseDate(n.date);
      if (!d) return false;
      var diff = (today - d) / 86400000;
      return diff >= 0 && diff <= expiryDays;
    });

    list.sort(function (a, b) { return b.date.localeCompare(a.date); });
    return list.slice(0, maxDisplay);
  }

  function renderNotificationIcon(mountEl, notices) {
    injectStyles();

    /* --- ベルボタン --- */
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'nf-btn';
    btn.setAttribute('aria-label', 'お知らせ ' + notices.length + '件');
    btn.setAttribute('aria-haspopup', 'dialog');
    btn.innerHTML = bellSVG() + 'お知らせ';

    var badge = document.createElement('span');
    badge.className = 'nf-badge';
    badge.setAttribute('aria-hidden', 'true');
    badge.textContent = notices.length > 9 ? '9+' : String(notices.length);
    btn.appendChild(badge);

    mountEl.appendChild(btn);

    /* --- モーダル --- */
    var modal = document.createElement('div');
    modal.className = 'nf-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'nf-modal-title');

    var listHtml = notices.map(function (n) {
      return '<div class="nf-item">'
        + '<div class="nf-item-date">' + esc(n.date) + '</div>'
        + '<div class="nf-item-content">' + esc(n.content) + '</div>'
        + '</div>';
    }).join('');

    modal.innerHTML = '<div class="nf-modal-content">'
      + '<div class="nf-modal-header">'
      + '<p id="nf-modal-title" class="nf-modal-title">' + bellSVG() + 'お知らせ</p>'
      + '<button type="button" class="nf-modal-close" aria-label="閉じる">&times;</button>'
      + '</div>'
      + '<div class="nf-list">' + listHtml + '</div>'
      + '</div>';

    document.body.appendChild(modal);

    var closeBtn = modal.querySelector('.nf-modal-close');

    function openModal() { modal.classList.add('show'); closeBtn.focus(); }
    function closeModal() { modal.classList.remove('show'); btn.focus(); }

    btn.addEventListener('click', openModal);
    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', function (e) {
      if (e.target === modal) closeModal();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal.classList.contains('show')) closeModal();
    });
  }

  /**
   * お知らせ機能を初期化する
   * @param {string}          jsonPath - announcements.json へのパス（ページからの相対パス）
   * @param {Element|string}  mountEl  - ベルボタンを追加する親要素、またはCSSセレクタ
   */
  function init(jsonPath, mountEl) {
    if (typeof mountEl === 'string') {
      mountEl = document.querySelector(mountEl);
    }
    if (!mountEl) return;

    fetch(jsonPath)
      .then(function (res) {
        if (!res.ok) return null;
        return res.json();
      })
      .catch(function () { return null; })
      .then(function (data) {
        if (!data) return;
        var notices = filterNotices(data);
        if (notices.length === 0) return;
        renderNotificationIcon(mountEl, notices);
      });
  }

  global.CertQuizNotifications = { init: init };

})(window);
