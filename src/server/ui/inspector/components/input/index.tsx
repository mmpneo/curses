import NiceModal from "@ebay/nice-modal-react";
import { useId } from "@floating-ui/react";
import classNames from "classnames/bind";
import { ChangeEvent, FC, forwardRef, InputHTMLAttributes, memo, PropsWithChildren, ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { RgbaColor, RgbaColorPicker } from "react-colorful";
import { RiUpload2Fill, RiKeyboardBoxFill, RiDeleteBin3Fill, RiCheckboxCircleFill, RiAddCircleFill, RiEdit2Fill, RiCloseCircleFill, RiFolder2Line, RiFile3Line } from "react-icons/ri";
import { HiChevronDown, HiChevronUp } from "react-icons/hi";
import FileElement                                                     from "../../../file-element";
import { FileState, FileType }                                         from "@/client/services/files/schema";
import Dropdown                                                        from "../../../dropdown/Dropdown";

// import "ace-builds/src-noconflict/mod";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/ext-language_tools";
import "ace-builds/src-noconflict/mode-css";
import "ace-builds/src-noconflict/theme-twilight";
import { MappedGroupDictionary, ServiceNetworkState, TextEventSource } from "@/types";

import { useSnapshot }  from "valtio";
import styles           from "./style.module.css";
import produce          from "immer";
import { BackendState } from "../../../../schema";
import Tooltip          from "../../../dropdown/Tooltip";
import { invoke }       from "@tauri-apps/api/tauri";
import { open, OpenDialogOptions } from '@tauri-apps/api/dialog';
const cx = classNames.bind(styles);
import { useTranslation } from 'react-i18next';

interface InputBaseProps {
  label: string
  labelOptions?: any
}

export const InputContainer: FC<PropsWithChildren<{ id?: string, vertical?: boolean, label: string }>> = memo(({ id, vertical, label, children }) => {
  const {t} = useTranslation();
  const layout = vertical ? "flex-col space-y-2" : "justify-between items-center"
  return <div className={cx("flex min-h-8", layout)}>
    <label className="flex-grow font-medium text-base-content/80 text-xs cursor-pointer" htmlFor={id}>{t(label)}</label>
    {children}
  </div>
});

export const InputBaseText = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & {fieldWidth?: boolean}>(({ value, onChange, fieldWidth = true, ...props }, ref) => {
  const [internalValue, setInternalValue] = useState(value);
  useEffect(() => {
    if (value !== internalValue)
      setInternalValue(value);
  }, [value])
  const updateVal = (val: ChangeEvent<HTMLInputElement>) => {
    setInternalValue(val.target.value);
    onChange?.(val);
  };
  return <input {...props} ref={ref} value={internalValue} onChange={updateVal} className={cx(styles.clearAppearance, props.className, { "field-width": fieldWidth }, "input input-bordered overflow-hidden input-sm font-semibold leading-none")} />;
});

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
const clampAlpha = (v: number) => v ? Math.max(0, Math.min(1, v)) : 0;
const rgbaToString = (e: RgbaColor) => {
  return `rgba(${clampRGB(e.r)},${clampRGB(e.g)},${clampRGB(e.b)},${clampAlpha(e.a) || 0})`
}

export const InputText: FC<InputTextProps> = memo(({ label, ...rest }) => {
  const id = useId();
  return <InputContainer label={label} id={id}><InputBaseText id={id} className="flex-none" type="text" {...rest} /></InputContainer>
});

interface InputFilePathProps extends InputBaseProps, InputHTMLAttributes<HTMLInputElement> {
  value: string,
  dialogOptions?: OpenDialogOptions,
  onPathSelected?: (path: string) => void,
}

export const InputFilePath: FC<InputFilePathProps> = ({ label, value, onChange, onPathSelected, dialogOptions }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const options: OpenDialogOptions = { ...dialogOptions };

  const handleButtonClick = async () => {
    try {
      const input = inputRef.current;
      const path = await open({ defaultPath: input?.value, ...options });
      if (input && path && typeof path === 'string') {
        const property = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
        property?.set?.call(input, path);
        input.dispatchEvent(new Event('input', { bubbles: true }));
        onPathSelected?.(path);
      }
    } catch (error) {
      toast.error('Error selecting path: ' + error);
    }
  };

  return <InputContainer label={label} vertical>
    <div className="flex">
      <InputBaseText ref={inputRef} value={value} onChange={onChange} fieldWidth={false} className="rounded-r-none w-full" />
      <button onClick={handleButtonClick} className="btn btn-square btn-sm rounded-l-none">
        {options.directory ? <RiFolder2Line /> : <RiFile3Line />}
      </button>
    </div>
  </InputContainer>
};

const ColorSelectDropdown: FC<any> = ({ onChange, value }) => {
  const [rgba, setRgba] = useState(stringToRgba(value));
  const handleChange = (e: RgbaColor) => onChange(rgbaToString(e));

  useEffect(() => {
    setRgba(stringToRgba(value));
  }, [value]);

  const handlePartialChange = (k: keyof RgbaColor, e: string) => {
    onChange(rgbaToString({ ...rgba, [k]: parseFloat(e) }))
  }

  return <div className="colorPicker flex flex-col dropdown p-4 space-y-4">
    <RgbaColorPicker className={cx(styles.colorPicker)} onChange={handleChange} color={stringToRgba(value)} />
    <div className="input-group">
      <input type="number" value={rgba.r} onChange={e => handlePartialChange("r", e.target.value)} className={cx(styles.clearAppearance, "w-full input input-xs input-bordered font-semibold leading-none")} />
      <input type="number" value={rgba.g} onChange={e => handlePartialChange("g", e.target.value)} className={cx(styles.clearAppearance, "w-full input input-xs input-bordered font-semibold leading-none")} />
      <input type="number" value={rgba.b} onChange={e => handlePartialChange("b", e.target.value)} className={cx(styles.clearAppearance, "w-full input input-xs input-bordered font-semibold leading-none")} />
      <input type="number" value={rgba.a} min="0" max="1" step="0.05" onChange={e => handlePartialChange("a", e.target.value)} className={cx(styles.clearAppearance, "w-full input input-xs input-bordered font-semibold leading-none")} />
    </div>
  </div>
}
interface InputColorProps extends InputBaseProps {
  onChange: (color: string) => void,
  value: string
}
export const InputColor: FC<InputColorProps> = memo(({ label, ...rest }) => {
  return <Dropdown targetOffset={24} placement="right" content={<ColorSelectDropdown {...rest} />}>
    <InputContainer label={label} id={label}>
      <div className="field-width grid grid-cols-2 gap-2">
        <div></div>
        <div className="cursor-pointer hover:bg-base-300 input input-bordered input-sm" style={{ backgroundColor: rest.value as string }}></div>
      </div>
    </InputContainer>
  </Dropdown>
});

//margin: 0.375rem 0;
export const InputRange: FC<InputTextProps> = memo(({ label, ...rest }) => {
  const id = useId();
  return <InputContainer label={label} id={id}>
    <div className="flex space-x-2">
      <span>{rest.value}</span>
      <input {...rest} id={id} type="range" className="field-width range range-sm range-primary" />
    </div>
  </InputContainer>
});

interface ChipsProps extends InputBaseProps {
  options: {
    value: string | number
    label: ReactNode
  }[],
  onChange: (value: string | number) => void,
  value?: string | number
}
export const InputChips: FC<ChipsProps> = memo(({ label, value, options, onChange }) => {
  const id = useId();
  return <InputContainer label={label} id={id}>
    <div className="flex field-width btn-group">
      {options.map((option, i) => <button className={cx("btn btn-sm flex-grow", { "btn-active": option.value === value })} key={i} onClick={() => onChange(option.value)}>{option.label}</button>)}
    </div>
  </InputContainer>
});

import * as RadixSelect from '@radix-ui/react-select';
import { toast } from "react-toastify";

const SelectItem = forwardRef<HTMLDivElement, PropsWithChildren<any>>(({ children, className, ...props }: any, ref) => {
  return (
    <RadixSelect.Item className="px-3 py-2 text-sm font-semibold flex items-center duration-100 rounded-btn transition-colors cursor-pointer data-[highlighted]:outline-none data-[highlighted]:bg-base-content/10 data-[highlighted]:text-base-content" {...props} ref={ref}>
      <RadixSelect.ItemText className="font-semibold">{children}</RadixSelect.ItemText>
      <RadixSelect.ItemIndicator className="absolute left-1 inline-flex items-center justify-center opacity-50">
        {/* • */}
        <RiCheckboxCircleFill color="current"/>
        {/* <IconCheck size={18}/> */}
        </RadixSelect.ItemIndicator>
    </RadixSelect.Item>
  );
});

export type InputSelectOption = { label: string; value: string };
interface NewNewSelectProps extends InputBaseProps, RadixSelect.SelectProps {
  options: (InputSelectOption | {label: string, options: InputSelectOption[]})[];
}
export const InputSelect: FC<NewNewSelectProps> = ({ options, ...props }) => {
  const id = useId();
  return (
    <InputContainer label={props.label} id={id}>
      <RadixSelect.Root key={props.value} {...props}>
          <RadixSelect.Trigger className="input relative input-sm pr-4 truncate input-bordered field-width font-semibold text-start">
            <RadixSelect.Value placeholder="Select"/>
            <RadixSelect.Icon className="text-primary absolute right-1 self-center top-2">
              <HiChevronDown />
            </RadixSelect.Icon>
          </RadixSelect.Trigger>
          <RadixSelect.Portal>
            <RadixSelect.Content className="z-50 overflow-hidden bg-base-100 border-base-content/20 border rounded-btn shadow-xl">
              <RadixSelect.ScrollUpButton className="flex items-center justify-center cursor-default h-4">
                <HiChevronUp/>
              </RadixSelect.ScrollUpButton>
              <RadixSelect.Viewport className="p-2 bg-base-100 space-y-1">
                {options?.map((item) => {
                if ("options" in item) {
                  return <RadixSelect.Group key={item.label}>
                    <RadixSelect.Label className="p-2 text-sm font-semibold text-primary">{item.label}</RadixSelect.Label>
                    {item.options?.map((item) => <SelectItem value={item.value} key={item.value}>
                      {item.label}
                    </SelectItem>)}
                  </RadixSelect.Group>
                }
                else if ("value" in item) {
                  return <SelectItem value={item.value} key={item.value}>
                    {item.label}
                  </SelectItem>
                }
                })}
              </RadixSelect.Viewport>
              <RadixSelect.ScrollDownButton className="flex items-center justify-center cursor-default h-4">
                <HiChevronDown/>
              </RadixSelect.ScrollDownButton>
            </RadixSelect.Content>
          </RadixSelect.Portal>
        </RadixSelect.Root>
    </InputContainer>
  );
};

interface CheckboxTextProps extends InputBaseProps {
  onChange?: (value: boolean) => void,
  value?: boolean
}

export const InputDoubleCountainer: FC<PropsWithChildren<{ label: string }>> = ({ label, children }) => {
  return <InputContainer label={label}>
    <div className="field-width flex space-x-2">
      {children}
    </div>
  </InputContainer>
}


export const InputCheckbox: FC<CheckboxTextProps> = memo(({ label, value, onChange }) => {
  const id = useId();
  return (
    <InputContainer label={label} id={id}>
      <input className="toggle toggle-neutral" id={id} type="checkbox" onChange={e => onChange?.(e.target.checked)} checked={value} />
    </InputContainer>
  )
})

interface FileProps extends InputBaseProps {
  type: FileType,
  value: string,
  onChange: (value: string) => void
}
export const InputFile: FC<FileProps> = ({ label, type, onChange, value }) => {
  const {t} = useTranslation();
  const [file, setFile] = useState<FileState>();

  useEffect(() => {
    const f = window.ApiClient.files.getFileData(value);
    setFile(f ?? undefined);
  }, [value]);

  const handleAdd = async () => {
    try {
      const resp = await window.ApiClient.files.addFile(type);
      if (resp?.[0]) {
        onChange(resp[0]);
      }
    } catch (error) { }
  }

  const handleSelect = async () => {
    const fileId = await NiceModal.show('files', { select: type });
    if (fileId && typeof fileId === "string") onChange(fileId);
  }

  return <InputContainer label={label} vertical>
    {file && <FileElement actions={[
      { label: t('files.btn_clear_file'), fn: () => onChange("") },
      { label: t('files.btn_change_file'), fn: handleSelect },
    ]} data={file} />}
    {!file && <div className="flex items-center space-x-2">
      <div onClick={handleAdd} className="cursor-pointer text-base-content p-2 flex-none relative border-2 border-primary/10 border-dashed bg-base-100 rounded-lg w-14 h-14 flex items-center justify-center overflow-hidden">
        <RiUpload2Fill className="text-xl" />
      </div>
      <div className="flex flex-col items-start text-sm">
        <span className="font-semibold link link-primary link-hover" onClick={handleAdd}>{t('files.add_file')}</span>
        <span className="font-semibold link link-accent link-hover" onClick={handleSelect}>{t('files.btn_select_library')}</span>
        {/* <button onClick={handleSelect} className="flex-grow btn btn-sm btn-primary">Select existing file</button> */}
      </div>
    </div>}
  </InputContainer>
}

interface EventProps extends InputBaseProps {
  onChange: (value: string) => void,
  value: string
}
export const InputEvent: FC<EventProps> = memo(({ label, value, onChange }) => {
  const events = Array.from(window.ApiShared.pubsub.registeredEvents.values());
  return <InputSelect options={events} label={label} defaultValue={value} onValueChange={e => onChange(e || "")} />
});

interface TextSourceProps extends InputBaseProps {
  onChange: (value: TextEventSource) => void,
  value: string
}
export const InputTextSource: FC<TextSourceProps> = memo(({ label, value, onChange }) => {
  const {t} = useTranslation();
  return <InputSelect label={label} value={value} options={[
    { label: t('stt.title'), value: TextEventSource.stt },
    { label: t('transl.title'), value: TextEventSource.translation },
  ]} onValueChange={onChange} />
});

interface CodeProps extends InputBaseProps {
  value: string,
  language: string,
  onChange: (value: string | undefined) => void
}

interface NetworkStatusProps extends InputBaseProps {
  value: ServiceNetworkState,
  connectedLabel?: string
  disconnectedLabel?: string
  connectingLabel?: string
}
export const InputNetworkStatus: FC<NetworkStatusProps> = ({ label, value, connectedLabel, disconnectedLabel, connectingLabel }) => {
  const {t} = useTranslation()
  return <InputContainer label={label}>
    <div className="self-end flex space-x-2 items-center pl-2 pr-3 h-8 py-1 rounded-full bg-neutral/50 border-dashed border-neutral">
      {value === ServiceNetworkState.disconnected && <>
        <span className="text-xs font-semibold text-error leading-none">{disconnectedLabel || t(`common.status_disconnected`)}</span>
        <div className="rounded-full ring-2 bg-error ring-error ring-offset-base-100 ring-offset-2 w-2 h-2 " />
      </>}
      {value === ServiceNetworkState.connecting && <>
        <span className="text-xs font-semibold text-neutral leading-none">{connectingLabel || t(`common.status_connecting`)}</span>
        <div className="rounded-full ring-2 bg-neutral ring-neutral ring-offset-base-100 ring-offset-2 w-2 h-2 " />
      </>}
      {value === ServiceNetworkState.connected && <>
        <span className="text-xs font-semibold text-success leading-none">{connectedLabel || t(`common.status_connected`)}</span>
        <div className="rounded-full ring-2 bg-success ring-success ring-offset-base-100 ring-offset-2 w-2 h-2 " />
      </>}
      {/* {value === ServiceNetworkState.error && <>
        <span className="text-xs font-semibold text-red-500 leading-none">Error</span>
        <div className="rounded-full ring-2 bg-red-500 ring-red-500 ring-offset-base-100 ring-offset-2 w-2 h-2 " />
      </>} */}
    </div>
  </InputContainer>
}

interface MappedGroupSelectProps {
  labelGroup: string,
  labelOption: string
  library: MappedGroupDictionary,
  value: { group: string, option: string },
  onChange: (v: { group: string, option: string }) => void,
}
export const InputMappedGroupSelect: FC<MappedGroupSelectProps> = memo(({ labelGroup, labelOption, value, onChange, library }) => {
  const handleSelectGroup = (group: string) => {
    onChange({ group, option: library[group]?.[0]?.[0] || "" });
  }
  const handleSelectOption = (opt: string) => onChange({ group: value.group, option: opt });

  const getCurrentOption = useCallback(() => {
    if (!library[value.group] || !value.option)
      return undefined;
    const v = library[value.group].find(l => l[0] === value.option);
    return v?.[0];
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
    <InputSelect 
      label={labelGroup}
      options={getGroupOptions()}
      value={value.group}
      onValueChange={handleSelectGroup}
    />

    {getCurrentOptions().length > 1 && <InputSelect
      options={getCurrentOptions()}
      label={labelOption}
      value={getCurrentOption()}
      onValueChange={handleSelectOption} />}
  </>
});

export const InputCode: FC<CodeProps> = memo(({ label, ...rest }) => {
  return <InputContainer label={label} vertical>
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
  </InputContainer>
});

interface FontProps extends InputBaseProps {
  value: string,
  onChange: (value: string) => void
}
const FontSelectDropdown: FC<any> = memo(({ onChange, value }) => {
  const {t} = useTranslation();
  const [name, setName] = useState("");
  const fonts = useSnapshot(window.ApiClient.files.ui.fontFamilies)

  const handleInstallGFonts = () => {
    name && window.ApiClient.files.installFont(name.trim());
  }

  const handleInstallDrive = () => {
    window.ApiClient.files.addFile("font");
  }

  return <div className="flex flex-col space-y-2 bg-base-100 rounded-box p-4 w-64">
    <span className="text-xs text-primary font-bold font-header">{t('font_select.available_fonts')}</span>
    <label className="flex justify-between items-center cursor-pointer">
      <span className="label-text font-semibold" style={{ fontFamily: "Outfit" }}>Outfit</span>
      <input type="radio" name="font" value={value} checked={value === "Outfit"} onChange={e => onChange("Outfit")} className="radio radio-primary" />
    </label>
    {fonts.map((font, index) => <label key={font || index} className="flex justify-between items-center cursor-pointer">
      <span className="label-text font-semibold" style={{ fontFamily: font }}>{font}</span>
      <input type="radio" name="font" value={value} checked={value === font} onChange={e => onChange(font)} className="radio radio-primary" />
    </label>)}
    <span className="text-xs text-primary font-bold font-header pt-4">{t('font_select.install_google')}</span>
    <div className="input-group w-full">
      <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Font name" className="w-full input input-sm input-bordered" />
      <button className="btn btn-sm btn-square" onClick={handleInstallGFonts}>+</button>
    </div>
    <span className="text-xs text-base-content/50">{t('font_select.install_google_desc')} <a className="link link-primary link-hover font-medium" target="_blank" href="https://fonts.google.com/">Font list</a></span>
    <button className="btn btn-sm btn-primary" onClick={handleInstallDrive}>{t('font_select.btn_install')}</button>
  </div>
})
export const InputFont: FC<FontProps> = memo(({ label, ...rest }) => {
  return <Dropdown targetOffset={24} placement="right" content={<FontSelectDropdown {...rest} />}>
    <InputContainer label={label}>
      <div style={{ fontFamily: rest.value || "inherit" }} className="cursor-pointer hover:bg-base-300 flex items-center input input-bordered input-sm field-width overflow-hidden" title={rest.value}>
        <span className="truncate block w-full">{rest.value || "Select font"}</span>
      </div>
    </InputContainer>
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
export const InputMapObject: FC<ObjectProps> = memo(({ label, onChange, value, ...rest }) => {
  const {t} = useTranslation();
  const [newKey, setNewKey] = useState<string>("");
  const [newValue, setNewValue] = useState<string>("");

  const handleAdd = () => {
    const trimmedKey = newKey.trim();
    if (!trimmedKey || !newValue || !!value[trimmedKey])
      return;
    setNewKey("");
    setNewValue("");
    onChange({...value, [trimmedKey]: newValue});
  };
  const handleRemove = (key: string) => {
    const newVal = produce(value, v => { delete v[key]; });
    onChange(newVal);
  };

  const handleChange = (oldKey: string, [key, val]: [string, string]): boolean => {
    let newBody = {};

    if (oldKey !== key) {
      if (key in value)
        return false
      // replace record, preserve position
      newBody = Object.fromEntries(Object.entries(value).map(([k,v]) => oldKey === k ? [key, val] : [k,v]));
    }
    else 
      newBody = produce(value, v => {v[oldKey] = val;});
    onChange(newBody);
    return true;
  };

  return <InputContainer vertical label={label}>
    <div className="flex flex-col space-y-2">
      {Object.entries(value).map((pair, i) => <MapRow
        key={`${i}-${pair[0]}`}
        onRemove={()=> handleRemove(pair[0])}
        onChange={(newPair) => handleChange(pair[0], newPair)}
        keyPlaceholder={rest.keyPlaceholder}
        valuePlaceholder={rest.valuePlaceholder}
        keyValue={pair}/>)}
      <div className="flex space-x-2">
        <InputBaseText fieldWidth={false} className="w-full" placeholder={rest.keyPlaceholder || "Key"} value={newKey} onChange={e => setNewKey(e.target.value)} />
        <InputBaseText fieldWidth={false} className="w-full" placeholder={rest.valuePlaceholder || "Value"} value={newValue} onChange={e => setNewValue(e.target.value)} />
        <button className="btn btn-sm btn-primary btn-outline flex-nowrap whitespace-nowrap gap-1" onClick={handleAdd}><RiAddCircleFill size={18} /> {t('common.btn_add')}</button>
      </div>
    </div>
  </InputContainer>
});

type MapRowProps = {
  keyValue: [string, string],
  keyPlaceholder?: string,
  valuePlaceholder?: string,
  onRemove: () => void,
  onChange: (keyValue: [string, string]) => boolean,

}
const MapRow:FC<MapRowProps> = memo(({keyValue, keyPlaceholder, valuePlaceholder, onRemove, onChange}) => {
  const [newKey, setNewKey] = useState<string>(keyValue[0]);
  const [newValue, setNewValue] = useState<string>(keyValue[1]);
  const [edit, setEdit] = useState(false);

  const handleSave = () => {
    onChange([newKey.trim(), newValue])
    && setEdit(false);
  }

  const handleCancel = () => {
    setEdit(false);
    setNewKey(keyValue[0]);
    setNewValue(keyValue[1]);
  }

  return <div className="flex space-x-2">
    <InputBaseText fieldWidth={false} className="w-full" disabled={!edit} placeholder={keyPlaceholder || "Key"} value={newKey} onChange={v => setNewKey(v.target.value)} />
    <InputBaseText fieldWidth={false} className="w-full" disabled={!edit} placeholder={valuePlaceholder || "Value"} value={newValue} onChange={v => setNewValue(v.target.value)} />
    {edit ? <>
      <Tooltip placement="top" content="Save"><button className="btn btn-sm btn-circle btn-success" onClick={handleSave}><RiCheckboxCircleFill size={18} /></button></Tooltip>
      <Tooltip placement="top" content="Cancel"><button className="btn btn-sm btn-circle btn-ghost" onClick={handleCancel}><RiCloseCircleFill size={18} /></button></Tooltip>
    </> : <>
      <Tooltip placement="top" content="Edit"><button className="btn btn-sm btn-circle btn-ghost" onClick={() => setEdit(true)}><RiEdit2Fill size={18} /></button></Tooltip>
      <Tooltip placement="top" content="Delete"><button className="btn btn-sm btn-circle btn-ghost text-error" onClick={onRemove}><RiDeleteBin3Fill size={18} /></button></Tooltip>
    </>
    }
  </div>
})

interface ShortuctProps extends InputBaseProps {
  shortcut: keyof BackendState["shortcuts"],
  value?: string,
  onChange?: (value: string) => void
}
export const InputShortcut: FC<ShortuctProps> = ({ shortcut, label, onChange, ...rest }) => {
  const id = useId();
  const { shortcuts } = useSnapshot(window.ApiServer.state);

  const startRecord = () => {
    window.ApiServer.keyboard.startShortcutRecord(shortcut);
  }

  const clear = () => {
    window.ApiServer.keyboard.clearShortcut(shortcut);
  }

  const stopRecord = () => {
    window.ApiServer.keyboard.confirmShortcutRecord();
  }

  return <InputContainer vertical label={label} id={id}>
    <div className="input-group w-full">
      <input type="text" value={shortcuts[shortcut]} id={id} disabled className="w-full input input-sm input-bordered" />
      <Tooltip content="Listen" className="btn btn-sm btn-primary btn-square">
        <button className="w-full h-full flex items-center justify-center" onClick={startRecord}><RiKeyboardBoxFill /></button>
      </Tooltip>
      <Tooltip content="Clear" className="btn btn-sm btn-neutral btn-square">
        <button className="w-full h-full flex items-center justify-center" onClick={clear}><RiDeleteBin3Fill /></button>
      </Tooltip>
    </div>
    {/* <BaseText disabled type="text" /> */}
  </InputContainer>
}

type WindowsToken = {
  id: string;
  label: string;
}
type WindowsConfig = { devices: WindowsToken[], voices: WindowsToken[] };
interface AudioOutputProps extends InputBaseProps {
  value: string,
  onChange: (value: string) => void
}
export const InputNativeAudioOutput: FC<AudioOutputProps> = memo(({ label, value, onChange }) => {
  const [config, setConfig] = useState<WindowsConfig>();
  useEffect(() => {
    invoke<WindowsConfig>("plugin:windows_tts|get_voices").then(setConfig);
  }, []);

  return <InputSelect
    value={value}
    onValueChange={onChange}
    options={config?.devices.map(d => ({ ...d, value: d.label })) || []}
    label={label} />
});

interface AudioOutputProps extends InputBaseProps {
  value: string,
  onChange: (value: string) => void
}

const getMedia = async () => {
  try {
    await navigator.mediaDevices.getUserMedia({audio: true,});
    const list = await navigator.mediaDevices.enumerateDevices();
    return list.filter(d => d.kind === "audioinput").map(d => ({ ...d, label: d.label, value: d.deviceId }))
  } catch (error) {
    return []
  }
}

export const InputWebAudioInput: FC<AudioOutputProps> = memo(({ label, value, onChange }) => {
  const [devices, setDevices] = useState<InputSelectOption[]>([]);
  
  useEffect(() => {
    getMedia().then(setDevices);
  }, []);

  return <InputSelect
    value={value}
    onValueChange={onChange}
    options={devices || []}
    label={label} />
});