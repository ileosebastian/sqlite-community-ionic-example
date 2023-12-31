import { Injectable, WritableSignal, inject, signal } from '@angular/core';
import { SQLiteCommunityService } from './sqlite-community.service';
import { SQLiteDBConnection } from '@capacitor-community/sqlite';
import { v4 as uuidv4 } from 'uuid';
import { PlaneParsed, Sample, User } from '../models/models';

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

    // DROP TABLE IF EXISTS plane; 
    const createPlane = `
          CREATE TABLE IF NOT EXISTS plane (
            id TEXT PRIMARY KEY,
            columns INTEGER NOT NULL,
            rows INTEGER NOT NULL,
            widthTiles INTEGER NOT NULL,
            heightTiles INTEGER NOT NULL,
            stage TEXT NOT NULL,
            uuid TEXT NOT NULL,
            floor INTEGER NOT NULL,
            waypoints TEXT NOT NULL,
            buildingId TEXT NOT NULL,
            published INTEGER DEFAULT 1
          );
    `;

    await this.db.execute(schema);
    await this.db.execute(createPlane);
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

  async saveAndShowJSONObject() {
    if (this.db) {
      try {

        await this.db.open();

        await this.db.query(`DELETE FROM plane;`);

        const sampleObj: Sample = { name: 'leo', love: 'Aki' };

        const plane: PlaneParsed = {
          id: uuidv4(),
          columns: 30,
          rows: 40,
          widthTiles: 3,
          heightTiles: 4,
          stage: JSON.stringify(sampleObj),
          uuid: "X-X-X-X-X",
          floor: 1,
          waypoints: '{}',
          buildingId: 'X-X-X-X-X',
          published: false
        };

        const query = `
          INSERT INTO plane (id, columns, rows, widthTiles, heightTiles, stage, uuid, floor, waypoints, buildingId, published)
          VALUES ('${plane.id}', 
            ${plane.columns},
            ${plane.rows},
            ${plane.widthTiles},
            ${plane.heightTiles},
            '${plane.stage}',
            '${plane.uuid}',
            ${plane.floor},
            '${plane.waypoints}', '${plane.buildingId}', ${plane.published ? 1 : 0});
        `;

        await this.db.query(query);

        const planes = await this.db.query(`SELECT * FROM plane;`);

        console.log("PLANOS:", planes.values);

        await this.db.close();

        return planes.values ? planes.values[0] as PlaneParsed : null;
      } catch (error) {
        console.error(error);
        return null;
      }
    }
    return null;
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
