import { invoke } from "@tauri-apps/api/tauri";
import { FC, useEffect, useState } from "react";
import { RiChatVoiceFill } from "react-icons/ri";
import { useSnapshot } from "valtio";
import Input from "../../components/input";
import Inspector from "../../components/inspector";
import { TextEventSource } from "../../types";
import ServiceButton from "../components/service-button";
import { TTS_Backends, TTS_State } from "./schema";
import { azureVoices } from "./service_data";
import ServiceVoiceSelect from "./voice-select";

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
  // const [outputDevices, setOutputDevices] = useState<MediaDeviceInfo[]>([]);

  // const updateDevices = async () => {
  //   const devices = await navigator.mediaDevices.enumerateDevices();
  //   setOutputDevices(devices.filter(device => device.kind === "audiooutput"));
  // }
  // useEffect(() => {
  //   updateDevices();
  // }, []);

  return <>
    <Inspector.SubHeader>Azure options</Inspector.SubHeader>

    {/* <Input.Select options={outputDevices.map(d => ({label: d.label, value: d.deviceId}))} label="Audio Output" onChange={(e: any) => handleUpdate("device", e.value as TTS_Backends)} /> */}
    <ServiceVoiceSelect onChangeLang={e => handleUpdate("language", e)} onChangeVoice={e => handleUpdate("voice", e)} value={pr} library={azureVoices} />
    <Input.Text type="password" label="Key" value={pr.key} onChange={e => handleUpdate("key", e.target.value)} />
    <Input.Text type="password" label="Location" value={pr.location} onChange={e => handleUpdate("location", e.target.value)} />
  </>
}

const serviceOptions = [
  { label: "Windows", value: TTS_Backends.windows },
  { label: "Azure", value: TTS_Backends.azure },
]

const Inspector_TTS: FC = () => {
  const data = useSnapshot(window.API.state.services.tts);
  const state = useSnapshot(window.API.tts.serviceState);

  const up = <K extends keyof TTS_State>(key: K, v: TTS_State[K]) => window.API.patchService("tts", s => s.data[key] = v);

  const handleStart = (v: boolean) => window.API.state.services.tts.autoStart = v;

  return <Inspector.Body>
    <Inspector.Header><RiChatVoiceFill /> Text to Speech</Inspector.Header>
    <Inspector.Content>
      <Input.Checkbox label="Start with play button" value={data.autoStart} onChange={handleStart} />

      <Input.TextSource label="Source" value={data.data.source} onChange={e => up("source", e)} />
      <Input.Select value={serviceOptions.find(o => o.value === data.data.backend)} options={serviceOptions} label="Service" onChange={(e: any) => up("backend", e.value as TTS_Backends)} />
      <Input.Checkbox label="Input field" value={data.data.inputField} onChange={e => up("inputField", e)} />

      {data.data.backend === TTS_Backends.windows && <Windows />}
      {data.data.backend === TTS_Backends.azure && <Azure />}

      <ServiceButton status={state.status} onStart={() => window.API.tts.start()} onStop={() => window.API.tts.stop()} />

    </Inspector.Content>
  </Inspector.Body>

}

export default Inspector_TTS;
