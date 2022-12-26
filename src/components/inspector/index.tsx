import classNames from "classnames";
import { AnimatePresence, motion } from "framer-motion";
import { ButtonHTMLAttributes, FC, forwardRef, memo, PropsWithChildren } from "react";
import SimpleBar from "simplebar-react";
import { Services } from "../../backend-services";
import Inspector_STT from "../../backend-services/stt/inspector";
import Inspector_Translation from "../../backend-services/translation/inspector";
import Inspector_TTS from "../../backend-services/tts/inspector";
import Inspector_Twitch from "../../backend-services/twitch/inspector";
import Inspector_VRC from "../../backend-services/vrc/inspector";
import { Inspector_ElementImage } from "../../frontend-services/elements/image";
import { Inspector_ElementText } from "../../frontend-services/elements/text";
import Inspector_Files from "../../frontend-services/files/inspector";
import { ElementType } from "../../frontend-services/schema/element";
import { InspectorTabPath } from "../../types";
import { TabAnimation } from "../animation";
import Tooltip from "../dropdown/Tooltip";
import Inspector_Scenes from "./inspector_scenes";
import Inspector_Settings from "./inspector_settings";

const Base: FC<{ path?: InspectorTabPath }> = ({ path }) => {
  return <div style={{ width: '19rem' }} className="relative h-full flex-none bg-base-100 rounded-t-box flex flex-col overflow-hidden">
    <AnimatePresence initial={false}>
      {path?.tab === Services.stt && <Inspector_STT key="stt" />}
      {path?.tab === Services.tts && <Inspector_TTS key="tts" />}
      {path?.tab === Services.translation && <Inspector_Translation key="translation" />}
      {path?.tab === Services.twitch && <Inspector_Twitch key="twitch" />}
      {path?.tab === Services.vrc && <Inspector_VRC key="vrc" />}
      {path?.tab === "settings" && <Inspector_Settings key="settings" />}
      {path?.tab === "scenes" && <Inspector_Scenes key="scenes" />}
      {path?.tab === "files" && <Inspector_Files key="files" />}
      {path?.tab === ElementType.text && path?.value && <Inspector_ElementText id={path.value} key={`${path.tab}-${path.value}`} />}
      {path?.tab === ElementType.image && path?.value && <Inspector_ElementImage id={path.value} key={`${path.tab}-${path.value}`} />}
    </AnimatePresence>
  </div>
}

const Body: FC<PropsWithChildren<{ scrollable?: boolean }>> = ({ scrollable, children }) => {
  return <TabAnimation>
    <SimpleBar className="h-full">
      {children}
    </SimpleBar>

  </TabAnimation>
}

const Header: FC<PropsWithChildren> = memo(({ children }) => {
  return <div className="flex items-center gap-2 px-4 pt-5 text-xl font-bold">{children}</div>
})

const SubHeader: FC<PropsWithChildren> = ({ children }) => {
  return <span className="pt-4">
    <span className="font-bold text-primary flex justify-between items-center gap-2 whitespace-nowrap">{children}</span>
  </span>
}

const Description: FC<PropsWithChildren> = ({ children }) => {
  return <span>
    <span className="-mt-2 text-xs text-base-content/60 flex justify-between items-center gap-2">{children}</span>
  </span>
}

const Content: FC<PropsWithChildren> = ({ children }) => {
  return <div style={{ width: '19rem' }} className="flex flex-col p-4 space-y-2 overflow-hidden">{children}</div>
}

const Switchable: FC<PropsWithChildren<{ visible: boolean }>> = ({ visible, children }) => {
  return <AnimatePresence initial={false}>
    {visible && <motion.div
    key="switchable"
    initial={{marginTop: 0, height: 0, opacity: 0 }}
    transition={{ ease: "anticipate", duration: 0.3 }}
    exit={{ marginTop: 0, height: 0, opacity: 0 }}
    animate={{ marginTop: ".5rem", height: "auto", opacity: 1 }}
    className="flex flex-col w-full space-y-2">
      {children}
  </motion.div>}
  </AnimatePresence>
}

const variants = {
  enter: (direction: number) => {
    return {
      x: direction > 0 ? 50 : -50,
      opacity: 0
    };
  },
  center: {
    x: 0,
    opacity: 1
  },
  exit: (direction: number) => {
    return {
      x: direction < 0 ? 50 : -50,
      opacity: 0
    };
  }
};

const TabsContent: FC<PropsWithChildren<{ tabKey: number | string, direction: number }>> = forwardRef(({ children, tabKey, direction }, ref: any) => {
  return <div>
    <AnimatePresence initial={false} custom={direction} mode="popLayout">
      <motion.div
        key={tabKey}
        ref={ref}
        variants={variants}
        custom={direction}
        transition={{ ease: "anticipate", duration: 0.3 }}
        exit="exit"
        initial="enter"
        animate="center"
        className="flex flex-col space-y-2"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  </div>
});

const Tabs: FC<PropsWithChildren> = ({ children }) => {
  return <div className="-mx-1 bg-base-100 px-1 sticky top-0 pt-3 pb-2 z-10 grid grid-cols-6 gap-2">
    {children}
  </div>
}

const Tab: FC<PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement> & { tooltip: string, tooltipBody?: string, active: boolean }>> = memo(({ children, tooltipBody, tooltip, active, ...props }) => {
  const colorClasses = active ? "btn-secondary" : "text-base-content bg-neutral/10 hover:bg-neutral/30";
  return <Tooltip className="relative aspect-square" placement="bottom" content={tooltip} body={tooltipBody}>
    <button {...props} className={classNames("btn btn-circle text-lg min-h-full border-none w-full h-full", colorClasses)}>{children}</button>
  </Tooltip>
})

export default { Base, Body, Header, SubHeader, Description, Content, TabsContent, Tabs, Tab, Switchable };