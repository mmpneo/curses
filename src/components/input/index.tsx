import { useId } from "@floating-ui/react-dom-interactions";
import classNames from "classnames/bind";
import { FC, InputHTMLAttributes, memo, PropsWithChildren, ReactNode, useEffect, useState } from "react";
import Select, { Props as SelectProps } from 'react-select';
import styles from "./style.module.css"
import { RgbaColorPicker, RgbaColor } from "react-colorful";
import Dropdown from "../dropdown/Dropdown";

const cx = classNames.bind(styles);

interface InputBaseProps {
  label: string
}

const Container: FC<PropsWithChildren<{ id?: string, label: string }>> = memo(({ id, label, children }) => {
  return <div className="flex justify-between items-center min-h-8">
    <label className="flex-grow font-semibold text-base-content text-xs cursor-pointer" htmlFor={id}>{label}</label>
    {children}
  </div>
});

const BaseText: FC<InputHTMLAttributes<HTMLInputElement>> = memo((props: any) => <input {...props} className={cx(styles.clearAppearance, "field-width input input-bordered overflow-hidden input-sm font-semibold leading-none appearance-none")} />);

interface InputTextProps extends InputBaseProps, InputHTMLAttributes<HTMLInputElement> { }

const stringToRgba = (value: string): RgbaColor => {
  const val = value?.slice?.(5, -1).split(",");
  return val ? {
    r: parseInt(val[0]) ?? 0,
    g: parseInt(val[1]) ?? 0,
    b: parseInt(val[2]) ?? 0,
    a: parseFloat(val[3]) ?? 0
  } : {
    r: 0,
    g: 0,
    b: 0,
    a: 1
  };
}

const clampRGB = (v: number) => v ? Math.max(0, Math.min(255, v)) : 0;
const rgbaToString = (e: RgbaColor) => {
  return `rgba(${clampRGB(e.r)},${clampRGB(e.g)},${clampRGB(e.b)},${e.a || 0})`
}

const Text: FC<InputTextProps> = memo(({ label, ...rest }) => {
  const id = useId();
  return <Container label={label} id={id}><BaseText id={id} type="text" {...rest} /></Container>
});

const ColorSelectDropdown: FC<any> = ({ onChange, value }) => {
  const [rgba, setRgba] = useState(stringToRgba(value));
  const handleChange = (e: RgbaColor) => onChange(rgbaToString(e));

  useEffect(() => {
    setRgba(stringToRgba(value));
  }, [value]);

  const handlePartialChange = (k: keyof RgbaColor, e: string) => {
    onChange(rgbaToString({ ...rgba, [k]: parseFloat(e) }))
  }

  return <div className="flex flex-col space-y-2 dropdown p-4">
    <RgbaColorPicker onChange={handleChange} color={stringToRgba(value)} />
    <div className="flex space-x-1">
      <input type="number" value={rgba.r} onChange={e => handlePartialChange("r", e.target.value)} className={cx(styles.clearAppearance, "w-full input input-xs input-bordered font-semibold leading-none")} />
      <input type="number" value={rgba.g} onChange={e => handlePartialChange("g", e.target.value)} className={cx(styles.clearAppearance, "w-full input input-xs input-bordered font-semibold leading-none")} />
      <input type="number" value={rgba.b} onChange={e => handlePartialChange("b", e.target.value)} className={cx(styles.clearAppearance, "w-full input input-xs input-bordered font-semibold leading-none")} />
      <input type="number" value={rgba.a} step="0.05" onChange={e => handlePartialChange("a", e.target.value)} className={cx(styles.clearAppearance, "w-full input input-xs input-bordered font-semibold leading-none")} />
    </div>
  </div>
}
interface InputColorProps extends InputBaseProps {
  onChange: (color: string) => void,
  value: string
}
const Color: FC<InputColorProps> = memo(({ label, ...rest }) => {
  return <Dropdown targetOffset={24} placement="right" content={<ColorSelectDropdown {...rest} />}><Container label={label} id={label}>
    <button className="btn-circle btn btn-sm" style={{ backgroundColor: rest.value as string }} />
  </Container></Dropdown>
});

//margin: 0.375rem 0;
const Range: FC<InputTextProps> = memo(({ label, ...rest }) => {
  const id = useId();
  return <Container label={label} id={id}>
    <input {...rest} id={id} type="range" className="field-width range range-sm range-primary" />
  </Container>
});

