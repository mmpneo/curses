import { FC } from "react";
import { RiImageFill } from "react-icons/ri";
import { useGetState } from "../..";
import Inspector from "../../../components/inspector";

const Inspector_ElementImage: FC<{id: string}> = ({id}) => {
  // const state = useGetState(state => state.elements[id]);

  return <Inspector.Body>
    <Inspector.Header><RiImageFill /> Image</Inspector.Header>
    <Inspector.Content>
      {/* <Input.Checkbox label="Send from STT" value={state.sendStt} onChange={e => handleUpdate("sendStt", e)} />
      <Input.Checkbox label="Send from input field" value={state.sendText} onChange={e => handleUpdate("sendText", e)} />
      <Input.Checkbox label="Show indicator" value={state.indicator} onChange={e => handleUpdate("indicator", e)} /> */}
      {/* <Input.Checkbox label="Use interim results" value={state.interim} onChange={e => handleUpdate("interim", e)} /> */}
      <button className="btn btn-sm" onClick={() => window.API.vrc.sendTest("Test test test!")}>Send Test</button>
    </Inspector.Content>
  </Inspector.Body>
}

export default Inspector_ElementImage;
