import { TTS_Backends, TTS_State } from "@/server/services/tts/schema";
import { ServiceNetworkState } from "@/types";
import NiceModal from "@ebay/nice-modal-react";
import { invoke } from "@tauri-apps/api/tauri";
import { FC, useEffect, useState } from "react";
import { RiCharacterRecognitionFill, RiChatVoiceFill } from "react-icons/ri";
import { proxy, useSnapshot } from "valtio";
import { azureVoices, tiktokVoices } from "../../services/tts/tts_data";
import Modal from "../Modal";
import ServiceButton from "../service-button";
import Inspector from "./components";
import { InputCheckbox, InputMapObject, InputMappedGroupSelect, InputNativeAudioOutput, InputRange, InputSelect, InputSelectOption, InputText, InputTextSource, InputFilePath } from "./components/input";
import classNames from "classnames";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

type WindowsToken = {
  id: string;
  label: string;
}
type WindowsConfig = { devices: WindowsToken[], voices: WindowsToken[] };
const Windows: FC = () => {
  const {t} = useTranslation();
  const data = useSnapshot(window.ApiServer.state.services.tts.data.windows);
  const handleUpdate = <K extends keyof TTS_State["windows"]>(key: K, v: TTS_State["windows"][K]) => window.ApiServer.patchService("tts", s => s.data.windows[key] = v);

  const [config, setConfig] = useState<WindowsConfig>();

  useEffect(() => {
    invoke<WindowsConfig>("plugin:windows_tts|get_voices").then(setConfig);
  }, []);

  return <>
    <Inspector.SubHeader>{t('tts.windows_title')}</Inspector.SubHeader>
    <InputSelect
      value={data.device}
      onValueChange={e => handleUpdate("device", e)}
      options={config?.devices.map(d => ({label: d.label, value: d.id })) || []}
      label="common.field_output_device" />
    {/* <InputNativeAudioOutput label="Audio Output" value={pr.device} onChange={e => handleUpdate("device", e)} /> */}
    <InputSelect
      value={data.voice}
      onValueChange={e => handleUpdate("voice", e)}
      options={config?.voices.map(d => ({ ...d, value: d.id })) || []}
      label="tts.field_voice" />
    <InputRange value={data.volume} onChange={e => handleUpdate("volume", e.target.value)} label="common.field_volume" step="0.05" min="0" max="1" />
    <InputRange value={data.rate} onChange={e => handleUpdate("rate", e.target.value)} label="common.field_rate" step="0.05" min="0.1" max="5" />
  </>
}

const TikTok: FC = () => {
  const {t} = useTranslation();
  const data = useSnapshot(window.ApiServer.state.services.tts.data.tiktok);
  const handleUpdate = <K extends keyof TTS_State["tiktok"]>(key: K, v: TTS_State["tiktok"][K]) => window.ApiServer.patchService("tts", s => s.data.tiktok[key] = v);
  return <>
    <Inspector.SubHeader>{t("tts.tiktok_title")}</Inspector.SubHeader>
    <InputNativeAudioOutput label="common.field_output_device" value={data.device} onChange={e => handleUpdate("device", e)} />
    <InputSelect
      value={data.voice}
      onValueChange={e => handleUpdate("voice", e)}
      options={tiktokVoices}
      label="tts.field_voice" />
    <InputRange value={data.volume} onChange={e => handleUpdate("volume", e.target.value)} label="common.field_volume" step="0.05" min="0" max="1" />
    {/* <InputRange value={data.rate} onChange={e => handleUpdate("rate", e.target.value)} label={`Rate (${data.rate})`} step="0.05" min="0.1" max="5" /> */}
  </>
}

const Native: FC = () => {
  const {t} = useTranslation();
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
    <Inspector.SubHeader>{t('tts.native_title')}</Inspector.SubHeader>
    <Inspector.Deactivatable active={state.status === ServiceNetworkState.disconnected}>
      <InputSelect
        value={data.voice}
        onValueChange={e => handleUpdate("voice", e)}
        options={voices}
        label="tts.field_voice" />
    </Inspector.Deactivatable>

    <InputRange value={data.pitch} onChange={e => handleUpdate("pitch", e.target.value)} label="common.field_pitch" step="0.1" min="0" max="2" />
    <InputRange value={data.rate} onChange={e => handleUpdate("rate", e.target.value)} label="common.field_rate" step="0.1" min="0.1" max="10" />
    <InputRange value={data.volume} onChange={e => handleUpdate("volume", e.target.value)} label="common.field_volume" step="0.05" min="0" max="1" />
  </>
}

