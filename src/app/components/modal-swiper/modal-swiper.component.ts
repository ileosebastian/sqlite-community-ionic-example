import { NgSwitch, NgSwitchCase, NgSwitchDefault, TitleCasePipe } from '@angular/common';
import { Component, EventEmitter, OnInit, Output, ViewChild, WritableSignal, signal } from '@angular/core';
import { IonButton, IonContent, IonItem, IonLabel, IonProgressBar, IonRadio, IonRadioGroup, IonTitle, RadioGroupChangeEventDetail, RadioGroupCustomEvent } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { personCircle } from 'ionicons/icons';
import { PreferencesService } from 'src/app/services/preferences.service';

import { states } from 'src/app/models/types';
import { OptionModalComponent } from '../option-modal/option-modal.component';
import { UserDatabaseService } from 'src/app/services/user-database.service';
import { USERS } from 'src/app/mock/data';


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
  private intervalHandler!: any;

  constructor(
    private preferencesSrv: PreferencesService,
    private userDatabaseSrv: UserDatabaseService,
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

  private firstTimeoutHandler: any;
  private secondTimeoutHandler: any;
  private thirdTimeoutHandler: any;
  private endTimeoutHandler: any;

  async listenState(data: { state: states, pointer: number }) {
    this.state = data.state;
    this.pointer = data.pointer;

    clearTimeout(this.firstTimeoutHandler);
    clearTimeout(this.secondTimeoutHandler);
    clearTimeout(this.thirdTimeoutHandler);
    clearTimeout(this.endTimeoutHandler);

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
      this.userDatabaseSrv.stopProgress = true;
      this.userDatabaseSrv.cancelMassiveInsertionDataUsers()
        .then(() => {
          this.state = 'selection';
          this.userDatabaseSrv.stopProgress = false;
        });
    }

    if (data.state === 'installation') {
      this.disableBtn = true;

      const users = USERS.slice(0, 100);

      await this.userDatabaseSrv.insertMassiveDataUsers(users);
      this.disableBtn = false;
      this.userDatabaseSrv.loadUsers();

      return;
    }
  }

  async setEndModal() {
    if (this.state === 'installation') {
      await this.preferencesSrv.setBootstrapInsertion(false);
    }
    this.emittCloseModa.emit(false);
  }

}
