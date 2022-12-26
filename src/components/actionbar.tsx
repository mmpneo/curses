import classNames from "classnames";
import { FC, HtmlHTMLAttributes, PropsWithChildren, ReactNode } from "react";
import { RiFileCopyLine, RiMicFill, RiMicOffFill, RiVolumeMuteFill, RiVolumeUpFill } from "react-icons/ri";
import { RxInput } from "react-icons/rx";
import { TbAppWindow } from "react-icons/tb";
import { VscChromeClose, VscChromeMaximize, VscChromeMinimize } from "react-icons/vsc";
import { useSnapshot } from "valtio";
import Tooltip from "./dropdown/Tooltip";

const Divider: FC = () => {
  return <div className="flex-none h-4 w-1 bg-neutral rounded-full"></div>
}

const Button: FC<PropsWithChildren<HtmlHTMLAttributes<HTMLButtonElement> & { tooltip: string, body?: ReactNode}>> = ({ tooltip, body, children, className = "btn-ghost", ...rest }) => {
  return <Tooltip content={tooltip} body={body}>
    <button {...rest} className={classNames("btn h-10 min-h-fit text-xl w-10 btn-square flex items-center justify-center", className)}>{children}</button>
  </Tooltip>
}


const handleSwitchFullscreenInput = () => window.API.ui.fullscreenInput = !window.API.ui.fullscreenInput;
const handleSwitchSTT = () => window.API.stt.serviceState.muted = !window.API.stt.serviceState.muted;
const handleSwitchSound = () => window.APIFrontend.sound.serviceState.muted = !window.APIFrontend.sound.serviceState.muted;
const handleSwitchInputWindow = () => window.API.switchInputWindow();

const ActionBar: FC = () => {
  return <div data-tauri-drag-region className="relative w-full py-1 flex items-center space-x-4 z-50 px-2">
  <div className="w-full"></div>
  <AppActions />
  <div className="pointer-events-none w-full flex justify-end">
    <WindowActions />
  </div>
</div>
}

const AppActions: FC = () => {
  const {muted: sttMute} = useSnapshot(window.API.stt.serviceState);
  const {muted: vfxMute} = useSnapshot(window.APIFrontend.sound.serviceState);

  return <div className="flex items-center space-x-2">
    <Button tooltip="Fullscreen input" onClick={handleSwitchFullscreenInput} ><RxInput /></Button>
    {/* <Button tooltip="Input window" body="Floating window with input and history" onClick={handleSwitchInputWindow} ><TbAppWindow /></Button> */}
    <Button className={vfxMute ? "btn-error" : "btn-ghost"} tooltip="Mute sound effects" body={<>Mute effects like text typing sound <b>in this window</b>. <br/> Does not affect text-to-speech</>} onClick={handleSwitchSound}>{vfxMute ? <RiVolumeMuteFill /> : <RiVolumeUpFill/>}</Button>
    <Button className={sttMute ? "btn-error" : "btn-ghost"} tooltip="Mute speech to text" body="Prevents speech-to-text from sending any output" onClick={handleSwitchSTT}>
      {sttMute ? <RiMicOffFill /> : <RiMicFill />}
      </Button>
    {/* <Divider /> */}
    {/* <Button tooltip="Start"><RiPlayFill/></Button> */}
    {/* <Button tooltip="Copy link"><RiFileCopyLine /></Button> */}

    {/* <div className="flex items-center justify-between text-xs font-medium opacity-50">Host <div className="w-2 h-2 rounded-full bg-success"></div></div>
      <div className="flex items-center justify-between text-xs font-medium opacity-50">STT <div className="w-2 h-2 rounded-full bg-success"></div></div>
      <div className="flex items-center justify-between text-xs font-medium opacity-50">TTS <div className="w-2 h-2 rounded-full bg-success"></div></div>
      <div className="flex items-center justify-between text-xs font-medium opacity-50">Translation <div className="w-2 h-2 rounded-full bg-success"></div></div> */}
  </div>
}

const WindowActions: FC = () => {
  return <div className="flex z-0 pointer-events-auto items-center space-x-2">
    <Button tooltip="Minimize window"><VscChromeMinimize /></Button>
    <Button tooltip="Maximize window"><VscChromeMaximize /></Button>
    <Button tooltip="Close application"><VscChromeClose /></Button>
  </div>
}

export default ActionBar;
