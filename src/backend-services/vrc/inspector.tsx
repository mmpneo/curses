import { FC } from "react";
import { RiMessage2Fill } from "react-icons/ri";
import { useSnapshot } from "valtio";
import Input from "../../components/input";
import Inspector from "../../components/inspector";
import { VRC_State } from "./schema";

const Inspector_VRC: FC = () => {
  const state = useSnapshot(window.API.state.services.vrc.data);
  const handleUpdate = (key: keyof VRC_State, v: boolean) => window.API.state.services.vrc.data[key] = v;

  return <Inspector.Body>
    <Inspector.Header><RiMessage2Fill /> Vrchat text bubble</Inspector.Header>
    <Inspector.Content>
      <Input.Checkbox label="Send from STT" value={state.sendStt} onChange={e => handleUpdate("sendStt", e)} />
      <Input.Checkbox label="Send from input field" value={state.sendText} onChange={e => handleUpdate("sendText", e)} />
      <Input.Checkbox label="Show indicator" value={state.indicator} onChange={e => handleUpdate("indicator", e)} />
      {/* <Input.Checkbox label="Use interim results" value={state.interim} onChange={e => handleUpdate("interim", e)} /> */}
      <button className="btn btn-sm" onClick={() => window.API.vrc.sendTest("Test test test!")}>Send Test</button>
    </Inspector.Content>
  </Inspector.Body>
}

export default Inspector_VRC;
