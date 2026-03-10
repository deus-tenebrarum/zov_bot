/** Zero or Valuable — i18n (RU/EN) */
(function () {
  'use strict';
  var STORAGE_KEY = 'zov_lang';
  var lang = localStorage.getItem(STORAGE_KEY) || 'ru';
  var T = {
    ru: {
      'nav.clicker': 'Кликер',
      'nav.boxes': 'Боксы',
      'nav.cards': 'Карточки',
      'nav.progress': 'Прокачка',
      'nav.leaderboard': 'Лидеры',
      'nav.profile': 'Профиль',
      'profile.title': 'Профиль',
      'profile.language': 'Язык',
      'profile.langRu': 'Русский',
      'profile.langEn': 'English',
      'profile.settings': 'Настройки',
      'profile.tonHint': 'Подключение TON кошелька — скоро',
      'loader.hint': 'Открывай боксы • Собирай карточки • Покоряй мир',
      'loader.tap': 'Нажми, чтобы продолжить',
      'clicker.title': 'Зарабатывай монеты',
      'clicker.desc': 'Тапай по монете — тратится энергия. Копи на боксы и выбивай карточки.',
      'clicker.energy': 'Энергия',
      'clicker.level': 'Уровень',
      'clicker.hint': '+1 энергия в секунду · Прокачивай в разделе «Прокачка»',
      'boxes.title': 'Боксы',
      'boxes.sub': 'Открывай за монеты — внутри случайная локация из любой точки мира.',
      'boxes.bronze': 'Бронзовый',
      'boxes.bronzeDesc': '1 карточка',
      'boxes.silver': 'Серебряный',
      'boxes.silverDesc': 'Лучший шанс на редкое',
      'boxes.gold': 'Золотой',
      'boxes.goldDesc': 'Шанс на легенду',
      'boxes.platinum': 'Платиновый',
      'boxes.platinumDesc': 'Выше шанс легенды',
      'boxes.secret': 'Секретный',
      'boxes.secretDesc': 'Ключ из промокода',
      'boxes.packs': 'Паки',
      'boxes.packsDesc': 'Открыть несколько кейсов со скидкой.',
      'cards.title': 'Коллекция',
      'cards.sub': 'Карточки городов и сёл — от Нью-Йорка до деревни в Сенегале.',
      'cards.youHave': 'У тебя',
      'cards.cardsWord': 'карточек',
      'cards.empty': 'Пока нет карточек.\nОткрой боксы!',
      'progress.title': 'Прокачка',
      'progress.sub': 'Бусты за монеты и награды за коллекции.',
      'progress.boosts': 'Бусты',
      'progress.collections': 'Коллекции',
      'progress.collectionsDesc': 'Собери карточки по условию — получи награду.',
      'leaderboard.title': 'Лидеры',
      'packReveal.hint': 'Нажми — открыть все · Ещё раз — закрыть',
      'packReveal.loading': 'Открываем паки...',
      'common': 'Обычная',
      'rare': 'Редкая',
      'epic': 'Эпическая',
      'legendary': 'Легенда',
      'location': 'ЛОКАЦИЯ',
      'city': 'ГОРОД',
      'village': 'СЕЛО',
      'town': 'ГОРОД',
      'island': 'ОСТРОВ',
      'region': 'РЕГИОН',
      'country': 'СТРАНА',
      'site': 'МЕСТО',
      'inferno': 'Инферно',
      'collector': 'Коллекционная',
      'exclusive': 'Эксклюзив',
    },
    en: {
      'nav.clicker': 'Clicker',
      'nav.boxes': 'Boxes',
      'nav.cards': 'Cards',
      'nav.progress': 'Upgrades',
      'nav.leaderboard': 'Leaders',
      'nav.profile': 'Profile',
      'profile.title': 'Profile',
      'profile.language': 'Language',
      'profile.langRu': 'Русский',
      'profile.langEn': 'English',
      'profile.settings': 'Settings',
      'profile.tonHint': 'TON wallet connection — coming soon',
      'loader.hint': 'Open boxes • Collect cards • Conquer the world',
      'loader.tap': 'Tap to continue',
      'clicker.title': 'Earn coins',
      'clicker.desc': 'Tap the coin — uses energy. Save for boxes and get cards.',
      'clicker.energy': 'Energy',
      'clicker.level': 'Level',
      'clicker.hint': '+1 energy per second · Upgrade in Upgrades section',
      'boxes.title': 'Boxes',
      'boxes.sub': 'Open for coins — random location from anywhere in the world.',
      'boxes.bronze': 'Bronze',
      'boxes.bronzeDesc': '1 card',
      'boxes.silver': 'Silver',
      'boxes.silverDesc': 'Better chance for rare',
      'boxes.gold': 'Gold',
      'boxes.goldDesc': 'Chance for legend',
      'boxes.platinum': 'Platinum',
      'boxes.platinumDesc': 'Higher legend chance',
      'boxes.secret': 'Secret',
      'boxes.secretDesc': 'Key from promo code',
      'boxes.packs': 'Packs',
      'boxes.packsDesc': 'Open multiple cases with discount.',
      'cards.title': 'Collection',
      'cards.sub': 'City and village cards — from New York to a Senegalese village.',
      'cards.youHave': 'You have',
      'cards.cardsWord': 'cards',
      'cards.empty': 'No cards yet.\nOpen boxes!',
      'progress.title': 'Upgrades',
      'progress.sub': 'Boosts for coins and collection rewards.',
      'progress.boosts': 'Boosts',
      'progress.collections': 'Collections',
      'progress.collectionsDesc': 'Collect cards by condition — get reward.',
      'leaderboard.title': 'Leaders',
      'packReveal.hint': 'Tap — open all · Tap again — close',
      'packReveal.loading': 'Opening packs...',
      'common': 'Common',
      'rare': 'Rare',
      'epic': 'Epic',
      'legendary': 'Legend',
      'location': 'LOCATION',
      'city': 'CITY',
      'village': 'VILLAGE',
      'town': 'TOWN',
      'island': 'ISLAND',
      'region': 'REGION',
      'country': 'COUNTRY',
      'site': 'SITE',
      'inferno': 'Inferno',
      'collector': 'Collector',
      'exclusive': 'Exclusive',
    },
  };
  function t(key) {
    var L = T[lang] || T.ru;
    return L[key] !== undefined ? L[key] : (T.ru[key] || key);
  }
  function setLanguage(l) {
    if (T[l]) {
      lang = l;
      localStorage.setItem(STORAGE_KEY, lang);
      document.documentElement.lang = lang;
      applyTranslations();
      if (typeof window._zovOnLangChange === 'function') window._zovOnLangChange(lang);
    }
  }
  function getLang() { return lang; }
  function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      if (key) el.textContent = t(key);
    });
  }
  window.ZOV_I18N = { t: t, setLanguage: setLanguage, getLang: getLang, applyTranslations: applyTranslations };
  window.t = t;
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyTranslations);
  } else {
    applyTranslations();
  }
})();
