import classNames from "classnames";
import { AnimatePresence, motion } from "framer-motion";
import { ButtonHTMLAttributes, FC, memo, PropsWithChildren, ReactNode, useEffect, useMemo } from "react";
import { RiAddFill, RiBrushFill, RiChatVoiceFill, RiFolderMusicFill, RiImageFill, RiMessage2Fill, RiSettings2Fill, RiStackFill, RiTranslate2, RiUserVoiceFill } from "react-icons/ri";
import { TbArrowBarToLeft, TbArrowBarToRight, TbTextResize } from "react-icons/tb";
import { useSnapshot } from "valtio";
import { Services } from "../index";
import { useGetState } from "@/client";
import { ElementType } from "@/client/elements/schema";
import { InspectorTabPath, ServiceNetworkState } from "@/types";
import Dropdown from "./dropdown/Dropdown";
import Tooltip from "./dropdown/Tooltip";
import Inspector from "./inspector";
import { MdExtension } from "react-icons/md";
import { SiDiscord, SiObsstudio, SiTwitch } from "react-icons/si";
import { useTranslation } from "react-i18next";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  tooltip: string; // locale key
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
  const {t} = useTranslation();
  const handleAdd = (type: ElementType) => {
    window.ApiClient.elements.addElement(type);
  }
  return (
    <ul className="dropdown p-2">
      <li className="menu-title"><span>{t('main.add_elements')}</span></li>
      <li><button onClick={() => handleAdd(ElementType.text)}>{t('main.btn_add_text')}</button></li>
      <li><button onClick={() => handleAdd(ElementType.image)}>{t('main.btn_add_image')}</button></li>
    </ul>
  );
};

const ElementMenu: FC<{ id: string, title: string }> = ({ id, title }) => {
  const {t} = useTranslation();
  const {activeScene} = useSnapshot(window.ApiClient.scenes.state);
  const elementScenes = useGetState(state => state.elements[id]?.scenes);
  const canRemoveFromScene = activeScene in elementScenes && Object.keys(elementScenes).length > 1;
  const handleRemoveFromScene = () => {
    if (canRemoveFromScene)
      window.ApiClient.elements.removeElementFromScene(id, activeScene);
  }
  return (
    <ul className="dropdown p-2">
      <li className="menu-title"><span>{title}</span></li>
      <li><button onClick={() => window.ApiClient.elements.removeElement(id)}>{t('common.btn_remove')}</button></li>
      <li className={classNames({disabled: !canRemoveFromScene})}><button onClick={handleRemoveFromScene}>{t('main.btn_remove_from_scene')}</button></li>
    </ul>
  );
};

const SIdebarDivider: FC<PropsWithChildren<{expand: boolean, icon: ReactNode}>> = ({children, expand, icon}) => {
  return <div className="flex flex-nowrap items-center text-xs font-semibold opacity-50 w-auto">
  <div className="flex flex-none w-10 h-6 items-center justify-center text-xl">{icon}</div>
  <span className={classNames("transition-opacity", expand ? "opacity-100" : "opacity-0")}>{children}</span>
</div>
}

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
  const {t} = useTranslation();
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
  const translationState = useSnapshot(window.ApiServer.translation.serviceState);

  return <div className="flex h-full z-20">
    <div className="bg-base-200 flex-none overflow-y-scroll overflow-x-hidden scrollbar-hide">
      <motion.div transition={{ ease: "anticipate", duration: 0.2 }} initial={{ width: "3.5rem" }} animate={{ width: expand ? "13rem" : "3.5rem" }} className="flex flex-col space-y-1 py-2 px-2">
        <button className="w-full btn btn-ghost border-none justify-start min-h-fit h-auto flex-nowrap whitespace-nowrap px-0 gap-1 overflow-hidden" onClick={switchExpand}>
          <span className={classNames("flex-none w-10 h-8 items-center justify-center text-lg text-base-content/50 swap swap-flip", { "swap-active": expand })}>
            <TbArrowBarToLeft className="swap-on" />
            <TbArrowBarToRight className="swap-off" />
          </span>
          <div className="font-medium text-xs text-base-content/50 leading-none">{t('main.btn_collapse_menu')}</div>
        </button>
        <SideBarButton status={sttState.status} tab={{ tab: Services.stt }} tooltip={t("stt.title")}><RiUserVoiceFill /></SideBarButton>
        <SideBarButton status={ttsState.status} tab={{ tab: Services.tts }} tooltip={t("tts.title")}><RiChatVoiceFill /></SideBarButton>
        <SideBarButton status={translationState.status} tab={{ tab: Services.translation }} tooltip={t("transl.title")}><RiTranslate2 /></SideBarButton>
        <SideBarButton tab={{ tab: "settings" }} tooltip={t("settings.title")}><RiSettings2Fill /></SideBarButton>
        <SIdebarDivider expand={expand} icon={<MdExtension className="flex-none" size={14} />}>{t('main.section_integrations')}</SIdebarDivider>
        <div className={classNames("flex flex-col transition-spacing space-y-1", expand ? "pl-2" : "pl-0")}>
          <SideBarButton tab={{ tab: "obs" }} tooltip={t("obs.title")}><SiObsstudio /></SideBarButton>
          <SideBarButton tab={{ tab: Services.twitch }} tooltip={t("twitch.title")}><SiTwitch /></SideBarButton>
          <SideBarButton tab={{ tab: Services.discord }} tooltip={t("discord.title")}><SiDiscord /></SideBarButton>
          <SideBarButton tab={{ tab: Services.vrc }} tooltip={t("vrc.title")}><RiMessage2Fill /></SideBarButton>
        </div>
        <SIdebarDivider expand={expand} icon={<RiBrushFill className="flex-none" size={14} />}>{t('main.section_elements')}</SIdebarDivider>
        <div className={classNames("flex flex-col space-y-1 transition-spacing", expand ? "pl-2" : "pl-0")}>
          <SideBarButton tab={{ tab: "scenes" }} tooltip={t("scenes.title")}><RiStackFill /></SideBarButton>
          <ElementList />
        </div>
        <Dropdown placement="right" content={<AddElementsMenu />}>
          <SideBarButtonBase tooltip={t("main.btn_add_element")}><RiAddFill /></SideBarButtonBase>
        </Dropdown>
        <Divider />
        <SideBarButton tab={{ tab: "files" }} tooltip={t("files.title")}><RiFolderMusicFill /></SideBarButton>
      </motion.div>
    </div>
    <AnimatePresence initial={false}>
      {show && <motion.div
        data-tauri-drag-region
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
          <Inspector path={tab} />
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
