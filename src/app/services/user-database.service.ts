import { Injectable, WritableSignal, inject, signal } from '@angular/core';
import { SQLiteCommunityService } from './sqlite-community.service';
import { SQLiteDBConnection } from '@capacitor-community/sqlite';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../models/models';

const DB_USERS = 'userdb';

@Injectable({
  providedIn: 'root'
})
export class UserDatabaseService {

  private users: WritableSignal<User[]> = signal<User[]>([]);
  private progress: WritableSignal<number> = signal<number>(0);

  private _sqlite = inject(SQLiteCommunityService);
  private db!: SQLiteDBConnection;

  constructor() { }

  async initUserDataBase() {
    const ret = await this._sqlite.checkConnectionsConsistency();
    const isConn = (await this._sqlite.isConnection(DB_USERS)).result;
    let db: SQLiteDBConnection;
    if (ret.result && isConn) {
      db = await this._sqlite.retrieveConnection(DB_USERS);
    } else {
      db = await this._sqlite.createConnection(DB_USERS, false, "no-encryption", 1);
    }
    this.db = db;

    // DROP TABLE IF EXISTS users;
    await this.db.open();
    const schema = `
          CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            active INTEGER DEFAULT 1
          );
    `;

    await this.db.execute(schema);
    await this.db.close();

    await this.loadUsers();
  }

  async endUserDataBase() {
    await this._sqlite.closeConnection(DB_USERS);
  }

  getUsers() {
    return this.users;
  }

  getProgress() {
    return this.progress;
  }

  async loadUsers() {
    await this.db.open();
    const users = await this.db.query('SELECT * FROM users');
    await this.db.close();

    this.users.set(users.values || []);
  }

  async insertMassiveDataUsers(users: User[]) {
    try {
      if (this.db) {
        const firstQuartile = Math.floor((users.length - 1) / 4);
        const secondQuartile = Math.floor((users.length - 1) / 2);
        const thirdQuartile = firstQuartile + secondQuartile;
        const endQuartile = users.length - 1;

        await this.db.open();

        const isAnActiveTrans = await this.db.isTransactionActive();

        if (!isAnActiveTrans.result) {
          try {
            this.progress.set(0);
            await this.db.execute("BEGIN TRANSACTION;", false);

            for (const user of users.slice(0, firstQuartile)) {
              const statement = `INSERT INTO users (id, name) VALUES ('${user.id}', '${user.name}');`;
              const res = await this.db.run(statement, [], false, 'no');

              if (res.changes?.changes && res.changes?.changes < 0) {
                throw new Error('error trans');
              }
            }
            this.progress.set(0.25);

            for (const user of users.slice(firstQuartile, secondQuartile)) {
              const statement = `INSERT INTO users (id, name) VALUES ('${user.id}', '${user.name}');`;
              const res = await this.db.run(statement, [], false, 'no');

              if (res.changes?.changes && res.changes?.changes < 0) {
                throw new Error('error trans');
              }
            }
            this.progress.set(0.50);

            for (const user of users.slice(secondQuartile, thirdQuartile)) {
              // const query = `INSERT INTO users (id, name) VALUES ('${user.id}', '${user.name}');`;
              // await this.db.query(query);
              const statement = `INSERT INTO users (id, name) VALUES ('${user.id}', '${user.name}');`;
              const res = await this.db.run(statement, [], false, 'no');

              if (res.changes?.changes && res.changes?.changes < 0) {
                throw new Error('error trans');
              }
            }
            this.progress.set(0.75);

            for (const user of users.splice(thirdQuartile, endQuartile)) {
              const statement = `INSERT INTO users (id, name) VALUES ('${user.id}', '${user.name}');`;
              const res = await this.db.run(statement, [], false, 'no');

              if (res.changes?.changes && res.changes?.changes < 0) {
                throw new Error('error trans');
              }
            }
            this.progress.set(1);

            console.log("va a terminar...")
            await this.db.execute("COMMIT TRANSACTION;", false);
          } catch (err) {
            console.error("Dentro de la transaccion insertion;", err);

            if (!(await this.isOpenConnection()))
              await this.db.open();

            await this.db.execute("ROLLBACK TRANSACTION;", false);
          }
        }

        await this.db.close();
        return;
      }
    } catch (error) {
      console.error("Error general del insertion", error);
    }
  }

  async cancelMassiveInsertionDataUsers() {
    try {
      if (this.db) {
        if ((await this.isOpenConnection()))
          await this.db.close();
        else
          throw new Error("No open data when call cancel process.");
        return;
      }
    } catch (error) {
      console.error("Error en cancel massive insetion:", error);
    }
  }

  private async isOpenConnection() {
    const isOpen = await this.db.isDBOpen();
    return isOpen.result;
  }

  async addUser(name: string) {
    const uuid = uuidv4();
    const query = `INSERT INTO users (id, name) VALUES('${uuid}', '${name}')`;
    await this.db.open();
    const result = await this.db.query(query);
    await this.db.close();

    this.loadUsers();

    return result;
  }

  async updateUserById(id: string, active: number) {
    const query = `UPDATE users SET active=${active} WHERE id='${id}'`;
    await this.db.open();
    const result = await this.db.query(query);
    await this.db.close();

    this.loadUsers();

    return result;
  }

  async deleteUserById(id: string) {
    const query = `DELETE FROM users WHERE id='${id}'`;
    await this.db.open();
    const result = await this.db.query(query);
    await this.db.close();

    this.loadUsers();

    return result;
  }

}
