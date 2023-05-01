import { TTS_Backends, TTS_State } from "@/server/services/tts/schema";
import { ServiceNetworkState } from "@/types";
import NiceModal from "@ebay/nice-modal-react";
import { invoke } from "@tauri-apps/api/tauri";
import { FC, useEffect, useState } from "react";
import { RiCharacterRecognitionFill, RiChatVoiceFill } from "react-icons/ri";
import { useSnapshot } from "valtio";
import { azureVoices, tiktokVoices } from "../../services/tts/tts_data";
import Modal from "../Modal";
import ServiceButton from "../service-button";
import Inspector from "./components";
import { InputCheckbox, InputMapObject, InputMappedGroupSelect, InputNativeAudioOutput, InputRange, InputSelect, InputText, InputTextSource } from "./components/input";

type WindowsToken = {
  id: string;
  label: string;
}
type WindowsConfig = { devices: WindowsToken[], voices: WindowsToken[] };
const Windows: FC = () => {
  const data = useSnapshot(window.ApiServer.state.services.tts.data.windows);
  const handleUpdate = <K extends keyof TTS_State["windows"]>(key: K, v: TTS_State["windows"][K]) => window.ApiServer.patchService("tts", s => s.data.windows[key] = v);

  const [config, setConfig] = useState<WindowsConfig>();

  useEffect(() => {
    invoke<WindowsConfig>("plugin:windows_tts|get_voices").then(setConfig);
  }, []);

  return <>
    <Inspector.SubHeader>WindowsTTS options</Inspector.SubHeader>
    <InputSelect
      value={data.device}
      onValueChange={e => handleUpdate("device", e)}
      options={config?.devices.map(d => ({label: d.label, value: d.id })) || []}
      label="Audio output" />
    {/* <InputNativeAudioOutput label="Audio Output" value={pr.device} onChange={e => handleUpdate("device", e)} /> */}
    <InputSelect
      value={data.voice}
      onValueChange={e => handleUpdate("voice", e)}
      options={config?.voices.map(d => ({ ...d, value: d.id })) || []}
      label="Voice" />
    <InputRange value={data.volume} onChange={e => handleUpdate("volume", e.target.value)} label={`Volume (${data.volume})`} step="0.05" min="0" max="1" />
    <InputRange value={data.rate} onChange={e => handleUpdate("rate", e.target.value)} label={`Rate (${data.rate})`} step="0.05" min="0.1" max="5" />
  </>
}

const TikTok: FC = () => {
  const data = useSnapshot(window.ApiServer.state.services.tts.data.tiktok);
  const handleUpdate = <K extends keyof TTS_State["tiktok"]>(key: K, v: TTS_State["tiktok"][K]) => window.ApiServer.patchService("tts", s => s.data.tiktok[key] = v);
  return <>
    <Inspector.SubHeader>TikTok options</Inspector.SubHeader>
    <InputNativeAudioOutput label="Audio Output" value={data.device} onChange={e => handleUpdate("device", e)} />
    <InputSelect
      value={data.voice}
      onValueChange={e => handleUpdate("voice", e)}
      options={tiktokVoices}
      label="Voice" />
    <InputRange value={data.volume} onChange={e => handleUpdate("volume", e.target.value)} label={`Volume (${data.volume})`} step="0.05" min="0" max="1" />
    {/* <InputRange value={data.rate} onChange={e => handleUpdate("rate", e.target.value)} label={`Rate (${data.rate})`} step="0.05" min="0.1" max="5" /> */}
  </>
}

const Native: FC = () => {
  const data = useSnapshot(window.ApiServer.state.services.tts.data.native);
  const handleUpdate = <K extends keyof TTS_State["native"]>(key: K, v: TTS_State["native"][K]) => window.ApiServer.patchService("tts", s => s.data.native[key] = v);
  const state = useSnapshot(window.ApiServer.tts.serviceState);
  const [voices, setVoices] = useState<{ label: string, value: string }[]>([]);

  useEffect(() => {
    let voices = window.speechSynthesis.getVoices();

    if (voices.length) {
      setVoices(voices.map(v => ({ label: v.name, value: v.voiceURI })));
    }
    else {
      window.speechSynthesis.onvoiceschanged = () => {
        let options = window.speechSynthesis.getVoices().map(v => ({ label: v.name, value: v.voiceURI }))
        setVoices(options);
      }
    }

  }, []);

  return <>
    <Inspector.SubHeader>Native options</Inspector.SubHeader>
    <Inspector.Deactivatable active={state.status === ServiceNetworkState.disconnected}>
      <InputSelect
        value={data.voice}
        onValueChange={e => handleUpdate("voice", e)}
        options={voices}
        label="Voice" />
    </Inspector.Deactivatable>

    <InputRange value={data.pitch} onChange={e => handleUpdate("pitch", e.target.value)} label={`Pitch (${data.pitch})`} step="0.1" min="0" max="2" />
    <InputRange value={data.rate} onChange={e => handleUpdate("rate", e.target.value)} label={`Rate (${data.rate})`} step="0.1" min="0.1" max="10" />
    <InputRange value={data.volume} onChange={e => handleUpdate("volume", e.target.value)} label={`Volume (${data.volume})`} step="0.05" min="0" max="1" />
  </>
}