const Azure: FC = () => {
  const {t} = useTranslation();
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
    <Inspector.SubHeader>{t('tts.azure_title')}</Inspector.SubHeader>
    <Inspector.Deactivatable active={state.status === ServiceNetworkState.disconnected}>
      <InputNativeAudioOutput label="common.field_output_device" value={data.device} onChange={e => handleUpdate("device", e)} />
      <InputText type="password" label="tts.azure_key" value={data.key} onChange={e => handleUpdate("key", e.target.value)} />
      <InputText type="password" label="tts.azure_location" value={data.location} onChange={e => handleUpdate("location", e.target.value)} />
    </Inspector.Deactivatable>

    <InputMappedGroupSelect
      labelGroup="common.field_language"
      labelOption="common.field_dialect"
      value={{ group: data.language, option: data.voice }}
      onChange={updateVoice}
      library={azureVoices} />

    {voiceStyles.length > 0 && <InputSelect value={data.voiceStyle} options={voiceStyles} label="tts.azure_voice_style" onValueChange={e => handleUpdate("voiceStyle", e)} />}
    {voiceRoles.length > 0 && <InputSelect value={data.voiceRole} options={voiceRoles} label="tts.azure_voice_role" onValueChange={e => handleUpdate("voiceRole", e)} />}
    <InputSelect options={[
      { label: "silent", value: "silent" },
      { label: "x-soft", value: "x-soft" },
      { label: "soft", value: "soft" },
      { label: "medium", value: "medium" },
      { label: "loud", value: "loud" },
      { label: "x-loud", value: "x-loud" },
      { label: "default", value: "default" }
    ]} label="tts.azure_voice_volume" value={data.voiceVolume} onValueChange={e => handleUpdate("voiceVolume", e)} />
    <InputSelect options={[
      { label: "x-slow", value: "x-slow" },
      { label: "slow", value: "slow" },
      { label: "medium", value: "medium" },
      { label: "fast", value: "fast" },
      { label: "x-fast", value: "x-fast" },
      { label: "default", value: "default" },
    ]} label="tts.azure_voice_rate" value={data.voiceRate} onValueChange={e => handleUpdate("voiceRate", e)} />
    <InputSelect options={[
      { label: "x-low", value: "x-low" },
      { label: "low", value: "low" },
      { label: "medium", value: "medium" },
      { label: "high", value: "high" },
      { label: "x-high", value: "x-high" },
      { label: "default", value: "default" },
    ]} label="tts.azure_voice_pitch" value={data.voicePitch} onValueChange={e => handleUpdate("voicePitch", e)} />
    <InputSelect options={[
      { label: "x-low", value: "x-low" },
      { label: "low", value: "low" },
      { label: "medium", value: "medium" },
      { label: "high", value: "high" },
      { label: "x-high", value: "x-high" },
      { label: "default", value: "default" },
    ]} label="tts.azure_voice_range" value={data.voiceRange} onValueChange={e => handleUpdate("voiceRange", e)} />
    <InputRange value={data.volume} onChange={e => handleUpdate("volume", e.target.value)} label="common.field_volume" step="0.05" min="0" max="1" />
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

const uberduckVoices = proxy<{value: InputSelectOption[]}>({
  value: []
});

const UberDuck: FC = () => {
  const {t} = useTranslation();
  const data = useSnapshot(window.ApiServer.state.services.tts.data.uberduck);
  const state = useSnapshot(window.ApiServer.tts.serviceState);
  const handleUpdate = <K extends keyof TTS_State["uberduck"]>(key: K, v: TTS_State["uberduck"][K]) => window.ApiServer.patchService("tts", s => s.data.uberduck[key] = v);
  const {value: voices} = useSnapshot(uberduckVoices);
  const [loadingVoices, setLoadingVoices] = useState(false);

  const loadVoices = () => {
    if (!data.api_key || !data.secret_key)
      return;
    setLoadingVoices(true);
    invoke("plugin:uberduck_tts|get_voices", {auth: {
      api_key: data.api_key,
      secret_key: data.secret_key,
    }}).then(res => {
      if (Array.isArray(res))
        uberduckVoices.value = res.map(v => ({value: v.voicemodel_uuid, label: v.display_name}));
    }).finally(() => setLoadingVoices(false));
  }

  useEffect(() => {
    if (!voices.length)
      loadVoices();
  }, []);
  return <>
    <Inspector.SubHeader>{t('tts.uberduck_title')}</Inspector.SubHeader>
    <Inspector.Deactivatable active={state.status === ServiceNetworkState.disconnected}>
      <InputNativeAudioOutput label="common.field_output_device" value={data.device} onChange={e => handleUpdate("device", e)} />
      <InputText label="tts.uberduck_api_key" value={data.api_key} onChange={e => handleUpdate("api_key", e.target.value)} />
      <InputText label="tts.uberduck_secret" type="password" value={data.secret_key} onChange={e => handleUpdate("secret_key", e.target.value)} />
      <Inspector.Description>
        <span className="text-base-content/60 text-xs mt-2">
          {t('tts.uberduck_voice_desc')}<br/>
          <a className="link link-primary link-hover" target="_blank" href="https://app.uberduck.ai/speak#mode=tts-reference&voice=zwf">{t('tts.uberduck_voice_desc_link')}</a>
        </span>
      </Inspector.Description>
      <InputSelect
        value={data.voice}
        onValueChange={e => handleUpdate("voice", e)}
        options={voices as InputSelectOption[]}
        label="tts.field_voice" />
      <button onClick={loadVoices} className={classNames("btn btn-xs disabled", {loading: loadingVoices, "btn-disabled": !data.api_key || !data.secret_key})}>{loadingVoices ? t('tts.uberduck_voice_status_updating') : t('tts.uberduck_voice_status_reload')}</button>
      <InputRange label="common.field_volume" value={data.volume} onChange={e => handleUpdate("volume", e.target.value)} step="0.05" min="0" max="1" />
    </Inspector.Deactivatable>
  </>
}

const piperVoices = proxy<{ value: InputSelectOption[] }>({ value: [] });

const Piper: FC = () => {
  const { t } = useTranslation();
  const data = useSnapshot(window.ApiServer.state.services.tts.data.piper);
  const state = useSnapshot(window.ApiServer.tts.serviceState);
  const handleUpdate = <K extends keyof TTS_State["piper"]>(key: K, v: TTS_State["piper"][K]) => window.ApiServer.patchService("tts", s => s.data.piper[key] = v);
  const { value: voices } = useSnapshot(piperVoices);

  const loadVoices = () => loadVoicesFrom(data.voice_location);
  const loadVoicesFrom = (path: string) => {
    type PiperVoice = { name: string; path: string; }
    invoke<PiperVoice[]>("plugin:piper_tts|get_voices", { path }).then(res => {
      piperVoices.value = res.map(v => ({ value: v.path, label: v.name }));
    }).catch(err => {
      toast.error(err)
      piperVoices.value = [];
    });
  }

  useEffect(loadVoices, []);

  return <>
    <Inspector.SubHeader>{t('tts.piper_title')}</Inspector.SubHeader>
    <Inspector.Deactivatable active={state.status === ServiceNetworkState.disconnected}>
      <InputNativeAudioOutput label="common.field_output_device" value={data.device} onChange={e => handleUpdate("device", e)} />
      <InputSelect value={data.voice} onValueChange={e => handleUpdate("voice", e)} options={voices as InputSelectOption[]} label="tts.field_voice" />
      <InputText type="number" min="0" step="1" label="tts.piper_speaker_id" value={data.speaker_id} onChange={e => handleUpdate("speaker_id", e.target.valueAsNumber)} />
      <InputFilePath
        label="tts.piper_exe_location"
        value={data.exe_location}
        onChange={e => handleUpdate("exe_location", e.target.value)}
        dialogOptions={{ filters: [{ name: "piper.exe", extensions: ["exe"] }] }}
      />
      <InputFilePath
        label="tts.piper_voice_location"
        value={data.voice_location}
        onChange={e => handleUpdate("voice_location", e.target.value)}
        onPathSelected={path => loadVoicesFrom(path)}
        dialogOptions={{ directory: true }}
      />
      <button onClick={loadVoices} className="btn btn-sm">{t("tts.piper_reload_voices")}</button>
    </Inspector.Deactivatable>
  </>
}

const Custom: FC = () => {
  const { t } = useTranslation();
  const data = useSnapshot(window.ApiServer.state.services.tts.data.custom);
  const state = useSnapshot(window.ApiServer.tts.serviceState);
  const handleUpdate = <K extends keyof TTS_State["custom"]>(key: K, v: TTS_State["custom"][K]) => window.ApiServer.patchService("tts", s => s.data.custom[key] = v);
 
  return <>
    <Inspector.SubHeader>{t('tts.custom_title')}</Inspector.SubHeader>
    <Inspector.Deactivatable active={state.status === ServiceNetworkState.disconnected}>
      <InputNativeAudioOutput label="common.field_output_device" value={data.device} onChange={e => handleUpdate("device", e)} />
      <InputFilePath
        label="tts.custom_exe_location"
        value={data.exe_location}
        onChange={e => handleUpdate("exe_location", e.target.value)}
      />
    </Inspector.Deactivatable>
  </>
}

const WordsReplacementModal: FC = () => {
  const {t} = useTranslation();
  const data = useSnapshot(window.ApiServer.state.services.tts);
  const up = <K extends keyof TTS_State>(key: K, v: TTS_State[K]) => window.ApiServer.patchService("tts", s => s.data[key] = v);

  return <Modal.Body width={420}>
    <Modal.Header>{t('word_replacements.title')}</Modal.Header>
    <Modal.Content>
      <div className="p-4">
        <InputCheckbox label="word_replacements.field_ignore_case" value={data.data.replaceWordsIgnoreCase} onChange={v => up("replaceWordsIgnoreCase", v)}/>
        <InputMapObject keyPlaceholder={t('word_replacements.label_dictionary_key')} valuePlaceholder={t('word_replacements.label_dictionary_value')} addLabel="Add word" value={{...data.data.replaceWords}} onChange={e => up("replaceWords", e)} label="" />
      </div>
    </Modal.Content>
  </Modal.Body>
}
NiceModal.register('tts-replacements', (props) => <Modal.Base {...props}><WordsReplacementModal /></Modal.Base>);

const Inspector_TTS: FC = () => {
  const {t} = useTranslation();
  const data = useSnapshot(window.ApiServer.state.services.tts);
  const up = <K extends keyof TTS_State>(key: K, v: TTS_State[K]) => window.ApiServer.patchService("tts", s => s.data[key] = v);
  const handleStart = (v: boolean) => window.ApiServer.state.services.tts.showActionButton = v;
  const state = useSnapshot(window.ApiServer.tts.serviceState);
  const handleShowReplacements = () => {
    NiceModal.show('tts-replacements');
  }

  return <Inspector.Body>
    <Inspector.Header><RiChatVoiceFill /> {t('tts.title')}</Inspector.Header>
    <Inspector.Content>
      <InputCheckbox label="common.field_action_bar" value={data.showActionButton} onChange={handleStart} />
      <InputCheckbox label="common.field_auto_start" value={data.data.autoStart} onChange={e => up("autoStart", e)} />
      <InputCheckbox label="tts.field_stop_with_stream" value={data.data.stopWithStream} onChange={e => up("stopWithStream", e)} />
      <span className="link link-accent link-hover font-semibold flex items-center gap-2 text-sm" onClick={handleShowReplacements}><RiCharacterRecognitionFill/> {t('common.btn_edit_replacements')}</span>
      <Inspector.Deactivatable active={state.status === ServiceNetworkState.disconnected}>
        <InputTextSource label="common.field_text_source" value={data.data.source} onChange={e => up("source", e)} />
        <InputCheckbox label="common.field_use_keyboard_input" value={data.data.inputField} onChange={e => up("inputField", e)} />
        <InputSelect label="common.field_service" value={data.data.backend} options={[
          { label: t('tts.native_title'),     value: TTS_Backends.native    },
          { label: t('tts.windows_title'),    value: TTS_Backends.windows   },
          { label: t('tts.azure_title'),      value: TTS_Backends.azure     },
          { label: t('tts.tiktok_title'),     value: TTS_Backends.tiktok    },
          { label: t('tts.uberduck_title'),   value: TTS_Backends.uberduck  },
          { label: t('tts.piper_title'),      value: TTS_Backends.piper     },
          { label: t('tts.custom_title'),     value: TTS_Backends.custom    },
          // { label: "VoiceVox", value: TTS_Backends.voicevox },
        ]} onValueChange={e => up("backend", e as TTS_Backends)} />
      </Inspector.Deactivatable>
      {data.data.backend === TTS_Backends.windows && <Windows />}
      {data.data.backend === TTS_Backends.azure && <Azure />}
      {data.data.backend === TTS_Backends.native && <Native />}
      {data.data.backend === TTS_Backends.tiktok && <TikTok />}
      {data.data.backend === TTS_Backends.uberduck && <UberDuck />}
      {data.data.backend === TTS_Backends.piper && <Piper />}
      {data.data.backend === TTS_Backends.custom && <Custom />}
      {/* {data.data.backend === TTS_Backends.voicevox && <VoiceVox />} */}
      <ServiceButton status={state.status} onStart={() => window.ApiServer.tts.start()} onStop={() => window.ApiServer.tts.stop()} />
    </Inspector.Content>
  </Inspector.Body>
}

export default Inspector_TTS;
