(function () {
  'use strict';

  const STORAGE_KEYS = {
    coins: 'zov_coins',
    cards: 'zov_cards',
    energy: 'zov_energy',
    energyMax: 'zov_energyMax',
    lastEnergyTime: 'zov_lastEnergyTime',
    level: 'zov_level',
    xp: 'zov_xp',
    completedCollections: 'zov_doneCollections',
    upgrades: 'zov_upgrades',
    lastMiningClaimTime: 'zov_lastMiningClaimTime',
    accumulatedMiningPassive: 'zov_accumulatedMiningPassive',
    secretBoxKeys: 'zov_secretBoxKeys',
  };
  const BOX_COSTS = { bronze: 50, silver: 200, gold: 500, platinum: 1200, secret: null };
  var PROMO_CODES = { PROMO: { coins: 10000, secretBoxKeys: 1 }, BALANCE: { coins: 100000 } };
  const PACK_DISCOUNTS = { 5: 0.95, 10: 0.9, 100: 0.85 };
  const MINING_INTERVAL_MS = 5 * 60 * 60 * 1000;
  const MINING_BASE_REWARD = 80;

  let coins = parseInt(localStorage.getItem(STORAGE_KEYS.coins) || '0', 10);
  let cards = JSON.parse(localStorage.getItem(STORAGE_KEYS.cards) || '[]');
  let energy = parseInt(localStorage.getItem(STORAGE_KEYS.energy) || '20', 10);
  let energyMax = parseInt(localStorage.getItem(STORAGE_KEYS.energyMax) || '20', 10);
  let lastEnergyTime = parseInt(localStorage.getItem(STORAGE_KEYS.lastEnergyTime) || String(Date.now()), 10);
  let level = parseInt(localStorage.getItem(STORAGE_KEYS.level) || '1', 10);
  let xp = parseInt(localStorage.getItem(STORAGE_KEYS.xp) || '0', 10);
  let completedCollections = JSON.parse(localStorage.getItem(STORAGE_KEYS.completedCollections) || '[]');
  let upgrades = JSON.parse(localStorage.getItem(STORAGE_KEYS.upgrades) || '{}');
  let lastMiningClaimTime = parseInt(localStorage.getItem(STORAGE_KEYS.lastMiningClaimTime) || '0', 10);
  let accumulatedMiningPassive = parseInt(localStorage.getItem(STORAGE_KEYS.accumulatedMiningPassive) || '0', 10);
  let secretBoxKeys = parseInt(localStorage.getItem(STORAGE_KEYS.secretBoxKeys) || '0', 10);
  energyMax = 20 + (upgrades.energyCap || 0) * 10;
  if (!Array.isArray(cards)) cards = [];
  cards = cards.map(function (c) { return typeof c.count === 'number' ? c : Object.assign({}, c, { count: 1 }); });

  const UPGRADE_DEFS = [
    { id: 'energyCap', name: 'Запас энергии', desc: '+10 к макс. энергии', cost: 200, maxLevel: 5, getValue: () => (upgrades.energyCap || 0) * 10, requiredLevelPerTier: [0, 1, 3, 5, 8, 12] },
    { id: 'regen', name: 'Восстановление', desc: '+0.5 энергии/сек', cost: 150, maxLevel: 4, getValue: () => (upgrades.regen || 0) * 0.5, requiredLevelPerTier: [0, 1, 4, 7, 11] },
    { id: 'coinPerTap', name: 'Монет за тап', desc: '+1 монета за тап', cost: 300, maxLevel: 5, getValue: () => upgrades.coinPerTap || 0, requiredLevelPerTier: [0, 1, 3, 6, 10, 15] },
    { id: 'mining', name: 'Майнинг в фоне', desc: 'Забирай награду каждые 5 ч', cost: 600, maxLevel: 1, getValue: () => (upgrades.mining || 0) ? 1 : 0, requiredLevelPerTier: [0, 5] },
    { id: 'miningLevel', name: 'Уровень майнинга', desc: '+награда за сбор', cost: 400, maxLevel: 5, getValue: () => upgrades.miningLevel || 0, requiredLevelPerTier: [0, 5, 8, 12, 16, 20] },
    { id: 'miningPerSec', name: 'Монет в секунду', desc: '+1 монет/сек пассивно', cost: 500, maxLevel: 5, getValue: () => upgrades.miningPerSec || 0, requiredLevelPerTier: [0, 6, 10, 14, 18, 22] },
  ];

  function getXpToNextLevel(lvl) {
    return 100 + (lvl - 1) * 50;
  }

  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => [...(root || document).querySelectorAll(sel)];

  const loader = $('#loader');
  const app = $('#app');
  const loaderBar = $('#loaderBar');
  const loaderPercent = $('#loaderPercent');
  const loaderParticles = $('#loaderParticles');
  const coinCountEl = $('#coinCount');
  const coinBtn = $('#coinBtn');
  const energyFill = $('#energyFill');
  const energyText = $('#energyText');
  const levelNum = $('#levelNum');
  const levelFill = $('#levelFill');
  const xpText = $('#xpText');
  const cardsGrid = $('#cardsGrid');
  const cardsCountEl = $('#cardsCount');
  const cardModal = $('#cardModal');
  const modalCardWrap = $('#modalCardWrap');
  const modalCardType = $('#modalCardType');
  const modalCardName = $('#modalCardName');
  const modalCardCountry = $('#modalCardCountry');
  const modalCardRarity = $('#modalCardRarity');
  const modalCardImage = $('#modalCardImage');
  const modalClose = $('#modalClose');
  const upgradesList = $('#upgradesList');
  const collectionsList = $('#collectionsList');
  const miningBlock = $('#miningBlock');
  const miningClaimBtn = $('#miningClaimBtn');
  const miningNextAt = $('#miningNextAt');
  const secretCodeModal = $('#secretCodeModal');
  const secretCodeInput = $('#secretCodeInput');
  const secretCodeSubmit = $('#secretCodeSubmit');
  const leaderboardList = $('#leaderboardList');
  var API_BASE = '';
  try {
    if (window.ZOV_API_BASE) API_BASE = window.ZOV_API_BASE;
    else if (typeof location !== 'undefined' && location.origin && location.origin.indexOf('http') === 0) API_BASE = location.origin;
  } catch (e) {}
  function getInitData() {
    try { return (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initData) || ''; } catch (e) { return ''; }
  }

  // ─── Loader ─────────────────────────────────────────────────────
  function createParticles() {
    if (!loaderParticles) return;
    loaderParticles.innerHTML = '';
    const count = 24;
    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'loader-particle';
      p.style.left = Math.random() * 100 + '%';
      p.style.top = Math.random() * 100 + '%';
      p.style.animationDelay = (Math.random() * 2) + 's';
      loaderParticles.appendChild(p);
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createParticles);
  } else {
    createParticles();
  }

  function runLoaderProgress() {
    if (!loaderBar || !loaderPercent) return;
    let p = 0;
    const iv = setInterval(function () {
      p += Math.random() * 12 + 4;
      if (p >= 100) {
        clearInterval(iv);
        loaderBar.style.width = '100%';
        loaderPercent.textContent = '100%';
        setTimeout(function () { goToGame(); }, 500);
        return;
      }
      loaderBar.style.width = p + '%';
      loaderPercent.textContent = Math.round(p) + '%';
    }, 120);
  }

  var lastCoinTap = 0;
  var logoSecretState = 0;
  var logoSecretFastCount = 0;
  var logoSecretLastTap = 0;
  var logoSecretSlowCount = 0;
  var logoSecretLastSlowTap = 0;
  function handleLogoSecretTap() {
    var now = Date.now();
    var gap = now - logoSecretLastTap;
    if (logoSecretState === 0) {
      if (gap > 500) logoSecretFastCount = 0;
      logoSecretFastCount++;
      logoSecretLastTap = now;
      if (logoSecretFastCount >= 5) {
        logoSecretState = 1;
        logoSecretSlowCount = 0;
        logoSecretLastSlowTap = now;
      }
    } else {
      if (gap > 600) {
        logoSecretSlowCount++;
        logoSecretLastSlowTap = now;
        logoSecretLastTap = now;
        if (logoSecretSlowCount >= 2) {
          logoSecretState = 0;
          logoSecretFastCount = 0;
          if (secretCodeModal) {
            secretCodeModal.classList.remove('hidden');
            window._secretModalOpenedAt = Date.now();
            if (secretCodeInput) setTimeout(function() { secretCodeInput.focus(); }, 100);
          }
        }
      } else {
        logoSecretState = 0;
        logoSecretFastCount = 0;
      }
    }
  }
  var lastCoinPointerType = '';
  var lastActionEl = null;
  var lastActionTime = 0;
  var ACTION_DEBOUNCE_MS = 450;
  function handleAppClick(e) {
    if (!app || app.classList.contains('hidden')) return;
    var t = e.target;
    if (t.closest('.header-brand')) return;
    if (t.closest('.nft-card')) {
      var cardEl = t.closest('.nft-card');
      if (cardEl === lastActionEl && Date.now() - lastActionTime < 400) return;
      lastActionEl = cardEl; lastActionTime = Date.now();
      if (e.type === 'touchstart') e.preventDefault();
      var id = cardEl.dataset.cardId;
      var card = cards.find(function(c) { return c.id === id; });
      if (card) showCardModal(card);
      return;
    }
    if (t.closest('#coinBtn')) return;
    if (t.closest('.nav-btn')) {
      var btn = t.closest('.nav-btn');
      if (btn === lastActionEl && Date.now() - lastActionTime < 300) return;
      lastActionEl = btn; lastActionTime = Date.now();
      if (e.type === 'touchstart') e.preventDefault();
      var tab = btn.dataset.tab;
      $$('.nav-btn', app).forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      $$('[data-panel]', app).forEach(function(p) { p.classList.toggle('active', p.dataset.panel === tab); });
      refreshUpgradesAndBoxes();
      if (tab === 'leaderboard' && typeof loadLeaderboard === 'function') loadLeaderboard();
      return;
    }
    if (t.closest('.loot-box')) {
      var box = t.closest('.loot-box');
      if (box.disabled) return;
      if (Date.now() - _cardModalClosedAt < 400) return;
      if (box === lastActionEl && Date.now() - lastActionTime < ACTION_DEBOUNCE_MS) return;
      lastActionEl = box; lastActionTime = Date.now();
      if (e.type === 'touchstart') e.preventDefault();
      var type = (box.dataset.box || '').toLowerCase();
      if (type === 'secret' && secretBoxKeys >= 1) { openBox('secret'); return; }
      if (typeof BOX_COSTS !== 'undefined' && BOX_COSTS[type] != null && coins >= BOX_COSTS[type]) openBox(type);
      return;
    }
    if (t.closest('[data-pack]')) {
      var packEl = t.closest('[data-pack]');
      if (packEl.disabled) return;
      if (Date.now() - _cardModalClosedAt < 400) return;
      if (packEl === lastActionEl && Date.now() - lastActionTime < ACTION_DEBOUNCE_MS) return;
      lastActionEl = packEl; lastActionTime = Date.now();
      if (e.type === 'touchstart') e.preventDefault();
      var pack = packEl.dataset.pack;
      if (pack) {
        var parts = pack.split('-');
        if (parts.length === 2) {
          var boxType = parts[0];
          var n = parseInt(parts[1], 10);
          var cost = typeof BOX_COSTS !== 'undefined' ? BOX_COSTS[boxType] : null;
          var discount = typeof PACK_DISCOUNTS !== 'undefined' ? (PACK_DISCOUNTS[n] || 1) : 1;
          var totalCost = cost != null ? Math.floor(cost * n * discount) : 0;
          var canBuy = (boxType === 'secret' && secretBoxKeys >= n) || (cost != null && coins >= totalCost);
          if (canBuy) {
            packEl.classList.add('pressed', 'pack-btn--loading');
            packEl.disabled = true;
            setTimeout(function () {
              openPack(boxType, n);
              packEl.classList.remove('pressed', 'pack-btn--loading');
              packEl.disabled = false;
              if (typeof updateBoxButtons === 'function') updateBoxButtons();
              if (typeof updatePackButtons === 'function') updatePackButtons();
            }, 120);
          }
        }
      }
      return;
    }
    if (t.closest('.modal-backdrop') || t.closest('.pack-reveal-wrap')) {
      var m = t.closest('.modal');
      if (m) {
        if (m.id === 'secretCodeModal' && Date.now() - (window._secretModalOpenedAt || 0) < 500) return;
        if (m.id === 'cardModal' && typeof closeCardModal === 'function') {
          if (e.type === 'touchstart') e.preventDefault();
          closeCardModal();
        } else if (m.id === 'packRevealModal') {
          if (typeof _packRevealOnTap === 'function') {
            e.stopPropagation();
            if (e.type === 'touchstart') e.preventDefault();
            _packRevealOnTap();
          }
        } else m.classList.add('hidden');
      }
      return;
    }
    if (t.closest('#modalClose') || t.closest('#secretCodeClose')) {
      var mod = t.closest('.modal');
      if (mod) {
        if (mod.id === 'secretCodeModal' && Date.now() - (window._secretModalOpenedAt || 0) < 500) return;
        if (mod.id === 'cardModal' && typeof closeCardModal === 'function') {
          if (e.type === 'touchstart') e.preventDefault();
          closeCardModal();
        } else mod.classList.add('hidden');
      }
      return;
    }
    if (t.closest('#secretCodeSubmit')) {
      var code = (secretCodeInput && secretCodeInput.value || '').trim().toUpperCase();
      var reward = PROMO_CODES && PROMO_CODES[code];
      if (reward) {
        if (reward.coins) { coins += reward.coins; saveCoins(); }
        if (reward.secretBoxKeys) { secretBoxKeys += reward.secretBoxKeys; saveSecretBoxKeys(); }
        updateCoinDisplay();
        if (secretCodeModal) secretCodeModal.classList.add('hidden');
        if (secretCodeInput) secretCodeInput.value = '';
      }
      return;
    }
    if (t.closest('.upgrade-btn') && !t.closest('.upgrade-btn:disabled')) {
      var ub = t.closest('.upgrade-btn');
      if (ub === lastActionEl && Date.now() - lastActionTime < ACTION_DEBOUNCE_MS) return;
      lastActionEl = ub; lastActionTime = Date.now();
      if (e.type === 'touchstart') e.preventDefault();
      var id = ub.dataset.upgrade;
      if (id) {
        var u = UPGRADE_DEFS.find(function(x) { return x.id === id; });
        if (u) {
          var cur = upgrades[id] || 0;
          if (cur < u.maxLevel) {
            var cost = u.cost * (cur + 1);
            var reqLvl = (u.requiredLevelPerTier && u.requiredLevelPerTier[cur + 1]) || 0;
            if (coins >= cost && level >= reqLvl && ((u.id !== 'miningLevel' && u.id !== 'miningPerSec') || (upgrades.mining || 0) >= 1)) {
              coins -= cost; upgrades[id] = cur + 1;
              if (id === 'energyCap') energyMax = 20 + upgrades.energyCap * 10;
              saveCoins(); saveUpgrades(); saveEnergy();
              updateCoinDisplay(); updateBars(); renderUpgrades();
            }
          }
        }
      }
      return;
    }
    if (t.closest('.mining-claim')) {
      var mc = t.closest('.mining-claim');
      if (mc === lastActionEl && Date.now() - lastActionTime < ACTION_DEBOUNCE_MS) return;
      lastActionEl = mc; lastActionTime = Date.now();
      if (e.type === 'touchstart') e.preventDefault();
      if (canClaimMining && canClaimMining()) {
        var r = getMiningReward && getMiningReward();
        coins += r; lastMiningClaimTime = Date.now();
        saveCoins(); saveMining();
        updateCoinDisplay(); if (typeof renderMining === 'function') renderMining();
      }
      return;
    }
  }

  function goToGame() {
    if (loader && !loader.classList.contains('hidden')) {
      loader.classList.add('hidden');
      if (app) app.classList.remove('hidden');
    }
    try { startApp(); } catch (e) { console.error('ZOV:', e); }
  }

  window.zovTab = function(tab, btn) {
    var appEl = document.getElementById('app');
    if (!appEl || appEl.classList.contains('hidden')) return;
    var nav = appEl.querySelectorAll('.nav-btn');
    var panels = appEl.querySelectorAll('[data-panel]');
    nav.forEach(function(b){ b.classList.remove('active'); });
    if (btn) btn.classList.add('active');
    panels.forEach(function(p){ p.classList.toggle('active', p.dataset.panel === tab); });
    refreshUpgradesAndBoxes();
    if (tab === 'leaderboard' && typeof loadLeaderboard === 'function') loadLeaderboard();
  };
  window.zovTap = function(ev) {
    if (ev) { ev.preventDefault(); ev.stopPropagation(); }
    if (!app || app.classList.contains('hidden')) return;
    var now = Date.now();
    if (now - lastCoinTap < 450) return;
    lastCoinTap = now;
    if (energy < 1) return;
    energy--; saveEnergy();
    var gain = getCoinPerTap();
    coins += gain; saveCoins();
    updateCoinDisplay(); addXP(1); updateBars();
    showTapPlus(gain);
    var btn = document.getElementById('coinBtn');
    if (btn) { btn.classList.add('pop'); setTimeout(function() { btn.classList.remove('pop'); }, 200); }
  };
  function startApp() {
    if (!app) return;
    if (!window._zovClickBound) {
      window._zovClickBound = true;
      document.addEventListener('click', handleAppClick, true);
      document.addEventListener('touchstart', handleAppClick, { capture: true, passive: false });
      function addPressed(e) {
        var el = (e.target && e.target.closest) ? e.target.closest('.loot-box:not(:disabled), .pack-btn:not(:disabled)') : null;
        if (el) el.classList.add('pressed');
      }
      function removePressed() {
        document.querySelectorAll('.loot-box.pressed, .pack-btn.pressed').forEach(function(x) { x.classList.remove('pressed'); });
      }
      document.addEventListener('pointerdown', addPressed, true);
      document.addEventListener('pointerup', removePressed, true);
      document.addEventListener('pointercancel', removePressed, true);
    }
    var brand = $('.header-brand');
    if (brand && !brand._zovLogoBound) {
      brand._zovLogoBound = true;
      brand.addEventListener('pointerdown', function(e) {
        if (e.isPrimary === false) return;
        e.preventDefault();
        e.stopPropagation();
        handleLogoSecretTap();
      }, { capture: true, passive: false });
    }
    if (coinBtn && !coinBtn._zovCoinBound) {
      coinBtn._zovCoinBound = true;
      coinBtn.addEventListener('pointerdown', function(e) {
        if (e.isPrimary === false) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        var now = Date.now();
        var pt = (e.pointerType || '').toLowerCase();
        if (pt === 'mouse' && lastCoinPointerType === 'touch' && now - lastCoinTap < 700) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        if (now - lastCoinTap < 120) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        lastCoinTap = now;
        lastCoinPointerType = pt;
        if (!app || app.classList.contains('hidden')) return;
        if (energy < 1) return;
        energy--; saveEnergy();
        var gain = getCoinPerTap();
        coins += gain; saveCoins();
        updateCoinDisplay(); addXP(1); updateBars();
        showTapPlus(gain);
        coinBtn.classList.add('pop');
        setTimeout(function() { coinBtn.classList.remove('pop'); }, 200);
      }, { capture: true, passive: false });
    }
    try {
      restoreEnergyOffline();
      updateCoinDisplay();
      updateBars();
      renderCards();
      checkCollections();
      renderUpgrades();
      renderCollections();
      if (typeof renderMining === 'function') renderMining();
      startEnergyTick();
      if (typeof syncLoad === 'function') syncLoad();
      if (getInitData() && typeof syncLeaderboard === 'function') setTimeout(syncLeaderboard, 500);
    } catch (err) {
      console.error('ZOV startApp:', err);
    }
  }

  function onLoaderTap(e) {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    if (loaderBar) loaderBar.style.width = '100%';
    if (loaderPercent) loaderPercent.textContent = '100%';
    setTimeout(goToGame, 200);
  }

  document.addEventListener('zov-ready', function() { goToGame(); });
  if (loader && loader.classList.contains('hidden')) {
    goToGame();
  }

  // ─── Coins & storage ────────────────────────────────────────────
  function saveCoins() {
    localStorage.setItem(STORAGE_KEYS.coins, String(coins));
  }

  function saveCards() {
    localStorage.setItem(STORAGE_KEYS.cards, JSON.stringify(cards));
  }
  function saveEnergy() {
    localStorage.setItem(STORAGE_KEYS.energy, String(energy));
    localStorage.setItem(STORAGE_KEYS.energyMax, String(energyMax));
    localStorage.setItem(STORAGE_KEYS.lastEnergyTime, String(Date.now()));
  }
  function saveLevel() {
    localStorage.setItem(STORAGE_KEYS.level, String(level));
    localStorage.setItem(STORAGE_KEYS.xp, String(xp));
  }
  function saveCompletedCollections() {
    localStorage.setItem(STORAGE_KEYS.completedCollections, JSON.stringify(completedCollections));
  }
  function saveUpgrades() {
    localStorage.setItem(STORAGE_KEYS.upgrades, JSON.stringify(upgrades));
  }
  function saveMining() {
    localStorage.setItem(STORAGE_KEYS.lastMiningClaimTime, String(lastMiningClaimTime));
    localStorage.setItem(STORAGE_KEYS.accumulatedMiningPassive, String(accumulatedMiningPassive));
  }
  function saveSecretBoxKeys() {
    localStorage.setItem(STORAGE_KEYS.secretBoxKeys, String(secretBoxKeys));
  }
  function getTotalCards() {
    return cards.reduce(function (sum, c) { return sum + (c.count || 1); }, 0);
  }
  function restoreEnergyOffline() {
    var now = Date.now();
    var elapsed = Math.floor((now - lastEnergyTime) / 1000);
    var regenPerSec = 1 + (upgrades.regen || 0) * 0.5;
    energy = Math.min(energyMax, energy + Math.floor(elapsed * regenPerSec));
    saveEnergy();
  }
  function startEnergyTick() {
    setInterval(function () {
      var regen = 1 + (upgrades.regen || 0) * 0.5;
      energy = Math.min(energyMax, energy + regen);
      saveEnergy();
      var perSec = (upgrades.mining || 0) >= 1 ? (upgrades.miningPerSec || 0) : 0;
      if (perSec > 0) {
        accumulatedMiningPassive += perSec;
        localStorage.setItem(STORAGE_KEYS.accumulatedMiningPassive, String(accumulatedMiningPassive));
        var rewardEl = $('#miningRewardAmount');
        if (rewardEl) {
          var base = getMiningReward();
          rewardEl.textContent = (base + accumulatedMiningPassive).toLocaleString('ru-RU');
        }
      }
      updateBars();
    }, 1000);
  }
  function updateBars() {
    if (energyFill) energyFill.style.width = (energyMax ? (energy / energyMax) * 100 : 0) + '%';
    if (energyText) energyText.textContent = energy + ' / ' + energyMax;
    var xpNeed = getXpToNextLevel(level);
    if (levelFill) levelFill.style.width = (xpNeed ? (xp / xpNeed) * 100 : 0) + '%';
    if (levelNum) levelNum.textContent = level;
    if (xpText) xpText.textContent = xp + ' / ' + xpNeed + ' XP';
  }
  function addXP(amount) {
    xp += amount;
    while (xp >= getXpToNextLevel(level)) {
      xp -= getXpToNextLevel(level);
      level++;
    }
    saveLevel();
    updateBars();
  }
  function getCoinPerTap() {
    return 1 + (upgrades.coinPerTap || 0);
  }
  function updateCoinDisplay() {
    if (coinCountEl) coinCountEl.textContent = coins.toLocaleString('ru-RU');
    refreshUpgradesAndBoxes();
  }
  function refreshUpgradesAndBoxes() {
    renderUpgrades();
    updateBoxButtons();
    updatePackButtons();
    if (typeof renderMining === 'function') renderMining();
  }
  function updateBoxButtons() {
    ['bronze', 'silver', 'gold', 'platinum'].forEach(function (type) {
      var btn = $('#box' + type.charAt(0).toUpperCase() + type.slice(1));
      if (btn) btn.disabled = coins < (BOX_COSTS[type] || 0);
    });
    var secretBtn = $('#boxSecret');
    if (secretBtn) secretBtn.disabled = secretBoxKeys < 1;
  }
  function updatePackButtons() {
    var types = ['bronze', 'silver', 'gold', 'platinum'];
    [5, 10, 100].forEach(function (n) {
      var discount = PACK_DISCOUNTS[n] || 1;
      var discountPct = Math.round((1 - discount) * 100);
      types.forEach(function (t) {
        var el = document.querySelector('[data-pack="' + t + '-' + n + '"]');
        if (!el) return;
        var cost = BOX_COSTS[t];
        var total = cost != null ? Math.floor(cost * n * discount) : 0;
        el.innerHTML = '<span class="pack-btn-count">' + n + ' шт</span><strong>' + total.toLocaleString('ru-RU') + '</strong><span class="pack-discount">−' + discountPct + '%</span>';
        el.disabled = cost != null && coins < total;
      });
    });
  }

  // ─── Clicker (мультитап, +N в случайной точке внутри монеты) ─────
  var _tapPlusShown = 0;
  function showTapPlus(amount) {
    var now = Date.now();
    if (now - _tapPlusShown < 100) return;
    _tapPlusShown = now;
    var area = $('.game-card-area');
    if (!area) return;
    var existing = area.querySelectorAll('.tap-coin-plus-floating');
    existing.forEach(function(el) { el.remove(); });
    var plus = document.createElement('span');
    plus.className = 'tap-coin-plus-floating';
    plus.textContent = '+' + amount;
    var rect = area.getBoundingClientRect();
    var x = 30 + Math.random() * 80;
    var y = 30 + Math.random() * 80;
    plus.style.left = x + '%';
    plus.style.top = y + '%';
    plus.style.transform = 'translate(-50%, -50%)';
    area.style.position = 'relative';
    area.appendChild(plus);
    setTimeout(function () { plus.remove(); }, 700);
  }
  function bindClicker() {
    if (!coinBtn) return;
    coinBtn.addEventListener('click', function (e) {
      if (energy < 1) return;
      energy--;
      saveEnergy();
      var gain = getCoinPerTap();
      coins += gain;
      saveCoins();
      updateCoinDisplay();
      addXP(1);
      updateBars();
      showTapPlus(gain);
      coinBtn.classList.add('pop');
      setTimeout(function () { coinBtn.classList.remove('pop'); }, 200);
    });
    coinBtn.addEventListener('touchstart', function () {}, { passive: true });
  }

  // ─── Tabs ───────────────────────────────────────────────────────
  function bindTabs() {
    if (!app) return;
    const panels = $$('[data-panel]', app);
    $$('.nav-btn', app).forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        $$('.nav-btn', app).forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        panels.forEach(p => {
          p.classList.toggle('active', p.dataset.panel === tab);
        });
        refreshUpgradesAndBoxes();
        if (tab === 'leaderboard' && typeof loadLeaderboard === 'function') loadLeaderboard();
      });
    });
  }

  // ─── Карточки: стак по name+country+rarity ────────────────────────
  function addCard(cardData) {
    var key = (cardData.name || '') + '|' + (cardData.country || '') + '|' + (cardData.rarity || 'common');
    var existing = cards.find(function (c) {
      return (c.name || '') + '|' + (c.country || '') + '|' + (c.rarity || 'common') === key;
    });
    if (existing) {
      existing.count = (existing.count || 1) + 1;
    } else {
      cards.push({
        id: Date.now() + '-' + Math.random().toString(36).slice(2),
        name: cardData.name,
        country: cardData.country,
        type: cardData.type || 'city',
        rarity: cardData.rarity || 'common',
        typeLabel: cardData.typeLabel || (typeof getTypeLabel === 'function' ? getTypeLabel(cardData.type || 'city') : 'ЛОКАЦИЯ'),
        count: 1,
      });
    }
    saveCards();
    renderCards();
    checkCollections();
  }

  // ─── Boxes ───────────────────────────────────────────────────────
  var _openBoxLock = false;
  function openBox(boxType) {
    if (_openBoxLock) return;
    _openBoxLock = true;
    setTimeout(function () { _openBoxLock = false; }, 800);
    var cost = BOX_COSTS[boxType];
    var useSecretKey = boxType === 'secret' && secretBoxKeys > 0;
    if (!useSecretKey && (cost == null || coins < cost)) return;
    if (useSecretKey) {
      secretBoxKeys--;
      saveSecretBoxKeys();
    } else {
      coins -= cost;
      saveCoins();
    }
    updateCoinDisplay();

    var rarity = typeof rollRandomRarity === 'function' ? rollRandomRarity(boxType) : 'common';

    function finishWithCard(loc) {
      var cardData = {
        name: loc.name,
        country: loc.country,
        type: loc.type || 'city',
        rarity: rarity,
        typeLabel: typeof getTypeLabel === 'function' ? getTypeLabel(loc.type || 'city') : 'ЛОКАЦИЯ',
      };
      addCard(cardData);
      var added = cards.find(function (c) {
        return (c.name || '') + '|' + (c.country || '') + '|' + (c.rarity || 'common') ===
          (cardData.name || '') + '|' + (cardData.country || '') + '|' + (cardData.rarity || 'common');
      });
      addXP(10);
      showCardModal(added || cardData, true);
    }

    var getLoc = typeof getRandomLocationFromList === 'function' ? getRandomLocationFromList : pickRandomLocation;
    var fromList = getLoc(boxType);
    if (fromList && fromList.name) {
      finishWithCard({ name: fromList.name, country: fromList.country, type: fromList.type });
    } else {
      var fallback = pickRandomLocation(boxType);
      finishWithCard({ name: fallback.name, country: fallback.country, type: fallback.type });
    }
  }

  function bindBoxes() {
    ['bronze', 'silver', 'gold', 'platinum'].forEach(function (type) {
      var btn = $('#box' + type.charAt(0).toUpperCase() + type.slice(1));
      if (!btn) return;
      btn.addEventListener('click', function () {
        if (BOX_COSTS[type] != null && coins < BOX_COSTS[type]) return;
        openBox(type);
      });
    });
    var secretBtn = $('#boxSecret');
    if (secretBtn) {
      secretBtn.addEventListener('click', function () {
        if (secretBoxKeys < 1) return;
        openBox('secret');
      });
    }
    updateBoxButtons();
  }
  var _openPackLock = false;
  function openPack(boxType, count) {
    if (_openPackLock) return;
    var singleCost = BOX_COSTS[boxType];
    if (singleCost == null && !(boxType === 'secret' && secretBoxKeys >= count)) return;
    var discount = PACK_DISCOUNTS[count] || 1;
    var totalCost = singleCost != null ? Math.floor(singleCost * count * discount) : 0;
    if (boxType === 'secret') {
      if (secretBoxKeys < count) return;
    } else if (coins < totalCost) return;
    _openPackLock = true;
    var modal = document.getElementById('packRevealModal');
    var loadingEl = document.getElementById('packRevealLoading');
    if (modal && loadingEl) {
      modal.classList.remove('hidden');
      loadingEl.classList.remove('hidden');
    }
    if (boxType === 'secret') {
      secretBoxKeys -= count;
      saveSecretBoxKeys();
    } else {
      coins -= totalCost;
      saveCoins();
    }
    updateCoinDisplay();
    var queue = [];
    function addCardsFromList(list) {
      for (var i = 0; i < list.length; i++) {
        var loc = list[i];
        var r = typeof rollRandomRarity === 'function' ? rollRandomRarity(boxType) : 'common';
        var cardData = { name: loc.name, country: loc.country, type: loc.type || 'city', rarity: r, typeLabel: typeof getTypeLabel === 'function' ? getTypeLabel(loc.type || 'city') : 'ЛОКАЦИЯ' };
        addCard(cardData);
        addXP(10);
        var added = cards.find(function (c) { return (c.name || '') + '|' + (c.country || '') + '|' + (c.rarity || 'common') === (cardData.name || '') + '|' + (cardData.country || '') + '|' + (cardData.rarity || 'common'); });
        queue.push(added || cardData);
      }
      showPackReveal(queue);
    }
    var list = [];
    for (var i = 0; i < count; i++) {
      var fromList = typeof getRandomLocationFromList === 'function' ? getRandomLocationFromList(boxType) : pickRandomLocation(boxType);
      list.push({ name: fromList.name, country: fromList.country, type: fromList.type });
    }
    addCardsFromList(list);
  }

  function makePackCardEl(card, isMany, noFlip) {
    var w = isMany ? 150 : 200;
    var h = isMany ? 105 : 140;
    var imgUrl = typeof getLocationImageUrl === 'function' ? getLocationImageUrl(card, w, h) : '';
    var placeholderUri = typeof getLocationPlaceholderDataUri === 'function' ? getLocationPlaceholderDataUri(card.name) : '';
    var div = document.createElement('div');
    div.className = 'pack-flip-card' + (noFlip ? ' pack-flip-card--plain' : '');
    div.innerHTML =
      '<div class="pack-flip-inner">' +
        (noFlip ? '' : '<div class="pack-flip-back"></div>') +
        '<div class="pack-flip-front nft-card nft-card--' + (card.rarity || 'common') + '">' +
          '<div class="nft-card-image-wrap"><img class="nft-card-image" src="' + imgUrl + '" alt="" loading="lazy" data-fallback="' + (placeholderUri || '') + '" onerror="if(this.dataset.fallback){this.onerror=null;this.src=this.dataset.fallback}" /><div class="nft-card-overlay"></div></div>' +
          '<div class="nft-card-inner">' +
            '<div class="nft-card-type">' + escapeHtml(card.typeLabel || getTypeLabel(card.type)) + '</div>' +
            '<div class="nft-card-name">' + escapeHtml(card.name) + '</div>' +
            '<div class="nft-card-country">' + escapeHtml(card.country) + '</div>' +
            '<div class="nft-card-rarity rarity-' + (card.rarity || 'common') + '">' + rarityLabel(card.rarity) + '</div>' +
          '</div>' +
        '</div>' +
      '</div>';
    return div;
  }
  var _packRevealState = 'ready';
  var _packRevealFlipTimeouts = [];
  var _packRevealJustFlippedUntil = 0;
  function _packRevealOnTap() {
    if (_packRevealState === 'opening') {
      _packRevealFlipTimeouts.forEach(function (t) { clearTimeout(t); });
      _packRevealFlipTimeouts = [];
      var container = document.getElementById('packRevealCards');
      if (container) container.querySelectorAll('.pack-flip-card').forEach(function (el) { el.classList.add('flipped'); });
      _packRevealState = 'ready';
      _packRevealJustFlippedUntil = Date.now() + 400;
    } else if (Date.now() >= _packRevealJustFlippedUntil) {
      var modal = document.getElementById('packRevealModal');
      if (modal) {
        modal.classList.add('hidden');
        renderCards();
        checkCollections();
      }
      _packRevealState = 'ready';
    }
  }
  function showPackReveal(cardList) {
    var container = document.getElementById('packRevealCards');
    var modal = document.getElementById('packRevealModal');
    var loadingEl = document.getElementById('packRevealLoading');
    if (!container || !modal) return;
    if (loadingEl) loadingEl.classList.add('hidden');
    _openPackLock = false;
    _packRevealFlipTimeouts.forEach(function (t) { clearTimeout(t); });
    _packRevealFlipTimeouts = [];
    container.innerHTML = '';
    container.classList.remove('pack-reveal-cards--few', 'pack-reveal-cards--medium', 'pack-reveal-cards--many', 'pack-reveal-cards--hundred');
    if (cardList.length > 10) container.classList.add(cardList.length >= 50 ? 'pack-reveal-cards--hundred' : 'pack-reveal-cards--many');
    else if (cardList.length > 6) container.classList.add('pack-reveal-cards--medium');
    else container.classList.add('pack-reveal-cards--few');
    var isMany = cardList.length > 10;
    var noFlip = false;
    cardList.forEach(function (card) {
      container.appendChild(makePackCardEl(card, isMany, noFlip));
    });
    container.scrollTop = 0;
    modal.classList.remove('hidden');
    _packRevealState = 'opening';
    var cards = container.querySelectorAll('.pack-flip-card');
    if (!noFlip) {
      var delay = cardList.length >= 50 ? 35 : cardList.length > 10 ? 50 : cardList.length > 6 ? 100 : 300;
      cards.forEach(function (el, i) {
        var t = setTimeout(function () { el.classList.add('flipped'); }, 100 + i * delay);
        _packRevealFlipTimeouts.push(t);
      });
      var totalTime = 100 + (cards.length - 1) * delay + 100;
      _packRevealFlipTimeouts.push(setTimeout(function () { _packRevealState = 'ready'; }, totalTime));
    } else {
      _packRevealState = 'ready';
    }
  }

  // ─── Cards grid (стак: count показываем бейджем) ──────────────────
  function renderCards() {
    var total = getTotalCards();
    if (cardsCountEl) cardsCountEl.textContent = total;

    if (!cardsGrid) return;
    if (cards.length === 0) {
      cardsGrid.innerHTML = '<div class="cards-empty"><span class="cards-empty-icon">&#9733;</span>Пока нет карточек.<br>Открой боксы!</div>';
      return;
    }

    cardsGrid.innerHTML = cards
      .map(
        (c) => {
          var imgUrl = typeof getLocationImageUrl === 'function' ? getLocationImageUrl(c, 400, 300) : '';
          var placeholderUri = typeof getLocationPlaceholderDataUri === 'function' ? getLocationPlaceholderDataUri(c.name) : '';
          var rarityClass = 'nft-card--' + (c.rarity || 'common');
          var countBadge = (c.count || 1) > 1 ? '<span class="nft-card-stack">×' + (c.count || 1) + '</span>' : '';
          return (
            '<div class="nft-card ' + rarityClass + '" data-card-id="' + (c.id || '') + '">' +
              '<div class="nft-card-image-wrap">' +
                '<img class="nft-card-image" src="' + imgUrl + '" alt="' + escapeHtml(c.name) + '" loading="lazy" data-fallback="' + (placeholderUri || '') + '" onerror="if(this.dataset.fallback){this.onerror=null;this.src=this.dataset.fallback}" />' +
                '<div class="nft-card-overlay"></div>' +
                countBadge +
              '</div>' +
              '<div class="nft-card-inner">' +
                '<div class="nft-card-type">' + escapeHtml(c.typeLabel || getTypeLabel(c.type)) + '</div>' +
                '<div class="nft-card-name">' + escapeHtml(c.name) + '</div>' +
                '<div class="nft-card-country">' + escapeHtml(c.country) + '</div>' +
                '<div class="nft-card-rarity rarity-' + (c.rarity || 'common') + '">' + rarityLabel(c.rarity) + '</div>' +
              '</div>' +
            '</div>'
          );
        }
      )
      .join('');

    cardsGrid.querySelectorAll('.nft-card').forEach((el) => {
      el.addEventListener('click', () => {
        const id = el.dataset.cardId;
        const card = cards.find((c) => c.id === id);
        if (card) showCardModal(card);
      });
    });
  }

  function escapeHtml(s) {
    const div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  function rarityLabel(r) {
    const labels = { common: 'Обычная', rare: 'Редкая', epic: 'Эпик', legendary: 'Легенда', inferno: 'Инферно', collector: 'Коллекционная', exclusive: 'Эксклюзив' };
    return labels[r] || 'Обычная';
  }

  // ─── Modal (разные анимации и фоны по редкости) ───
  var _cardModalOnClose = null;
  var _revealModalClasses = ['modal--reveal-common', 'modal--reveal-rare', 'modal--reveal-epic', 'modal--reveal-legendary', 'modal--reveal-inferno', 'modal--reveal-collector', 'modal--reveal-exclusive'];
  var _revealLabels = { common: '', rare: 'Редкая!', epic: 'ЭПИК!', legendary: 'ЛЕГЕНДА!', inferno: 'ИНФЕРНО!', collector: 'КОЛЛЕКЦИОННАЯ!', exclusive: 'ЭКСКЛЮЗИВ!' };
  var _revealAnimByRarity = { common: 'reveal-drop', rare: 'reveal-scale', epic: 'reveal-flip', legendary: 'reveal-celebration', inferno: 'reveal-celebration', collector: 'reveal-celebration', exclusive: 'reveal-celebration' };
  function spawnRevealParticles(color, count) {
    var container = document.getElementById('modalRevealParticles');
    if (!container) return;
    container.innerHTML = '';
    container.classList.remove('modal-reveal-particles--active');
    for (var i = 0; i < count; i++) {
      var p = document.createElement('span');
      p.className = 'modal-reveal-particle';
      var angle = (i / count) * 360 + Math.random() * 40;
      var dist = 80 + Math.random() * 120;
      p.style.setProperty('--angle', angle + 'deg');
      p.style.setProperty('--dist', dist + 'px');
      p.style.setProperty('--delay', (Math.random() * 0.15) + 's');
      p.style.background = color;
      container.appendChild(p);
    }
    container.offsetHeight;
    container.classList.add('modal-reveal-particles--active');
    setTimeout(function () { container.classList.remove('modal-reveal-particles--active'); container.innerHTML = ''; }, 1000);
  }
  function showCardModal(card, isReveal, onClosed) {
    _cardModalOnClose = onClosed || null;
    _revealModalClasses.forEach(function (c) { if (cardModal) cardModal.classList.remove(c); });
    var r = card.rarity || 'common';
    var flashEl = document.getElementById('modalRevealFlash');
    var labelEl = document.getElementById('modalRevealLabel');
    if (flashEl) flashEl.className = 'modal-reveal-flash';
    if (labelEl) labelEl.textContent = '';
    if (isReveal) {
      cardModal.classList.add('modal--reveal-' + r);
      if (flashEl) flashEl.className = 'modal-reveal-flash modal-reveal-flash--' + r;
      var labelText = _revealLabels[r] || '';
      if (labelText && labelEl) { labelEl.textContent = labelText; labelEl.className = 'modal-reveal-label modal-reveal-label--' + r; }
      if (r === 'legendary' || r === 'inferno' || r === 'collector' || r === 'exclusive') {
        var particleColors = { legendary: 'rgba(255,215,100,0.9)', inferno: 'rgba(255,120,50,0.9)', collector: 'rgba(100,255,255,0.9)', exclusive: 'rgba(255,255,150,0.9)' };
        spawnRevealParticles(particleColors[r] || 'rgba(255,255,255,0.8)', r === 'legendary' || r === 'exclusive' ? 24 : 16);
      }
    }
    modalCardType.textContent = card.typeLabel || getTypeLabel(card.type);
    modalCardName.textContent = card.name;
    modalCardCountry.textContent = card.country;
    modalCardRarity.textContent = rarityLabel(card.rarity);
    modalCardRarity.className = 'nft-card-rarity rarity-' + r;
    var modalCard = cardModal.querySelector('.modal .nft-card');
    var allRarities = ['common', 'rare', 'epic', 'legendary', 'inferno', 'collector', 'exclusive'];
    if (modalCard) {
      allRarities.forEach(function (r2) { modalCard.classList.remove('nft-card--' + r2); });
      modalCard.classList.add('nft-card--' + r);
    }
    if (modalCardWrap) {
      modalCardWrap.classList.remove('reveal-flip', 'reveal-scale', 'reveal-glow', 'reveal-drop', 'reveal-celebration');
      if (isReveal) {
        var anim = _revealAnimByRarity[r] || 'reveal-drop';
        modalCardWrap.classList.add(anim);
      }
    }
    if (modalCardImage) {
      if (typeof getLocationImageUrl === 'function') {
        modalCardImage.src = getLocationImageUrl(card, 600, 400);
        modalCardImage.dataset.fallback = typeof getLocationPlaceholderDataUri === 'function' ? getLocationPlaceholderDataUri(card.name) : '';
        modalCardImage.onerror = function () {
          if (this.dataset.fallback) { this.onerror = null; this.src = this.dataset.fallback; }
        };
      }
      modalCardImage.alt = card.name;
    }
    if (isReveal) cardModal.classList.add('modal--no-fade');
    else cardModal.classList.remove('modal--no-fade');
    cardModal.classList.remove('hidden');
    if (isReveal && modalCardWrap) {
      var anim = _revealAnimByRarity[r] || 'reveal-drop';
      var animDuration = (anim === 'reveal-celebration' ? 1200 : anim === 'reveal-flip' ? 800 : 700);
      setTimeout(function () { modalCardWrap.classList.remove(anim); }, animDuration);
    }
  }

  function normalizePlace(s) { return (s || '').trim().toLowerCase().replace(/\s+/g, ' '); }
  function getCollectionCount(req) {
    if (req.type === 'total') return getTotalCards();
    if (req.type === 'village') return cards.filter(function (c) { return (c.type || '').toLowerCase() === 'village'; }).reduce(function (s, c) { return s + (c.count || 1); }, 0);
    if (req.type === 'city') return cards.filter(function (c) { return (c.type || '').toLowerCase() === 'city'; }).reduce(function (s, c) { return s + (c.count || 1); }, 0);
    if (req.type === 'legendary') return cards.filter(function (c) { return c.rarity === 'legendary'; }).reduce(function (s, c) { return s + (c.count || 1); }, 0);
    if (req.type === 'island') return cards.filter(function (c) { return (c.type || '').toLowerCase() === 'island'; }).reduce(function (s, c) { return s + (c.count || 1); }, 0);
    if (req.type === 'countries') {
      var seen = {};
      cards.forEach(function (c) { var country = (c.country || '').trim(); if (country) seen[country] = true; });
      return Object.keys(seen).length;
    }
    if (req.type === 'capitals' && typeof CAPITALS !== 'undefined') {
      var capSet = {};
      cards.forEach(function (c) {
        var key = normalizePlace(c.name) + '|' + normalizePlace(c.country);
        CAPITALS.forEach(function (cap) {
          var parts = cap.split('|');
          if (parts.length >= 2 && normalizePlace(parts[0]) === normalizePlace(c.name) && normalizePlace(parts[1]) === normalizePlace(c.country)) capSet[cap] = true;
        });
      });
      return Object.keys(capSet).length;
    }
    if (req.type === 'topCities' && typeof TOP_POPULOUS_CITIES !== 'undefined') {
      var topSet = {};
      cards.forEach(function (c) {
        var key = normalizePlace(c.name) + '|' + normalizePlace(c.country);
        TOP_POPULOUS_CITIES.forEach(function (tc) {
          var parts = tc.split('|');
          if (parts.length >= 2 && normalizePlace(parts[0]) === normalizePlace(c.name) && normalizePlace(parts[1]) === normalizePlace(c.country)) topSet[tc] = true;
        });
      });
      return Object.keys(topSet).length;
    }
    if (req.type === 'continents' && typeof COUNTRY_TO_CONTINENT !== 'undefined') {
      var contSet = {};
      cards.forEach(function (c) {
        var country = (c.country || '').trim();
        var cont = COUNTRY_TO_CONTINENT[country];
        if (cont) contSet[cont] = true;
      });
      return Object.keys(contSet).length;
    }
    return 0;
  }
  function checkCollections() {
    if (typeof COLLECTIONS === 'undefined') return;
    COLLECTIONS.forEach(function (col) {
      if (completedCollections.indexOf(col.id) >= 0) return;
      var count = getCollectionCount(col.req);
      if (count >= col.req.count) {
        completedCollections.push(col.id);
        saveCompletedCollections();
        coins += col.rewardCoins || 0;
        addXP(col.rewardXp || 0);
        if (col.rewardSecretBoxKeys) { secretBoxKeys += col.rewardSecretBoxKeys; saveSecretBoxKeys(); }
        saveCoins();
        updateCoinDisplay();
        renderCollections();
      }
    });
  }

  function renderUpgrades() {
    if (!upgradesList) return;
    var html = '';
    UPGRADE_DEFS.forEach(function (u) {
      var lvl = upgrades[u.id] || 0;
      var isMax = lvl >= u.maxLevel;
      var cost = isMax ? 0 : u.cost * (lvl + 1);
      var requiredLevel = (u.requiredLevelPerTier && u.requiredLevelPerTier[lvl + 1]) || 0;
      var miningOk = (u.id !== 'miningLevel' && u.id !== 'miningPerSec') || (upgrades.mining || 0) >= 1;
      var canBuy = !isMax && coins >= cost && level >= requiredLevel && miningOk;
      var levelHint = requiredLevel > level ? ' (нужен ур. ' + requiredLevel + ')' : '';
      html += '<div class="upgrade-item' + (isMax ? ' upgrade-item--max' : '') + '">' +
        '<div><span class="upgrade-name">' + u.name + '</span><p class="upgrade-desc">' + u.desc + ' · Ур.' + lvl + '/' + u.maxLevel + levelHint + '</p></div>' +
        '<div>' +
          (isMax ? '<span class="upgrade-cost">Макс.</span>' : '<span class="upgrade-cost">' + cost + ' монет</span><button type="button" class="upgrade-btn" data-upgrade="' + u.id + '" ' + (canBuy ? '' : 'disabled') + '>Купить</button>') +
        '</div></div>';
    });
    upgradesList.innerHTML = html;
    upgradesList.querySelectorAll('.upgrade-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.dataset.upgrade;
        var u = UPGRADE_DEFS.find(function (x) { return x.id === id; });
        if (!u) return;
        var cur = upgrades[id] || 0;
        if (cur >= u.maxLevel) return;
        var cost = u.cost * (cur + 1);
        var reqLvl = (u.requiredLevelPerTier && u.requiredLevelPerTier[cur + 1]) || 0;
        var needMining = (u.id === 'miningLevel' || u.id === 'miningPerSec') && (upgrades.mining || 0) < 1;
        if (coins < cost || level < reqLvl || needMining) return;
        coins -= cost;
        upgrades[id] = cur + 1;
        if (id === 'energyCap') energyMax = 20 + upgrades.energyCap * 10;
        saveCoins();
        saveUpgrades();
        saveEnergy();
        updateCoinDisplay();
        updateBars();
        renderUpgrades();
      });
    });
  }

  function renderCollections() {
    if (!collectionsList || typeof COLLECTIONS === 'undefined') return;
    var html = '';
    COLLECTIONS.forEach(function (col) {
      var done = completedCollections.indexOf(col.id) >= 0;
      var count = getCollectionCount(col.req);
      html += '<div class="collection-item' + (done ? ' collection-item--done' : '') + '">' +
        '<div><span class="collection-name">' + col.title + '</span><p class="collection-progress">' + (done ? 'Выполнено' : count + ' / ' + col.req.count) + '</p></div>' +
        (done ? '' : '<span class="collection-reward">+' + (col.rewardCoins || 0) + ' монет, +' + (col.rewardXp || 0) + ' XP' + (col.rewardSecretBoxKeys ? ', +' + col.rewardSecretBoxKeys + ' секр. бокс' : '') + '</span>') +
        '</div>';
    });
    collectionsList.innerHTML = html;
  }

  var _cardModalClosedAt = 0;
  function closeCardModal() {
    _revealModalClasses.forEach(function (c) { if (cardModal) cardModal.classList.remove(c); });
    cardModal.classList.add('hidden');
    _cardModalClosedAt = Date.now();
    if (_cardModalOnClose) {
      var cb = _cardModalOnClose;
      _cardModalOnClose = null;
      cb();
    }
  }
  function bindModal() {
    if (modalClose) modalClose.addEventListener('click', closeCardModal);
    var backdrop = cardModal && cardModal.querySelector('.modal-backdrop');
    if (backdrop) backdrop.addEventListener('click', closeCardModal);
  }

  // ─── Майнинг в фоне (каждые 5 ч) ─────────────────────────────────
  function getMiningReward() {
    var lvl = upgrades.miningLevel || 0;
    if ((upgrades.mining || 0) < 1) return 0;
    return MINING_BASE_REWARD + lvl * 40;
  }
  function canClaimMining() {
    if ((upgrades.mining || 0) < 1) return false;
    if (lastMiningClaimTime <= 0) return true;
    return (Date.now() - lastMiningClaimTime) >= MINING_INTERVAL_MS;
  }
  function getMiningTimeLeft() {
    if (lastMiningClaimTime <= 0) return 0;
    var elapsed = Date.now() - lastMiningClaimTime;
    if (elapsed >= MINING_INTERVAL_MS) return 0;
    return MINING_INTERVAL_MS - elapsed;
  }
  function renderMining() {
    if (!miningBlock) return;
    if ((upgrades.mining || 0) < 1) {
      miningBlock.innerHTML = '<p class="progress-block-desc">Купи прокачку «Майнинг в фоне» — забирай награду каждые 5 часов.</p>';
      return;
    }
    var baseReward = getMiningReward();
    var totalReward = baseReward + accumulatedMiningPassive;
    var canClaim = canClaimMining();
    var timeLeft = getMiningTimeLeft();
    var perSec = upgrades.miningPerSec || 0;
    function formatTime(ms) {
      var s = Math.floor(ms / 1000);
      var m = Math.floor(s / 60);
      var h = Math.floor(m / 60);
      m = m % 60;
      s = s % 60;
      return (h ? h + ' ч ' : '') + (m ? m + ' мин ' : '') + s + ' сек';
    }
    var passiveLine = perSec > 0 ? '<p class="mining-passive">Пассивно: <strong>' + perSec + '</strong> монет/сек → к награде</p>' : '';
    miningBlock.innerHTML =
      '<div class="mining-status">' +
        passiveLine +
        '<p class="mining-reward">Награда: <strong id="miningRewardAmount">' + totalReward + '</strong> монет (ур. майнинга ' + (upgrades.miningLevel || 0) + '/5)</p>' +
        (canClaim
          ? '<button type="button" class="upgrade-btn mining-claim" id="miningClaimBtn">Забрать награду</button>'
          : '<p class="mining-timer">Следующая награда через: <span id="miningNextAt">' + formatTime(timeLeft) + '</span></p>') +
      '</div>';
    var btn = $('#miningClaimBtn');
    if (btn) btn.addEventListener('click', function () {
      if (!canClaimMining()) return;
      var r = getMiningReward() + accumulatedMiningPassive;
      coins += r;
      accumulatedMiningPassive = 0;
      lastMiningClaimTime = Date.now();
      localStorage.setItem(STORAGE_KEYS.accumulatedMiningPassive, '0');
      saveCoins();
      saveMining();
      updateCoinDisplay();
      renderMining();
    });
    if (!canClaim && timeLeft > 0) {
      var nextEl = $('#miningNextAt');
      var iv = setInterval(function () {
        var t = getMiningTimeLeft();
        if (t <= 0) { clearInterval(iv); renderMining(); return; }
        if (nextEl) nextEl.textContent = formatTime(t);
      }, 1000);
    }
  }

  // ─── Секрет: 5 быстрых + 2 медленных тапа по логотипу (как в азбуке Морзе) ───
  function bindSecretCode() {
    if (!secretCodeSubmit || !secretCodeInput) return;
    secretCodeSubmit.addEventListener('click', function () {
      var code = (secretCodeInput.value || '').trim().toUpperCase();
      var reward = PROMO_CODES[code];
      if (reward) {
        if (reward.coins) { coins += reward.coins; saveCoins(); }
        if (reward.secretBoxKeys) { secretBoxKeys += reward.secretBoxKeys; saveSecretBoxKeys(); }
        updateCoinDisplay();
        secretCodeModal.classList.add('hidden');
        secretCodeInput.value = '';
      }
    });
    var closeSecret = $('#secretCodeClose');
    if (closeSecret) closeSecret.addEventListener('click', function () { secretCodeModal.classList.add('hidden'); });
    var secretBackdrop = secretCodeModal && secretCodeModal.querySelector('.modal-backdrop');
    if (secretBackdrop) secretBackdrop.addEventListener('click', function () { secretCodeModal.classList.add('hidden'); });
  }

  // ─── Паки (5 / 10 / 100 кейсов) ───────────────────────────────────
  function bindPacks() {
    var types = ['bronze', 'silver', 'gold', 'platinum'];
    [5, 10, 100].forEach(function (n) {
      types.forEach(function (t) {
        var el = document.querySelector('[data-pack="' + t + '-' + n + '"]');
        if (el && !el.dataset.bound) {
          el.dataset.bound = '1';
          el.addEventListener('click', function () { openPack(t, n); });
        }
      });
    });
  }

  // ─── Лидерборд (по кол-ву карточек) ────────────────────────────────
  function loadLeaderboard() {
    if (!leaderboardList) return;
    leaderboardList.innerHTML = '<p class="progress-block-desc">Загрузка...</p>';
    if (!API_BASE) {
      leaderboardList.innerHTML = '<p class="progress-block-desc">Открой игру через бота в Telegram.</p>';
      return;
    }
    fetch(API_BASE + '/api/leaderboard').then(function (r) { return r.json(); }).then(function (data) {
      if (!Array.isArray(data)) data = [];
      leaderboardList.innerHTML = data.length === 0
        ? '<p class="progress-block-desc">Пока никого нет.</p>'
        : '<ul class="leaderboard-ul">' + data.map(function (row, i) {
            return '<li><span class="leaderboard-rank">' + (i + 1) + '</span> ' + escapeHtml(row.username || 'Игрок') + ' — ' + (row.cardsCount || 0) + ' карт</li>';
          }).join('') + '</ul>';
    }).catch(function () {
      leaderboardList.innerHTML = '<p class="progress-block-desc">Не удалось загрузить.</p>';
    });
  }
  function syncLoad() {
    if (!API_BASE || !getInitData()) return;
    var initData = getInitData();
    fetch(API_BASE + '/api/load?initData=' + encodeURIComponent(initData))
      .then(function (r) { return r.json(); })
      .then(function (res) {
        if (!res || !res.ok) return;
        if (typeof syncLeaderboard === 'function') syncLeaderboard();
        if (!res.state) return;
        var s = res.state;
        if (typeof s.coins === 'number') { coins = s.coins; saveCoins(); }
        if (Array.isArray(s.cards)) { cards = s.cards.map(function (c) { return typeof c.count === 'number' ? c : Object.assign({}, c, { count: 1 }); }); saveCards(); }
        if (typeof s.energy === 'number') { energy = s.energy; saveEnergy(); }
        if (typeof s.energyMax === 'number') { energyMax = s.energyMax; }
        if (typeof s.level === 'number') { level = s.level; saveLevel(); }
        if (typeof s.xp === 'number') { xp = s.xp; saveLevel(); }
        if (Array.isArray(s.completedCollections)) { completedCollections = s.completedCollections; saveCompletedCollections(); }
        if (s.upgrades && typeof s.upgrades === 'object') { upgrades = s.upgrades; saveUpgrades(); energyMax = 20 + (upgrades.energyCap || 0) * 10; }
        if (typeof s.lastMiningClaimTime === 'number') { lastMiningClaimTime = s.lastMiningClaimTime; saveMining(); }
        if (typeof s.accumulatedMiningPassive === 'number') { accumulatedMiningPassive = s.accumulatedMiningPassive; saveMining(); }
        if (typeof s.secretBoxKeys === 'number') { secretBoxKeys = s.secretBoxKeys; saveSecretBoxKeys(); }
        updateCoinDisplay();
        updateBars();
        renderCards();
        renderUpgrades();
        renderCollections();
        if (typeof renderMining === 'function') renderMining();
      })
      .catch(function () {});
  }
  function syncLeaderboard() {
    if (!API_BASE || !getInitData()) return;
    var user = (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe && window.Telegram.WebApp.initDataUnsafe.user);
    var username = (user && (user.username || user.first_name)) || 'Игрок';
    fetch(API_BASE + '/api/leaderboard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ initData: getInitData(), cardsCount: getTotalCards(), username: username }),
    }).catch(function () {});
  }
  var syncSaveTimer = null;
  function syncSave() {
    if (!API_BASE || !getInitData()) return;
    if (syncSaveTimer) clearTimeout(syncSaveTimer);
    syncSaveTimer = setTimeout(function () {
      var payload = {
        initData: getInitData(),
        state: {
          coins: coins,
          cards: cards,
          energy: energy,
          energyMax: energyMax,
          level: level,
          xp: xp,
          completedCollections: completedCollections,
          upgrades: upgrades,
          lastMiningClaimTime: lastMiningClaimTime,
          accumulatedMiningPassive: accumulatedMiningPassive,
          secretBoxKeys: secretBoxKeys,
        },
      };
      fetch(API_BASE + '/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).catch(function () {});
      syncLeaderboard();
    }, 500);
  }
  function saveCoins() {
    localStorage.setItem(STORAGE_KEYS.coins, String(coins));
    syncSave();
  }
  function saveCards() {
    localStorage.setItem(STORAGE_KEYS.cards, JSON.stringify(cards));
    syncSave();
  }
  function saveLevel() {
    localStorage.setItem(STORAGE_KEYS.level, String(level));
    localStorage.setItem(STORAGE_KEYS.xp, String(xp));
    syncSave();
  }
  function saveCompletedCollections() {
    localStorage.setItem(STORAGE_KEYS.completedCollections, JSON.stringify(completedCollections));
    syncSave();
  }
  function saveUpgrades() {
    localStorage.setItem(STORAGE_KEYS.upgrades, JSON.stringify(upgrades));
    syncSave();
  }
  function saveMining() {
    localStorage.setItem(STORAGE_KEYS.lastMiningClaimTime, String(lastMiningClaimTime));
    localStorage.setItem(STORAGE_KEYS.accumulatedMiningPassive, String(accumulatedMiningPassive));
    syncSave();
  }
  function saveSecretBoxKeys() {
    localStorage.setItem(STORAGE_KEYS.secretBoxKeys, String(secretBoxKeys));
    syncSave();
  }
  function saveEnergy() {
    localStorage.setItem(STORAGE_KEYS.energy, String(energy));
    localStorage.setItem(STORAGE_KEYS.energyMax, String(energyMax));
    localStorage.setItem(STORAGE_KEYS.lastEnergyTime, String(Date.now()));
    syncSave();
  }

})();
