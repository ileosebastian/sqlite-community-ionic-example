import { NgSwitch, NgSwitchCase, NgSwitchDefault, TitleCasePipe } from '@angular/common';
import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { IonContent, IonItem, IonLabel, IonProgressBar, IonRadio, IonRadioGroup, IonTitle, RadioGroupChangeEventDetail, RadioGroupCustomEvent } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { codeSlashOutline, personCircle } from 'ionicons/icons';
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

  public progress = 0;
  private intervalHandler!: any;

  constructor(
    private preferencesSrv: PreferencesService,
    private userDatabaseSrv: UserDatabaseService,
  ) {
    addIcons({ personCircle });
    this.pointer = 0;
    this.state = this.normalStatus[0];
  }

  async ngOnInit() {
    await this.userDatabaseSrv.insertMassiveData();
  }

  selectName(ev: Event) {
    const event = ev as RadioGroupCustomEvent;
    this.name = event.detail.value;
  }

  private firstTimeoutHandler: any;
  private secondTimeoutHandler: any;
  private thirdTimeoutHandler: any;
  private endTimeoutHandler: any;

  async listenState(data: { state: states, pointer: number }) {
    console.log("LLEGA COMO:", data.state);
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

    if (data.state === 'installation') {
      this.disableBtn = true;
      this.progress = 0;
      const firstQuartile = Math.floor((USERS.length - 1) / 4);
      const secondQuartile = Math.floor((USERS.length - 1) / 2);
      const thirdQuartile = firstQuartile + secondQuartile;
      const endQuartile = USERS.length - 1;

      this.firstTimeoutHandler = setTimeout(() => {
        console.log("-------------------- 25% --------------------");
        for (let i = 0; i < firstQuartile; i++) {
          // console.log("USER 1th:", USERS[i]);
        }
        this.progress = 0.25;
      }, 500);

      this.secondTimeoutHandler = setTimeout(() => {
        console.log("-------------------- 50% --------------------");
        for (let i = firstQuartile; i < secondQuartile; i++) {
          // console.log("USER 2th:", USERS[i]);
        }
        this.progress = 0.50;
      }, 1000);

      this.thirdTimeoutHandler = setTimeout(() => {
        console.log("--------------------  75% --------------------");
        for (let i = secondQuartile; i < thirdQuartile; i++) {
          // console.log("USER 3th:", USERS[i]);
        }
        this.progress = 0.75;
      }, 1500);

      this.endTimeoutHandler = setTimeout(() => {
        console.log("-------------------- 100% --------------------");
        for (let i = thirdQuartile; i < endQuartile; i++) {
          // console.log("USER 4th:", USERS[i]);
        }
        this.progress = 1;
        this.disableBtn = false;
      }, 2000);

      return;
    }
  }

  async setEndModal() {
    await this.preferencesSrv.setBootstrapInsertion(false);
    this.emittCloseModa.emit(false);
  }

  async insertAllData() {
  }

}
