/* store.mjs — хранилище базы компаний.

   Почему не SQLite. Пользователь один, записей десятки тысяч, запросы —
   фильтрация по нескольким полям. Всё это помещается в память с запасом:
   10 000 компаний занимают около 20 МБ. База целиком лежит в одном файле
   NDJSON — строка на компанию. Такой файл читается глазами, чинится обычным
   текстовым редактором, копируется бэкапом как есть и не требует ни
   нативных модулей, ни npm install на сервере.

   Граница, за которой это перестанет работать, — примерно полмиллиона
   записей. До неё ещё очень далеко, а когда приблизимся, менять придётся
   только этот файл: остальной код ходит сюда через функции, а не в массив.

   Запись атомарная: пишем во временный файл и переименовываем. Переименование
   внутри одной файловой системы — атомарная операция, поэтому оборванная
   запись не оставит обрезанной базы. */
import { readFileSync, writeFileSync, renameSync, existsSync, mkdirSync, copyFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const STATUSES = ['new', 'work', 'meeting', 'deal', 'refused', 'dead'];

export const STATUS_LABELS = {
  new: 'Не трогали',
  work: 'В работе',
  meeting: 'Встреча',
  deal: 'Сделка',
  refused: 'Отказ',
  dead: 'Не существует',
};

export class Store {
  constructor(file) {
    this.file = file;
    this.rows = [];
    this.byId = new Map();
    /* Индекс по ключу дедупликации. Нужен на импорте: он идёт пачками по
       тысячам строк, и без индекса каждая новая строка сравнивалась бы со
       всеми уже загруженными — это квадрат и минуты ожидания. */
    this.byKey = new Map();
    this.dirty = false;
    this.load();
  }

  load() {
    if (!existsSync(this.file)) {
      mkdirSync(dirname(this.file), { recursive: true });
      writeFileSync(this.file, '');
      return;
    }
    const text = readFileSync(this.file, 'utf8');
    let bad = 0;
    for (const line of text.split('\n')) {
      if (!line.trim()) continue;
      try {
        const r = JSON.parse(line);
        this.rows.push(r);
        this.byId.set(r.id, r);
        if (r.key) this.byKey.set(r.key, r);
      } catch {
        /* Битую строку пропускаем, а не валим загрузку: одна испорченная
           запись не должна стоить доступа ко всей базе. */
        bad++;
      }
    }
    if (bad) console.warn(`store: пропущено битых строк: ${bad}`);
  }

  save() {
    if (!this.dirty) return;
    const tmp = this.file + '.tmp';
    writeFileSync(tmp, this.rows.map((r) => JSON.stringify(r)).join('\n') + '\n');
    renameSync(tmp, this.file);
    this.dirty = false;
  }

  /* Копия базы с отметкой времени. Вызывается перед импортом и перед
     массовыми изменениями — то есть ровно там, где легче всего испортить
     данные одним неверным маппингом колонок. */
  backup() {
    if (!existsSync(this.file)) return null;
    const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const dir = join(dirname(this.file), 'backups');
    mkdirSync(dir, { recursive: true });
    const dst = join(dir, `base-${stamp}.ndjson`);
    copyFileSync(this.file, dst);
    return dst;
  }

  get(id) { return this.byId.get(id); }
  all() { return this.rows; }
  size() { return this.rows.length; }

  add(row) {
    this.rows.push(row);
    this.byId.set(row.id, row);
    if (row.key) this.byKey.set(row.key, row);
    this.dirty = true;
    return row;
  }

  findByKey(key) { return this.byKey.get(key); }

  update(id, patch) {
    const r = this.byId.get(id);
    if (!r) return null;
    Object.assign(r, patch);
    this.dirty = true;
    return r;
  }

  touch() { this.dirty = true; }
}

export { STATUSES };
