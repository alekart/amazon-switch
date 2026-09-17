import {from, mergeMap, Observable, of, throwError} from 'rxjs';
import {Country, CountryLink, Price, Settings} from './interfaces';

export class AmazonSwitch {
  static countries: Country[] = [
    {code: 'be', enabled: true, order: 0, ext: 'com.be', name: 'Belgium'},
    {code: 'fr', enabled: true, order: 1, ext: 'fr', name: 'France'},
    {code: 'de', enabled: true, order: 2, ext: 'de', name: 'Germany'},
    {code: 'es', enabled: true, order: 3, ext: 'es', name: 'Spain'},
    {code: 'it', enabled: true, order: 4, ext: 'it', name: 'Italy'},
    {code: 'nl', enabled: true, order: 5, ext: 'nl', name: 'Netherlands'},
    {code: 'uk', enabled: true, order: 6, ext: 'co.uk', name: 'United Kingdom'},
  ];

  current: string;
  menu: HTMLElement;
  parser = new DOMParser();
  url: string;
  hostname: string;
  links: CountryLink[];

  constructor(settings: Settings, url?: string) {
    this.current = this.detectCurrent();
    this.links = this.getCountriesLinks(settings.countries);
    this.menu = this.createMenuElement(this.links);
    this.getPrices(this.links);
    this.url = url || window.location.href;
    this.hostname = url ? new URL(url).hostname : window.location.hostname;
  }

  addMenu(element: HTMLElement) {
    element.appendChild(this.menu);
  }

  private getPrices(links: CountryLink[]) {
    const priceHolder = document.querySelector(`.priceToPay`);
    links.forEach((link, index) => {
      if (link.href) {
        const domPrice = this.createDomPrice(link, index);
        priceHolder?.appendChild(domPrice.element);
        domPrice.setLoading(true);

        this.getPrice(link.href).subscribe({
          next: (price) => {
            this.addPriceToMenu(price, link.code);
            domPrice.setPrice(price);
            domPrice.setLoading(false);
          },
          error: () => {
            domPrice.setLoading(false);
            domPrice.disable();
          }
        });
      }
    });
  }

  private getPrice(url: string): Observable<Price> {
    return from(new Promise<Price>((resolve, reject) => {
      const port = chrome.runtime.connect({name: 'amazonSwitch'});
      port.postMessage({url});
      port.onMessage.addListener((msg) => {
        if (msg?.price) {
          resolve(msg.price);
          return;
        }
        reject('Could not get price');
      });
    })).pipe(mergeMap((response) => {
      return of(response);
    }));
  }

  private getList(links: CountryLink[]) {
    return links.reduce((accum, link, index) => {
      const elementId = `amzn-switch-${link.name.toLowerCase()}`;
      return `${accum}
      <a id="${elementId}" data-index="${index}" class="amzns-link nav-link nav-item" href="${link.href}">
        <span class="icp-nav-flag icp-nav-flag-${link.code} icp-nav-flag-lop"></span>
        <span class="nav-text amzns-country" translate="no">${link.code}</span>
        <span id="amzns-price-${link.code}" class="amzns-price"></span>
      </a>`;
    }, '');
  }

  private getCountriesLinks(countries: Country[]): CountryLink[] {
    return countries.reduce((accum: CountryLink[], country) => {
      if (!country.enabled || this.current === country.ext) {
        return accum;
      }
      const href = this.localizeUrl(country.ext);
      return [...accum, {href: href, ...country}];
    }, []);
  }

  private addPriceToMenu(price: Price, country: string) {
    const priceHolder = this.menu.querySelector(`#amzns-price-${country}`);
    const {whole, decimals, symbol, text} = price;
    if (priceHolder) {
      priceHolder.innerHTML = `
        <span title="${text}">
          <span class="a-price-whole">
            ${whole}<!--
        --><span class="a-price-decimal">,</span><!--
        --></span><!--
        --><span class="a-price-fraction">${decimals}</span><!--
        --><span class="a-price-symbol">${symbol}</span>
        </span>
      `;
    }
  }

  private createDomPrice(countryLink: CountryLink, order: number) {
    const link = document.createElement('a');
    link.classList.add('amzns-in-page');
    link.id = `page-price-${countryLink.code}`;
    link.style.order = order.toString();
    link.setAttribute('href', `${countryLink.href}`);
    const flag = document.createElement('span');
    flag.classList.add('icp-nav-flag', 'icp-nav-flag-lop', `icp-nav-flag-${countryLink.code}`);
    const whole = document.createElement('span');
    whole.classList.add('a-price-whole');
    const fraction = document.createElement('span');
    fraction.classList.add('a-price-fraction');
    const symbol = document.createElement('span');
    symbol.classList.add('a-price-symbol');
    const decimal = document.createElement('span');
    decimal.classList.add('a-price-decimal');
    decimal.innerHTML = ',';
    link.appendChild(flag);
    link.appendChild(symbol);
    link.appendChild(whole);
    whole.appendChild(decimal);
    link.appendChild(fraction);

    return {
      setPrice(price: Price) {
        whole.innerHTML = price.whole;
        fraction.innerHTML = price.decimals;
        symbol.innerHTML = price.symbol;
      },
      setLoading(active: boolean) {
        if (active) {
          link.classList.add('loading');
        } else {
          link.classList.remove('loading');
        }
      },
      disable() {
        link.classList.add('disabled');
        link.style.order = (order + 10).toString();
      },
      element: link,
    }
  }

  private localizeUrl(country: string): string {
    const url = this.url || window.location.href;
    return url.replace(`amazon.${this.current}`, `amazon.${country}`);
  }

  private detectCurrent(): string {
    let hostname;
    if (this.url) {
      hostname = new URL(this.url, '').hostname;
    } else {
      hostname = window.location.hostname;
    }
    return hostname.replace(/^.+amazon\./, '');
  }

  private createMenuElement(links: CountryLink[]): HTMLElement {
    return this.parser
      .parseFromString(this.getTemplate(links), 'text/html')
      .querySelector('.amzns-list') as HTMLElement;
  }

  private getTemplate(links: CountryLink[]) {
    return `
    <span class="nav-icon nav-arrow" style="visibility: visible;"></span>
    <div class="amzns-list nav-flyout">
      <div class="nav-arrow"><div class="nav-arrow-inner"></div></div>
      ${this.getList(links)}
    </div>
    `;
  }
}
