import classNames from "classnames";
import { AnimatePresence, motion } from "framer-motion";
import { ButtonHTMLAttributes, createContext, FC, memo, PropsWithChildren, useCallback, useContext, useState } from "react";
import { RiAddFill, RiChatVoiceFill, RiCloseFill, RiFolderMusicFill, RiFontSize, RiImageFill, RiMessage2Fill, RiMicFill, RiSettings2Fill, RiStackFill, RiTranslate2, RiTwitchFill } from "react-icons/ri";
import { TbArrowBarToLeft, TbArrowBarToRight, TbTextResize } from "react-icons/tb";
import { Services } from "../backend-services";
import { useGetState } from "../frontend-services";
import { ElementType } from "../frontend-services/schema/element";
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
      <button {...props} className={classNames("flex-none whitespace-nowrap h-10 px-3 gap-0 space-x-2 text-lg text-semibold", activeStyles)}>
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
  const active = show && ctx.tab?.tab === tab.tab && ctx.tab?.value === tab.value;
  return <SideBarButtonBase {...props} active={active} onClick={() => ctx.changeTab(tab)} />
});

const Divider: FC = () => {
  return <div className="my-2 flex-none bg-neutral h-1 w-4 self-center rounded-full"></div>
}

const AddElementsMenu: FC = () => {
  const handleAdd = (type: ElementType) => {
    window.APIFrontend.elements.addElement(type);
  }
  return (
    <ul className="dropdown p-2">
      <li className="menu-title"><span>Elements</span></li>
      <li><button onClick={() => handleAdd(ElementType.text)}>Add text</button></li>
      <li><button onClick={() => handleAdd(ElementType.image)}>Add image</button></li>
    </ul>
  );
};

const ElementMenu: FC<{ id: string, title: string }> = ({ id, title }) => {
  const handleRemove = () => {
    window.APIFrontend.elements.removeElement(id);
  }
  return (
    <ul className="dropdown p-2">
      <li className="menu-title"><span>{title}</span></li>
      <li><button onClick={() => handleRemove()}>Remove element</button></li>
      <li><button>Add to scene</button></li>
      <li><button>Remove from scene</button></li>
    </ul>
  );
};

const SidebarElementButton: FC<{ id: string }> = memo(({ id }) => {
  const name = useGetState(state => state.elements[id].name);
  const type = useGetState(state => state.elements[id].type);
  console.log("sidebar ele")
  return <Dropdown interact="context" placement="right" content={<ElementMenu title={name} id={id} />}>
    <SideBarButton tab={{ tab: type, value: id }} tooltip={name}>
      {type === ElementType.text && <TbTextResize />}
      {type === ElementType.image && <RiImageFill />}
    </SideBarButton>
  </Dropdown>

});

const ElementList: FC = () => {
  const ids = useGetState(state => state.elementsIds);
  return <>
    {ids.map(id => <SidebarElementButton key={id} id={id} />)}
  </>
}

const Sidebar: FC = () => {
  const [show, setShow] = useState(false);
  const [expand, setExpand] = useState(false);
  const [tab, setTab] = useState<InspectorTabPath | undefined>();

  const changeTab = useCallback((v: InspectorTabPath) => {
    if (tab?.tab === v.tab && tab?.value === v.value && show) {
      setShow(false);
      return;
    }
    setShow(true);
    setTab(v);
  }, [tab, show]);

  return <div className="flex h-full z-10">
    <sidebarContext.Provider value={{ show, expand, tab, changeTab }}>
      <div className="flex-none overflow-y-scroll scrollbar-hide">
        <div className="w-max">
          <ul className="menu p-3 space-y-2">
            <button className={classNames("swap swap-flip btn btn-ghost btn-sm self-start", { "swap-active": expand })} onClick={() => setExpand(e => !e)}>
              <TbArrowBarToLeft className="swap-on" />
              <TbArrowBarToRight className="swap-off" />
            </button>
            <SideBarButton tab={{ tab: Services.stt }} tooltip="Speech to Text"><RiMicFill /></SideBarButton>
            <SideBarButton tab={{ tab: Services.tts }} tooltip="Text to Speech"><RiChatVoiceFill /></SideBarButton>
            <SideBarButton tab={{ tab: Services.translation }} tooltip="Translation"><RiTranslate2 /></SideBarButton>
            <SideBarButton tab={{ tab: Services.vrc }} tooltip="VRChat OSC"><RiMessage2Fill /></SideBarButton>
            <SideBarButton tab={{ tab: Services.twitch }} tooltip="Twitch Integration"><RiTwitchFill /></SideBarButton>
            <SideBarButton tab={{ tab: "settings" }} tooltip="Settings & About"><RiSettings2Fill /></SideBarButton>
            <Divider />
            <SideBarButton tab={{ tab: "scenes" }} tooltip="Canvas & Scenes"><RiStackFill /></SideBarButton>
            <ElementList />
            <Dropdown placement="right" content={<AddElementsMenu />}>
              <SideBarButtonBase tooltip="Add element"><RiAddFill /></SideBarButtonBase>
            </Dropdown>
            <Divider />
            <SideBarButton tab={{ tab: "files" }} tooltip="Files"><RiFolderMusicFill /></SideBarButton>
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
