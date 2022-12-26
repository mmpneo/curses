import { useId } from "@floating-ui/react-dom-interactions";
import classNames from "classnames/bind";
import { FC, InputHTMLAttributes, memo, PropsWithChildren, ReactNode, useEffect, useRef, useState } from "react";
import Select, { MenuListProps, MenuProps, OptionProps, Props as SelectProps } from 'react-select';
import { RgbaColorPicker, RgbaColor } from "react-colorful";
import Dropdown from "../dropdown/Dropdown";
import { FileState, FileType } from "../../frontend-services/files/schema";
import FileElement from "../../frontend-services/components/file-element";
import NiceModal from "@ebay/nice-modal-react";
import { RiUpload2Fill } from "react-icons/ri";
import SimpleBar from "simplebar-react";

// import "ace-builds/src-noconflict/mod";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-css";
import "ace-builds/src-noconflict/ext-language_tools";
import "ace-builds/src-noconflict/theme-twilight";
import { ServiceNetworkState, TextEventSource } from "../../types";

import styles from "./style.module.css"
const cx = classNames.bind(styles);

interface InputBaseProps {
  label: string
}

const Container: FC<PropsWithChildren<{ id?: string, vertical?: boolean, label: string }>> = memo(({ id, vertical, label, children }) => {
  const layout = vertical ? "flex-col space-y-2" : "justify-between items-center"
  return <div className={cx("flex min-h-8", layout)}>
    <label className="flex-grow font-medium text-base-content text-xs cursor-pointer" htmlFor={id}>{label}</label>
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

  return <div className="flex flex-col space-y-2 dropdown p-2">
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
  return <Dropdown targetOffset={24} placement="right" content={<ColorSelectDropdown {...rest} />}>
    <Container label={label} id={label}>
      <div className="field-width grid grid-cols-2 gap-2">
        <div></div>
        <div className="btn btn-sm" style={{ backgroundColor: rest.value as string }}></div>
      </div>
    </Container>
  </Dropdown>
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

const SelectMenu: FC<MenuProps> = ({innerRef, innerProps, ...props}) => {
  return <>
    <div {...innerProps} ref={innerRef as any} className="absolute flex flex-col justify-start w-56 z-50 right-0 top-10 bg-base-100 rounded-box shadow-lg">
      <SimpleBar className="h-full max-h-64 flex flex-col">
        {props.children}
      </SimpleBar>
    </div>
  </>
};
const SelectMenuList: FC<MenuListProps> = ({innerRef, innerProps, ...props}) => {
  return <ul className="flex flex-col menu menu-compact p-2 w-full">
    {props.children}
  </ul>
};
const SelectOption: FC<OptionProps> = ({innerRef, innerProps, ...props}) => {
  const ref = useRef<HTMLDivElement>()
  useEffect(() => {
    if (props.isFocused)
      ref.current?.scrollIntoView({block: 'nearest', behavior: 'smooth'});
  }, [props.isFocused])
  return <li><a onClick={() => props.selectOption(props.data)} ref={ref as any} className={cx("font-medium", {
    disabled: props.isDisabled,
    "bg-neutral/60 text-neutral-content": props.isFocused,
    active: props.isSelected})}>{props.children}</a></li>
};

interface NewSelectProps extends SelectProps, InputBaseProps { }
const NewSelect: FC<NewSelectProps> = ({ label, ...props }) => {
  const id = useId();
  return (
    <Container label={label} id={id}>
      <Select components={{
        Menu: SelectMenu,
        MenuList: SelectMenuList,
        Option: SelectOption,
      }} className="react-select field-width"
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
          valueContainer: (baseStyles, state) => ({
            ...baseStyles,
            paddingRight: 0,
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
            paddingLeft: 0,
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

interface FileProps extends InputBaseProps {
  type: FileType,
  value: string,
  onChange: (value: string) => void
}
const File: FC<FileProps> = ({ label, type, onChange, value }) => {
  const [file, setFile] = useState<FileState>();

  useEffect(() => {
    const f = window.APIFrontend.files.getFileData(value);
    setFile(f ?? undefined);
  }, [value]);

  const handleAdd = async () => {
    try {
      const resp = await window.APIFrontend.files.addFile(type);
      if (resp?.[0]) {
        onChange(resp[0]);
      }
    } catch (error) { }
  }

  const handleSelect = async () => {
    const resp = await NiceModal.show('files', { select: type });
    if (resp && typeof resp === "string") onChange(resp);
  }

  return <Container label={label} vertical>
    {file && <FileElement actions={[
      { label: "Clear", fn: () => onChange("") },
      { label: "Change", fn: handleSelect },
    ]} data={file} />}
    {!file && <div className="flex items-center space-x-2">
      <div onClick={handleAdd} className="cursor-pointer text-base-content p-2 flex-none relative border-2 border-primary/10 border-dashed bg-base-100 rounded-lg w-14 h-14 flex items-center justify-center overflow-hidden">
        <RiUpload2Fill className="text-xl" />
      </div>
      <div className="flex flex-col items-start text-sm">
        <span className="font-medium link link-accent link-hover">Upload file</span>
        <span className="font-medium">or select from <span onClick={handleSelect} className="link link-accent link-hover">exising</span></span>
        {/* <button onClick={handleSelect} className="flex-grow btn btn-sm btn-primary">Select existing file</button> */}
      </div>
    </div>}
  </Container>
}

interface EventProps extends InputBaseProps {
  onChange: (value: string) => void,
  value: string
}
const Event: FC<EventProps> = memo(({ label, value, onChange }) => {
  const events = Array.from(window.API.pubsub.registeredEvents.values());
  return <NewSelect options={events} label={label} defaultValue={events.find(e => e.value === value)} onChange={(e: any) => { console.log(e); onChange(e.value || "") }} />
});

const sourceOptions = [
  { label: 'Speech to Text', value: TextEventSource.stt },
  { label: 'Translation', value: TextEventSource.translation },
]
interface TextSourceProps extends InputBaseProps {
  onChange: (value: TextEventSource) => void,
  value: string
}
const TextSource: FC<TextSourceProps> = memo(({ label, value, onChange }) => {
  return <NewSelect label={label} value={sourceOptions.find(o => o.value === value)} options={sourceOptions} onChange={(e: any) => onChange(e.value as any)} placeholder="Text source"  />
});

interface CodeProps extends InputBaseProps {
  value: string,
  language: string,
  onChange: (value: string | undefined) => void
}

interface NetworkStatusProps extends InputBaseProps {
  value: ServiceNetworkState
}
const NetworkStatus: FC<NetworkStatusProps> = ({label, value}) => {
  return <Container label={label}>
    <div className="self-end flex space-x-2 items-center pl-2 pr-3 h-8 py-1 rounded-full bg-neutral/50 border-dashed border-neutral">
      {value === ServiceNetworkState.disconnected && <>
        <span className="text-xs font-semibold text-error leading-none">Disconnected</span>
        <div className="rounded-full ring-2 bg-error ring-error ring-offset-base-100 ring-offset-2 w-2 h-2 "/>
      </>}
      {value === ServiceNetworkState.connecting && <>
        <span className="text-xs font-semibold text-erroneutralr leading-none">Connecting..</span>
        <div className="rounded-full ring-2 bg-neutral ring-neutral ring-offset-base-100 ring-offset-2 w-2 h-2 "/>
      </>}
      {value === ServiceNetworkState.connected && <>
        <span className="text-xs font-semibold text-success leading-none">Connected</span>
        <div className="rounded-full ring-2 bg-success ring-success ring-offset-base-100 ring-offset-2 w-2 h-2 "/>
      </>}
      {value === ServiceNetworkState.error && <>
        <span className="text-xs font-semibold text-red-500 leading-none">Error</span>
        <div className="rounded-full ring-2 bg-red-500 ring-red-500 ring-offset-base-100 ring-offset-2 w-2 h-2 "/>
      </>}
      </div>
  </Container>
}

const Code: FC<CodeProps> = memo(({ label, ...rest }) => {
  return <Container label={label} vertical>
    <AceEditor
      showGutter={false}
      enableLiveAutocompletion
      width="100%"
      className="w-full"
      mode="css"
      theme="twilight"
      value={rest.value}
      onChange={rest.onChange}
      name="UNIQUE_ID_OF_DIV"
      editorProps={{ $blockScrolling: true }}
    />
  </Container>
});

export default { BaseText, Text, Chips, Range, Color, Select: NewSelect, Checkbox, File, Event, Code, TextSource, Container, DoubleCountainer, NetworkStatus };