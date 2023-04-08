import { Discord_State } from "@/server/services/discord/schema";
import { FC, useState } from "react";
import { SiObsstudio } from "react-icons/si";
import { toast } from "react-toastify";
import { useSnapshot } from "valtio";
import Dropdown, { useDropdown } from "../dropdown/Dropdown";
import Tooltip from "../dropdown/Tooltip";
import Inspector from "./components";
import { InputText } from "./components/input";
import classNames from "classnames";
import { RiFileCopyLine } from "react-icons/ri";
import { useGetState } from "@/client";

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
    const resp = await window.ApiServer.setupObsScene({ port, password, name });
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
  
  return <Inspector.Body>
    <Inspector.Header><SiObsstudio/> OBS Studio</Inspector.Header>
    <Inspector.Content>
    <Inspector.SubHeader>Setup client</Inspector.SubHeader>
      <Inspector.Description>Create new browser source, paste the link and set window size to {canvas.w}x{canvas.h} pixels</Inspector.Description>
      <div className="flex items-center space-x-2">
        <button onClick={window.ApiShared.peer.copyClientLink} className="flex-grow btn btn-sm border-2 gap-2"><RiFileCopyLine /> Copy url</button>
        <span className="text-sm text-base-content/50 font-medium">or</span>
        <Tooltip placement="top" className="flex-grow flex flex-col" content="Setup browser source" body={<span><span className="font-medium">Active "obs-websocket"</span> plugin required. <br /> OBS 28.x should have it by default, just enable it!</span>}>
          <Dropdown className="flex-grow btn btn-sm gap-2" targetOffset={24} placement="right" content={<ObsSetupDropdown />}>
            <SiObsstudio /> Setup OBS
          </Dropdown>
        </Tooltip>
      </div>
    </Inspector.Content>
  </Inspector.Body>
}

export default Inspector_OBS;
