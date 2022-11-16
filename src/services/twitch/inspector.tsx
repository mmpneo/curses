import {FC} from "react";

const Inspector_Twitch: FC = () => {
  return <>
    <div className="text-lg font-bold">Twitch</div>
    <fieldset>
      <label>Font size</label>
      <input className="field-width" type="text"/>
    </fieldset>
    <fieldset>
      <label>Font color</label>
      <input type="checkbox" className="toggle toggle-primary"/>
    </fieldset>

    <fieldset>
      <label>asd2</label>
      <select className="field-width"></select>
    </fieldset>

    <fieldset>
      <label>asd2</label>
      <input type="range" className="field-width"></input>
    </fieldset>
  </>
}

export default Inspector_Twitch;
