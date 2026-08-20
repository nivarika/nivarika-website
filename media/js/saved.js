/* ============================================================
   Nivarika — saved items
   Loaded on every page (home and all four collections). Owns the
   "Saved" drawer that the header and bottom-nav buttons open, the
   badge counts on both, and the localStorage read/write. Product
   pages layer their own per-card heart button on top of this via
   window.NivarikaSaved (see store.js).
   ============================================================ */
(function () {
  'use strict';

  var STORAGE_KEY = 'nivarika:saved';

  var HEART_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true">' +
    '<path d="M12 20.4S3.6 14.9 3.6 9.2A4.7 4.7 0 0 1 12 6.4a4.7 4.7 0 0 1 8.4 2.8c0 5.7-8.4 11.2-8.4 11.2Z"/></svg>';

  function read() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      var parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      // Private-browsing modes can throw on both read and parse.
      return [];
    }
  }

  function write(list) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (error) {
      /* saving is a convenience, never block the UI on it */
    }
  }

  var items = read();
  var changeListeners = [];

  function isSaved(id) {
    return items.some(function (item) { return item.id === id; });
  }

  /* meta: {title, price, image, page}. Returns the new saved state. */
  function toggle(id, meta) {
    var nowSaved;
    if (isSaved(id)) {
      items = items.filter(function (item) { return item.id !== id; });
      nowSaved = false;
    } else {
      items.push(Object.assign({ id: id }, meta));
      nowSaved = true;
    }
    write(items);
    showToast(nowSaved ? 'Saved for later' : 'Removed from saved');
    afterChange(id, nowSaved);
    return nowSaved;
  }

  function afterChange(id, nowSaved) {
    syncBadges();
    renderDrawer();
    changeListeners.forEach(function (fn) { fn(id, nowSaved); });
  }

  /* ---------- toast -------------------------------------------- */

  var toast = document.createElement('div');
  toast.className = 'save-toast';
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  document.body.appendChild(toast);
  var toastTimer = null;

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('is-visible');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toast.classList.remove('is-visible');
    }, 1900);
  }

  /* ---------- badges ---------------------------------------------
     Every trigger button (desktop header, mobile bottom nav) wraps
     its icon in .nav-icon and carries a [data-saved-count] child;
     hidden natively via the `hidden` attribute when the count is 0. */

  function syncBadges() {
    var count = items.length;
    document.querySelectorAll('[data-saved-count]').forEach(function (badge) {
      badge.textContent = String(count);
      badge.hidden = count === 0;
    });
  }

  /* ---------- drawer ---------------------------------------------
     One drawer, built once and reused across every open/close. Its
     link targets encode the source page and product slug so a tap
     can jump straight back to that piece, even from another page. */

  var drawer = document.createElement('div');
  drawer.className = 'saved-drawer sheet-overlay';
  drawer.setAttribute('role', 'dialog');
  drawer.setAttribute('aria-modal', 'true');
  drawer.setAttribute('aria-label', 'Saved items');
  drawer.innerHTML =
    '<div class="sheet-panel">' +
      '<div class="saved-drawer-head">' +
        '<h2>Saved for Later</h2>' +
        '<button type="button" class="saved-drawer-close" aria-label="Close saved items">&times;</button>' +
      '</div>' +
      '<div class="saved-drawer-body"></div>' +
    '</div>';
  document.body.appendChild(drawer);
  var drawerBody = drawer.querySelector('.saved-drawer-body');

  function renderDrawer() {
    if (!items.length) {
      drawerBody.innerHTML =
        '<div class="saved-empty">' +
          '<h3>Nothing saved yet</h3>' +
          '<p>Tap the heart on any piece you love and it will keep here — even across our other collections.</p>' +
        '</div>';
      return;
    }
    drawerBody.innerHTML = items.map(function (item) {
      var parts = item.id.split('::');
      var page = parts[0], slug = parts[1] || '';
      var href = page + '.html#' + slug;
      return (
        '<div class="saved-item" data-id="' + escapeAttr(item.id) + '">' +
          '<a class="saved-item-link" href="' + escapeAttr(href) + '">' +
            '<img src="' + escapeAttr(item.image || '') + '" alt="">' +
            '<div class="saved-item-info">' +
              '<div class="tag">' + escapeHtml(prettyPage(page)) + '</div>' +
              '<h3>' + escapeHtml(item.title || '') + '</h3>' +
              (item.price ? '<div class="price">' + escapeHtml(item.price) + '</div>' : '') +
            '</div>' +
          '</a>' +
          '<button type="button" class="saved-item-remove" aria-label="Remove ' + escapeAttr(item.title || 'item') + ' from saved">&times;</button>' +
        '</div>'
      );
    }).join('');
  }

  function prettyPage(page) {
    var names = { glassware: 'Glassware', dinnerware: 'Dinnerware', bangles: 'Bangles', living: 'Living' };
    return names[page] || page;
  }
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function escapeAttr(s) { return escapeHtml(s); }

  drawerBody.addEventListener('click', function (event) {
    var removeBtn = event.target.closest('.saved-item-remove');
    if (!removeBtn) return;
    event.preventDefault();
    var row = removeBtn.closest('.saved-item');
    toggle(row.getAttribute('data-id'));
  });

  function openDrawer() {
    drawer.classList.add('is-open');
    document.body.classList.add('quick-view-open');
    drawer.querySelector('.saved-drawer-close').focus();
  }
  function closeDrawer() {
    drawer.classList.remove('is-open');
    document.body.classList.remove('quick-view-open');
  }
  drawer.addEventListener('click', function (event) {
    if (event.target === drawer || event.target.closest('.saved-drawer-close')) closeDrawer();
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && drawer.classList.contains('is-open')) closeDrawer();
  });

  document.querySelectorAll('[data-open-saved]').forEach(function (button) {
    button.setAttribute('aria-haspopup', 'dialog');
    button.addEventListener('click', function (event) {
      event.preventDefault();
      openDrawer();
    });
  });

  /* keep the badge / drawer in step if saved items change in another tab */
  window.addEventListener('storage', function (event) {
    if (event.key !== STORAGE_KEY) return;
    items = read();
    syncBadges();
    renderDrawer();
  });

  syncBadges();
  renderDrawer();

  /* ---------- gentle fade-in for product imagery ------------------ */

  document.querySelectorAll('.cat-media img, .prod-media img').forEach(function (img) {
    img.classList.add('fade-in');
    if (img.complete && img.naturalWidth > 0) {
      img.classList.add('is-loaded');
      return;
    }
    img.addEventListener('load', function () { img.classList.add('is-loaded'); }, { once: true });
  });

  window.NivarikaSaved = {
    isSaved: isSaved,
    toggle: toggle,
    list: function () { return items.slice(); },
    heartIcon: HEART_ICON,
    onChange: function (fn) { changeListeners.push(fn); }
  };
})();
