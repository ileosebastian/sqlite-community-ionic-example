import { Component, OnDestroy, OnInit, ViewChild, WritableSignal } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonGrid, IonRow, IonCol, IonInput, IonItem, IonButton, IonIcon, IonCheckbox, ModalController, IonLabel } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { add, trash } from 'ionicons/icons';
import { SQLiteCommunityService } from '../services/sqlite-community.service';
import { UserDatabaseService } from '../services/user-database.service';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { Preference, User } from '../models/models';
import { PreferencesService } from '../services/preferences.service';

const createSchemaTest: string = `
  CREATE TABLE IF NOT EXISTS test (
    id INTEGER PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL
  );
`;


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonGrid,
    IonRow,
    IonCol,
    IonItem,
    IonInput,
    IonButton,
    IonIcon,
    IonCheckbox,
    NgFor,
    FormsModule,
    IonLabel,
    NgIf,
  ],
})
export class HomePage implements OnInit, OnDestroy {

  users!: WritableSignal<User[]>;
  newUserName: string = '';
  checked: boolean = false;
  prefs!: Preference;

  @ViewChild(IonInput) input!: IonInput;

  constructor(
    private sqliteService: SQLiteCommunityService,
    private userdb: UserDatabaseService,
    private preferences: PreferencesService,
  ) {
    addIcons({ add, trash });
    this.userdb.initUserDataBase();
      
    this.users = this.userdb.getUsers();
    console.log("se ha iniciado en el constructor");
  }

  async ngOnInit() {
    const preferences = await this.preferences.cofigurePreferences();
    this.checked = preferences.checked;
  }

  async ngOnDestroy() {
    this.userdb.endUserDataBase();
  }

  setPreference() {
    this.checked = !this.checked;
    this.preferences.setPreferences(this.checked);
  }

  setText(ev: Event) {
    const event = ev as CustomEvent<IonInput>;
    this.newUserName = event.detail.value?.toString() || '';
  }

  async createUser() {
    this.userdb.addUser(this.newUserName);
    this.newUserName = '';
    this.input.value = '';
    this.input.clearInput = true;
  }

  async updateUser(user: User) {
    const active = user.active ? 1 : 0;
    this.userdb.updateUserById(user.id, active);
  }

  async deleteUser(user: User) {
    this.userdb.deleteUserById(user.id);
  }

  async runTest() {
    // Create the connection
    const db = await this.sqliteService.createConnection(
      "test",
      false,
      "no-encryption",
      1
    );

    console.log(`\nANTES DE ABRIR LA CONEXION`);
    // Open the database
    await db.open();

    // Create the database schema
    await db.execute(`DELETE FROM test;`);
    const res = await db.execute(createSchemaTest);
    console.log(`\nCREADA LA TABLA test: ${JSON.stringify(res)}`);


    // mode 'no' INSERT
    const resI0 = await db.run("INSERT INTO test (name,email) VALUES ('Ackerman','ackerman@example.com') , ('Jefferson','jefferson@example.com');", [], true, 'no');
    console.log(`\n\t>>> Insersion en modo por defecto: ${JSON.stringify(resI0)}`);
    // mode 'all' INSERT
    const resI = await db.run("INSERT INTO test (name,email) VALUES ('Jeepq','jeepq@example.com') , ('Brown','brown@example.com') RETURNING *;", [], true, 'all');
    console.log(`\t>>> Insersion en modo 'all' (devuelve en valores todas las modificaciones): ${JSON.stringify(resI)}`);
    // mode 'one' INSERT
    const resI1 = await db.run("INSERT INTO test (name,email) VALUES ('Jones','jones@example.com') , ('Davison','davison@example.com') RETURNING email;", [], true, 'one');
    console.log(`\t>>> Insersion en modo 'on' (devuelve en valores todas las modificaciones): ${JSON.stringify(resI1)}`);

    // mode 'all' INSERT with values
    const resI3 = await db.run("INSERT INTO test (name,email) VALUES (?,?) , (?,?) RETURNING name;", ['Dupond', 'dupond@example.com', 'Toto', 'toto@example.com'], true, 'all');
    console.log(`\t>>> Insersion en modo 'all' con  v a l o r e s:  ${JSON.stringify(resI3)}`);


    // mode 'one' UPDATE
    const resU1 = await db.run("UPDATE test SET email='jeepq.@company.com' WHERE name='Jeepq' RETURNING id,email;", [], true, 'one');
    console.log(`\n>>> ACTUALIZACION en modo 'one': ${JSON.stringify(resU1)}`);


    // mode 'all' DELETE
    const resD1 = await db.run("DELETE FROM test WHERE id IN (2,4,6) RETURNING id,name;", [], true, 'all');
    console.log(`\n>>> ELIMINARION en modo 'all' (retorna todo lo demas): ${JSON.stringify(resD1)}`);


    // Query the database
    const resQ1 = await db.query('SELECT * FROM test;');
    console.log(`\n>>> Consulta de la actual BD test:::: ${JSON.stringify(resQ1)}`);


    // Close the connection
    await this.sqliteService.closeConnection("test");
    console.log(`\nDESPUTES DE CERRAR LA CONEXION`);
  }

}
