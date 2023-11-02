import { CUSTOM_ELEMENTS_SCHEMA, Component, OnInit } from '@angular/core';
import { IonApp, IonModal, IonRouterOutlet, Platform } from '@ionic/angular/standalone';
import { SQLiteCommunityService } from './services/sqlite-community.service';
import { register } from 'swiper/element/bundle';
import { PreferencesService } from './services/preferences.service';
import { ModalSwiperComponent } from './components/modal-swiper/modal-swiper.component';

register();

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [
    IonApp,
    IonRouterOutlet,
    IonModal,
    ModalSwiperComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppComponent {

  private initDBPlugin: boolean = false;
  isFirstBoot: boolean = false;

  constructor(
    private _sqlite: SQLiteCommunityService,
    private platform: Platform,
    private preferences: PreferencesService,
  ) {
    this.initializePlugin();
    this.preferences.isBoottingInsertion()
      .then(res => this.isFirstBoot = res)
      .catch(err => {
        console.error("=>", err);
        this.isFirstBoot = false;
      })
  }

  initializePlugin() {
    this.platform.ready()
      .then(async () => {
        this._sqlite.initializePlugin()
          .then(result => {
            this.initDBPlugin = result;
            console.log('>>>> in App  this.initPlugin ' + this.initDBPlugin);

            if (this._sqlite.platform === 'web') {
              console.log("es web...");
              this._sqlite.initWebStore()
                .then(res => console.log("Se ha ejecutado en web con exito", res))
                .catch(err => console.error("ERROR al ejecutar en web"));
              console.log("termina web...");
            }

          });
      });
  }

}
