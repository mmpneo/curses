import { useId } from "@floating-ui/react-dom-interactions";
import { AnimatePresence, motion } from "framer-motion";
import { FC, memo, PropsWithChildren } from "react";
import SimpleBar from "simplebar-react";
import { Services } from "../../backend-services";
import Inspector_STT from "../../backend-services/stt/inspector";
import Inspector_TTS from "../../backend-services/tts/inspector";
import Inspector_Twitch from "../../backend-services/twitch/inspector";
import Inspector_VRC from "../../backend-services/vrc/inspector";
import { InspectorTabPath } from "../../types";
import Inspector_Scenes from "./inspector_scenes";
import Inspector_Settings from "./inspector_settings";

const Base: FC<{ path?: InspectorTabPath }> = ({ path }) => {
  return <div className="relative h-full w-80 flex-none bg-base-100 rounded-box flex flex-col overflow-hidden">
    <AnimatePresence initial={false}>
      {path?.tab === Services.stt && <Inspector_STT key="stt" />}
      {path?.tab === Services.tts && <Inspector_TTS key="tts" />}
      {path?.tab === Services.twitch && <Inspector_Twitch key="twitch" />}
      {path?.tab === Services.vrc && <Inspector_VRC key="vrc" />}
      {path?.tab === "settings" && <Inspector_Settings key="settings" />}
      {path?.tab === "scenes" && <Inspector_Scenes key="scenes" />}
    </AnimatePresence>
  </div>
}

export const Body: FC<PropsWithChildren<{ scrollable?: boolean }>> = ({ scrollable, children }) => {
  const id = useId();
  return <motion.div
    key={id}
    initial={{x: -20, opacity: 0 }}
    transition={{ ease: "anticipate", duration: 0.3}}
    exit={{ x: 20, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    className="absolute inset-0">
    <SimpleBar className="h-full">
      {children}
    </SimpleBar>
  </motion.div>
}

export const Header: FC<PropsWithChildren> = memo(({ children }) => {
  return <div className="px-4 pt-5 text-xl font-bold">{children}</div>
})

const SubHeader: FC<PropsWithChildren> = ({ children }) => {
  return <span className="pt-3 font-semibold text-xs opacity-50">{children}</span>
}

export const Content: FC<PropsWithChildren> = ({ children }) => {
  return <div className="flex flex-col py-4 px-4 space-y-2">{children}</div>
}


export default { Base, Body, Header, SubHeader, Content };