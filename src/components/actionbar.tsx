import {FC, PropsWithChildren}                                                                                                               from "react";
import {RiAddBoxFill, RiFileCopyLine, RiMicFill, RiMicOffFill, RiPauseFill, RiPlayFill, RiSettings3Fill, RiVolumeDownFill, RiVolumeMuteFill} from "react-icons/ri";
import {TbKeyboardShow} from "react-icons/tb";

const Divider: FC = () => {
  return <div className="flex-none h-4 w-1 bg-neutral rounded-full"></div>
}

const Button: FC<PropsWithChildren<any>> =({children, ...rest}) => {
  return <button {...rest} className="btn btn-sm btn-circle">{children}</button>
}

const ActionBar: FC = () => {
    return <div className="flex items-center space-x-3 bg-base-100 rounded-xl h-12 px-3">
    {/*<Button><TbKeyboardShow className="text-lg"/></Button>*/}
    <Button><RiVolumeMuteFill className="text-lg"/></Button>
    <Button><RiMicOffFill className="text-lg"/></Button>
    <Divider/>
    <Button><RiPlayFill className="text-lg"/></Button>
    <Button><RiFileCopyLine className="text-lg"/></Button>
  </div>
}

export default ActionBar;
