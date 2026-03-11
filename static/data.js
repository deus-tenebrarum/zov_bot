// Zero or Valuable — локации для карточек (города и сёла по всему миру)

const LOCATIONS = [
  // Известные мегаполисы
  { name: 'Нью-Йорк', country: 'США', type: 'city', rarity: 'legendary' },
  { name: 'Токио', country: 'Япония', type: 'city', rarity: 'legendary' },
  { name: 'Париж', country: 'Франция', type: 'city', rarity: 'legendary' },
  { name: 'Лондон', country: 'Великобритания', type: 'city', rarity: 'legendary' },
  { name: 'Дубай', country: 'ОАЭ', type: 'city', rarity: 'legendary' },
  { name: 'Сингапур', country: 'Сингапур', type: 'city', rarity: 'legendary' },
  { name: 'Гонконг', country: 'Китай', type: 'city', rarity: 'legendary' },
  { name: 'Сидней', country: 'Австралия', type: 'city', rarity: 'epic' },
  { name: 'Рим', country: 'Италия', type: 'city', rarity: 'epic' },
  { name: 'Барселона', country: 'Испания', type: 'city', rarity: 'epic' },
  { name: 'Амстердам', country: 'Нидерланды', type: 'city', rarity: 'epic' },
  { name: 'Берлин', country: 'Германия', type: 'city', rarity: 'epic' },
  { name: 'Москва', country: 'Россия', type: 'city', rarity: 'epic' },
  { name: 'Стамбул', country: 'Турция', type: 'city', rarity: 'epic' },
  { name: 'Сеул', country: 'Южная Корея', type: 'city', rarity: 'epic' },
  { name: 'Лос-Анджелес', country: 'США', type: 'city', rarity: 'epic' },
  { name: 'Мумбаи', country: 'Индия', type: 'city', rarity: 'epic' },
  { name: 'Каир', country: 'Египет', type: 'city', rarity: 'epic' },
  { name: 'Буэнос-Айрес', country: 'Аргентина', type: 'city', rarity: 'epic' },
  { name: 'Кейптаун', country: 'ЮАР', type: 'city', rarity: 'epic' },
  // Города поменьше
  { name: 'Прага', country: 'Чехия', type: 'city', rarity: 'rare' },
  { name: 'Краков', country: 'Польша', type: 'city', rarity: 'rare' },
  { name: 'Лиссабон', country: 'Португалия', type: 'city', rarity: 'rare' },
  { name: 'Киев', country: 'Украина', type: 'city', rarity: 'rare' },
  { name: 'Тбилиси', country: 'Грузия', type: 'city', rarity: 'rare' },
  { name: 'Ереван', country: 'Армения', type: 'city', rarity: 'rare' },
  { name: 'Рейкьявик', country: 'Исландия', type: 'city', rarity: 'rare' },
  { name: 'Хельсинки', country: 'Финляндия', type: 'city', rarity: 'rare' },
  { name: 'Осака', country: 'Япония', type: 'city', rarity: 'rare' },
  { name: 'Киото', country: 'Япония', type: 'city', rarity: 'rare' },
  { name: 'Хошимин', country: 'Вьетнам', type: 'city', rarity: 'rare' },
  { name: 'Бангкок', country: 'Таиланд', type: 'city', rarity: 'rare' },
  { name: 'Куала-Лумпур', country: 'Малайзия', type: 'city', rarity: 'rare' },
  { name: 'Дакка', country: 'Бангладеш', type: 'city', rarity: 'rare' },
  { name: 'Лахор', country: 'Пакистан', type: 'city', rarity: 'rare' },
  { name: 'Дакар', country: 'Сенегал', type: 'city', rarity: 'rare' },
  { name: 'Абиджан', country: 'Кот-д’Ивуар', type: 'city', rarity: 'rare' },
  { name: 'Найроби', country: 'Кения', type: 'city', rarity: 'rare' },
  { name: 'Аккра', country: 'Гана', type: 'city', rarity: 'rare' },
  { name: 'Лима', country: 'Перу', type: 'city', rarity: 'rare' },
  { name: 'Богота', country: 'Колумбия', type: 'city', rarity: 'rare' },
  { name: 'Кито', country: 'Эквадор', type: 'city', rarity: 'rare' },
  { name: 'Гавана', country: 'Куба', type: 'city', rarity: 'rare' },
  { name: 'Кингстон', country: 'Ямайка', type: 'city', rarity: 'rare' },
  { name: 'Веллингтон', country: 'Новая Зеландия', type: 'city', rarity: 'rare' },
  // Маленькие города и сёла — Сенегал и Африка
  { name: 'Туба', country: 'Сенегал', type: 'city', rarity: 'common' },
  { name: 'Тиес', country: 'Сенегал', type: 'city', rarity: 'common' },
  { name: 'Зигиншор', country: 'Сенегал', type: 'city', rarity: 'common' },
  { name: 'Сент-Луис', country: 'Сенегал', type: 'city', rarity: 'common' },
  { name: 'Каолак', country: 'Сенегал', type: 'city', rarity: 'common' },
  { name: 'Руфиск', country: 'Сенегал', type: 'city', rarity: 'common' },
  { name: 'Джоаль-Фадиут', country: 'Сенегал', type: 'village', rarity: 'common' },
  { name: 'Диурбель', country: 'Сенегал', type: 'city', rarity: 'common' },
  { name: 'Луга', country: 'Сенегал', type: 'city', rarity: 'common' },
  { name: 'Тамбакунда', country: 'Сенегал', type: 'city', rarity: 'common' },
  { name: 'Бамбей', country: 'Сенегал', type: 'village', rarity: 'common' },
  { name: 'Бигонья', country: 'Сенегал', type: 'town', rarity: 'common' },
  { name: 'Дагана', country: 'Сенегал', type: 'town', rarity: 'common' },
  { name: 'Диндефело', country: 'Сенегал', type: 'village', rarity: 'common' },
  { name: 'Кафрин', country: 'Сенегал', type: 'town', rarity: 'common' },
  { name: 'Колда', country: 'Сенегал', type: 'city', rarity: 'common' },
  { name: 'Ришар-Толл', country: 'Сенегал', type: 'town', rarity: 'common' },
  { name: 'Тиваван', country: 'Сенегал', type: 'town', rarity: 'common' },
  { name: 'Велингара', country: 'Сенегал', type: 'town', rarity: 'common' },
  // Деревни и малые населённые пункты по миру
  { name: 'Халльстат', country: 'Австрия', type: 'village', rarity: 'rare' },
  { name: 'Гитхорн', country: 'Нидерланды', type: 'village', rarity: 'rare' },
  { name: 'Бибери', country: 'Великобритания', type: 'village', rarity: 'common' },
  { name: 'Попрад', country: 'Словакия', type: 'city', rarity: 'common' },
  { name: 'Сигишоара', country: 'Румыния', type: 'town', rarity: 'common' },
  { name: 'Оймякон', country: 'Россия', type: 'village', rarity: 'rare' },
  { name: 'Кижи', country: 'Россия', type: 'village', rarity: 'common' },
  { name: 'Суздаль', country: 'Россия', type: 'town', rarity: 'rare' },
  { name: 'Гореме', country: 'Турция', type: 'village', rarity: 'rare' },
  { name: 'Ширакава-го', country: 'Япония', type: 'village', rarity: 'rare' },
  { name: 'Ханой', country: 'Вьетнам', type: 'city', rarity: 'rare' },
  { name: 'Луангпрабанг', country: 'Лаос', type: 'city', rarity: 'rare' },
  { name: 'Сием Рип', country: 'Камбоджа', type: 'town', rarity: 'common' },
  { name: 'Убуд', country: 'Индонезия', type: 'town', rarity: 'common' },
  { name: 'Дарджилинг', country: 'Индия', type: 'town', rarity: 'common' },
  { name: 'Лех', country: 'Индия', type: 'town', rarity: 'common' },
  { name: 'Петра', country: 'Иордания', type: 'site', rarity: 'epic' },
  { name: 'Марракеш', country: 'Марокко', type: 'city', rarity: 'epic' },
  { name: 'Фес', country: 'Марокко', type: 'city', rarity: 'rare' },
  { name: 'Занзибар', country: 'Танзания', type: 'island', rarity: 'rare' },
  { name: 'Виктория-Фолс', country: 'Зимбабве', type: 'town', rarity: 'rare' },
  { name: 'Виндхук', country: 'Намибия', type: 'city', rarity: 'common' },
  { name: 'Кигали', country: 'Руанда', type: 'city', rarity: 'common' },
  { name: 'Аддис-Абеба', country: 'Эфиопия', type: 'city', rarity: 'rare' },
  { name: 'Монровия', country: 'Либерия', type: 'city', rarity: 'common' },
  { name: 'Фритаун', country: 'Сьерра-Леоне', type: 'city', rarity: 'common' },
  { name: 'Бамако', country: 'Мали', type: 'city', rarity: 'common' },
  { name: 'Ниамей', country: 'Нигер', type: 'city', rarity: 'common' },
  { name: 'Нуакшот', country: 'Мавритания', type: 'city', rarity: 'common' },
  { name: 'Уагадугу', country: 'Буркина-Фасо', type: 'city', rarity: 'common' },
  { name: 'Котону', country: 'Бенин', type: 'city', rarity: 'common' },
  { name: 'Ломе', country: 'Того', type: 'city', rarity: 'common' },
  { name: 'Порт-о-Пренс', country: 'Гаити', type: 'city', rarity: 'common' },
  { name: 'Сан-Хосе', country: 'Коста-Рика', type: 'city', rarity: 'common' },
  { name: 'Панама', country: 'Панама', type: 'city', rarity: 'rare' },
  { name: 'Тегусигальпа', country: 'Гондурас', type: 'city', rarity: 'common' },
  { name: 'Манагуа', country: 'Никарагуа', type: 'city', rarity: 'common' },
  { name: 'Сан-Сальвадор', country: 'Сальвадор', type: 'city', rarity: 'common' },
  { name: 'Гватемала', country: 'Гватемала', type: 'city', rarity: 'common' },
  { name: 'Белиз', country: 'Белиз', type: 'city', rarity: 'common' },
  { name: 'Асунсьон', country: 'Парагвай', type: 'city', rarity: 'common' },
  { name: 'Монтевидео', country: 'Уругвай', type: 'city', rarity: 'rare' },
  { name: 'Сантьяго', country: 'Чили', type: 'city', rarity: 'epic' },
  { name: 'Ла-Пас', country: 'Боливия', type: 'city', rarity: 'rare' },
  { name: 'Каракас', country: 'Венесуэла', type: 'city', rarity: 'rare' },
  { name: 'Сукре', country: 'Боливия', type: 'city', rarity: 'common' },
  { name: 'Копенгаген', country: 'Дания', type: 'city', rarity: 'epic' },
  { name: 'Осло', country: 'Норвегия', type: 'city', rarity: 'epic' },
  { name: 'Стокгольм', country: 'Швеция', type: 'city', rarity: 'epic' },
  { name: 'Таллин', country: 'Эстония', type: 'city', rarity: 'rare' },
  { name: 'Рига', country: 'Латвия', type: 'city', rarity: 'rare' },
  { name: 'Вильнюс', country: 'Литва', type: 'city', rarity: 'rare' },
  { name: 'Минск', country: 'Беларусь', type: 'city', rarity: 'rare' },
  { name: 'Кишинёв', country: 'Молдова', type: 'city', rarity: 'common' },
  { name: 'Тирана', country: 'Албания', type: 'city', rarity: 'common' },
  { name: 'Скопье', country: 'Северная Македония', type: 'city', rarity: 'common' },
  { name: 'Сараево', country: 'Босния и Герцеговина', type: 'city', rarity: 'rare' },
  { name: 'Загреб', country: 'Хорватия', type: 'city', rarity: 'rare' },
  { name: 'Любляна', country: 'Словения', type: 'city', rarity: 'rare' },
  { name: 'Белград', country: 'Сербия', type: 'city', rarity: 'rare' },
  { name: 'София', country: 'Болгария', type: 'city', rarity: 'rare' },
  { name: 'Бухарест', country: 'Румыния', type: 'city', rarity: 'rare' },
  { name: 'Будапешт', country: 'Венгрия', type: 'city', rarity: 'epic' },
  { name: 'Вена', country: 'Австрия', type: 'city', rarity: 'epic' },
  { name: 'Цюрих', country: 'Швейцария', type: 'city', rarity: 'epic' },
  { name: 'Женева', country: 'Швейцария', type: 'city', rarity: 'epic' },
  { name: 'Брюссель', country: 'Бельгия', type: 'city', rarity: 'epic' },
  { name: 'Дублин', country: 'Ирландия', type: 'city', rarity: 'epic' },
  { name: 'Эдинбург', country: 'Великобритания', type: 'city', rarity: 'epic' },
  { name: 'Глазго', country: 'Великобритания', type: 'city', rarity: 'rare' },
  { name: 'Манчестер', country: 'Великобритания', type: 'city', rarity: 'rare' },
  { name: 'Ливерпуль', country: 'Великобритания', type: 'city', rarity: 'rare' },
  { name: 'Милан', country: 'Италия', type: 'city', rarity: 'epic' },
  { name: 'Венеция', country: 'Италия', type: 'city', rarity: 'epic' },
  { name: 'Флоренция', country: 'Италия', type: 'city', rarity: 'epic' },
  { name: 'Неаполь', country: 'Италия', type: 'city', rarity: 'rare' },
  { name: 'Мадрид', country: 'Испания', type: 'city', rarity: 'epic' },
  { name: 'Валенсия', country: 'Испания', type: 'city', rarity: 'rare' },
  { name: 'Севилья', country: 'Испания', type: 'city', rarity: 'rare' },
  { name: 'Афины', country: 'Греция', type: 'city', rarity: 'epic' },
  { name: 'Санторини', country: 'Греция', type: 'island', rarity: 'epic' },
  { name: 'Тель-Авив', country: 'Израиль', type: 'city', rarity: 'epic' },
  { name: 'Иерусалим', country: 'Израиль', type: 'city', rarity: 'legendary' },
  { name: 'Доха', country: 'Катар', type: 'city', rarity: 'epic' },
  { name: 'Маскат', country: 'Оман', type: 'city', rarity: 'rare' },
  { name: 'Баку', country: 'Азербайджан', type: 'city', rarity: 'rare' },
  { name: 'Тбилиси', country: 'Грузия', type: 'city', rarity: 'rare' },
  { name: 'Ереван', country: 'Армения', type: 'city', rarity: 'rare' },
  { name: 'Алматы', country: 'Казахстан', type: 'city', rarity: 'rare' },
  { name: 'Ташкент', country: 'Узбекистан', type: 'city', rarity: 'rare' },
  { name: 'Самарканд', country: 'Узбекистан', type: 'city', rarity: 'epic' },
  { name: 'Бишкек', country: 'Киргизия', type: 'city', rarity: 'common' },
  { name: 'Душанбе', country: 'Таджикистан', type: 'city', rarity: 'common' },
  { name: 'Ашхабад', country: 'Туркменистан', type: 'city', rarity: 'common' },
  { name: 'Улан-Батор', country: 'Монголия', type: 'city', rarity: 'rare' },
  { name: 'Пекин', country: 'Китай', type: 'city', rarity: 'legendary' },
  { name: 'Шанхай', country: 'Китай', type: 'city', rarity: 'legendary' },
  { name: 'Гуанчжоу', country: 'Китай', type: 'city', rarity: 'epic' },
  { name: 'Чэнду', country: 'Китай', type: 'city', rarity: 'rare' },
  { name: 'Сиань', country: 'Китай', type: 'city', rarity: 'epic' },
  { name: 'Лхаса', country: 'Китай', type: 'city', rarity: 'epic' },
  { name: 'Тайбэй', country: 'Тайвань', type: 'city', rarity: 'epic' },
  { name: 'Манила', country: 'Филиппины', type: 'city', rarity: 'rare' },
  { name: 'Джакарта', country: 'Индонезия', type: 'city', rarity: 'epic' },
  { name: 'Куала-Лумпур', country: 'Малайзия', type: 'city', rarity: 'epic' },
  { name: 'Янгон', country: 'Мьянма', type: 'city', rarity: 'rare' },
  { name: 'Коломбо', country: 'Шри-Ланка', type: 'city', rarity: 'rare' },
  { name: 'Катманду', country: 'Непал', type: 'city', rarity: 'epic' },
  { name: 'Тхимпху', country: 'Бутан', type: 'city', rarity: 'rare' },
  { name: 'Мальдивы', country: 'Мальдивы', type: 'country', rarity: 'epic' },
  { name: 'Порт-Луи', country: 'Маврикий', type: 'city', rarity: 'rare' },
  { name: 'Антананариву', country: 'Мадагаскар', type: 'city', rarity: 'common' },
  { name: 'Лусаке', country: 'Замбия', type: 'city', rarity: 'common' },
  { name: 'Лилонгве', country: 'Малави', type: 'city', rarity: 'common' },
  { name: 'Мапуту', country: 'Мозамбик', type: 'city', rarity: 'common' },
  { name: 'Хараре', country: 'Зимбабве', type: 'city', rarity: 'rare' },
  { name: 'Габороне', country: 'Ботсвана', type: 'city', rarity: 'common' },
  { name: 'Мбабане', country: 'Эсватини', type: 'city', rarity: 'common' },
  { name: 'Масеру', country: 'Лесото', type: 'city', rarity: 'common' },
  { name: 'Рейкьявик', country: 'Исландия', type: 'city', rarity: 'epic' },
  { name: 'Торсхавн', country: 'Фарерские о-ва', type: 'town', rarity: 'rare' },
  { name: 'Нуук', country: 'Гренландия', type: 'city', rarity: 'rare' },
  { name: 'Ушуая', country: 'Аргентина', type: 'town', rarity: 'epic' },
  { name: 'Патагония', country: 'Аргентина', type: 'region', rarity: 'epic' },
  { name: 'Кусоко', country: 'Перу', type: 'village', rarity: 'legendary' },
  { name: 'Куско', country: 'Перу', type: 'city', rarity: 'epic' },
  { name: 'Озеро Титикака', country: 'Перу/Боливия', type: 'region', rarity: 'epic' },
  { name: 'Сальвадор', country: 'Бразилия', type: 'city', rarity: 'rare' },
  { name: 'Форталеза', country: 'Бразилия', type: 'city', rarity: 'common' },
  { name: 'Ресифи', country: 'Бразилия', type: 'city', rarity: 'common' },
  { name: 'Белу-Оризонти', country: 'Бразилия', type: 'city', rarity: 'rare' },
  { name: 'Каракас', country: 'Венесуэла', type: 'city', rarity: 'rare' },
  { name: 'Канкун', country: 'Мексика', type: 'city', rarity: 'epic' },
  { name: 'Оахака', country: 'Мексика', type: 'city', rarity: 'rare' },
  { name: 'Гуанахуато', country: 'Мексика', type: 'city', rarity: 'epic' },
  { name: 'Сан-Мигель-де-Альенде', country: 'Мексика', type: 'town', rarity: 'rare' },
  { name: 'Торонто', country: 'Канада', type: 'city', rarity: 'epic' },
  { name: 'Ванкувер', country: 'Канада', type: 'city', rarity: 'epic' },
  { name: 'Монреаль', country: 'Канада', type: 'city', rarity: 'epic' },
  { name: 'Квебек', country: 'Канада', type: 'city', rarity: 'epic' },
  { name: 'Калгари', country: 'Канада', type: 'city', rarity: 'rare' },
  { name: 'Мельбурн', country: 'Австралия', type: 'city', rarity: 'epic' },
  { name: 'Брисбен', country: 'Австралия', type: 'city', rarity: 'rare' },
  { name: 'Перт', country: 'Австралия', type: 'city', rarity: 'rare' },
  { name: 'Аделаида', country: 'Австралия', type: 'city', rarity: 'rare' },
  { name: 'Окленд', country: 'Новая Зеландия', type: 'city', rarity: 'epic' },
  { name: 'Крайстчерч', country: 'Новая Зеландия', type: 'city', rarity: 'rare' },
  { name: 'Королева', country: 'Новая Зеландия', type: 'town', rarity: 'rare' },
  { name: 'Паго-Паго', country: 'Американское Самоа', type: 'town', rarity: 'common' },
  { name: 'Сува', country: 'Фиджи', type: 'city', rarity: 'common' },
  { name: 'Порт-Морсби', country: 'Папуа — Новая Гвинея', type: 'city', rarity: 'common' },
];

