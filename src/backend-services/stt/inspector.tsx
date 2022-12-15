import { FC } from "react";
import { useSnapshot } from "valtio";
import { STT_Backends, STT_State } from "./schema";
import { ServiceNetworkState } from "./types";
import ServiceLanguageSelect from "./language-select";
import { azureLanguages, deepGramLangs } from "./service_data";
import Inspector from "../../components/inspector";
import Input from "../../components/input";
import { RiMicFill } from "react-icons/ri";

const Browser: FC = () => {
  const pr = useSnapshot(window.API.state.services.stt.data);
  const handleUpdate = <K extends keyof STT_State>(key: K, v: STT_State[K]) => window.API.state.services.stt.data[key] = v;
  return <>
    <Inspector.SubHeader>Browser options</Inspector.SubHeader>
    <Input.Checkbox label="Interim result" onChange={e => handleUpdate("interim", e)} value={pr.interim} />
  </>
}


const Azure: FC = () => {
  const pr = useSnapshot(window.API.state.services.stt.data);
  const handleUpdate = <K extends keyof STT_State>(key: K, v: STT_State[K]) => window.API.state.services.stt.data[key] = v;
  return <>
    <Inspector.SubHeader>Azure options</Inspector.SubHeader>
    <Input.Text label="Location" value={pr.azure_location} onChange={e => handleUpdate("azure_location", e.target.value)} />
    <Input.Text label="Key" type="password" value={pr.azure_key} onChange={e => handleUpdate("azure_key", e.target.value)} />

    <ServiceLanguageSelect library={azureLanguages} />

    <Input.Select options={[
      { label: 'Masked', value: 'masked' },
      { label: 'Removed', value: 'removed' },
      { label: 'Raw', value: 'raw' },
    ]} label="Profanity" value={{ value: pr.azure_profanity, label: pr.azure_profanity }} onChange={(e: any) => handleUpdate("azure_profanity", e.value)} />

    <Input.Checkbox label="Interim result" onChange={e => handleUpdate("interim", e)} value={pr.interim} />
  </>
}

const Deepgram: FC = () => {
  const pr = useSnapshot(window.API.state.services.stt.data);
  const handleUpdate = <K extends keyof STT_State>(key: K, v: STT_State[K]) => window.API.state.services.stt.data[key] = v;
  return <>
    <Inspector.SubHeader>Deepgram options</Inspector.SubHeader>
    <Input.Text label="Key" type="password" value={pr.deepgram_key} onChange={e => handleUpdate("deepgram_key", e.target.value)} />

    <ServiceLanguageSelect library={deepGramLangs} />

    <Input.Select options={[
      { label: 'Base', value: 'base' },
      { label: 'Enchanced', value: 'enchanced' },
    ]} label="Quality" value={{ value: pr.deepgram_tier, label: pr.deepgram_tier }} onChange={(e: any) => handleUpdate("deepgram_tier", e.value)} />

    <span className="text-base-content/60 text-xs">
      Some languages cannot be used with "enchanced" quality option
      <br />
      <a className="link link-primary link-hover" target="_blank" href="https://developers.deepgram.com/documentation/features/language/#language-options">See language table</a>
    </span>

    <Input.Checkbox label="Interim result" onChange={e => handleUpdate("interim", e)} value={pr.interim} />
    <Input.Checkbox label="Profanity filter" onChange={e => handleUpdate("deepgram_profanity", e)} value={pr.deepgram_profanity} />
    <Input.Checkbox label="Punctuate" onChange={e => handleUpdate("deepgram_punctuate", e)} value={pr.deepgram_punctuate} />
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

      <Input.Select options={[
        { label: "Browser", value: STT_Backends.browser },
        { label: "Azure", value: STT_Backends.azure },
        { label: "Deepgram", value: STT_Backends.deepgram }
      ]} label="Service" value={{ value: data.data.backend, label: data.data.backend }} onChange={(e: any) => handleBackend(e.value as STT_Backends)} />

      {data.data.backend === STT_Backends.browser && <Browser />}
      {data.data.backend === STT_Backends.azure && <Azure />}
      {data.data.backend === STT_Backends.deepgram && <Deepgram />}

      {state.status === ServiceNetworkState.disconnected && <button className="btn btn-sm btn-primary" onClick={() => window.API.stt.start()}>Start</button>}
      {state.status === ServiceNetworkState.connecting && <button className="btn btn-sm btn-primary loading">Connecting</button>}
      {state.status === ServiceNetworkState.connected && <button className="btn btn-sm btn-primary" onClick={() => window.API.stt.stop()}>Disconnect</button>}
      {state.status === ServiceNetworkState.error && <button className="btn btn-sm btn-error" onClick={() => window.API.stt.start()}>Disconnected, try again</button>}
    </Inspector.Content>
  </Inspector.Body>
}

export default Inspector_STT;
