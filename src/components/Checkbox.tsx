import {ChangeEvent, useState} from 'react';
import {noop} from 'rxjs';

export interface CheckboxValue {
  checked: boolean;
  value: string;
}

interface Props {
  value: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: (value: CheckboxValue) => void;
  label?: string;
  children?: React.ReactNode;
}

export function Checkbox({
                           label,
                           value,
                           checked,
                           disabled = false,
                           onChange = noop,
                           children
                         }: Props) {
  const [chkd, setChkd] = useState(checked);

  function handleChecked(event: ChangeEvent<HTMLInputElement>) {
    const checked = event.target.checked;
    setChkd(checked);
    onChange({checked, value});
  }

  return <label className="checkbox">
    <input type="checkbox" className="checkbox__input" checked={chkd} value={value}
           disabled={disabled} onChange={handleChecked}/>
    <span className="checkbox__label">{children || label}</span>
  </label>
}
