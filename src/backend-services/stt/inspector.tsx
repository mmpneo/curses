import { FC } from "react";
import { useSnapshot } from "valtio";
import { STT_Backends, STT_State } from "./schema";
import { deepGramLangs, azureLanguages } from "./service_data";
import Inspector from "../../components/inspector";
import Input from "../../components/input";
import { RiMicFill } from "react-icons/ri";
import ServiceButton from "../components/service-button";
import { ServiceNetworkState } from "../../types";
import { invoke } from "@tauri-apps/api/tauri";

const Browser: FC = () => {
  const handleOpen = () => {
    invoke("plugin:web|open_browser", {
      data: {
        browser: "chrome",
        url: `http://${window.networkConfiguration.localIp}:${window.networkConfiguration.port}/mic.html`
      }
    });
  };
  return <>
    <Inspector.SubHeader>Browser options</Inspector.SubHeader>
    <button className="btn btn-sm btn-primary" onClick={handleOpen}>Open chrome</button>
  </>
}


const Azure: FC = () => {
  const pr = useSnapshot(window.API.state.services.stt.data.azure);
  const handleUpdate = <K extends keyof STT_State["azure"]>(key: K, v: STT_State["azure"][K]) => window.API.state.services.stt.data.azure[key] = v;

  const updateLanguage = (value: { group: string, option: string }) => {
    window.API.state.services.stt.data.azure.language = value.option;
    window.API.state.services.stt.data.azure.language_group = value.group;
  };

  return <>
    <Inspector.SubHeader>Azure options</Inspector.SubHeader>
    <Input.Text label="Location" value={pr.location} onChange={e => handleUpdate("location", e.target.value)} />
    <Input.Text label="Key" type="password" value={pr.key} onChange={e => handleUpdate("key", e.target.value)} />

    <Input.MappedGroupSelect
      labelGroup="Language"
      labelOption="Dialect"
      value={{ option: pr.language, group: pr.language_group }}
      onChange={updateLanguage}
      library={azureLanguages} />

    <Input.Select options={[
      { label: 'Masked', value: 'masked' },
      { label: 'Removed', value: 'removed' },
      { label: 'Raw', value: 'raw' },
    ]} label="Profanity" value={{ value: pr.profanity, label: pr.profanity }} onChange={(e: any) => handleUpdate("profanity", e.value)} />

    <Input.Checkbox label="Interim result" onChange={e => handleUpdate("interim", e)} value={pr.interim} />
  </>
}

const Deepgram: FC = () => {
  const pr = useSnapshot(window.API.state.services.stt.data.deepgram);
  const handleUpdate = <K extends keyof STT_State["deepgram"]>(key: K, v: STT_State["deepgram"][K]) => window.API.state.services.stt.data.deepgram[key] = v;

  const updateLanguage = (value: { group: string, option: string }) => {
    window.API.state.services.stt.data.deepgram.language = value.option;
    window.API.state.services.stt.data.deepgram.language_group = value.group;
  };

  return <>
    <Inspector.SubHeader>Deepgram options</Inspector.SubHeader>
    <Input.Text label="Key" type="password" value={pr.key} onChange={e => handleUpdate("key", e.target.value)} />

    <Input.MappedGroupSelect
      labelGroup="Language"
      labelOption="Dialect"
      value={{ option: pr.language, group: pr.language_group }}
      onChange={updateLanguage}
      library={deepGramLangs} />

    <Input.Select options={[
      { label: 'Base', value: 'base' },
      { label: 'Enhanced', value: 'enhanced' },
    ]} label="Quality" value={{ value: pr.tier, label: pr.tier }} onChange={(e: any) => handleUpdate("tier", e.value)} />

    <span className="text-base-content/60 text-xs">
      Some languages cannot be used with "enchanced" quality option
      <br />
      <a className="link link-primary link-hover" target="_blank" href="https://developers.deepgram.com/documentation/features/language/#language-options">See language table</a>
    </span>

    <Input.Checkbox label="Interim result" onChange={e => handleUpdate("interim", e)} value={pr.interim} />
    <Input.Checkbox label="Profanity filter" onChange={e => handleUpdate("profanity", e)} value={pr.profanity} />
    <Input.Checkbox label="Punctuate" onChange={e => handleUpdate("punctuate", e)} value={pr.punctuate} />
  </>
}

const Speechly: FC = () => {
  const pr = useSnapshot(window.API.state.services.stt.data.speechly);
  const handleUpdate = <K extends keyof STT_State["speechly"]>(key: K, v: STT_State["speechly"][K]) => window.API.state.services.stt.data.speechly[key] = v;

  return <>
    <Inspector.SubHeader>Speechly options</Inspector.SubHeader>
    <Input.Text label="Key" type="password" value={pr.key} onChange={e => handleUpdate("key", e.target.value)} />
  </>
}

const Inspector_STT: FC = () => {
  const data = useSnapshot(window.API.state.services.stt);
  const state = useSnapshot(window.API.stt.serviceState);

  const handleStart = (v: boolean) => window.API.state.services.stt.autoStart = v;
  const handleBackend = (v: STT_Backends) => window.API.state.services.stt.data.backend = v;

  return <Inspector.Body>
    <Inspector.Header><RiMicFill /> Speech to text</Inspector.Header>
    <Inspector.Content>
      <Input.Checkbox label="Start with play button" onChange={handleStart} value={data.autoStart} />
      <Inspector.Deactivatable active={state.status === ServiceNetworkState.disconnected}>
        <Input.Select options={[
          { label: "Browser", value: STT_Backends.browser },
          { label: "Azure", value: STT_Backends.azure },
          { label: "Deepgram", value: STT_Backends.deepgram },
          { label: "Speechly", value: STT_Backends.speechly }
        ]} label="Service" value={{ value: data.data.backend, label: data.data.backend }} onChange={(e: any) => handleBackend(e.value as STT_Backends)} />

        {data.data.backend === STT_Backends.browser && <Browser />}
        {data.data.backend === STT_Backends.azure && <Azure />}
        {data.data.backend === STT_Backends.deepgram && <Deepgram />}
        {data.data.backend === STT_Backends.speechly && <Speechly />}
      </Inspector.Deactivatable>


      <ServiceButton status={state.status} onStart={() => window.API.stt.start()} onStop={() => window.API.stt.stop()} />
    </Inspector.Content>
  </Inspector.Body>
}

export default Inspector_STT;
