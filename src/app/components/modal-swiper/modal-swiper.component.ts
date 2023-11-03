import { NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { IonButton, IonButtons, IonContent, IonLabel } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { personCircle } from 'ionicons/icons';
import { PreferencesService } from 'src/app/services/preferences.service';

import { App } from '@capacitor/app';

type states = 'welcome' | 'selection' | 'installation' | 'error';

@Component({
  selector: 'app-modal-swiper',
  templateUrl: './modal-swiper.component.html',
  styleUrls: ['./modal-swiper.component.scss'],
  standalone: true,
  imports: [
    IonContent,
    NgSwitch,
    NgSwitchCase,
    NgSwitchDefault,

    IonButtons,
    IonButton,
    IonLabel
  ],
})
export class ModalSwiperComponent implements OnInit {

  @Output() emittCloseModa = new EventEmitter<boolean>();

  stateDictionary!: Map<states, states>;
  state!: states;
  pointer!: number;
  normalStatus: states[] = ['welcome', 'selection', 'installation'];

  constructor(
    private preferencesSrv: PreferencesService
  ) {
    addIcons({ personCircle });
    this.pointer = 0;
    this.state = this.normalStatus[this.pointer];
  }

  ngOnInit() { }

  nextState() {
    if (this.pointer >= (this.normalStatus.length - 1)) {
      this.pointer = 0;
    } else {
      this.pointer++;
    }
    console.log('pointer', this.pointer, (this.normalStatus.length - 1));

    this.state = this.normalStatus[this.pointer];
  }

  previousState() {
    if (this.pointer <= 0) {
      this.pointer = this.normalStatus.length - 1;
    } else {
      this.pointer--;
    }
    console.log('pointer', this.pointer);
    this.state = this.normalStatus[this.pointer];
  }

  async exitApp() {
    await App.exitApp();
  }

  async setEndModal() {
    await this.preferencesSrv.setBootstrapInsertion(false);
    this.emittCloseModa.emit(false);
  }

  async insertAllData() {
  }

}
