import { STT_Backends, STT_State } from "@/server/services/stt/schema";
import { ServiceNetworkState } from "@/types";
import { invoke } from "@tauri-apps/api/tauri";
import { FC } from "react";
import { RiUserVoiceFill } from "react-icons/ri";
import { SiGooglechrome, SiMicrosoftedge } from "react-icons/si";
import { useSnapshot } from "valtio";
import { azureLanguages, deepGramLangs, nativeLangs } from "../../services/stt/stt_data";
import ServiceButton from "../service-button";
import Inspector from "./components";
import { InputCheckbox, InputMappedGroupSelect, InputSelect, InputText } from "./components/input";

const Native: FC = () => {
  const pr = useSnapshot(window.ApiServer.state.services.stt.data.native);
  const updateLanguage = (value: { group: string, option: string }) => {
    window.ApiServer.state.services.stt.data.native.language       = value.option;
    window.ApiServer.state.services.stt.data.native.language_group = value.group;
  };
  return <>
    <InputMappedGroupSelect
      labelGroup="Language"
      labelOption="Dialect"
      value={{ option: pr.language, group: pr.language_group }}
      onChange={updateLanguage}
      library={nativeLangs} />
  </>
}

const Browser: FC = () => {
  const handleOpen = () => {
    invoke("plugin:web|open_browser", {
      data: {
        browser: "chrome",
        url: `http://localhost:${window.Config.serverNetwork.port}/mic.html`
      }
    });
  };

  const handleOpenEdge = () => {
    invoke("plugin:web|open_browser", {
      data: {
        browser: "msedge",
        url: `http://localhost:${window.Config.serverNetwork.port}/mic.html`
      }
    });
  };

  const handleStartStt = () => {
    invoke("plugin:windows_stt|start");
  };
  return <>
    <Inspector.SubHeader>Browser options</Inspector.SubHeader>
    <button className="btn btn-sm btn-neutral gap-2" onClick={handleOpen}><SiGooglechrome/> Open Chrome</button>
    <button className="btn btn-sm btn-neutral gap-2" onClick={handleOpenEdge}><SiMicrosoftedge/> Open Edge</button>
  </>
}


const Azure: FC = () => {
  const pr = useSnapshot(window.ApiServer.state.services.stt.data.azure);
  const up = <K extends keyof STT_State["azure"]>(key: K, v: STT_State["azure"][K]) => window.ApiServer.state.services.stt.data.azure[key] = v;

  const updateLanguage = (value: { group: string, option: string }) => {
    window.ApiServer.state.services.stt.data.azure.language       = value.option;
    window.ApiServer.state.services.stt.data.azure.language_group = value.group;
  };

  return <>
    <Inspector.SubHeader>Azure options</Inspector.SubHeader>
    <InputText label="Key" type="password" value={pr.key} onChange={e => up("key", e.target.value)} />
    <InputText label="Location" value={pr.location} onChange={e => up("location", e.target.value)} />

    <InputMappedGroupSelect
      labelGroup="Language"
      labelOption="Dialect"
      value={{ option: pr.language, group: pr.language_group }}
      onChange={updateLanguage}
      library={azureLanguages} />

    <InputSelect 
      label="Profanity"
      options={[
        { label: 'Masked', value: 'masked' },
        { label: 'Removed', value: 'removed' },
        { label: 'Raw', value: 'raw' },
      ]}
      value={pr.profanity}
      onValueChange={e => up("profanity", e)}
    />
    <InputText type="number" step="1" label="Silence timeout" value={pr.silenceTimeout} onChange={e => up("silenceTimeout", e.target.value)} />
    <InputCheckbox label="Interim result" onChange={e => up("interim", e)} value={pr.interim} />
  </>
}

