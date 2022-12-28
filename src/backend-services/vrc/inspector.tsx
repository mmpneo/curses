import { FC } from "react";
import { RiMessage2Fill } from "react-icons/ri";
import { useSnapshot } from "valtio";
import Input from "../../components/input";
import Inspector from "../../components/inspector";
import { VRC_State } from "./schema";

const Inspector_VRC: FC = () => {
  const state = useSnapshot(window.API.state.services.vrc.data);
  const up = <K extends keyof VRC_State>(key: K, v: VRC_State[K]) => window.API.patchService("vrc", s => s.data[key] = v);

  return <Inspector.Body>
    <Inspector.Header><RiMessage2Fill /> VRChat Chatbox</Inspector.Header>
    <Inspector.Content>
      <Input.TextSource label="Source" value={state.source} onChange={e => up("source", e)} />
      <Input.Checkbox label="Send from input field" value={state.inputField} onChange={e => up("inputField", e)} />
      <Input.Checkbox label="Show indicator" value={state.indicator} onChange={e => up("indicator", e)} />
      {/* <Input.Checkbox label="Use interim results" value={state.interim} onChange={e => up("interim", e)} /> */}
      <button className="btn btn-sm" onClick={() => window.API.vrc.sendTest("Test test test!")}>Send Test</button>
    </Inspector.Content>
  </Inspector.Body>
}

export default Inspector_VRC;
