import { STT_Backends, STT_State } from "@/server/services/stt/schema";
import { ServiceNetworkState } from "@/types";
import { invoke } from "@tauri-apps/api/tauri";
import { FC } from "react";
import { RiCharacterRecognitionFill, RiUserVoiceFill } from "react-icons/ri";
import { SiGooglechrome, SiMicrosoftedge } from "react-icons/si";
import { useSnapshot } from "valtio";
import { azureLanguages, deepGramLangs, nativeLangs } from "../../services/stt/stt_data";
import ServiceButton from "../service-button";
import Inspector from "./components";
import { InputCheckbox, InputMapObject, InputMappedGroupSelect, InputSelect, InputText, InputWebAudioInput } from "./components/input";
import NiceModal from "@ebay/nice-modal-react";
import Modal from "../Modal";

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
    <div className="p-2 border-2 border-error rounded-lg text-xs space-y-2 flex flex-col">
      <span className="font-bold text-error">Experimental. Might be unstable on some PCs.</span>
      <span className="font-bold text-error">Auto start is disabled.</span>
      <span className="font-bold">How to test</span>
      Just keep it on in the background for 10-15 minutes and say something every minute or two.</div>
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

    <InputWebAudioInput value={pr.device} onChange={e => up("device", e)} label="Input Device"/>

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
  const up = <K extends keyof STT_State["deepgram"]>(key: K, v: STT_State["deepgram"][K]) => window.ApiServer.state.services.stt.data.deepgram[key] = v;

  const updateLanguage = (value: { group: string, option: string }) => {
    window.ApiServer.state.services.stt.data.deepgram.language       = value.option;
    window.ApiServer.state.services.stt.data.deepgram.language_group = value.group;
  };

  return <>
    <Inspector.SubHeader>Deepgram options</Inspector.SubHeader>
    <InputText label="Key" type="password" value={pr.key} onChange={e => up("key", e.target.value)} />

    <InputWebAudioInput value={pr.device} onChange={e => up("device", e)} label="Input Device"/>
    <InputMappedGroupSelect
      labelGroup="Language"
      labelOption="Dialect"
      value={{ option: pr.language, group: pr.language_group }}
      onChange={updateLanguage}
      library={deepGramLangs} />

    <InputSelect options={[
      { label: 'Base', value: 'base' },
      { label: 'Enhanced', value: 'enhanced' },
    ]} label="Quality" value={pr.tier} onValueChange={e => up("tier", e)} />

    <span className="text-base-content/60 text-xs">
      Some languages cannot be used with "enhanced" quality option
      <br />
      <a className="link link-primary link-hover" target="_blank" href="https://developers.deepgram.com/documentation/features/language/#language-options">See language table</a>
    </span>

    <InputCheckbox label="Interim result" onChange={e => up("interim", e)} value={pr.interim} />
    <InputCheckbox label="Profanity filter" onChange={e => up("profanity", e)} value={pr.profanity} />
    <InputCheckbox label="Punctuate" onChange={e => up("punctuate", e)} value={pr.punctuate} />
  </>
}

const Speechly: FC = () => {
  const pr = useSnapshot(window.ApiServer.state.services.stt.data.speechly);
  const up = <K extends keyof STT_State["speechly"]>(key: K, v: STT_State["speechly"][K]) => window.ApiServer.state.services.stt.data.speechly[key] = v;

  return <>
    <Inspector.SubHeader>Speechly options</Inspector.SubHeader>
    <InputWebAudioInput value={pr.device} onChange={e => up("device", e)} label="Input Device"/>
    <InputText label="App ID" type="password" value={pr.key} onChange={e => up("key", e.target.value)} />
  </>
}

const WordsReplacementModal: FC = () => {
  const data = useSnapshot(window.ApiServer.state.services.stt);

  const up = <K extends keyof STT_State>(key: K, v: STT_State[K]) => window.ApiServer.patchService("stt", s => s.data[key] = v);

  return <Modal.Body width={420}>
    <Modal.Header>STT Word replacements</Modal.Header>
    <Modal.Content>
      <div className="p-4 flex flex-col space-y-2">
        <InputCheckbox label="Ignore letter case" value={data.data.replaceWordsIgnoreCase} onChange={v => up("replaceWordsIgnoreCase", v)}/>
        {data.data.replaceWordsIgnoreCase && <>
          <InputCheckbox label="Preserve capitalization" value={data.data.replaceWordsPreserveCase} onChange={v => up("replaceWordsPreserveCase", v)}/>
          <Inspector.Description>Transfers capitalization of original word to replacement</Inspector.Description>
        </>}
        <InputMapObject keyPlaceholder="Word" valuePlaceholder="Replacement" addLabel="Add word" value={{...data.data.replaceWords}} onChange={e => up("replaceWords", e)} label="Dictionary" />
      </div>
    </Modal.Content>
  </Modal.Body>
}
NiceModal.register('stt-replacements', (props) => <Modal.Base {...props}><WordsReplacementModal /></Modal.Base>);

const Inspector_STT: FC = () => {
  const data = useSnapshot(window.ApiServer.state.services.stt);
  const state = useSnapshot(window.ApiServer.stt.serviceState);

  const handleStart = (v: boolean) => window.ApiServer.state.services.stt.showActionButton = v;
  const up = <K extends keyof STT_State>(key: K, v: STT_State[K]) => window.ApiServer.patchService("stt", s => s.data[key] = v);

  const handleShowReplacements = () => {
    NiceModal.show('stt-replacements');
  }

  return <Inspector.Body>
    <Inspector.Header><RiUserVoiceFill /> Speech to Text</Inspector.Header>
    <Inspector.Content>
      <InputCheckbox label="Add to action bar" onChange={handleStart} value={data.showActionButton} />
      <InputCheckbox label="Auto start" value={data.data.autoStart} onChange={e => up("autoStart", e)} />
      <span className="link link-accent link-hover font-semibold flex items-center gap-2 text-sm" onClick={handleShowReplacements}><RiCharacterRecognitionFill/> Edit word replacements</span>
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