const Deepgram: FC = () => {
  const pr = useSnapshot(window.ApiServer.state.services.stt.data.deepgram);
  const handleUpdate = <K extends keyof STT_State["deepgram"]>(key: K, v: STT_State["deepgram"][K]) => window.ApiServer.state.services.stt.data.deepgram[key] = v;

  const updateLanguage = (value: { group: string, option: string }) => {
    window.ApiServer.state.services.stt.data.deepgram.language       = value.option;
    window.ApiServer.state.services.stt.data.deepgram.language_group = value.group;
  };

  return <>
    <Inspector.SubHeader>Deepgram options</Inspector.SubHeader>
    <InputText label="Key" type="password" value={pr.key} onChange={e => handleUpdate("key", e.target.value)} />

    <InputMappedGroupSelect
      labelGroup="Language"
      labelOption="Dialect"
      value={{ option: pr.language, group: pr.language_group }}
      onChange={updateLanguage}
      library={deepGramLangs} />

    <InputSelect options={[
      { label: 'Base', value: 'base' },
      { label: 'Enhanced', value: 'enhanced' },
    ]} label="Quality" value={pr.tier} onValueChange={e => handleUpdate("tier", e)} />

    <span className="text-base-content/60 text-xs">
      Some languages cannot be used with "enhanced" quality option
      <br />
      <a className="link link-primary link-hover" target="_blank" href="@/server/ui/inspector/server/inspector#language-options">See language table</a>
    </span>

    <InputCheckbox label="Interim result" onChange={e => handleUpdate("interim", e)} value={pr.interim} />
    <InputCheckbox label="Profanity filter" onChange={e => handleUpdate("profanity", e)} value={pr.profanity} />
    <InputCheckbox label="Punctuate" onChange={e => handleUpdate("punctuate", e)} value={pr.punctuate} />
  </>
}

const Speechly: FC = () => {
  const pr = useSnapshot(window.ApiServer.state.services.stt.data.speechly);
  const up = <K extends keyof STT_State["speechly"]>(key: K, v: STT_State["speechly"][K]) => window.ApiServer.state.services.stt.data.speechly[key] = v;

  return <>
    <Inspector.SubHeader>Speechly options</Inspector.SubHeader>
    <InputText label="App ID" type="password" value={pr.key} onChange={e => up("key", e.target.value)} />
  </>
}

const Inspector_STT: FC = () => {
  const data = useSnapshot(window.ApiServer.state.services.stt);
  const state = useSnapshot(window.ApiServer.stt.serviceState);

  const handleStart = (v: boolean) => window.ApiServer.state.services.stt.showActionButton = v;
  const up = <K extends keyof STT_State>(key: K, v: STT_State[K]) => window.ApiServer.patchService("stt", s => s.data[key] = v);

  return <Inspector.Body>
    <Inspector.Header><RiUserVoiceFill /> Speech to Text</Inspector.Header>
    <Inspector.Content>
      <InputCheckbox label="Add to action bar" onChange={handleStart} value={data.showActionButton} />
      <InputCheckbox label="Auto start" value={data.data.autoStart} onChange={e => up("autoStart", e)} />
      <Inspector.Deactivatable active={state.status === ServiceNetworkState.disconnected}>
        <InputSelect options={[
          { label: "Native", value: STT_Backends.native },
          { label: "Browser", value: STT_Backends.browser },
          { label: "Azure", value: STT_Backends.azure },
          { label: "Deepgram", value: STT_Backends.deepgram },
          { label: "Speechly", value: STT_Backends.speechly }
        ]} label="Service" value={data.data.backend} onValueChange={e => up("backend", e as STT_Backends)} />

        {data.data.backend === STT_Backends.browser && <Browser />}
        {data.data.backend === STT_Backends.azure && <Azure />}
        {data.data.backend === STT_Backends.deepgram && <Deepgram />}
        {data.data.backend === STT_Backends.speechly && <Speechly />}
        {data.data.backend === STT_Backends.native && <Native />}
      </Inspector.Deactivatable>


      {data.data.backend !== STT_Backends.browser && <ServiceButton status={state.status} onStart={() => window.ApiServer.stt.start()} onStop={() => window.ApiServer.stt.stop()} />}
    </Inspector.Content>
  </Inspector.Body>
}

export default Inspector_STT;
