import {HTMLElement, parse} from 'node-html-parser';
import {Price} from './interfaces';

chrome.runtime.onConnect.addListener(function (port) {
  port.onMessage.addListener(function (msg) {
    if (msg.url) {
      fetchPrice(msg.url).then((price) => {
        port.postMessage({price});
      });
    }
  });
});

/**
 * Fetch the content of the provided url and search a product price on it.
 * If price is not present return null. If price is found return its parts.
 * @param url of the amazon product page
 */
function fetchPrice(url: string): Promise<Price | null> {
  return fetch(url, {
    method: 'GET',
  }).then((r) => {
    return r.text();
  }).then((html) => {
    const tree = parse(html);
    return findPriceToPay(tree) || findPrice(tree);
  });
}

function findPrice(tree: HTMLElement): Price | null {
  const priceElement = tree.querySelector('.priceToPay');
  if (!priceElement) {
    return null;
  }
  const whole = tree.querySelector('.a-price-whole')?.innerText.trim().replace('.', '') || '';
  const decimals = tree.querySelector('.a-price-fraction')?.innerText.trim() || '';
  const symbol = tree.querySelector('.a-price-symbol')?.innerText.trim() || '';
  return {whole, decimals, symbol};
}

function findPriceToPay(tree: HTMLElement): Price | null {
  const priceElement = tree.querySelector('[data-feature-name=corePrice] .a-offscreen');
  if (!priceElement) {
    return null;
  }
  const text = priceElement.innerText;
  const regex = /^(?<symbol>[$€])?(?<whole>\d{1,3}(?:,\d{3})*|\d+)\.(?<decimals>\d{2})(?<symbolAfter>[$€])?$/;
  const match = text.match(regex);
  return {
    symbol: match?.groups?.symbol || match?.groups?.symbolAfter || '',
    whole: match?.groups?.whole || '',
    decimals: match?.groups?.decimals || '',
    text,
  };
}
