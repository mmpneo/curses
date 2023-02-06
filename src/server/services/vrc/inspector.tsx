import { FC } from "react";
import { RiMessage2Fill } from "react-icons/ri";
import { useSnapshot }             from "valtio";
import Input                       from "../../ui/input";
import Inspector                   from "../../ui/inspector";
import { VRC_Backends, VRC_State } from "./schema";

const targetOptions = [
  { label: "Chatbox", value: VRC_Backends.textbox },
  { label: "KillFrenzy Avatar Text", value: VRC_Backends.killfrenzy },
]

const TextboxInspector: FC = () => {
  const state = useSnapshot(window.ApiServer.state.services.vrc.data.textbox);
  const up = <K extends keyof VRC_State["textbox"]>(key: K, v: VRC_State["textbox"][K]) => window.ApiServer.patchService("vrc", s => s.data.textbox[key] = v);
  return <>
    <Inspector.SubHeader>Textbox options</Inspector.SubHeader>
    <Input.Checkbox label="Show indicator" value={state.indicator} onChange={e => up("indicator", e)} />
    <button className="btn btn-sm" onClick={() => window.ApiServer.vrc.sendTest("Test test test!")}>Send Test</button>
  </>
}

const KillFrenzyInspector: FC = () => {
  const state = useSnapshot(window.ApiServer.state.services.vrc.data.killfrenzy);
  const up = <K extends keyof VRC_State["killfrenzy"]>(key: K, v: VRC_State["killfrenzy"][K]) => window.ApiServer.patchService("vrc", s => s.data.killfrenzy[key] = v);
  return <>
    <Inspector.SubHeader>KillFrenzy options</Inspector.SubHeader>
    {/* <Input.Checkbox label="Show indicator" value={state.indicator} onChange={e => up("indicator", e)} /> */}
    <Input.Checkbox label="Split large messages" value={state.splitSentences} onChange={e => up("splitSentences", e)} />
    <Input.Text type="number" label="Hide after" min={0} max={4} value={state.visibleTimer} onChange={e => up("visibleTimer", e.target.value)}/>
    <Input.Text type="number" label="Sync points" min={0} max={4} value={state.syncPoints} onChange={e => up("syncPoints", e.target.value)}/>
    <Input.Text type="number" label="Sync delay" min={0} max={1000} value={state.syncDelay} onChange={e => up("syncDelay", e.target.value)}/>

    <Inspector.SubHeader>OSC Keys</Inspector.SubHeader>
    <Input.Text label="Visiblity key (KAT_Visible)" value={state.KAT_Visible} onChange={e => up("KAT_Visible", e.target.value)}/>
    <Input.Text label="Pointer key (KAT_Pointer)" value={state.KAT_Pointer} onChange={e => up("KAT_Pointer", e.target.value)}/>
    <Input.Text label="Char Sync key (KAT_CharSync0..4)" value={state.KAT_CharSync} onChange={e => up("KAT_CharSync", e.target.value)}/>
  </>
}

const Inspector_VRC: FC = () => {
  const state: VRC_State = useSnapshot(window.ApiServer.state.services.vrc.data);
  const up = <K extends keyof VRC_State>(key: K, v: VRC_State[K]) => window.ApiServer.patchService("vrc", s => s.data[key] = v);

  return <Inspector.Body>
    <Inspector.Header><RiMessage2Fill /> VRChat Chatbox</Inspector.Header>
    <Inspector.Content>
      <Input.Checkbox label="Enable" value={state.enable} onChange={e => up("enable", e)} />
      <Input.TextSource label="Source" value={state.source} onChange={e => up("source", e)} />
      <Input.Checkbox label="Text field" value={state.inputField} onChange={e => up("inputField", e)} />

      <Input.Select options={targetOptions} label="Target" value={targetOptions.find(o => o.value === state.target)} onChange={(e: any) => up("target", e.value as VRC_Backends)} />
      {state.target === VRC_Backends.killfrenzy && <KillFrenzyInspector />}
      {state.target === VRC_Backends.textbox && <TextboxInspector />}
    </Inspector.Content>
  </Inspector.Body>
}

export default Inspector_VRC;
