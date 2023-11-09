import { NgSwitch, NgSwitchCase, NgSwitchDefault, TitleCasePipe } from '@angular/common';
import { Component, EventEmitter, OnInit, Output, ViewChild, WritableSignal, signal } from '@angular/core';
import { IonButton, IonContent, IonItem, IonLabel, IonProgressBar, IonRadio, IonRadioGroup, IonTitle, RadioGroupCustomEvent } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { personCircle } from 'ionicons/icons';
import { PreferencesService } from 'src/app/services/preferences.service';

import { states } from 'src/app/models/types';
import { OptionModalComponent } from '../option-modal/option-modal.component';
import { UserDatabaseService } from 'src/app/services/user-database.service';
import { USERS } from 'src/app/mock/users';

import { isPlatform } from '@ionic/angular/standalone';
import { SQLiteCommunityService } from 'src/app/services/sqlite-community.service';


@Component({
  selector: 'app-modal-swiper',
  templateUrl: './modal-swiper.component.html',
  styleUrls: ['./modal-swiper.component.scss'],
  standalone: true,
  imports: [
    NgSwitch,
    NgSwitchCase,
    NgSwitchDefault,
    TitleCasePipe,

    IonContent,
    IonTitle,
    IonRadioGroup,
    IonRadio,
    IonItem,
    IonLabel,
    IonProgressBar,
    IonButton,

    OptionModalComponent
  ],
})
export class ModalSwiperComponent implements OnInit {

  @Output() emittCloseModa = new EventEmitter<boolean>();

  @ViewChild('optionName') nameOptions!: IonRadioGroup;

  stateDictionary!: Map<states, states>;
  state!: states;
  pointer!: number;
  normalStatus: states[] = ['welcome', 'selection', 'installation'];

  name!: string;
  disableBtn: boolean = false;

  progress: WritableSignal<number> = signal(0);
  cancelProgress: boolean = true;

  constructor(
    private preferencesSrv: PreferencesService,
    private userDatabaseSrv: UserDatabaseService,
    private _sqlite: SQLiteCommunityService,
  ) {
    addIcons({ personCircle });
    this.pointer = 0;
    this.state = this.normalStatus[0];
    this.progress = this.userDatabaseSrv.getProgress();
  }

  async ngOnInit() { }

  selectName(ev: Event) {
    const event = ev as RadioGroupCustomEvent;
    this.name = event.detail.value;
  }

  async listenState(data: { state: states, pointer: number }) {
    this.state = data.state;
    this.pointer = data.pointer;

    if (data.state === 'selection') {
      this.disableBtn = true;

      setTimeout(() => {
        this.name = this.nameOptions.value;
        this.disableBtn = false;
        return;
      }, 0);

      return;
    }

    if (data.state === 'cancel') {
      this.userDatabaseSrv.cancelMassiveInsertionDataUsers()
        .then(() => {
          this.state = 'selection';
          this.cancelProgress = true;
        });

      return;
    }

    if (data.state === 'installation') {
      if (this._sqlite.platform === 'web') {
        await this.setEndModal();
        console.log("se ha terminado");
        return;
      }

      this.disableBtn = true;
      this.cancelProgress = true;

      const users = USERS.slice(0, 100);

      await this.userDatabaseSrv.insertMassiveDataUsers(users);

      await this.userDatabaseSrv.loadUsers();
      this.disableBtn = false;
      this.cancelProgress = false;

      return;
    }
  }

  async setEndModal() {
    if (this.state === 'installation') {
    }
    await this.preferencesSrv.setBootstrapInsertion(false);
    this.emittCloseModa.emit(false);
  }

}
