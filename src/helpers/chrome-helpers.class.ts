import {Country, Settings} from '../interfaces';
import {AmazonSwitch} from '../amzn-switch.class';

export class ChromeHelpers {
  static async getSettings(): Promise<Settings> {
    const settings = await chrome.storage.sync.get(['countries']);
    const savedCountries: Country[] = settings?.countries || [];
    if (!savedCountries?.length) {
      return {
        countries: AmazonSwitch.countries,
      };
    }
    const mergedCountries = AmazonSwitch.countries.reduce((accum: Country[], country) => {
      const inSaved = savedCountries.find((saved) => saved.code === country.code) || {};
      return [
        ...accum,
        {...country, ...inSaved},
      ];
    }, [])
    return {
      countries: mergedCountries,
    };
  }

  static async setSettings(settings: Settings): Promise<void> {
    return chrome.storage.sync.set({
      ...settings,
    });
  }
}
