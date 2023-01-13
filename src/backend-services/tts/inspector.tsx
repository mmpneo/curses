import { invoke } from "@tauri-apps/api/tauri";
import { FC, useEffect, useState } from "react";
import { RiChatVoiceFill, RiListCheck } from "react-icons/ri";
import { useSnapshot } from "valtio";
import Input from "../../components/input";
import Inspector, { useInspectorTabs } from "../../components/inspector";
import ServiceButton from "../../components/service-button";
import { ServiceNetworkState } from "../../types";
import { useBackendUpdate } from "../../utils";
import { TTS_Backends, TTS_State } from "./schema";
import { azureVoices } from "./service_data";

type WindowsToken = {
  id: string;
  label: string;
}
type WindowsConfig = { devices: WindowsToken[], voices: WindowsToken[] };
const Windows: FC = () => {
  const pr = useSnapshot(window.API.state.services.tts.data.windows);
  const handleUpdate = <K extends keyof TTS_State["windows"]>(key: K, v: TTS_State["windows"][K]) => window.API.patchService("tts", s => s.data.windows[key] = v);

  const [config, setConfig] = useState<WindowsConfig>();

  useEffect(() => {
    invoke<WindowsConfig>("plugin:windows_tts|get_voices").then(setConfig);
  }, []);

  return <>
    <Inspector.SubHeader>WindowsTTS options</Inspector.SubHeader>
    <Input.Select
      value={{ value: pr.device, label: pr.device }}
      onChange={(e: any) => handleUpdate("device", e.value)}
      getOptionLabel={({ value }: any) => config?.devices.find(d => d.id === value)?.label || value}
      options={config?.devices.map(d => ({ ...d, value: d.id }))}
      placeholder="Device"
      label="Audio output" />

    <Input.Select
      value={{ value: pr.voice, label: pr.voice }}
      onChange={(e: any) => handleUpdate("voice", e.value)}
      getOptionLabel={({ value }: any) => config?.voices.find(d => d.id === value)?.label || value}
      options={config?.voices.map(d => ({ ...d, value: d.id }))}
      placeholder="Select voice"
      label="Voice" />
  </>
}

const Azure: FC = () => {
  const pr = useSnapshot(window.API.state.services.tts.data.azure);
  const handleUpdate = <K extends keyof TTS_State["azure"]>(key: K, v: TTS_State["azure"][K]) => window.API.state.services.tts.data.azure[key] = v;

  const state = useSnapshot(window.API.tts.serviceState);

  const updateVoice = (value: { group: string, option: string }) => {
    window.API.state.services.tts.data.azure.language = value.group;
    window.API.state.services.tts.data.azure.voice = value.option;
    // clear voice and role in state
    window.API.state.services.tts.data.azure.voiceStyle = "";
    window.API.state.services.tts.data.azure.voiceRole = "";
  };
  const [outputDevices, setOutputDevices] = useState<MediaDeviceInfo[]>([]);

  const [voiceStyles, setVoiceStyles] = useState<{ label: string, value: string }[]>([]);
  const [voiceRoles, setVoiceRoles] = useState<{ label: string, value: string }[]>([]);

  const updateDevices = async () => {
    const devices = await navigator.mediaDevices.enumerateDevices();
    setOutputDevices(devices.filter(device => device.kind === "audiooutput"));
  }
  useEffect(() => {
    updateDevices();
  }, []);

  useEffect(() => {
    // find voice
    // set styles and roles
    if (!pr.language || !pr.voice)
      return;

    const voice = azureVoices[pr.language].find(voice => voice[0] === pr.voice)
    const voiceParams = voice?.[2];
    setVoiceStyles(voiceParams?.styles ? voiceParams.styles.map(style => ({ label: style, value: style })) : []);
    setVoiceRoles(voiceParams?.roles ? voiceParams.roles.map(roles => ({ label: roles, value: roles })) : []);

  }, [pr.language, pr.voice]);

  return <>
    <Inspector.SubHeader>Azure options</Inspector.SubHeader>
    <Inspector.Deactivatable active={state.status === ServiceNetworkState.disconnected}>
      <Input.Select options={outputDevices.map(d => ({ label: d.label, value: d.deviceId }))} label="Audio Output" onChange={(e: any) => handleUpdate("device", e.value as TTS_Backends)} />
      <Input.Text type="password" label="Key" value={pr.key} onChange={e => handleUpdate("key", e.target.value)} />
      <Input.Text type="password" label="Location" value={pr.location} onChange={e => handleUpdate("location", e.target.value)} />
    </Inspector.Deactivatable>

    <Input.MappedGroupSelect
      labelGroup="Language"
      labelOption="Voice"
      value={{ group: pr.language, option: pr.voice }}
      onChange={updateVoice}
      library={azureVoices} />

    {voiceStyles.length > 0 && <Input.Select value={{ value: pr.voiceStyle, label: pr.voiceStyle }} options={voiceStyles} label="Voice Style" onChange={(e: any) => handleUpdate("voiceStyle", e.value)} />}
    {voiceRoles.length > 0 && <Input.Select value={{ value: pr.voiceRole, label: pr.voiceRole }} options={voiceRoles} label="Voice Role" onChange={(e: any) => handleUpdate("voiceRole", e.value)} />}
    <Input.Select options={[
      {label: "silent", value: "silent"},
      {label: "x-soft", value: "x-soft"},
      {label: "soft", value: "soft"},
      {label: "medium", value: "medium"},
      {label: "loud", value: "loud"},
      {label: "x-loud", value: "x-loud"},
      {label: "default", value: "default"}
    ]} label="Voice volume" value={{label: pr.voiceVolume, value: pr.voiceVolume}} onChange={(e: any) => handleUpdate("voiceVolume", e.value)} />
    <Input.Select options={[
      {label: "x-slow", value: "x-slow"},
      {label: "slow", value: "slow"},
      {label: "medium", value: "medium"},
      {label: "fast", value: "fast"},
      {label: "x-fast", value: "x-fast"},
      {label: "default", value: "default"},
    ]} label="Voice rate" value={{label: pr.voiceRate, value: pr.voiceRate}} onChange={(e: any) => handleUpdate("voiceRate", e.value)} />
    <Input.Select options={[
      {label: "x-low", value: "x-low"},
      {label: "low", value: "low"},
      {label: "medium", value: "medium"},
      {label: "high", value: "high"},
      {label: "x-high", value: "x-high"},
      {label: "default", value: "default"},
    ]} label="Voice pitch" value={{label: pr.voicePitch, value: pr.voicePitch}} onChange={(e: any) => handleUpdate("voicePitch", e.value)} />
    <Input.Select options={[
      {label: "x-low", value: "x-low"},
      {label: "low", value: "low"},
      {label: "medium", value: "medium"},
      {label: "high", value: "high"},
      {label: "x-high", value: "x-high"},
      {label: "default", value: "default"},
    ]} label="Voice range" value={{label: pr.voiceRange, value: pr.voiceRange}} onChange={(e: any) => handleUpdate("voiceRange", e.value)} />
  </>
}

