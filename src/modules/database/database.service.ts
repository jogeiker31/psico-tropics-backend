import { Injectable } from '@nestjs/common';
import { exec } from 'child_process';
import * as path from 'path';

@Injectable()
export class DatabaseService {
  async backupDatabase(): Promise<string> {
    return new Promise((resolve, reject) => {
      const backupPath = path.join(__dirname, '../../../backups/');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFile = `backup-${timestamp}.gz`;

      const command = `mongodump --uri="mongodb://localhost:27017/psico-tropics" --archive=${backupPath}${backupFile} --gzip`;

      exec(command, (error) => {
        if (error) {
          reject(`Error al exportar la base de datos: ${error.message}`);
        } else {
          resolve(`${backupPath}${backupFile}`);
        }
      });
    });
  }

  async restoreDatabase(filename: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const backupPath = path.join(__dirname, '../../../backups/', filename);

      const command = `mongorestore --uri="mongodb://localhost:27017/psico-tropics" --archive=${backupPath} --gzip --drop`;

      exec(command, (error) => {
        console.log(error);
        if (error) {
          reject(`Error al restaurar la base de datos: ${error.message}`);
        } else {
          resolve(`Base de datos restaurada desde: ${backupPath}`);
        }
      });
    });
  }
}
