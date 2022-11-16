import {FC}           from "react";
import {useSnapshot}  from "valtio";
import {STT_Backends} from "./schema";
import SubHeader      from "../../components/subheader";

const Browser: FC = () => {
  const state = useSnapshot(window.API.state.services.stt.data);
  const handleChangeInterim = (v: boolean) => window.API.state.services.stt.data.interim = v;
  return <>
    <SubHeader>Browser options</SubHeader>
    <fieldset>
      <label>Interim</label>
      <input type="checkbox" onChange={e => handleChangeInterim(e.target.checked)} checked={state.interim}/>
    </fieldset>
  </>
}


const Azure: FC = () => {
  const pr = useSnapshot(window.API.state.services.stt.data);
  const handleChangeInterim = (v: boolean) => window.API.state.services.stt.data.interim = v;
  return <>
    <SubHeader>Azure options</SubHeader>
    <fieldset>
      <label>Interim</label>
      <input type="checkbox" onChange={e => handleChangeInterim(e.target.checked)} checked={pr.interim}/>
    </fieldset>
    <fieldset>
      <label>Location</label>
      <input className="field-width" placeholder="Enter location" type="text"/>
    </fieldset>
    <fieldset>
      <label>Key</label>
      <input className="field-width" placeholder="Enter key" type="text"/>
    </fieldset>
    <fieldset>
      <label>Profanity</label>
      <select className="field-width">
        <option value={STT_Backends.browser}>Masked</option>
        <option value={STT_Backends.azure}>Removed</option>
        <option value={STT_Backends.azure}>Raw</option>
      </select>
    </fieldset>
  </>
}

const Inspector_STT: FC = () => {
  const state = useSnapshot(window.API.state.services.stt);

  const handleStart = (v: boolean) => window.API.state.services.stt.autoStart = v;

  const handleBackend       = (v: STT_Backends) => window.API.state.services.stt.data.backend = v;

  return <>
    <div className="text-lg font-bold">Speech to text</div>
    <fieldset>
      <label>Auto start</label>
      <input type="checkbox" onChange={e => handleStart(e.target.checked)} checked={state.autoStart}/>
    </fieldset>
    <fieldset>
      <label>Service</label>
      <select className="field-width" value={state.data.backend} onChange={e => handleBackend(e.target.value as STT_Backends)}>
        <option value={STT_Backends.browser}>Browser</option>
        <option value={STT_Backends.azure}>Azure</option>
      </select>
    </fieldset>

    {state.data.backend === STT_Backends.browser && <Browser/>}
    {state.data.backend === STT_Backends.azure && <Azure/>}
  </>
}

export default Inspector_STT;
