import { FC } from "react";
import { useTranslation } from "react-i18next";
import { RiAlertFill, RiMessage2Fill } from "react-icons/ri";
import { useSnapshot } from "valtio";
import { VRC_Backends, VRC_State } from "../../services/vrc/schema";
import Inspector from "./components";
import { InputCheckbox, InputSelect, InputText, InputTextSource } from "./components/input";

const targetOptions = [
  { label: "Chatbox", value: VRC_Backends.textbox },
  { label: "KillFrenzy Avatar Text", value: VRC_Backends.killfrenzy },
]

const TextboxInspector: FC = () => {
  const {t} = useTranslation();
  const state = useSnapshot(window.ApiServer.state.services.vrc.data.textbox);
  const up = <K extends keyof VRC_State["textbox"]>(key: K, v: VRC_State["textbox"][K]) => window.ApiServer.patchService("vrc", s => s.data.textbox[key] = v);
  return <>
    <Inspector.SubHeader>{t('vrc.textbox_title')}</Inspector.SubHeader>
    <InputCheckbox label="vrc.textbox_show_indicator" value={state.indicator} onChange={e => up("indicator", e)} />
    <button className="btn btn-sm" onClick={() => window.ApiServer.vrc.sendTest("Test test test!")}>{t('vrc.btn_send_test')}</button>
  </>
}

const KillFrenzyInspector: FC = () => {
  const {t} = useTranslation();
  const state = useSnapshot(window.ApiServer.state.services.vrc.data.killfrenzy);
  const up = <K extends keyof VRC_State["killfrenzy"]>(key: K, v: VRC_State["killfrenzy"][K]) => window.ApiServer.patchService("vrc", s => s.data.killfrenzy[key] = v);
  return <>
    <Inspector.SubHeader>{t('vrc.kfi_title')}</Inspector.SubHeader>
    {/* <InputCheckbox label="Show indicator" value={state.indicator} onChange={e => up("indicator", e)} /> */}
    <InputCheckbox label="vrc.kfi_split_large" value={state.splitSentences} onChange={e => up("splitSentences", e)} />
    <InputText type="number" label="vrc.kfi_hide_after" min={0} max={4} value={state.visibleTimer} onChange={e => up("visibleTimer", e.target.value)}/>
    <InputText type="number" label="vrc.kfi_sync_points" min={0} max={4} value={state.syncPoints} onChange={e => up("syncPoints", e.target.value)}/>
    <InputText type="number" label="vrc.kfi_sync_delay" min={0} max={1000} value={state.syncDelay} onChange={e => up("syncDelay", e.target.value)}/>

    <Inspector.SubHeader>OSC Keys</Inspector.SubHeader>
    <InputText label="vrc.kfi_visibility_key" value={state.KAT_Visible} onChange={e => up("KAT_Visible", e.target.value)}/>
    <InputText label="vrc.kfi_pointer_key" value={state.KAT_Pointer} onChange={e => up("KAT_Pointer", e.target.value)}/>
    <InputText label="vrc.kfi_chat_sync_key" value={state.KAT_CharSync} onChange={e => up("KAT_CharSync", e.target.value)}/>
  </>
}

const Inspector_VRC: FC = () => {
  const {t} = useTranslation();
  const state: VRC_State = useSnapshot(window.ApiServer.state.services.vrc.data);
  const up = <K extends keyof VRC_State>(key: K, v: VRC_State[K]) => window.ApiServer.patchService("vrc", s => s.data[key] = v);

  return <Inspector.Body>
    <Inspector.Header><RiMessage2Fill /> {t('vrc.title')}</Inspector.Header>
    <Inspector.Content>
      <div className="p-2 border-2 border-primary rounded-lg text-xs flex space-x-2 items-center text-primary">
        <RiAlertFill className="text-primary" size={24}/>
        <div className="flex flex-col">
          <span className="font-bold">{t('vrc.notice_title')}</span>
          <span className="font-medium">{t('vrc.notice_desc')}</span>
        </div>
      </div>
      <InputCheckbox label="common.field_enable" value={state.enable} onChange={e => up("enable", e)} />
      <InputTextSource label="common.field_text_source" value={state.source} onChange={e => up("source", e)} />
      <InputCheckbox label="common.field_use_keyboard_input" value={state.inputField} onChange={e => up("inputField", e)} />

      <InputSelect options={targetOptions} label="vrc.field_target" value={state.target} onValueChange={e => up("target", e as VRC_Backends)} />
      {state.target === VRC_Backends.killfrenzy && <KillFrenzyInspector />}
      {state.target === VRC_Backends.textbox && <TextboxInspector />}
    </Inspector.Content>
  </Inspector.Body>
}

export default Inspector_VRC;
