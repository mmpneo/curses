import classNames from "classnames";
import { AnimatePresence, motion } from "framer-motion";
import { ButtonHTMLAttributes, FC, memo, PropsWithChildren, useEffect } from "react";
import { RiAddFill, RiChatVoiceFill, RiFolderMusicFill, RiImageFill, RiMessage2Fill, RiSettings2Fill, RiTranslate2, RiTwitchFill, RiUserVoiceFill } from "react-icons/ri";
import { TbArrowBarToLeft, TbArrowBarToRight, TbTextResize } from "react-icons/tb";
import { useSnapshot }                           from "valtio";
import { Services }    from "../index";
import { useGetState }                           from "@/client";
import { ElementType }                           from "@/client/elements/schema";
import { InspectorTabPath, ServiceNetworkState } from "@/types";
import Dropdown                                  from "./dropdown/Dropdown";
import Tooltip                                   from "./dropdown/Tooltip";
import Inspector                                 from "./inspector";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  tooltip: string;
  tab: InspectorTabPath;
  status?: ServiceNetworkState
}


const SideBarButtonBase: FC<PropsWithChildren<Omit<ButtonProps, "tab"> & { active?: boolean }>> = memo(({ status, active, tooltip, children, ...props }) => {
  const { expand } = useSnapshot(window.ApiServer.ui.sidebarState);
  const activeStyles = active ? "btn-secondary" : "btn-ghost";
  return <Tooltip body={status === ServiceNetworkState.connected ? "Connected" : ""} enable={!expand} placement="right" className="relative" content={tooltip}>
    <button {...props} className={classNames("w-full btn border-none justify-start min-h-fit h-auto flex-nowrap whitespace-nowrap px-0 gap-1", activeStyles)}>
      <div className="flex flex-none w-10 h-10 items-center justify-center text-xl">
        {children}
      </div>
      <div className={classNames("font-medium leading-none transition-opacity", expand ? "opacity-100" : "opacity-0")}>{tooltip}</div>
    </button>
  </Tooltip>
});

const SideBarButton: FC<PropsWithChildren<ButtonProps>> = memo(({ tab, ...props }) => {
  const { show, expand, ...ctx } = useSnapshot(window.ApiServer.ui.sidebarState);
  const active = show && ctx.tab?.tab === tab.tab && ctx.tab?.value === tab.value;

  return <SideBarButtonBase {...props} active={active} onClick={() => window.ApiServer.changeTab(tab)} />
});

const Divider: FC = () => {
  return <div className="my-2 flex-none bg-neutral h-1 w-4 self-center rounded-full"></div>
}

const AddElementsMenu: FC = () => {
  const handleAdd = (type: ElementType) => {
    window.ApiClient.elements.addElement(type);
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
    window.ApiClient.elements.removeElement(id);
  }
  return (
    <ul className="dropdown p-2">
      <li className="menu-title"><span>{title}</span></li>
      <li><button onClick={() => handleRemove()}>Remove element</button></li>
      {/* <li><button>Add to scene</button></li>
      <li><button>Remove from scene</button></li> */}
    </ul>
  );
};

const SidebarElementButton: FC<{ id: string }> = memo(({ id }) => {
  const name = useGetState(state => state.elements[id].name);
  const type = useGetState(state => state.elements[id].type);
  return <Dropdown interact="context" placement="right" content={<ElementMenu title={name} id={id} />}>
    <SideBarButton tab={{ tab: type, value: id }} tooltip={name}>
      {type === ElementType.text && <TbTextResize />}
      {type === ElementType.image && <RiImageFill />}
    </SideBarButton>
  </Dropdown>

});

const ElementList: FC = memo(() => {
  const ids = useGetState(state => state.elementsIds);
  return <>
    {ids?.map(id => <SidebarElementButton key={id} id={id} />)}
  </>
})

const Sidebar: FC = memo(() => {
  const { sidebarState: { tab, show, expand } } = useSnapshot(window.ApiServer.ui);
  const {showOverlay} = useSnapshot(window.ApiServer.state);
  useEffect(() => {
    if (showOverlay && show)
      window.ApiServer.ui.sidebarState.show = false;
  }, [showOverlay]);

  const switchExpand = () => {
    window.ApiServer.ui.sidebarState.expand = !window.ApiServer.ui.sidebarState.expand;
  }

  const sttState = useSnapshot(window.ApiServer.stt.serviceState);
  const ttsState = useSnapshot(window.ApiServer.tts.serviceState);

  return <div className="flex h-full z-20">
    <div className="bg-base-200 flex-none overflow-y-scroll overflow-x-hidden scrollbar-hide">
      <motion.div transition={{ ease: "anticipate", duration: 0.2 }} initial={{ width: "3.5rem" }} animate={{ width: expand ? "13rem" : "3.5rem" }} className="flex flex-col space-y-2 py-2 px-2">
        <button className="w-full btn btn-ghost border-none justify-start min-h-fit h-auto flex-nowrap whitespace-nowrap px-0 gap-1 overflow-hidden" onClick={switchExpand}>
          <span className={classNames("flex-none w-10 h-8 items-center justify-center text-lg text-base-content/50 swap swap-flip", { "swap-active": expand })}>
            <TbArrowBarToLeft className="swap-on" />
            <TbArrowBarToRight className="swap-off" />
          </span>
          <div className="font-medium text-xs text-base-content/50 leading-none">Collapse menu</div>
        </button>
        <SideBarButton status={sttState.status} tab={{ tab: Services.stt }} tooltip="Speech to Text"><RiUserVoiceFill /></SideBarButton>
        <SideBarButton status={ttsState.status} tab={{ tab: Services.tts }} tooltip="Text to Speech"><RiChatVoiceFill /></SideBarButton>
        <SideBarButton disabled tab={{ tab: Services.translation }} tooltip="Translation\WIP"><RiTranslate2 /></SideBarButton>
        <SideBarButton tab={{ tab: Services.vrc }} tooltip="VRChat chatbox"><RiMessage2Fill /></SideBarButton>
        <SideBarButton tab={{ tab: Services.twitch }} tooltip="Twitch Integration"><RiTwitchFill /></SideBarButton>
        <SideBarButton tab={{ tab: "settings" }} tooltip="Settings & About"><RiSettings2Fill /></SideBarButton>
        <Divider />
        {/* <SideBarButton tab={{ tab: "scenes" }} tooltip="Canvas & Scenes"><RiStackFill /></SideBarButton> */}
        <ElementList />
        <Dropdown placement="right" content={<AddElementsMenu />}>
          <SideBarButtonBase tooltip="Add element"><RiAddFill /></SideBarButtonBase>
        </Dropdown>
        <Divider />
        <SideBarButton tab={{ tab: "files" }} tooltip="Files"><RiFolderMusicFill /></SideBarButton>
      </motion.div>
    </div>
    <AnimatePresence initial={false}>
      {show && <motion.div
        key="inspector-opacity"
        variants={inspectorOpacityVariants}
        initial="hidden"
        exit="hidden"
        animate="visible"
        className="relative h-full pt-4">
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
