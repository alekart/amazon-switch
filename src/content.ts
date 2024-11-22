import {AmazonSwitch} from './amzn-switch.class';
import {ChromeHelpers} from "./helpers/chrome-helpers.class";

addEventListener('DOMContentLoaded', () => {
  async function initSwitch() {
    const settings = await ChromeHelpers.getSettings();
    const amznsw = new AmazonSwitch(settings);
    const container: HTMLElement | null = document.querySelector('#nav-logo');
    if (container) {
      amznsw.addMenu(container);
    }
  }

  initSwitch();
});

// When amazon switch settings are changed reload the page
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'sync' && changes.countries) {
    window.location.reload();
  }
});