// Веса редкости при открытии бокса (inferno/collector/exclusive — крайне редко)
const BOX_RARITY_WEIGHTS = {
  bronze: { common: 58, rare: 28, epic: 10, legendary: 2, inferno: 1, collector: 0.5, exclusive: 0.5 },
  silver: { common: 43, rare: 33, epic: 14, legendary: 5, inferno: 2, collector: 1.5, exclusive: 1.5 },
  gold: { common: 23, rare: 38, epic: 24, legendary: 9, inferno: 3, collector: 2, exclusive: 2 },
  platinum: { common: 12, rare: 32, epic: 34, legendary: 14, inferno: 4, collector: 2.5, exclusive: 2.5 },
  secret: { common: 8, rare: 28, epic: 33, legendary: 22, inferno: 4, collector: 3, exclusive: 3 },
};

// Столицы государств (name + country для матчинга карточек)
const CAPITALS = [
  'Москва|Россия', 'Вашингтон|США', 'Пекин|Китай', 'Токио|Япония', 'Дели|Индия', 'Нью-Дели|Индия', 'Бразилиа|Бразилия', 'Лондон|Великобритания', 'Париж|Франция', 'Берлин|Германия', 'Рим|Италия',
  'Мадрид|Испания', 'Оттава|Канада', 'Канберра|Австралия', 'Сеул|Южная Корея', 'Мексико|Мексика', 'Джакарта|Индонезия', 'Анкара|Турция', 'Тегеран|Иран', 'Бангкок|Таиланд', 'Каир|Египет',
  'Варшава|Польша', 'Киев|Украина', 'Буэнос-Айрес|Аргентина', 'Богота|Колумбия', 'Претория|ЮАР', 'Кейптаун|ЮАР', 'Амстердам|Нидерланды', 'Брюссель|Бельгия', 'Вена|Австрия', 'Прага|Чехия',
  'Будапешт|Венгрия', 'Бухарест|Румыния', 'Афины|Греция', 'Лиссабон|Португалия', 'Стокгольм|Швеция', 'Осло|Норвегия', 'Хельсинки|Финляндия', 'Копенгаген|Дания', 'Дублин|Ирландия', 'Тбилиси|Грузия',
  'Ереван|Армения', 'Баку|Азербайджан', 'Астана|Казахстан', 'Ташкент|Узбекистан', 'Минск|Беларусь', 'Вильнюс|Литва', 'Рига|Латвия', 'Таллин|Эстония', 'Кишинёв|Молдова', 'София|Болгария',
  'Белград|Сербия', 'Загреб|Хорватия', 'Любляна|Словения', 'Сараево|Босния и Герцеговина', 'Скопье|Северная Македония', 'Тирана|Албания', 'Иерусалим|Израиль', 'Рияд|Саудовская Аравия', 'Доха|Катар',
  'Абу-Даби|ОАЭ', 'Багдад|Ирак', 'Дамаск|Сирия', 'Бейрут|Ливан', 'Амман|Иордания', 'Куала-Лумпур|Малайзия', 'Сингапур|Сингапур', 'Ханой|Вьетнам', 'Манила|Филиппины', 'Дакка|Бангладеш',
  'Исламабад|Пакистан', 'Кабул|Афганистан', 'Найроби|Кения', 'Лагос|Нигерия', 'Аддис-Абеба|Эфиопия', 'Дакар|Сенегал', 'Аккра|Гана', 'Абиджан|Кот-д\'Ивуар', 'Лима|Перу', 'Сантьяго|Чили',
  'Кито|Эквадор', 'Каракас|Венесуэла', 'Ла-Пас|Боливия', 'Асунсьон|Парагвай', 'Монтевидео|Уругвай', 'Гавана|Куба', 'Кингстон|Ямайка', 'Порт-о-Пренс|Гаити', 'Панама|Панама', 'Сан-Хосе|Коста-Рика',
  'Веллингтон|Новая Зеландия', 'Рейкьявик|Исландия', 'Тхимпху|Бутан', 'Катманду|Непал', 'Коломбо|Шри-Ланка', 'Янгон|Мьянма', 'Пномпень|Камбоджа', 'Вьентьян|Лаос', 'Дар-эс-Салам|Танзания',
  'Лусака|Замбия', 'Хараре|Зимбабве', 'Мапуту|Мозамбик', 'Антананариву|Мадагаскар', 'Порт-Луи|Маврикий', 'Нуакшот|Мавритания', 'Бамако|Мали', 'Ниамей|Нигер', 'Уагадугу|Буркина-Фасо',
  'Котону|Бенин', 'Ломе|Того', 'Монровия|Либерия', 'Фритаун|Сьерра-Леоне', 'Кигали|Руанда', 'Кампала|Уганда', 'Джибути|Джибути', 'Могадишо|Сомали', 'Асмэра|Эритрея', 'Триполи|Ливия',
  'Тунис|Тунис', 'Алжир|Алжир', 'Рабат|Марокко', 'Нукуалофа|Тонга', 'Апиа|Самоа', 'Сува|Фиджи', 'Порт-Морсби|Папуа — Новая Гвинея', 'Пхеньян|КНДР', 'Тайбэй|Тайвань',
  'Паго-Паго|Американское Самоа', 'Валли|Ангилья', 'Ораньестад|Аруба', 'Гамильтон|Бермуды', 'Род-Таун|Британские Виргинские о-ва', 'Джорджтаун|Каймановы о-ва', 'Аваруа|Острова Кука', 'Виллемстад|Кюрасао', 'Стэнли|Фолклендские о-ва', 'Торсхавн|Фарерские о-ва', 'Папеэте|Французская Полинезия', 'Гибралтар|Гибралтар', 'Нуук|Гренландия', 'Аганья|Гуам', 'Дуглас|Остров Мэн', 'Сент-Хелиер|Джерси', 'Сент-Питер-Порт|Гернси', 'Бас-Терр|Гваделупа', 'Фор-де-Франс|Мартиника', 'Плимут|Монтсеррат', 'Сан-Хуан|Пуэрто-Рико', 'Мариго|Синт-Мартен', 'Кокберн-Таун|Теркс и Кайкос', 'Шарлотта-Амалия|Виргинские о-ва (США)', 'Алофи|Ниуэ', 'Сайпан|Северные Марианские о-ва', 'Нукунону|Токелау', 'Мата-Уту|Уоллис и Футуна', 'Эль-Аюн|Западная Сахара', 'Джеймстаун|Остров Святой Елены', 'Мале|Мальдивы', 'Дили|Восточный Тимор', 'Бандар-Сери-Бегаван|Бруней', 'Манама|Бахрейн', 'Эль-Кувейт|Кувейт', 'Маскат|Оман',
];
// Топ-15 самых населённых городов планеты
const TOP_POPULOUS_CITIES = [
  'Токио|Япония', 'Дели|Индия', 'Шанхай|Китай', 'Дакка|Бангладеш', 'Сан-Паулу|Бразилия', 'Мехико|Мексика', 'Мексико|Мексика', 'Каир|Египет', 'Пекин|Китай', 'Мумбаи|Индия', 'Осака|Япония',
  'Чунцин|Китай', 'Карачи|Пакистан', 'Стамбул|Турция', 'Киншаса|ДР Конго', 'Лагос|Нигерия', 'Гуанчжоу|Китай', 'Москва|Россия', 'Джакарта|Индонезия',
];
// Страна → континент (250 стран и территорий)
const COUNTRY_TO_CONTINENT = {};
['Россия','Германия','Франция','Великобритания','Италия','Испания','Украина','Польша','Румыния','Нидерланды','Бельгия','Чехия','Греция','Португалия','Швеция','Венгрия','Беларусь','Австрия','Швейцария','Болгария','Сербия','Финляндия','Норвегия','Ирландия','Словакия','Хорватия','Дания','Босния и Герцеговина','Албания','Литва','Северная Македония','Словения','Латвия','Эстония','Кипр','Люксембург','Черногория','Мальта','Исландия','Андорра','Монако','Сан-Марино','Ватикан','Гибралтар','Гернси','Джерси','Остров Мэн','Фарерские о-ва','Гренландия','Молдова','Косово','Шпицберген и Ян-Майен','Остров Вознесения','Тристан-да-Кунья','Олдерни','Сарк'].forEach(function(c){COUNTRY_TO_CONTINENT[c]='Европа';});
['Китай','Индия','Индонезия','Пакистан','Бангладеш','Япония','Филиппины','Вьетнам','Турция','Иран','Таиланд','Мьянма','Южная Корея','Ирак','Афганистан','Саудовская Аравия','Узбекистан','Малайзия','Непал','Йемен','КНДР','Шри-Ланка','Сирия','Казахстан','Камбоджа','Иордания','ОАЭ','Азербайджан','Таджикистан','Израиль','Сингапур','Лаос','Киргизия','Ливан','Туркменистан','Грузия','Армения','Бутан','Бруней','Бахрейн','Кувейт','Оман','Катар','Тайвань','Восточный Тимор','Мальдивы'].forEach(function(c){COUNTRY_TO_CONTINENT[c]='Азия';});
['Нигерия','Эфиопия','Египет','ДР Конго','Танзания','ЮАР','Кения','Алжир','Судан','Уганда','Марокко','Мозамбик','Гана','Мадагаскар','Камерун','Кот-д\'Ивуар','Нигер','Буркина-Фасо','Мали','Малави','Замбия','Сомали','Сенегал','Чад','Зимбабве','Гвинея','Руанда','Бенин','Тунис','Ливия','Либерия','Мавритания','Сьерра-Леоне','Гамбия','Ботсвана','Намибия','Габон','Лесото','Эсватини','Маврикий','Эритрея','Джибути','Коморы','Кабо-Верде','Ангола','ЦАР','Конго','Бурунди','Экваториальная Гвинея','Гвинея-Бисау','Реюньон','Западная Сахара','Остров Святой Елены','Того','Сан-Томе и Принсипи','Сейшелы','Майотта','Южный Судан'].forEach(function(c){COUNTRY_TO_CONTINENT[c]='Африка';});
['США','Бразилия','Мексика','Колумбия','Аргентина','Канада','Перу','Венесуэла','Чили','Эквадор','Гватемала','Боливия','Куба','Гаити','Доминиканская Республика','Гондурас','Парагвай','Никарагуа','Сальвадор','Коста-Рика','Панама','Уругвай','Ямайка','Тринидад и Тобаго','Белиз','Багамы','Барбадос','Гренада','Сент-Люсия','Сент-Винсент и Гренадины','Антигуа и Барбуда','Доминика','Сент-Китс и Невис','Гайана','Суринам','Бермуды','Американское Самоа','Ангилья','Аруба','Британские Виргинские о-ва','Каймановы о-ва','Кюрасао','Фолклендские о-ва','Гваделупа','Мартиника','Монтсеррат','Пуэрто-Рико','Синт-Мартен','Теркс и Кайкос','Виргинские о-ва (США)','Южная Георгия и Южные Сандвичевы о-ва','Сен-Пьер и Микелон','Сен-Бартелеми','Бонайре','Саба','Остров Буве'].forEach(function(c){COUNTRY_TO_CONTINENT[c]='Америка';});
['Австралия','Папуа — Новая Гвинея','Новая Зеландия','Фиджи','Соломоновы Острова','Вануату','Самоа','Кирибати','Микронезия','Тонга','Палау','Науру','Тувалу','Маршалловы Острова','Острова Кука','Французская Полинезия','Гуам','Ниуэ','Северные Марианские о-ва','Токелау','Уоллис и Футуна','Остров Норфолк','Остров Рождества','Кокосовые острова','Остров Питкерн','Острова Мидуэй','Остров Уэйк'].forEach(function(c){COUNTRY_TO_CONTINENT[c]='Океания';});

