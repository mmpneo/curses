import { useGetState, useUpdateState } from "@/client";
import { ServiceNetworkState } from "@/types";
import { getVersion } from '@tauri-apps/api/app';
import { FC, memo, useEffect, useState } from "react";
import { RiFileCopyLine, RiSettings2Fill } from "react-icons/ri";
import { SiDiscord, SiPatreon, SiTwitch, SiTwitter } from "react-icons/si";
import { useSnapshot } from "valtio";
import Dropdown from "../dropdown/Dropdown";
import Tooltip from "../dropdown/Tooltip";
import Logo from "../logo";
import ServiceButton from "../service-button";
import Inspector from "./components";
import { InputBaseText, InputChips, InputDoubleCountainer, InputNetworkStatus, InputSelect, InputShortcut, InputText } from "./components/input";
const themesLight = [
  'light',
  'lofi',
  'cupcake',
  'retro',
  'valentine',
  'garden',
  'aqua',
  'pastel',
  'wireframe',
  'winter',
  'cyberpunk',
  // 'corporate',
  // 'bumblebee',
  // 'emerald',
  // 'fantasy',
  // 'cmyk',
  // 'autumn',
  // 'acid',
  // 'lemonade',
]

const themesDark = [
  'curses',
  'matrix',
  'staffy',
  'dark',
  'synthwave',
  'halloween',
  'forest',
  'black',
  'dracula',
  'business',
  'night',
  'coffee',
  // 'luxury',
]

const options = [
  { label: 'Light themes', options: themesLight.map(theme => ({ value: theme, label: theme })) },
  { label: 'Dark themes', options: themesDark.map(theme => ({ value: theme, label: theme })) }
]

const UI_SCALE_MIN = 0.8;
const UI_SCALE_MAX = 1.5;

const AddrInput = () => {
  const [v, setV] = useState(window.ApiServer.state.linkAddress);
  const upd = (v: string) => {
    setV(v);
    window.ApiServer.state.linkAddress = v;
  }
  return <InputText value={v} onChange={e => upd(e.target.value)} label="Address" placeholder="192.168..smth" />
}

const ExportMenu: FC = () => {
  const [name, setName] = useState("");
  return <div className="menu bg-base-100 p-4 w-72 rounded-box flex flex-col space-y-2">
    <span className="menu-title"><span>Export template</span></span>
    <InputText label="Author" value={name} onChange={e => setName(e.target.value)} />
    <button className="btn btn-sm btn-primary" onClick={() => name && window.ApiClient.document.exportDocument(name)}>Export</button>
  </div>;
}

