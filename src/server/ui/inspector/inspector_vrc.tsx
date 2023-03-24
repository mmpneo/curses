import { FC } from "react";
import { RiMessage2Fill } from "react-icons/ri";
import { useSnapshot } from "valtio";
import { InputCheckbox, InputSelect, InputText, InputTextSource }           from "./components/input";
import Inspector       from "./components";
import { VRC_Backends, VRC_State } from "../../services/vrc/schema";

const targetOptions = [
  { label: "Chatbox", value: VRC_Backends.textbox },
  { label: "KillFrenzy Avatar Text", value: VRC_Backends.killfrenzy },
]

const TextboxInspector: FC = () => {
  const state = useSnapshot(window.ApiServer.state.services.vrc.data.textbox);
  const up = <K extends keyof VRC_State["textbox"]>(key: K, v: VRC_State["textbox"][K]) => window.ApiServer.patchService("vrc", s => s.data.textbox[key] = v);
  return <>
    <Inspector.SubHeader>Textbox options</Inspector.SubHeader>
    <InputCheckbox label="Show indicator" value={state.indicator} onChange={e => up("indicator", e)} />
    <button className="btn btn-sm" onClick={() => window.ApiServer.vrc.sendTest("Test test test!")}>Send Test</button>
  </>
}

const KillFrenzyInspector: FC = () => {
  const state = useSnapshot(window.ApiServer.state.services.vrc.data.killfrenzy);
  const up = <K extends keyof VRC_State["killfrenzy"]>(key: K, v: VRC_State["killfrenzy"][K]) => window.ApiServer.patchService("vrc", s => s.data.killfrenzy[key] = v);
  return <>
    <Inspector.SubHeader>KillFrenzy options</Inspector.SubHeader>
    {/* <InputCheckbox label="Show indicator" value={state.indicator} onChange={e => up("indicator", e)} /> */}
    <InputCheckbox label="Split large messages" value={state.splitSentences} onChange={e => up("splitSentences", e)} />
    <InputText type="number" label="Hide after" min={0} max={4} value={state.visibleTimer} onChange={e => up("visibleTimer", e.target.value)}/>
    <InputText type="number" label="Sync points" min={0} max={4} value={state.syncPoints} onChange={e => up("syncPoints", e.target.value)}/>
    <InputText type="number" label="Sync delay" min={0} max={1000} value={state.syncDelay} onChange={e => up("syncDelay", e.target.value)}/>

    <Inspector.SubHeader>OSC Keys</Inspector.SubHeader>
    <InputText label="Visiblity key (KAT_Visible)" value={state.KAT_Visible} onChange={e => up("KAT_Visible", e.target.value)}/>
    <InputText label="Pointer key (KAT_Pointer)" value={state.KAT_Pointer} onChange={e => up("KAT_Pointer", e.target.value)}/>
    <InputText label="Char Sync key (KAT_CharSync0..4)" value={state.KAT_CharSync} onChange={e => up("KAT_CharSync", e.target.value)}/>
  </>
}

const Inspector_VRC: FC = () => {
  const state: VRC_State = useSnapshot(window.ApiServer.state.services.vrc.data);
  const up = <K extends keyof VRC_State>(key: K, v: VRC_State[K]) => window.ApiServer.patchService("vrc", s => s.data[key] = v);

  return <Inspector.Body>
    <Inspector.Header><RiMessage2Fill /> VRChat Chatbox</Inspector.Header>
    <Inspector.Content>
      <InputCheckbox label="Enable" value={state.enable} onChange={e => up("enable", e)} />
      <InputTextSource label="Source" value={state.source} onChange={e => up("source", e)} />
      <InputCheckbox label="Text field" value={state.inputField} onChange={e => up("inputField", e)} />

      <InputSelect options={targetOptions} label="Target" value={state.target} onValueChange={e => up("target", e as VRC_Backends)} />
      {state.target === VRC_Backends.killfrenzy && <KillFrenzyInspector />}
      {state.target === VRC_Backends.textbox && <TextboxInspector />}
    </Inspector.Content>
  </Inspector.Body>
}

export default Inspector_VRC;