const serviceOptions = [
  { label: "Windows", value: TTS_Backends.windows },
  { label: "Azure", value: TTS_Backends.azure },
]

const TTSInspector: FC = () => {
  const data = useSnapshot(window.API.state.services.tts);
  const up = useBackendUpdate("tts");
  const state = useSnapshot(window.API.tts.serviceState);
  return <>
    <Inspector.SubHeader>Options</Inspector.SubHeader>
    <Inspector.Deactivatable active={state.status === ServiceNetworkState.disconnected}>
      <Input.TextSource label="Source" value={data.data.source} onChange={e => up("source", e)} />
      <Input.Checkbox label="Input field" value={data.data.inputField} onChange={e => up("inputField", e)} />
      <Input.Select value={serviceOptions.find(o => o.value === data.data.backend)} options={serviceOptions} label="Service" onChange={(e: any) => up("backend", e.value as TTS_Backends)} />
    </Inspector.Deactivatable>

    {data.data.backend === TTS_Backends.windows && <Windows />}
    {data.data.backend === TTS_Backends.azure && <Azure />}

    <ServiceButton status={state.status} onStart={() => window.API.tts.start()} onStop={() => window.API.tts.stop()} />
  </>
}
const GlobalInspector: FC = () => {
  const data = useSnapshot(window.API.state.services.tts);
  const up = useBackendUpdate("tts");
  return <>
    <Inspector.SubHeader>Replace words</Inspector.SubHeader>
    <Input.Object keyPlaceholder="Word" valuePlaceholder="Replacement" addLabel="Add word" value={data.data.replaceWords} onChange={e => up("replaceWords", e)} label="" />
  </>
}

const Inspector_TTS: FC = () => {
  const data = useSnapshot(window.API.state.services.tts);
  const up = <K extends keyof TTS_State>(key: K, v: TTS_State[K]) => window.API.patchService("tts", s => s.data[key] = v);
  const handleStart = (v: boolean) => window.API.state.services.tts.showActionButton = v;
  const [[tab, direction], handleTab] = useInspectorTabs();
  


  return <Inspector.Body>
    <Inspector.Header><RiChatVoiceFill /> Text to Speech</Inspector.Header>
    <Inspector.Content>
      <Input.Checkbox label="Add to action bar" value={data.showActionButton} onChange={handleStart} />
      <Input.Checkbox label="Auto start" value={data.data.autoStart} onChange={e => up("autoStart", e)} />
      <Inspector.Tabs>
        <Inspector.Tab tooltip="Configuration" tooltipBody="Service and text sources" onClick={() => handleTab(0)} active={tab === 0}><RiChatVoiceFill /></Inspector.Tab>
        <Inspector.Tab tooltip="Word replacements" onClick={() => handleTab(1)} active={tab === 1}><RiListCheck /></Inspector.Tab>
      </Inspector.Tabs>
      <Inspector.TabsContent direction={direction} tabKey={tab}>
        {tab === 0 && <TTSInspector />}
        {tab === 1 && <GlobalInspector />}

      </Inspector.TabsContent>
    </Inspector.Content>
  </Inspector.Body>

}

export default Inspector_TTS;
