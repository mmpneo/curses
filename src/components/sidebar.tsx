import {ButtonHTMLAttributes, FC, PropsWithChildren, useCallback, useRef, useState}                             from "react";
import Inspector_VRC                                                                                                                        from "../services/vrc/inspector";
import SimpleBar                                                                                                                            from "simplebar-react";
import {AnimatePresence, motion}                                                                                                            from "framer-motion";
import {Services}                                                                                                                           from "../services";
import Inspector_STT                                                                                                                        from "../services/stt/inspector";
import {TbTextResize}                                                                                                                       from "react-icons/tb";
import {RiAddFill, RiCloseFill, RiImageFill, RiMessage2Fill, RiMicFill, RiSettings2Fill, RiStackFill, RiTwitchFill, RiVoiceRecognitionFill} from "react-icons/ri";
import Inspector_TTS                                                                                                                        from "../services/tts/inspector";
import Inspector_Twitch                                                                                                                     from "../services/twitch/inspector";
import Tooltip                                                                                                                              from "./dropdown/Tooltip";
import classNames                                                                                                                           from "classnames";
import {useSnapshot}                                                                                                                        from "valtio";
import {STT_Backends}                                                                                                                       from "../services/stt/schema";

const Button: FC<PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>> & {
  active?: boolean,
  tooltip?: string
}> = ({active, tooltip, children, ...rest}) => {
  return <Tooltip placement={["right"]} content={tooltip}>
    <button {...rest} className={classNames("flex-none btn text-lg btn-circle", active ? "btn-primary" : null)}>{children}</button>
  </Tooltip>
}

const Divider: FC = () => {
  return <div className="flex-none h-1 w-4 bg-neutral rounded-full"></div>
}

const Inspector: FC<PropsWithChildren> = ({children}) => {
  return <div className="w-full h-full w-80 flex-none bg-base-100 rounded-xl py-3 px-4 flex flex-col space-y-2">
    {children}
  </div>
}

type TabPath = {
  tab: Services | "settings",
  value?: string
}


const themesLight                  = [
  'light',
  'lofi',
  'cupcake',
  'bumblebee',
  'emerald',
  'corporate',
  'retro',
  'valentine',
  'garden',
  'aqua',
  'pastel',
  'fantasy',
  'cmyk',
  'autumn',
  'acid',
  'wireframe',
  'lemonade',
  'winter',
  'cyberpunk',
]

const themesDark                  = [
  'dark',
  'synthwave',
  'halloween',
  'forest',
  'black',
  'luxury',
  'dracula',
  'business',
  'night',
  'coffee',
]


const Inspector_Settings: FC = () => {
  const state = useSnapshot(window.API.state)
  const handleChangeTheme = (v: string) => window.API.changeTheme(v);
  return <>
    <div className="text-lg font-bold">Settings</div>
    <fieldset>
      <label>Theme</label>
      <select onChange={e => handleChangeTheme(e.target.value)} value={state.clientTheme} className="field-width">
        <optgroup label="Light">
          {themesLight.map((theme, i) => <option key={i} value={theme}>{theme}</option>)}
        </optgroup>
        <optgroup label="Dark">
          {themesDark.map((theme, i) => <option key={i} value={theme}>{theme}</option>)}
        </optgroup>
      </select>
    </fieldset>
  </>
}

const Sidebar: FC = () => {
  const [show, setShow] = useState(false);
  const ref             = useRef(null);

  const [tab, setTab] = useState<TabPath | null>(null);

  const handleSetTab = useCallback((v: TabPath) => {
    if (tab?.tab === v.tab && show) {
      setShow(false);
      return;
    }

    setShow(true);
    setTab(v);
  }, [tab, show]);

  return <div ref={ref} className="flex h-full">
    <SimpleBar className="w-16 z-10" style={{height: "100%"}}>
      <div className="py-3 h-full flex-none flex flex-col items-center space-y-2">
        <Button tooltip="Speech to text" active={show && tab?.tab === Services.stt} onClick={() => handleSetTab({tab: Services.stt})}><RiMicFill/></Button>
        <Button tooltip="Text to speech" active={show && tab?.tab === Services.tts} onClick={() => handleSetTab({tab: Services.tts})}><RiVoiceRecognitionFill/></Button>
        <Button tooltip="Vrchat OSC" active={show && tab?.tab === Services.vrc} onClick={() => handleSetTab({tab: Services.vrc})}><RiMessage2Fill/></Button>
        <Button tooltip="Twitch integration" active={show && tab?.tab === Services.twitch} onClick={() => handleSetTab({tab: Services.twitch})}><RiTwitchFill/></Button>
        <Button tooltip="Settings & About" active={show && tab?.tab === "settings"} onClick={() => handleSetTab({tab: "settings"})}><RiSettings2Fill/></Button>
        <Divider/>
        <Button tooltip="Scenes"><RiStackFill/></Button>
        <Button tooltip="Text element"><TbTextResize/></Button>
        <Button tooltip="Image element"><RiImageFill/></Button>
        <Button tooltip="Add element"><RiAddFill/></Button>
        <Divider/>
        <Button tooltip="Files">FLS</Button>
        <Button tooltip="Fonts">FLS</Button>
      </div>
    </SimpleBar>
    <AnimatePresence>
      {show && <motion.div
        key="inspector-opacity"
        initial={{opacity: 0}}
        transition={{ease: "easeInOut", duration: 0.3}}
        exit={{opacity: 0}}
        animate={{opacity: 1}}
        className="relative h-full py-3">
        <button className="z-20 top-3 absolute -right-14 btn btn-ghost btn-active btn-circle text-lg" onClick={() => setShow(false)}><RiCloseFill/></button>
        <motion.div
          initial={{x: -20, width: 0}}
          transition={{ease: "anticipate", duration: 0.3}}
          exit={{x: -20, width: 0}}
          animate={{x: 0, width: "auto"}}
          key="inspector-size" className="flex h-full overflow-hidden">
          <Inspector>
            {tab?.tab === Services.stt && <Inspector_STT/>}
            {tab?.tab === Services.tts && <Inspector_TTS/>}
            {tab?.tab === Services.twitch && <Inspector_Twitch/>}
            {tab?.tab === Services.vrc && <Inspector_VRC/>}
            {tab?.tab === "settings" && <Inspector_Settings/>}
          </Inspector>
        </motion.div>
      </motion.div>}
    </AnimatePresence>
  </div>
}

export default Sidebar;
