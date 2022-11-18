import {FC, PropsWithChildren}                                                                                                               from "react";
import {RiAddBoxFill, RiDragMove2Fill, RiFileCopyLine, RiMicFill, RiMicOffFill, RiPauseFill, RiPlayFill, RiSettings3Fill, RiVolumeDownFill, RiVolumeMuteFill} from "react-icons/ri";
import {TbKeyboardShow} from "react-icons/tb";
import Tooltip from "./dropdown/Tooltip";

const Divider: FC = () => {
  return <div className="flex-none h-4 w-1 bg-neutral rounded-full"></div>
}

const Button: FC<PropsWithChildren<{tooltip: string}>> =({tooltip, children, ...rest}) => {
  return <Tooltip content={tooltip}>
    <button {...rest} className="btn btn-sm btn-circle">{children}</button>
  </Tooltip>
}

const ActionBar: FC = () => {
    return <div className="flex items-center space-x-3 bg-base-100 rounded-xl h-12 px-3">
    {/*<Button><TbKeyboardShow className="text-lg"/></Button>*/}
    <Button tooltip="Mute"><RiVolumeMuteFill className="text-lg"/></Button>
    <Button tooltip="Disable microphone"><RiMicOffFill className="text-lg"/></Button>
    <Divider/>
    <Button tooltip="Start"><RiPlayFill className="text-lg"/></Button>
    <Button tooltip="Copy link"><RiFileCopyLine className="text-lg"/></Button>
  </div>
}

export default ActionBar;
