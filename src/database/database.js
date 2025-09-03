//file system, com promisses; o "fs" padrão é mais antigo utilizando callbacks
import fs from 'node:fs/promises';
import { formatDate } from '../utils/formatDate.js';

// [import.meta.url] traz a rota completa que este arquivo está
const databasePath = new URL('../db.json', import.meta.url);

export class Database {
  #database = {};

  constructor() {
    //Faz a leitura do DB file, se houver dado add ao database local se não apenas salva
    fs.readFile(databasePath, 'utf-8')
      .then((data) => (this.#database = JSON.parse(data)))
      .catch(() => this.#persist());
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
