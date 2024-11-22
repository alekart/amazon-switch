import {useEffect, useState} from 'react';
import {Country} from '../interfaces';
import {Checkbox, CheckboxValue} from './Checkbox';
import {AmazonSwitch} from '../amzn-switch.class';
import Logo from '../icons/icon_128.png';
import beFlag from 'flag-icons/flags/4x3/be.svg';
import frFlag from 'flag-icons/flags/4x3/fr.svg';
import deFlag from 'flag-icons/flags/4x3/de.svg';
import esFlag from 'flag-icons/flags/4x3/es.svg';
import itFlag from 'flag-icons/flags/4x3/it.svg';
import nlFlag from 'flag-icons/flags/4x3/nl.svg';
import gbFlag from 'flag-icons/flags/4x3/gb.svg';

const flags: Record<string, any> = {
  be: beFlag,
  fr: frFlag,
  de: deFlag,
  es: esFlag,
  it: itFlag,
  nl: nlFlag,
  uk: gbFlag,
}

interface Props {
  countries: Country[];
  onUpdate: (selected: Country[]) => void;
}

export default function Popup({countries, onUpdate}: Props) {
  const [options, setOptions] = useState(countries);

  useEffect(() => {
    setOptions([...countries]);
  }, [countries]);

  function resetDefaults() {
    setOptions(AmazonSwitch.countries);
  }

  function handleCheckbox(checkbox: CheckboxValue) {
    setOptions((prev) => {
      const modifiedOnIndex = prev.findIndex((i) => i.code === checkbox.value);
      const updated = [...prev];
      updated[modifiedOnIndex] = {
        ...updated[modifiedOnIndex],
        enabled: checkbox.checked,
      };
      onUpdate(updated);
      return updated;
    });
  }

  function getOptions(enabled: boolean) {
    const filteredOptions = options.filter((option) => option.enabled === enabled);
    const disabled = enabled && filteredOptions.length < 2;
    return filteredOptions.map((country) => (
      <li key={`${country.code}-${country.order}`}>
        <Checkbox
          value={country.code}
          checked={enabled}
          disabled={disabled}
          onChange={handleCheckbox}>
          <img className="checkbox__flag" src={flags[country.code]} alt="" width={40 / 2}
               height={30 / 2}/>
          {country.code.toUpperCase()}&nbsp;&nbsp; {country.name}
        </Checkbox>
      </li>
    ));
  }

  const enabled = getOptions(true);
  const disabled = getOptions(false);

  return (
    <>
      <h1><img src={Logo} alt="Amazon Switch" className="asw-logo"/> Amazon Switch</h1>
      <p>Enable countries you want to see prices for.</p>
      <ul className="unstyled-list">
        {enabled}
      </ul>
      <ul className="unstyled-list">
        {disabled}
      </ul>
      <p className="text-right">
        <button className="reset-btn" type="button" onClick={resetDefaults}>Reset</button>
      </p>
    </>
  );
}
