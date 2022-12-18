import { FC, PropsWithChildren } from "react";
import { RiFileCopyLine, RiMicOffFill, RiTerminalWindowFill, RiVolumeMuteFill } from "react-icons/ri";
import { RxInput } from "react-icons/rx";
import { TbAppWindow, TbKeyboardShow } from "react-icons/tb";
import Tooltip from "./dropdown/Tooltip";

const Divider: FC = () => {
  return <div className="flex-none h-4 w-1 bg-neutral rounded-full"></div>
}

const Button: FC<PropsWithChildren<{ tooltip: string, body?: string, onClick?: () => void }>> = ({ tooltip, body, children, ...rest }) => {
  return <Tooltip content={tooltip} body={body}>
    <button {...rest} className="btn btn-sm btn-circle">{children}</button>
  </Tooltip>
}

const ActionBar: FC = () => {
  return <div className="flex flex-col space-y-2 bg-base-100 rounded-xl p-3">
    <div className="flex items-center space-x-3">
      <Button tooltip="Fullscreen input" body="Good for VR 🙂" onClick={() => window.API.ui.fullscreenInput = true} ><RxInput className="text-lg"/></Button>
      <Button tooltip="Input window" body="Floating window with input and history" onClick={() => window.API.switchInputWindow()} ><TbAppWindow className="text-lg"/></Button>
      <Button tooltip="Mute application" body="Mutes sound effects in this window. Does not affect text-to-speech"><RiVolumeMuteFill className="text-lg" /></Button>
      <Button tooltip="Mute speech to text" body="Prevents speech-to-text from sending any output"><RiMicOffFill className="text-lg" /></Button>
      <Divider />
      {/* <Button tooltip="Start"><RiPlayFill className="text-lg"/></Button> */}
      <Button tooltip="Copy link"><RiFileCopyLine className="text-lg" /></Button>
    </div>

    {/* <div className="flex items-center justify-between text-xs font-medium opacity-50">Host <div className="w-2 h-2 rounded-full bg-success"></div></div>
      <div className="flex items-center justify-between text-xs font-medium opacity-50">STT <div className="w-2 h-2 rounded-full bg-success"></div></div>
      <div className="flex items-center justify-between text-xs font-medium opacity-50">TTS <div className="w-2 h-2 rounded-full bg-success"></div></div>
      <div className="flex items-center justify-between text-xs font-medium opacity-50">Translation <div className="w-2 h-2 rounded-full bg-success"></div></div> */}
  </div>
}

export default ActionBar;