interface ChipsProps extends InputBaseProps {
  options: {
    value: string | number
    label: ReactNode
  }[],
  onChange: (value: string | number) => void,
  value?: string | number
}
const Chips: FC<ChipsProps> = memo(({ label, value, options, onChange }) => {
  const id = useId();
  return <Container label={label} id={id}>
    <div className="flex field-width btn-group">
      {options.map((option, i) => <button className={cx("btn btn-sm flex-grow", { "btn-active": option.value === value })} key={i} onClick={() => onChange(option.value)}>{option.label}</button>)}
    </div>
  </Container>
});


interface NewSelectProps extends SelectProps, InputBaseProps { }
const NewSelect: FC<NewSelectProps> = ({ label, ...props }) => {
  const id = useId();
  return (
    <Container label={label} id={id}>
      <Select className="react-select field-width"
        inputId={id}
        {...props}
        menuPlacement="auto"
        // menuPosition="fixed"
        styles={{
          input: (base) => ({
            ...base,
            fontSize: "0.875rem",
            height: "auto",
            margin: 0
          }),
          container: (base) => ({
            ...base,
            fontSize: "0.875rem",
            height: "2rem",
            minHeight: "2rem",
          }),
          menu: base => ({
            ...base,
            zIndex: 1000,
            justifySelf: 'end',
            placeSelf: 'end',
            alignSelf: 'end',
            right: 0,
            overflow: 'hidden',
            borderRadius: 'var(--rounded-box, 0.5rem)',
            width: 200,
            backgroundColor: 'hsl(var(--b1) / var(--tw-bg-opacity))',
          }),
          menuList: base => ({
            ...base,
            "::-webkit-scrollbar": {
              display: 'none'
            },
          }),
          option: (base, state) => ({
            ...base,
            cursor: 'pointer',
            textTransform: 'capitalize',
            backgroundColor: state.isSelected ? 'hsl(var(--p) / var(--tw-bg-opacity))' :
              (state.isFocused ? 'hsl(var(--p) / 0.5)' : 'hsl(var(--b1) / var(--tw-bg-opacity))'),
            color: state.isSelected ? 'hsl(var(--pc) / var(--tw-text-opacity))' : 'inherit',
            '--tw-bg-opacity': 1,
            '--tw-text-opacity': 1,
            '&:hover': {
              // color: 'hsl(var(--pc) / var(--tw-text-opacity))',
              backgroundColor: state.isSelected ? 'hsl(var(--p) / var(--tw-bg-opacity))' : 'hsl(var(--p) / 0.2)',
            },
          }),
          valueContainer: (baseStyles, state) => ({
            ...baseStyles,
            fontSize: "0.875rem",
            height: "2rem",
            minHeight: "2rem",
          }),
          singleValue: (baseStyles, state) => ({
            ...baseStyles,
            fontWeight: 600,
            textTransform: 'capitalize',
            color: "hsla(var(--bc) / var(--tw-text-opacity, 1))"
          }),
          indicatorSeparator: state => ({
            display: 'none',
          }),
          indicatorsContainer: (baseStyles, state) => ({
            ...baseStyles,
            fontSize: "0.875rem",
            height: "2rem",
            minHeight: "2rem",
          }),
          placeholder: (baseStyles, state) => ({
            ...baseStyles
          }),
          control: (baseStyles, state) => ({
            ...baseStyles,
            fontSize: "0.875rem",
            height: "2rem",
            minHeight: "2rem",
            "--tw-border-opacity": 0.2,
            "--tw-bg-opacity": 1,
            borderWidth: '1px',
            backgroundColor: 'hsl(var(--b1) / var(--tw-bg-opacity))',
            borderRadius: 'var(--rounded-btn, 0.5rem)',
            borderColor: 'hsl(var(--bc) / var(--tw-border-opacity))',
          }),
        }} />
    </Container>
  )
}

interface CheckboxTextProps extends InputBaseProps {
  onChange?: (value: boolean) => void,
  value?: boolean
}

const DoubleCountainer: FC<PropsWithChildren<{ label: string }>> = ({ label, children }) => {
  return <Container label={label}>
    <div className="field-width flex space-x-2">
      {children}
    </div>
  </Container>
}

/* margin: 0.25rem 0; */
const Checkbox: FC<CheckboxTextProps> = memo(({ label, value, onChange }) => {
  const id = useId();
  return (
    <Container label={label} id={id}>
      <input className="toggle toggle-primary" id={id} type="checkbox" onChange={e => onChange?.(e.target.checked)} checked={value} />
    </Container>
  )
})

export default { BaseText, Text, Chips, Range, Color, Select: NewSelect, Checkbox, DoubleCountainer };