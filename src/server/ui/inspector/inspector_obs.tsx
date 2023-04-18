import { useGetState } from "@/client";
import { OBS_State } from "@/server/services/obs/schema";
import classNames from "classnames";
import { FC, useState } from "react";
import { RiFileCopyLine } from "react-icons/ri";
import { SiObsstudio } from "react-icons/si";
import { toast } from "react-toastify";
import { useSnapshot } from "valtio";
import Dropdown, { useDropdown } from "../dropdown/Dropdown";
import Tooltip from "../dropdown/Tooltip";
import Inspector from "./components";
import { InputCheckbox, InputNetworkStatus, InputText, InputTextSource } from "./components/input";
import ServiceButton from "../service-button";

const ObsSetupDropdown: FC = () => {
  const dropdown = useDropdown();
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
    const resp = await window.ApiServer.obs.setupObsScene({ port, password, name });
    if (!resp) {
      toast.success("Updated OBS");
      dropdown.close();
    }
    else
      setError(resp)
    setLoading(false);
  }

  return <div className="menu bg-base-100 p-4 w-72 rounded-box flex flex-col space-y-2">
    <InputText value={name} onChange={e => setName(e.target.value)} label="Source name" />
    <InputText value={port} onChange={e => setPort(e.target.value)} label="Port" />
    <InputText type="password" autoComplete="false" value={password} onChange={e => setPassword(e.target.value)} label="Password" />
    <span className="text-xs opacity-50">New source will be created in the currently active scene</span>
    {error && <span className="text-xs text-error">{error}</span>}
    <button onClick={handleSetup} className={classNames("btn btn-sm btn-primary", { loading })}>Confirm</button>
  </div>
}

const Inspector_OBS: FC = () => {
  const canvas = useGetState(state => state.canvas);
  const data = useSnapshot(window.ApiServer.state.services.obs.data);
  const wsState = useSnapshot(window.ApiServer.obs.wsState);
  const up = <K extends keyof OBS_State>(key: K, v: OBS_State[K]) => window.ApiServer.patchService("obs", s => s.data[key] = v);

  const handleStartWs = () => {
    window.ApiServer.obs.wsConnect();
  }

  const handleStopWs = () => window.ApiServer.obs.wsDisconnect();

  return <Inspector.Body>
    <Inspector.Header><SiObsstudio/> OBS Studio</Inspector.Header>
    <Inspector.Content>
      <Inspector.SubHeader>Browser source captions</Inspector.SubHeader>
      <Inspector.Description>Create new browser source, paste the link and set window size to {canvas.w}x{canvas.h} pixels</Inspector.Description>
      <button onClick={window.ApiShared.peer.copyClientLink} className="flex-grow btn btn-sm border-2 gap-2"><RiFileCopyLine /> Copy browser source  url</button>
      {/* <div className="flex items-center space-x-2">
        <span className="text-sm text-base-content/50 font-medium">or</span>
        <Tooltip placement="top" className="flex-grow flex flex-col" content="Setup browser source" body={<span><span className="font-medium">Active "obs-websocket"</span> plugin required. <br /> OBS 28.x should have it by default, just enable it!</span>}>
          <Dropdown className="flex-grow btn btn-sm gap-2" targetOffset={24} placement="right" content={<ObsSetupDropdown />}>
            <SiObsstudio /> Setup OBS
          </Dropdown>
        </Tooltip>
      </div> */}

      {/* <Inspector.SubHeader>Websocket Plugin</Inspector.SubHeader> */}
      <Inspector.SubHeader>Native stream captions</Inspector.SubHeader>
      <Inspector.Description><span><span className="font-medium">"obs-websocket"</span> plugin required. <br /> OBS 28.x should have it by default, just enable it!</span></Inspector.Description>
      <InputCheckbox value={data.wsAutoStart} onChange={e => up("wsAutoStart", e)} label="Connect on start" />
      <InputNetworkStatus label="OBS connection" value={wsState.status} />
      <InputText type="number" value={data.wsPort} onChange={e => up("wsPort", e.target.value)} label="Websocket Port" />
      <InputText type="password" value={data.wsPassword} onChange={e => up("wsPassword", e.target.value)} label="Websocket Password" />
      {/* <InputCheckbox value={data.enable} onChange={e => up("enable", e)} label="Enable captions" /> */}
      <InputTextSource value={data.source} onChange={e => up("source", e)} label="Source"/>
      <InputCheckbox value={data.inputField} onChange={e => up("inputField", e)} label="Input field" />
      <InputCheckbox value={data.interim} onChange={e => up("interim", e)} label="Show interim" />
      <ServiceButton 
        showError
        errorLabel="Error. Try recconect"
        stopLabel="Disconnect"
        startLabel="Connect"
        onError={handleStartWs}
        status={wsState.status}
        onStart={handleStartWs}
        onStop={handleStopWs}/>
    </Inspector.Content>
  </Inspector.Body>
}

export default Inspector_OBS;