// Коллекции — задания за награды (монеты + XP + секретный бокс)
var ALL_COUNTRIES_TARGET = 250;
const COLLECTIONS = [
  { id: 'total10', title: 'Собери 10 карточек', req: { type: 'total', count: 10 }, rewardCoins: 100, rewardXp: 50 },
  { id: 'total25', title: 'Собери 25 карточек', req: { type: 'total', count: 25 }, rewardCoins: 300, rewardXp: 150 },
  { id: 'villages5', title: '5 самых маленьких сёл', req: { type: 'village', count: 5 }, rewardCoins: 150, rewardXp: 80 },
  { id: 'cities10', title: '10 городов мира', req: { type: 'city', count: 10 }, rewardCoins: 200, rewardXp: 100 },
  { id: 'legendary3', title: '3 легендарные карты', req: { type: 'legendary', count: 3 }, rewardCoins: 500, rewardXp: 200 },
  { id: 'total50', title: 'Собери 50 карточек', req: { type: 'total', count: 50 }, rewardCoins: 800, rewardXp: 400 },
  { id: 'epic5', title: '5 эпических карт', req: { type: 'epic', count: 5 }, rewardCoins: 400, rewardXp: 180 },
  { id: 'rare15', title: '15 редких карт', req: { type: 'rare', count: 15 }, rewardCoins: 350, rewardXp: 120 },
  { id: 'open5boxes', title: 'Открой 5 боксов', req: { type: 'boxesOpened', count: 5 }, rewardCoins: 80, rewardXp: 40 },
  { id: 'open20boxes', title: 'Открой 20 боксов', req: { type: 'boxesOpened', count: 20 }, rewardCoins: 250, rewardXp: 100 },
  { id: 'capitals50', title: '50 столиц государств', req: { type: 'capitals', count: 50 }, rewardCoins: 1500, rewardXp: 300 },
  { id: 'topCities10', title: 'Топ-10 самых населённых городов', req: { type: 'topCities', count: 10 }, rewardCoins: 2000, rewardXp: 400 },
  { id: 'fiveContinents', title: '5 городов с 5 континентов', req: { type: 'continents', count: 5 }, rewardCoins: 800, rewardXp: 200 },
  { id: 'islands10', title: '10 островов и островных городов', req: { type: 'island', count: 10 }, rewardCoins: 600, rewardXp: 150 },
  { id: 'villages20', title: '20 сёл и деревень', req: { type: 'village', count: 20 }, rewardCoins: 500, rewardXp: 120 },
  { id: 'total100', title: 'Собери 100 карточек', req: { type: 'total', count: 100 }, rewardCoins: 1500, rewardXp: 600 },
  { id: 'total200', title: 'Собери 200 карточек', req: { type: 'total', count: 200 }, rewardCoins: 3000, rewardXp: 1000 },
  { id: 'legendary5', title: '5 легендарных карт', req: { type: 'legendary', count: 5 }, rewardCoins: 1200, rewardXp: 400 },
  { id: 'towns15', title: '15 городков и посёлков', req: { type: 'town', count: 15 }, rewardCoins: 400, rewardXp: 150 },
  { id: 'allCountries', title: 'Все 250 стран мира', req: { type: 'countries', count: ALL_COUNTRIES_TARGET }, rewardCoins: 5000, rewardXp: 500, rewardSecretBoxKeys: 1 },
];
// RU → EN для отображения стран при переключении на английский
const COUNTRY_RU_TO_EN = {
  'Россия':'Russia','Германия':'Germany','Франция':'France','Великобритания':'United Kingdom','Италия':'Italy','Испания':'Spain','Украина':'Ukraine','Польша':'Poland','Румыния':'Romania','Нидерланды':'Netherlands','Бельгия':'Belgium','Чехия':'Czech Republic','Греция':'Greece','Португалия':'Portugal','Швеция':'Sweden','Венгрия':'Hungary','Беларусь':'Belarus','Австрия':'Austria','Швейцария':'Switzerland','Болгария':'Bulgaria','Сербия':'Serbia','Финляндия':'Finland','Норвегия':'Norway','Ирландия':'Ireland','Словакия':'Slovakia','Хорватия':'Croatia','Дания':'Denmark','Босния и Герцеговина':'Bosnia and Herzegovina','Албания':'Albania','Литва':'Lithuania','Северная Македония':'North Macedonia','Словения':'Slovenia','Латвия':'Latvia','Эстония':'Estonia','Кипр':'Cyprus','Люксембург':'Luxembourg','Черногория':'Montenegro','Мальта':'Malta','Исландия':'Iceland','Андорра':'Andorra','Монако':'Monaco','Сан-Марино':'San Marino','Ватикан':'Vatican City','Гибралтар':'Gibraltar','Гернси':'Guernsey','Джерси':'Jersey','Остров Мэн':'Isle of Man','Фарерские о-ва':'Faroe Islands','Гренландия':'Greenland','Молдова':'Moldova','Косово':'Kosovo','Шпицберген и Ян-Майен':'Svalbard and Jan Mayen','Остров Вознесения':'Ascension Island','Тристан-да-Кунья':'Tristan da Cunha','Олдерни':'Alderney','Сарк':'Sark',
  'Китай':'China','Индия':'India','Индонезия':'Indonesia','Пакистан':'Pakistan','Бангладеш':'Bangladesh','Япония':'Japan','Филиппины':'Philippines','Вьетнам':'Vietnam','Турция':'Turkey','Иран':'Iran','Таиланд':'Thailand','Мьянма':'Myanmar','Южная Корея':'South Korea','Ирак':'Iraq','Афганистан':'Afghanistan','Саудовская Аравия':'Saudi Arabia','Узбекистан':'Uzbekistan','Малайзия':'Malaysia','Непал':'Nepal','Йемен':'Yemen','КНДР':'North Korea','Шри-Ланка':'Sri Lanka','Сирия':'Syria','Казахстан':'Kazakhstan','Камбоджа':'Cambodia','Иордания':'Jordan','ОАЭ':'UAE','Азербайджан':'Azerbaijan','Таджикистан':'Tajikistan','Израиль':'Israel','Сингапур':'Singapore','Лаос':'Laos','Киргизия':'Kyrgyzstan','Ливан':'Lebanon','Туркменистан':'Turkmenistan','Грузия':'Georgia','Армения':'Armenia','Бутан':'Bhutan','Бруней':'Brunei','Бахрейн':'Bahrain','Кувейт':'Kuwait','Оман':'Oman','Катар':'Qatar','Тайвань':'Taiwan','Восточный Тимор':'East Timor','Мальдивы':'Maldives','Монголия':'Mongolia','Макао':'Macau','Гонконг':'Hong Kong','Британская территория в Индийском океане':'British Indian Ocean Territory',
  'Нигерия':'Nigeria','Эфиопия':'Ethiopia','Египет':'Egypt','ДР Конго':'DR Congo','Танзания':'Tanzania','ЮАР':'South Africa','Кения':'Kenya','Алжир':'Algeria','Судан':'Sudan','Уганда':'Uganda','Марокко':'Morocco','Мозамбик':'Mozambique','Гана':'Ghana','Мадагаскар':'Madagascar','Камерун':'Cameroon','Кот-д\'Ивуар':'Ivory Coast','Нигер':'Niger','Буркина-Фасо':'Burkina Faso','Мали':'Mali','Малави':'Malawi','Замбия':'Zambia','Сомали':'Somalia','Сенегал':'Senegal','Чад':'Chad','Зимбабве':'Zimbabwe','Гвинея':'Guinea','Руанда':'Rwanda','Бенин':'Benin','Тунис':'Tunisia','Ливия':'Libya','Либерия':'Liberia','Мавритания':'Mauritania','Сьерра-Леоне':'Sierra Leone','Гамбия':'Gambia','Ботсвана':'Botswana','Намибия':'Namibia','Габон':'Gabon','Лесото':'Lesotho','Эсватини':'Eswatini','Маврикий':'Mauritius','Эритрея':'Eritrea','Джибути':'Djibouti','Коморы':'Comoros','Кабо-Верде':'Cape Verde','Ангола':'Angola','ЦАР':'Central African Republic','Конго':'Congo','Бурунди':'Burundi','Экваториальная Гвинея':'Equatorial Guinea','Гвинея-Бисау':'Guinea-Bissau','Реюньон':'Réunion','Западная Сахара':'Western Sahara','Остров Святой Елены':'Saint Helena','Того':'Togo','Сан-Томе и Принсипи':'São Tomé and Príncipe','Сейшелы':'Seychelles','Майотта':'Mayotte','Южный Судан':'South Sudan',
  'США':'USA','Бразилия':'Brazil','Мексика':'Mexico','Колумбия':'Colombia','Аргентина':'Argentina','Канада':'Canada','Перу':'Peru','Венесуэла':'Venezuela','Чили':'Chile','Эквадор':'Ecuador','Гватемала':'Guatemala','Боливия':'Bolivia','Куба':'Cuba','Гаити':'Haiti','Доминиканская Республика':'Dominican Republic','Гондурас':'Honduras','Парагвай':'Paraguay','Никарагуа':'Nicaragua','Сальвадор':'El Salvador','Коста-Рика':'Costa Rica','Панама':'Panama','Уругвай':'Uruguay','Ямайка':'Jamaica','Тринидад и Тобаго':'Trinidad and Tobago','Белиз':'Belize','Багамы':'Bahamas','Барбадос':'Barbados','Гренада':'Grenada','Сент-Люсия':'Saint Lucia','Сент-Винсент и Гренадины':'Saint Vincent and the Grenadines','Антигуа и Барбуда':'Antigua and Barbuda','Доминика':'Dominica','Сент-Китс и Невис':'Saint Kitts and Nevis','Гайана':'Guyana','Суринам':'Suriname','Бермуды':'Bermuda','Американское Самоа':'American Samoa','Ангилья':'Anguilla','Аруба':'Aruba','Британские Виргинские о-ва':'British Virgin Islands','Каймановы о-ва':'Cayman Islands','Кюрасао':'Curaçao','Фолклендские о-ва':'Falkland Islands','Гваделупа':'Guadeloupe','Мартиника':'Martinique','Монтсеррат':'Montserrat','Пуэрто-Рико':'Puerto Rico','Синт-Мартен':'Sint Maarten','Теркс и Кайкос':'Turks and Caicos','Виргинские о-ва (США)':'U.S. Virgin Islands','Южная Георгия и Южные Сандвичевы о-ва':'South Georgia and the South Sandwich Islands','Сен-Пьер и Микелон':'Saint Pierre and Miquelon','Сен-Бартелеми':'Saint Barthélemy','Бонайре':'Bonaire','Саба':'Saba','Остров Буве':'Bouvet Island',
  'Австралия':'Australia','Папуа — Новая Гвинея':'Papua New Guinea','Новая Зеландия':'New Zealand','Фиджи':'Fiji','Соломоновы Острова':'Solomon Islands','Вануату':'Vanuatu','Самоа':'Samoa','Кирибати':'Kiribati','Микронезия':'Micronesia','Тонга':'Tonga','Палау':'Palau','Науру':'Nauru','Тувалу':'Tuvalu','Маршалловы Острова':'Marshall Islands','Острова Кука':'Cook Islands','Французская Полинезия':'French Polynesia','Гуам':'Guam','Ниуэ':'Niue','Северные Марианские о-ва':'Northern Mariana Islands','Токелау':'Tokelau','Уоллис и Футуна':'Wallis and Futuna','Остров Норфолк':'Norfolk Island','Остров Рождества':'Christmas Island','Кокосовые острова':'Cocos Islands','Остров Питкерн':'Pitcairn Islands','Острова Мидуэй':'Midway Islands','Остров Уэйк':'Wake Island',
  'Перу/Боливия':'Peru/Bolivia'
};
function getCountryDisplayName(country) {
  if (!country) return '';
  var lang = typeof window !== 'undefined' && window.ZOV_I18N && window.ZOV_I18N.getLang ? window.ZOV_I18N.getLang() : 'ru';
  return (lang === 'en' && COUNTRY_RU_TO_EN[country]) ? COUNTRY_RU_TO_EN[country] : country;
}
if (typeof window !== 'undefined') {
  window.COLLECTIONS = COLLECTIONS;
  window.CAPITALS = CAPITALS;
  window.TOP_POPULOUS_CITIES = TOP_POPULOUS_CITIES;
  window.COUNTRY_TO_CONTINENT = COUNTRY_TO_CONTINENT;
  window.COUNTRY_RU_TO_EN = COUNTRY_RU_TO_EN;
  window.getCountryDisplayName = getCountryDisplayName;
}

