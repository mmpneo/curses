import NiceModal from "@ebay/nice-modal-react";
import { useId } from "@floating-ui/react-dom-interactions";
import classNames from "classnames/bind";
import { FC, InputHTMLAttributes, memo, PropsWithChildren, ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { RgbaColor, RgbaColorPicker } from "react-colorful";
import { RiDeleteBack2Fill, RiUpload2Fill, RiKeyboardBoxFill } from "react-icons/ri";
import Select, { MenuListProps, MenuProps, OptionProps, Props as SelectProps } from 'react-select';
import SimpleBar from "simplebar-react";
import FileElement from "../../frontend-services/components/file-element";
import { FileState, FileType } from "../../frontend-services/files/schema";
import Dropdown from "../dropdown/Dropdown";

// import "ace-builds/src-noconflict/mod";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/ext-language_tools";
import "ace-builds/src-noconflict/mode-css";
import "ace-builds/src-noconflict/theme-twilight";
import { MappedGroupDictionary, ServiceNetworkState, TextEventSource } from "../../types";

import { useSnapshot } from "valtio";
import styles from "./style.module.css";
import produce from "immer";
import { BackendState } from "../../backend-services/schema";
import Tooltip from "../dropdown/Tooltip";
const cx = classNames.bind(styles);

interface InputBaseProps {
  label: string
}

const Container: FC<PropsWithChildren<{ id?: string, vertical?: boolean, label: string }>> = memo(({ id, vertical, label, children }) => {
  const layout = vertical ? "flex-col space-y-2" : "justify-between items-center"
  return <div className={cx("flex min-h-8", layout)}>
    <label className="flex-grow font-medium text-base-content/80 text-xs cursor-pointer" htmlFor={id}>{label}</label>
    {children}
  </div>
});

const BaseText: FC<InputHTMLAttributes<HTMLInputElement>> = memo((props: any) => <input {...props} className={cx(styles.clearAppearance, "field-width input input-bordered overflow-hidden input-sm font-semibold leading-none")} />);

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

const SelectMenu: FC<MenuProps> = ({ innerRef, innerProps, ...props }) => {
  return <>
    <div {...innerProps} ref={innerRef as any} className="absolute flex flex-col justify-start w-56 z-50 right-0 top-10 bg-base-100 rounded-box shadow-lg">
      <SimpleBar className="h-full max-h-64 flex flex-col">
        {props.children}
      </SimpleBar>
    </div>
  </>
};
const SelectMenuList: FC<MenuListProps> = ({ innerRef, innerProps, ...props }) => {
  return <ul className="flex flex-col menu menu-compact p-2 w-full">
    {props.children}
  </ul>
};
const SelectOption: FC<OptionProps> = ({ innerRef, innerProps, ...props }) => {
  const ref = useRef<HTMLDivElement>()
  useEffect(() => {
    if (props.isFocused)
      ref.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [props.isFocused])
  return <li><a onClick={() => props.selectOption(props.data)} ref={ref as any} className={cx("font-medium capitalize", {
    disabled: props.isDisabled,
    "bg-neutral/60 text-neutral-content": props.isFocused,
    active: props.isSelected
  })}>{props.children}</a></li>
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
        <span className="font-medium link link-accent link-hover">Add new file</span>
        <span className="font-medium">or select from <span onClick={handleSelect} className="link link-accent link-hover">library</span></span>
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
  return <NewSelect options={events} label={label} defaultValue={events.find(e => e.value === value)} onChange={(e: any) => onChange(e.value || "")} />
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
  return <NewSelect label={label} value={sourceOptions.find(o => o.value === value)} options={sourceOptions} onChange={(e: any) => onChange(e.value as any)} placeholder="Text source" />
});

interface CodeProps extends InputBaseProps {
  value: string,
  language: string,
  onChange: (value: string | undefined) => void
}

interface NetworkStatusProps extends InputBaseProps {
  value: ServiceNetworkState
}
const NetworkStatus: FC<NetworkStatusProps> = ({ label, value }) => {
  return <Container label={label}>
    <div className="self-end flex space-x-2 items-center pl-2 pr-3 h-8 py-1 rounded-full bg-neutral/50 border-dashed border-neutral">
      {value === ServiceNetworkState.disconnected && <>
        <span className="text-xs font-semibold text-error leading-none">Disconnected</span>
        <div className="rounded-full ring-2 bg-error ring-error ring-offset-base-100 ring-offset-2 w-2 h-2 " />
      </>}
      {value === ServiceNetworkState.connecting && <>
        <span className="text-xs font-semibold text-erroneutralr leading-none">Connecting..</span>
        <div className="rounded-full ring-2 bg-neutral ring-neutral ring-offset-base-100 ring-offset-2 w-2 h-2 " />
      </>}
      {value === ServiceNetworkState.connected && <>
        <span className="text-xs font-semibold text-success leading-none">Connected</span>
        <div className="rounded-full ring-2 bg-success ring-success ring-offset-base-100 ring-offset-2 w-2 h-2 " />
      </>}
      {/* {value === ServiceNetworkState.error && <>
        <span className="text-xs font-semibold text-red-500 leading-none">Error</span>
        <div className="rounded-full ring-2 bg-red-500 ring-red-500 ring-offset-base-100 ring-offset-2 w-2 h-2 " />
      </>} */}
    </div>
  </Container>
}

interface MappedGroupSelectProps {
  labelGroup: string,
  labelOption: string
  library: MappedGroupDictionary,
  value: { group: string, option: string },
  onChange: (v: { group: string, option: string }) => void,
}
const MappedGroupSelect: FC<MappedGroupSelectProps> = memo(({ labelGroup, labelOption, value, onChange, library }) => {
  const handleSelectGroup = (group: string) => {
    onChange({ group, option: library[group]?.[0]?.[0] || "" });
  }
  const handleSelectOption = (opt: string) => onChange({ group: value.group, option: opt });

  const getCurrentOption = useCallback(() => {
    if (!library[value.group] || !value.option)
      return null;
    const v = library[value.group].find(l => l[0] === value.option);
    return v ? { value: v[0], label: v[1] ?? v[0] } : null;
  }, [value]);

  const getGroupOptions = useCallback(() => {
    return Object.keys(library).map((key) => ({ label: key, value: key }));
  }, []);

  const getCurrentOptions = useCallback(() => {
    if (!value.group)
      return [];
    return library[value.group]?.map((v: any) => ({ value: v[0], label: v[1] ?? v[0] })) || [];
  }, [value]);

  return <>
    <NewSelect
      options={getGroupOptions()}
      label={labelGroup}
      value={{ label: value.group, value: value.group }}
      onChange={(e: any) => handleSelectGroup(e.value)} />

    {getCurrentOptions().length > 1 && <NewSelect
      options={getCurrentOptions()}
      label={labelOption}
      value={getCurrentOption()}
      onChange={(e: any) => handleSelectOption(e.value)} />}
  </>
});

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

interface FontProps extends InputBaseProps {
  value: string,
  onChange: (value: string) => void
}
const FontSelectDropdown: FC<any> = memo(({ onChange, value }) => {
  const [name, setName] = useState("");
  const fonts = useSnapshot(window.APIFrontend.files.ui.fontFamilies)

  const handleInstall = () => {
    name && window.APIFrontend.files.installFont(name.trim());
  }

  return <div className="flex flex-col space-y-2 bg-base-100 rounded-box p-4 w-64">
    <span className="text-xs text-primary font-bold font-header">Installed</span>
    <label className="flex justify-between items-center cursor-pointer">
      <span className="label-text font-semibold" style={{ fontFamily: "Outfit" }}>Outfit</span>
      <input type="radio" name="font" value={value} checked={value === "Outfit"} onChange={e => onChange("Outfit")} className="radio radio-primary" />
    </label>
    {fonts.map(font => <label key={font} className="flex justify-between items-center cursor-pointer">
      <span className="label-text font-semibold" style={{ fontFamily: font }}>{font}</span>
      <input type="radio" name="font" value={value} checked={value === font} onChange={e => onChange(font)} className="radio radio-primary" />
    </label>)}
    <div className="input-group w-full">
      <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Font name" className="w-full input input-sm input-bordered" />
      <button className="btn btn-sm btn-square" onClick={handleInstall}>+</button>
    </div>
    <span className="text-xs text-base-content/50">Find font at <a className="link link-primary link-hover font-medium" target="_blank" href="https://fonts.google.com/">Google Fonts</a> and copypaste it's name here</span>
  </div>
})
const Font: FC<FontProps> = memo(({ label, ...rest }) => {
  return <Dropdown targetOffset={24} placement="right" content={<FontSelectDropdown {...rest} />}>
    <Container label={label}>
      <div style={{ fontFamily: rest.value || "inherit" }} className="cursor-pointer hover:bg-base-300 leading-none flex items-center input input-bordered input-sm field-width">{rest.value || "Select font"}</div>
    </Container>
  </Dropdown>
})

type ObjectRecord = Record<string, string>;
interface ObjectProps extends InputBaseProps {
  value: ObjectRecord,
  onChange: (value: ObjectRecord) => void,
  keyPlaceholder?: string,
  valuePlaceholder?: string,
  addLabel?: string
}
const MapObject: FC<ObjectProps> = memo(({ label, onChange, ...rest }) => {
  const [value, setValue] = useState<ObjectRecord>(rest.value);

  const handleAdd = () => {
    if (value[" "])
      return;
    const newVal = produce(value, v => { v[""] = ""; });
    setValue(newVal);
    onChange(newVal);
  };
  const handleRemove = (key: string) => {
    const newVal = produce(value, v => { delete v[key]; });
    setValue(newVal);
    onChange(newVal);
  };

  const handleUpdateKey = (oldKey: string, newKey: string) => {
    if (newKey.includes(" ") || value[newKey])
      return;
    // preserve key order
    const ent = Object.entries(value).map(([k, v]) => [k === oldKey ? newKey : k, v]);
    const v = Object.fromEntries(ent);
    setValue(v);
    onChange(v);
  }
  const handleUpdateValue = (key: string, val: string) => {
    const newVal = produce(value, v => { v[key] = val; });
    setValue(newVal);
    onChange(newVal);
  }

  return <Container vertical label={label}>
    <div className="flex flex-col space-y-2">
      {!Object.keys(value).length && <div className="h-20 px-4 flex justify-center items-center rounded-md border-2 border-primary/10 border-dashed ">
        <span className="text-sm font-medium text-center">
          Nothing here <br/> <span className="text-primary cursor-pointer font-semibold" onClick={handleAdd}>{rest.addLabel || "Add pair"}</span>
        </span>
      </div>}
      {Object.entries(value).map(([key,], i) => <div key={i} className="flex space-x-2">
        <BaseText placeholder={rest.keyPlaceholder || "Key"} value={key} onChange={v => handleUpdateKey(key, v.target.value)} />
        <BaseText placeholder={rest.valuePlaceholder || "Value"} value={value[key]} onChange={v => handleUpdateValue(key, v.target.value)} />
        <button className="btn btn-sm btn-circle btn-ghost" onClick={() => handleRemove(key)}><RiDeleteBack2Fill /></button>
      </div>)}
      {Object.keys(value).length > 0 && <button className="btn btn-sm btn-neutral" onClick={handleAdd}>{rest.addLabel || "Add pair"}</button>}
    </div>
  </Container>
})

interface ShortuctProps extends InputBaseProps {
  shortcut: keyof BackendState["shortcuts"],
  value?: string,
  onChange?: (value: string) => void
}
const Shortcut: FC<ShortuctProps> = ({shortcut, label, onChange, ...rest}) => {
  const id = useId();
  const {shortcuts} = useSnapshot(window.API.state);

  const startRecord = () => {
    window.API.keyboard.startShortcutRecord(shortcut);
  }
  const stopRecord = () => {
    window.API.keyboard.confirmShortcutRecord();
  }

  return <Container vertical label={label} id={id}>
    <div className="input-group w-full">
      <input type="text" value={shortcuts[shortcut]} id={id} disabled className="w-full input input-sm input-bordered" />
      <Tooltip content="Listen" className="btn btn-sm btn-primary btn-square">
        <button className="w-full h-full flex items-center justify-center" onClick={startRecord}><RiKeyboardBoxFill/></button>
      </Tooltip>
    </div>
    {/* <BaseText disabled type="text" /> */}
  </Container>
}

export default { BaseText, Text, Chips, Object: MapObject, Range, Color, Font, Select: NewSelect, MappedGroupSelect, Checkbox, File, Event, Code, TextSource, Container, DoubleCountainer, NetworkStatus, Shortcut };