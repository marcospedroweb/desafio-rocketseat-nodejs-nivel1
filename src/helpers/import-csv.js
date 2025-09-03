import fs from 'node:fs';
import { parse } from 'csv-parse';
const tasksBackup = new URL('../../tasks-backup.csv', import.meta.url);

const processFile = async () => {
  const records = [];
  const tasks = [];
  const parser = fs.createReadStream(tasksBackup).pipe(parse({}));

  for await (const record of parser) {
    records.push(record);
  }
  records.forEach((record, index) => {
    if (index > 0) {
      tasks.push({
        title: record[0],
        description: record[1],
      });
    }
  });
  return tasks;
};

export default processFile;
