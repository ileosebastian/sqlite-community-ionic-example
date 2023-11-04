import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { App } from '@capacitor/app';
import { IonButton, IonLabel } from '@ionic/angular/standalone';
import { concatMapTo } from 'rxjs';
import { states } from 'src/app/models/types';


type buttonRole = 'exit' | 'previous' | 'next' | 'cancel' | 'installation' | 'done';

@Component({
  selector: 'app-option-modal',
  templateUrl: './option-modal.component.html',
  styleUrls: ['./option-modal.component.scss'],
  standalone: true,
  imports: [
    IonButton,
    IonLabel
  ]
})
export class OptionModalComponent implements OnInit {

  buttonTextByRole: { [key in buttonRole]: string } = {
    'exit': 'salir',
    'cancel': 'cancelar',
    'done': 'hecho',
    'installation': 'instalar',
    'next': 'continuar',
    'previous': 'volver'
  };

  @Input() normalStatus: states[] = [];
  @Input() firstButtonRole!: buttonRole;
  @Input() secondButtonRole!: buttonRole;
  @Output() emittState = new EventEmitter<{ state: states, pointer: number }>();
  @Input() pointer!: number;

  constructor() { }

  ngOnInit() { }

  firstButtonController() {
    if (this.firstButtonRole === 'exit') {
      this.exitApp();
    }
    if (['previous', 'cancel'].includes(this.firstButtonRole)) this.previousState();
  }

  secondButtonController() {
    if (['next', 'installation', 'done'].includes(this.secondButtonRole)) this.nextState();
  }

  nextState() {
    if (this.pointer >= (this.normalStatus.length - 1)) {
      this.pointer = 0;
    } else {
      this.pointer++;
    }

    this.emittState.emit({ state: this.normalStatus[this.pointer], pointer: this.pointer });
  }

  previousState() {
    if (this.pointer <= 0) {
      this.pointer = this.normalStatus.length - 1;
    } else {
      this.pointer--;
    }

    this.emittState.emit({ state: this.normalStatus[this.pointer], pointer: this.pointer });
  }

  async exitApp() {
    await App.exitApp();
  }

}
