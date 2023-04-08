import { Translation_Backends, Translation_State } from "@/server/services/translation/schema";
import { ServiceNetworkState } from "@/types";
import { FC, memo } from "react";
import { RiTranslate2 } from "react-icons/ri";
import { useSnapshot } from "valtio";
import ServiceButton from "../service-button";
import Inspector from "./components";
import { InputCheckbox, InputSelect, InputSelectOption, InputText } from "./components/input";

const Azure: FC = memo(() => {
  const pr = useSnapshot(window.ApiServer.state.services.translation.data.azure);
  const {azure: azureLanguages} = useSnapshot(window.ApiServer.translation.lib);
  const up = <K extends keyof Translation_State["azure"]>(key: K, v: Translation_State["azure"][K]) => window.ApiServer.state.services.translation.data.azure[key] = v;

  return <>
    <Inspector.SubHeader>Azure options</Inspector.SubHeader>
    <InputText label="Key" type="password" value={pr.key} onChange={e => up("key", e.target.value)} />
    <InputText label="Location" value={pr.location} onChange={e => up("location", e.target.value)} />
    <InputSelect 
      label="From language"
      options={azureLanguages as InputSelectOption[]}
      value={pr.languageFrom}
      onValueChange={e => up("languageFrom", e as any)}
    />
    <InputSelect 
      label="To language"
      options={azureLanguages as InputSelectOption[]}
      value={pr.language}
      onValueChange={e => up("language", e as any)}
    />
    <InputSelect 
      label="Profanity"
      options={[
        { label: 'Masked', value: 'Marked' },
        { label: 'Removed', value: 'Deleted' },
        { label: 'Raw', value: 'NoAction' },
      ]}
      value={pr.profanity}
      onValueChange={e => up("profanity", e as any)}
    />
    <InputCheckbox label="Interim result" onChange={e => up("interim", e)} value={pr.interim} />
  </>
})

const Inspector_Translation: FC = () => {
  const data = useSnapshot(window.ApiServer.state.services.translation);
  const state = useSnapshot(window.ApiServer.translation.serviceState);

  const handleStart = (v: boolean) => window.ApiServer.state.services.translation.showActionButton = v;
  const up = <K extends keyof Translation_State>(key: K, v: Translation_State[K]) => window.ApiServer.patchService("translation", s => s.data[key] = v);

  return <Inspector.Body>
    <Inspector.Header><RiTranslate2 /> Translation</Inspector.Header>
    <Inspector.Content>
      <InputCheckbox label="Add to action bar" onChange={handleStart} value={data.showActionButton} />
      <InputCheckbox label="Auto start" value={data.data.autoStart} onChange={e => up("autoStart", e)} />
      <Inspector.Deactivatable active={state.status === ServiceNetworkState.disconnected}>
        <InputSelect options={[
          { label: "Azure", value: Translation_Backends.azure },
        ]} label="Service" value={data.data.backend} onValueChange={e => up("backend", e as Translation_Backends)} />

        {data.data.backend === Translation_Backends.azure && <Azure />}
      </Inspector.Deactivatable>

      <ServiceButton status={state.status} onStart={() => window.ApiServer.translation.start()} onStop={() => window.ApiServer.translation.stop()} />
    </Inspector.Content>
  </Inspector.Body>
};

export default Inspector_Translation;