const RARITY_TYPES = ['common', 'rare', 'epic', 'legendary', 'inferno', 'collector', 'exclusive'];

function getTypeLabel(type) {
  var t = typeof window !== 'undefined' && window.t;
  if (t) {
    var key = (type || '').toLowerCase();
    if (key === 'city' || key === 'town') return t('city');
    if (key === 'village') return t('village');
    if (key === 'island') return t('island');
    if (key === 'site') return t('site');
    if (key === 'region') return t('region');
    if (key === 'country') return t('country');
    return t('location');
  }
  var labels = { city: 'ГОРОД', town: 'ГОРОД', village: 'СЕЛО', island: 'ОСТРОВ', site: 'МЕСТО', region: 'РЕГИОН', country: 'СТРАНА' };
  return labels[type] || 'ЛОКАЦИЯ';
}

function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h) + s.charCodeAt(i) | 0;
  return Math.abs(h);
}

function getLocationImageUrl(location, width, height) {
  const seed = hashStr((location.name || '') + (location.country || ''));
  var w = width || 400;
  var h = height || 300;
  return 'https://picsum.photos/seed/' + seed + '/' + w + '/' + h;
}

function getLocationPlaceholderDataUri(name) {
  var letter = (name && name[0]) ? name[0].toUpperCase() : '?';
  var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300">' +
    '<rect fill="#1a1a26" width="400" height="300"/>' +
    '<rect x="80" y="100" width="240" height="100" rx="8" fill="#252532"/>' +
    '<text x="200" y="165" fill="#6b7280" text-anchor="middle" font-size="56" font-family="system-ui,sans-serif">' + letter + '</text>' +
    '</svg>';
  return 'data:image/svg+xml,' + encodeURIComponent(svg);
}

