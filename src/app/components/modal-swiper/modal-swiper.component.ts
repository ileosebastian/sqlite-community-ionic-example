import { NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { IonButton, IonButtons, IonContent, IonItem, IonLabel, IonProgressBar, IonRadio, IonRadioGroup, IonTitle } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { personCircle } from 'ionicons/icons';
import { PreferencesService } from 'src/app/services/preferences.service';

import { states } from 'src/app/models/types';
import { OptionModalComponent } from '../option-modal/option-modal.component';


@Component({
  selector: 'app-modal-swiper',
  templateUrl: './modal-swiper.component.html',
  styleUrls: ['./modal-swiper.component.scss'],
  standalone: true,
  imports: [
    NgSwitch,
    NgSwitchCase,
    NgSwitchDefault,

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

  stateDictionary!: Map<states, states>;
  state!: states;
  pointer!: number;
  normalStatus: states[] = ['welcome', 'selection', 'installation'];

  public progress = 0;
  private intervalHandler!: any;

  constructor(
    private preferencesSrv: PreferencesService
  ) {
    addIcons({ personCircle });
    this.pointer = 0;
    this.state = this.normalStatus[0];
  }

  ngOnInit() { }

  listenState(data: { state: states, pointer: number }) {
    this.state = data.state;
    this.pointer = data.pointer;

    if (data.state === 'installation') {
      this.intervalHandler = setInterval(() => {
        this.progress += 0.01;

        // Reset the progress bar when it reaches 100%
        // to continuously show the demo
        if (this.progress > 1) {
          setTimeout(() => {
            this.progress = 0;
          }, 1000);
        }
      }, 50);
    } else {
      clearInterval(this.intervalHandler);
      this.progress = 0;
    }
  }

  async setEndModal() {
    await this.preferencesSrv.setBootstrapInsertion(false);
    this.emittCloseModa.emit(false);
  }

  async insertAllData() {
  }

}
