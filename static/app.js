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
    boxesOpened: 'zov_boxesOpened',
    prismaticPromo: 'zov_prismaticPromo',
  };
  const BOX_COSTS = { bronze: 50, silver: 200, gold: 500, platinum: 1200, secret: null };
  var PROMO_CODES = { PROMO: { coins: 10000, secretBoxKeys: 1 }, BALANCE: { coins: 100000 }, PRISMATIC: { prismaticNext: 1 } };
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
  let boxesOpened = parseInt(localStorage.getItem(STORAGE_KEYS.boxesOpened) || '0', 10);
  let prismaticPromo = parseInt(localStorage.getItem(STORAGE_KEYS.prismaticPromo) || '0', 10);
  energyMax = 20 + (upgrades.energyCap || 0) * 10;
  if (!Array.isArray(cards)) cards = [];
  cards = cards.map(function (c) { return typeof c.count === 'number' ? c : Object.assign({}, c, { count: 1 }); });

  const UPGRADE_DEFS = [
    { id: 'energyCap', name: 'Запас энергии', desc: '+10 к макс. энергии', cost: 200, maxLevel: 10, getValue: () => (upgrades.energyCap || 0) * 10, requiredLevelPerTier: [0, 1, 3, 5, 8, 12, 16, 20, 25, 30, 35] },
    { id: 'regen', name: 'Восстановление', desc: '+0.5 энергии/сек', cost: 150, maxLevel: 8, getValue: () => (upgrades.regen || 0) * 0.5, requiredLevelPerTier: [0, 1, 4, 7, 11, 15, 20, 26, 32] },
    { id: 'coinPerTap', name: 'Монет за тап', desc: '+1 монета за тап', cost: 300, maxLevel: 10, getValue: () => upgrades.coinPerTap || 0, requiredLevelPerTier: [0, 1, 3, 6, 10, 15, 20, 26, 32, 38, 45] },
    { id: 'mining', name: 'Майнинг в фоне', desc: 'Забирай награду каждые 5 ч', cost: 600, maxLevel: 1, getValue: () => (upgrades.mining || 0) ? 1 : 0, requiredLevelPerTier: [0, 5] },
    { id: 'miningLevel', name: 'Уровень майнинга', desc: '+награда за сбор', cost: 400, maxLevel: 10, getValue: () => upgrades.miningLevel || 0, requiredLevelPerTier: [0, 5, 8, 12, 16, 20, 25, 30, 36, 42, 50] },
    { id: 'miningPerSec', name: 'Монет в секунду', desc: '+1 монет/сек пассивно', cost: 500, maxLevel: 10, getValue: () => upgrades.miningPerSec || 0, requiredLevelPerTier: [0, 6, 10, 14, 18, 22, 28, 34, 40, 46, 55] },
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
  var _touchStart = { x: 0, y: 0 };
  var _didScroll = false;
  document.addEventListener('touchstart', function(e) {
    if (e.touches.length) { _touchStart.x = e.touches[0].clientX; _touchStart.y = e.touches[0].clientY; _didScroll = false; }
  }, { passive: true });
  document.addEventListener('touchmove', function(e) {
    if (e.touches.length && (Math.abs(e.touches[0].clientX - _touchStart.x) > 10 || Math.abs(e.touches[0].clientY - _touchStart.y) > 10)) _didScroll = true;
  }, { passive: true });
  document.addEventListener('pointerdown', function(e) {
    if (e.pointerType === 'touch') return;
    _touchStart.x = e.clientX; _touchStart.y = e.clientY; _didScroll = false;
  }, { passive: true });
  document.addEventListener('pointermove', function(e) {
    if (e.pointerType === 'touch') return;
    if (Math.abs(e.clientX - _touchStart.x) > 10 || Math.abs(e.clientY - _touchStart.y) > 10) _didScroll = true;
  }, { passive: true });
  function handleAppClick(e) {
    if (!app || app.classList.contains('hidden')) return;
    var t = e.target;
    if (t.closest('.header-brand')) return;
    if (e.type === 'touchstart' && (t.closest('.nft-card') || t.closest('.loot-box') || t.closest('[data-pack]') || t.closest('.nav-btn'))) return;
    if (t.closest('.nft-card') && !t.closest('#packRevealModal')) {
      if (_didScroll) return;
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
    if (t.closest('#referralCopyBtn')) {
      if (_didScroll) return;
      if (t.closest('#referralCopyBtn') === lastActionEl && Date.now() - lastActionTime < 500) return;
      lastActionEl = t.closest('#referralCopyBtn');
      lastActionTime = Date.now();
      if (e.type === 'touchstart') e.preventDefault();
      if (typeof handleReferralCopy === 'function') handleReferralCopy();
      return;
    }
    if (t.closest('.nav-btn')) {
      if (_didScroll) return;
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
      if (_didScroll) return;
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
      if (_didScroll) return;
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
          if (e.type === 'touchstart') {
            window._packRevealTouchTarget = t.closest('.pack-flip-card') ? null : t;
          } else if (!t.closest('.pack-flip-card') && e.type === 'click' && typeof _packRevealOnTap === 'function') {
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
        if (reward.prismaticNext) { prismaticPromo += reward.prismaticNext; savePrismaticPromo(); }
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
    if (tab === 'profile') {
      if (typeof loadReferralData === 'function') loadReferralData();
      if (typeof initTonConnect === 'function') initTonConnect();
    }
    if (tab === 'boxes' && typeof loadReferralData === 'function') loadReferralData();
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
      document.addEventListener('touchend', function (e) {
        var pm = document.getElementById('packRevealModal');
        if (!pm || pm.classList.contains('hidden')) { window._packRevealTouchTarget = null; return; }
        var startTarget = window._packRevealTouchTarget;
        window._packRevealTouchTarget = null;
        if (!startTarget || startTarget.closest('.pack-flip-card')) return;
        if (_didScroll) return;
        if (typeof _packRevealOnTap === 'function') {
          e.preventDefault();
          e.stopPropagation();
          _packRevealOnTap();
        }
      }, { capture: true, passive: false });
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
      if (typeof window.ZOV_I18N !== 'undefined' && window.ZOV_I18N.applyTranslations) {
        window.ZOV_I18N.applyTranslations();
        var langBtns = app.querySelectorAll('.profile-lang-btn');
        var curLang = window.ZOV_I18N.getLang ? window.ZOV_I18N.getLang() : 'ru';
        langBtns.forEach(function (b) {
          b.classList.toggle('active', b.dataset.lang === curLang);
          if (!b._zovLangBound) {
            b._zovLangBound = true;
            b.addEventListener('click', function () {
              var l = b.dataset.lang;
              if (l && window.ZOV_I18N.setLanguage) {
                window.ZOV_I18N.setLanguage(l);
                langBtns.forEach(function (x) { x.classList.toggle('active', x.dataset.lang === l); });
              }
            });
          }
        });
        window._zovOnLangChange = function () {
          renderCards();
          renderCollections();
          renderUpgrades();
          if (typeof renderMining === 'function') renderMining();
          if (typeof updatePackButtons === 'function') updatePackButtons();
          var panel = app.querySelector('[data-panel].active');
          if (panel && panel.dataset.panel === 'leaderboard' && typeof loadLeaderboard === 'function') loadLeaderboard();
        };
      }
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
      if (typeof syncLeaderboard === 'function') {
        setTimeout(syncLeaderboard, 500);
        setTimeout(syncLeaderboard, 2500);
      }
      setTimeout(function () {
        if (typeof registerReferralIfNeeded === 'function') registerReferralIfNeeded();
        if (typeof claimDailyIfNeeded === 'function') claimDailyIfNeeded();
        if (typeof loadReferralData === 'function') loadReferralData();
      }, 800);
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
  function savePrismaticPromo() {
    localStorage.setItem(STORAGE_KEYS.prismaticPromo, String(prismaticPromo));
    if (typeof syncSave === 'function') syncSave();
  }
  function saveBoxesOpened() {
    localStorage.setItem(STORAGE_KEYS.boxesOpened, String(boxesOpened));
    syncSave();
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
    renderCollections();
    updateBoxButtons();
    updatePackButtons();
    if (typeof renderMining === 'function') renderMining();
  }
  function updateBoxButtons() {
    ['bronze', 'silver', 'gold', 'platinum'].forEach(function (type) {
      var btn = $('#box' + type.charAt(0).toUpperCase() + type.slice(1));
      if (btn) btn.disabled = coins < (BOX_COSTS[type] || 0);
    });
    updateSecretBoxDisplay();
  }
  function updateSecretBoxDisplay() {
    var secretBtn = $('#boxSecret');
    var priceEl = $('#boxSecretPrice');
    if (!secretBtn) return;
    var refCount = window._referralCount || 0;
    var isActive = secretBoxKeys >= 1 || refCount >= 1;
    var t = (typeof window !== 'undefined' && window.t) ? window.t : function (k) { return k; };
    if (priceEl) priceEl.textContent = isActive ? (t('boxes.secretGet') || 'Получить') : '???';
    secretBtn.disabled = !isActive || secretBoxKeys < 1;
    secretBtn.classList.toggle('loot-box--unlocked', isActive);
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
        var pcs = (typeof window !== 'undefined' && window.t) ? window.t('boxes.pcs') : 'шт';
        el.innerHTML = '<span class="pack-btn-count">' + n + ' ' + pcs + '</span><strong>' + total.toLocaleString('ru-RU') + '</strong><span class="pack-discount">−' + discountPct + '%</span>';
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
    renderCollections();
  }

  // ─── Boxes ───────────────────────────────────────────────────────
  var _openBoxLock = false;
  var TON_BOX_TYPES = ['ton_basic', 'ton_premium', 'ton_elite'];
  function openBox(boxType) {
    if (_openBoxLock) return;
    _openBoxLock = true;
    setTimeout(function () { _openBoxLock = false; }, 800);
    var cost = BOX_COSTS[boxType];
    var useSecretKey = boxType === 'secret' && secretBoxKeys > 0;
    var isTonBox = TON_BOX_TYPES.indexOf(boxType) >= 0;
    if (!useSecretKey && !isTonBox && (cost == null || coins < cost)) return;
    if (useSecretKey) {
      secretBoxKeys--;
      saveSecretBoxKeys();
    } else if (!isTonBox) {
      coins -= cost;
      saveCoins();
    }
    updateCoinDisplay();

    function finishWithCard(loc, r) {
      var usePrismatic = prismaticPromo > 0;
      if (usePrismatic) { prismaticPromo--; savePrismaticPromo(); }
      var cardData = {
        name: loc.name,
        country: loc.country,
        type: loc.type || 'city',
        rarity: usePrismatic ? 'prismatic' : (r || (typeof rollRandomRarity === 'function' ? rollRandomRarity(boxType) : 'common')),
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
    boxesOpened += 1;
    saveBoxesOpened();
    if (fromList && fromList.name) {
      finishWithCard({ name: fromList.name, country: fromList.country, type: fromList.type }, fromList.rarity);
    } else {
      var fallback = pickRandomLocation(boxType);
      finishWithCard({ name: fallback.name, country: fallback.country, type: fallback.type }, fallback.rarity);
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
    ['ton_basic', 'ton_premium', 'ton_elite'].forEach(function (type) {
      var id = 'boxTon' + (type === 'ton_basic' ? 'Basic' : type === 'ton_premium' ? 'Premium' : 'Elite');
      var btn = document.getElementById(id);
      if (!btn) return;
      btn.addEventListener('click', function () {
        openBox(type);
      });
    });
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
      boxesOpened += list.length;
      saveBoxesOpened();
      for (var i = 0; i < list.length; i++) {
        var loc = list[i];
        var usePrismatic = prismaticPromo > 0 && i === 0;
        if (usePrismatic) { prismaticPromo--; savePrismaticPromo(); }
        var r = usePrismatic ? 'prismatic' : (typeof rollRandomRarity === 'function' ? rollRandomRarity(boxType) : 'common');
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

  function makePackCardEl(card, isMany, noFlip, idx) {
    var w = isMany ? 150 : 200;
    var h = isMany ? 105 : 140;
    var imgUrl = typeof getLocationImageUrl === 'function' ? getLocationImageUrl(card, w, h) : '';
    var placeholderUri = typeof getLocationPlaceholderDataUri === 'function' ? getLocationPlaceholderDataUri(card.name) : '';
    var div = document.createElement('div');
    div.className = 'pack-flip-card' + (noFlip ? ' pack-flip-card--plain' : '');
    div._packCardIdx = idx;
    div.innerHTML =
      '<div class="pack-flip-inner">' +
        (noFlip ? '' : '<div class="pack-flip-back"></div>') +
        '<div class="pack-flip-front nft-card nft-card--' + (card.rarity || 'common') + '">' +
          '<div class="nft-card-image-wrap"><img class="nft-card-image" src="' + imgUrl + '" alt="" loading="lazy" data-fallback="' + (placeholderUri || '') + '" onerror="if(this.dataset.fallback){this.onerror=null;this.src=this.dataset.fallback}" /><div class="nft-card-overlay"></div></div>' +
          '<div class="nft-card-inner">' +
            '<div class="nft-card-type">' + escapeHtml(typeof getTypeLabel === 'function' ? getTypeLabel(card.type) : (card.typeLabel || 'ЛОКАЦИЯ')) + '</div>' +
            '<div class="nft-card-name">' + escapeHtml(typeof getLocationDisplayName === 'function' ? getLocationDisplayName(card.name) : card.name) + '</div>' +
            '<div class="nft-card-country">' + escapeHtml(typeof getCountryDisplayName === 'function' ? getCountryDisplayName(card.country) : card.country) + '</div>' +
            '<div class="nft-card-rarity rarity-' + (card.rarity || 'common') + '">' + rarityLabel(card.rarity) + '</div>' +
          '</div>' +
        '</div>' +
      '</div>';
    (function () {
      var touchY = 0;
      div.addEventListener('touchstart', function (e) { touchY = e.touches[0].clientY; }, { passive: true });
      div.addEventListener('touchend', function (e) {
        if (e.changedTouches[0] && Math.abs(e.changedTouches[0].clientY - touchY) < 15) {
          e.preventDefault();
          e.stopPropagation();
          window._cardModalOpenedFromPackAt = Date.now();
          if (typeof showCardModal === 'function') showCardModal(card, false, null, true);
        }
      }, { passive: false });
    })();
    div.addEventListener('click', function (e) {
      e.stopPropagation();
      e.preventDefault();
      window._cardModalOpenedFromPackAt = Date.now();
      if (typeof showCardModal === 'function') showCardModal(card, false, null, true);
    });
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
    window._packRevealCardMap = cardList;
    if (cardList.length >= 80) {
      modal.classList.remove('hidden');
      var loadingTextEl = loadingEl ? loadingEl.querySelector('.pack-reveal-loading-text') : null;
      var origLoadingText = loadingTextEl ? loadingTextEl.textContent : '';
      if (loadingEl) loadingEl.classList.remove('hidden');
      var batchSize = 12;
      var rendered = 0;
      function renderBatch() {
        var end = Math.min(rendered + batchSize, cardList.length);
        for (var i = rendered; i < end; i++) {
          container.appendChild(makePackCardEl(cardList[i], true, false, i));
        }
        rendered = end;
        if (loadingTextEl) loadingTextEl.textContent = rendered + ' / ' + cardList.length;
        if (rendered < cardList.length) {
          requestAnimationFrame(renderBatch);
        } else {
          if (loadingTextEl) loadingTextEl.textContent = origLoadingText;
          if (loadingEl) loadingEl.classList.add('hidden');
          var flipCards = container.querySelectorAll('.pack-flip-card');
          var delay = 20;
          flipCards.forEach(function (el, i) {
            var t = setTimeout(function () {
              el.classList.add('flipped');
              if (cardList.length > 6 && container) el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
            }, 100 + i * delay);
            _packRevealFlipTimeouts.push(t);
          });
          var totalTime = 100 + (flipCards.length - 1) * delay + 100;
          _packRevealFlipTimeouts.push(setTimeout(function () { _packRevealState = 'ready'; }, totalTime));
        }
      }
      requestAnimationFrame(renderBatch);
    } else {
      cardList.forEach(function (card, idx) {
        container.appendChild(makePackCardEl(card, isMany, noFlip, idx));
      });
    }
    container.scrollTop = 0;
    modal.classList.remove('hidden');
    _packRevealState = cardList.length >= 80 ? 'ready' : 'opening';
    var cards = container.querySelectorAll('.pack-flip-card');
    if (!noFlip && cards.length > 0) {
      var delay = cardList.length >= 50 ? 35 : cardList.length > 10 ? 50 : cardList.length > 6 ? 100 : 300;
      cards.forEach(function (el, i) {
        var t = setTimeout(function () {
          el.classList.add('flipped');
          if (cardList.length > 6 && container) {
            el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
          }
        }, 100 + i * delay);
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
      var emptyText = (typeof window !== 'undefined' && window.t) ? window.t('cards.empty') : 'Пока нет карточек.\nОткрой боксы!';
      cardsGrid.innerHTML = '<div class="cards-empty"><span class="cards-empty-icon">&#9733;</span>' + emptyText.replace(/\n/g, '<br>') + '</div>';
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
                '<div class="nft-card-type">' + escapeHtml(typeof getTypeLabel === 'function' ? getTypeLabel(c.type) : (c.typeLabel || 'ЛОКАЦИЯ')) + '</div>' +
                '<div class="nft-card-name">' + escapeHtml(typeof getLocationDisplayName === 'function' ? getLocationDisplayName(c.name) : c.name) + '</div>' +
                '<div class="nft-card-country">' + escapeHtml(typeof getCountryDisplayName === 'function' ? getCountryDisplayName(c.country) : c.country) + '</div>' +
                '<div class="nft-card-rarity rarity-' + (c.rarity || 'common') + '">' + rarityLabel(c.rarity) + '</div>' +
              '</div>' +
            '</div>'
          );
        }
      )
      .join('');

    /* клики по карточкам обрабатывает handleAppClick */
  }

  function escapeHtml(s) {
    const div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  function rarityLabel(r) {
    if (typeof window !== 'undefined' && window.t) {
      var key = (r || 'common').toLowerCase();
      return window.t(key);
    }
    var labels = { common: 'Обычная', rare: 'Редкая', epic: 'Эпическая', legendary: 'Легенда', inferno: 'Инферно', collector: 'Коллекционная', exclusive: 'Эксклюзив', prismatic: 'Призматическая' };
    return labels[r] || 'Обычная';
  }

  // ─── Modal (разные анимации и фоны по редкости) ───
  var _cardModalOnClose = null;
  var _revealModalClasses = ['modal--reveal-common', 'modal--reveal-rare', 'modal--reveal-epic', 'modal--reveal-legendary', 'modal--reveal-inferno', 'modal--reveal-collector', 'modal--reveal-exclusive', 'modal--reveal-prismatic'];
  function getRevealLabel(r) {
    if (!r || r === 'common') return '';
    var key = 'reveal.' + r;
    return (typeof window !== 'undefined' && window.t) ? window.t(key) : ({ rare: 'Редкая!', epic: 'ЭПИК!', legendary: 'ЛЕГЕНДА!', inferno: 'ИНФЕРНО!', collector: 'КОЛЛЕКЦИОННАЯ!', exclusive: 'ЭКСКЛЮЗИВ!', prismatic: 'ПРИЗМАТИЧЕСКАЯ!' }[r] || '');
  }
  var _revealAnimByRarity = { common: 'reveal-drop', rare: 'reveal-scale', epic: 'reveal-flip', legendary: 'reveal-celebration', inferno: 'reveal-celebration', collector: 'reveal-celebration', exclusive: 'reveal-celebration', prismatic: 'reveal-prismatic' };
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
  function showCardModal(card, isReveal, onClosed, fromPack) {
    _cardModalOnClose = onClosed || null;
    if (cardModal) cardModal.classList.toggle('modal--above-pack', !!fromPack);
    _revealModalClasses.forEach(function (c) { if (cardModal) cardModal.classList.remove(c); });
    var r = card.rarity || 'common';
    var flashEl = document.getElementById('modalRevealFlash');
    var labelEl = document.getElementById('modalRevealLabel');
    if (flashEl) flashEl.className = 'modal-reveal-flash';
    if (labelEl) labelEl.textContent = '';
    if (isReveal) {
      cardModal.classList.add('modal--reveal-' + r);
      if (flashEl) flashEl.className = 'modal-reveal-flash modal-reveal-flash--' + r;
      var labelText = getRevealLabel(r) || '';
      if (labelText && labelEl) { labelEl.textContent = labelText; labelEl.className = 'modal-reveal-label modal-reveal-label--' + r; }
      if (r === 'legendary' || r === 'inferno' || r === 'collector' || r === 'exclusive' || r === 'prismatic') {
        var particleColors = { legendary: 'rgba(255,215,100,0.9)', inferno: 'rgba(255,120,50,0.9)', collector: 'rgba(100,255,255,0.9)', exclusive: 'rgba(255,255,150,0.9)', prismatic: 'rgba(255,100,255,0.95)' };
        var count = r === 'prismatic' ? 48 : (r === 'legendary' || r === 'exclusive' ? 24 : 16);
        spawnRevealParticles(particleColors[r] || 'rgba(255,255,255,0.8)', count);
      }
    }
    modalCardType.textContent = typeof getTypeLabel === 'function' ? getTypeLabel(card.type) : (card.typeLabel || 'ЛОКАЦИЯ');
    modalCardName.textContent = typeof getLocationDisplayName === 'function' ? getLocationDisplayName(card.name) : card.name;
    modalCardCountry.textContent = typeof getCountryDisplayName === 'function' ? getCountryDisplayName(card.country) : card.country;
    modalCardRarity.textContent = rarityLabel(card.rarity);
    modalCardRarity.className = 'nft-card-rarity rarity-' + r;
    var modalCard = cardModal.querySelector('.modal .nft-card');
    var allRarities = ['common', 'rare', 'epic', 'legendary', 'inferno', 'collector', 'exclusive', 'prismatic'];
    if (modalCard) {
      allRarities.forEach(function (r2) { modalCard.classList.remove('nft-card--' + r2); });
      modalCard.classList.add('nft-card--' + r);
    }
    if (modalCardWrap) {
      modalCardWrap.classList.remove('reveal-flip', 'reveal-scale', 'reveal-glow', 'reveal-drop', 'reveal-celebration', 'reveal-prismatic', 'modal-card-wrap--instant');
      if (isReveal) {
        var anim = _revealAnimByRarity[r] || 'reveal-drop';
        modalCardWrap.classList.add(anim);
      } else {
        modalCardWrap.classList.add('modal-card-wrap--instant');
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
      var animDuration = anim === 'reveal-prismatic' ? 2000 : (anim === 'reveal-celebration' ? 1200 : anim === 'reveal-flip' ? 800 : 700);
      setTimeout(function () { modalCardWrap.classList.remove(anim); }, animDuration);
    }
  }

  function normalizePlace(s) { return (s || '').trim().toLowerCase().replace(/\s+/g, ' '); }
  function getCollectionCount(req) {
    if (req.type === 'total') return getTotalCards();
    if (req.type === 'village') return cards.filter(function (c) { return (c.type || '').toLowerCase() === 'village'; }).reduce(function (s, c) { return s + (c.count || 1); }, 0);
    if (req.type === 'city') return cards.filter(function (c) { return (c.type || '').toLowerCase() === 'city'; }).reduce(function (s, c) { return s + (c.count || 1); }, 0);
    if (req.type === 'legendary') return cards.filter(function (c) { return c.rarity === 'legendary'; }).reduce(function (s, c) { return s + (c.count || 1); }, 0);
    if (req.type === 'epic') return cards.filter(function (c) { return c.rarity === 'epic'; }).reduce(function (s, c) { return s + (c.count || 1); }, 0);
    if (req.type === 'rare') return cards.filter(function (c) { return c.rarity === 'rare'; }).reduce(function (s, c) { return s + (c.count || 1); }, 0);
    if (req.type === 'town') return cards.filter(function (c) { return (c.type || '').toLowerCase() === 'town'; }).reduce(function (s, c) { return s + (c.count || 1); }, 0);
    if (req.type === 'boxesOpened') return typeof boxesOpened !== 'undefined' ? boxesOpened : 0;
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
    var t = (typeof window !== 'undefined' && window.t) ? window.t : function (k) { return k; };
    var html = '';
    UPGRADE_DEFS.forEach(function (u) {
      var lvl = upgrades[u.id] || 0;
      var isMax = lvl >= u.maxLevel;
      var cost = isMax ? 0 : u.cost * (lvl + 1);
      var requiredLevel = (u.requiredLevelPerTier && u.requiredLevelPerTier[lvl + 1]) || 0;
      var miningOk = (u.id !== 'miningLevel' && u.id !== 'miningPerSec') || (upgrades.mining || 0) >= 1;
      var canBuy = !isMax && coins >= cost && level >= requiredLevel && miningOk;
      var levelHint = requiredLevel > level ? ' (' + t('progress.needLvl') + ' ' + requiredLevel + ')' : '';
      var name = t('upgrade.' + u.id) || u.name;
      var desc = t('upgrade.' + u.id + 'Desc') || u.desc;
      html += '<div class="upgrade-item' + (isMax ? ' upgrade-item--max' : '') + '">' +
        '<div><span class="upgrade-name">' + name + '</span><p class="upgrade-desc">' + desc + ' · ' + t('progress.level') + lvl + '/' + u.maxLevel + levelHint + '</p></div>' +
        '<div>' +
          (isMax ? '<span class="upgrade-cost">' + t('progress.max') + '</span>' : '<span class="upgrade-cost">' + cost + ' ' + t('progress.coins') + '</span><button type="button" class="upgrade-btn" data-upgrade="' + u.id + '" ' + (canBuy ? '' : 'disabled') + '>' + t('progress.buy') + '</button>') +
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
    var t = (typeof window !== 'undefined' && window.t) ? window.t : function (k) { return k; };
    var html = '';
    COLLECTIONS.forEach(function (col) {
      var done = completedCollections.indexOf(col.id) >= 0;
      var count = getCollectionCount(col.req);
      var title = t('collection.' + col.id) || col.title;
      html += '<div class="collection-item' + (done ? ' collection-item--done' : '') + '">' +
        '<div><span class="collection-name">' + title + '</span><p class="collection-progress">' + (done ? t('progress.done') : count + ' / ' + col.req.count) + '</p></div>' +
        (done ? '' : '<span class="collection-reward">+' + (col.rewardCoins || 0) + ' ' + t('progress.rewardCoins') + ', +' + (col.rewardXp || 0) + ' ' + t('progress.rewardXp') + (col.rewardSecretBoxKeys ? ', +' + col.rewardSecretBoxKeys + ' ' + t('progress.secretBox') : '') + '</span>') +
        '</div>';
    });
    collectionsList.innerHTML = html;
  }

  var _cardModalClosedAt = 0;
  function closeCardModal() {
    if (Date.now() - (window._cardModalOpenedFromPackAt || 0) < 450) return;
    _revealModalClasses.forEach(function (c) { if (cardModal) cardModal.classList.remove(c); });
    if (cardModal) cardModal.classList.remove('modal--above-pack');
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
    var t = (typeof window !== 'undefined' && window.t) ? window.t : function (k) { return k; };
    if ((upgrades.mining || 0) < 1) {
      miningBlock.innerHTML = '<p class="progress-block-desc">' + t('mining.buy') + '</p>';
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
      return (h ? h + ' ' + t('mining.h') + ' ' : '') + (m ? m + ' ' + t('mining.min') + ' ' : '') + s + ' ' + t('mining.sec');
    }
    var passiveLine = perSec > 0 ? '<p class="mining-passive">' + t('mining.passive') + ' <strong>' + perSec + '</strong> ' + t('mining.perSec') + ' →</p>' : '';
    miningBlock.innerHTML =
      '<div class="mining-status">' +
        passiveLine +
        '<p class="mining-reward">' + t('mining.reward') + ' <strong id="miningRewardAmount">' + totalReward + '</strong> ' + t('progress.coins') + ' (' + t('mining.level') + ' ' + (upgrades.miningLevel || 0) + '/5)</p>' +
        (canClaim
          ? '<button type="button" class="upgrade-btn mining-claim" id="miningClaimBtn">' + t('mining.claim') + '</button>'
          : '<p class="mining-timer">' + t('mining.next') + ' <span id="miningNextAt">' + formatTime(timeLeft) + '</span></p>') +
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
        if (reward.prismaticNext) { prismaticPromo += reward.prismaticNext; savePrismaticPromo(); }
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
    var t = (typeof window !== 'undefined' && window.t) ? window.t : function (k) { return k; };
    leaderboardList.innerHTML = '<p class="progress-block-desc">' + t('lb.loading') + '</p>';
    var base = API_BASE || (typeof location !== 'undefined' && location.origin ? location.origin.replace(/\/$/, '') : '');
    if (!base) {
      leaderboardList.innerHTML = '<p class="progress-block-desc">' + t('lb.needBot') + '</p>';
      return;
    }
    if (typeof syncLeaderboard === 'function') syncLeaderboard();
    setTimeout(function () {
    fetch(base + '/api/leaderboard', { method: 'GET' })
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function (data) {
        if (!Array.isArray(data)) data = [];
        var meEl = document.getElementById('leaderboardMe');
        var currentUserId = (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe && window.Telegram.WebApp.initDataUnsafe.user) ? String(window.Telegram.WebApp.initDataUnsafe.user.id) : '';
        var myPos = -1;
        data.forEach(function (row, i) { if (String(row.user_id) === currentUserId) myPos = i + 1; });
        var rowH = 56;
        var availH = (typeof window !== 'undefined' && window.innerHeight) ? window.innerHeight - 220 : 400;
        var visibleRows = Math.max(6, Math.min(50, Math.floor(availH / rowH)));
        var topN = (myPos > 0 && myPos > visibleRows) ? visibleRows : 50;
        var showMe = myPos > 0 && myPos > visibleRows;
        if (meEl) {
          meEl.classList.toggle('hidden', !showMe);
          if (showMe) {
            var myRow = data.find(function (r) { return String(r.user_id) === currentUserId; });
            var xpVal = (myRow && myRow.xp != null) ? myRow.xp : '—';
            var lvlVal = (myRow && myRow.level != null) ? myRow.level : '—';
            meEl.innerHTML = '<div class="leaderboard-me-inner"><span class="leaderboard-rank">' + myPos + '</span><span class="lb-col lb-name">' + escapeHtml((myRow && myRow.username) || t('lb.you')) + '</span><span class="lb-col lb-xp">' + xpVal + ' / ' + lvlVal + '</span><span class="lb-col lb-cards">' + ((myRow && myRow.cardsCount) || 0) + '</span><span class="lb-col lb-cost">—</span></div>';
          }
        }
        leaderboardList.innerHTML = data.length === 0
          ? '<p class="progress-block-desc">' + t('lb.empty') + '</p>'
          : '<div class="leaderboard-header"><span class="lb-rank">№</span><span class="lb-col lb-name">' + t('lb.headerName') + '</span><span class="lb-col lb-xp">' + t('lb.headerXp') + '</span><span class="lb-col lb-cards">' + t('lb.headerCards') + '</span><span class="lb-col lb-cost">$</span></div>' +
            '<ul class="leaderboard-ul">' + data.slice(0, topN).map(function (row, i) {
              var xpVal = row.xp != null ? row.xp : '—';
              var lvlVal = row.level != null ? row.level : '—';
              var isMe = String(row.user_id) === currentUserId;
              return '<li class="' + (isMe ? 'leaderboard-me-row' : '') + '"><span class="leaderboard-rank">' + (i + 1) + '</span><span class="lb-col lb-name">' + escapeHtml(row.username || t('lb.player')) + '</span><span class="lb-col lb-xp">' + xpVal + ' / ' + lvlVal + '</span><span class="lb-col lb-cards">' + (row.cardsCount || 0) + '</span><span class="lb-col lb-cost">—</span></li>';
            }).join('') + '</ul>';
      })
      .catch(function () {
        var t2 = (typeof window !== 'undefined' && window.t) ? window.t : function (k) { return k; };
        leaderboardList.innerHTML = '<p class="progress-block-desc">' + t2('lb.error') + '</p>';
      });
    }, 400);
  }
  function claimDailyIfNeeded() {
    var base = API_BASE || (location.origin ? location.origin.replace(/\/$/, '') : '');
    if (!base) return;
    try {
      var params = new URLSearchParams(location.search || '');
      var startParam = (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.startParam) || '';
      var hasDaily = params.get('daily') === '1' || startParam === 'daily' || (location.hash || '').indexOf('daily') >= 0;
      if (!hasDaily) return;
      var initData = getInitData();
      fetch(base + '/api/daily/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initData: initData }),
      }).then(function (r) { return r.json(); }).then(function (res) {
        if (!res || !res.ok) return;
        if (res.already) {
          var t = (typeof window !== 'undefined' && window.t) ? window.t : function (k) { return k; };
          if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.showAlert) {
            window.Telegram.WebApp.showAlert(t('daily.already') || 'Сегодня уже забрал. Приходи завтра!');
          }
          return;
        }
        if (res.claimed && res.reward) {
          var modal = document.getElementById('dailyRewardModal');
          var textEl = document.getElementById('dailyRewardText');
          var closeBtn = document.getElementById('dailyRewardClose');
          if (textEl) textEl.textContent = res.reward.label || '';
          if (modal) modal.classList.remove('hidden');
          if (typeof syncLoad === 'function') syncLoad();
          if (closeBtn && !closeBtn._zovDailyBound) {
            closeBtn._zovDailyBound = true;
            closeBtn.addEventListener('click', function () {
              if (modal) modal.classList.add('hidden');
            });
          }
          var backdrop = modal && modal.querySelector('.modal-backdrop');
          if (backdrop && !backdrop._zovDailyBound) {
            backdrop._zovDailyBound = true;
            backdrop.addEventListener('click', function () {
              if (modal) modal.classList.add('hidden');
            });
          }
        }
      }).catch(function () {});
    } catch (e) {}
  }
  function registerReferralIfNeeded() {
    var base = API_BASE || (location.origin ? location.origin.replace(/\/$/, '') : '');
    if (!base) return;
    try {
      var params = new URLSearchParams(location.search);
      var ref = params.get('ref');
      if (!ref) return;
      var initData = getInitData();
      fetch(base + '/api/referral/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ referrer_id: ref, initData: initData }),
      }).then(function (r) { return r.json();       }).then(function (res) {
        if (res && res.ok && res.credited) {
          if (typeof syncLoad === 'function') syncLoad();
        }
      }).catch(function () {});
    } catch (e) {}
  }
  function doReferralCopyShare(link) {
    var btn = document.getElementById('referralCopyBtn');
    var t = (typeof window !== 'undefined' && window.t) ? window.t : function (k) { return k; };
    var orig = btn ? btn.textContent : '';
    var done = function () {
      if (btn) {
        btn.textContent = t('profile.referralCopied');
        setTimeout(function () { btn.textContent = orig; }, 1500);
      }
    };
    if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.openTelegramLink) {
      window.Telegram.WebApp.openTelegramLink('https://t.me/share/url?url=' + encodeURIComponent(link) + '&text=' + encodeURIComponent('Играй в Zero or Valuable!'));
      done();
    } else if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(link).then(done).catch(function () { done(); });
    } else {
      try {
        var inp = document.createElement('input');
        inp.value = link;
        inp.style.position = 'fixed';
        inp.style.opacity = '0';
        document.body.appendChild(inp);
        inp.select();
        document.execCommand('copy');
        document.body.removeChild(inp);
      } catch (err) {}
      done();
    }
  }
  var _tonConnectUI = null;
  function initTonConnect() {
    if (_tonConnectUI || !window.TON_CONNECT_UI) return;
    var base = API_BASE || (location.origin ? location.origin.replace(/\/$/, '') : '');
    if (!base || base.indexOf('http') !== 0) return;
    var manifestUrl = base + '/tonconnect-manifest.json';
    try {
      _tonConnectUI = new window.TON_CONNECT_UI.TonConnectUI({
        manifestUrl: manifestUrl,
        buttonRootId: 'tonConnectButton',
      });
      function updateWalletDisplay() {
        var addrEl = document.getElementById('tonWalletAddress');
        if (!addrEl) return;
        var acc = _tonConnectUI && _tonConnectUI.account;
        if (acc && acc.address) {
          var addr = acc.address;
          addrEl.textContent = addr.slice(0, 8) + '…' + addr.slice(-8);
          addrEl.classList.remove('hidden');
          fetch(base + '/api/wallet/connect', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address: addr, initData: getInitData() }),
          }).catch(function () {});
        } else {
          addrEl.textContent = '';
          addrEl.classList.add('hidden');
        }
      }
      _tonConnectUI.onStatusChange(updateWalletDisplay);
      if (_tonConnectUI.connectionRestored) {
        _tonConnectUI.connectionRestored.then(updateWalletDisplay).catch(function () {});
      }
    } catch (err) {
      console.warn('TON Connect init:', err);
    }
  }

  window.handleReferralCopy = function () {
    var btn = document.getElementById('referralCopyBtn');
    var link = btn && btn._refLink;
    if (link) {
      doReferralCopyShare(link);
      return;
    }
    var base = API_BASE || (location.origin ? location.origin.replace(/\/$/, '') : '');
    if (!base) return;
    var user = (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe && window.Telegram.WebApp.initDataUnsafe.user);
    if (!user || !user.id) return;
    var initData = getInitData();
    if (btn) btn.disabled = true;
    fetch(base + '/api/referral/link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ initData: initData }),
    }).then(function (r) { return r.json(); }).then(function (res) {
      if (btn) btn.disabled = false;
      if (res && res.ok && res.link) {
        if (btn) btn._refLink = res.link;
        doReferralCopyShare(res.link);
      }
    }).catch(function () { if (btn) btn.disabled = false; });
  };
  function loadReferralData() {
    var base = API_BASE || (location.origin ? location.origin.replace(/\/$/, '') : '');
    if (!base) return;
    var user = (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe && window.Telegram.WebApp.initDataUnsafe.user);
    if (!user || !user.id) return;
    var initData = getInitData();
    fetch(base + '/api/referral/stats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ initData: initData }),
    }).then(function (r) { return r.json(); }).then(function (res) {
      if (!res || !res.ok) return;
      var count = res.invitedCount || 0;
      var coinsEarned = res.coinsEarned || 0;
      var boxesEarned = res.boxesEarned || 0;
      var countEl = document.getElementById('referralCount');
      var coinsEl = document.getElementById('referralCoins');
      var boxesEl = document.getElementById('referralBoxes');
      if (countEl) countEl.textContent = count;
      if (coinsEl) coinsEl.textContent = coinsEarned;
      if (boxesEl) boxesEl.textContent = boxesEarned;
      window._referralCount = count;
      if (count >= 1 && !localStorage.getItem('zov_referralKeyGiven')) {
        secretBoxKeys += 1;
        saveSecretBoxKeys();
        localStorage.setItem('zov_referralKeyGiven', '1');
        updateCoinDisplay();
      }
      if (typeof updateSecretBoxDisplay === 'function') updateSecretBoxDisplay();
      if (count > 0) {
        var notify = document.getElementById('referralNotification');
        var textEl = document.getElementById('referralNotificationText');
        var t = (typeof window !== 'undefined' && window.t) ? window.t : function (k) { return k; };
        var msg = (t('profile.referralNotify') || 'Вы пригласили {count} человек. Получено: {coins} монет, {boxes} боксов.')
          .replace('{count}', count).replace('{coins}', coinsEarned).replace('{boxes}', boxesEarned);
        if (textEl) textEl.innerHTML = msg;
        if (notify && !sessionStorage.getItem('zov_ref_notify_closed')) notify.classList.remove('hidden');
      }
    }).catch(function () {});
    fetch(base + '/api/referral/link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ initData: initData }),
    }).then(function (r) { return r.json(); }).then(function (res) {
      if (res && res.ok && res.link) {
        var btn = document.getElementById('referralCopyBtn');
        if (btn) btn._refLink = res.link;
      }
    }).catch(function () {});
    var closeBtn = document.querySelector('.referral-notification-close');
    if (closeBtn && !closeBtn._zovBound) {
      closeBtn._zovBound = true;
      closeBtn.addEventListener('click', function () {
        var n = document.getElementById('referralNotification');
        if (n) n.classList.add('hidden');
        sessionStorage.setItem('zov_ref_notify_closed', '1');
      });
    }
  }
  function syncLoad() {
    var base = API_BASE || (location.origin ? location.origin.replace(/\/$/, '') : '');
    if (!base) return;
    if (typeof syncLeaderboard === 'function') syncLeaderboard();
    var user = (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe && window.Telegram.WebApp.initDataUnsafe.user);
    if (!user || !user.id) return;
    var initData = getInitData();
    var q = 'user_id=' + encodeURIComponent(String(user.id));
    if (initData) q = 'initData=' + encodeURIComponent(initData) + '&' + q;
    fetch(base + '/api/load?' + q)
      .then(function (r) { return r.json(); })
      .then(function (res) {
        if (!res || !res.ok) return;
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
        if (typeof s.boxesOpened === 'number') { boxesOpened = s.boxesOpened; saveBoxesOpened(); }
        if (typeof s.prismaticPromo === 'number') { prismaticPromo = s.prismaticPromo; savePrismaticPromo(); }
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
    var base = API_BASE || (location.origin ? location.origin.replace(/\/$/, '') : '');
    if (!base) return;
    var user = (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe && window.Telegram.WebApp.initDataUnsafe.user);
    if (!user || !user.id) return;
    var username = (user.username || user.first_name || 'Игрок').toString();
    fetch(base + '/api/leaderboard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: String(user.id), username: username, cardsCount: getTotalCards(), xp: xp, level: level }),
    }).catch(function () {});
  }
  var syncSaveTimer = null;
  function syncSave() {
    var base = API_BASE || (location.origin ? location.origin.replace(/\/$/, '') : '');
    var user = (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe && window.Telegram.WebApp.initDataUnsafe.user);
    if (!base || !user || !user.id) return;
    if (syncSaveTimer) clearTimeout(syncSaveTimer);
    syncSaveTimer = setTimeout(function () {
      var payload = {
        user_id: String(user.id),
        initData: getInitData() || undefined,
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
          boxesOpened: boxesOpened,
          prismaticPromo: prismaticPromo,
        },
      };
      fetch(base + '/api/save', {
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
