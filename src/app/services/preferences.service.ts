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

  async isBoottingInsertion() {
    const { value } = await Preferences.get({ key: 'isBoot' });
    return value === null ? true : value === 'true';
  }

  async setPreferences(checked: boolean) {
    await Preferences.set({
      key: 'checked',
      value: String(checked)
    });
  }

  async setBootstrapInsertion(isBoot: boolean) {
    await Preferences.set({
      key: 'isBoot',
      value: String(isBoot)
    });
  }

}
