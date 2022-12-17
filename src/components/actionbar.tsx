import { FC, PropsWithChildren } from "react";
import { RiFileCopyLine, RiMicOffFill, RiVolumeMuteFill } from "react-icons/ri";
import { TbKeyboardShow } from "react-icons/tb";
import Tooltip from "./dropdown/Tooltip";

const Divider: FC = () => {
  return <div className="flex-none h-4 w-1 bg-neutral rounded-full"></div>
}

const Button: FC<PropsWithChildren<{ tooltip: string, onClick?: () => void }>> = ({ tooltip, children, ...rest }) => {
  return <Tooltip content={tooltip}>
    <button {...rest} className="btn btn-sm btn-circle">{children}</button>
  </Tooltip>
}

const ActionBar: FC = () => {
  return <div className="flex flex-col space-y-2 bg-base-100 rounded-xl p-3">
    <div className="flex items-center space-x-3">
      <Button tooltip="Switch input window" onClick={() => window.API.switchInputWindow()} ><TbKeyboardShow className="text-lg"/></Button>
      <Button tooltip="Mute"><RiVolumeMuteFill className="text-lg" /></Button>
      <Button tooltip="Disable microphone"><RiMicOffFill className="text-lg" /></Button>
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