/** Случайная редкость по весам типа бокса */
function rollRandomRarity(boxType) {
  const weights = BOX_RARITY_WEIGHTS[boxType];
  const r = Math.random() * 100;
  let cum = 0;
  for (const rarity of RARITY_TYPES) {
    cum += weights[rarity] || 0;
    if (r < cum) return rarity;
  }
  return 'common';
}

// Регионы для Overpass — bbox (south, west, north, east) + страна
const OVERPASS_REGIONS = [
  { country: 'Россия', bbox: [41.2, 19.6, 81.8, 180] },
  { country: 'США', bbox: [24.5, -125, 49.4, -66.9] },
  { country: 'Китай', bbox: [18.2, 73.5, 53.5, 134.8] },
  { country: 'Бразилия', bbox: [-33.5, -73.9, 5.3, -34.8] },
  { country: 'Индия', bbox: [8.0, 68.1, 35.5, 97.4] },
  { country: 'Канада', bbox: [41.7, -141, 83.1, -52.6] },
  { country: 'Австралия', bbox: [-43.6, 113.3, -10.1, 153.6] },
  { country: 'Индонезия', bbox: [-11, 95, 6, 141] },
  { country: 'Мексика', bbox: [14.5, -118.4, 32.7, -86.7] },
  { country: 'Япония', bbox: [24.2, 123, 45.5, 153.9] },
  { country: 'Германия', bbox: [47.3, 5.9, 55.1, 15] },
  { country: 'Франция', bbox: [41.3, -5.1, 51.1, 9.6] },
  { country: 'Великобритания', bbox: [49.9, -8.6, 60.8, 1.8] },
  { country: 'Италия', bbox: [36.6, 6.6, 47.1, 18.5] },
  { country: 'Испания', bbox: [35.9, -9.3, 43.8, 4.3] },
  { country: 'Украина', bbox: [44.4, 22.1, 52.4, 40.2] },
  { country: 'Польша', bbox: [49.0, 14.1, 54.8, 24.2] },
  { country: 'Турция', bbox: [36.0, 26.0, 42.1, 44.8] },
  { country: 'Аргентина', bbox: [-55.1, -73.6, -21.8, -53.6] },
  { country: 'Колумбия', bbox: [-4.2, -79.0, 12.5, -66.9] },
  { country: 'ЮАР', bbox: [-34.8, 16.5, -22.1, 32.9] },
  { country: 'Египет', bbox: [22.0, 24.7, 31.7, 37.0] },
  { country: 'Нигерия', bbox: [4.3, 2.7, 13.9, 14.7] },
  { country: 'Кения', bbox: [-4.7, 33.9, 5.0, 41.9] },
  { country: 'Вьетнам', bbox: [8.2, 102.1, 23.4, 109.5] },
  { country: 'Таиланд', bbox: [5.6, 97.3, 20.5, 105.6] },
  { country: 'Филиппины', bbox: [4.6, 117.0, 21.1, 126.6] },
  { country: 'Пакистан', bbox: [23.7, 60.9, 37.1, 77.0] },
  { country: 'Бангладеш', bbox: [20.7, 88.0, 26.6, 92.7] },
  { country: 'Иран', bbox: [25.1, 44.0, 39.8, 63.3] },
  { country: 'Ирак', bbox: [29.1, 38.8, 37.4, 48.8] },
  { country: 'Саудовская Аравия', bbox: [16.4, 34.5, 32.2, 55.7] },
  { country: 'Казахстан', bbox: [40.6, 46.5, 55.4, 87.4] },
  { country: 'Узбекистан', bbox: [37.2, 56.0, 45.6, 73.1] },
  { country: 'Марокко', bbox: [27.7, -13.2, 35.9, -1.0] },
  { country: 'Алжир', bbox: [18.9, -8.7, 37.1, 11.9] },
  { country: 'Перу', bbox: [-18.4, -81.4, -0.0, -68.7] },
  { country: 'Чили', bbox: [-55.9, -75.6, -17.5, -66.5] },
  { country: 'Эквадор', bbox: [-5.0, -81.1, 1.4, -75.2] },
  { country: 'Венесуэла', bbox: [0.6, -73.4, 12.2, -59.8] },
  { country: 'Швеция', bbox: [55.3, 11.1, 69.1, 24.2] },
  { country: 'Норвегия', bbox: [57.9, 4.6, 71.2, 31.1] },
  { country: 'Финляндия', bbox: [59.8, 20.6, 70.1, 31.6] },
  { country: 'Румыния', bbox: [43.6, 20.3, 48.3, 29.7] },
  { country: 'Чехия', bbox: [48.6, 12.1, 51.0, 18.9] },
  { country: 'Греция', bbox: [34.8, 19.4, 41.8, 29.6] },
  { country: 'Португалия', bbox: [36.9, -9.5, 42.2, -6.2] },
  { country: 'Нидерланды', bbox: [50.8, 3.4, 53.5, 7.2] },
  { country: 'Бельгия', bbox: [49.5, 2.5, 51.5, 6.4] },
  { country: 'Швейцария', bbox: [45.8, 5.9, 47.8, 10.5] },
  { country: 'Австрия', bbox: [46.4, 9.5, 49.0, 17.2] },
  { country: 'Венгрия', bbox: [45.7, 16.1, 48.6, 22.9] },
  { country: 'Болгария', bbox: [41.2, 22.4, 44.2, 28.6] },
  { country: 'Сербия', bbox: [42.2, 18.8, 46.2, 23.0] },
  { country: 'Хорватия', bbox: [42.4, 13.5, 46.6, 19.4] },
  { country: 'Словакия', bbox: [47.7, 16.8, 49.6, 22.6] },
  { country: 'Ирландия', bbox: [51.4, -10.5, 55.4, -6.0] },
  { country: 'Дания', bbox: [54.6, 8.1, 57.8, 15.2] },
  { country: 'Эстония', bbox: [57.5, 21.8, 59.7, 28.2] },
  { country: 'Латвия', bbox: [55.7, 21.0, 58.1, 28.2] },
  { country: 'Литва', bbox: [53.9, 21.0, 56.5, 26.8] },
  { country: 'Беларусь', bbox: [51.3, 23.2, 56.2, 32.8] },
  { country: 'Грузия', bbox: [41.1, 40.0, 43.6, 46.7] },
  { country: 'Армения', bbox: [38.8, 43.4, 41.3, 46.6] },
  { country: 'Азербайджан', bbox: [38.4, 44.8, 41.9, 50.4] },
  { country: 'Монголия', bbox: [41.6, 87.7, 52.2, 119.9] },
  { country: 'Мьянма', bbox: [9.8, 92.2, 28.5, 101.2] },
  { country: 'Камбоджа', bbox: [10.4, 102.3, 14.7, 107.6] },
  { country: 'Лаос', bbox: [13.9, 100.1, 22.5, 107.6] },
  { country: 'Малайзия', bbox: [0.9, 99.6, 7.4, 119.3] },
  { country: 'Сингапур', bbox: [1.2, 103.6, 1.5, 104.1] },
  { country: 'Шри-Ланка', bbox: [5.9, 79.5, 9.9, 82.0] },
  { country: 'Непал', bbox: [26.4, 80.1, 30.4, 88.2] },
  { country: 'Сенегал', bbox: [12.3, -17.5, 16.7, -11.3] },
  { country: 'Гана', bbox: [4.7, -3.3, 11.2, 1.2] },
  { country: 'Кот-д\'Ивуар', bbox: [4.3, -8.6, 10.7, -2.5] },
  { country: 'Танзания', bbox: [-11.7, 29.3, -0.9, 40.4] },
  { country: 'Уганда', bbox: [-1.5, 29.6, 4.2, 35.0] },
  { country: 'Эфиопия', bbox: [3.4, 33.0, 14.9, 47.9] },
  { country: 'Намибия', bbox: [-28.0, 11.7, -16.9, 25.3] },
  { country: 'Зимбабве', bbox: [-22.4, 25.2, -15.6, 33.1] },
  { country: 'Замбия', bbox: [-18.1, 22.0, -8.2, 33.7] },
  { country: 'Мозамбик', bbox: [-26.9, 30.2, -10.5, 40.9] },
  { country: 'Мадагаскар', bbox: [-25.6, 43.2, -11.9, 50.5] },
  { country: 'Куба', bbox: [19.8, -84.9, 23.2, -74.1] },
  { country: 'Доминиканская Республика', bbox: [17.5, -72.0, 19.9, -68.3] },
  { country: 'Гаити', bbox: [18.0, -74.5, 20.1, -71.6] },
  { country: 'Ямайка', bbox: [17.7, -78.4, 18.5, -76.2] },
  { country: 'Коста-Рика', bbox: [8.0, -87.0, 11.2, -82.5] },
  { country: 'Панама', bbox: [7.2, -83.0, 9.6, -77.0] },
  { country: 'Боливия', bbox: [-22.9, -69.6, -9.7, -57.5] },
  { country: 'Парагвай', bbox: [-27.6, -62.6, -19.3, -54.3] },
  { country: 'Уругвай', bbox: [-35.8, -58.5, -30.1, -53.1] },
  { country: 'Новая Зеландия', bbox: [-47.3, 166.4, -34.4, 178.8] },
  { country: 'Исландия', bbox: [63.4, -24.5, 66.5, -13.5] },
  // Остальные страны мира (~170)
  { country: 'Афганистан', bbox: [29.4, 60.5, 38.5, 74.9] },
  { country: 'Албания', bbox: [39.6, 19.3, 42.7, 21.1] },
  { country: 'Андорра', bbox: [42.4, 1.4, 42.7, 1.8] },
  { country: 'Ангола', bbox: [-18.0, 11.7, -4.4, 24.1] },
  { country: 'Антигуа и Барбуда', bbox: [16.9, -61.9, 17.7, -61.6] },
  { country: 'Багамы', bbox: [20.9, -79.0, 26.9, -72.7] },
  { country: 'Бахрейн', bbox: [25.8, 50.4, 26.3, 50.7] },
  { country: 'Барбадос', bbox: [13.0, -59.7, 13.3, -59.4] },
  { country: 'Белиз', bbox: [15.9, -89.2, 18.5, -87.8] },
  { country: 'Бенин', bbox: [6.1, 0.8, 12.4, 3.9] },
  { country: 'Бутан', bbox: [26.7, 88.7, 28.3, 92.1] },
  { country: 'Босния и Герцеговина', bbox: [42.6, 15.7, 45.3, 19.6] },
  { country: 'Ботсвана', bbox: [-26.9, 19.9, -17.8, 29.4] },
  { country: 'Бруней', bbox: [4.0, 114.1, 5.1, 115.4] },
  { country: 'Буркина-Фасо', bbox: [9.4, -5.5, 15.1, 2.4] },
  { country: 'Бурунди', bbox: [-4.5, 29.0, -2.3, 30.8] },
  { country: 'Камерун', bbox: [1.7, 8.5, 13.1, 16.2] },
  { country: 'Кабо-Верде', bbox: [14.8, -25.4, 17.2, -22.7] },
  { country: 'ЦАР', bbox: [2.2, 14.4, 11.0, 27.5] },
  { country: 'Чад', bbox: [7.4, 13.5, 23.5, 24.0] },
  { country: 'Коморы', bbox: [-12.4, 43.2, -11.4, 44.5] },
  { country: 'Конго', bbox: [-5.0, 11.1, 3.7, 18.6] },
  { country: 'ДР Конго', bbox: [-13.5, 12.2, 5.4, 31.3] },
  { country: 'Кипр', bbox: [34.6, 32.3, 35.7, 34.6] },
  { country: 'Джибути', bbox: [10.9, 41.8, 12.7, 43.4] },
  { country: 'Доминика', bbox: [15.2, -61.5, 15.6, -61.2] },
  { country: 'Восточный Тимор', bbox: [-9.5, 124.0, -8.1, 127.3] },
  { country: 'Сальвадор', bbox: [13.2, -90.1, 14.4, -87.7] },
  { country: 'Экваториальная Гвинея', bbox: [-1.5, 9.3, 2.3, 11.4] },
  { country: 'Эритрея', bbox: [12.4, 36.4, 18.0, 43.1] },
  { country: 'Эсватини', bbox: [-27.3, 30.8, -25.8, 32.1] },
  { country: 'Фиджи', bbox: [-21.0, 177.0, -12.5, -178.0] },
  { country: 'Габон', bbox: [-3.9, 8.7, 2.3, 14.5] },
  { country: 'Гамбия', bbox: [13.1, -16.8, 13.8, -13.8] },
  { country: 'Гренада', bbox: [11.9, -61.8, 12.3, -61.4] },
  { country: 'Гвинея', bbox: [7.2, -15.1, 12.7, -7.6] },
  { country: 'Гвинея-Бисау', bbox: [11.0, -16.7, 12.7, -13.6] },
  { country: 'Гайана', bbox: [1.2, -61.4, 8.6, -56.5] },
  { country: 'Гондурас', bbox: [12.9, -89.4, 16.1, -83.1] },
  { country: 'Иордания', bbox: [29.2, 34.9, 33.4, 39.3] },
  { country: 'Кирибати', bbox: [-4.7, -174.5, 4.7, -169.5] },
  { country: 'Киргизия', bbox: [39.2, 69.3, 43.3, 80.3] },
  { country: 'Кувейт', bbox: [28.5, 46.5, 30.1, 48.4] },
  { country: 'Ливан', bbox: [33.1, 35.1, 34.7, 36.6] },
  { country: 'Лесото', bbox: [-30.7, 27.0, -28.6, 29.5] },
  { country: 'Либерия', bbox: [4.2, -11.6, 8.6, -7.4] },
  { country: 'Ливия', bbox: [19.5, 9.3, 33.2, 25.2] },
  { country: 'Люксембург', bbox: [49.4, 5.7, 50.2, 6.5] },
  { country: 'Мальдивы', bbox: [-0.7, 72.7, 7.1, 73.7] },
  { country: 'Мали', bbox: [10.2, -12.2, 25.0, 4.3] },
  { country: 'Мальта', bbox: [35.8, 14.2, 36.1, 14.6] },
  { country: 'Маршалловы Острова', bbox: [4.6, 160.8, 14.6, 172.0] },
  { country: 'Мавритания', bbox: [14.7, -17.1, 27.3, -4.8] },
  { country: 'Маврикий', bbox: [-20.5, 57.3, -19.7, 57.8] },
  { country: 'Микронезия', bbox: [1.0, 137.2, 10.1, 163.0] },
  { country: 'Молдова', bbox: [45.5, 26.6, 48.5, 30.2] },
  { country: 'Монако', bbox: [43.7, 7.4, 43.8, 7.5] },
  { country: 'Черногория', bbox: [41.8, 18.4, 43.6, 20.4] },
  { country: 'Науру', bbox: [-0.5, 166.9, -0.5, 166.9] },
  { country: 'Никарагуа', bbox: [10.7, -87.7, 15.0, -83.1] },
  { country: 'Нигер', bbox: [11.7, 0.2, 23.5, 16.0] },
  { country: 'КНДР', bbox: [37.7, 124.3, 43.0, 130.9] },
  { country: 'Северная Македония', bbox: [40.9, 20.5, 42.4, 23.0] },
  { country: 'Оман', bbox: [16.6, 52.0, 26.4, 60.0] },
  { country: 'Палау', bbox: [2.8, 131.1, 8.2, 134.7] },
  { country: 'Папуа — Новая Гвинея', bbox: [-11.7, 140.8, -1.0, 156.0] },
  { country: 'Катар', bbox: [24.5, 50.7, 26.2, 51.6] },
  { country: 'Руанда', bbox: [-2.8, 28.9, -1.0, 30.9] },
  { country: 'Сент-Китс и Невис', bbox: [17.1, -62.9, 17.4, -62.5] },
  { country: 'Сент-Люсия', bbox: [13.7, -61.1, 14.1, -60.9] },
  { country: 'Сент-Винсент и Гренадины', bbox: [12.5, -61.5, 13.4, -61.1] },
  { country: 'Самоа', bbox: [-14.1, -172.8, -13.4, -171.4] },
  { country: 'Сан-Марино', bbox: [43.9, 12.4, 43.99, 12.5] },
  { country: 'Сьерра-Леоне', bbox: [6.9, -13.3, 10.0, -10.3] },
  { country: 'Словения', bbox: [45.4, 13.4, 46.9, 16.6] },
  { country: 'Соломоновы Острова', bbox: [-12.3, 155.5, -5.0, 170.2] },
  { country: 'Сомали', bbox: [-1.7, 41.0, 11.9, 51.4] },
  { country: 'Южная Корея', bbox: [33.1, 125.1, 38.6, 131.9] },
  { country: 'Южный Судан', bbox: [3.5, 24.1, 12.2, 35.9] },
  { country: 'Судан', bbox: [3.5, 21.8, 22.2, 38.6] },
  { country: 'Суринам', bbox: [1.8, -58.1, 6.0, -53.9] },
  { country: 'Сирия', bbox: [32.3, 35.7, 37.3, 42.4] },
  { country: 'Таджикистан', bbox: [36.7, 67.3, 41.0, 75.2] },
  { country: 'Тайвань', bbox: [21.9, 120.0, 25.3, 122.0] },
  { country: 'Того', bbox: [6.1, -0.2, 11.1, 1.8] },
  { country: 'Тонга', bbox: [-22.4, -176.2, -15.5, -173.7] },
  { country: 'Тринидад и Тобаго', bbox: [10.0, -62.0, 11.4, -60.5] },
  { country: 'Тунис', bbox: [30.2, 7.5, 37.5, 11.6] },
  { country: 'Туркменистан', bbox: [35.1, 52.4, 42.5, 66.7] },
  { country: 'Тувалу', bbox: [-10.8, 176.0, -5.7, 179.9] },
  { country: 'Ватикан', bbox: [41.9, 12.4, 41.9, 12.5] },
  { country: 'Йемен', bbox: [12.6, 42.5, 19.0, 54.5] },
  { country: 'ОАЭ', bbox: [22.6, 51.6, 26.1, 56.4] },
  { country: 'Американское Самоа', bbox: [-14.4, -170.9, -14.1, -169.4] },
  { country: 'Ангилья', bbox: [18.2, -63.2, 18.3, -62.9] },
  { country: 'Аруба', bbox: [12.4, -70.1, 12.6, -69.9] },
  { country: 'Бермуды', bbox: [32.2, -64.9, 32.4, -64.6] },
  { country: 'Британские Виргинские о-ва', bbox: [18.3, -64.7, 18.8, -64.3] },
  { country: 'Каймановы о-ва', bbox: [19.3, -81.4, 19.8, -79.7] },
  { country: 'Острова Кука', bbox: [-22.0, -160.3, -8.9, -157.1] },
  { country: 'Кюрасао', bbox: [12.0, -69.2, 12.4, -68.7] },
  { country: 'Фолклендские о-ва', bbox: [-52.4, -61.5, -51.2, -57.7] },
  { country: 'Фарерские о-ва', bbox: [61.4, -7.6, 62.4, -6.3] },
  { country: 'Французская Полинезия', bbox: [-28.0, -156.5, -5.0, -134.9] },
  { country: 'Гибралтар', bbox: [36.1, -5.4, 36.2, -5.3] },
  { country: 'Гренландия', bbox: [59.8, -73.0, 83.6, -11.3] },
  { country: 'Гуам', bbox: [13.2, 144.6, 13.7, 145.0] },
  { country: 'Гернси', bbox: [49.4, -2.7, 49.5, -2.5] },
  { country: 'Остров Мэн', bbox: [54.0, -4.8, 54.4, -4.3] },
  { country: 'Джерси', bbox: [49.2, -2.3, 49.3, -2.0] },
  { country: 'Монтсеррат', bbox: [16.7, -62.3, 16.8, -62.1] },
  { country: 'Ниуэ', bbox: [-19.1, -170.0, -18.9, -169.8] },
  { country: 'Северные Марианские о-ва', bbox: [14.1, 145.1, 20.6, 146.1] },
  { country: 'Пуэрто-Рико', bbox: [17.9, -67.3, 18.5, -65.2] },
  { country: 'Реюньон', bbox: [-21.4, 55.2, -20.9, 55.8] },
  { country: 'Остров Святой Елены', bbox: [-16.0, -5.8, -15.9, -5.6] },
  { country: 'Синт-Мартен', bbox: [18.0, -63.2, 18.1, -62.9] },
  { country: 'Токелау', bbox: [-9.4, -172.5, -8.5, -171.2] },
  { country: 'Теркс и Кайкос', bbox: [21.3, -72.5, 21.9, -71.1] },
  { country: 'Виргинские о-ва (США)', bbox: [17.7, -65.1, 18.4, -64.6] },
  { country: 'Уоллис и Футуна', bbox: [-14.4, -178.2, -13.2, -176.1] },
  { country: 'Западная Сахара', bbox: [20.8, -17.1, 27.7, -8.7] },
];

