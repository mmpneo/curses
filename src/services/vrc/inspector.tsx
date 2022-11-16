import {FC}          from "react";
import {useSnapshot} from "valtio";
import {VRC_State}   from "./schema";

const Inspector_VRC: FC = () => {
  const state = useSnapshot(window.API.state.services.vrc.data);
  const handleUpdate = (key: keyof VRC_State, v: boolean) => window.API.state.services.vrc.data[key] = v;

  return <>
    <div className="text-lg font-bold">Vrchat text bubble</div>
    <fieldset>
      <label htmlFor="vrc-stt">Send from STT</label>
      <input onChange={e => handleUpdate("sendStt", e.target.checked)} checked={state.sendStt} id="vrc-stt" type="checkbox" className="toggle toggle-primary"/>
    </fieldset>

    <fieldset>
      <label htmlFor="vrc-input-field">Send from input field</label>
      <input onChange={e => handleUpdate("sendText", e.target.checked)} checked={state.sendText} id="vrc-input-field" type="checkbox" className="toggle toggle-primary"/>
    </fieldset>
    {/* <fieldset>
      <label htmlFor="vrc-interim">Use interim results</label>
      <input onChange={e => handleUpdate("interim", e.target.checked)} checked={state.interim} id="vrc-interim" type="checkbox" className="toggle toggle-primary"/>
    </fieldset> */}

    <fieldset>
      <label htmlFor="vrc-indicator">Show typing indicator</label>
      <input onChange={e => handleUpdate("indicator", e.target.checked)} checked={state.indicator} id="vrc-indicator" type="checkbox" className="toggle toggle-primary"/>
    </fieldset>

    <button className="btn btn-sm" onClick={() => window.API.vrc.sendTest("Test test test!")}>Send Test</button>
  </>
}

export default Inspector_VRC;
