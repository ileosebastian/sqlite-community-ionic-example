import { NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { IonButton, IonButtons, IonContent, IonLabel } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { personCircle } from 'ionicons/icons';
import { PreferencesService } from 'src/app/services/preferences.service';

import { App } from '@capacitor/app';
import { states } from 'src/app/models/types';
import { OptionModalComponent } from '../option-modal/option-modal.component';


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
    IonLabel,
    OptionModalComponent
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
    this.state = this.normalStatus[0];
  }

  ngOnInit() { }

  listenState(data: { state: states, pointer: number }) {
    console.log("cambia estado a ", data.state);
    this.state = data.state;
    this.pointer = data.pointer;
  }

  nextState() { }

  previousState() { }

  async setEndModal() {
    await this.preferencesSrv.setBootstrapInsertion(false);
    this.emittCloseModa.emit(false);
  }

  async insertAllData() {
  }

}