/** Overpass API — получить населённые пункты в регионе (сотни тысяч по миру) */
function getLocationsFromOverpass(count) {
  var region = OVERPASS_REGIONS[Math.floor(Math.random() * OVERPASS_REGIONS.length)];
  var s = region.bbox[0], w = region.bbox[1], n = region.bbox[2], e = region.bbox[3];
  var query = '[out:json][timeout:10];node["place"~"city|town|village|hamlet|suburb|locality|isolated_dwelling"](' + s + ',' + w + ',' + n + ',' + e + ');out body;';
  return fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'data=' + encodeURIComponent(query),
  })
    .then(function (r) { return r.json(); })
    .then(function (data) {
      var elements = (data && data.elements) || [];
      var places = [];
      for (var i = 0; i < elements.length; i++) {
        var el = elements[i];
        var tags = el.tags || {};
        var name = tags.name || tags['name:ru'] || tags['name:en'] || '';
        if (!name || name.length < 2) continue;
        var p = (tags.place || 'city').toLowerCase();
        var type = (p === 'village' || p === 'hamlet' || p === 'isolated_dwelling') ? 'village' : (p === 'town' || p === 'suburb' || p === 'locality') ? 'town' : 'city';
        places.push({ name: name, country: region.country, type: type });
      }
      if (places.length === 0) return null;
      var out = [];
      for (var j = 0; j < count; j++) {
        out.push(places[Math.floor(Math.random() * places.length)]);
      }
      return out;
    })
    .catch(function () { return null; });
}

