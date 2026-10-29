(function () {
  'use strict';

  var D = window.BB_DATA;
  var ART = window.BB_ART;
  var CFG = window.BB_CONFIG;
  var CART_KEY = 'bb-cart';
  var THEME_KEY = 'bb-theme';
  var REVIEWS_KEY = 'bb-reviews';

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function money(n) { return 'Rs. ' + Math.round(n).toLocaleString('en-US'); }
  function loadJSON(key, fallback) {
    try { var raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; } catch (e) { return fallback; }
  }
  function saveJSON(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { }
  }
  function getProduct(id) { return D.products.filter(function (p) { return p.id === id; })[0]; }
  function getCategory(slug) { return D.categories.filter(function (c) { return c.slug === slug; })[0]; }
  function findIn(list, id) { return (list || []).filter(function (x) { return x.id === id; })[0]; }
  function fmtDate(d) {
    return new Date(d + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }
  function badgeLabel(b) { return b === 'Sale' ? 'On Sale' : b === 'Seasonal' ? 'Seasonal Special' : b; }
  var IN_HTML = document.body.getAttribute('data-page') !== 'home';
  var ROOT = IN_HTML ? '../' : '';
  function L(name) { return (name === 'index.html' ? ROOT : (IN_HTML ? '' : 'html/')) + name; }
  function pageLink(to) {
    if (!to || to === '/') return L('index.html');
    var m = to.match(/^\/category\/(.+)$/);
    if (m) return L(m[1] + '.html');
    return L(to.replace(/^\//, '') + '.html');
  }

  var ICONS = {
    bag: '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>',
    moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    menu: '<path d="M4 12h16M4 6h16M4 18h16"/>',
    plus: '<path d="M5 12h14M12 5v14"/>',
    minus: '<path d="M5 12h14"/>',
    trash: '<path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"/>',
    search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
    down: '<path d="m6 9 6 6 6-6"/>',
    left: '<path d="m15 18-6-6 6-6"/>',
    right: '<path d="m9 18 6-6-6-6"/>',
    pause: '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>',
    play: '<polygon points="6 3 20 12 6 21 6 3"/>',
    mail: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
    phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>',
    pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
    clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    calendar: '<rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
    check: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/>',
    sliders: '<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>',
    instagram: '<rect width="20" height="20" x="2" y="2" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><path d="M17.5 6.5h.01"/>',
    facebook: '<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>',
    whatsapp: '<path d="M3 21l1.65-4.9A9 9 0 1 1 8 19.4L3 21z"/><path d="M9 10c0 3 2 5 5 5l1.2-1.2a.8.8 0 0 0 0-1.1l-1.3-.9a.8.8 0 0 0-1 .1l-.5.5a3.5 3.5 0 0 1-1.8-1.8l.5-.5a.8.8 0 0 0 .1-1l-.9-1.3a.8.8 0 0 0-1.1 0z"/>',
    sparkles: '<path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/>',
    leaf: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>',
    award: '<circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>',
    heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
    building: '<path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4M10 10h4M10 14h4M10 18h4"/>',
    store: '<path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/>',
    landmark: '<path d="M3 22h18M6 18v-7M10 18v-7M14 18v-7M18 18v-7M12 2 3 7v2h18V7Z"/>',
    bike: '<circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/>',
    locate: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/><path d="M22 12h-4M6 12H2M12 6V2M12 22v-4"/>',
    arrow: '<path d="M5 12h14M12 5l7 7-7 7"/>',
    hand: '<path d="M18 11V6a2 2 0 0 0-4 0M14 10V4a2 2 0 0 0-4 0v2M10 10.5V6a2 2 0 0 0-4 0v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>'
  };
  function ic(name, size, cls) {
    size = size || 20;
    return '<svg class="ic ' + (cls || '') + '" viewBox="0 0 24 24" width="' + size + '" height="' + size +
      '" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' +
      (ICONS[name] || '') + '</svg>';
  }

  function art(type, size, cls) {
    return '<svg viewBox="0 0 120 120" width="' + size + '" height="' + size + '" class="' + (cls || '') +
      '" aria-hidden="true" focusable="false">' + (ART[type] || ART.cake) + '</svg>';
  }
  var TINTS = {
    cake: ['#FBE9EC', '#F3DDE0'], cupcake: ['#FBE9EC', '#F6D3D9'], pastry: ['#FFF1D8', '#F3DDB8'],
    cookie: ['#FFF1D8', '#F1D9B5'], tart: ['#FDEFE0', '#F3DDC3'], croissant: ['#FFF3DF', '#F0DAB0'],
    bread: ['#FFF3DF', '#EBD3A6'], donut: ['#FBE9EC', '#EFD0D6'], pizza: ['#FFF1D8', '#F2D7B0'],
    hotdrink: ['#F6E7DD', '#E9CFBE'], colddrink: ['#EAF3F5', '#D5E7EC'], coffee: ['#F6E7DD', '#E5CDB8'],
    tea: ['#F3F0E1', '#E3DDC0'], mug: ['#F8F3EC', '#EBDDCB'], bag: ['#F8F3EC', '#EBDDCB'],
    glass: ['#EEF4F6', '#DCE8EC'], tray: ['#F8F3EC', '#EBDDCB'], interior: ['#FDF0E3', '#F1DDC6'],
    process: ['#FFF3DF', '#F0DAB0'], seasonal: ['#FBE9EC', '#F1D2D8']
  };
  var CAMERA = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13" r="3.6"/></svg>';
  function pictureBox(icon, name, size, photoPath, focus) {
    var t = TINTS[icon] || TINTS.cake;
    var photo = (photoPath && CFG.usePhotos)
      ? '<img class="pi-photo" src="' + esc(photoPath) + '"' + (focus ? ' style="object-position:' + esc(focus) + '"' : '') + ' alt="' + esc(name) + '" loading="lazy" decoding="async" onload="this.classList.add(\'is-loaded\')">' : '';
    var label = size === 'thumb' ? '' : '<small>Photo coming soon</small>';
    return '<div class="product-image product-image-' + size + '" style="background:linear-gradient(145deg,' + t[0] + ',' + t[1] + ')">' +
      '<span class="pi-empty" aria-hidden="true">' + CAMERA + label + '</span>' + photo + '</div>';
  }
  function photoSrc(group, key) {
    var m = (window.BB_PHOTOS && window.BB_PHOTOS[group]) || {};
    var n = m[key] ? String(m[key]).trim() : '';
    return ROOT + 'images/' + group + '/' + (n ? encodeURIComponent(n).replace(/%2F/g, '/') : key + '.jpg');
  }
  function photoFocus(group, key) { var f = window.BB_FOCUS && window.BB_FOCUS[group]; return (f && f[key]) || ''; }
  function productPicture(p, size) { return pictureBox(p.icon, p.name, size, photoSrc('products', p.id), photoFocus('products', p.id)); }
  function categoryPicture(c, px) {
    var photo = CFG.usePhotos ? '<img class="cat-photo" src="' + esc(photoSrc('categories', c.slug)) + '"' + (photoFocus('categories', c.slug) ? ' style="object-position:' + esc(photoFocus('categories', c.slug)) + '"' : '') + ' alt="" loading="lazy" decoding="async" onload="this.classList.add(\'is-loaded\')">' : '';
    return '<span class="category-art"><span class="cat-empty" aria-hidden="true">' + CAMERA + '</span>' + photo + '</span>';
  }
  document.addEventListener('error', function (e) {
    var c = e.target && e.target.classList;
    if (c && (c.contains('pi-photo') || c.contains('av-photo') || c.contains('cat-photo') || c.contains('hero-poster'))) e.target.remove();
  }, true);

 function stars(value, size) {
  var v = Math.max(0, Math.min(5, Number(value) || 0));
  var px = size || 16;
  var out = '<span class="stars" role="img" aria-label="Rated ' + (Math.round(v * 10) / 10) + ' out of 5">';
  for (var n = 1; n <= 5; n++) {

    var fill = Math.max(0, Math.min(1, v - (n - 1)));
    out += '<span class="star-wrap" style="width:' + px + 'px;height:' + px + 'px">' +
             ic('star', px, 'star') +
             '<span class="star-fill" style="width:' + (fill * 100) + '%">' +
               ic('star', px, 'star on') +
             '</span>' +
           '</span>';
  }
  return out + '</span>';
}

  function currentTheme() { return document.documentElement.classList.contains('dark') ? 'dark' : 'light'; }
  function applyTheme(theme) {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    try { localStorage.setItem(THEME_KEY, theme); } catch (e) { }
    var btn = $('[data-theme-toggle]');
    if (btn) {
      btn.innerHTML = ic(theme === 'dark' ? 'sun' : 'moon', 20);
      btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
      btn.title = theme === 'dark' ? 'Light mode' : 'Dark mode';
    }
  }

  var cart = loadJSON(CART_KEY, []).filter(function (i) { return i && getProduct(i.id) && i.qty > 0; });

  function unitPrice(product, o) {
    o = o || {};
    var cfg = D.customOptions[product.custom];
    var price = product.price;
    if (cfg) {
      var size = findIn(cfg.sizes, o.size);
      if (size) price = Math.round(price * size.mult);
      var flavor = findIn(cfg.flavors, o.flavor);
      if (flavor) price += flavor.price;
      (o.decorations || []).forEach(function (id) { var d = findIn(cfg.decorations, id); if (d) price += d.price; });
      (o.toppings || []).forEach(function (id) { var t = findIn(cfg.toppings, id); if (t) price += t.price; });
    }
    return price;
  }
  function validateOptions(product, o) {
    var errors = {};
    var cfg = D.customOptions[product.custom];
    if (!cfg) return errors;
    if (cfg.sizes && !o.size) errors.size = 'Please choose a size.';
    if (cfg.frostings && !o.frosting) errors.frosting = 'Please choose a frosting.';
    if (cfg.flavors && !o.flavor) errors.flavor = 'Please choose a flavour.';
    return errors;
  }
  function describeOptions(product, o) {
    var cfg = D.customOptions[product.custom];
    var lines = [];
    if (!cfg) return lines;
    var size = findIn(cfg.sizes, o.size); if (size) lines.push('Size: ' + size.label);
    var fr = findIn(cfg.frostings, o.frosting); if (fr) lines.push('Frosting: ' + fr.label);
    var fl = findIn(cfg.flavors, o.flavor); if (fl) lines.push('Flavour: ' + fl.label);
    var decos = (o.decorations || []).map(function (id) { var d = findIn(cfg.decorations, id); return d && d.label; }).filter(Boolean);
    if (decos.length) lines.push('Decorations: ' + decos.join(', '));
    var tops = (o.toppings || []).map(function (id) { var t = findIn(cfg.toppings, id); return t && t.label; }).filter(Boolean);
    if (tops.length) lines.push('Extra toppings: ' + tops.join(', '));
    if (o.message) lines.push('Message: "' + o.message + '"');
    if (o.note) lines.push('Note: ' + o.note);
    return lines;
  }
  function lineKey(id, o) {
    return id + '|' + JSON.stringify({
      size: o.size || '', frosting: o.frosting || '', flavor: o.flavor || '',
      decorations: (o.decorations || []).slice().sort(), toppings: (o.toppings || []).slice().sort(),
      message: (o.message || '').trim(), note: (o.note || '').trim()
    });
  }
  function applyOffers() {
    var units = { pastries: [], cookies: [], coffee: [] }, list = [];
    var cakeOff = 0, pizzaOff = 0;
    cart.forEach(function (item) {
      var p = getProduct(item.id); if (!p) return;
      var unit = unitPrice(p, item.options), o = item.options || {};
      if (p.cat === 'cakes' && (o.size === '8in' || o.size === '10in')) cakeOff += Math.round(unit * item.qty * 0.15);
      if (p.cat === 'pizza' && o.size === 'large') pizzaOff += Math.round(unit * item.qty * 0.10);
      if (units[p.cat]) for (var i = 0; i < item.qty; i++) units[p.cat].push(unit);
    });
    if (cakeOff) list.push({ label: 'Celebration Cake Deal (15% off)', amount: cakeOff });
    var pa = units.pastries.slice().sort(function (a, b) { return b - a; });
    var pairUnits = pa.slice(0, Math.floor(pa.length / 2) * 2);
    var pairOff = Math.round(pairUnits.reduce(function (s, x) { return s + x; }, 0) * 0.10);
    if (pairOff) list.push({ label: 'Pastry Pair (10% off)', amount: pairOff });
    var combos = Math.min(units.coffee.length, units.cookies.length);
    var ck = units.cookies.slice().sort(function (a, b) { return a - b; }).slice(0, combos);
    var comboOff = Math.round(ck.reduce(function (s, x) { return s + x; }, 0) * 0.20);
    if (comboOff) list.push({ label: 'Coffee & Cookie Combo (20% off cookie)', amount: comboOff });
    if (pizzaOff) list.push({ label: 'Pizza Night Special (10% off large)', amount: pizzaOff });
    var hints = [];
    if (units.pastries.length % 2 === 1) hints.push('Add one more pastry to get 10% off the pair.');
    if (units.coffee.length > units.cookies.length) hints.push('Add a cookie to your coffee for 20% off the cookie.');
    else if (units.cookies.length > units.coffee.length) hints.push('Add a coffee to get 20% off your cookie.');
    return { list: list, hints: hints };
  }
  function totals() {
    var subtotal = 0, count = 0;
    cart.forEach(function (item) {
      var p = getProduct(item.id);
      if (!p) return;
      subtotal += unitPrice(p, item.options) * item.qty;
      count += item.qty;
    });
    var offers = applyOffers();
    var discount = offers.list.reduce(function (s, d) { return s + d.amount; }, 0);
    var after = subtotal - discount;
    var delivery = subtotal === 0 ? 0 : after >= CFG.freeDeliveryAt ? 0 : CFG.deliveryFee;
    return { subtotal: subtotal, discounts: offers.list, hints: offers.hints, discount: discount, after: after, delivery: delivery, total: after + delivery, count: count };
  }
  function saveCart() { saveJSON(CART_KEY, cart); renderCartUI(); }
  function addItem(id, options, qty) {
    options = options || {};
    var key = lineKey(id, options);
    var existing = cart.filter(function (i) { return i.key === key; })[0];
    if (existing) existing.qty = Math.min(99, existing.qty + qty);
    else cart.push({ key: key, id: id, options: options, qty: qty });
    saveCart();
  }
  function setQty(key, qty) {
    if (qty < 1) return removeItem(key);
    cart.forEach(function (i) { if (i.key === key) i.qty = Math.min(99, qty); });
    saveCart();
  }
  function removeItem(key) { cart = cart.filter(function (i) { return i.key !== key; }); saveCart(); }
  function clearCart() { cart = []; saveCart(); }

  function cartLineHtml(item) {
    var p = getProduct(item.id);
    if (!p) return '';
    var unit = unitPrice(p, item.options);
    var details = describeOptions(p, item.options);
    return '<li class="cart-line">' +
      '<div class="cl-thumb">' + productPicture(p, 'thumb') + '</div>' +
      '<div class="cl-main"><div class="cl-top"><h3 class="cl-name">' + esc(p.name) + '</h3>' +
      '<button type="button" class="cl-remove" data-remove="' + esc(item.key) + '" aria-label="Remove ' + esc(p.name) + '">' + ic('trash', 16) + '</button></div>' +
      (details.length ? '<ul class="cl-details">' + details.map(function (d) { return '<li>' + esc(d) + '</li>'; }).join('') + '</ul>' : '') +
      '<div class="cl-bottom"><div class="qty-ctrl qty-sm" role="group" aria-label="Quantity of ' + esc(p.name) + '">' +
      '<button type="button" data-qty="' + esc(item.key) + '" data-delta="-1" aria-label="Decrease quantity">' + ic('minus', 14) + '</button>' +
      '<span>' + item.qty + '</span>' +
      '<button type="button" data-qty="' + esc(item.key) + '" data-delta="1" aria-label="Increase quantity">' + ic('plus', 14) + '</button></div>' +
      '<div class="cl-price"><strong>' + money(unit * item.qty) + '</strong>' + (item.qty > 1 ? '<small>' + money(unit) + ' each</small>' : '') + '</div></div></div></li>';
  }
  function cartSummaryHtml() {
    var t = totals();
    var remaining = CFG.freeDeliveryAt - t.after;
    return '<div class="cart-summary">' +
      '<div class="cs-row"><span>Subtotal</span><span>' + money(t.subtotal) + '</span></div>' +
      t.discounts.map(function (d) { return '<div class="cs-row cs-discount"><span>' + esc(d.label) + '</span><span>−' + money(d.amount) + '</span></div>'; }).join('') +
      '<div class="cs-row"><span>Delivery</span><span>' + (t.delivery === 0 ? 'Free' : money(t.delivery)) + '</span></div>' +
      t.hints.map(function (h) { return '<p class="cs-hint">' + esc(h) + '</p>'; }).join('') +
      (remaining > 0 && t.subtotal > 0 ? '<p class="cs-hint">Add ' + money(remaining) + ' more for free delivery.</p>' : '') +
      '<div class="cs-row cs-total"><span>Total</span><span>' + money(t.total) + '</span></div></div>';
  }

  function renderCartUI() {
    var t = totals();
    var badge = $('#nav-bag-badge');
    if (badge) { badge.textContent = t.count > 99 ? '99+' : t.count; badge.hidden = t.count === 0; }
    var bagBtn = $('#nav-bag');
    if (bagBtn) bagBtn.setAttribute('aria-label', 'Open cart, ' + t.count + ' items');
    var drawer = $('#side-cart-body');
    if (drawer) {
      $('#sc-count').textContent = '(' + t.count + ')';
      if (!cart.length) {
        drawer.innerHTML = '<div class="sc-empty">' + art('cupcake', 110) +
          '<h3>Your Cart Is Empty</h3><p>Discover something delicious.</p>' +
          '<a href="' + L('menu.html') + '" class="btn-gold">Explore Menu</a></div>';
      } else {
        drawer.innerHTML = '<ul class="sc-list">' + cart.map(cartLineHtml).join('') + '</ul>' +
          '<footer class="sc-foot">' + cartSummaryHtml() +
          '<div class="sc-actions"><button type="button" class="btn-soft" data-close-cart>Continue Shopping</button>' +
          '<a href="' + L('cart.html') + '" class="btn-ghost-gold">View Cart</a>' +
          '<button type="button" class="btn-gold sc-checkout" data-open-checkout>Checkout</button></div></footer>';
      }
    }
    renderCartPage();
    if ($('#checkout-summary')) renderCheckoutSummary();
  }
  function renderCartPage() {
    var box = $('#cart-page');
    if (!box) return;
    var t = totals();
    var sub = $('#cart-subtitle');
    if (sub) sub.textContent = t.count ? t.count + ' item' + (t.count > 1 ? 's' : '') + ' in your cart' : '';
    if (!cart.length) {
      box.innerHTML = '<div class="empty-state panel-glass">' + art('cupcake', 120) +
        '<h2 class="section-title section-title-sm">Your Cart Is Empty</h2><p>Discover something delicious.</p>' +
        '<a href="' + L('menu.html') + '" class="btn-gold">Explore Menu</a></div>';
      return;
    }
    box.innerHTML = '<div class="row g-4"><div class="col-12 col-lg-8">' +
      '<ul class="cart-page-list panel-glass">' + cart.map(cartLineHtml).join('') + '</ul>' +
      '<div class="d-flex flex-wrap gap-3 mt-3"><a href="' + L('menu.html') + '" class="btn-soft">Continue Shopping</a>' +
      '<button type="button" class="btn-ghost-gold" data-clear-cart>Clear cart</button></div></div>' +
      '<div class="col-12 col-lg-4"><div class="panel-glass cart-aside"><h2 class="section-title section-title-sm">Order summary</h2>' +
      cartSummaryHtml() +
      '<button type="button" class="btn-gold w-100 mt-3" data-open-checkout>Checkout</button>' +
      '</div></div></div>';
  }

  var NAV = [['index.html', 'Home'], ['menu.html', 'Menu'], ['offers.html', 'Offers'], ['our-story.html', 'About Us'],
             ['gallery.html', 'Gallery'], ['reviews.html', 'Reviews'], ['contact.html', 'Contact']];

  function visitorCount() {
    try {
      var n = parseInt(localStorage.getItem('bb-visits') || '0', 10) || 0;
      if (!sessionStorage.getItem('bb-visit-counted')) {
        n += 1; localStorage.setItem('bb-visits', String(n)); sessionStorage.setItem('bb-visit-counted', '1');
      }
      return Math.max(n, 1);
    } catch (e) { return 1; }
  }
  function logoMark(size) { return art('cupcake', size); }

  function renderShell() {
    $('#bb-symbols').innerHTML = '<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">' + ART._defs + '</svg>';

    $('#bb-float').innerHTML = [['cupcake', 'top:14%;left:3%', '0s'], ['cookie', 'top:38%;right:4%', '1.5s'],
      ['croissant', 'top:66%;left:5%', '3s'], ['donut', 'top:84%;right:8%', '4.5s']].map(function (f) {
      return '<span class="float-item" style="' + f[1] + ';animation-delay:' + f[2] + '">' + art(f[0], 84) + '</span>';
    }).join('');

    $('#site-header').innerHTML =
      '<nav class="container bb-nav-inner" aria-label="Main navigation">' +
      '<div class="brand-wrap"><a href="' + L('index.html') + '" class="brand" aria-label="Bakerz Bite home">' + logoMark(34) +
      '<span class="brand-text">Bakerz <span class="gold-text">Bite</span></span></a></div>' +
      '<ul class="nav-links" id="nav-links">' + NAV.map(function (l) {
        return '<li><a class="nav-link-bb" href="' + L(l[0]) + '" data-navlink="' + l[0] + '">' + l[1] + '</a></li>';
      }).join('') + '</ul>' +
      '<div class="nav-actions">' +
      '<span class="visitor-pill" title="Visitors">' + logoMark(20) +
      '<span class="visually-hidden">Visitors: </span>' + visitorCount().toLocaleString('en-US') + '</span>' +
      '<button type="button" class="icon-btn" data-theme-toggle></button>' +
      '<a href="' + L('menu.html') + '?saved=1" class="icon-btn wish-nav" id="nav-wish" aria-label="Open my wishlist">' + ic('heart', 20) +
      '<span class="bag-badge" id="nav-wish-badge" hidden>0</span></a>' +
      '<button type="button" class="icon-btn bag-btn" id="nav-bag" data-open-cart aria-label="Open cart">' + ic('bag', 20) +
      '<span class="bag-badge" id="nav-bag-badge" hidden>0</span></button>' +
      '<button type="button" class="icon-btn nav-toggle" data-nav-toggle aria-label="Open menu" aria-expanded="false">' + ic('menu', 22) + '</button></div></nav>';

    var catLinks = D.categories.map(function (c) { return '<li><a href="' + L(c.slug + '.html') + '">' + esc(c.name) + '</a></li>'; }).join('');
    $('#site-footer').innerHTML =
      '<div class="container"><div class="row g-4">' +
      '<div class="col-12 col-lg-4"><div class="brand foot-brand">' + logoMark(40) + '<span class="brand-text">Bakerz <span class="gold-text">Bite</span></span></div>' +
      '<p class="foot-motto">“Where Smiles Are Served Daily.”</p><p class="foot-small">Handcrafted delights for every beautiful moment.</p>' +
      '<div class="foot-social">' + CFG.social.map(function (s) {
        return '<a href="' + esc(s.url) + '" target="_blank" rel="noopener noreferrer" aria-label="' + esc(s.name) + '">' + ic(s.icon, 18) + '</a>';
      }).join('') + '</div>' +
      '<form class="foot-news newsletter-form" data-form="newsletter" novalidate><label for="fn-email" class="visually-hidden">Email address</label>' +
      '<input id="fn-email" type="email" class="form-control bb-input" placeholder="Newsletter: you@example.com" autocomplete="email">' +
      '<button type="submit" class="btn-gold btn-sm-gold">Subscribe</button></form><p class="field-error" data-news-msg role="alert" hidden></p></div>' +
      '<div class="col-6 col-lg-2"><h3 class="foot-h">Explore</h3><ul class="foot-list">' +
      '<li><a href="' + L('index.html') + '">Home</a></li><li><a href="' + L('menu.html') + '">Menu</a></li><li><a href="' + L('our-story.html') + '">About Us</a></li>' +
      '<li><a href="' + L('gallery.html') + '">Gallery</a></li><li><a href="' + L('offers.html') + '">Offers</a></li><li><a href="' + L('contact.html') + '">Contact</a></li></ul></div>' +
      '<div class="col-6 col-lg-2"><h3 class="foot-h">Help</h3><ul class="foot-list">' +
      '<li><a href="' + L('faq.html') + '">FAQ</a></li><li><a href="' + L('reviews.html') + '">Reviews</a></li><li><a href="' + L('cart.html') + '">Cart</a></li>' +
      '<li><a href="' + L('sitemap.html') + '">Sitemap</a></li><li><a href="' + L('privacy.html') + '">Privacy Policy</a></li><li><a href="' + L('terms.html') + '">Terms &amp; Conditions</a></li></ul></div>' +
      '<div class="col-12 col-lg-4"><h3 class="foot-h">Visit &amp; Contact</h3><ul class="foot-contact">' +
      '<li>' + ic('mail', 16) + ' <a href="mailto:' + esc(CFG.contact.email) + '">' + esc(CFG.contact.email) + '</a></li>' +
      '<li>' + ic('phone', 16) + ' ' + esc(CFG.contact.phone) + '</li><li>' + ic('pin', 16) + ' ' + esc(CFG.contact.address) + '</li>' +
      '<li>' + ic('clock', 16) + '<span>' + CFG.contact.hours.map(function (h) { return '<span class="d-block">' + esc(h[0]) + ': ' + esc(h[1]) + '</span>'; }).join('') + '</span></li></ul>' +
      '</div></div>' +
      '<div class="foot-cats"><h3 class="foot-h">Shop by category</h3><ul class="foot-cat-list">' + catLinks + '</ul></div>' +
      '<div class="foot-bottom"><span>© ' + new Date().getFullYear() + ' Bakerz Bite. All rights reserved.</span></div></div>';

    $('#bb-overlays').innerHTML =
      '<div class="drawer-overlay" id="drawer-overlay" data-close-cart aria-hidden="true"></div>' +
      '<aside class="side-cart" id="side-cart" role="dialog" aria-modal="true" aria-labelledby="sc-title" aria-hidden="true" inert>' +
      '<header class="sc-head"><h2 id="sc-title">' + ic('bag', 20) + ' Your Cart <span class="sc-count" id="sc-count">(0)</span></h2>' +
      '<button type="button" class="icon-btn" data-close-cart aria-label="Close cart">' + ic('x', 20) + '</button></header>' +
      '<div class="sc-body" id="side-cart-body"></div></aside>' +
      '<div id="modal-root"></div>' +
      '<div class="bb-toast" id="bb-toast" role="status" aria-live="polite"></div>';

    renderTicker();
  }

  var locText = '';
  function savedLocation() {
    var l = loadJSON('bb-location', null);
    if (!l || !l.city) return null;
    var c = LOC_CITIES.filter(function (x) { return x.id === l.city; })[0];
    if (!c || c.areas.indexOf(l.area) < 0) return null;
    return { mode: l.mode === 'pickup' ? 'pickup' : 'delivery', city: c, area: l.area };
  }
  function savedLocationText() {
    var l = savedLocation();
    return l ? (l.mode === 'pickup' ? 'Pick-up' : 'Delivery') + ' · ' + l.city.name + ', ' + l.area : '';
  }
  function renderTicker() {
    var el = $('#bb-ticker');
    el.setAttribute('role', 'region');
    el.setAttribute('aria-label', 'Date, time and location');
    el.innerHTML = '<div class="tk-track-wrap" aria-hidden="true"><div class="tk-track"><div class="tk-seq"></div><div class="tk-seq"></div></div></div>' +
      (savedLocation()
        ? '<button type="button" class="tk-btn" data-change-location>' + ic('pin', 14) + ' Change location</button>'
        : '<button type="button" class="tk-btn" data-share-location>' + ic('pin', 14) + ' Share location</button>');
    tickTime();
    if (window.__bbTicker) clearInterval(window.__bbTicker);
    window.__bbTicker = setInterval(tickTime, 1000);
  }
  function tickTime() {
  var now = new Date();
  var TZ = 'Asia/Karachi';
  var day  = now.toLocaleDateString('en-GB', { timeZone: TZ, weekday: 'long' });
  var date = now.toLocaleDateString('en-GB', { timeZone: TZ, day: 'numeric', month: 'long', year: 'numeric' });
  var time = now.toLocaleTimeString('en-GB', { timeZone: TZ, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  var where = locText || savedLocationText() || 'Location not shared';
  var st = openStatus();
  var html = (st ? '<span class="tk-item tk-open ' + (st.open ? 'is-open' : 'is-closed') + '"><span class="open-dot" aria-hidden="true"></span>' + esc(st.text) + '</span>' : '') +
    '<span class="tk-item">' + ic('calendar', 14) + ' ' + day + ', ' + date + '</span>' +
    '<span class="tk-item">' + ic('clock', 14) + ' ' + time + '</span>' +
    '<span class="tk-item">' + ic('pin', 14) + ' ' + esc(where) + '</span>';
  $$('#bb-ticker .tk-seq').forEach(function (s) { s.innerHTML = html; });
}
  function shareLocation(btn) {
    if (!('geolocation' in navigator)) { locText = 'Location unavailable'; return; }
    locText = 'Locating…';
    navigator.geolocation.getCurrentPosition(function (pos) {
      locText = 'Near ' + pos.coords.latitude.toFixed(2) + '°, ' + pos.coords.longitude.toFixed(2) + '°';
      btn.hidden = true;
    }, function () { locText = 'Location not shared'; }, { timeout: 10000, maximumAge: 600000 });
  }

  var toastTimer;
  function toast(msg) {
    var t = $('#bb-toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('show'); }, 2600);
  }

  var lastFocus = null;
  function openCart() {
    lastFocus = document.activeElement;
    var d = $('#side-cart');
    d.classList.add('open'); d.removeAttribute('inert'); d.setAttribute('aria-hidden', 'false');
    $('#drawer-overlay').classList.add('open');
    document.body.style.overflow = 'hidden';
    var close = $('.sc-head .icon-btn', d); if (close) close.focus();
  }
  function closeCart() {
    var d = $('#side-cart');
    if (!d || !d.classList.contains('open')) return;
    d.classList.remove('open'); d.setAttribute('inert', ''); d.setAttribute('aria-hidden', 'true');
    $('#drawer-overlay').classList.remove('open');
    if (!$('#modal-root').children.length) document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function trapTab(container, e) {
    var f = $$('a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])', container)
      .filter(function (el) { return el.offsetParent !== null; });
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  var modalOpener = null;
  function openModal(html) {
    modalOpener = document.activeElement;
    var root = $('#modal-root');
    root.innerHTML = '<div class="modal-backdrop-bb" data-modal-backdrop>' + html + '</div>';
    document.body.style.overflow = 'hidden';
    var close = $('[data-close-modal]', root);
    if (close) close.focus();
  }
  function closeModal() {
    var root = $('#modal-root');
    if (!root || !root.children.length) return;
    root.innerHTML = '';
    pm = null; lbState = null;
    if (!$('#side-cart').classList.contains('open')) document.body.style.overflow = '';
    if (modalOpener && modalOpener.focus && document.contains(modalOpener)) modalOpener.focus();
  }

  var pm = null;

  function chip(group, id, label, extra, selected) {
    return '<button type="button" class="chip-opt' + (selected ? ' active' : '') + '" data-opt="' + group + '" data-val="' + id +
      '" aria-pressed="' + (selected ? 'true' : 'false') + '">' + label + (extra ? ' <small>' + extra + '</small>' : '') + '</button>';
  }
  function openProduct(id) {
    var p = getProduct(id);
    if (!p) return;
    pm = { product: p, qty: 1, options: { size: '', frosting: '', flavor: '', decorations: [], toppings: [], message: '', note: '' } };
    var cfg = D.customOptions[p.custom] || {};
    var h = '<div class="product-modal panel-solid" role="dialog" aria-modal="true" aria-labelledby="pm-title">' +
      '<button type="button" class="icon-btn pm-close" data-close-modal aria-label="Close product details">' + ic('x', 20) + '</button>' +
      '<div class="pm-grid"><div class="pm-media">' + productPicture(p, 'modal') +
      (p.badge ? '<span class="bb-badge">' + esc(badgeLabel(p.badge)) + '</span>' : '') + '</div><div class="pm-info">' +
      '<h2 id="pm-title" class="pm-title">' + esc(p.name) + '</h2>' +
      '<div class="pc-rating">' + stars(p.rating, 16) + '<span class="pc-rating-text">' + p.rating.toFixed(1) + ' (' + p.reviews + ' reviews)</span></div>' +
      '<div class="pc-price pm-price"><span class="price-now">' + (p.custom ? 'From ' : '') + money(p.price) + '</span>' +
      (p.oldPrice ? '<span class="price-old">' + money(p.oldPrice) + '</span>' : '') + '</div>' +
      '<p class="pm-desc">' + esc(p.desc) + '</p>' +
      '<div class="pm-facts"><div><h3 class="pm-h">Ingredients</h3><p>' + esc(p.ingredients.join(', ')) + '</p></div>' +
      '<div><h3 class="pm-h">Possible allergens</h3><p>' + esc(p.allergens.length ? p.allergens.join(', ') : 'No common allergens listed') + '</p></div></div>' +
      '<p class="demo-note pm-demo">If you have an allergy, please ask the bakery before ordering.</p>';

    if (cfg.sizes) h += '<fieldset class="opt-group" data-group="size"><legend>Size <span class="req">required</span></legend><div class="opt-row">' +
      cfg.sizes.map(function (s) { return chip('size', s.id, esc(s.label), s.mult !== 1 ? '×' + s.mult : '', false); }).join('') +
      '</div><p class="field-error" data-err="size" role="alert" hidden>Please choose a size.</p></fieldset>';
    if (cfg.frostings) h += '<fieldset class="opt-group" data-group="frosting"><legend>Frosting <span class="req">required</span></legend><div class="opt-row">' +
      cfg.frostings.map(function (f) { return chip('frosting', f.id, esc(f.label), '', false); }).join('') +
      '</div><p class="field-error" data-err="frosting" role="alert" hidden>Please choose a frosting.</p></fieldset>';
    if (cfg.flavors) h += '<fieldset class="opt-group" data-group="flavor"><legend>Flavour <span class="req">required</span></legend><div class="opt-row">' +
      cfg.flavors.map(function (f) { return chip('flavor', f.id, esc(f.label), f.price > 0 ? '+' + money(f.price) : '', false); }).join('') +
      '</div><p class="field-error" data-err="flavor" role="alert" hidden>Please choose a flavour.</p></fieldset>';
    if (cfg.decorations) h += '<fieldset class="opt-group"><legend>Decorations <span class="opt">optional, paid</span></legend><div class="opt-row">' +
      cfg.decorations.map(function (d) { return chip('decorations', d.id, esc(d.label), '+' + money(d.price), false); }).join('') + '</div></fieldset>';
    if (cfg.toppings) h += '<fieldset class="opt-group"><legend>Extra toppings <span class="opt">optional, paid</span></legend><div class="opt-row">' +
      cfg.toppings.map(function (t) { return chip('toppings', t.id, esc(t.label), '+' + money(t.price), false); }).join('') + '</div></fieldset>';
    if (cfg.maxMessage) h += '<div class="opt-group"><label for="pm-message" class="opt-label">Cake message <span class="opt">optional</span></label>' +
      '<input id="pm-message" class="form-control bb-input" type="text" maxlength="' + cfg.maxMessage + '" placeholder="e.g. Happy Birthday Sara!">' +
      '<p class="field-hint"><span id="pm-msg-count">0</span>/' + cfg.maxMessage + ' characters</p></div>';
    h += '<div class="opt-group"><label for="pm-note" class="opt-label">Order note <span class="opt">optional</span></label>' +
      '<textarea id="pm-note" class="form-control bb-input" rows="2" maxlength="200" placeholder="Anything we should know?"></textarea></div>' +
      '<div class="pm-buy"><div class="qty-ctrl" role="group" aria-label="Quantity">' +
      '<button type="button" data-pm-qty="-1" aria-label="Decrease quantity">' + ic('minus', 16) + '</button><span id="pm-qty" aria-live="polite">1</span>' +
      '<button type="button" data-pm-qty="1" aria-label="Increase quantity">' + ic('plus', 16) + '</button></div>' +
      '<div class="pm-total" aria-live="polite"><span class="pm-total-label">Total</span><strong id="pm-total">' + money(unitPrice(p, {})) + '</strong></div>' +
      '<button type="button" class="btn-gold pm-add" data-pm-add>Add to Cart</button></div>' +
      '<p class="field-error" id="pm-error" role="alert" hidden>Please complete the required options above.</p></div></div></div>';
    openModal(h);
  }
  function pmUpdateTotal() {
    $('#pm-total').textContent = money(unitPrice(pm.product, pm.options) * pm.qty);
    $('#pm-qty').textContent = pm.qty;
  }
  function pmChipClick(btn) {
    var group = btn.getAttribute('data-opt'), val = btn.getAttribute('data-val');
    if (group === 'decorations' || group === 'toppings') {
      var list = pm.options[group], at = list.indexOf(val);
      if (at > -1) list.splice(at, 1); else list.push(val);
      btn.classList.toggle('active'); btn.setAttribute('aria-pressed', at === -1 ? 'true' : 'false');
    } else {
      pm.options[group] = val;
      $$('[data-opt="' + group + '"]').forEach(function (b) {
        var on = b === btn; b.classList.toggle('active', on); b.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      var err = $('[data-err="' + group + '"]'); if (err) err.hidden = true;
      $('#pm-error').hidden = true;
    }
    pmUpdateTotal();
  }
  function pmAdd() {
    var errors = validateOptions(pm.product, pm.options);
    var keys = Object.keys(errors);
    $$('[data-err]').forEach(function (e) { e.hidden = !errors[e.getAttribute('data-err')]; });
    $('#pm-error').hidden = keys.length === 0;
    if (keys.length) { var first = $('[data-group="' + keys[0] + '"] .chip-opt'); if (first) first.focus(); return; }
    addItem(pm.product.id, JSON.parse(JSON.stringify(pm.options)), pm.qty);
    toast(pm.qty + ' × ' + pm.product.name + ' added to your cart');
    closeModal();
  }


  var DIETS = [
    { key: 'egg-free', label: 'Egg-free' }, { key: 'nut-free', label: 'Nut-free' },
    { key: 'dairy-free', label: 'Dairy-free' }, { key: 'gluten-free', label: 'Gluten-free' }, { key: 'vegan', label: 'Vegan' }
  ];
  var NUT_RE = /almond|pistach|walnut|hazelnut|cashew|peanut|pecan/i;
  var ANIMAL_RE = /chicken|pepperoni|honey|gelatin|milk|cheese|mozzarella|ice cream|custard|butter|cream|egg/i;
  function dietOk(p, key) {
    if (p.cat === 'merchandise') return false;
    var al = (p.allergens || []).join(' ').toLowerCase(), ing = (p.ingredients || []).join(' ');
    if (key === 'egg-free') return al.indexOf('egg') < 0 && !/egg/i.test(ing);
    if (key === 'nut-free') return al.indexOf('nut') < 0 && !NUT_RE.test(ing);
    if (key === 'dairy-free') return al.indexOf('dairy') < 0 && !/milk|butter|cream|cheese|mozzarella|custard|ice cream/i.test(ing);
    if (key === 'gluten-free') return al.indexOf('gluten') < 0 && !/flour|oats|biscuit|yeast|sourdough|wheat/i.test(ing);
    if (key === 'vegan') return al.indexOf('dairy') < 0 && al.indexOf('egg') < 0 && !ANIMAL_RE.test(ing);
    return true;
  }


  var WISH_KEY = 'bb-wishlist';
  var wishlist = loadJSON(WISH_KEY, []).filter(function (id) { return getProduct(id); });
  function isWished(id) { return wishlist.indexOf(id) > -1; }
  function wishBtnHtml(id) {
    var on = isWished(id), name = (getProduct(id) || {}).name || 'item';
    return '<button type="button" class="wish-btn' + (on ? ' is-on' : '') + '" data-wish="' + id + '" aria-pressed="' + on +
      '" aria-label="' + (on ? 'Remove ' : 'Save ') + esc(name) + (on ? ' from wishlist' : ' to wishlist') + '">' + ic('heart', 18) + '</button>';
  }
  function updateWishUI() {
    $$('[data-wish]').forEach(function (b) {
      var id = b.getAttribute('data-wish'), on = isWished(id), name = (getProduct(id) || {}).name || 'item';
      b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', on);
      b.setAttribute('aria-label', (on ? 'Remove ' : 'Save ') + name + (on ? ' from wishlist' : ' to wishlist'));
    });
    var badge = $('#nav-wish-badge');
    if (badge) { badge.textContent = wishlist.length; badge.hidden = !wishlist.length; }
  }
  function toggleWish(id) {
    var p = getProduct(id); if (!p) return;
    var i = wishlist.indexOf(id);
    if (i > -1) { wishlist.splice(i, 1); toast(p.name + ' removed from your wishlist'); }
    else { wishlist.push(id); toast(p.name + ' saved to your wishlist'); }
    saveJSON(WISH_KEY, wishlist); updateWishUI();
    document.dispatchEvent(new CustomEvent('bb-wishlist-change'));
  }


  function parseClock(t) {
    var m = /(\d{1,2}):(\d{2})\s*(AM|PM)/i.exec(t || ''); if (!m) return null;
    var h = Number(m[1]) % 12; if (m[3].toUpperCase() === 'PM') h += 12;
    return h * 60 + Number(m[2]);
  }
  function openStatus() {
    var now = new Date(), parts;
    try {
      parts = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Karachi', weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: false }).formatToParts(now);
    } catch (e) { return null; }
    var get = function (t) { return (parts.filter(function (x) { return x.type === t; })[0] || {}).value; };
    var wd = get('weekday'), mins = (Number(get('hour')) % 24) * 60 + Number(get('minute'));
    var weekend = wd === 'Sat' || wd === 'Sun';
    var row = CFG.contact.hours[weekend ? 1 : 0] || CFG.contact.hours[0];
    var span = String(row[1]).split(/[–-]/), open = parseClock(span[0]), close = parseClock(span[1]);
    if (open == null || close == null) return null;
    var isOpen = mins >= open && mins < close;
    function fmt(m) { var h = Math.floor(m / 60), mm = m % 60, ap = h >= 12 ? 'PM' : 'AM'; h = h % 12 || 12; return h + (mm ? ':' + (mm < 10 ? '0' : '') + mm : ':00') + ' ' + ap; }
    return isOpen ? { open: true, text: 'Open now · closes ' + fmt(close) } : { open: false, text: 'Closed · ' + (mins < open ? 'opens today at ' + fmt(open) : 'opens tomorrow') };
  }
  function openBadgeHtml() {
    var st = openStatus(); if (!st) return '';
    return '<span class="open-badge ' + (st.open ? 'is-open' : 'is-closed') + '"><span class="open-dot" aria-hidden="true"></span>' + esc(st.text) + '</span>';
  }

  function cardHtml(p) {
    return '<article class="product-card"><div class="pc-media" data-open-product="' + p.id + '">' + productPicture(p, 'card') +
      (p.badge ? '<span class="pc-badge"><span class="bb-badge">' + esc(badgeLabel(p.badge)) + '</span></span>' : '') + '</div>' + wishBtnHtml(p.id) +
      '<div class="pc-body"><h3 class="pc-title"><button type="button" class="pc-title-btn" data-open-product="' + p.id + '">' + esc(p.name) + '</button></h3>' +
      '<p class="pc-desc">' + esc(p.desc) + '</p>' +
      '<div class="pc-rating">' + stars(p.rating, 14) + '<span class="pc-rating-text">' + p.rating.toFixed(1) + ' (' + p.reviews + ')</span></div>' +
      '<div class="pc-foot"><div class="pc-price"><span class="price-now">' + (p.custom ? 'From ' : '') + money(p.price) + '</span>' +
      (p.oldPrice ? '<span class="price-old">' + money(p.oldPrice) + '</span>' : '') + '</div>' +
      '<button type="button" class="btn-gold btn-sm-gold" data-add="' + p.id + '">' + ic(p.custom ? 'sliders' : 'bag', 15) + ' ' + (p.custom ? 'Customize' : 'Add to Cart') + '</button></div></div></article>';
  }
  function gridHtml(list, emptyHtml, extraClass, emptyMsg) {
    if (!list.length) {
      return '<div class="empty-state panel-glass">' + art('cookie', 96) + '<h3>' + (emptyMsg ? emptyMsg.title : 'No treats match your search') + '</h3>' +
        '<p>' + (emptyMsg ? emptyMsg.text : 'Try a different word, widen the price range, or clear the filters.') + '</p>' + (emptyHtml || '') + '</div>';
    }
    return '<div class="product-grid' + (extraClass ? ' ' + extraClass : '') + '">' + list.map(cardHtml).join('') + '</div>';
  }

  function renderCheckoutSummary() {
    var box = $('#checkout-summary');
    if (!box) return;
    box.innerHTML = '<ul class="co-items">' + cart.map(function (item) {
      var p = getProduct(item.id); if (!p) return '';
      var details = describeOptions(p, item.options);
      return '<li><div><strong>' + item.qty + ' × ' + esc(p.name) + '</strong>' +
        (details.length ? '<small>' + details.map(esc).join(' · ') + '</small>' : '') + '</div><span>' + money(unitPrice(p, item.options) * item.qty) + '</span></li>';
    }).join('') + '</ul>' + cartSummaryHtml();
  }

  var CO_SLOTS = ['Morning', 'Afternoon', 'Evening'];
  function cleanText(s) { return String(s == null ? '' : s).replace(/\s+/g, ' ').trim(); }
  function coName(raw) {
    var s = cleanText(raw);
    if (!s) return 'Please enter your full name.';
    var letters = s.replace(/[^\p{L}]/gu, '');
    var shape = /^\p{L}[\p{L}\p{M}]*(?:[ '’\-]\p{L}[\p{L}\p{M}]*)*$/u;
    if (s.length > 60 || letters.length < 2 || !shape.test(s) || /(.)\1{3,}/iu.test(letters) || /^(.)\1+$/iu.test(letters)) return 'Please enter a valid full name.';
    return '';
  }
  function coEmail(raw) {
    var s = String(raw == null ? '' : raw).trim();
    if (!s) return 'Please enter your email address.';
    var re = /^[A-Za-z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[A-Za-z0-9!#$%&'*+\/=?^_`{|}~-]+)*@(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,24}$/;
    if (s.length > 254 || s.split('@')[0].length > 64 || !re.test(s)) return 'Please enter a valid email address.';
    return '';
  }
  function coPhone(raw) {
    var s = String(raw == null ? '' : raw).trim();
    var bad = 'Please enter a valid phone number, for example 0300 1234567 or +92 300 1234567.';
    if (!s) return 'Please enter your phone number.';
    if (!/^(?:\+\s*)?[0-9(][0-9\s\-().]*$/.test(s)) return bad;
    var digits = s.replace(/\D/g, ''), national = '';
    if (s.charAt(0) === '+' || digits.indexOf('00') === 0) {
      var intl = s.charAt(0) === '+' ? digits : digits.slice(2);
      if (intl.length < 8 || intl.length > 15 || intl.charAt(0) === '0') return bad;
      if (intl.indexOf('92') === 0) {
        national = intl.slice(2);
        if (!/^(?:3\d{9}|[2-9]\d{8,9})$/.test(national)) return bad;
      } else national = intl;
    } else if (digits.indexOf('92') === 0 && digits.length === 12) {
      national = digits.slice(2);
      if (!/^3\d{9}$/.test(national)) return bad;
    } else {
      if (!/^(?:03\d{9}|0[2-9]\d{8,9})$/.test(digits)) return bad;
      national = digits.slice(1);
    }
    if (/^(\d)\1+$/.test(national)) return bad;
    return '';
  }
  function coAddress(raw) {
    var s = cleanText(raw);
    if (!s) return 'Please enter your delivery address.';
    var alnum = s.replace(/[^\p{L}\p{N}]/gu, ''), letters = s.replace(/[^\p{L}]/gu, '');
    if (s.length < 10 || alnum.length < 8 || letters.length < 3 || s.split(' ').length < 2 || /(.)\1{4,}/iu.test(alnum))
      return 'Please enter a complete delivery address, such as house or flat number, street and area.';
    if (s.length > 200) return 'Please keep the address under 200 characters.';
    return '';
  }

  function payNote(kind, pickup) {
    if (kind === 'online') return 'Pay securely with your debit or credit card. Your card is charged when you confirm the order.';
    return pickup ? 'Pay with cash at the counter when you collect your order.' : 'Pay with cash when your order arrives.';
  }
  function payLabel(kind, pickup) {
    if (kind === 'online') return 'Online Payment (Card)';
    return pickup ? 'Cash at Pick-up' : 'Cash on Delivery';
  }
  function openCheckout() {
    closeCart();
    if (!cart.length) { toast('Your cart is empty. Add something first.'); return; }
    var sl = savedLocation(), pickup = Boolean(sl && sl.mode === 'pickup');
    var cities = D.cities.slice();
    LOC_CITIES.forEach(function (c) { if (cities.indexOf(c.name) < 0) cities.splice(Math.max(0, cities.length - 1), 0, c.name); });
    var cityOpts = cities.map(function (c) { return '<option>' + esc(c) + '</option>'; }).join('');
    function field(id, label, type, col, extra) {
      return '<div class="col-12 ' + col + '"><label for="co-' + id + '" class="opt-label">' + label + '</label>' +
        '<input id="co-' + id + '" name="' + id + '" type="' + type + '" class="form-control bb-input" required aria-required="true" aria-describedby="co-err-' + id + '" ' + (extra || '') + '>' +
        '<p class="field-error" id="co-err-' + id + '" data-err="' + id + '" role="alert" hidden></p></div>';
    }
    var deliveryHtml = pickup
      ? '<div class="col-12"><p class="co-note mb-0">Pick-up selected: <strong>' + esc(sl.city.name + ', ' + sl.area) + '</strong>. No delivery address is needed. Use “Change location” at the bottom of the page to switch to delivery.</p></div>'
      : field('address', 'Delivery address', 'text', '', 'autocomplete="street-address" minlength="10" maxlength="200" placeholder="House / flat no., street, area"') +
        '<div class="col-12 col-md-6"><label for="co-city" class="opt-label">City</label><select id="co-city" name="city" class="form-select bb-input" required aria-required="true" aria-describedby="co-err-city"><option value="">Choose…</option>' + cityOpts + '</select>' +
        '<p class="field-error" id="co-err-city" data-err="city" role="alert" hidden></p></div>';
    openModal('<div class="checkout-modal panel-solid" role="dialog" aria-modal="true" aria-labelledby="co-title">' +
      '<button type="button" class="icon-btn pm-close" data-close-modal aria-label="Close checkout">' + ic('x', 20) + '</button>' +
      '<div id="co-body"><h2 id="co-title" class="co-title">Checkout</h2>' +
            '<div class="row g-4"><div class="col-12 col-md-7"><form id="checkout-form" data-form="checkout" data-mode="' + (pickup ? 'pickup' : 'delivery') + '" novalidate><div class="row g-3">' +
      '<div class="col-12"><h3 class="pm-h">Customer details</h3></div>' +
      field('name', 'Full name', 'text', 'col-md-6', 'autocomplete="name" minlength="2" maxlength="60"') +
      field('phone', 'Phone number', 'tel', 'col-md-6', 'autocomplete="tel" inputmode="tel" minlength="10" maxlength="20" placeholder="0300 1234567"') +
      field('email', 'Email', 'email', '', 'autocomplete="email" inputmode="email" maxlength="254" placeholder="you@example.com"') +
      '<div class="col-12"><h3 class="pm-h mt-2">' + (pickup ? 'Pick-up details' : 'Delivery details') + '</h3></div>' +
      deliveryHtml +
      '<div class="col-12 col-md-6"><label for="co-slot" class="opt-label">Preferred time</label><select id="co-slot" name="slot" class="form-select bb-input" required aria-required="true" aria-describedby="co-err-slot">' +
        CO_SLOTS.map(function (s) { return '<option>' + s + '</option>'; }).join('') + '</select>' +
        '<p class="field-error" id="co-err-slot" data-err="slot" role="alert" hidden></p></div>' +
      '<div class="col-12"><label for="co-notes" class="opt-label">' + (pickup ? 'Order' : 'Delivery') + ' instructions</label><textarea id="co-notes" name="notes" rows="2" class="form-control bb-input" minlength="3" maxlength="200" required aria-required="true" aria-describedby="co-err-notes" placeholder="e.g. ring the bell, no nuts, write Happy Birthday on the cake"></textarea>' +
        '<p class="field-error" id="co-err-notes" data-err="notes" role="alert" hidden></p></div>' +
      '<div class="col-12"><fieldset class="co-pay"><legend class="opt-label">Payment method</legend><div class="co-pay-opts">' +
        '<label class="co-pay-opt"><input type="radio" name="payment" value="cod" checked><span><strong>' + (pickup ? 'Cash at Pick-up' : 'Cash on Delivery') + '</strong><small>' + (pickup ? 'Pay at the counter' : 'Pay when it arrives') + '</small></span></label>' +
        '<label class="co-pay-opt"><input type="radio" name="payment" value="online"><span><strong>Online Payment</strong><small>Debit / credit card</small></span></label>' +
        '</div><p class="co-note mb-0" id="co-pay-note" aria-live="polite">' + payNote('cod', pickup) + '</p>' +
        '<div class="co-card" id="co-card" hidden><div class="row g-3">' +
        field('cardnumber', 'Card number', 'text', '', 'autocomplete="cc-number" inputmode="numeric" maxlength="23" placeholder="1234 5678 9012 3456"').replace(' required aria-required="true"', '') +
        field('cardname', 'Name on card', 'text', 'col-md-12', 'autocomplete="cc-name" maxlength="60" placeholder="As printed on the card"').replace(' required aria-required="true"', '') +
        field('cardexp', 'Expiry (MM/YY)', 'text', 'col-md-6', 'autocomplete="cc-exp" inputmode="numeric" maxlength="5" placeholder="MM/YY"').replace(' required aria-required="true"', '') +
        field('cardcvv', 'CVV', 'password', 'col-md-6', 'autocomplete="cc-csc" inputmode="numeric" maxlength="4" placeholder="123"').replace(' required aria-required="true"', '') +
        '<div class="col-12"><p class="co-note mb-0 co-secure">' + ic('check', 14) + ' Your card details are encrypted and never stored.</p></div>' +
        '</div></div></fieldset></div>' +
      '<div class="col-12 co-actions"><button type="button" class="btn-soft" data-close-modal>Cancel</button><button type="submit" class="btn-gold">Confirm order</button></div>' +
      '</div></form></div><div class="col-12 col-md-5"><div class="co-summary panel-glass"><h3 class="pm-h">Your order</h3><div id="checkout-summary"></div></div></div></div></div></div>');
    renderCheckoutSummary();
    var citySel = $('#co-city');
    if (sl && citySel && cities.indexOf(sl.city.name) > -1) citySel.value = sl.city.name;
  }

  function cardFieldError(key, raw) {
    var v = String(raw || '').trim();
    if (key === 'cardnumber') {
      var d = v.replace(/[\s-]/g, '');
      if (!d) return 'Please enter your card number.';
      if (!/^\d{13,19}$/.test(d)) return 'Card number must be 13 to 19 digits.';
      var sum = 0, dbl = false;
      for (var i = d.length - 1; i >= 0; i--) { var n = +d[i]; if (dbl) { n *= 2; if (n > 9) n -= 9; } sum += n; dbl = !dbl; }
      return sum % 10 === 0 ? '' : 'Please check your card number.';
    }
    if (key === 'cardname') {
      if (!v) return 'Please enter the name on your card.';
      return /^[\p{L}][\p{L} .'-]{1,59}$/u.test(v) ? '' : 'Please enter the name as printed on the card.';
    }
    if (key === 'cardexp') {
      var m = /^(\d{2})\/(\d{2})$/.exec(v);
      if (!v) return 'Please enter the expiry date.';
      if (!m || +m[1] < 1 || +m[1] > 12) return 'Use the format MM/YY.';
      var now = new Date(), yy = now.getFullYear() % 100, mm = now.getMonth() + 1;
      return (+m[2] < yy || (+m[2] === yy && +m[1] < mm)) ? 'This card has expired.' : '';
    }
    if (key === 'cardcvv') {
      if (!v) return 'Please enter the CVV.';
      return /^\d{3,4}$/.test(v) ? '' : 'CVV is 3 or 4 digits.';
    }
    return '';
  }
  function checkoutFieldError(form, key) {
    var el = form.elements[key]; if (!el) return '';
    var delivery = form.getAttribute('data-mode') !== 'pickup';
    if (key === 'name') return coName(el.value);
    if (key === 'phone') return coPhone(el.value);
    if (key === 'email') return coEmail(el.value);
    if (key === 'address') return delivery ? coAddress(el.value) : '';
    if (key === 'city') {
      if (!delivery) return '';
      var cities = $$('option', el).map(function (o) { return o.value; }).filter(Boolean);
      if (!el.value) return 'Please choose your city.';
      if (cities.indexOf(el.value) < 0) return 'Please choose a city from the list.';
      var sl = savedLocation();
      if (sl && sl.mode === 'delivery' && sl.city.name !== el.value)
        return 'Your delivery location is set to ' + sl.city.name + '. Please choose ' + sl.city.name + ', or use “Change location” to deliver to ' + el.value + '.';
      return '';
    }
    if (key === 'notes') {
      var nv = cleanText(el.value);
      if (!nv) return 'Please enter your order instructions before placing the order.';
      if (nv.length < 3) return 'Instructions must be at least 3 characters.';
      return '';
    }
    if (key.indexOf('card') === 0) {
      var f2 = form.elements.payment;
      if (!f2 || f2.value !== 'online') return '';
      return cardFieldError(key, el.value);
    }
    if (key === 'slot') return CO_SLOTS.indexOf(el.value) < 0 ? 'Please choose a preferred time.' : '';
    return '';
  }
  function showCheckoutError(form, key, msg) {
    var box = $('[data-err="' + key + '"]', form), input = form.elements[key];
    if (box) { box.textContent = msg || ''; box.hidden = !msg; }
    if (input) input.setAttribute('aria-invalid', msg ? 'true' : 'false');
  }
  var CO_FIELDS = ['name', 'phone', 'email', 'address', 'city', 'slot', 'notes', 'cardnumber', 'cardname', 'cardexp', 'cardcvv'];
  function validateCheckoutField(form, key) {
    var el = form.elements[key]; if (!el) return '';
    if (key === 'name' || key === 'address' || key === 'notes') el.value = cleanText(el.value);
    else if (key === 'phone' || key === 'email') el.value = el.value.trim();
    var msg = checkoutFieldError(form, key);
    showCheckoutError(form, key, msg);
    return msg;
  }
  function submitCheckout(form) {
    if (form.getAttribute('data-busy')) return;
    var errors = {};
    CO_FIELDS.forEach(function (k) { var m = validateCheckoutField(form, k); if (m) errors[k] = m; });
    var keys = CO_FIELDS.filter(function (k) { return errors[k]; });
    if (keys.length) {
      var first = form.elements[keys[0]];
      first.focus({ preventScroll: true });
      var calm = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (first.scrollIntoView) first.scrollIntoView({ block: 'center', behavior: calm ? 'auto' : 'smooth' });
      return;
    }
    form.setAttribute('data-busy', '1');
    var v = { name: form.elements.name.value };
    var pay = form.elements.payment && form.elements.payment.value === 'online' ? 'online' : 'cod';
    var t = totals();
    var ref = 'BB-' + Math.floor(1000 + Math.random() * 9000);
    clearCart();
    $('#co-body').innerHTML = '<div class="co-done">' + ic('check', 56, 'co-check') + '<h2 id="co-title">Order confirmed</h2>' +
      '<p>Thank you, ' + esc(v.name.split(' ')[0]) + '! We have received your order details.</p>' +
      '<p class="co-amount">Order reference: <strong>' + ref + '</strong><br>Total: <strong>' + money(t.total) + '</strong><br>Payment: <strong>' + esc(payLabel(pay, form.getAttribute('data-mode') === 'pickup')) + (pay === 'online' ? ' (paid)' : '') + '</strong></p>' +
      '<button type="button" class="btn-gold" data-close-modal>Back to browsing</button></div>';
    var b = $('[data-close-modal]', $('#co-body')); if (b) b.focus();
  }
  document.addEventListener('change', function (e) {
    var t = e.target;
    if (t && t.name === 'payment' && t.form && t.form.id === 'checkout-form') {
      var n = $('#co-pay-note', t.form); if (n) n.textContent = payNote(t.value, t.form.getAttribute('data-mode') === 'pickup');
      var cp = $('#co-card', t.form); if (cp) cp.hidden = t.value !== 'online';
      if (t.value !== 'online') ['cardnumber', 'cardname', 'cardexp', 'cardcvv'].forEach(function (k) { showCheckoutError(t.form, k, ''); });
    }
  });
  document.addEventListener('input', function (e) {
    var t = e.target; if (!t || !t.form || t.form.id !== 'checkout-form') return;
    if (t.name === 'cardnumber') t.value = t.value.replace(/\D/g, '').slice(0, 19).replace(/(.{4})/g, '$1 ').trim();
    else if (t.name === 'cardexp') { var d = t.value.replace(/\D/g, '').slice(0, 4); t.value = d.length > 2 ? d.slice(0, 2) + '/' + d.slice(2) : d; }
    else if (t.name === 'cardcvv') t.value = t.value.replace(/\D/g, '').slice(0, 4);
  });
  document.addEventListener('focusout', function (e) {
    var f = e.target && e.target.form;
    if (f && f.id === 'checkout-form' && e.target.name && CO_FIELDS.indexOf(e.target.name) > -1) validateCheckoutField(f, e.target.name);
  });
  document.addEventListener('input', function (e) {
    var f = e.target && e.target.form, k = e.target && e.target.name;
    if (f && f.id === 'checkout-form' && CO_FIELDS.indexOf(k) > -1 && e.target.getAttribute('aria-invalid') === 'true') showCheckoutError(f, k, checkoutFieldError(f, k));
  });
  document.addEventListener('change', function (e) {
    var f = e.target && e.target.form, k = e.target && e.target.name;
    if (f && f.id === 'checkout-form' && (k === 'city' || k === 'slot')) validateCheckoutField(f, k);
  });

  var DEFAULT_FILTERS = { q: '', cat: 'all', maxPrice: 4000, sort: 'featured', rating: 0, popular: false, isNew: false, sale: false, saved: false, diet: [] };
  function initBrowser(root, fixedCat) {
    var f = JSON.parse(JSON.stringify(DEFAULT_FILTERS));
    var isPopular = function (p) { return p.badge === 'Popular' || p.badge === 'Best Seller'; };
    var isSale = function (p) { return Boolean(p.oldPrice) || p.badge === 'Sale'; };

    root.innerHTML = '<div class="filter-bar panel-glass">' +
      (fixedCat ? '' : '<div class="filter-chips menu-cats" role="group" aria-label="Filter by category">' +
        '<button type="button" class="chip-opt active" data-cat="all" aria-pressed="true">All</button>' +
        D.categories.map(function (c) { return '<button type="button" class="chip-opt" data-cat="' + c.slug + '" aria-pressed="false">' + esc(c.name) + '</button>'; }).join('') + '</div>') +
      '<div class="row g-3 align-items-end"><div class="col-12 col-md-6 col-lg-4"><label for="f-search" class="opt-label">Search</label>' +
      '<div class="search-field">' + ic('search', 16) + '<input id="f-search" type="search" class="form-control bb-input" placeholder="Search cakes, coffee, ingredients…"></div></div>' +
      '<div class="col-6 col-md-3 col-lg-3"><label for="f-sort" class="opt-label">Sort by</label><select id="f-sort" class="form-select bb-input">' +
      '<option value="featured">Featured</option><option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option><option value="rating">Top rated</option></select></div>' +
      '<div class="col-6 col-md-3 col-lg-2"><label for="f-rating" class="opt-label">Rating</label><select id="f-rating" class="form-select bb-input">' +
      '<option value="0">Any rating</option><option value="4">4 stars &amp; up</option><option value="4.5">4.5 stars &amp; up</option><option value="4.8">4.8 stars &amp; up</option></select></div>' +
      '<div class="col-12 col-md-6 col-lg-3"><label for="f-price" class="opt-label" id="f-price-label">Up to ' + money(f.maxPrice) + '</label>' +
      '<input id="f-price" type="range" class="form-range bb-range" min="200" max="4000" step="100" value="4000"></div></div>' +
      '<div class="filter-chips"><button type="button" class="chip-opt" data-flag="popular" aria-pressed="false">Best Sellers</button>' +
      '<button type="button" class="chip-opt" data-flag="isNew" aria-pressed="false">New Arrivals</button>' +
      '<button type="button" class="chip-opt" data-flag="sale" aria-pressed="false">On Sale</button>' +
      '<button type="button" class="chip-opt chip-wish" data-flag="saved" aria-pressed="false">' + ic('heart', 14) + ' My Wishlist</button>' +
      '<button type="button" class="chip-clear" data-clear>' + ic('x', 14) + ' Clear filters</button>' +
      '<span class="result-count" id="f-count" aria-live="polite"></span></div>' +
      '<div class="diet-row"><span class="opt-label diet-label">Dietary needs</span><div class="filter-chips" role="group" aria-label="Dietary filters">' +
      DIETS.map(function (d) { return '<button type="button" class="chip-opt" data-diet="' + d.key + '" aria-pressed="false">' + d.label + '</button>'; }).join('') +
      '</div><p class="diet-note">Based on the allergens and ingredients we list. If you have an allergy, please ask the bakery before ordering.</p></div></div><div id="f-grid"></div>';

    function apply() {
      var q = f.q.trim().toLowerCase();
      var list = D.products.filter(function (p) {
        if (fixedCat && p.cat !== fixedCat) return false;
        if (!fixedCat && f.cat !== 'all' && p.cat !== f.cat) return false;
        if (q && (p.name + ' ' + p.desc + ' ' + p.ingredients.join(' ')).toLowerCase().indexOf(q) === -1) return false;
        if (p.price > f.maxPrice) return false;
        if (p.rating < f.rating) return false;
        if (f.popular && !isPopular(p)) return false;
        if (f.isNew && p.badge !== 'New') return false;
        if (f.sale && !isSale(p)) return false;
        if (f.saved && !isWished(p.id)) return false;
        for (var di = 0; di < f.diet.length; di++) if (!dietOk(p, f.diet[di])) return false;
        return true;
      });
      if (f.sort === 'price-asc') list.sort(function (a, b) { return a.price - b.price; });
      if (f.sort === 'price-desc') list.sort(function (a, b) { return b.price - a.price; });
      if (f.sort === 'rating') list.sort(function (a, b) { return b.rating - a.rating; });
      $('#f-grid', root).innerHTML = gridHtml(list, '<button type="button" class="btn-ghost-gold" data-clear>Clear filters</button>', '', f.saved ? { title: 'Your wishlist is empty', text: 'Tap the heart on any treat to save it here.' } : null);
      $('#f-count', root).textContent = list.length + ' item' + (list.length === 1 ? '' : 's');
      $('#f-price-label', root).textContent = 'Up to ' + money(f.maxPrice);
    }
    function reset() {
      f = JSON.parse(JSON.stringify(DEFAULT_FILTERS));
      $('#f-search', root).value = ''; $('#f-sort', root).value = 'featured'; $('#f-rating', root).value = '0'; $('#f-price', root).value = '4000';
      $$('[data-cat]', root).forEach(function (b) { var on = b.getAttribute('data-cat') === 'all'; b.classList.toggle('active', on); b.setAttribute('aria-pressed', on); });
      $$('[data-flag],[data-diet]', root).forEach(function (b) { b.classList.remove('active'); b.setAttribute('aria-pressed', 'false'); });
      apply();
    }
    $('#f-search', root).addEventListener('input', function (e) { f.q = e.target.value; apply(); });
    $('#f-sort', root).addEventListener('change', function (e) { f.sort = e.target.value; apply(); });
    $('#f-rating', root).addEventListener('change', function (e) { f.rating = Number(e.target.value); apply(); });
    $('#f-price', root).addEventListener('input', function (e) { f.maxPrice = Number(e.target.value); apply(); });
    root.addEventListener('click', function (e) {
      var cat = e.target.closest('[data-cat]'), flag = e.target.closest('[data-flag]'), diet = e.target.closest('[data-diet]');
      if (cat && root.contains(cat)) {
        f.cat = cat.getAttribute('data-cat');
        $$('[data-cat]', root).forEach(function (b) { var on = b === cat; b.classList.toggle('active', on); b.setAttribute('aria-pressed', on); });
        apply();
      } else if (flag && root.contains(flag)) {
        var k = flag.getAttribute('data-flag'), turnOn = !f[k];

        if (k === 'popular' || k === 'isNew' || k === 'sale') {
          ['popular', 'isNew', 'sale'].forEach(function (other) {
            f[other] = false;
            var ob = $('[data-flag="' + other + '"]', root);
            if (ob) { ob.classList.remove('active'); ob.setAttribute('aria-pressed', 'false'); }
          });
        }
        f[k] = turnOn;
        flag.classList.toggle('active', f[k]); flag.setAttribute('aria-pressed', f[k]); apply();
      } else if (diet && root.contains(diet)) {
        var dk = diet.getAttribute('data-diet'), di = f.diet.indexOf(dk);
        if (di > -1) f.diet.splice(di, 1); else f.diet.push(dk);
        diet.classList.toggle('active', di < 0); diet.setAttribute('aria-pressed', di < 0); apply();
      } else if (e.target.closest('[data-clear]')) { reset(); }
    });
    document.addEventListener('bb-wishlist-change', function () { if (f.saved) apply(); });

    var qs = new URLSearchParams(location.search);
    if (qs.get('saved') === '1') { var sb = $('[data-flag="saved"]', root); if (sb) { f.saved = true; sb.classList.add('active'); sb.setAttribute('aria-pressed', 'true'); } }
    (qs.get('diet') || '').split(',').forEach(function (k) {
      var db = k && $('[data-diet="' + k + '"]', root);
      if (db) { f.diet.push(k); db.classList.add('active'); db.setAttribute('aria-pressed', 'true'); }
    });
    var hash = (location.hash || '').replace('#', '');
    if (!fixedCat && hash && getCategory(hash)) { var b = $('[data-cat="' + hash + '"]', root); if (b) b.click(); else apply(); } else apply();
  }

  function allReviews() {
    var local = loadJSON(REVIEWS_KEY, []).map(function (r) { r.local = true; return r; });
    return local.concat(D.reviews.map(function (r) { var c = {}; for (var k in r) c[k] = r[k]; c.sample = true; return c; }));
  }
  function reviewCard(r, full) {
    return '<article class="review-card panel-glass h-100"><div class="review-head">' + avatarHtml(r, 46) +
      '<div><strong>' + esc(r.name) + '</strong><div>' + stars(r.rating, 14) + '</div></div></div>' +
      '<p>“' + esc(r.text) + '”</p>' +
      (full ? '<div class="review-meta"><span>' + esc((getCategory(r.cat) || {}).name || '') + '</span><span>' + fmtDate(r.date) + '</span></div>' +
        '<span class="review-flag">' + 'Customer review' + '</span>' : '') + '</article>';
  }
  var CUTE_AV = {
    r1:  { bg: '#FFD6E0', skin: '#F6C9A6', hair: '#3B2A22', style: 'long',   top: '#F0698A' },
    r2:  { bg: '#CFEFE3', skin: '#E3AF86', hair: '#2B1E1A', style: 'short',  top: '#6FB7A0' },
    r3:  { bg: '#FFE3C9', skin: '#F6C9A6', hair: '#6B3A22', style: 'bun',    top: '#FFB48F' },
    r4:  { bg: '#DCD3F7', skin: '#D9A47C', hair: '#2B1E1A', style: 'spiky',  top: '#9A86D9' },
    r5:  { bg: '#FFE9F0', skin: '#F2C29B', hair: '#FF8FB3', style: 'hijab',  top: '#FF8FB3' },
    r6:  { bg: '#FFF0C9', skin: '#E3AF86', hair: '#3B2A22', style: 'beard',  top: '#F2B84B' },
    r7:  { bg: '#D9F0F5', skin: '#F6C9A6', hair: '#7BB6C4', style: 'hijab',  top: '#7BB6C4' },
    r8:  { bg: '#FFD9CC', skin: '#D9A47C', hair: '#2B1E1A', style: 'curly',  top: '#E8527C' },
    r9:  { bg: '#E6F5D3', skin: '#F2C29B', hair: '#5A3426', style: 'bob',    top: '#9CCB6B' },
    r10: { bg: '#FFE0EC', skin: '#E3AF86', hair: '#3B2A22', style: 'short',  top: '#F0698A' },
    r11: { bg: '#EADFFB', skin: '#F6C9A6', hair: '#2B1E1A', style: 'long',   top: '#B79BEA' },
    r12: { bg: '#FFE7C2', skin: '#D9A47C', hair: '#2B1E1A', style: 'beard',  top: '#E58A4E' }
  };
  function cuteAvatarSvg(c) {
    var back = '', front = '', hijab = c.style === 'hijab', beard = '';
    if (c.style === 'long') back = '<path d="M15 34c-2-16 6-24 17-24s19 8 17 24c0 10 2 16 4 22H11c2-6 4-12 4-22z" fill="' + c.hair + '"/>';
    if (c.style === 'bob') back = '<path d="M14 36c-3-17 5-25 18-25s21 8 18 25c-1 6-3 8-5 9H19c-2-1-4-3-5-9z" fill="' + c.hair + '"/>';
    if (c.style === 'bun') back = '<circle cx="32" cy="10" r="7" fill="' + c.hair + '"/>';
    if (c.style === 'curly') back = '<g fill="' + c.hair + '"><circle cx="17" cy="26" r="7"/><circle cx="47" cy="26" r="7"/><circle cx="22" cy="15" r="8"/><circle cx="42" cy="15" r="8"/><circle cx="32" cy="12" r="8"/></g>';
    if (hijab) back = '<ellipse cx="32" cy="32" rx="20" ry="22" fill="' + c.hair + '"/>';
    var shoulders = hijab ? c.hair : c.top;
    if (c.style === 'long' || c.style === 'short' || c.style === 'bun' || c.style === 'bob' || c.style === 'spiky' || c.style === 'curly' || c.style === 'beard') {
      front = '<path d="M17 30c-1-11 6-17 15-17s16 6 15 17c-3-5-6-8-9-8-6 3-14 3-21 8z" fill="' + c.hair + '"/>';
    }
    if (c.style === 'spiky') front = '<path d="M17 30c-2-8 0-13 4-15l2 5l4-7l3 6l4-7l3 7l4-5l1 6c3 2 4 6 3 10c-3-5-6-8-9-8-6 3-14 3-21 8z" fill="' + c.hair + '"/>';
    if (hijab) front = '<path d="M18 31c0-10 6-15 14-15s14 5 14 15c-4-5-8-7-14-7s-10 2-14 7z" fill="' + c.hair + '"/>';
    if (c.style === 'beard') beard = '<path d="M19 35c2 13 24 13 26 0c-4 5-22 5-26 0z" fill="' + c.hair + '"/>';
    return '<svg class="av-cute" viewBox="0 0 64 64" aria-hidden="true" focusable="false">' +
      '<rect width="64" height="64" fill="' + c.bg + '"/>' + back +
      '<path d="M8 64c2-11 9-16 24-16s22 5 24 16z" fill="' + shoulders + '"/>' +
      '<rect x="28" y="42" width="8" height="8" rx="3" fill="' + c.skin + '"/>' +
      (hijab ? '<ellipse cx="32" cy="33" rx="13" ry="13.5" fill="' + c.skin + '"/>' : '<circle cx="32" cy="32" r="14" fill="' + c.skin + '"/>') +
      beard + front +
      '<circle cx="26.5" cy="33" r="2.2" fill="#3B2A22"/><circle cx="37.5" cy="33" r="2.2" fill="#3B2A22"/>' +
      '<circle cx="25.8" cy="32.2" r=".8" fill="#fff"/><circle cx="36.8" cy="32.2" r=".8" fill="#fff"/>' +
      '<ellipse cx="22.5" cy="38" rx="3.2" ry="2" fill="#FF8FB3" opacity=".65"/><ellipse cx="41.5" cy="38" rx="3.2" ry="2" fill="#FF8FB3" opacity=".65"/>' +
      '<path d="M29 38.5q3 3 6 0" fill="none" stroke="#3B2A22" stroke-width="1.6" stroke-linecap="round"/></svg>';
  }
  function avatarHtml(r, size) {
    var photo = '';
    var cute = (r.id && !r.local && CUTE_AV[r.id]) ? cuteAvatarSvg(CUTE_AV[r.id]) : '';
    return '<span class="avatar">' + (cute ||
      '<svg class="av-default" viewBox="0 0 48 48" aria-hidden="true" focusable="false">' +
      '<circle cx="24" cy="18" r="8.5" fill="currentColor"/><path d="M7 44c1.5-10 8.5-15 17-15s15.5 5 17 15z" fill="currentColor"/></svg>') + photo + '</span>';
  }
  function ratingSummary(list) {
    var avg = list.reduce(function (s, r) { return s + r.rating; }, 0) / list.length;
    var dist = [5, 4, 3, 2, 1].map(function (n) { return { n: n, c: list.filter(function (r) { return r.rating === n; }).length }; });
    return '<div class="panel-glass rating-summary"><div class="rs-score">' + avg.toFixed(1) + '</div>' + stars(avg, 20) +
      '<p class="rs-count">' + list.length + ' reviews</p><ul class="dist-list">' + dist.map(function (d) {
        return '<li><span>' + d.n + ' ★</span><span class="dist-bar"><span style="width:' + (d.c / list.length * 100) + '%"></span></span><span>' + d.c + '</span></li>';
      }).join('') + '</ul></div>';
  }

  var carouselTimer = null;
  function initCarousel(root) {
    var list = allReviews().filter(function (r) { return r.rating >= 4; }).slice(0, 8);
    var avg = allReviews().reduce(function (s, r) { return s + r.rating; }, 0) / allReviews().length;
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var index = 0, paused = reduce, hovering = false;

    root.innerHTML = '<div class="rc-top"><span class="rc-avg">' + stars(avg, 18) + '<strong>' + avg.toFixed(1) + '</strong> average from ' + allReviews().length + ' reviews</span></div>' +
      '<div class="rc-viewport"><div class="rc-track">' + list.map(function (r, i) {
        return '<div class="rc-slide" role="group" aria-roledescription="slide" aria-label="' + (i + 1) + ' of ' + list.length + '"><div class="rc-card panel-glass">' +
          '<div class="rc-person">' + avatarHtml(r, 64) + '<strong class="rc-name">' + esc(r.name) + '</strong></div>' +
          '<div class="rc-stars">' + stars(r.rating, 20) + '</div>' +
          '<p class="rc-text">' + esc(r.text) + '</p></div></div>';
      }).join('') + '</div></div>' +
      '<div class="rc-controls"><button type="button" class="icon-btn" data-rc="prev" aria-label="Previous review">' + ic('left', 20) + '</button>' +
      '<div class="rc-dots">' + list.map(function (r, i) { return '<button type="button" class="rc-dot" data-rc-dot="' + i + '" aria-label="Show review ' + (i + 1) + '"></button>'; }).join('') + '</div>' +
      '<button type="button" class="icon-btn" data-rc="next" aria-label="Next review">' + ic('right', 20) + '</button></div>';

    var track = $('.rc-track', root), dots = $$('.rc-dot', root);
    function show(i) {
      index = (i + list.length) % list.length;
      track.style.transform = 'translateX(-' + index * 100 + '%)';
      $$('.rc-slide', root).forEach(function (s, n) { s.setAttribute('aria-hidden', n === index ? 'false' : 'true'); });
      dots.forEach(function (d, n) { d.classList.toggle('active', n === index); if (n === index) d.setAttribute('aria-current', 'true'); else d.removeAttribute('aria-current'); });
    }
    function start() {
      clearInterval(carouselTimer);
      carouselTimer = setInterval(function () { if (!paused && !hovering && !document.hidden) show(index + 1); }, 5000);
    }
    root.addEventListener('click', function (e) {
      var b = e.target.closest('[data-rc],[data-rc-dot]');
      if (!b) return;
      if (b.hasAttribute('data-rc-dot')) show(Number(b.getAttribute('data-rc-dot')));
      else if (b.getAttribute('data-rc') === 'prev') show(index - 1);
      else if (b.getAttribute('data-rc') === 'next') show(index + 1);
      else {
        paused = !paused;
        b.innerHTML = ic(paused ? 'play' : 'pause', 16);
        b.setAttribute('aria-label', (paused ? 'Start' : 'Pause') + ' automatic rotation');
      }
    });
    root.addEventListener('mouseenter', function () { hovering = true; });
    root.addEventListener('mouseleave', function () { hovering = false; });
    root.addEventListener('focusin', function () { hovering = true; });
    root.addEventListener('focusout', function () { hovering = false; });
    show(0); start();
  }

  function initReviewsPage() {
    var filterRating = 0, filterCat = 'all';
    function draw() {
      var all = allReviews();
      $('#rating-summary').innerHTML = ratingSummary(all);
      var shown = all.filter(function (r) { return (!filterRating || r.rating === filterRating) && (filterCat === 'all' || r.cat === filterCat); });
      $('#rv-count').textContent = shown.length + ' review' + (shown.length === 1 ? '' : 's');
      $('#rv-list').innerHTML = shown.length
        ? '<div class="row g-4">' + shown.map(function (r) { return '<div class="col-12 col-md-6 col-lg-4">' + reviewCard(r, true) + '</div>'; }).join('') + '</div>'
        : '<div class="empty-state panel-glass"><h3>No reviews match these filters</h3><p>Try a different rating or category.</p></div>';
    }
    $('#rv-cat-filter').innerHTML = '<option value="all">All categories</option>' + D.categories.map(function (c) { return '<option value="' + c.slug + '">' + esc(c.name) + '</option>'; }).join('');
    $('#rv-cat').innerHTML = '<option value="">Choose…</option>' + D.categories.map(function (c) { return '<option value="' + c.slug + '">' + esc(c.name) + '</option>'; }).join('');
    $('#rv-rating-filter').addEventListener('change', function (e) { filterRating = Number(e.target.value); draw(); });
    $('#rv-cat-filter').addEventListener('change', function (e) { filterCat = e.target.value; draw(); });
    $('#rv-clear').addEventListener('click', function () {
      filterRating = 0; filterCat = 'all'; $('#rv-rating-filter').value = '0'; $('#rv-cat-filter').value = 'all'; draw();
    });
    var picked = 0;
    var starBox = $('#rv-stars');
    starBox.innerHTML = [1, 2, 3, 4, 5].map(function (n) {
      return '<button type="button" class="star-btn" role="radio" aria-checked="false" aria-label="' + n + ' star' + (n > 1 ? 's' : '') + '" data-star="' + n + '">' + ic('star', 26, 'star') + '</button>';
    }).join('');
    starBox.addEventListener('click', function (e) {
      var b = e.target.closest('[data-star]'); if (!b) return;
      picked = Number(b.getAttribute('data-star')); starBox.setAttribute('data-value', picked);
      $$('[data-star]', starBox).forEach(function (s) {
        var n = Number(s.getAttribute('data-star'));
        s.setAttribute('aria-checked', n === picked); $('.ic', s).setAttribute('class', 'ic star' + (n <= picked ? ' on' : ''));
      });
      $('#rv-err-rating').hidden = true;
    });
    window.__bbSubmitReview = function (form) {
      var v = { name: form.elements.name.value.trim(), cat: form.elements.cat.value, text: form.elements.text.value.trim() };
      var errors = {};
      if (!v.name) errors.name = 'Please enter your name.';
      if (!v.cat) errors.cat = 'Please choose a product category.';
      if (!picked) errors.rating = 'Please choose a star rating.';
      if (v.text.length < 10) errors.text = 'Please write at least 10 characters of feedback.';
      ['name', 'cat', 'rating', 'text'].forEach(function (k) {
        var el = $('#rv-err-' + k); el.textContent = errors[k] || ''; el.hidden = !errors[k];
      });
      if (Object.keys(errors).length) return;
      var saved = loadJSON(REVIEWS_KEY, []);
      saved.unshift({ id: 'local-' + Date.now(), name: v.name, cat: v.cat, rating: picked, date: new Date().toISOString().slice(0, 10), text: v.text });
      saveJSON(REVIEWS_KEY, saved);
      form.reset(); picked = 0;
      $$('[data-star]', starBox).forEach(function (s) { s.setAttribute('aria-checked', 'false'); $('.ic', s).setAttribute('class', 'ic star'); });
      $('#rv-thanks-name').textContent = v.name.split(' ')[0];
      form.hidden = true;
      var th = $('#rv-thanks'); th.hidden = false; th.focus();
      draw();
    };
    $('#rv-again').addEventListener('click', function () {
      $('#rv-thanks').hidden = true;
      var f = $('.review-form'); f.hidden = false; $('#rv-name').focus();
    });
    draw();
  }

  var lbState = null;
  function galleryPicture(g, size) { return pictureBox(g.icon, g.title, size, photoSrc('gallery', g.id), photoFocus('gallery', g.id)); }
  function initGallery() {
    var group = 'all';
    function draw() {
      var items = group === 'all' ? D.gallery : D.gallery.filter(function (g) { return g.group === group; });
      $('#gallery-grid').innerHTML = items.map(function (g, i) {
        return '<button type="button" class="gallery-item" data-lb="' + g.id + '" aria-label="View ' + esc(g.title) + '">' + galleryPicture(g, 'card') +
          '<span class="gallery-caption"><strong>' + esc(g.title) + '</strong><small>' + esc(g.caption) + '</small></span></button>';
      }).join('');
    }
    $('#gallery-filters').innerHTML = '<button type="button" class="chip-opt active" data-group="all" aria-pressed="true">All</button>' +
      D.galleryGroups.map(function (g) { return '<button type="button" class="chip-opt" data-group="' + g.id + '" aria-pressed="false">' + esc(g.label) + '</button>'; }).join('');
    $('#gallery-filters').addEventListener('click', function (e) {
      var b = e.target.closest('[data-group]'); if (!b) return;
      group = b.getAttribute('data-group');
      $$('[data-group]', $('#gallery-filters')).forEach(function (x) { var on = x === b; x.classList.toggle('active', on); x.setAttribute('aria-pressed', on); });
      draw();
    });
    window.__bbGalleryItems = function () { return group === 'all' ? D.gallery : D.gallery.filter(function (g) { return g.group === group; }); };
    draw();
  }
  function openLightbox(id) {
    var items = window.__bbGalleryItems ? window.__bbGalleryItems() : D.gallery;
    var index = 0; items.forEach(function (g, i) { if (g.id === id) index = i; });
    lbState = { items: items, index: index };
    openModal('<div class="lightbox panel-solid" role="dialog" aria-modal="true" aria-labelledby="lb-title">' +
      '<button type="button" class="icon-btn pm-close" data-close-modal aria-label="Close image viewer">' + ic('x', 20) + '</button>' +
      '<div id="lb-body"></div><div class="lb-nav"><button type="button" class="icon-btn" data-lb-step="-1" aria-label="Previous image">' + ic('left', 20) + '</button>' +
      '<button type="button" class="icon-btn" data-lb-step="1" aria-label="Next image">' + ic('right', 20) + '</button></div></div>');
    drawLightbox();
  }
  function drawLightbox() {
    var g = lbState.items[lbState.index];
    var grp = D.galleryGroups.filter(function (x) { return x.id === g.group; })[0];
    $('#lb-body').innerHTML = galleryPicture(g, 'modal') + '<div class="lb-text"><p class="eyebrow">' + esc(grp ? grp.label : '') + '</p>' +
      '<h2 id="lb-title" class="section-title">' + esc(g.title) + '</h2><p>' + esc(g.caption) + '</p>' +
      '<p class="field-hint">' + (lbState.index + 1) + ' of ' + lbState.items.length + '</p></div>';
  }

  function featured(ids) { return ids.map(getProduct).filter(Boolean); }
  function featuredHtml(list) {
    return '<div class="feature-grid">' + list.map(function (p) {
      return '<article class="feature-item"><div class="feature-media" data-open-product="' + p.id + '">' + productPicture(p, 'card') + '</div>' +
        '<div class="feature-body"><p class="eyebrow">' + esc((getCategory(p.cat) || {}).name || 'Signature') + '</p>' +
        '<h3 class="feature-title">' + esc(p.name) + '</h3><p class="feature-desc">' + esc(p.desc) + '</p>' +
        '<div class="feature-foot"><span class="price-now">' + (p.custom ? 'From ' : '') + money(p.price) + '</span>' +
        '<button type="button" class="btn-ghost-gold btn-sm-gold" data-open-product="' + p.id + '">View details</button></div></div></article>';
    }).join('') + '</div>';
  }
  var HOME_CATS = ['cakes', 'cupcakes', 'pastries', 'croissants', 'donuts', 'coffee'];
  function initHero() {
    var hero = $('[data-hero]');
    if (!hero) return;
    var video = $('.hero-video', hero), btn = $('[data-hero-toggle]', hero);
    if (!video) return;
    var userPaused = false;
    function conn() { return navigator.connection || {}; }
    function stillOnly() { return prefersReducedMotion() || conn().saveData === true; }
    function label() {
      var playing = !video.paused;
      btn.innerHTML = ic(playing ? 'pause' : 'play', 18);
      btn.setAttribute('aria-label', playing ? 'Pause background video' : 'Play background video');
    }
    function fallback() { video.classList.remove('is-playing'); if (btn) btn.hidden = true; }
    video.addEventListener('playing', function () { video.classList.add('is-playing'); if (btn) { btn.hidden = false; label(); } });
    video.addEventListener('pause', function () { if (btn && !btn.hidden) label(); });
    video.addEventListener('error', fallback);
    var src = $('source', video);
    if (src) src.addEventListener('error', fallback);
    if (btn) btn.addEventListener('click', function () {
      if (video.paused) { userPaused = false; var p = video.play(); if (p && p.catch) p.catch(fallback); }
      else { userPaused = true; video.pause(); }
    });
    function apply() {
      if (stillOnly()) { video.pause(); video.removeAttribute('autoplay'); video.classList.remove('is-playing'); if (btn) btn.hidden = true; }
      else if (!userPaused && video.paused) { var p = video.play(); if (p && p.catch) p.catch(function () { }); }
    }
    if (window.matchMedia) {
      var mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      if (mq.addEventListener) mq.addEventListener('change', apply);
    }
    document.addEventListener('visibilitychange', function () { if (document.hidden) video.pause(); else if (!userPaused) apply(); });
    apply();
  }
  function initHome() {
    initHero();
    $('#home-categories').innerHTML = HOME_CATS.map(getCategory).filter(Boolean).map(function (c) {
      return '<a href="' + L(c.slug + '.html') + '" class="category-card">' + categoryPicture(c, 84) + '<span class="category-name">' + esc(c.name) + '</span></a>';
    }).join('');
    $('#home-best').innerHTML = gridHtml(D.products.filter(function (p) { return p.badge === 'Best Seller'; }).concat(featured(['cook-choc-chip'])).filter(function (p, i, a) { return a.indexOf(p) === i; }).slice(0, 4));
    $('#home-new').innerHTML = gridHtml(D.products.filter(function (p) { return p.badge === 'New'; }).slice(0, 4), '', 'product-grid-compact');
    $('#home-featured').innerHTML = featuredHtml(featured(['past-mille-feuille', 'tart-lemon', 'bread-sourdough', 'coffee-latte']));
    $('#home-offers').innerHTML = D.offers.slice(0, 3).map(function (o, i) {
      return '<div class="col-12 col-md-4"><div class="offer-card panel-glass h-100 reveal" data-reveal style="transition-delay:' + i * 80 + 'ms"><span class="offer-tag">' + esc(o.tag) + '</span>' +
        art(o.icon, 78) + '<h3>' + esc(o.title) + '</h3><p>' + esc(o.desc) + '</p><a href="' + L('offers.html') + '" class="btn-ghost-gold">See offers</a></div></div>';
    }).join('');
    $('#home-gallery').innerHTML = D.gallery.filter(function (g) { return ['g1', 'g3', 'g5', 'g7'].indexOf(g.id) > -1 || false; }).concat(D.gallery).slice(0, 4).map(function (g) {
      return '<a class="gallery-item" href="' + L('gallery.html') + '" aria-label="Open gallery: ' + esc(g.title) + '">' + galleryPicture(g, 'card') +
        '<span class="gallery-caption"><strong>' + esc(g.title) + '</strong><small>' + esc(g.caption) + '</small></span></a>';
    }).join('');
    initCarousel($('#review-carousel'));
  }
  function initOffers() {
    $('#offers-grid').innerHTML = D.offers.map(function (o, i) {
      return '<div class="col-12 col-md-6 col-lg-4"><div class="offer-card panel-glass h-100 reveal" data-reveal style="transition-delay:' + (i % 3) * 80 + 'ms">' +
        '<span class="offer-tag">' + esc(o.tag) + '</span>' + art(o.icon, 92) + '<h2 class="offer-title">' + esc(o.title) + '</h2><p>' + esc(o.desc) + '</p>' +
        '<p class="offer-terms"><strong>Terms:</strong> ' + esc(o.terms) + '</p><a href="' + pageLink(o.to) + '" class="btn-gold">' + esc(o.cta) + '</a></div></div>';
    }).join('');
  }
  function initFaq() {
    var open = 0;
    function draw() {
      $('#faq-list').innerHTML = D.faqs.map(function (item, i) {
        var on = open === i;
        return '<div class="faq-item panel-glass' + (on ? ' open' : '') + '"><h2 class="faq-q"><button type="button" id="faq-btn-' + i + '" aria-expanded="' + on +
          '" aria-controls="faq-panel-' + i + '" data-faq="' + i + '"><span>' + esc(item.q) + '</span>' + ic('down', 20, 'faq-chev') + '</button></h2>' +
          '<div id="faq-panel-' + i + '" role="region" aria-labelledby="faq-btn-' + i + '" class="faq-a"' + (on ? '' : ' hidden') + '><p>' + esc(item.a) + '</p></div></div>';
      }).join('');
    }
    $('#faq-list').addEventListener('click', function (e) {
      var b = e.target.closest('[data-faq]'); if (!b) return;
      var i = Number(b.getAttribute('data-faq')); open = open === i ? -1 : i; draw();
      var again = $('#faq-btn-' + i); if (again) again.focus();
    });
    draw();
  }
  function initCategoryPage() {
    var slug = document.body.getAttribute('data-cat');
    var c = getCategory(slug);
    if (!c) return;
    $('#cat-title').textContent = c.name;
    $('#cat-sub').textContent = c.desc;
    $('#cat-art').innerHTML = categoryPicture(c, 84);
        var strip = $('#cat-strip');
    strip.innerHTML = D.categories.map(function (x) {
      return '<a href="' + L(x.slug + '.html') + '" class="cat-pill' + (x.slug === slug ? ' active' : '') + '">' + art(x.icon, 26) + esc(x.name) + '</a>';
    }).join('');
    try { var saved = sessionStorage.getItem('bb-strip-left'); if (saved !== null) strip.scrollLeft = Number(saved); } catch (e) { }
    var activePill = strip.querySelector('.cat-pill.active');
    if (activePill) {
      var sb = strip.getBoundingClientRect(), ab = activePill.getBoundingClientRect();
      if (ab.left < sb.left || ab.right > sb.right) strip.scrollLeft += (ab.left - sb.left) - (sb.width - ab.width) / 2;
    }
    strip.addEventListener('scroll', function () {
      try { sessionStorage.setItem('bb-strip-left', String(strip.scrollLeft)); } catch (e) { }
    });
    initBrowser($('#product-browser'), slug);
  }
  function renderStaticLists() {
    var c = $('#menu-strip');
    if (c) c.innerHTML = D.categories.map(function (x) { return '<a href="' + L(x.slug + '.html') + '" class="cat-pill">' + art(x.icon, 26) + esc(x.name) + '</a>'; }).join('');
    var s = $('#sitemap-cats');
    if (s) s.innerHTML = D.categories.map(function (x) { return '<li><a href="' + L(x.slug + '.html') + '">' + esc(x.name) + '</a></li>'; }).join('');
    var ci = $('#contact-details');
    if (ci) ci.innerHTML = '<li>' + ic('mail', 18) + ' <a href="mailto:' + esc(CFG.contact.email) + '">' + esc(CFG.contact.email) + '</a></li>' +
      '<li>' + ic('phone', 18) + ' ' + esc(CFG.contact.phone) + '</li><li>' + ic('pin', 18) + ' ' + esc(CFG.contact.address) + '</li>' +
      '<li>' + ic('clock', 18) + '<span>' + CFG.contact.hours.map(function (h) { return '<span class="d-block">' + esc(h[0]) + ': ' + esc(h[1]) + '</span>'; }).join('') + '</span></li>';
    $$('[data-open-now]').forEach(function (el) { el.innerHTML = openBadgeHtml(); });
    $$('[data-art]').forEach(function (el) { el.innerHTML = art(el.getAttribute('data-art'), Number(el.getAttribute('data-size') || 100)); });
    $$('[data-icon]').forEach(function (el) { el.innerHTML = ic(el.getAttribute('data-icon'), 24); });
  }

  function setupReveal() {
    var els = $$('[data-reveal]');
    els.forEach(function (el) { el.classList.add('reveal'); });
    if (!('IntersectionObserver' in window)) { els.forEach(function (el) { el.classList.add('is-visible'); }); return; }
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-visible'); obs.unobserve(en.target); } });
    }, { threshold: 0.12 });
    els.forEach(function (el) { obs.observe(el); });
  }

  function validEmail(s) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s.trim()); }

  function submitContact(form) {
    var v = { name: form.elements.name.value, email: form.elements.email.value, subject: form.elements.subject.value, message: form.elements.message.value };
    var errors = {};
    if (!v.name.trim()) errors.name = 'Please enter your name.';
    if (!v.email.trim()) errors.email = 'Please enter your email address.';
    else if (!validEmail(v.email)) errors.email = 'Please enter a valid email address.';
    if (!v.subject.trim()) errors.subject = 'Please enter a subject.';
    if (v.message.trim().length < 10) errors.message = 'Please write a message of at least 10 characters.';
    ['name', 'email', 'subject', 'message'].forEach(function (k) {
      var el = $('#ct-err-' + k), input = form.elements[k];
      el.textContent = errors[k] || ''; el.hidden = !errors[k];
      input.setAttribute('aria-invalid', errors[k] ? 'true' : 'false');
    });
    var keys = Object.keys(errors);
       if (keys.length) { form.elements[keys[0]].focus(); return; }
    var firstName = v.name.trim().split(' ')[0];
    form.reset();
    $('#ct-thanks-name').textContent = firstName;
    form.hidden = true;
    var th = $('#ct-thanks'); th.hidden = false; th.focus();
    $('#ct-again').onclick = function () {
      th.hidden = true;
      form.hidden = false;
      form.elements.name.focus();
    };
  }
  function submitNewsletter(form) {
    var msg = form.parentNode.querySelector('[data-news-msg]') || form.nextElementSibling;
    var input = form.elements[0];
    if (!validEmail(input.value)) { msg.textContent = 'Please enter a valid email address.'; msg.className = 'field-error'; msg.hidden = false; return; }
    msg.textContent = 'Thank you for subscribing!';
    msg.className = 'form-success'; msg.hidden = false; form.reset();
  }

  function bindGlobalEvents() {
    document.addEventListener('click', function (e) {
      var t = e.target;
      var el;
      if ((el = t.closest('[data-open-product]'))) { openProduct(el.getAttribute('data-open-product')); return; }
      if ((el = t.closest('[data-wish]'))) { toggleWish(el.getAttribute('data-wish')); return; }
      if ((el = t.closest('[data-add]'))) {
        var p = getProduct(el.getAttribute('data-add'));
        if (p.custom) openProduct(p.id); else { addItem(p.id, {}, 1); toast(p.name + ' added to your cart'); }
        return;
      }
      if (t.closest('[data-open-cart]')) { openCart(); return; }
      if (t.closest('[data-close-cart]')) { closeCart(); return; }
      if (t.closest('[data-open-checkout]')) { openCheckout(); return; }
      if (t.closest('[data-theme-toggle]')) { applyTheme(currentTheme() === 'dark' ? 'light' : 'dark'); return; }
      if ((el = t.closest('[data-nav-toggle]'))) {
        var links = $('#nav-links'), open = !links.classList.contains('open');
        links.classList.toggle('open', open); el.setAttribute('aria-expanded', open);
        el.innerHTML = ic(open ? 'x' : 'menu', 22); return;
      }
      if ((el = t.closest('[data-qty]'))) {
        var key = el.getAttribute('data-qty'), item = cart.filter(function (i) { return i.key === key; })[0];
        if (item) setQty(key, item.qty + Number(el.getAttribute('data-delta')));
        return;
      }
      if ((el = t.closest('[data-remove]'))) { removeItem(el.getAttribute('data-remove')); return; }
      if (t.closest('[data-clear-cart]')) { clearCart(); return; }
      if ((el = t.closest('[data-opt]')) && pm) { pmChipClick(el); return; }
      if ((el = t.closest('[data-pm-qty]')) && pm) { pm.qty = Math.max(1, Math.min(99, pm.qty + Number(el.getAttribute('data-pm-qty')))); pmUpdateTotal(); return; }
      if (t.closest('[data-pm-add]') && pm) { pmAdd(); return; }
      if (t.closest('[data-close-modal]')) { closeModal(); return; }
      if ((el = t.closest('[data-lb]'))) { openLightbox(el.getAttribute('data-lb')); return; }
      if ((el = t.closest('[data-lb-step]')) && lbState) {
        lbState.index = (lbState.index + Number(el.getAttribute('data-lb-step')) + lbState.items.length) % lbState.items.length; drawLightbox(); return;
      }
      if ((el = t.closest('[data-share-location]'))) { shareLocation(el); return; }
      if (t.closest('[data-change-location]')) { openLocationScreen(); return; }
      if (t.closest('.nav-links a')) { var nl = $('#nav-links'); if (nl) nl.classList.remove('open'); }
    });
    document.addEventListener('mousedown', function (e) {
      if (e.target.hasAttribute && e.target.hasAttribute('data-modal-backdrop')) closeModal();
    });
    document.addEventListener('input', function (e) {
      if (!pm) return;
      if (e.target.id === 'pm-message') { pm.options.message = e.target.value; $('#pm-msg-count').textContent = e.target.value.length; }
      if (e.target.id === 'pm-note') pm.options.note = e.target.value;
    });
    document.addEventListener('keydown', function (e) {
      var modal = $('#modal-root .modal-backdrop-bb'), drawer = $('#side-cart');
      if (e.key === 'Escape') {
        if (modal) closeModal(); else if (drawer && drawer.classList.contains('open')) closeCart();
        else { var nl = $('#nav-links'); if (nl) nl.classList.remove('open'); }
      }
      if (e.key === 'Tab') {
        if (modal) trapTab(modal, e); else if (drawer && drawer.classList.contains('open')) trapTab(drawer, e);
      }
      if (lbState && modal) {
        if (e.key === 'ArrowRight') { lbState.index = (lbState.index + 1) % lbState.items.length; drawLightbox(); }
        if (e.key === 'ArrowLeft') { lbState.index = (lbState.index - 1 + lbState.items.length) % lbState.items.length; drawLightbox(); }
      }
    });
    document.addEventListener('submit', function (e) {
      var f = e.target, kind = f.getAttribute && f.getAttribute('data-form');
      if (!kind) return;
      e.preventDefault();
      if (kind === 'checkout') submitCheckout(f);
      else if (kind === 'contact') submitContact(f);
      else if (kind === 'newsletter') submitNewsletter(f);
      else if (kind === 'review' && window.__bbSubmitReview) window.__bbSubmitReview(f);
    });
    window.addEventListener('storage', function (e) {
      if (e.key === CART_KEY) { cart = loadJSON(CART_KEY, []).filter(function (i) { return i && getProduct(i.id) && i.qty > 0; }); renderCartUI(); }
    });
  }

  function initPage() {
    clearInterval(carouselTimer);
    var page = document.body.getAttribute('data-page');
    var nav = document.body.getAttribute('data-nav');
    $$('[data-navlink]').forEach(function (a) { a.classList.toggle('active', a.getAttribute('data-navlink') === nav); });
    renderStaticLists();
    if (page === 'home') initHome();
    else if (page === 'menu') initBrowser($('#product-browser'), null);
    else if (page === 'category') initCategoryPage();
    else if (page === 'gallery') initGallery();
    else if (page === 'offers') initOffers();
    else if (page === 'reviews') initReviewsPage();
    else if (page === 'faq') initFaq();
    renderCartUI();
    updateWishUI();
    setupReveal();
  }


  var INTRO_KEY = 'bb-intro-done';
  var WELCOME_MS = 2800;

  function prefersReducedMotion() { return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); }

  function renderWelcomeScreen(stage) {
    stage.innerHTML = '<div class="intro-welcome">' +
      '<span class="intro-logo">' + logoMark(76) + '</span>' +
      '<p class="eyebrow intro-eyebrow">Welcome to</p>' +
      '<h1 class="intro-title">Bakerz <span class="gold-text">Bite</span></h1>' +
      '<span class="intro-rule" aria-hidden="true"></span>' +
      '<p class="intro-motto">Where Smiles Are Served Daily.</p>' +
      '<p class="intro-tagline">Handcrafted delights for every beautiful moment.</p></div>';
  }

  var LOC_KEY = 'bb-location';
  var LOC_CITIES = [
    { id: 'karachi', name: 'Karachi', icon: 'building', lat: 24.8607, lng: 67.0011,
      areas: ['Clifton', 'DHA', 'Gulshan-e-Iqbal', 'North Nazimabad', 'PECHS'] },
    { id: 'hyderabad', name: 'Hyderabad', icon: 'store', lat: 25.3960, lng: 68.3578,
      areas: ['Latifabad', 'Qasimabad', 'Hirabad', 'Autobhan Road'] },
    { id: 'lahore', name: 'Lahore', icon: 'landmark', lat: 31.5204, lng: 74.3587,
      areas: ['Gulberg', 'DHA', 'Johar Town', 'Model Town', 'Bahria Town'] }
  ];
  function distanceKm(a, b, c, d) {
    var r = Math.PI / 180, x = Math.sin((c - a) * r / 2), y = Math.sin((d - b) * r / 2);
    var h = x * x + Math.cos(a * r) * Math.cos(c * r) * y * y;
    return 6371 * 2 * Math.asin(Math.sqrt(h));
  }

  function renderLocationScreen(stage, done, onCancel) {
    var saved = loadJSON(LOC_KEY, null) || {};
    var st = { mode: saved.mode === 'pickup' ? 'pickup' : 'delivery', city: saved.city || '', area: saved.area || '' };
    stage.innerHTML = '<div class="loc-card" data-intro-step="location">' +
      '<span class="loc-logo">' + logoMark(52) + '</span>' +
      '<p class="eyebrow loc-eyebrow">Welcome to Bakerz Bite</p>' +
      '<h2 class="loc-title">Where should we prepare your order?</h2>' +
      '<div class="loc-modes" role="group" aria-label="Order type">' +
        '<button type="button" class="loc-mode" data-mode="delivery">' + ic('bike', 18) + ' Delivery</button>' +
        '<button type="button" class="loc-mode" data-mode="pickup">' + ic('bag', 18) + ' Pick-up</button></div>' +
      '<p class="loc-label">Select your location</p>' +
      '<button type="button" class="btn-gold loc-locate" data-loc-locate>' + ic('locate', 18) + ' Use Current Location</button>' +
      '<p class="loc-status" data-loc-status role="status" aria-live="polite"></p>' +
      '<div class="loc-cities" role="group" aria-label="Choose your city">' + LOC_CITIES.map(function (c) {
        return '<button type="button" class="loc-city" data-city="' + c.id + '">' + ic(c.icon, 26) + '<span>' + esc(c.name) + '</span></button>';
      }).join('') + '</div>' +
      '<label class="loc-label loc-label-left" for="loc-area" data-loc-area-label>Delivery area</label>' +
      '<select id="loc-area" class="form-select bb-input loc-area"></select>' +
      '<button type="button" class="btn-gold loc-continue" data-loc-continue disabled>Continue to Website ' + ic('arrow', 18) + '</button>' +
      (onCancel ? '<button type="button" class="btn-soft loc-cancel" data-loc-cancel>Cancel</button>' : '') +
      '<p class="loc-note">Your choice stays in this browser.</p></div>';

    var card = $('.loc-card', stage), sel = $('#loc-area', card), status = $('[data-loc-status]', card), go = $('[data-loc-continue]', card);
    function city() { return LOC_CITIES.filter(function (c) { return c.id === st.city; })[0]; }
    function draw() {
      $$('[data-mode]', card).forEach(function (b) { var on = b.getAttribute('data-mode') === st.mode; b.classList.toggle('active', on); b.setAttribute('aria-pressed', on); });
      $$('[data-city]', card).forEach(function (b) { var on = b.getAttribute('data-city') === st.city; b.classList.toggle('active', on); b.setAttribute('aria-pressed', on); });
      var c = city(), pick = st.mode === 'pickup';
      $('[data-loc-area-label]', card).textContent = pick ? 'Pick-up branch' : 'Delivery area';
      sel.innerHTML = '<option value="">' + (pick ? 'Please select a branch' : 'Please select your area') + '</option>' +
        (c ? c.areas.map(function (a) {
          var label = pick ? a + ' branch' : a;
          return '<option value="' + esc(a) + '"' + (a === st.area ? ' selected' : '') + '>' + esc(label) + '</option>';
        }).join('') : '');
      sel.disabled = !c;
      go.disabled = !(c && st.area && c.areas.indexOf(st.area) > -1);
    }
    card.addEventListener('click', function (e) {
      var m = e.target.closest('[data-mode]'), c = e.target.closest('[data-city]');
      if (m) { st.mode = m.getAttribute('data-mode'); draw(); }
      else if (c) { if (st.city !== c.getAttribute('data-city')) st.area = ''; st.city = c.getAttribute('data-city'); status.textContent = ''; draw(); }
    });
    sel.addEventListener('change', function () { st.area = sel.value; draw(); });

    $('[data-loc-locate]', card).addEventListener('click', function () {
      if (!('geolocation' in navigator)) { status.textContent = 'Location is not available in this browser. Please choose your city below.'; return; }
      status.textContent = 'Asking your browser for permission…';
      navigator.geolocation.getCurrentPosition(function (pos) {
        var best = null, bestKm = Infinity;
        LOC_CITIES.forEach(function (c) { var km = distanceKm(pos.coords.latitude, pos.coords.longitude, c.lat, c.lng); if (km < bestKm) { best = c; bestKm = km; } });
        if (bestKm <= 100) {
          st.city = best.id; st.area = '';
          status.textContent = 'Nearest city: ' + best.name + ' (approximate). Please choose your area.';
        } else {
          status.textContent = 'You seem to be outside our delivery cities. Please choose a city below.';
        }
        draw();
      }, function () {
        status.textContent = 'Location was not shared. No problem, please choose your city below.';
      }, { timeout: 10000, maximumAge: 600000 });
    });
    if (onCancel) $('[data-loc-cancel]', card).addEventListener('click', onCancel);
    go.addEventListener('click', function () {
      if (go.disabled) return;
      saveJSON(LOC_KEY, { mode: st.mode, city: st.city, area: st.area });
      done();
    });
    draw();
    $('.loc-mode.active', card).focus();
  }

  var introOpen = false;
  function openIntroOverlay(opts) {
    if (introOpen) return;
    introOpen = true;
    var html = document.documentElement;
    var shell = $('.app-shell');
    var opener = document.activeElement;
    var overlay = document.createElement('div');
    overlay.id = 'bb-intro';
    overlay.className = 'intro-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', opts.welcome ? 'Welcome to Bakerz Bite' : 'Choose your location');
    overlay.innerHTML = '<div class="intro-backdrop" aria-hidden="true">' + art('cake', 240) + art('croissant', 170) + art('cupcake', 150) + art('donut', 150) + '</div><div class="intro-stage"></div>';
    document.body.appendChild(overlay);
    if (shell) shell.setAttribute('inert', '');
    var stage = $('.intro-stage', overlay);
    var reduce = prefersReducedMotion();
    var fade = reduce ? 0 : 450;
    var finished = false, timer = null;

    function close(saved) {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      document.removeEventListener('keydown', onKey);
      if (opts.welcome) { try { sessionStorage.setItem(INTRO_KEY, '1'); } catch (e) { } }
      overlay.classList.add('is-leaving');
      setTimeout(function () {
        html.classList.remove('intro-pending');
        if (shell) shell.removeAttribute('inert');
        overlay.remove();
        introOpen = false;
        if (saved) { renderTicker(); if (!opts.welcome) toast('Location updated: ' + savedLocationText()); }
        if (!opts.welcome && opener && opener.focus && document.contains(opener)) opener.focus();
      }, fade);
    }
    function onKey(e) { if (e.key === 'Escape' && !opts.welcome) close(false); }
    function showLocation() {
      overlay.classList.add('is-location');
      overlay.setAttribute('aria-label', 'Choose your location');
      renderLocationScreen(stage, function () { close(true); }, opts.welcome ? null : function () { close(false); });
    }
    document.addEventListener('keydown', onKey);
    if (opts.welcome) {
      renderWelcomeScreen(stage);
      timer = setTimeout(function () {
        stage.classList.add('is-out');
        setTimeout(function () { showLocation(); stage.classList.remove('is-out'); }, fade);
      }, reduce ? 1500 : WELCOME_MS);
    } else showLocation();
  }
  function startIntro() {
    if (document.documentElement.classList.contains('intro-pending')) openIntroOverlay({ welcome: true });
  }
  function openLocationScreen() { openIntroOverlay({ welcome: false }); }

  var booted = false;
  function boot() {
    if (booted) return;
    booted = true;
    renderShell();
    applyTheme(currentTheme());
    bindGlobalEvents();
    initPage();
    startIntro();
  }
  window.BB = { initPage: initPage, boot: boot };
  if (!window.BB_MANUAL_BOOT) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
  }
})();
