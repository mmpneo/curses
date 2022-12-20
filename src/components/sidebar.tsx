import classNames from "classnames";
import { AnimatePresence, motion } from "framer-motion";
import { ButtonHTMLAttributes, createContext, FC, memo, PropsWithChildren, useCallback, useContext, useEffect, useState } from "react";
import { RiAddFill, RiChatVoiceFill, RiFolderMusicFill, RiFontSize, RiImageFill, RiMessage2Fill, RiMicFill, RiSettings2Fill, RiStackFill, RiTranslate2, RiTwitchFill } from "react-icons/ri";
import { TbArrowBarToLeft, TbArrowBarToRight, TbTextResize } from "react-icons/tb";
import { useSnapshot } from "valtio";
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
  const activeStyles = active ? "btn-secondary" : "btn-ghost";
  return <Tooltip enable={!expand} placement={["right"]} content={tooltip}>
    <button {...props} className={classNames("w-full btn border-none justify-start min-h-fit h-auto flex-nowrap whitespace-nowrap px-0 gap-1 overflow-hidden", activeStyles)}>
      <div className="flex flex-none w-10 h-10 items-center justify-center text-xl">
        {children}
      </div>
      <div className="font-medium leading-none">{tooltip}</div>
    </button>
  </Tooltip>
});

const SideBarButton: FC<PropsWithChildren<ButtonProps>> = memo(({ tab, ...props }) => {
  const { show, expand, ...ctx } = useContext(sidebarContext);
  const active = show && ctx.tab?.tab === tab.tab && ctx.tab?.value === tab.value;
  return <SideBarButtonBase {...props} active={active} onClick={() => ctx.changeTab(tab)} />
});

const Divider: FC = () => {
  return <div className="my-2 flex-none bg-base-100/50 h-1 w-8 mx-2 self-center rounded-full"></div>
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

const Sidebar: FC = memo(() => {
  const [show, setShow] = useState(false);
  const [expand, setExpand] = useState(false);
  const [tab, setTab] = useState<InspectorTabPath | undefined>();
  const { fullscreenInput } = useSnapshot(window.API.ui);

  const changeTab = useCallback((v: InspectorTabPath) => {
    if (tab?.tab === v.tab && tab?.value === v.value && show) {
      setShow(false);
      return;
    }
    setShow(true);
    setTab(v);
  }, [tab, show]);

  useEffect(() => { fullscreenInput && show && setShow(false) }, [fullscreenInput]);

  return <div className="flex h-full z-10">
    <sidebarContext.Provider value={{ show, expand, tab, changeTab }}>
      <div className="bg-base-200 flex-none overflow-y-scroll scrollbar-hide">
        <motion.div transition={{ ease: "anticipate", duration: 0.2 }} initial={{ width: "3.5rem" }} animate={{ width: expand ? "13rem" : "3.5rem" }} className="flex flex-col space-y-2 py-2 px-2">
          <button className="w-full btn btn-ghost border-none justify-start min-h-fit h-auto flex-nowrap whitespace-nowrap px-0 gap-1 overflow-hidden" onClick={() => setExpand(e => !e)}>
            <span className={classNames("flex-none w-10 h-8 items-center justify-center text-lg swap swap-flip", { "swap-active": expand })}>
              <TbArrowBarToLeft className="swap-on" />
              <TbArrowBarToRight className="swap-off" />
            </span>
            <div className="font-medium text-xs text-base-content/50 leading-none">Collapse menu</div>
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
        </motion.div>
      </div>
    </sidebarContext.Provider>
    <AnimatePresence initial={false}>
      {show && <motion.div
        key="inspector-opacity"
        variants={inspectorOpacityVariants}
        initial="hidden"
        // transition={{ ease: "anticipate", duration: 1 }}
        exit="hidden"
        animate="visible"
        className="relative h-full pt-4">
        {/* <button className="top-3 absolute text-base-content -right-10 btn btn-sm bg-base-100 border-none btn-circle text-lg" onClick={() => setShow(false)}><RiCloseFill /></button> */}
        <motion.div
          key="inspector-size"
          variants={inspectorSizeVariants}
          initial="hidden"
          exit="hidden"
          animate="visible"
          className="flex h-full overflow-hidden shadow-xl">
          <Inspector.Base path={tab} />
        </motion.div>
      </motion.div>}
    </AnimatePresence>
  </div>
});

export default Sidebar;

const inspectorOpacityVariants = {
  visible: { opacity: 1, marginRight: "-1rem", transition: { ease: "easeInOut", duration: .3 } },
  hidden: { opacity: 0, marginRight: "0", transition: { ease: "easeInOut", duration: .2 } },
}
const inspectorSizeVariants = {
  visible: { x: 0, y: 0, width: "auto", transition: { ease: "anticipate", duration: .3 } },
  hidden: { x: -20, y: 0, width: 0, transition: { ease: "easeInOut", duration: .2 } },
}