const Azure: FC = () => {
  const data = useSnapshot(window.ApiServer.state.services.tts.data.azure);
  const handleUpdate = <K extends keyof TTS_State["azure"]>(key: K, v: TTS_State["azure"][K]) => window.ApiServer.state.services.tts.data.azure[key] = v;
  const state = useSnapshot(window.ApiServer.tts.serviceState);
  const [voiceStyles, setVoiceStyles] = useState<{ label: string, value: string }[]>([]);
  const [voiceRoles, setVoiceRoles] = useState<{ label: string, value: string }[]>([]);

  const updateVoice = (value: { group: string, option: string }) => {
    window.ApiServer.state.services.tts.data.azure.language   = value.group;
    window.ApiServer.state.services.tts.data.azure.voice      = value.option;
    // clear voice and role in state
    window.ApiServer.state.services.tts.data.azure.voiceStyle = "";
    window.ApiServer.state.services.tts.data.azure.voiceRole  = "";
  };

  useEffect(() => {
    // find voice
    // set styles and roles
    if (!data.language || !data.voice)
      return;

    const voice = azureVoices[data.language].find(voice => voice[0] === data.voice)
    const voiceParams = voice?.[2];
    setVoiceStyles(voiceParams?.styles ? [{ label: "None", value: "" }, ...voiceParams.styles.map(style => ({ label: style, value: style }))] : []);
    setVoiceRoles(voiceParams?.roles ? [{ label: "None", value: "" }, ...voiceParams.roles.map(roles => ({ label: roles, value: roles }))] : []);

  }, [data.language, data.voice]);

  return <>
    <Inspector.SubHeader>Azure options</Inspector.SubHeader>
    <Inspector.Deactivatable active={state.status === ServiceNetworkState.disconnected}>
      <InputNativeAudioOutput label="Audio Output" value={data.device} onChange={e => handleUpdate("device", e)} />
      <InputText type="password" label="Key" value={data.key} onChange={e => handleUpdate("key", e.target.value)} />
      <InputText type="password" label="Location" value={data.location} onChange={e => handleUpdate("location", e.target.value)} />
    </Inspector.Deactivatable>

    <InputMappedGroupSelect
      labelGroup="Language"
      labelOption="Voice"
      value={{ group: data.language, option: data.voice }}
      onChange={updateVoice}
      library={azureVoices} />

    {voiceStyles.length > 0 && <InputSelect value={data.voiceStyle} options={voiceStyles} label="Voice Style" onValueChange={e => handleUpdate("voiceStyle", e)} />}
    {voiceRoles.length > 0 && <InputSelect value={data.voiceRole} options={voiceRoles} label="Voice Role" onValueChange={e => handleUpdate("voiceRole", e)} />}
    <InputSelect options={[
      { label: "silent", value: "silent" },
      { label: "x-soft", value: "x-soft" },
      { label: "soft", value: "soft" },
      { label: "medium", value: "medium" },
      { label: "loud", value: "loud" },
      { label: "x-loud", value: "x-loud" },
      { label: "default", value: "default" }
    ]} label="Voice volume" value={data.voiceVolume} onValueChange={e => handleUpdate("voiceVolume", e)} />
    <InputSelect options={[
      { label: "x-slow", value: "x-slow" },
      { label: "slow", value: "slow" },
      { label: "medium", value: "medium" },
      { label: "fast", value: "fast" },
      { label: "x-fast", value: "x-fast" },
      { label: "default", value: "default" },
    ]} label="Voice rate" value={data.voiceRate} onValueChange={e => handleUpdate("voiceRate", e)} />
    <InputSelect options={[
      { label: "x-low", value: "x-low" },
      { label: "low", value: "low" },
      { label: "medium", value: "medium" },
      { label: "high", value: "high" },
      { label: "x-high", value: "x-high" },
      { label: "default", value: "default" },
    ]} label="Voice pitch" value={data.voicePitch} onValueChange={e => handleUpdate("voicePitch", e)} />
    <InputSelect options={[
      { label: "x-low", value: "x-low" },
      { label: "low", value: "low" },
      { label: "medium", value: "medium" },
      { label: "high", value: "high" },
      { label: "x-high", value: "x-high" },
      { label: "default", value: "default" },
    ]} label="Voice range" value={data.voiceRange} onValueChange={e => handleUpdate("voiceRange", e)} />
    <InputRange value={data.volume} onChange={e => handleUpdate("volume", e.target.value)} label={`Volume (${data.volume})`} step="0.05" min="0" max="1" />
    {/* <InputRange value={data.rate} onChange={e => handleUpdate("rate", e.target.value)} label={`Rate (${data.rate})`} step="0.05" min="0.1" max="5" /> */}
  </>
}

