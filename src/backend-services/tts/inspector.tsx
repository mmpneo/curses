import { FC } from "react";
import { RiVoiceRecognitionFill } from "react-icons/ri";
import Inspector from "../../components/inspector";

const Inspector_TTS: FC = () => {
  return <Inspector.Body>
    <Inspector.Header><RiVoiceRecognitionFill /> Text to Speech</Inspector.Header>
    <Inspector.Content>
      <fieldset>
        <label>Font size</label>
        <input className="field-width" type="text" />
      </fieldset>
      <fieldset>
        <label>Font color</label>
        <input type="checkbox" className="toggle toggle-primary" />
      </fieldset>

      <fieldset>
        <label>asd2</label>
        <select className="field-width"></select>
      </fieldset>

      <fieldset>
        <label>asd2</label>
        <input type="range" className="field-width"></input>
      </fieldset>
    </Inspector.Content>
  </Inspector.Body>

}

export default Inspector_TTS;