const Inspector_Settings: FC = memo(() => {
  const { clientTheme, uiScale, backgroundInputTimer } = useSnapshot(window.ApiServer.state);
  const { state: linkStatus } = useSnapshot(window.ApiShared.pubsub.serviceState);
  const canvas = useGetState(state => state.canvas);
  const author = useGetState(state => state.author);
  const updateState = useUpdateState();

  const [version, setVersion] = useState("")
  useEffect(() => {
    getVersion().then(setVersion);
  }, [])

  const handleChangeTheme = (v: string) => window.ApiServer.changeTheme(v);
  const handleChangeScale = (v: string | number) => {
    const _v = typeof v === "string" ? parseFloat(v) : v;
    window.ApiServer.changeScale(Math.max(UI_SCALE_MIN, Math.min(UI_SCALE_MAX, _v)));
  }

  return <Inspector.Body>
    <Inspector.Header><RiSettings2Fill /> Settings</Inspector.Header>
    <Inspector.Content>
      <div className="flex flex-col items-center space-y-1">
        <span className="text-4xl leading-none font-header font-black"><Logo/></span>
        <div className="flex space-x-1 self-center">
          <Tooltip content="/mmpcode" body={<span>I stream app development, vrc udon <br/> stuff and games sometimes</span>}>
            <a target="_blank" href="https://www.twitch.tv/mmpcode" className="btn text-primary btn-ghost btn-circle text-2xl"><SiTwitch /></a>
          </Tooltip>
          <Tooltip content="@mmpneo" body="I tweet once a year, LUL">
            <a target="_blank" href="https://twitter.com/mmpneo" className="btn text-primary btn-ghost btn-circle text-2xl"><SiTwitter /></a>
          </Tooltip>
          <Tooltip content="Code and Curses" body={<span>App updates and help</span>}>
            <a target="_blank" href="https://discord.gg/Sw6pw8fGYS" className="btn text-primary btn-ghost btn-circle text-2xl"><SiDiscord /></a>
          </Tooltip>
          <Tooltip content="Support development" body={<span>😊 Donations will greatly help development</span>}>
            <a target="_blank" href="https://www.patreon.com/mmpcode" className="btn text-primary btn-ghost btn-circle text-2xl"><SiPatreon /></a>
          </Tooltip>
        </div>
        <div className="self-center text-sm opacity-50">Made with 💗 by Mmp</div>
        <div className="self-center text-sm opacity-50">Join discord for updates and help!</div>
        <div className="self-center text-sm opacity-50">v.{version}</div>
      </div>
      <div className="divider"></div>

      {/* <Inspector.SubHeader>UI</Inspector.SubHeader> */}
      <InputSelect label="Theme" options={options} value={clientTheme} onValueChange={handleChangeTheme} />
      <InputChips label="UI scale" value={uiScale} onChange={e => handleChangeScale(e)} options={[
        { label: "S", value: .8 },
        { label: "M", value: 1 },
        { label: "L", value: 1.2 },
        { label: "X", value: 1.4 },
      ]} />

      

      <Inspector.SubHeader>Template</Inspector.SubHeader>
      {author && <span className="text-sm text-secondary font-semibold">Created by {author}</span>}
      <InputDoubleCountainer label="Canvas Size">
        <InputBaseText value={canvas?.w} onChange={e => updateState(state => { state.canvas.w = parseFloat(e.target.value) })} type="number" />
        <InputBaseText value={canvas?.h} onChange={e => updateState(state => { state.canvas.h = parseFloat(e.target.value) })} type="number" />
      </InputDoubleCountainer>
      <div className="flex items-center space-x-2">
        <button onClick={() => window.ApiClient.document.importDocument()} className="flex-grow btn btn-sm gap-2"><RiFileCopyLine /> Import</button>
        <Dropdown className="flex-grow btn btn-sm gap-2" targetOffset={24} placement="right" content={<ExportMenu />}>
          <RiFileCopyLine /> Export
        </Dropdown>
      </div>

      {window.Config.features.background_input && <>
        <Inspector.SubHeader>Background Input</Inspector.SubHeader>
        <InputShortcut label="Shortcut" shortcut="bgInput" />
        <InputText label="Timer" value={backgroundInputTimer} onChange={e => window.ApiServer.state.backgroundInputTimer = e.target.value} type="number"/>
        <div className="text-xs opacity-70">
          Use <kbd className="kbd kbd-sm font-semibold text-primary">Esc</kbd> to cancel input, <kbd className="kbd kbd-sm font-semibold text-primary">Enter</kbd> to submit and <kbd className="kbd kbd-sm font-semibold text-primary">Backspace</kbd> to delete
        </div>
      </>}


      <Inspector.SubHeader>Link apps</Inspector.SubHeader>
      <Inspector.Description>Sync text events with remote app instance</Inspector.Description>
      <Inspector.Deactivatable active={linkStatus === ServiceNetworkState.disconnected}>
        <AddrInput />
        <InputNetworkStatus value={linkStatus} label="Status" />
      </Inspector.Deactivatable>
      <ServiceButton startLabel="Connect" stopLabel="Disconnect" status={linkStatus} onStart={() => window.ApiShared.pubsub.linkConnect()} onStop={() => window.ApiShared.pubsub.linkDisconnect()} />
      <button className="btn btn-sm btn-ghost" onClick={() => window.ApiShared.pubsub.copyLinkAddress()}>Copy my address</button>

    </Inspector.Content>
  </Inspector.Body>
})
export default Inspector_Settings;
