/* ============================================================
   Nivarika — collection page behaviour
   Runs after saved.js (window.NivarikaSaved must exist) and after
   the page's own inline script has built the quick-view sheet.

   Responsibilities:
     • Per-card save button, delegating state to NivarikaSaved
     • Stock states driven by data-stock="out" | "low"
     • Category filter, sold-out pieces sorted to the end
     • Sticky filter row height + deep-link highlight from the
       saved drawer ("glassware.html#some-slug")
   ============================================================ */
(function () {
  'use strict';

  var Saved = window.NivarikaSaved;
  var grid = document.querySelector('.prod-grid');
  if (!grid || !Saved) return;

  var cards = Array.prototype.slice.call(grid.querySelectorAll('.prod-card'));
  var pageKey = (location.pathname.split('/').pop() || 'index.html').replace(/\.html?$/, '');

  var BELL = '<svg viewBox="0 0 24 24" aria-hidden="true">' +
    '<path d="M12 2.6a5.6 5.6 0 0 0-5.6 5.6v3l-1.6 3.1a.8.8 0 0 0 .7 1.2h13a.8.8 0 0 0 .7-1.2l-1.6-3.1v-3A5.6 5.6 0 0 0 12 2.6Zm0 18.8a2.6 2.6 0 0 0 2.5-2h-5a2.6 2.6 0 0 0 2.5 2Z"/></svg>';

  function productId(card) {
    var title = card.querySelector('h3').textContent.trim().toLowerCase();
    return pageKey + '::' + title.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  function syncSaveButton(button, id) {
    var on = Saved.isSaved(id);
    button.classList.toggle('is-saved', on);
    button.setAttribute('aria-pressed', String(on));
    var text = on ? 'Remove from saved items' : 'Save for later';
    button.setAttribute('title', text);
    button.setAttribute('aria-label', text);
  }

  /* ---------- per-card setup --------------------------------- */

  cards.forEach(function (card) {
    var id = productId(card);
    var stock = card.getAttribute('data-stock') || 'in';
    var media = card.querySelector('.prod-media');
    var info = card.querySelector('.prod-info');
    var enquire = card.querySelector('.enquire-btn');

    card.dataset.productId = id;
    card.dataset.stockState = stock;

    /* stock treatment */
    // Every card gets a stock-line — even well-stocked ones get an empty,
    // fixed-height placeholder — so one card's "Only a few left" (or a
    // sold-out message) can never push its price row out of alignment
    // with the rest of the row.
    var stockLine = document.createElement('div');
    var stockText = document.createElement('span');
    if (stock === 'out') {
      card.classList.add('is-sold-out');
      stockLine.className = 'stock-line is-out';
      stockText.textContent = 'Sold out — ask for restock';

      var tag = document.createElement('span');
      tag.className = 'sold-out-tag';
      tag.textContent = 'Sold Out';
      media.appendChild(tag);

      if (enquire) {
        enquire.classList.add('is-notify');
        enquire.innerHTML = BELL + '<span class="enquire-label">Notify me</span>';
        enquire.setAttribute('title', 'Ask us to notify you when this is back in stock');
        enquire.setAttribute('aria-label', 'Ask us to notify you when this is back in stock');
      }
    } else if (stock === 'low') {
      stockLine.className = 'stock-line is-low';
      stockText.textContent = 'Only a few left';
    } else {
      stockLine.className = 'stock-line is-empty';
      stockText.textContent = ' ';
    }
    stockLine.appendChild(stockText);
    info.appendChild(stockLine);

    if (stock !== 'out' && enquire && !enquire.querySelector('.enquire-label')) {
      var label = document.createElement('span');
      label.className = 'enquire-label';
      label.textContent = 'Chat';
      enquire.appendChild(label);
    }

    /* save for later */
    var saveButton = document.createElement('button');
    saveButton.type = 'button';
    saveButton.className = 'save-btn';
    saveButton.innerHTML = Saved.heartIcon;
    syncSaveButton(saveButton, id);

    saveButton.addEventListener('click', function (event) {
      // the whole .prod-media opens the quick view; keep that from firing
      event.stopPropagation();
      event.preventDefault();
      var img = card.querySelector('.prod-media img');
      Saved.toggle(id, {
        title: card.querySelector('h3').textContent.trim(),
        price: card.querySelector('.price-now') ? card.querySelector('.price-now').textContent.trim() : '',
        image: img ? (img.currentSrc || img.src) : '',
        page: pageKey
      });
    });

    media.appendChild(saveButton);
  });

  Saved.onChange(function () {
    cards.forEach(function (card) {
      var button = card.querySelector('.save-btn');
      if (button) syncSaveButton(button, card.dataset.productId);
    });
    syncQuickViewSave();
  });

  /* Sold-out pieces stay browsable but drop to the end of the grid. */
  cards.filter(function (card) { return card.dataset.stockState === 'out'; })
    .forEach(function (card) { grid.appendChild(card); });

  /* ---------- category filter --------------------------------- */

  document.querySelectorAll('.filter-pill').forEach(function (pill) {
    pill.addEventListener('click', function () {
      document.querySelectorAll('.filter-pill').forEach(function (p) { p.classList.remove('active'); });
      pill.classList.add('active');
      var filter = pill.getAttribute('data-filter');
      cards.forEach(function (card) {
        var cat = card.getAttribute('data-category');
        card.style.display = (filter === 'All' || cat === filter) ? '' : 'none';
      });
    });
  });

  /* ---------- sticky filter row -------------------------------- */

  var header = document.querySelector('header.main');
  function setHeaderHeight() {
    if (header) document.documentElement.style.setProperty('--header-h', header.offsetHeight + 'px');
  }
  setHeaderHeight();
  window.addEventListener('resize', setHeaderHeight);

  /* ---------- deep link from the saved drawer -------------------- */

  function highlightFromHash() {
    var slug = location.hash.slice(1);
    if (!slug) return;
    var card = cards.filter(function (c) { return c.dataset.productId === pageKey + '::' + slug; })[0];
    if (!card) return;
    window.setTimeout(function () {
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      card.classList.add('is-highlighted');
      window.setTimeout(function () { card.classList.remove('is-highlighted'); }, 1900);
    }, 60);
  }
  highlightFromHash();
  window.addEventListener('hashchange', highlightFromHash);

  /* ---------- quick view ------------------------------------- */

  var quickView = document.querySelector('.product-quick-view');
  var quickViewSave = null;

  if (quickView) {
    quickViewSave = document.createElement('button');
    quickViewSave.type = 'button';
    quickViewSave.className = 'quick-view-save';
    quickViewSave.innerHTML = Saved.heartIcon + '<span>Save for later</span>';
    quickView.querySelector('.quick-view-actions').prepend(quickViewSave);

    quickViewSave.addEventListener('click', function () {
      var card = currentQuickViewCard();
      if (!card) return;
      var id = card.dataset.productId;
      var img = card.querySelector('.prod-media img');
      Saved.toggle(id, {
        title: card.querySelector('h3').textContent.trim(),
        price: card.querySelector('.price-now') ? card.querySelector('.price-now').textContent.trim() : '',
        image: img ? (img.currentSrc || img.src) : '',
        page: pageKey
      });
    });

    // The sheet is repopulated in place, so watch it rather than
    // reaching into the page's own quick-view function.
    new MutationObserver(syncQuickViewSave).observe(quickView, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['class']
    });
  }

  function currentQuickViewCard() {
    var titleNode = quickView && quickView.querySelector('.quick-view-title');
    if (!titleNode) return null;
    var title = titleNode.textContent.trim();
    return cards.filter(function (card) {
      return card.querySelector('h3').textContent.trim() === title;
    })[0] || null;
  }

  function syncQuickViewSave() {
    if (!quickViewSave) return;
    var card = currentQuickViewCard();
    if (!card) return;
    var on = Saved.isSaved(card.dataset.productId);
    if (quickViewSave.classList.contains('is-saved') === on) return;
    quickViewSave.classList.toggle('is-saved', on);
    quickViewSave.setAttribute('aria-pressed', String(on));
    quickViewSave.querySelector('span').textContent = on ? 'Saved for later' : 'Save for later';
  }
})();
