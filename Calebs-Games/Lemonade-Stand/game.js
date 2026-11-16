// Sunny Squeeze: Lemonade Stand Tycoon  (v2)
// Mouse, Keyboard and Xbox / handheld controller (Gamepad API)
(() => {
  'use strict';

  const SAVE_KEY = 'sunny_squeeze_save_v2';
  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const DAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const TABS = ['market', 'recipe', 'location', 'marketing', 'machines'];

  const WEATHERS = [
    { id: 'heatwave', name: 'Heatwave', min: 93, max: 102, traffic: 1.45, ice: 5 },
    { id: 'sunny', name: 'Sunny', min: 79, max: 90, traffic: 1.2, ice: 4 },
    { id: 'cloudy', name: 'Cloudy', min: 68, max: 78, traffic: 0.95, ice: 3 },
    { id: 'breezy', name: 'Breezy', min: 60, max: 67, traffic: 0.8, ice: 2 },
    { id: 'rainy', name: 'Rainy', min: 52, max: 61, traffic: 0.45, ice: 1 }
  ];

  const LOCATIONS = [
    { id: 'driveway', name: 'Driveway', rent: 0, traffic: 1.0, price: 1.25, rain: 0.55, weekend: 1.15, desc: 'Free home turf. Friendly neighbors and bike kids.', tags: ['Free rent', 'Chill crowd'] },
    { id: 'park', name: 'City Park', rent: 15, traffic: 1.65, price: 1.5, rain: 0.35, weekend: 1.35, desc: 'Joggers, dog walkers and picnic crowds.', tags: ['$15 rent', 'Busy on weekends'] },
    { id: 'downtown', name: 'Downtown Plaza', rent: 35, traffic: 2.25, price: 2.0, rain: 0.75, weekend: 0.95, desc: 'Office workers with bigger wallets. Covered awnings.', tags: ['$35 rent', 'Pays more', 'Rain proof'] },
    { id: 'boardwalk', name: 'Boardwalk Beach', rent: 60, traffic: 3.1, price: 2.5, rain: 0.2, weekend: 1.3, desc: 'Huge tourist crowds. A goldmine when it is hot.', tags: ['$60 rent', 'Heat goldmine', 'Rain risk'] },
    { id: 'fairgrounds', name: 'County Fair', rent: 95, traffic: 4.1, price: 2.75, rain: 0.5, weekend: 1.45, desc: 'Massive festival crowds, especially on weekends.', tags: ['$95 rent', 'Mega crowds'] }
  ];

  const MARKET = [
    { id: 'lemons', name: 'Fresh Lemons', note: 'Per pitcher (10 cups)', packs: [[1, 0.35], [10, 3.2], [25, 7.5]] },
    { id: 'sugar', name: 'Cane Sugar', note: 'Per pitcher (10 cups)', packs: [[1, 0.2], [10, 1.8], [25, 4.25]] },
    { id: 'ice', name: 'Ice Cubes', note: 'Melts overnight w/o cooler', packs: [[10, 0.75], [30, 2.0], [80, 4.8]] },
    { id: 'cups', name: 'Paper Cups', note: '1 per customer', packs: [[10, 0.9], [25, 2.0], [60, 4.4]] }
  ];

  const PRESETS = [
    { name: 'Classic', lemons: 4, sugar: 4, ice: 4 },
    { name: 'Tart', lemons: 6, sugar: 3, ice: 4 },
    { name: 'Sweet', lemons: 4, sugar: 6, ice: 6 },
    { name: 'Cheap', lemons: 2, sugar: 3, ice: 2 }
  ];

  const PROMOS = [
    { id: 'flyers', name: 'Street Flyers', cost: 8, mult: 1.15, icon: 'flyer', desc: 'Hand out flyers around the block.', tag: '+15% crowd' },
    { id: 'samples', name: 'Free Sample Tray', cost: 6, mult: 1.0, icon: 'gift', desc: 'First 8 cups are free, but folks love you for it.', tag: '+Reputation' },
    { id: 'newspaper', name: 'Newspaper Ad', cost: 20, mult: 1.3, icon: 'news', desc: 'A coupon in the local paper.', tag: '+30% crowd' },
    { id: 'radio', name: 'Radio Jingle', cost: 45, mult: 1.55, icon: 'radio', desc: 'Catchy lemon song on the morning show.', tag: '+55% crowd' },
    { id: 'influencer', name: 'Influencer Shout-out', cost: 90, mult: 1.9, icon: 'phone', desc: 'A local star posts about your stand.', tag: '+90% crowd, +Rep' }
  ];

  const GEAR = [
    { id: 'icedtea', group: 'menu', name: 'Iced Tea Bar', price: 75, icon: 'cup', desc: 'Serve fresh iced tea! 28% of buyers add a $1.10 tea.' },
    { id: 'smoothie', group: 'menu', name: 'Fruit Smoothies', price: 140, icon: 'zap', desc: '26% of sunny-day buyers add a $1.65 fruit smoothie.' },
    { id: 'pretzel', group: 'menu', name: 'Warm Pretzels', price: 165, icon: 'box', desc: 'Great in cool/rainy weather! Adds $1.35 snack sales.' },
    { id: 'coffee', group: 'menu', name: 'Espresso & Cocoa', price: 220, icon: 'cup', desc: 'Morning & cool-weather hit! Adds $1.75 drink sales.' },
    { id: 'cooler', group: 'machines', name: 'Insulated Cooler', price: 45, icon: 'box', desc: 'Keeps 60% of leftover ice overnight.' },
    { id: 'icemaker', group: 'machines', name: 'Ice Machine', price: 120, icon: 'snow', desc: 'Makes 60 free ice cubes every morning.' },
    { id: 'squeezer', group: 'machines', name: 'Auto Squeezer', price: 150, icon: 'citrus', desc: 'Uses 1 fewer lemon per pitcher.' },
    { id: 'register', group: 'machines', name: 'Cash Register', price: 90, icon: 'receipt', desc: 'Faster service and $0.15 tip on every cup.' },
    { id: 'slush', group: 'machines', name: 'Slush Machine', price: 180, icon: 'cup', desc: 'On hot days 30% of buyers add a $0.80 slush.' },
    { id: 'juicer', group: 'machines', name: 'Turbo Juicer', price: 110, icon: 'zap', desc: 'Happy customers boost reputation 15% more.' },
    { id: 'helper', group: 'staff', name: 'Hire Helper Kid', price: 60, icon: 'user', desc: 'More folks stop. Wage $10 per day.' },
    { id: 'boombox', group: 'staff', name: 'Boombox', price: 70, icon: 'music', desc: '+10% crowd and a better vibe.' },
    { id: 'sign', group: 'staff', name: 'Neon Sign', price: 65, icon: 'sign', desc: '+18% of passersby stop.' },
    { id: 'umbrella', group: 'staff', name: 'Big Umbrella', price: 80, icon: 'umbrella', desc: 'Halves the rainy day crowd loss.' },
    { id: 'billboard', group: 'staff', name: 'Billboard', price: 250, icon: 'board', desc: '+25% crowd every single day.' }
  ];
  const WAGE = 10;

  const ICONS = {
    flyer: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h8"/>',
    gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7M7.5 8a2.5 2.5 0 0 1 0-5C11 3 12 8 12 8s1-5 4.5-5a2.5 2.5 0 0 1 0 5"/>',
    news: '<path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8M15 18h-5M10 6h8v4h-8V6Z"/>',
    radio: '<rect x="2" y="7" width="20" height="14" rx="2"/><circle cx="8" cy="14" r="3"/><path d="M15 12h3M15 16h3M6 3l12 4"/>',
    phone: '<rect x="6" y="2" width="12" height="20" rx="2"/><path d="M11 18h2"/>',
    box: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M3 12h18M9 7V4h6v3"/>',
    snow: '<path d="M2 12h20M12 2v20M20 16l-4-4 4-4M4 8l4 4-4 4M16 4l-4 4-4-4M8 20l4-4 4 4"/>',
    citrus: '<circle cx="12" cy="12" r="9"/><path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6L5.6 18.4"/>',
    receipt: '<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1z"/><path d="M15 8h-5a2 2 0 0 0 0 4h4a2 2 0 0 1 0 4H8M12 6v12"/>',
    cup: '<path d="M6 4h12l-1.5 16h-9z"/><path d="M5 4h14M9 10h6"/>',
    zap: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
    user: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6M22 11h-6"/>',
    music: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
    sign: '<path d="M3 6h18v8H3zM12 14v6M8 20h8"/>',
    umbrella: '<path d="M22 12a10 10 0 0 0-20 0z"/><path d="M12 12v7a2 2 0 0 0 4 0"/>',
    board: '<rect x="3" y="3" width="18" height="12" rx="2"/><path d="M8 21l2-6M16 21l-2-6"/>',
    check: '<polyline points="20 6 9 17 4 12"/>',
    lemon: '<path style="fill:#fde047" d="M18 6c-2.5-2.5-7-2.5-10.5 1S4 15.5 6.5 18s7 2.5 10.5-1S20.5 8.5 18 6Z"/><path d="M18 6c1.2-.8 2.5-.5 3 .2-.5 1-1.5 1.8-2.6 1.6"/>',
    lemons: '<path style="fill:#fde047" d="M18 6c-2.5-2.5-7-2.5-10.5 1S4 15.5 6.5 18s7 2.5 10.5-1S20.5 8.5 18 6Z"/><path d="M18 6c1.2-.8 2.5-.5 3 .2-.5 1-1.5 1.8-2.6 1.6"/>',
    sugar: '<rect x="4" y="6" width="16" height="14" rx="2" style="fill:#f8fafc"/><path d="M8 10h8M9 14h6"/>',
    ice: '<rect x="4" y="4" width="16" height="16" rx="3" style="fill:#bae6fd"/><path d="M8 8l3 3M13 13l3 3"/>',
    cups: '<path d="M6 4h12l-1.5 16h-9z" style="fill:#fed7aa"/><path d="M5 4h14"/>'
  };
  const svg = (name, cls = '') => `<svg class="icon ${cls}" viewBox="0 0 24 24">${ICONS[name] || ''}</svg>`;

  const money = n => '$' + n.toFixed(2);

  // ------------------------------------------------------------ state
  function rollWeather() {
    const weights = [0.2, 0.36, 0.22, 0.14, 0.08];
    let r = Math.random(), w = WEATHERS[1];
    for (let i = 0; i < WEATHERS.length; i++) { r -= weights[i]; if (r <= 0) { w = WEATHERS[i]; break; } }
    return { id: w.id, name: w.name, temp: Math.round(w.min + Math.random() * (w.max - w.min)) };
  }

  function defaultState() {
    return {
      day: 1, cash: 25, reputation: 50, locationId: 'driveway',
      inventory: { lemons: 8, sugar: 8, ice: 40, cups: 20 },
      recipe: { lemons: 4, sugar: 4, ice: 4, price: 1.25 },
      upgrades: {}, marketing: {},
      weather: rollWeather(), forecast: rollWeather(),
      tab: 'market', lifetime: 0
    };
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) {
        const p = JSON.parse(raw), d = defaultState();
        return { ...d, ...p, inventory: { ...d.inventory, ...p.inventory }, recipe: { ...d.recipe, ...p.recipe }, upgrades: { ...p.upgrades }, marketing: { ...p.marketing } };
      }
    } catch (e) { /* ignore */ }
    return defaultState();
  }
  const save = () => { try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch (e) { /* ignore */ } };

  let state = loadState();
  let phase = 'prep'; // prep | open | summary
  let simSpeed = 1, paused = false;

  const sim = {
    t: 0, elapsed: 0, duration: 30, pitcher: 0, sold: 0, revenue: 0, tips: 0, slushRev: 0, menuRev: 0, rent: 0, promoCost: 0, wages: 0,
    away: 0, orders: [], restockPremium: 0,
    samples: 0, sampleLeft: 0, spawn: 0.4, customers: [], ambient: [], popups: [], sparks: [], feedback: {}, repDelta: 0, feed: [],
    event: null, banner: null, viralUntil: 0, ambientTimer: 1,
    clouds: [{ x: 110, y: 65, s: 12 }, { x: 380, y: 48, s: 8 }, { x: 640, y: 82, s: 15 }],
    birds: [{ x: 100, y: 110, s: 40, p: 0 }, { x: 420, y: 150, s: 32, p: 2 }, { x: 700, y: 90, s: 46, p: 4 }],
    flutter: [{ cx: 120, cy: 285, p: 0 }, { cx: 640, cy: 270, p: 2 }],
    rain: Array.from({ length: 70 }, () => ({ x: Math.random() * 800, y: Math.random() * 500, l: 10 + Math.random() * 10, s: 380 + Math.random() * 160 }))
  };

  // ------------------------------------------------------------ dom
  const $ = id => document.getElementById(id);
  const el = {
    day: $('hudDay'), wIcon: $('hudWeatherIcon'), weather: $('hudWeather'), cash: $('hudCash'), rep: $('hudRep'),
    loc: $('stageLoc'), forecast: $('forecast'), dot: $('liveDot'), phase: $('livePhase'), cups: $('liveCups'), rev: $('liveRev'),
    clock: $('clock'), fill: $('progFill'), pct: $('progPct'), pause: $('btnPause'), skip: $('btnSkip'),
    tabs: $('tabBar'), deck: $('deckBody'), foot: $('footSum'), start: $('btnStart'), startText: $('btnStartText'),
    back: $('backdrop'), mTitle: $('modalTitle'), mBody: $('modalBody'), mFoot: $('modalFoot'), mClose: $('btnCloseModal'),
    toasts: $('toasts'), canvas: $('gameCanvas'),
    inv: { lemons: $('invLemons'), sugar: $('invSugar'), ice: $('invIce'), cups: $('invCups') },
    st: { lemons: $('stLemons'), sugar: $('stSugar'), ice: $('stIce'), cups: $('stCups') }
  };
  const ctx = el.canvas.getContext('2d');

  // ------------------------------------------------------------ helpers
  const dayName = n => DAYS[(n - 1) % 7];
  const isWeekend = n => { const i = (n - 1) % 7; return i === 5 || i === 6; };
  const loc = () => LOCATIONS.find(l => l.id === state.locationId) || LOCATIONS[0];
  const wdef = () => WEATHERS.find(w => w.id === state.weather.id) || WEATHERS[1];
  const has = id => !!state.upgrades[id];
  const lemonsPer = () => Math.max(1, state.recipe.lemons - (has('squeezer') ? 1 : 0));
  const promoTotal = () => PROMOS.filter(p => state.marketing[p.id]).reduce((s, p) => s + p.cost, 0);
  const wageToday = () => (has('helper') ? WAGE : 0);
  const costToday = () => loc().rent + promoTotal() + wageToday();

  function promoMult() {
    let m = 1;
    PROMOS.forEach(p => { if (state.marketing[p.id]) m *= p.mult; });
    if (has('billboard')) m *= 1.25;
    if (has('boombox')) m *= 1.1;
    return Math.min(3.6, m);
  }

  function maxCups() {
    const r = state.recipe, inv = state.inventory, lp = lemonsPer();
    const pitchers = Math.min(Math.floor(inv.lemons / lp), Math.floor(inv.sugar / r.sugar));
    const iceCups = r.ice > 0 ? Math.floor(inv.ice / r.ice) : Infinity;
    return Math.max(0, Math.min(pitchers * 10, iceCups, inv.cups));
  }

  function taste() {
    const r = state.recipe, ideal = wdef().ice;
    let score = 100 - (Math.abs(r.lemons - 4) * 8 + Math.abs(r.sugar - 4) * 8 + Math.abs(r.lemons - r.sugar) * 9 + Math.abs(r.ice - ideal) * 6);
    score = Math.max(15, Math.min(100, score));
    let label = 'Perfect balance!', color = '#22c55e';
    if (r.lemons <= 2 && r.sugar <= 2) { label = 'Too watery'; color = '#ef4444'; }
    else if (r.lemons - r.sugar >= 2) { label = 'Too sour, add sugar'; color = '#f59e0b'; }
    else if (r.sugar - r.lemons >= 2) { label = 'Too sweet, add lemons'; color = '#f59e0b'; }
    else if (state.weather.temp >= 80 && r.ice < 3) { label = 'Needs more ice'; color = '#38bdf8'; }
    else if (score < 75) { label = 'Pretty good'; color = '#84cc16'; }
    return { score, label, color };
  }

  function toast(msg) {
    const t = document.createElement('div');
    t.className = 'toast'; t.textContent = msg;
    el.toasts.appendChild(t);
    setTimeout(() => t.remove(), 2600);
  }

  function weatherIcon(id) {
    if (id === 'rainy') return '<svg class="icon" viewBox="0 0 24 24"><path d="M4 14.9A7 7 0 1 1 15.7 8h1.8a4.5 4.5 0 0 1 2.5 8.2"/><path d="M8 19v2M12 19v2M16 19v2"/></svg>';
    if (id === 'cloudy' || id === 'breezy') return '<svg class="icon" viewBox="0 0 24 24"><path d="M17.5 19H9a7 7 0 1 1 6.7-9h1.8a4.5 4.5 0 1 1 0 9Z"/></svg>';
    return '<svg class="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4" fill="#facc15"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M6.3 17.7l-1.4 1.4M19.1 4.9l-1.4 1.4"/></svg>';
  }

  // ------------------------------------------------------------ HUD + deck rendering
  function updateHUD() {
    el.day.textContent = `Day ${state.day} ${DAY_SHORT[(state.day - 1) % 7]}${isWeekend(state.day) ? ' (Wknd)' : ''}`;
    el.wIcon.innerHTML = weatherIcon(state.weather.id);
    el.weather.textContent = `${state.weather.name} ${state.weather.temp}\u00B0`;
    el.cash.textContent = money(state.cash);
    el.rep.textContent = `${Math.round(state.reputation)}%`;
    el.loc.textContent = loc().name;
    el.forecast.textContent = `Tomorrow: ${state.forecast.name} ${state.forecast.temp}\u00B0`;
    Object.keys(el.inv).forEach(k => {
      el.inv[k].textContent = state.inventory[k];
      el.st[k].classList.toggle('low', state.inventory[k] <= (k === 'ice' ? 8 : 2));
    });

    el.foot.innerHTML = phase === 'open'
      ? `<b>${sim.sold}</b> cups sold today`
      : `Can make <b>${maxCups()}</b> cups<br>Costs today: <b>${money(costToday())}</b>`;

    if (phase === 'prep') {
      el.dot.className = 'live-dot'; el.phase.textContent = 'PREPARE STAND';
      el.start.disabled = false; el.startText.textContent = 'Open Stand!';
      el.pause.disabled = true; el.skip.disabled = true; el.pause.textContent = 'Pause';
    } else if (phase === 'open') {
      const away = sim.away > 0;
      el.dot.className = 'live-dot ' + (away ? 'away' : 'open');
      el.phase.textContent = paused ? 'PAUSED' : away ? 'OUT RESTOCKING' : 'OPEN FOR BUSINESS';
      el.start.disabled = true; el.startText.textContent = 'Selling...';
      el.pause.disabled = false; el.pause.textContent = paused ? 'Resume' : 'Pause'; el.skip.disabled = false;
    } else {
      el.dot.className = 'live-dot'; el.phase.textContent = 'CLOSED';
      el.start.disabled = true; el.pause.disabled = true; el.skip.disabled = true;
    }
    el.cups.textContent = `${sim.sold} sold`;
    el.rev.textContent = money(sim.revenue + sim.tips + sim.slushRev + sim.menuRev);
  }

  function renderDeck() {
    document.querySelectorAll('.tab').forEach(b => b.classList.toggle('active', b.dataset.tab === state.tab));
    if (phase !== 'prep') { renderLive(); refocus(); return; }
    const keepScroll = el.deck.scrollTop;
    ({ market: renderMarket, recipe: renderRecipe, location: renderLocation, marketing: renderMarketing, machines: renderMachines })[state.tab]();
    el.deck.scrollTop = keepScroll;
    refocus(true);
  }

  const BUNDLE = 5.5;
  function renderMarket() {
    const keepScroll = el.deck.scrollTop;
    let h = `<div class="sec-title"><span>Supply Market</span>
      <button class="btn btn-sm btn-lemon" id="btnBundle"><span class="xb xb-y">Y</span>Starter Bundle ${money(BUNDLE)}</button></div>
      <div class="note">Bundle: 4 lemons, 4 sugar, 40 ice, 10 cups. Unused ice melts overnight unless you own a cooler.</div>`;
    MARKET.forEach(it => {
      h += `<div class="row"><div class="row-info"><div class="ico-box">${svg(it.id)}</div>
        <div><div class="row-name">${it.name} <span class="pos">(${state.inventory[it.id]})</span></div><div class="row-meta">${it.note}</div></div></div>
        <div class="row-btns">${it.packs.map((p, i) => `<button class="btn btn-sm" data-buy="${it.id}" data-i="${i}" ${state.cash < p[1] ? 'disabled' : ''}>+${p[0]}<small>${money(p[1])}</small></button>`).join('')}</div></div>`;
    });
    el.deck.innerHTML = h;
    el.deck.scrollTop = keepScroll;
    $('btnBundle').disabled = state.cash < BUNDLE;
    $('btnBundle').onclick = buyBundle;
    el.deck.querySelectorAll('[data-buy]').forEach(b => b.onclick = () => buyPack(b.dataset.buy, +b.dataset.i));
  }

  function buyBundle() {
    if (phase !== 'prep') return;
    if (state.cash < BUNDLE) { soundFX.error(); toast('Not enough cash for the bundle'); return; }
    state.cash = +(state.cash - BUNDLE).toFixed(2);
    state.inventory.lemons += 4; state.inventory.sugar += 4; state.inventory.ice += 40; state.inventory.cups += 10;
    soundFX.buy(); save(); updateHUD(); if (state.tab === 'market') renderMarket(); refocus(true);
    toast('Starter bundle added');
  }

  function buyPack(id, i) {
    const pack = MARKET.find(m => m.id === id).packs[i];
    if (state.cash < pack[1]) { soundFX.error(); toast('Not enough cash'); return; }
    state.cash = +(state.cash - pack[1]).toFixed(2);
    state.inventory[id] += pack[0];
    soundFX.buy(); save(); updateHUD(); renderMarket(); refocus(true);
  }

  function stepper(name, meta, field, delta, valText) {
    return `<div class="row"><div><div class="row-name">${name}</div><div class="row-meta">${meta}</div></div>
      <div class="stepper"><button class="btn" data-step="${field}" data-d="${-delta}">-</button><div class="val">${valText}</div><button class="btn" data-step="${field}" data-d="${delta}">+</button></div></div>`;
  }

  function renderRecipe() {
    const keepScroll = el.deck.scrollTop;
    const r = state.recipe, t = taste(), L = loc();
    el.deck.innerHTML = `<div class="sec-title"><span>Recipe & Price</span><span class="sec-sub">1 pitcher = 10 cups</span></div>
      <div class="presets">${PRESETS.map((p, i) => `<button class="chip ${r.lemons === p.lemons && r.sugar === p.sugar && r.ice === p.ice ? 'active' : ''}" data-preset="${i}">${p.name}</button>`).join('')}</div>
      ${stepper('Lemons / pitcher', has('squeezer') ? 'Squeezer saves 1 lemon' : 'Tangy citrus punch', 'lemons', 1, r.lemons)}
      ${stepper('Sugar / pitcher', 'Balances the tartness', 'sugar', 1, r.sugar)}
      ${stepper('Ice / cup', `Hot day (${state.weather.temp}\u00B0) wants more`, 'ice', 1, r.ice)}
      ${stepper('Price / cup', `${L.name} sweet spot ~${money(L.price)}`, 'price', 0.25, money(r.price))}
      <div class="meter"><div style="display:flex;justify-content:space-between;"><span>${t.label}</span><b>${t.score}/100</b></div>
      <div class="meter-track"><div class="meter-fill" style="width:${t.score}%;background:${t.color}"></div></div></div>`;
    el.deck.scrollTop = keepScroll;
    el.deck.querySelectorAll('[data-preset]').forEach(b => b.onclick = () => {
      const p = PRESETS[+b.dataset.preset]; Object.assign(state.recipe, { lemons: p.lemons, sugar: p.sugar, ice: p.ice });
      soundFX.pop(); save(); updateHUD(); renderRecipe(); refocus(true);
    });
    el.deck.querySelectorAll('[data-step]').forEach(b => b.onclick = () => {
      const f = b.dataset.step, d = +b.dataset.d, rc = state.recipe;
      if (f === 'price') rc.price = Math.max(0.25, Math.min(5, +(rc.price + d).toFixed(2)));
      else if (f === 'ice') rc.ice = Math.max(0, Math.min(8, rc.ice + d));
      else rc[f] = Math.max(1, Math.min(8, rc[f] + d));
      soundFX.pop(); save(); updateHUD(); renderRecipe(); refocus(true);
    });
  }

  function renderLocation() {
    const keepScroll = el.deck.scrollTop;
    let h = `<div class="sec-title"><span>Pick Your Spot</span><span class="sec-sub">Daily rent</span></div>`;
    LOCATIONS.forEach(l => {
      const sel = state.locationId === l.id;
      h += `<button class="card-btn ${sel ? 'selected' : ''}" data-loc="${l.id}"><div>
        <div class="row-name">${l.name} ${sel ? '<span class="tag good">Selected</span>' : ''}</div>
        <div class="row-meta">${l.desc}</div><div class="tag-row">${l.tags.map(t => `<span class="tag blue">${t}</span>`).join('')}</div></div>
        <span class="tag ${l.rent ? '' : 'good'}">${l.rent ? money(l.rent) + '/day' : 'FREE'}</span></button>`;
    });
    el.deck.innerHTML = h;
    el.deck.scrollTop = keepScroll;
    el.deck.querySelectorAll('[data-loc]').forEach(b => b.onclick = () => {
      state.locationId = b.dataset.loc; soundFX.pop(); save(); updateHUD(); renderLocation(); refocus(true);
    });
  }

  function renderMarketing() {
    const keepScroll = el.deck.scrollTop;
    const m = promoMult();
    let h = `<div class="sec-title"><span>Marketing</span><span class="sec-sub">Today only</span></div>
      <div class="note">Pick promos for the next opening. Crowd boost today: <b>x${m.toFixed(2)}</b> | Ad cost: <b>${money(promoTotal())}</b></div>`;
    PROMOS.forEach(p => {
      const on = !!state.marketing[p.id];
      h += `<button class="card-btn ${on ? 'selected' : ''}" data-promo="${p.id}"><div class="row-info"><div class="ico-box">${svg(p.icon)}</div>
        <div><div class="row-name">${p.name}</div><div class="row-meta">${p.desc}</div><div class="tag-row"><span class="tag pink">${p.tag}</span></div></div></div>
        <div style="text-align:right"><span class="tag ${on ? 'good' : ''}">${on ? 'ON ' : ''}${money(p.cost)}</span></div></button>`;
    });
    el.deck.innerHTML = h;
    el.deck.scrollTop = keepScroll;
    el.deck.querySelectorAll('[data-promo]').forEach(b => b.onclick = () => {
      const id = b.dataset.promo; state.marketing[id] = !state.marketing[id];
      soundFX.pop(); save(); updateHUD(); renderMarketing(); refocus(true);
    });
  }

  function gearCard(g) {
    const owned = has(g.id), can = state.cash >= g.price;
    return `<div class="row ${owned ? 'owned' : ''}"><div class="row-info"><div class="ico-box">${svg(g.icon)}</div>
      <div><div class="row-name">${g.name}</div><div class="row-meta">${g.desc}</div></div></div>
      ${owned ? `<span class="tag good">${svg('check')} OWNED</span>` : `<button class="btn btn-sm btn-lemon" data-gear="${g.id}" ${can ? '' : 'disabled'}>${money(g.price)}</button>`}</div>`;
  }

  function renderMachines() {
    const keepScroll = el.deck.scrollTop;
    el.deck.innerHTML = `<div class="sec-title"><span>Expand Stand Menu</span><span class="sec-sub">New items</span></div>
      ${GEAR.filter(g => g.group === 'menu').map(gearCard).join('')}
      <div class="group-label">Machines</div>
      ${GEAR.filter(g => g.group === 'machines').map(gearCard).join('')}
      <div class="group-label">Staff & Decor</div>
      ${GEAR.filter(g => g.group === 'staff').map(gearCard).join('')}`;
    el.deck.scrollTop = keepScroll;
    el.deck.querySelectorAll('[data-gear]').forEach(b => b.onclick = () => {
      const g = GEAR.find(x => x.id === b.dataset.gear);
      if (state.cash < g.price) { soundFX.error(); return; }
      state.cash = +(state.cash - g.price).toFixed(2); state.upgrades[g.id] = true;
      soundFX.dayEnd(true); save(); updateHUD(); renderMachines(); refocus(true); toast(`${g.name} unlocked`);
    });
  }

  // ---- mid-day restocking: store run (normal price, lose time) or delivery (extra cost, stays open)
  const KITS = [
    { id: 'mini', name: 'Mini Kit', items: { lemons: 4, sugar: 4, ice: 30, cups: 10 }, base: 4.6, icon: 'lemon' },
    { id: 'party', name: 'Party Kit', items: { lemons: 12, sugar: 12, ice: 100, cups: 30 }, base: 13, icon: 'box' },
    { id: 'ice', name: 'Ice Run', items: { ice: 80 }, base: 4.8, icon: 'ice' },
    { id: 'cups', name: 'Cup Pack', items: { cups: 40 }, base: 3.6, icon: 'cups' }
  ];
  const STORE_TIME = 0.08, HELPER_TIME = 0.05, DELIVERY_TIME = 0.04;
  const kitPrice = (k, mode) => (mode === 'deliver' ? +(k.base * 1.5 + 3).toFixed(2) : k.base);
  const kitItems = k => Object.entries(k.items).map(([n, q]) => `${q} ${n}`).join(', ');
  const clockStr = f => { const m = Math.floor(Math.min(1, f) * 600), h = 8 + Math.floor(m / 60); return `${h > 12 ? h - 12 : h}:${String(m % 60).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`; };
  const minsOf = f => Math.round(f * 600);

  function orderRestock(kitId, mode) {
    if (phase !== 'open') return;
    const k = KITS.find(x => x.id === kitId), price = kitPrice(k, mode);
    if (sim.elapsed > 0.9) { soundFX.error(); toast('Too late in the day to restock'); return; }
    if (sim.away > 0) { soundFX.error(); toast('You are already out shopping'); return; }
    if (state.cash < price) { soundFX.error(); toast('Not enough cash'); return; }
    state.cash = +(state.cash - price).toFixed(2);
    sim.restockPremium = +(sim.restockPremium + (price - k.base)).toFixed(2);
    if (mode === 'deliver') {
      sim.orders.push({ at: sim.elapsed + DELIVERY_TIME, kit: k.id, mode });
      addFeed('event', `Ordered ${k.name} delivery`, `-${money(price)}`);
      toast(`Delivery arrives around ${clockStr(sim.elapsed + DELIVERY_TIME)}`);
    } else if (has('helper')) {
      sim.orders.push({ at: sim.elapsed + HELPER_TIME, kit: k.id, mode });
      sim.banner = { text: 'Helper is running to the store', t: 2.6 };
      addFeed('event', `Helper fetching ${k.name}`, `-${money(price)}`);
    } else {
      sim.away = STORE_TIME; sim.orders.push({ at: sim.elapsed + STORE_TIME, kit: k.id, mode });
      sim.banner = { text: 'Stand closed - heading to the store', t: 2.8 };
      addFeed('event', `Store run for ${k.name}`, `-${money(price)}`);
    }
    soundFX.buy(); updateHUD(); renderLive();
  }

  function deliverOrders(force) {
    const due = sim.orders.filter(o => force || sim.elapsed >= o.at);
    if (!due.length) return;
    due.forEach(o => {
      const k = KITS.find(x => x.id === o.kit);
      Object.entries(k.items).forEach(([n, q]) => { state.inventory[n] += q; });
      if (!force) { addFeed('event', `${k.name} arrived`, 'Restocked'); sim.banner = { text: `${k.name} arrived!`, t: 2.4 }; soundFX.buy(); }
    });
    sim.orders = force ? [] : sim.orders.filter(o => sim.elapsed < o.at);
    save(); updateHUD(); liveRefresh();
  }

  function renderLive() {
    const keep = el.deck.scrollTop;
    const boosts = PROMOS.filter(p => state.marketing[p.id]).map(p => `<span class="tag pink">${p.name}</span>`).join('');
    const low = maxCups() <= 3 ? '<span class="tag">Low on supplies</span>' : '';
    const helper = has('helper'), off = sim.away > 0 || sim.elapsed > 0.9;
    let h = `<div class="sec-title"><span>Restock</span><span class="sec-sub">${helper ? 'Helper runs the errand' : 'Store run closes your stand'}</span></div>`;
    h += `<div class="note"><b>Store run:</b> normal price, ${helper ? 'your helper goes (stand stays open)' : 'stand closes for ~' + minsOf(STORE_TIME) + ' min'}. <b>Delivery:</b> +50% and \$3 fee, arrives in ~${minsOf(DELIVERY_TIME)} min while you keep selling.</div>`;
    KITS.forEach(k => {
      h += `<div class="row"><div class="row-info"><div class="ico-box">${svg(k.icon)}</div><div><div class="row-name">${k.name}</div><div class="row-meta">${kitItems(k)}</div></div></div>
        <div class="row-btns"><button class="btn btn-sm btn-lemon ${off ? 'is-off' : ''}" data-restock="${k.id}" data-mode="store">Store<small>${money(kitPrice(k, 'store'))} | ${minsOf(helper ? HELPER_TIME : STORE_TIME)}m</small></button>
        <button class="btn btn-sm btn-sky ${off ? 'is-off' : ''}" data-restock="${k.id}" data-mode="deliver">Deliver<small>${money(kitPrice(k, 'deliver'))} | ${minsOf(DELIVERY_TIME)}m</small></button></div></div>`;
    });
    if (sim.orders.length) {
      h += '<div class="group-label">On the way</div>';
      sim.orders.forEach(o => { const k = KITS.find(x => x.id === o.kit); h += `<div class="feed-item event"><span>${k.name} (${o.mode === 'deliver' ? 'delivery' : 'store run'})</span><b>~${clockStr(o.at)}</b></div>`; });
    }
    h += `<div class="sec-title" style="margin-top:0.3rem"><span>Live Activity</span><span class="sec-sub pos">${sim.sold} sold</span></div>`;
    if (boosts || low || (sim.event && sim.event.fired)) h += `<div class="tag-row">${low}${boosts}${sim.event && sim.event.fired ? `<span class="tag">${sim.event.label}</span>` : ''}</div>`;
    h += '<div class="feed">';
    if (!sim.feed.length) h += '<div class="note">Stand is open. Customers will walk by shortly...</div>';
    sim.feed.slice(0, 9).forEach(f => { h += `<div class="feed-item ${f.type}"><span>${f.text}</span><b>${f.right}</b></div>`; });
    el.deck.innerHTML = h + '</div>';
    el.deck.scrollTop = keep;
    el.deck.querySelectorAll('[data-restock]').forEach(b => { b.onclick = () => orderRestock(b.dataset.restock, b.dataset.mode); });
    refocus(true);
  }
  const addFeed = (type, text, right) => { sim.feed.unshift({ type, text, right }); if (sim.feed.length > 20) sim.feed.pop(); };
  const liveRefresh = () => { if (phase === 'open') renderLive(); };

  // ------------------------------------------------------------ day flow
  function startDay() {
    if (phase !== 'prep') return;
    const L = loc(), cost = costToday();
    if (state.cash < cost) { soundFX.error(); toast(`Need ${money(cost)} for rent, ads and wages`); return; }
    if (maxCups() <= 0) { soundFX.error(); toast('Buy lemons, sugar, ice and cups first'); state.tab = 'market'; renderDeck(); return; }

    state.cash = +(state.cash - cost).toFixed(2);
    Object.assign(sim, { elapsed: 0, pitcher: 0, sold: 0, revenue: 0, tips: 0, slushRev: 0, menuRev: 0, rent: L.rent, promoCost: promoTotal(), wages: wageToday(),
      away: 0, orders: [], restockPremium: 0,
      samples: 0, sampleLeft: state.marketing.samples ? 8 : 0, spawn: 0.3, customers: [], popups: [], sparks: [], feedback: {}, repDelta: 0, feed: [], viralUntil: 0, banner: null });
    if (state.marketing.influencer) sim.repDelta += 3;
    if (state.marketing.radio) sim.repDelta += 0.5;
    phase = 'open'; paused = false; simSpeed = 1; setSpeedButtons();

    sim.event = null;
    if (Math.random() < 0.6) {
      const types = [['bus', 'Tour bus arrived!'], ['team', 'Soccer team is thirsty!'], ['critic', 'Food critic spotted!'], ['viral', 'Your stand went viral!']];
      const e = types[Math.floor(Math.random() * types.length)];
      sim.event = { type: e[0], label: e[1], at: 0.22 + Math.random() * 0.45, fired: false };
    }
    soundFX.openBell(); updateHUD(); renderDeck(); focusEl(el.pause);
  }

  function setSpeedButtons() {
    document.querySelectorAll('.btn-speed').forEach(b => b.classList.toggle('active', +b.dataset.speed === simSpeed));
  }
  function setSpeed(s) { simSpeed = s; setSpeedButtons(); soundFX.nav(); }

  function fireEvent() {
    const e = sim.event; e.fired = true;
    sim.banner = { text: e.label, t: 3.2 };
    addFeed('event', e.label, 'Event'); soundFX.openBell();
    if (e.type === 'bus') for (let i = 0; i < 7; i++) spawnCustomer({ left: true, off: i * 42 });
    else if (e.type === 'team') for (let i = 0; i < 6; i++) spawnCustomer({ left: false, off: i * 40, kid: true });
    else if (e.type === 'critic') spawnCustomer({ critic: true, left: Math.random() < 0.5 });
    else if (e.type === 'viral') sim.viralUntil = sim.elapsed + 0.22;
    liveRefresh();
  }

  const SHIRTS = ['#ef6b5b', '#4f8ef7', '#34c28a', '#a678f0', '#f5a04a', '#ec6fa6', '#2fb8c9', '#e8c547'];
  const SKINS = ['#f5d3b3', '#e8b98f', '#c98f62', '#94603c', '#6b4328'];
  const HAIRS = ['#2b2118', '#4a3322', '#8a5a2b', '#d6a548', '#1a1a1a', '#b5452c', '#6b7280'];
  const PANTS = ['#334155', '#475a7a', '#5b4636', '#2f3d55', '#1f2937', '#6b7a99'];
  const pick = a => a[Math.floor(Math.random() * a.length)];

  function makeWalker(o = {}) {
    const left = o.left !== undefined ? o.left : Math.random() < 0.5;
    return {
      x: (left ? -30 - (o.off || 0) : 830 + (o.off || 0)), y: 360 + (Math.random() * 26 - 13), dir: left ? 1 : -1,
      speed: 78 + Math.random() * 34, color: pick(SHIRTS), skin: pick(SKINS), pants: pick(PANTS), hairColor: pick(HAIRS),
      hair: pick(['short', 'long', 'bun', 'curly', 'buzz', 'short']), pattern: Math.random() < 0.3 ? 1 : 0,
      hat: pick(['none', 'none', 'none', 'cap', 'beanie', 'sunhat', 'shades']), hatColor: pick(SHIRTS),
      scale: o.kid ? 0.78 : 0.95 + Math.random() * 0.12, critic: !!o.critic, kind: o.kind || 'person', phase: Math.random() * 6.28,
      state: 'walk', wait: 0, bubble: null, bubbleColor: '#fff', decided: false, cup: false
    };
  }
  function spawnCustomer(o) { sim.customers.push(makeWalker(o)); }

  function recordFb(msg) { sim.feedback[msg] = (sim.feedback[msg] || 0) + 1; }

  function decide(c) {
    if (sim.away > 0) {
      c.bubble = 'Nobody here?'; c.bubbleColor = '#fef3c7'; addFeed('miss', 'Left: you were out restocking', 'Missed'); recordFb('Closed for a store run'); return;
    }
    const L = loc(), t = taste(), r = state.recipe, inv = state.inventory;
    const canPour = sim.pitcher > 0 || (inv.lemons >= lemonsPer() && inv.sugar >= r.sugar);
    if (!canPour || inv.cups < 1 || inv.ice < r.ice) {
      c.bubble = 'Sold out!'; c.bubbleColor = '#fee2e2'; addFeed('miss', 'Left: sold out of supplies', 'Missed'); recordFb('Ran out of stock'); return;
    }
    const sampling = sim.sampleLeft > 0;
    const wBonus = state.weather.id === 'heatwave' ? 0.35 : state.weather.id === 'sunny' ? 0.15 : -0.1;
    const maxPay = L.price + (state.reputation - 50) * 0.008 + wBonus + (Math.random() * 0.65 - 0.15) + (c.critic ? 0.8 : 0);
    if (!sampling && r.price > maxPay) {
      c.bubble = 'Too pricey!'; c.bubbleColor = '#fef3c7'; sim.repDelta -= 0.4; addFeed('miss', `Passed on ${money(r.price)} cup`, 'No sale'); recordFb('Prices felt high'); return;
    }
    const stop = Math.min(0.97, 0.55 + (has('sign') ? 0.18 : 0) + state.reputation / 250 + (has('helper') ? 0.2 : 0) + (has('register') ? 0.06 : 0));
    if (!c.critic && Math.random() > stop) return;

    if (sim.pitcher <= 0) { inv.lemons -= lemonsPer(); inv.sugar -= r.sugar; sim.pitcher = 10; }
    sim.pitcher--; inv.cups--; inv.ice -= r.ice;
    c.cup = true;

    let price = r.price;
    const jm = has('juicer') ? 1.15 : 1;
    if (sampling) {
      sim.sampleLeft--; sim.samples++; price = 0; sim.repDelta += 0.9;
      c.bubble = 'Free sample!'; c.bubbleColor = '#fce7f3'; addFeed('sale', 'Free sample handed out', 'Free'); recordFb('Loved the free samples');
    } else {
      state.cash = +(state.cash + price).toFixed(2); sim.revenue = +(sim.revenue + price).toFixed(2); sim.sold++;
      if (t.score >= 82) { c.bubble = 'Yum!!'; c.bubbleColor = '#dcfce7'; sim.repDelta += 0.7 * jm; recordFb('Loved the recipe'); }
      else if (t.score >= 60) { c.bubble = 'Refreshing!'; c.bubbleColor = '#e0f2fe'; sim.repDelta += 0.25 * jm; recordFb('Refreshing cups'); }
      else { c.bubble = 'Needs work...'; c.bubbleColor = '#ffedd5'; sim.repDelta -= 0.6; recordFb(t.label); }
      addFeed('sale', `Sold a cup (${c.bubble})`, `+${money(price)}`);
      if (price > 0) addPopup(`+${money(price)}`, '#4ade80');
    }
    if (!sampling && has('register')) { state.cash = +(state.cash + 0.15).toFixed(2); sim.tips += 0.15; }
    if (!sampling && has('slush') && state.weather.temp >= 80 && Math.random() < 0.3) {
      state.cash = +(state.cash + 0.8).toFixed(2); sim.slushRev += 0.8; addPopup('+$0.80 slush', '#67e8f9'); addFeed('sale', 'Slush add-on', '+$0.80');
    }
    if (!sampling && has('icedtea') && Math.random() < 0.28) {
      state.cash = +(state.cash + 1.1).toFixed(2); sim.menuRev += 1.1; addPopup('+$1.10 tea', '#fbbf24'); addFeed('sale', 'Iced Tea add-on', '+$1.10');
    }
    if (!sampling && has('smoothie') && state.weather.temp >= 72 && Math.random() < 0.26) {
      state.cash = +(state.cash + 1.65).toFixed(2); sim.menuRev += 1.65; addPopup('+$1.65 smoothie', '#f472b6'); addFeed('sale', 'Fruit Smoothie add-on', '+$1.65');
    }
    const coolOrRain = state.weather.id === 'rainy' || state.weather.id === 'breezy' || state.weather.id === 'cloudy';
    if (!sampling && has('pretzel') && Math.random() < (coolOrRain ? 0.35 : 0.18)) {
      state.cash = +(state.cash + 1.35).toFixed(2); sim.menuRev += 1.35; addPopup('+$1.35 pretzel', '#fdba74'); addFeed('sale', 'Warm Pretzel add-on', '+$1.35');
    }
    if (!sampling && has('coffee') && (sim.elapsed < 0.35 || coolOrRain) && Math.random() < 0.32) {
      state.cash = +(state.cash + 1.75).toFixed(2); sim.menuRev += 1.75; addPopup('+$1.75 coffee', '#d6d3d1'); addFeed('sale', 'Coffee & Cocoa add-on', '+$1.75');
    }
    if (c.critic) {
      if (t.score >= 75) { sim.repDelta += 6; state.cash = +(state.cash + 5).toFixed(2); sim.tips += 5; c.bubble = '5 stars!'; addFeed('event', 'Critic gave 5 stars! +$5 tip', '+Rep'); recordFb('Critic loved it'); addPopup('5 STARS!', '#fde047'); }
      else { sim.repDelta -= 4; c.bubble = 'Meh...'; addFeed('event', 'Critic was not impressed', '-Rep'); recordFb('Critic unimpressed'); }
    }
    for (let i = 0; i < 9; i++) sim.sparks.push({ x: 400, y: 270, vx: (Math.random() - 0.5) * 140, vy: -40 - Math.random() * 110, life: 0.8 });
    soundFX.coin(); if (r.ice > 0 && Math.random() < 0.4) soundFX.iceClink();
    updateHUD(); liveRefresh();
  }

  function addPopup(text, color) { sim.popups.push({ x: 400 + (Math.random() * 60 - 30), y: 250, text, color, a: 1 }); }

  function finishDay() {
    deliverOrders(true);
    sim.away = 0;
    phase = 'summary';
    const gross = sim.revenue + sim.tips + sim.slushRev + sim.menuRev;
    const net = +(gross - sim.rent - sim.promoCost - sim.wages - sim.restockPremium).toFixed(2);
    state.lifetime = +(state.lifetime + net).toFixed(2);
    state.reputation = Math.max(5, Math.min(100, +(state.reputation + sim.repDelta).toFixed(1)));

    const before = state.inventory.ice; let melted = before;
    if (has('cooler') && before > 0) { const kept = Math.floor(before * 0.6); melted = before - kept; state.inventory.ice = kept; }
    else state.inventory.ice = 0;
    state.marketing = {};
    soundFX.dayEnd(net >= 0); save(); updateHUD();

    const buzz = Object.entries(sim.feedback).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k, v]) => `${k} (${v})`).join(', ') || 'Quiet day on the block.';
    const row = (a, b, c = '') => `<span>${a}</span><span style="${c}">${b}</span>`;
    el.mTitle.textContent = `Day ${state.day} (${dayName(state.day)}) Report`;
    el.mBody.innerHTML = `<div class="ledger">
      ${row('Cups sold', sim.sold)}
      ${sim.samples ? row('Free samples', sim.samples) : ''}
      ${row('Sales', '+' + money(sim.revenue), 'color:#4ade80')}
      ${sim.tips ? row('Tips', '+' + money(sim.tips), 'color:#4ade80') : ''}
      ${sim.slushRev ? row('Slush sales', '+' + money(sim.slushRev), 'color:#4ade80') : ''}
      ${sim.menuRev ? row('Menu add-ons', '+' + money(sim.menuRev), 'color:#4ade80') : ''}
      ${row('Rent (' + loc().name + ')', '-' + money(sim.rent), 'color:#fb7185')}
      ${sim.promoCost ? row('Marketing', '-' + money(sim.promoCost), 'color:#fb7185') : ''}
      ${sim.wages ? row('Helper wage', '-' + money(sim.wages), 'color:#fb7185') : ''}
      ${sim.restockPremium ? row('Delivery fees', '-' + money(sim.restockPremium), 'color:#fb7185') : ''}
      <span class="total">Net profit</span><span class="total" style="color:${net >= 0 ? '#4ade80' : '#fb7185'}">${net >= 0 ? '+' : ''}${money(net)}</span></div>
      <div class="note"><b>Customer buzz:</b> ${buzz}</div>
      <div class="note blue"><b>Ice:</b> ${melted} melted overnight. ${has('cooler') ? 'Cooler saved ' + state.inventory.ice + '.' : 'A cooler would save 60%.'}</div>`;
    el.mFoot.innerHTML = `<button class="btn btn-primary btn-big" id="btnNext"><span class="xb xb-a">A</span>Start ${dayName(state.day + 1)}</button>`;
    openModal(); $('btnNext').onclick = nextDay; focusEl($('btnNext'));
  }

  function nextDay() {
    state.day++; state.weather = state.forecast; state.forecast = rollWeather();
    phase = 'prep'; sim.elapsed = 0; sim.sold = 0; sim.revenue = 0; sim.tips = 0; sim.slushRev = 0; sim.menuRev = 0; sim.customers = [];
    el.fill.style.width = '0%'; el.pct.textContent = '0%'; el.clock.textContent = '8:00 AM';
    el.back.classList.remove('open');
    let msg = '';
    if (has('icemaker')) { state.inventory.ice += 60; msg = 'Ice machine made 60 cubes. '; }
    if (state.cash < 3 && maxCups() === 0) { state.cash += 15; msg += 'Grandma sent $15 allowance!'; }
    if (msg) toast(msg);
    soundFX.pop(); save(); updateHUD(); renderDeck();
  }

  // ------------------------------------------------------------ modals
  function openModal() { el.mClose.style.display = phase === 'summary' ? 'none' : ''; el.back.classList.add('open'); refocus(); }
  function closeModal() { if (phase === 'summary') return; el.back.classList.remove('open'); refocus(); }

  function controlsModal() {
    el.mTitle.textContent = 'Controls';
    el.mBody.innerHTML = `<div class="controls-table">
      <span class="kbd">D-Pad / Stick</span><span>Move selection</span>
      <span class="kbd">A</span><span>Select / buy / confirm</span>
      <span class="kbd">B</span><span>Close menu / pause</span>
      <span class="kbd">X</span><span>Open the stand</span>
      <span class="kbd">Y</span><span>Buy starter bundle</span>
      <span class="kbd">LB / RB</span><span>Switch tabs</span>
      <span class="kbd">LT / RT</span><span>Slow / fast speed</span>
      <span class="kbd">Start</span><span>This help</span>
      <span class="kbd">Keyboard</span><span>Arrows/WASD, Enter, Q/E tabs, Esc</span></div>`;
    el.mFoot.innerHTML = '<button class="btn btn-primary" id="btnOk"><span class="xb xb-a">A</span>Got it</button>';
    openModal(); $('btnOk').onclick = closeModal; focusEl($('btnOk'));
  }

  function resetModal() {
    el.mTitle.textContent = 'Start a new stand?';
    el.mBody.innerHTML = '<p>This resets your cash to $25, removes all gear and starts again on Monday.</p>';
    el.mFoot.innerHTML = '<button class="btn" id="btnNo">Cancel</button><button class="btn btn-danger" id="btnYes">Yes, start fresh</button>';
    openModal();
    $('btnNo').onclick = closeModal; focusEl($('btnNo'));
    $('btnYes').onclick = () => {
      state = defaultState(); phase = 'prep'; sim.customers = []; sim.sold = 0; sim.revenue = 0; sim.tips = 0; sim.slushRev = 0;
      save(); el.back.classList.remove('open'); updateHUD(); renderDeck(); toast('Fresh new stand!');
    };
  }

  // ------------------------------------------------------------ drawing (see art.js)
  const drawScene = dt => window.Art.draw(ctx, { state, sim, phase, has, wdef, money }, dt);

  // ------------------------------------------------------------ main loop
  let last = performance.now();
  function frame(now) {
    const raw = Math.min(0.05, (now - last) / 1000); last = now;
    pollPad(raw);
    const live = phase === 'open' && !paused;
    const dt = live ? raw * simSpeed : raw;

    // ambient life (always on)
    sim.ambientTimer -= dt;
    if (sim.ambientTimer <= 0) {
      sim.ambientTimer = 1.4 + Math.random() * 2.4;
      const r = Math.random();
      const w = makeWalker({ kind: r < 0.14 ? 'dog' : r < 0.26 ? 'bike' : 'person', kid: Math.random() < 0.25 });
      if (w.kind === 'bike') { w.speed = 190; w.y = 392; } else if (w.kind === 'dog') { w.speed = 120; w.y = 400; } else w.y = 410 + Math.random() * 20;
      sim.ambient.push(w);
    }
    sim.ambient.forEach(a => { a.x += a.dir * a.speed * dt; a.phase += dt * 10; });
    sim.ambient = sim.ambient.filter(a => (a.dir > 0 ? a.x < 900 : a.x > -100));
    sim.sparks.forEach(s => { s.x += s.vx * dt; s.y += s.vy * dt; s.vy += 260 * dt; s.life -= dt * 1.3; });
    sim.sparks = sim.sparks.filter(s => s.life > 0);
    sim.popups.forEach(p => { p.y -= 34 * dt; p.a -= 0.8 * dt; });
    sim.popups = sim.popups.filter(p => p.a > 0);
    if (sim.banner) { sim.banner.t -= dt; if (sim.banner.t <= 0) sim.banner = null; }

    if (live) {
      const wasAway = sim.away > 0;
      sim.elapsed += dt / sim.duration;
      if (sim.away > 0) {
        sim.away = Math.max(0, sim.away - dt / sim.duration);
        if (sim.away === 0 && wasAway) { updateHUD(); liveRefresh(); }
      }
      deliverOrders(false);
      const pct = Math.min(100, Math.round(sim.elapsed * 100));
      el.fill.style.width = pct + '%'; el.pct.textContent = pct + '%';
      const mins = Math.floor(Math.min(1, sim.elapsed) * 600), h24 = 8 + Math.floor(mins / 60);
      el.clock.textContent = `${h24 > 12 ? h24 - 12 : h24}:${String(mins % 60).padStart(2, '0')} ${h24 >= 12 ? 'PM' : 'AM'}`;

      if (sim.event && !sim.event.fired && sim.elapsed >= sim.event.at) fireEvent();

      const L = loc(); let rain = state.weather.id === 'rainy' ? L.rain : 1;
      if (state.weather.id === 'rainy' && has('umbrella')) rain += (1 - rain) * 0.5;
      const viral = sim.elapsed < sim.viralUntil ? 1.7 : 1;
      const rate = L.traffic * wdef().traffic * rain * (isWeekend(state.day) ? L.weekend : 1) * promoMult() * viral;
      sim.spawn -= dt * rate;
      if (sim.spawn <= 0 && sim.elapsed < 0.94) { spawnCustomer(); sim.spawn = 1.25 + Math.random() * 0.9; }

      sim.customers.forEach(c => {
        c.phase += dt * 10;
        if (c.state === 'walk') {
          c.x += c.dir * c.speed * dt;
          if (!c.decided && Math.abs(c.x - 400) < 18) { c.decided = true; c.state = 'stop'; c.wait = 0.55; decide(c); }
        } else if (c.state === 'stop') { c.wait -= dt; if (c.wait <= 0) c.state = 'leave'; }
        else c.x += c.dir * c.speed * dt;
      });
      sim.customers = sim.customers.filter(c => (c.dir > 0 ? c.x < 900 : c.x > -100));
      if (sim.elapsed >= 1) finishDay();
    }
    drawScene(dt);
    requestAnimationFrame(frame);
  }

  // ------------------------------------------------------------ focus / input
  let focusables = [], fi = 0;
  const SEL = 'button:not(:disabled), a.btn, .tab, .card-btn:not(:disabled), .chip';

  function refocus(keepIndex) {
    const modal = el.back.classList.contains('open');
    const root = modal ? el.back : document;
    const prevEl = focusables[fi];
    focusables = Array.from(root.querySelectorAll(SEL)).filter(n => n.offsetParent !== null);
    if (keepIndex && prevEl) { const j = focusables.indexOf(prevEl); if (j >= 0) fi = j; }
    if (fi >= focusables.length) fi = Math.max(0, focusables.length - 1);
    ring(false);
  }
  function focusEl(node) { refocus(); const j = focusables.indexOf(node); if (j >= 0) { fi = j; ring(false); } }
  function ring(sound = true) {
    document.querySelectorAll('.gp-focus').forEach(n => n.classList.remove('gp-focus'));
    const n = focusables[fi];
    if (n) {
      n.classList.add('gp-focus');
      const scroller = n.closest('.deck-body, .modal-body');
      if (scroller) {
        const sr = scroller.getBoundingClientRect();
        const nr = n.getBoundingClientRect();
        const pad = 44;
        if (nr.top < sr.top + pad) {
          scroller.scrollTop += nr.top - (sr.top + pad);
        } else if (nr.bottom > sr.bottom - pad) {
          scroller.scrollTop += nr.bottom - (sr.bottom - pad);
        }
        // If near the very bottom of deck, reveal trailing meter/notes
        const deckNodes = focusables.filter(x => scroller.contains(x));
        if (deckNodes.length && n === deckNodes[deckNodes.length - 1]) {
          scroller.scrollTop = scroller.scrollHeight;
        } else if (deckNodes.length && n === deckNodes[0]) {
          scroller.scrollTop = 0;
        }
      } else {
        n.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      }
      if (sound) soundFX.nav();
    }
  }

  function move(dx, dy) {
    if (!focusables.length) return;
    const cur = focusables[fi]; if (!cur) { fi = 0; ring(); return; }
    const cr = cur.getBoundingClientRect(), cx = cr.left + cr.width / 2, cy = cr.top + cr.height / 2;
    let best = -1, bs = Infinity;
    focusables.forEach((n, i) => {
      if (i === fi) return;
      const r = n.getBoundingClientRect(), vx = r.left + r.width / 2 - cx, vy = r.top + r.height / 2 - cy;
      if ((dx > 0 && vx <= 8) || (dx < 0 && vx >= -8) || (dy > 0 && vy <= 8) || (dy < 0 && vy >= -8)) return;
      const pri = dx ? Math.abs(vx) : Math.abs(vy), sec = dx ? Math.abs(vy) : Math.abs(vx);
      const s = pri + sec * 2.2; if (s < bs) { bs = s; best = i; }
    });
    if (best < 0) best = (fi + ((dx > 0 || dy > 0) ? 1 : -1) + focusables.length) % focusables.length;
    fi = best; ring();
  }

  function cycleTab(d) {
    if (phase !== 'prep' || el.back.classList.contains('open')) return;
    state.tab = TABS[(TABS.indexOf(state.tab) + d + TABS.length) % TABS.length];
    soundFX.nav(); renderDeck();
    const tabEl = document.querySelector(`.tab[data-tab="${state.tab}"]`); if (tabEl) focusEl(tabEl);
  }

  let prevBtn = [], cool = 0;
  const unlockAt = performance.now() + 400;
  function pollPad(dt) {
    const pads = Array.from(navigator.getGamepads ? navigator.getGamepads() : []).filter(p => p && p.connected);
    document.body.classList.toggle('gamepad-active', pads.length > 0);
    if (!pads.length) return;
    const down = i => pads.some(g => g.buttons[i] && (g.buttons[i].pressed || g.buttons[i].value > 0.45));
    const just = i => down(i) && !prevBtn[i];
    cool = Math.max(0, cool - dt);
    let up = down(12), dn = down(13), lf = down(14), rt = down(15);
    let rStickY = 0;
    pads.forEach(g => {
      const a = g.axes || [];
      if (a[1] < -0.5 || a[7] < -0.5) up = true; if (a[1] > 0.5 || a[7] > 0.5) dn = true;
      if (a[0] < -0.5 || a[6] < -0.5) lf = true; if (a[0] > 0.5 || a[6] > 0.5) rt = true;
      if (a[3] !== undefined && Math.abs(a[3]) > 0.25) rStickY = a[3];
      if (a[9] !== undefined && Math.abs(a[9]) <= 1.05) { const v = a[9]; if (v < -0.7 || v > 0.85) up = true; if (v > -0.15 && v < 0.45) dn = true; if (v > 0.45) lf = true; if (v > -0.7 && v < -0.15) rt = true; }
    });
    if (rStickY !== 0) {
      const scroller = el.back.classList.contains('open') ? el.mBody : el.deck;
      if (scroller) scroller.scrollTop += rStickY * 460 * dt;
    }
    if (cool <= 0) {
      if (up) { move(0, -1); cool = 0.17; } else if (dn) { move(0, 1); cool = 0.17; }
      else if (lf) { move(-1, 0); cool = 0.17; } else if (rt) { move(1, 0); cool = 0.17; }
    }
    if (performance.now() > unlockAt && just(0) && focusables[fi]) focusables[fi].click();
    if (just(1)) { if (el.back.classList.contains('open')) closeModal(); else if (phase === 'open') el.pause.click(); }
    if (just(2) && phase === 'prep' && !el.back.classList.contains('open')) startDay();
    if (just(3) && phase === 'prep' && !el.back.classList.contains('open') && state.tab === 'market') buyBundle();
    if (just(4)) { if (phase === 'prep') cycleTab(-1); else if (phase === 'open') setSpeed(simSpeed >= 4 ? 2 : 1); }
    if (just(5)) { if (phase === 'prep') cycleTab(1); else if (phase === 'open') setSpeed(simSpeed <= 1 ? 2 : 4); }
    if (just(6) && phase === 'open') setSpeed(1);
    if (just(7) && phase === 'open') setSpeed(4);
    if (just(9)) { if (el.back.classList.contains('open')) closeModal(); else controlsModal(); }
    for (let i = 0; i < 16; i++) prevBtn[i] = down(i);
  }

  window.addEventListener('keydown', e => {
    const k = e.key;
    if (k === 'ArrowUp' || k === 'w' || k === 'W') { e.preventDefault(); move(0, -1); }
    else if (k === 'ArrowDown' || k === 's' || k === 'S') { e.preventDefault(); move(0, 1); }
    else if (k === 'ArrowLeft' || k === 'a' || k === 'A') { e.preventDefault(); move(-1, 0); }
    else if (k === 'ArrowRight' || k === 'd' || k === 'D') { e.preventDefault(); move(1, 0); }
    else if (k === 'Enter' || k === ' ') { e.preventDefault(); if (focusables[fi]) focusables[fi].click(); }
    else if (k === 'q' || k === 'Q') cycleTab(-1);
    else if (k === 'e' || k === 'E') cycleTab(1);
    else if (k === 'Escape') closeModal();
  });

  el.tabs.querySelectorAll('.tab').forEach(b => b.addEventListener('click', () => {
    if (phase !== 'prep') return;
    state.tab = b.dataset.tab; soundFX.nav(); renderDeck(); focusEl(b);
  }));
  el.start.addEventListener('click', startDay);
  [1, 2, 4].forEach(s => $('btnSpeed' + s).addEventListener('click', () => setSpeed(s)));
  el.pause.addEventListener('click', () => { if (phase !== 'open') return; paused = !paused; soundFX.pop(); updateHUD(); });
  el.skip.addEventListener('click', () => { if (phase !== 'open') return; simSpeed = 12; paused = false; setSpeedButtons(); soundFX.pop(); });
  $('btnMute').addEventListener('click', () => { const m = soundFX.toggleMute(); $('btnMute').style.opacity = m ? 0.5 : 1; toast(m ? 'Sound off' : 'Sound on'); });
  $('btnControls').addEventListener('click', controlsModal);
  $('btnResetGame').addEventListener('click', resetModal);
  el.mClose.addEventListener('click', closeModal);
  window.addEventListener('gamepadconnected', () => window.focus());
  window.focus();

  updateHUD(); renderDeck();
  requestAnimationFrame(frame);
})();
