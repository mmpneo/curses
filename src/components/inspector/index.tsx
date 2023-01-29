import classNames from "classnames";
import { AnimatePresence, motion } from "framer-motion";
import { ButtonHTMLAttributes, FC, forwardRef, memo, PropsWithChildren, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { toast } from "react-toastify";
import SimpleBar from "simplebar-react";
import { Services } from "../../backend-services";
import Inspector_STT from "../../backend-services/stt/inspector";
import Inspector_Translation from "../../backend-services/translation/inspector";
import Inspector_TTS from "../../backend-services/tts/inspector";
import Inspector_Twitch from "../../backend-services/twitch/inspector";
import Inspector_VRC from "../../backend-services/vrc/inspector";
import Inspector_ElementImage from "../../frontend-services/elements/image/inspector";
import Inspector_ElementText from "../../frontend-services/elements/text/inspector";
import Inspector_Files from "../../frontend-services/files/inspector";
import { ElementType } from "../../frontend-services/schema/element";
import { InspectorTabPath } from "../../types";
import { TabAnimation } from "../animation";
import Tooltip from "../dropdown/Tooltip";
import Inspector_Scenes from "./inspector_scenes";
import Inspector_Settings from "./inspector_settings";

const Base: FC<{ path?: InspectorTabPath }> = ({ path }) => {
  const handleCopyError = (err: string) => {
    navigator.clipboard.writeText(err);
    toast.success("Copied!");
  }
  return <div style={{ width: '19rem' }} className="relative h-full flex-none bg-base-100 rounded-t-box flex flex-col overflow-hidden">
    <ErrorBoundary fallbackRender={({ error, resetErrorBoundary }) => (
      <div className="w-full h-full flex flex-col items-center justify-center p-4 space-y-2">
        <div className="flex flex-col items-center">
          <img className="w-16 grayscale" src="/images/ui-noo.gif" />
          <div className="text-primary font-semibold font-header inline-block">Inspector crashed!</div>
          <pre className="text-xs text-base-content/50 whitespace-pre-wrap text-center">
            Try to close and open it again.
            If this doesn't work, you can ask for help in the <a className="link text-secondary ink-primary link-hover" href="discord://-/channels/856500849815060500/1058343274991058945">Discord #help</a>
          </pre>
        </div>
        {error.stack && <pre style={{ fontSize: 9 }} className="relative w-full text-xs rounded-box bg-base-200 h-24">
          <SimpleBar className="w-full h-full">
            <pre className="px-2 truncate break-words whitespace-pre-wrap">{error.stack}</pre>
          </SimpleBar>
          <button className="absolute right-2 top-0 btn btn-link btn-xs self-start" onClick={() => error.stack && handleCopyError(error.stack)}>
            Copy
          </button>
        </pre>}
      </div>
    )}>
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
    </ErrorBoundary>
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
  return <div className="flex font-header items-center gap-2 px-4 pt-4 text-xl font-extrabold">{children}</div>
})

const SubHeader: FC<PropsWithChildren> = ({ children }) => {
  return <span className="first:pt-0 pt-4">
    <span className="flex font-header font-bold text-primary justify-between items-center gap-2 whitespace-nowrap">{children}</span>
  </span>
}

const Description: FC<PropsWithChildren> = ({ children }) => {
  return <span>
    <span className="-mt-2 text-xs text-base-content/70 flex justify-between items-center gap-2">{children}</span>
  </span>
}

const Content: FC<PropsWithChildren> = ({ children }) => {
  return <div style={{ width: '19rem' }} className="flex flex-col p-4 space-y-2">{children}</div>
}

const Switchable: FC<PropsWithChildren<{ visible: boolean }>> = ({ visible, children }) => {
  return <AnimatePresence initial={false}>
    {visible && <motion.div
      key="switchable"
      initial={{ marginTop: 0, height: 0, opacity: 0 }}
      transition={{ ease: "anticipate", duration: 0.3 }}
      exit={{ marginTop: 0, height: 0, opacity: 0 }}
      animate={{ marginTop: ".5rem", height: "auto", opacity: 1 }}
      className="flex flex-col w-full space-y-2">
      <span></span>
      {children}
    </motion.div>}
  </AnimatePresence>
}

const Deactivatable: FC<PropsWithChildren<{ active: boolean }>> = ({ active, children }) => {
  return <div className={classNames("flex flex-col w-full space-y-2 transition-opacity", !active ? "opacity-50 pointer-events-none" : "")}>
    <span></span>
    {children}
  </div>
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

export const useInspectorTabs = () => {
  const [[tab, direction], setTab] = useState<[number, number]>([0, 0]);
  const handleTab = (v: number) => {
    setTab([v, Math.sign(v - tab)]);
  }
  return [[tab, direction], handleTab] as [[number, number], (v: number) => void];
}

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
  return <div className="-mx-1 bg-base-100 px-1 sticky top-0 pt-3 pb-2 z-10 grid grid-cols-6 gap-2 overflow-hidden">
    {children}
  </div>
}

const Tab: FC<PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement> & { tooltip: string, tooltipBody?: string, active: boolean }>> = memo(({ children, tooltipBody, tooltip, active, ...props }) => {
  const colorClasses = active ? "btn-secondary" : "text-base-content bg-neutral/10 hover:bg-neutral/30";
  return <Tooltip className="relative aspect-square" placement="bottom" content={tooltip} body={tooltipBody}>
    <button {...props} className={classNames("btn btn-circle text-lg min-h-full border-none w-full h-full", colorClasses)}>{children}</button>
  </Tooltip>
})

export default { Base, Body, Header, SubHeader, Description, Content, Deactivatable, TabsContent, Tabs, Tab, Switchable };