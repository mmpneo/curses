import classNames from "classnames";
import { FC, memo, useState } from "react";
import { RiFileCopyLine, RiSettings2Fill } from "react-icons/ri";
import { SiDiscord, SiObsstudio, SiTwitch, SiTwitter } from "react-icons/si";
import { toast } from "react-toastify";
import { useSnapshot } from "valtio";
import Inspector from ".";
import { useGetState, useUpdateState } from "../../frontend-services";
import { ServiceNetworkState } from "../../types";
import Dropdown, { useDropdown } from "../dropdown/Dropdown";
import Tooltip from "../dropdown/Tooltip";
import Input from "../input";
import ServiceButton from "../service-button";

const themesLight = [
  'light',
  'lofi',
  'cupcake',
  'corporate',
  'retro',
  'valentine',
  'garden',
  'aqua',
  'pastel',
  'wireframe',
  'winter',
  'cyberpunk',
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
  { label: 'Light', options: themesLight.map(theme => ({ value: theme, label: theme })) },
  { label: 'Dark', options: themesDark.map(theme => ({ value: theme, label: theme })) }
]

const UI_SCALE_MIN = 0.8;
const UI_SCALE_MAX = 1.5;

const ObsSetupDropdown: FC = () => {
  const dropdown = useDropdown()
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("Curse captions");
  const [port, setPort] = useState("4455");
  const [password, setPassword] = useState("");

  const handleSetup = async () => {
    setError("");
    if (!port || !name)
      return;
    setLoading(true);
    const resp = await window.API.setupObsScene({ port, password, name });
    if (!resp) {
      toast.success("Updated OBS");
      dropdown.close();
    }
    else
      setError(resp)
    setLoading(false);
  }

  return <div className="menu bg-base-100 p-4 w-72 rounded-box flex flex-col space-y-2">
    <Input.Text value={name} onChange={e => setName(e.target.value)} label="Source name" />
    <Input.Text value={port} onChange={e => setPort(e.target.value)} label="Port" />
    <Input.Text type="password" autoComplete="false" value={password} onChange={e => setPassword(e.target.value)} label="Password" />
    <span className="text-xs opacity-50">New source will be created in the currently active scene</span>
    {error && <span className="text-xs text-error">{error}</span>}
    <button onClick={handleSetup} className={classNames("btn btn-sm btn-primary", { loading })}>Confirm</button>
  </div>
}

const AddrInput = () => {
  const [v, setV] = useState(window.API.state.linkAddress);
  const upd = (v: string) => {
    setV(v);
    window.API.state.linkAddress = v;
  }
  return <Input.Text value={v} onChange={e => upd(e.target.value)} label="Address" placeholder="192.168..smth" />
}

const Inspector_Settings: FC = memo(() => {
  const {  clientTheme, uiScale } = useSnapshot(window.API.state);
  const {state: linkStatus} = useSnapshot(window.API.pubsub.serviceState);
  const canvas = useGetState(state => state.canvas);
  const updateState = useUpdateState();

  const handleChangeTheme = (v: string) => window.API.changeTheme(v);
  const handleChangeScale = (v: string | number) => {
    const _v = typeof v === "string" ? parseFloat(v) : v;
    window.API.changeScale(Math.max(UI_SCALE_MIN, Math.min(UI_SCALE_MAX, _v)));
  }

  return <Inspector.Body>
    <Inspector.Header><RiSettings2Fill /> Settings</Inspector.Header>
    <Inspector.Content>

      <div className="flex flex-col items-center space-y-1">
        <span className="text-6xl leading-none font-header font-black">curses</span>
        <div className="flex space-x-1 self-center">
          <a target="_blank" href="https://www.twitch.tv/mmpcode" className="btn text-primary btn-ghost btn-circle text-2xl"><SiTwitch/></a>
          <a target="_blank" href="https://twitter.com/mmpneo" className="btn text-primary btn-ghost btn-circle text-2xl"><SiTwitter/></a>
          <a target="_blank" href="https://discord.gg/SMKjA2yGf7" className="btn text-primary btn-ghost btn-circle text-2xl"><SiDiscord/></a>
        </div>
        <div className="self-center text-sm font-semibold opacity-50">Made with 💗 by Mmp</div>
      </div>
      <div className="divider"></div>

      {/* <Inspector.SubHeader>Canvas</Inspector.SubHeader> */}
      <Inspector.SubHeader>UI</Inspector.SubHeader>
      <Input.DoubleCountainer label="Canvas Size">
        <Input.BaseText value={canvas?.w} onChange={e => updateState(state => { state.canvas.w = parseFloat(e.target.value) })} type="number"/>
        <Input.BaseText value={canvas?.h} onChange={e => updateState(state => { state.canvas.h = parseFloat(e.target.value) })} type="number"/>
      </Input.DoubleCountainer>

      <Input.Select label="Theme" options={options} value={{ value: clientTheme, label: clientTheme }} onChange={(e: any) => handleChangeTheme(e.value)} />
      <Input.Chips label="UI scale" value={uiScale} onChange={e => handleChangeScale(e)} options={[
        { label: "S", value: .8 },
        { label: "M", value: 1 },
        { label: "L", value: 1.2 },
        { label: "X", value: 1.4 },
      ]} />

      <Inspector.SubHeader>Setup client</Inspector.SubHeader>
      <Inspector.Description>Create new browser source, paste the link and set window size to {canvas.w}x{canvas.h} pixels</Inspector.Description>
      <div className="flex items-center space-x-2">
        <button onClick={window.APIFrontend.network.copyClientLink} className="flex-grow btn btn-sm border-2 gap-2"><RiFileCopyLine /> Copy url</button>
        <span className="text-sm text-base-content/50 font-medium">or</span>
        <Tooltip placement="top" className="flex-grow flex flex-col" content="Setup browser source" body={<span><span className="font-medium">Active "obs-websocket"</span> plugin required. <br /> OBS 28.x should have it by default, just enable it!</span>}>
          <Dropdown className="flex-grow btn btn-sm gap-2" targetOffset={24} placement="right" content={<ObsSetupDropdown />}>
            <SiObsstudio /> Setup OBS
          </Dropdown>
        </Tooltip>
      </div>

      <Inspector.SubHeader>Link apps</Inspector.SubHeader>
      <Inspector.Description>Sync text events with remote app instance</Inspector.Description>
      <Inspector.Deactivatable active={linkStatus === ServiceNetworkState.disconnected}>
        <AddrInput/>
        <Input.NetworkStatus value={linkStatus} label="Status"/>
      </Inspector.Deactivatable>
      <ServiceButton startLabel="Connect" stopLabel="Disconnect" status={linkStatus} onStart={() => window.API.pubsub.linkConnect()} onStop={() => window.API.pubsub.linkDisconnect()} />
      <button className="btn btn-sm btn-ghost" onClick={() => window.API.pubsub.copyLinkAddress()}>Copy my address</button>

    </Inspector.Content>
  </Inspector.Body>
})

export default Inspector_Settings;