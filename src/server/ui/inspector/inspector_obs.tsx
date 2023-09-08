import { useGetState } from "@/client";
import { OBS_State } from "@/server/services/obs/schema";
import classNames from "classnames";
import { FC, useState } from "react";
import { RiFileCopyLine } from "react-icons/ri";
import { SiObsstudio } from "react-icons/si";
import { toast } from "react-toastify";
import { useSnapshot } from "valtio";
import { useDropdown } from "../dropdown/Dropdown";
import ServiceButton from "../service-button";
import Inspector from "./components";
import { InputCheckbox, InputMapObject, InputNetworkStatus, InputText, InputTextSource } from "./components/input";
import { useTranslation } from "react-i18next";

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
  const {t} = useTranslation();
  const canvas = useGetState(state => state.canvas);
  const data = useSnapshot(window.ApiServer.state.services.obs.data);
  const wsState = useSnapshot(window.ApiServer.obs.wsState);
  const up = <K extends keyof OBS_State>(key: K, v: OBS_State[K]) => window.ApiServer.patchService("obs", s => s.data[key] = v);

  const handleStartWs = () => {
    window.ApiServer.obs.wsConnect();
  }

  const handleStopWs = () => window.ApiServer.obs.wsDisconnect();
  const handleCancelWs = () => window.ApiServer.obs.wsCancel();

  return <Inspector.Body>
    <Inspector.Header><SiObsstudio/> {t("obs.title")}</Inspector.Header>
    <Inspector.Content>
      <Inspector.SubHeader>{t('obs.section_browser_source')}</Inspector.SubHeader>
      <Inspector.Description>{t('obs.browser_source_desc', {width: canvas.w, height: canvas.h})}</Inspector.Description>
      <button onClick={window.ApiShared.peer.copyClientLink} className="flex-grow btn btn-sm border-2 gap-2"><RiFileCopyLine /> {t('obs.btn_copy_browser_source_link')}</button>
      {/* <div className="flex items-center space-x-2">
        <span className="text-sm text-base-content/50 font-medium">or</span>
        <Tooltip placement="top" className="flex-grow flex flex-col" content="Setup browser source" body={<span><span className="font-medium">Active "obs-websocket"</span> plugin required. <br /> OBS 28.x should have it by default, just enable it!</span>}>
          <Dropdown className="flex-grow btn btn-sm gap-2" targetOffset={24} placement="right" content={<ObsSetupDropdown />}>
            <SiObsstudio /> Setup OBS
          </Dropdown>
        </Tooltip>
      </div> */}

      <Inspector.SubHeader>{t('obs.section_websocket')}</Inspector.SubHeader>
      <Inspector.Description>{t('obs.websocket_desc')}</Inspector.Description>
      <InputCheckbox label="obs.field_auto_connect" value={data.wsAutoStart} onChange={e => up("wsAutoStart", e)} />
      <InputNetworkStatus label="common.field_connection_status" value={wsState.status} />
      <InputText label="common.field_connection_port" type="number" value={data.wsPort} onChange={e => up("wsPort", e.target.value)} />
      <InputText label="common.field_password" type="password" value={data.wsPassword} onChange={e => up("wsPassword", e.target.value)} />
      <ServiceButton 
        showError
        errorLabel="Error - Try Again"
        stopLabel="common.btn_disconnect"
        startLabel="common.btn_connect"
        onError={handleStartWs}
        status={wsState.status}
        onStart={handleStartWs}
        onPending={handleCancelWs}
        onStop={handleStopWs}/>
      <Inspector.SubHeader>{t('obs.section_native_captions')}</Inspector.SubHeader>
      {/* <InputCheckbox value={data.enable} onChange={e => up("enable", e)} label="Enable captions" /> */}
      <InputCheckbox value={data.captionsEnable} onChange={e => up("captionsEnable", e)} label="common.field_enable" />
      <InputTextSource value={data.source} onChange={e => up("source", e)} label="common.field_text_source"/>
      <InputCheckbox value={data.inputField} onChange={e => up("inputField", e)} label="common.field_use_keyboard_input" />
      <InputCheckbox value={data.interim} onChange={e => up("interim", e)} label="common.field_interim_results" />

      <Inspector.SubHeader>{t('obs.section_scenes')}</Inspector.SubHeader>
      <Inspector.Description>{t('obs.section_scenes_desc')}</Inspector.Description>
      <InputCheckbox value={data.scenesEnable} onChange={e => up("scenesEnable", e)} label="common.field_enable" />
      <InputText value={data.scenesFallback} onChange={e => up("scenesFallback", e.target.value)} label="obs.field_fallback_scene"/>
      <InputMapObject keyPlaceholder="OBS name" valuePlaceholder="Scene" addLabel="Add word" value={{...data.scenesMap}} onChange={e => up("scenesMap", e)} label="obs.field_map_scenes" />
    </Inspector.Content>
  </Inspector.Body>
}

export default Inspector_OBS;
