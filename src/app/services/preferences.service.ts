import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { Preference } from '../models/models';


@Injectable({
  providedIn: 'root'
})
export class PreferencesService {

  constructor() { }

  async cofigurePreferences() {
    const { value } = await Preferences.get({ key: 'checked' });
    const preferences: Preference = { checked: false };
    console.log(">>>> >>>> >>>> >>>> >>>> >>>> >>>> >>>> >>>> VALUE:", value);
    if (value) {
      preferences.checked = value === 'true';
    } else {
      await Preferences.set({
        key: 'checked',
        value: String(value)
      });
    }
    return preferences;
  }

  async setPreferences(checked: boolean) {
    await Preferences.set({
      key: 'checked',
      value: String(checked)
    });
  }

}
