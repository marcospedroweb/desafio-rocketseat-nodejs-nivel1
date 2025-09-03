//file system, com promisses; o "fs" padrão é mais antigo utilizando callbacks
import fs from 'node:fs/promises';
import { formatDate } from '../utils/formatDate.js';
import { randomUUID } from 'node:crypto';
import processFile from '../helpers/import-csv.js';

// [import.meta.url] traz a rota completa que este arquivo está
const databasePath = new URL('../db.json', import.meta.url);

export class Database {
  #database = {};
  ready;

  constructor() {
    this.ready = this.init();
  }

  async init() {
    fs.readFile(databasePath, 'utf-8')
      .then((data) => {
        this.#database = JSON.parse(data);
      })
      .catch(() => {
        this.#persist();
      });

    try {
      const tasksBackup = await processFile();

      if (Array.isArray(tasksBackup) && tasksBackup.length) {
        this.#database.tasks = this.#database.tasks ?? [];

        for (const task of tasksBackup) {
          this.#database.tasks.push({
            id: randomUUID(),
            title: task.title,
            description: task.description,
            completed_at: null,
            created_at: Date.now(),
            updated_at: null,
          });
        }

        this.#persist();
      }
    } catch (err) {
      console.error('Erro ao processar backup:', err);
    }
  }

  #persist() {
    // salva o database no arquivo DB
    fs.writeFile(databasePath, JSON.stringify(this.#database));
  }

  select(table) {
    const tasks = this.#database[table] ?? [];

    if (tasks.length) {
      const tasksFormated = tasks.map((task) => {
        return {
          ...task,
          completed_at: formatDate(task.completed_at),
          created_at: formatDate(task.created_at),
          updated_at: formatDate(task.updated_at),
        };
      });
      return tasksFormated;
    }

    return tasks;
  }

  insert(table, data) {
    if (Array.isArray(this.#database[table])) {
      this.#database[table].push(data);
    } else {
      this.#database[table] = [data];
    }

    this.#persist();
    return data;
  }

  update(table, id, data) {
    const rowIndex = this.#database[table].findIndex((row) => row.id === id);

    if (rowIndex > -1) {
      const task = tasks[rowIndex];

      Object.keys(task).forEach((key) => {
        if (data[key] !== undefined) {
          task[key] = data[key];
        }
      });
      task.updated_at = Date.now();
    }

    this.#persist();
  }

  complete(table, id) {
    const rowIndex = this.#database[table].findIndex((row) => row.id === id);

    if (rowIndex > -1) {
      const task = this.#database[table][rowIndex];
      task.completed_at = task.completed_at ? null : Date.now();

      this.#persist();
    }
  }

  delete(table, id) {
    const rowIndex = this.#database[table].findIndex((row) => row.id === id);

    if (rowIndex > -1) {
      this.#database[table].splice(rowIndex, 1);
      this.#persist();
    }
  }
}
