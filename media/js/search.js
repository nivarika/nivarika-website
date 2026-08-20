/* ============================================================
   Nivarika — search
   Loaded on every page. Owns a small embedded index of every
   product across the four collections (there's no backend to query,
   so the index is generated once from the live product markup — see
   the search skill note in CLAUDE-free repos: keep this in step with
   the collection pages if products are added or renamed) plus the
   overlay that lets a shopper find a piece without knowing which
   collection it lives in.

   Shares its modal chrome (.sheet-overlay / .sheet-panel) with the
   saved-items drawer in saved.js, rather than each maintaining its
   own near-identical set of backdrop/sheet/animation rules.
   ============================================================ */
(function () {
  'use strict';

  var PRODUCTS = [
    {page:'glassware',slug:'champagne-flute-set-of-6',title:'Champagne Flute — Set of 6',sub:'Mouth-blown Crystal',price:'₹2,399',priceWas:'₹2,999',category:'Flutes',stock:'in',image:'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=600&q=80&auto=format&fit=crop'},
    {page:'glassware',slug:'whiskey-tumblers-set-of-4',title:'Whiskey Tumblers — Set of 4',sub:'Hand-cut Crystal',price:'₹1,899',priceWas:'₹2,249',category:'Tumblers',stock:'in',image:'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=600&q=80&auto=format&fit=crop'},
    {page:'glassware',slug:'etched-crystal-decanter',title:'Etched Crystal Decanter',sub:'750ml, Hand-etched',price:'₹3,299',priceWas:'₹4,399',category:'Decanters',stock:'out',image:'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=600&q=80&auto=format&fit=crop'},
    {page:'glassware',slug:'martini-coupe-set',title:'Martini & Coupe Set',sub:'Set of 4, Gold Rim',price:'₹2,799',priceWas:'₹3,199',category:'Barware Sets',stock:'in',image:'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=600&q=80&auto=format&fit=crop'},
    {page:'glassware',slug:'highball-glasses-set-of-6',title:'Highball Glasses — Set of 6',sub:'Everyday Crystal',price:'₹1,599',priceWas:'₹1,799',category:'Tumblers',stock:'low',image:'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=600&q=80&auto=format&fit=crop'},
    {page:'glassware',slug:'complete-barware-set-16pc',title:'Complete Barware Set — 16pc',sub:'Flutes, Tumblers & Decanter',price:'₹6,499',priceWas:'₹8,199',category:'Barware Sets',stock:'in',image:'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=600&q=80&auto=format&fit=crop'},
    {page:'dinnerware',slug:'dinner-plate-set-6pc',title:'Dinner Plate Set — 6pc',sub:'Gold-rimmed Porcelain',price:'₹4,250',priceWas:'₹5,000',category:'Plates',stock:'in',image:'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=600&q=80&auto=format&fit=crop'},
    {page:'dinnerware',slug:'side-plates-set-of-6',title:'Side Plates — Set of 6',sub:'Bone China',price:'₹2,199',priceWas:'₹2,749',category:'Plates',stock:'in',image:'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=600&q=80&auto=format&fit=crop'},
    {page:'dinnerware',slug:'serving-bowls-set-of-3',title:'Serving Bowls — Set of 3',sub:'Hand-glazed Ceramic',price:'₹2,899',priceWas:'₹3,499',category:'Bowls',stock:'low',image:'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=600&q=80&auto=format&fit=crop'},
    {page:'dinnerware',slug:'gold-cutlery-24pc',title:'Gold Cutlery — 24pc',sub:'Stainless, PVD Gold',price:'₹3,599',priceWas:'₹4,199',category:'Cutlery',stock:'out',image:'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=600&q=80&auto=format&fit=crop'},
    {page:'dinnerware',slug:'charger-plates-set-of-6',title:'Charger Plates — Set of 6',sub:'Antique Gold Edge',price:'₹3,150',priceWas:'₹3,499',category:'Plates',stock:'in',image:'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=600&q=80&auto=format&fit=crop'},
    {page:'dinnerware',slug:'complete-dining-set-32pc',title:'Complete Dining Set — 32pc',sub:'Plates, Bowls & Cups',price:'₹8,999',priceWas:'₹11,499',category:'Full Sets',stock:'in',image:'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=600&q=80&auto=format&fit=crop'},
    {page:'bangles',slug:'kundan-stack-set-of-6',title:'Kundan Stack — Set of 6',sub:'Hand-set Stones',price:'₹1,749',priceWas:'₹2,499',category:'Kundan',stock:'in',image:'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&q=80&auto=format&fit=crop'},
    {page:'bangles',slug:'temple-gold-pair',title:'Temple Gold Pair',sub:'Antique Finish',price:'₹2,199',priceWas:'₹2,749',category:'Temple Gold',stock:'in',image:'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=600&q=80&auto=format&fit=crop'},
    {page:'bangles',slug:'meenakari-trio',title:'Meenakari Trio',sub:'Hand-painted Enamel',price:'₹1,499',priceWas:'₹1,999',category:'Meenakari',stock:'low',image:'https://images.unsplash.com/photo-1599459183200-59c7687a0275?w=600&q=80&auto=format&fit=crop'},
    {page:'bangles',slug:'bridal-chuda-set',title:'Bridal Chuda Set',sub:'Full Arm, 24 Pieces',price:'₹5,999',priceWas:'₹7,499',category:'Bridal Sets',stock:'out',image:'https://images.unsplash.com/photo-1620656798579-1984d9e87df7?w=600&q=80&auto=format&fit=crop'},
    {page:'bangles',slug:'everyday-slim-set-4pc',title:'Everyday Slim Set — 4pc',sub:'Lightweight Gold Plate',price:'₹999',priceWas:'₹1,199',category:'Gold Basics',stock:'in',image:'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&q=80&auto=format&fit=crop'},
    {page:'bangles',slug:'statement-kada',title:'Statement Kada',sub:'Solid Broad Cuff',price:'₹2,899',priceWas:'₹3,299',category:'Gold Basics',stock:'in',image:'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=600&q=80&auto=format&fit=crop'},
    {page:'living',slug:'hexagon-lantern',title:'Hexagon Lantern',sub:'Brass & Glass',price:'₹1,890',priceWas:'₹2,100',category:'Lanterns',stock:'in',image:'https://images.unsplash.com/photo-1589669590415-92f731d6d892?w=600&q=80&auto=format&fit=crop'},
    {page:'living',slug:'taper-candle-holders-set-of-3',title:'Taper Candle Holders — Set of 3',sub:'Antique Brass',price:'₹1,499',priceWas:'₹1,749',category:'Candle Holders',stock:'in',image:'https://images.unsplash.com/photo-1589669590415-92f731d6d892?w=600&q=80&auto=format&fit=crop'},
    {page:'living',slug:'hammered-gold-vase',title:'Hammered Gold Vase',sub:'Hand-hammered Metal',price:'₹2,299',priceWas:'₹2,599',category:'Vases',stock:'low',image:'https://images.unsplash.com/photo-1589669590415-92f731d6d892?w=600&q=80&auto=format&fit=crop'},
    {page:'living',slug:'round-serving-tray',title:'Round Serving Tray',sub:'Gold-plated Brass',price:'₹1,999',priceWas:'₹2,499',category:'Trays',stock:'in',image:'https://images.unsplash.com/photo-1589669590415-92f731d6d892?w=600&q=80&auto=format&fit=crop'},
    {page:'living',slug:'sunburst-wall-mirror',title:'Sunburst Wall Mirror',sub:'Hand-forged Brass',price:'₹3,499',priceWas:'₹3,999',category:'Wall Decor',stock:'out',image:'https://images.unsplash.com/photo-1589669590415-92f731d6d892?w=600&q=80&auto=format&fit=crop'},
    {page:'living',slug:'festive-decor-bundle-5pc',title:'Festive Decor Bundle — 5pc',sub:'Lanterns, Vase & Tray',price:'₹5,499',priceWas:'₹6,999',category:'Bundles',stock:'in',image:'https://images.unsplash.com/photo-1589669590415-92f731d6d892?w=600&q=80&auto=format&fit=crop'}
  ];

  var PAGE_NAMES = { glassware: 'Glassware', dinnerware: 'Dinnerware', bangles: 'Bangles', living: 'Living' };

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function matches(product, query) {
    var haystack = (product.title + ' ' + product.sub + ' ' + product.category + ' ' + PAGE_NAMES[product.page]).toLowerCase();
    return query.split(/\s+/).filter(Boolean).every(function (word) {
      return haystack.indexOf(word) !== -1;
    });
  }

  /* ---------- overlay ------------------------------------------- */

  var overlay = document.createElement('div');
  overlay.className = 'search-overlay sheet-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Search products');
  overlay.innerHTML =
    '<div class="sheet-panel search-panel">' +
      '<div class="search-head">' +
        '<svg class="search-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2"/><line x1="21" y1="21" x2="16.2" y2="16.2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>' +
        '<input type="search" class="search-input" placeholder="Search glassware, bangles, décor…" aria-label="Search products" autocomplete="off">' +
        '<button type="button" class="search-close" aria-label="Close search">&times;</button>' +
      '</div>' +
      '<div class="search-results"></div>' +
    '</div>';
  document.body.appendChild(overlay);

  var input = overlay.querySelector('.search-input');
  var results = overlay.querySelector('.search-results');

  function renderResults(query) {
    var q = query.trim().toLowerCase();

    if (!q) {
      results.innerHTML =
        '<div class="search-empty">' +
          '<h3>Search the whole atelier</h3>' +
          '<p>Try “kundan”, “decanter”, or “gold vase” — every collection is included.</p>' +
        '</div>';
      return;
    }

    var found = PRODUCTS.filter(function (p) { return matches(p, q); });

    if (!found.length) {
      results.innerHTML =
        '<div class="search-empty">' +
          '<h3>No pieces match “' + escapeHtml(query.trim()) + '”</h3>' +
          '<p>Try a different word, or browse by collection from the menu.</p>' +
        '</div>';
      return;
    }

    results.innerHTML = found.map(function (p) {
      return (
        '<a class="search-result" href="' + p.page + '.html#' + p.slug + '">' +
          '<img src="' + escapeHtml(p.image) + '" alt="" loading="lazy">' +
          '<div class="search-result-info">' +
            '<div class="tag">' + escapeHtml(PAGE_NAMES[p.page]) + (p.stock === 'out' ? ' · Sold out' : '') + '</div>' +
            '<h3>' + escapeHtml(p.title) + '</h3>' +
            '<div class="price">' + escapeHtml(p.price) + '</div>' +
          '</div>' +
        '</a>'
      );
    }).join('');
  }

  input.addEventListener('input', function () { renderResults(input.value); });

  function openOverlay() {
    overlay.classList.add('is-open');
    document.body.classList.add('quick-view-open');
    renderResults(input.value);
    window.setTimeout(function () { input.focus(); }, 50);
  }
  function closeOverlay() {
    overlay.classList.remove('is-open');
    document.body.classList.remove('quick-view-open');
  }

  overlay.addEventListener('click', function (event) {
    if (event.target === overlay || event.target.closest('.search-close')) closeOverlay();
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && overlay.classList.contains('is-open')) closeOverlay();
  });
  document.querySelectorAll('[data-open-search]').forEach(function (button) {
    button.setAttribute('aria-haspopup', 'dialog');
    button.addEventListener('click', function (event) {
      event.preventDefault();
      openOverlay();
    });
  });

  renderResults('');
})();
