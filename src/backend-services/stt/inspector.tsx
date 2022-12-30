import { invoke } from "@tauri-apps/api/tauri";
import { QRCodeCanvas } from "qrcode.react";
import { FC } from "react";
import { RiUserVoiceFill } from "react-icons/ri";
import { useSnapshot } from "valtio";
import Input from "../../components/input";
import Inspector from "../../components/inspector";
import { ServiceNetworkState } from "../../types";
import ServiceButton from "../../components/service-button";
import { STT_Backends, STT_State } from "./schema";
import { azureLanguages, deepGramLangs } from "./service_data";

const Browser: FC = () => {
  const handleOpen = () => {
    invoke("plugin:web|open_browser", {
      data: {
        browser: "chrome",
        url: `localhost:${window.networkConfiguration.port}/mic.html`
      }
    });
  };
  return <>
    <Inspector.SubHeader>Browser options</Inspector.SubHeader>
    <button className="btn btn-sm btn-primary" onClick={handleOpen}>Open chrome</button>

    {/* <QRCodeCanvas
          size={256}
          style={{ height: "100%", maxHeight: "100%", width: "4.5rem" }}
          value={`${window.networkConfiguration.localIp}:${window.networkConfiguration.port}/client`} /> */}
  </>
}


const Azure: FC = () => {
  const pr = useSnapshot(window.API.state.services.stt.data.azure);
  const up = <K extends keyof STT_State["azure"]>(key: K, v: STT_State["azure"][K]) => window.API.state.services.stt.data.azure[key] = v;

  const updateLanguage = (value: { group: string, option: string }) => {
    window.API.state.services.stt.data.azure.language = value.option;
    window.API.state.services.stt.data.azure.language_group = value.group;
  };

  return <>
    <Inspector.SubHeader>Azure options</Inspector.SubHeader>
    <Input.Text label="Location" value={pr.location} onChange={e => up("location", e.target.value)} />
    <Input.Text label="Key" type="password" value={pr.key} onChange={e => up("key", e.target.value)} />

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
    ]} label="Profanity" value={{ value: pr.profanity, label: pr.profanity }} onChange={(e: any) => up("profanity", e.value)} />

    <Input.Checkbox label="Interim result" onChange={e => up("interim", e)} value={pr.interim} />
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
      Some languages cannot be used with "enhanced" quality option
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
  const up = <K extends keyof STT_State["speechly"]>(key: K, v: STT_State["speechly"][K]) => window.API.state.services.stt.data.speechly[key] = v;

  return <>
    <Inspector.SubHeader>Speechly options</Inspector.SubHeader>
    <Input.Text label="Key" type="password" value={pr.key} onChange={e => up("key", e.target.value)} />
  </>
}

const Inspector_STT: FC = () => {
  const data = useSnapshot(window.API.state.services.stt);
  const state = useSnapshot(window.API.stt.serviceState);

  const handleStart = (v: boolean) => window.API.state.services.stt.showActionButton = v;
  const up = <K extends keyof STT_State>(key: K, v: STT_State[K]) => window.API.patchService("stt", s => s.data[key] = v);

  return <Inspector.Body>
    <Inspector.Header><RiUserVoiceFill /> Speech to Text</Inspector.Header>
    <Inspector.Content>
      <Input.Checkbox label="Add to action bar" onChange={handleStart} value={data.showActionButton} />
      <Input.Checkbox label="Auto start" value={data.data.autoStart} onChange={e => up("autoStart", e)} />
      <Inspector.Deactivatable active={state.status === ServiceNetworkState.disconnected}>
        <Input.Select options={[
          { label: "Browser", value: STT_Backends.browser },
          { label: "Azure", value: STT_Backends.azure },
          { label: "Deepgram", value: STT_Backends.deepgram },
          { label: "Speechly", value: STT_Backends.speechly }
        ]} label="Service" value={{ value: data.data.backend, label: data.data.backend }} onChange={(e: any) => up("backend", e.value as STT_Backends)} />

        {data.data.backend === STT_Backends.browser && <Browser />}
        {data.data.backend === STT_Backends.azure && <Azure />}
        {data.data.backend === STT_Backends.deepgram && <Deepgram />}
        {data.data.backend === STT_Backends.speechly && <Speechly />}
      </Inspector.Deactivatable>


      {data.data.backend !== STT_Backends.browser && <ServiceButton status={state.status} onStart={() => window.API.stt.start()} onStop={() => window.API.stt.stop()} />}
    </Inspector.Content>
  </Inspector.Body>
}

export default Inspector_STT;