/** Nominatim — случайная точка, reverse geocode (океан = retry) */
function getRandomLocationFromMap() {
  function tryOnce() {
    var lat = (Math.random() * 140 - 70).toFixed(4);
    var lon = (Math.random() * 340 - 170).toFixed(4);
    var url = 'https://nominatim.openstreetmap.org/reverse?format=json&lat=' + lat + '&lon=' + lon + '&zoom=14&addressdetails=1';
    return fetch(url, { headers: { 'Accept-Language': 'ru,en', 'User-Agent': 'ZOV/1.0' } })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (!data || !data.display_name) return null;
        var addr = data.address || {};
        var country = addr.country || data.display_name.split(',').pop().trim() || 'Неизвестно';
        var name = addr.village || addr.town || addr.city || addr.municipality || addr.state || addr.road || '';
        if (!name) {
          var parts = data.display_name.split(',');
          name = parts[0] ? parts[0].trim() : data.display_name;
        }
        var type = addr.village ? 'village' : addr.town ? 'town' : addr.city ? 'city' : 'city';
        return { name: name, country: country, type: type };
      });
  }
  return tryOnce().then(function (r) {
    if (r && r.name) return r;
    return tryOnce().then(function (r2) { return r2 || null; });
  }).catch(function () { return null; });
}

