import { Injectable, WritableSignal, inject, signal } from '@angular/core';
import { SQLiteCommunityService } from './sqlite-community.service';
import { SQLiteDBConnection } from '@capacitor-community/sqlite';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../models/models';
import { USERS } from '../mock/data';
import { states } from '../models/types';

const DB_USERS = 'userdb';

@Injectable({
  providedIn: 'root'
})
export class UserDatabaseService {

  private users: WritableSignal<User[]> = signal<User[]>([]);

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

  async loadUsers() {
    await this.db.open();
    const users = await this.db.query('SELECT * FROM users');
    await this.db.close();

    this.users.set(users.values || []);
  }

  async insertMassiveDataUsers(users: User[]) {
    try {
      if (this.db) {
        await this.db.open();
    
        const isAnActiveTrans = await this.db.isTransactionActive();

        if (!isAnActiveTrans.result) {
          try {
            await this.db.beginTransaction();
        
            for (const user of USERS.slice(0, 1000)) {
              // const query = `INSERT INTO users (id, name) VALUES ('${user.id}', '${user.name}');`;
              // await this.db.query(query);
              console.log(user);
            }
        
            await this.db.commitTransaction();
          } catch(err) {
            console.error("====> ", err);
            this.db.rollbackTransaction();
          }
        }
        
        await this.db.close();
        return;
      } 
    } catch (error) {
      console.error("==>", error);
    }
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
