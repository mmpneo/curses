import { FC, useState } from "react";
import { RiFileCopyLine, RiSettings2Fill } from "react-icons/ri";
import { SiObsstudio } from "react-icons/si";
import { useCopyToClipboard } from "react-use";
import { useSnapshot } from "valtio";
import Inspector from ".";
import { useGetState } from "../../frontend-services";
import { ServiceNetworkState } from "../../types";
import Dropdown from "../dropdown/Dropdown";
import Tooltip from "../dropdown/Tooltip";
import Input from "../input";

const themesLight = [
  'customblack',
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

const options = [
  { label: 'Light', options: themesLight.map(theme => ({ value: theme, label: theme })) },
  { label: 'Dark', options: themesDark.map(theme => ({ value: theme, label: theme })) }
]

const UI_SCALE_MIN = 0.8;
const UI_SCALE_MAX = 1.5;

const ObsSetup: FC = () => {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("Curse captions");
  const [port, setPort] = useState("4455");
  const [password, setPassword] = useState("");

  const handleSetup = async () => {
    setError("");
    if (!port || !name)
      return;
    const resp = await window.API.setupObsScene({port, password, name});
    resp ? setError(resp) : setSuccess(true);
  }

  return <div className="menu bg-base-100 p-4 w-72 rounded-box flex flex-col space-y-2">
    <Input.Text value={name} onChange={e => setName(e.target.value)} label="Source name" />
    <Input.Text value={port} onChange={e => setPort(e.target.value)} label="Port" />
    <Input.Text type="password" autoComplete="false" value={password} onChange={e => setPassword(e.target.value)} label="Password" />
    <span className="text-xs opacity-50">New source will be created in the currently active scene</span>
    {error && <span className="text-xs text-error">{error}</span>}
    {success ?
      <button className="btn btn-sm btn-success">Success</button> : 
      <button onClick={handleSetup} className="btn btn-sm btn-primary">Confirm</button>
    }
  </div>
}

const Inspector_Settings: FC = () => {
  const { clientTheme, uiScale } = useSnapshot(window.API.state);
  const canvasState = useGetState(state => state.canvas);
  const handleChangeTheme = (v: string) => window.API.changeTheme(v);
  const handleChangeScale = (v: string | number) => {
    const _v = typeof v === "string" ? parseFloat(v) : v;
    window.API.changeScale(Math.max(UI_SCALE_MIN, Math.min(UI_SCALE_MAX, _v)));
  }

  const [, copy] = useCopyToClipboard();

  const handleCopyLocalClient = () => {
    const { host, port } = window.networkConfiguration;
    copy(`${host}:${port}/client`);
  }
  const handleCopyPubsub = () => {
    const { localIp, port } = window.networkConfiguration;
    copy(`${localIp}:${port}`);
  }

  const [testSwitch, setSwitch] = useState(false);

  return <Inspector.Body>
    <Inspector.Header><RiSettings2Fill /> Settings</Inspector.Header>
    <Inspector.Content>
      <Inspector.SubHeader>Setup client</Inspector.SubHeader>

      {/* <div className="btn-group w-full">
        <button className="flex-grow btn btn-outline border-2 btn-sm btn-primary gap-2"><SiObsstudio /> Setup OBS</button>
        <button className="flex-grow btn btn-sm btn-primary gap-2"><RiFileCopyLine /> Copy url</button>
      </div> */}

      <Dropdown targetOffset={24} placement="right" content={<ObsSetup />}>
        <Tooltip placement="top" className="w-full flex flex-col" content="Setup browser source" body={<span><span className="font-medium">Active "obs-websocket"</span> plugin required. <br /> OBS 28.x should have it by default, just enable it!</span>}>
          <button className="btn btn-sm btn-primary gap-2"><SiObsstudio /> Setup OBS</button>
        </Tooltip>
      </Dropdown>
      <div className="divider text-xs font-semibold">or</div>
      <button className="btn btn-outline border-2 btn-sm btn-primary gap-2"><RiFileCopyLine /> Copy link</button>
      <div className="text-xs text-center">Create new browser source, paste the link and set window size to {canvasState.w}x{canvasState.h} pixels</div>

      <Inspector.SubHeader>UI</Inspector.SubHeader>
      <Input.Select label="Theme" options={options} value={{ value: clientTheme, label: clientTheme }} onChange={(e: any) => handleChangeTheme(e.value)} />
      <Input.Chips label="UI scale" value={uiScale} onChange={e => handleChangeScale(e)} options={[
        { label: "S", value: .8 },
        { label: "M", value: 1 },
        { label: "L", value: 1.2 },
        { label: "X", value: 1.4 },
      ]} />


      {/* <Input.Checkbox value={testSwitch} onChange={v => setSwitch(v)} label="Remote share" />
      <Inspector.Switchable visible={testSwitch}>
        <Input.NetworkStatus value={ServiceNetworkState.connected} label="Remote connection" />
        <Input.Container label="Remote url">
          <div className="field-width input-group">
            <input disabled value="copy link" className="w-full cursor-text font-medium input input-sm input-bordered" />
            <button className="btn btn-sm text-lg">
              <RiFileCopyLine/>
            </button>
          </div>
        </Input.Container>
      </Inspector.Switchable> */}

      <Inspector.SubHeader>Link apps</Inspector.SubHeader>
      <Inspector.Description>Sync text events with remote app instance</Inspector.Description>
      <Input.Text label="Address" placeholder="127.0.0.1:3030" />
      <Input.NetworkStatus value={ServiceNetworkState.connected} label="Connection" />
      <button className="btn btn-sm btn-neutral">Connect</button>
      <button className="btn btn-sm btn-ghost" onClick={handleCopyPubsub}>Copy local address</button>

      {/* <Input.Container label="Link">
        <div className="btn-group">
          <button className="btn btn-sm self-end">Copy</button>
          <button className="btn btn-sm self-end">Copy remote</button>
          <button className="btn btn-sm btn-warning self-end">Refresh</button>
        </div>
      </Input.Container> */}

      <div className="opacity-50">Made with 💗 by Mmp</div>
    </Inspector.Content>
  </Inspector.Body>
}

export default Inspector_Settings;