import { Translation_Backends, Translation_State } from "@/server/services/translation/schema";
import { ServiceNetworkState } from "@/types";
import { FC, memo } from "react";
import { RiTranslate2 } from "react-icons/ri";
import { useSnapshot } from "valtio";
import ServiceButton from "../service-button";
import Inspector from "./components";
import { InputCheckbox, InputSelect, InputSelectOption, InputText } from "./components/input";
import { useTranslation } from "react-i18next";

const Azure: FC = memo(() => {
  const {t} = useTranslation();
  const pr = useSnapshot(window.ApiServer.state.services.translation.data.azure);
  const {azure: azureLanguages} = useSnapshot(window.ApiServer.translation.lib);
  const up = <K extends keyof Translation_State["azure"]>(key: K, v: Translation_State["azure"][K]) => window.ApiServer.state.services.translation.data.azure[key] = v;

  return <>
    <Inspector.SubHeader>{t('transl.azure_title')}</Inspector.SubHeader>
    <InputText label="transl.azure_key" type="password" value={pr.key} onChange={e => up("key", e.target.value)} />
    <InputText label="transl.azure_location" value={pr.location} onChange={e => up("location", e.target.value)} />
    <InputSelect 
      label="transl.azure_from_language"
      options={azureLanguages as InputSelectOption[]}
      value={pr.languageFrom}
      onValueChange={e => up("languageFrom", e as any)}
    />
    <InputSelect 
      label="transl.azure_to_language"
      options={azureLanguages as InputSelectOption[]}
      value={pr.language}
      onValueChange={e => up("language", e as any)}
    />
    <InputSelect 
      label="transl.azure_profanity"
      options={[
        { label: t('transl.azure_profanity_masked'), value: 'Marked' },
        { label: t('transl.azure_profanity_removed'), value: 'Deleted' },
        { label: t('transl.azure_profanity_raw'), value: 'NoAction' },
      ]}
      value={pr.profanity}
      onValueChange={e => up("profanity", e as any)}
    />
    <InputCheckbox label="common.field_interim_results" onChange={e => up("interim", e)} value={pr.interim} />
  </>
})

const Inspector_Translation: FC = () => {
  const {t} = useTranslation();
  const data = useSnapshot(window.ApiServer.state.services.translation);
  const state = useSnapshot(window.ApiServer.translation.serviceState);

  const handleStart = (v: boolean) => window.ApiServer.state.services.translation.showActionButton = v;
  const up = <K extends keyof Translation_State>(key: K, v: Translation_State[K]) => window.ApiServer.patchService("translation", s => s.data[key] = v);

  return <Inspector.Body>
    <Inspector.Header><RiTranslate2 /> {t('transl.title')}</Inspector.Header>
    <Inspector.Content>
      <InputCheckbox label="common.field_action_bar" onChange={handleStart} value={data.showActionButton} />
      <InputCheckbox label="common.field_auto_start" value={data.data.autoStart} onChange={e => up("autoStart", e)} />
      <Inspector.Deactivatable active={state.status === ServiceNetworkState.disconnected}>
        <InputSelect options={[
          { label: "Azure", value: Translation_Backends.azure },
        ]} label="common.field_service" value={data.data.backend} onValueChange={e => up("backend", e as Translation_Backends)} />

        {data.data.backend === Translation_Backends.azure && <Azure />}
      </Inspector.Deactivatable>

      <ServiceButton status={state.status} onStart={() => window.ApiServer.translation.start()} onStop={() => window.ApiServer.translation.stop()} />
    </Inspector.Content>
  </Inspector.Body>
};

export default Inspector_Translation;
