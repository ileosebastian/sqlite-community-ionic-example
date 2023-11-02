import { CUSTOM_ELEMENTS_SCHEMA, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { IonContent } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { personCircle } from 'ionicons/icons';
import { PreferencesService } from 'src/app/services/preferences.service';

@Component({
  selector: 'app-modal-swiper',
  templateUrl: './modal-swiper.component.html',
  styleUrls: ['./modal-swiper.component.scss'],
  standalone: true,
  imports: [IonContent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ModalSwiperComponent implements OnInit {

  @Output() emittCloseModa = new EventEmitter<boolean>();

  constructor(
    private preferencesSrv: PreferencesService
  ) {
    addIcons({ personCircle });
  }

  ngOnInit() { }

  async setEndModal() {
    await this.preferencesSrv.setBootstrapInsertion(false);
    this.emittCloseModa.emit(false);
  }

}
