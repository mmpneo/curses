import classNames from "classnames";
import { FC, useState } from "react";
import { RiFileCopyLine, RiSettings2Fill } from "react-icons/ri";
import { SiObsstudio } from "react-icons/si";
import { toast } from "react-toastify";
import { useSnapshot } from "valtio";
import Inspector from ".";
import { useGetState, useUpdateState } from "../../frontend-services";
import Dropdown, { useDropdown } from "../dropdown/Dropdown";
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

const Inspector_Settings: FC = () => {
  const { clientTheme, uiScale } = useSnapshot(window.API.state);
  const canvas = useGetState(state => state.canvas);
  const updateState = useUpdateState();

  const handleChangeTheme = (v: string) => window.API.changeTheme(v);
  const handleChangeScale = (v: string | number) => {
    const _v = typeof v === "string" ? parseFloat(v) : v;
    window.API.changeScale(Math.max(UI_SCALE_MIN, Math.min(UI_SCALE_MAX, _v)));
  }

  const handleCopyPubsub = () => {
    const { localIp, port } = window.networkConfiguration;
    // copy(`${localIp}:${port}`);
  }

  return <Inspector.Body>
    <Inspector.Header><RiSettings2Fill /> Settings</Inspector.Header>
    <Inspector.Content>
      <Inspector.SubHeader>Canvas</Inspector.SubHeader>
      <Input.DoubleCountainer label="Canvas Size">
        <Input.BaseText value={canvas?.w} onChange={e => updateState(state => { state.canvas.w = parseFloat(e.target.value) })} type="number"/>
        <Input.BaseText value={canvas?.h} onChange={e => updateState(state => { state.canvas.h = parseFloat(e.target.value) })} type="number"/>
      </Input.DoubleCountainer>

      <Inspector.SubHeader>UI</Inspector.SubHeader>
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

      {/* <div className="divider text-xs font-semibold">or</div> */}
      {/* <button className="btn btn-sm gap-2"><RiFileCopyLine /> Copy link</button> */}

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
      <button className="btn btn-sm btn-neutral">Connect</button>
      {/* <Input.NetworkStatus value={ServiceNetworkState.connected} label="Connection" /> */}
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