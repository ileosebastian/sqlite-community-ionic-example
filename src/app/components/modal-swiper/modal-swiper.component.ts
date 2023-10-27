import { CUSTOM_ELEMENTS_SCHEMA, Component, OnInit } from '@angular/core';
import { addIcons } from 'ionicons';
import { personCircle } from 'ionicons/icons';

@Component({
  selector: 'app-modal-swiper',
  templateUrl: './modal-swiper.component.html',
  styleUrls: ['./modal-swiper.component.scss'],
  standalone: true,
  imports: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ModalSwiperComponent implements OnInit {

  constructor() {
    addIcons({ personCircle });
  }

  ngOnInit() { }

}