const VoiceVox: FC = () => {
  const handleQuery = async () => {
    let resp = await fetch("http://127.0.0.1:50021/audio_query?text=text&speaker=1", {
      method: "POST",
      body: JSON.stringify({
        query: {
          text: "text",
          speaker: 1,
        }
      })
    });
    const jsn = await resp.json();
  };

  const handleQueryVoices = async () => {
    let resp = await fetch("http://127.0.0.1:50021/speakers");
    const jsn = await resp.json();
  };

  const handleSynth = async () => {
    let resp = await fetch("http://127.0.0.1:50021/synthesis?speaker=0", {
      headers: {
        // 'Accept': 'audio/wav',
        'Content-type': 'application/json'
      },
      method: "POST",
      body: JSON.stringify({
        accent_phrases: [
          {
            accent: 1,
            is_interrogative: false,
            moras: [{
              consonant: "t",
              consonant_length: 0.0727369412779808,
              pitch: 5.911419868469238,
              text: "テ",
              vowel: "e",
              vowel_length: 0.1318332552909851,
            }],
            pause_mora: null
          }],
        speedScale: 1,
        pitchScale: 1,
        intonationScale: 1,
        volumeScale: 1,
        prePhonemeLength: 1,
        postPhonemeLength: 1,
        outputSamplingRate: 1,
        outputStereo: true,
      })
    });
    const jsn = await resp.arrayBuffer();
  };

  return <>
    voicevox
    <button onClick={handleQuery}>Query</button>
    <button onClick={handleSynth}>Synth</button>
    <button onClick={handleQueryVoices}>Voices</button>
  </>
}

const serviceOptions = [
  { label: "Native", value: TTS_Backends.native },
  { label: "Windows", value: TTS_Backends.windows },
  { label: "Azure", value: TTS_Backends.azure },
  { label: "TikTok", value: TTS_Backends.tiktok },
  // { label: "VoiceVox", value: TTS_Backends.voicevox },
]

const WordsReplacementModal: FC = () => {
  const data = useSnapshot(window.ApiServer.state.services.tts);
  const up = <K extends keyof TTS_State>(key: K, v: TTS_State[K]) => window.ApiServer.patchService("tts", s => s.data[key] = v);

  return <Modal.Body width={420}>
    <Modal.Header>TTS Word replacements</Modal.Header>
    <Modal.Content>
      <div className="p-4">
        <InputCheckbox label="Ignore letter case" value={data.data.replaceWordsIgnoreCase} onChange={v => up("replaceWordsIgnoreCase", v)}/>
        <InputMapObject keyPlaceholder="Word" valuePlaceholder="Replacement" addLabel="Add word" value={{...data.data.replaceWords}} onChange={e => up("replaceWords", e)} label="" />
      </div>
    </Modal.Content>
  </Modal.Body>
}
NiceModal.register('tts-replacements', (props) => <Modal.Base {...props}><WordsReplacementModal /></Modal.Base>);

const Inspector_TTS: FC = () => {
  const data = useSnapshot(window.ApiServer.state.services.tts);
  const up = <K extends keyof TTS_State>(key: K, v: TTS_State[K]) => window.ApiServer.patchService("tts", s => s.data[key] = v);
  const handleStart = (v: boolean) => window.ApiServer.state.services.tts.showActionButton = v;
  const state = useSnapshot(window.ApiServer.tts.serviceState);
  const handleShowReplacements = () => {
    NiceModal.show('tts-replacements');
  }

  return <Inspector.Body>
    <Inspector.Header><RiChatVoiceFill /> Text to Speech</Inspector.Header>
    <Inspector.Content>
      <InputCheckbox label="Add to action bar" value={data.showActionButton} onChange={handleStart} />
      <InputCheckbox label="Auto start" value={data.data.autoStart} onChange={e => up("autoStart", e)} />
      <span className="link link-accent link-hover font-semibold flex items-center gap-2 text-sm" onClick={handleShowReplacements}><RiCharacterRecognitionFill/> Edit word replacements</span>
      <Inspector.Deactivatable active={state.status === ServiceNetworkState.disconnected}>
        <InputTextSource label="Source" value={data.data.source} onChange={e => up("source", e)} />
        <InputCheckbox label="Text field" value={data.data.inputField} onChange={e => up("inputField", e)} />
        <InputSelect value={data.data.backend} options={serviceOptions} label="Service" onValueChange={e => up("backend", e as TTS_Backends)} />
      </Inspector.Deactivatable>
      {data.data.backend === TTS_Backends.windows && <Windows />}
      {data.data.backend === TTS_Backends.azure && <Azure />}
      {data.data.backend === TTS_Backends.native && <Native />}
      {data.data.backend === TTS_Backends.tiktok && <TikTok />}
      {/* {data.data.backend === TTS_Backends.voicevox && <VoiceVox />} */}
      <ServiceButton status={state.status} onStart={() => window.ApiServer.tts.start()} onStop={() => window.ApiServer.tts.stop()} />
    </Inspector.Content>
  </Inspector.Body>
}

export default Inspector_TTS;
