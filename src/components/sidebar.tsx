import classNames from "classnames";
import { AnimatePresence, motion } from "framer-motion";
import { ButtonHTMLAttributes, createContext, FC, PropsWithChildren, useCallback, useState, useContext, memo } from "react";
import { RiAddFill, RiCloseFill, RiFontSize, RiImageFill, RiMessage2Fill, RiMicFill, RiSettings2Fill, RiStackFill, RiTwitchFill, RiVoiceRecognitionFill } from "react-icons/ri";
import { TbArrowBarToLeft, TbArrowBarToRight, TbTextResize } from "react-icons/tb";
import { Services } from "../backend-services";
import { ElementType } from "../frontend-services/schema";
import { InspectorTabPath } from "../types";
import Dropdown from "./dropdown/Dropdown";
import Tooltip from "./dropdown/Tooltip";
import Inspector from "./inspector";

const sidebarContext = createContext<{
  tab: InspectorTabPath | undefined;
  show: boolean;
  expand: boolean;
  changeTab: (tab: InspectorTabPath) => void;
}>({
  show: false,
  expand: false,
  tab: undefined,
  changeTab: (tab: InspectorTabPath) => { }
});

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  tooltip: string;
  tab: InspectorTabPath;
}


const SideBarButtonBase: FC<PropsWithChildren<Omit<ButtonProps, "tab"> & { active?: boolean }>> = memo(({ active, tooltip, children, ...props }) => {
  const { expand } = useContext(sidebarContext);
  const activeStyles = active ? "active" : "bg-base-100 hover:bg-base-100/50 text-base-content";

  return <Tooltip enable={!expand} placement={["right"]} content={tooltip}>
    <li className="overflow-hidden">
      <button {...props} className={classNames("flex-none whitespace-nowrap h-10 px-3 gap-0 space-x-2 text-lg", activeStyles)}>
        {children}
        <AnimatePresence>
          {expand && <motion.div
            key="sidebar-button"
            initial={{ marginLeft: 0, opacity: 0, width: 0 }}
            transition={{ ease: "anticipate", duration: 0.3 }}
            exit={{ marginLeft: 0, opacity: 0, width: 0 }}
            animate={{ marginLeft: '0.5rem', opacity: 1, width: "auto" }}
            className="text-sm">{tooltip}</motion.div>}
        </AnimatePresence>
      </button>
    </li>
  </Tooltip>
});

const SideBarButton: FC<PropsWithChildren<ButtonProps>> = memo(({ tab, ...props }) => {
  const { show, expand, ...ctx } = useContext(sidebarContext);
  const active = show && ctx.tab?.tab === tab.tab;
  return <SideBarButtonBase {...props} active={active} onClick={() => ctx.changeTab(tab)} />
});

const Divider: FC = () => {
  return <div className="my-2 flex-none bg-neutral h-1 w-4 self-center rounded-full"></div>
}

const AddElementsMenu: FC = () => {
  return (
    <ul className="dropdown p-2">
      <li className="menu-title"><span>Elements</span></li>
      <li><button>Add text</button></li>
      <li><button>Add image</button></li>
    </ul>
  );
};

const Sidebar: FC = () => {
  const [show, setShow] = useState(false);
  const [expand, setExpand] = useState(false);
  const [tab, setTab] = useState<InspectorTabPath | undefined>();

  const changeTab = useCallback((v: InspectorTabPath) => {
    if (tab?.tab === v.tab && show) {
      setShow(false);
      return;
    }
    setShow(true);
    setTab(v);
  }, [tab, show]);

  return <div className="flex h-full z-50">
    <sidebarContext.Provider value={{ show, expand, tab, changeTab }}>
      <div className="z-10 flex-none overflow-y-scroll scrollbar-hide">
        <div className="w-max">
          <ul className="menu p-3 space-y-2">
            <button className={classNames("swap swap-flip btn btn-ghost btn-sm self-start", {"swap-active": expand})} onClick={() => setExpand(e => !e)}>
            <TbArrowBarToLeft className="swap-on" />
            <TbArrowBarToRight className="swap-off" />
            </button>
            <SideBarButton tab={{ tab: Services.stt }} tooltip="Speech to Text"><RiMicFill /></SideBarButton>
            <SideBarButton tab={{ tab: Services.tts }} tooltip="Text to Speech"><RiVoiceRecognitionFill /></SideBarButton>
            <SideBarButton tab={{ tab: Services.vrc }} tooltip="VRChat OSC"><RiMessage2Fill /></SideBarButton>
            <SideBarButton tab={{ tab: Services.twitch }} tooltip="Twitch Integration"><RiTwitchFill /></SideBarButton>
            <SideBarButton tab={{ tab: "settings" }} tooltip="Settings & About"><RiSettings2Fill /></SideBarButton>
            <Divider />
            <SideBarButton tab={{ tab: "scenes" }} tooltip="Canvas & Scenes"><RiStackFill /></SideBarButton>
            <SideBarButton tab={{ tab: ElementType.text }} tooltip="Text element"><TbTextResize /></SideBarButton>
            <SideBarButton tab={{ tab: ElementType.image }} tooltip="Image element"><RiImageFill /></SideBarButton>
            <Dropdown placement="right" content={<AddElementsMenu />}>
              <SideBarButtonBase tooltip="Add element"><RiAddFill /></SideBarButtonBase>
            </Dropdown>
            <Divider />
            <SideBarButtonBase tooltip="Files"><RiAddFill /></SideBarButtonBase>
            <SideBarButtonBase tooltip="Fonts"><RiFontSize /></SideBarButtonBase>
          </ul>
        </div>

      </div>

    </sidebarContext.Provider>
    <AnimatePresence>
      {show && <motion.div
        key="inspector-opacity"
        initial={{ opacity: 0 }}
        transition={{ ease: "anticipate", duration: 0.3 }}
        exit={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative h-full py-3">
        <button className="top-3 absolute text-base-content -right-10 btn btn-sm bg-base-100 border-none btn-circle text-lg" onClick={() => setShow(false)}><RiCloseFill /></button>
        <motion.div
          initial={{ x: -20, width: 0 }}
          transition={{ ease: "anticipate", duration: 0.3 }}
          exit={{ x: -20, width: 0 }}
          animate={{ x: 0, width: "auto" }}
          key="inspector-size" className="flex h-full">
          <Inspector.Base path={tab} />
        </motion.div>
      </motion.div>}
    </AnimatePresence>
  </div>
}

export default Sidebar;
