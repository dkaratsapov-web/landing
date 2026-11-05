/* max-whoami.mjs — проверка токена MAX и поиск своего user_id.

   Нужен ровно один раз, при настройке доставки заявок. Отдельного метода
   «верни мой идентификатор» в API MAX нет: user_id приходит только внутри
   событий. Поэтому порядок такой — написать боту «/start» в MAX, а потом
   запустить это.

   Запуск на сервере, где лежит токен:
     LEAD_MAX_TOKEN=... node tools/max-whoami.mjs
   либо токеном аргументом:
     node tools/max-whoami.mjs <токен>

   Скрипт только читает: ничего никому не отправляет и ничего не меняет.

   ОСТОРОЖНО, если у бота уже есть работающий бэкенд. Когда тот сидит на
   long polling, события выдаются по одному разу: этот скрипт заберёт часть
   обновлений себе, и живой бот их не увидит — пропустит команды. Если бот
   уже кому-то отвечает, идентификатор проще спросить у него самого
   (многие боты умеют /id) или посмотреть в его собственном журнале, а этот
   скрипт не запускать. С вебхуком конфликта нет: там события уходят на
   указанный адрес и /updates ничего не отдаёт. */

const API = process.env.LEAD_MAX_API || 'https://platform-api2.max.ru';
const token = process.argv[2] || process.env.LEAD_MAX_TOKEN || '';

if (!token) {
  console.error('Не задан токен. LEAD_MAX_TOKEN=... node tools/max-whoami.mjs');
  process.exit(1);
}
/* Заголовки HTTP передаются в latin1: один кириллический символ, случайно
   прилипший при копировании, роняет запрос до отправки. */
if (!/^[\x20-\x7e]+$/.test(token)) {
  console.error('В токене есть символы вне латиницы — скорее всего, скопировалось лишнее.');
  process.exit(1);
}

const call = async (path) => {
  const r = await fetch(API + path, {
    headers: { authorization: token },
    signal: AbortSignal.timeout(15000),
  });
  const text = await r.text();
  let data = {};
  try { data = JSON.parse(text); } catch { /* вернулся не JSON */ }
  return { status: r.status, data, text };
};

try {
  const me = await call('/me');
  if (me.status === 401) {
    console.error('Токен не принят (401). Скопируйте его заново: business.max.ru → '
      + 'Чат-боты → ⋮ → Настройки → значок копирования у поля с токеном.');
    process.exit(1);
  }
  if (me.status !== 200) {
    console.error(`MAX ответил ${me.status}: ${me.text.slice(0, 300)}`);
    process.exit(1);
  }
  const b = me.data || {};
  console.log('Бот:', b.name || b.first_name || '—', b.username ? '@' + b.username : '');
  console.log('user_id бота:', b.user_id ?? '—', '(это НЕ то, что нужно в LEAD_MAX_USER_ID)');

  const up = await call('/updates?limit=100');
  if (up.status !== 200) {
    console.error(`\nНе удалось получить события: ${up.status} ${up.text.slice(0, 200)}`);
    process.exit(1);
  }

  /* Отправитель может лежать в разных полях в зависимости от типа события,
     поэтому собираем всех, кого встретили, и показываем списком. */
  const seen = new Map();
  for (const u of up.data.updates || []) {
    for (const who of [u.user, u.sender, u.message?.sender, u.callback?.user]) {
      if (who && who.user_id) {
        seen.set(who.user_id, [who.first_name, who.last_name].filter(Boolean).join(' ')
          || who.name || who.username || '');
      }
    }
  }

  if (!seen.size) {
    console.log('\nСобытий с отправителем нет.');
    console.log('Напишите боту «/start» в MAX и запустите этот скрипт ещё раз.');
    console.log('Если бот уже отвечал раньше: события хранятся ограниченное время,');
    console.log('так что напишите ему заново.');
    process.exit(0);
  }

  console.log('\nКто писал боту:');
  for (const [id, name] of seen) console.log(`  ${id}  ${name}`);
  const [first] = [...seen.keys()];
  console.log('\nЕсли писали только вы, в /etc/crm.env нужно:');
  console.log(`  LEAD_MAX_USER_ID=${first}`);
} catch (e) {
  const msg = String(e.message || e);
  console.error('Запрос не прошёл:', msg);
  if (/certificate|self-signed|unable to verify/i.test(msg)) {
    console.error('\nПохоже на сертификат: у platform-api2.max.ru корень российского УЦ,');
    console.error('которого нет в наборе Node. Поставьте корневой сертификат Минцифры и');
    console.error('укажите на него: NODE_EXTRA_CA_CERTS=/путь/до/russian_trusted_root_ca.crt');
  }
  process.exit(1);
}