/** Расширенный список: LOCATIONS + столицы + топ-города + locations.json (если загружен) */
function getExtendedLocationsList() {
  if (window._extendedLocationsCache) return window._extendedLocationsCache;
  var list = LOCATIONS.slice();
  if (typeof CAPITALS !== 'undefined') {
    CAPITALS.forEach(function (s) {
      var p = s.split('|');
      if (p.length >= 2) list.push({ name: p[0].trim(), country: p[1].trim(), type: 'city' });
    });
  }
  if (typeof TOP_POPULOUS_CITIES !== 'undefined') {
    TOP_POPULOUS_CITIES.forEach(function (s) {
      var p = s.split('|');
      if (p.length >= 2) list.push({ name: p[0].trim(), country: p[1].trim(), type: 'city' });
    });
  }
  if (window._locationsJsonData && Array.isArray(window._locationsJsonData)) {
    window._locationsJsonData.forEach(function (entry) {
      var name = entry[0] || entry.name;
      var country = entry[1] || entry.country;
      var type = entry[2] || entry.type || 'city';
      if (name && country) list.push({ name: String(name), country: String(country), type: type });
    });
  }
  window._extendedLocationsCache = list;
  return list;
}

/** Загрузить locations.json (десятки тысяч городов) — опционально, в фоне */
function loadLocationsJson() {
  if (window._locationsJsonLoaded) return Promise.resolve();
  var url = typeof window !== 'undefined' ? new URL('locations.json', window.location.href).href : 'locations.json';
  return fetch(url).then(function (r) { return r.ok ? r.json() : null; }).then(function (data) {
    if (data && Array.isArray(data) && data.length > 0) {
      window._locationsJsonData = data;
      window._extendedLocationsCache = null;
      window._locationsJsonLoaded = true;
    }
  }).catch(function () {});
}

/** Случайная локация из расширенного списка (мгновенно, без API) */
function getRandomLocationFromList(boxType) {
  var list = getExtendedLocationsList();
  var rarity = rollRandomRarity(boxType);
  var loc = list[Math.floor(Math.random() * list.length)];
  return {
    name: loc.name,
    country: loc.country,
    type: loc.type || 'city',
    rarity: rarity,
    typeLabel: getTypeLabel(loc.type || 'city'),
  };
}

/** Взять случайную локацию из списка и присвоить случайную редкость */
function pickRandomLocation(boxType) {
  return getRandomLocationFromList(boxType);
}

if (typeof window !== 'undefined' && typeof loadLocationsJson === 'function') {
  loadLocationsJson();
}
