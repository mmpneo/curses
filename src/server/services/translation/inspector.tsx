import { FC } from "react";
import { RiTranslate2 } from "react-icons/ri";
import Input            from "../../ui/input";
import Inspector        from "../../ui/inspector";

const Inspector_Translation: FC = () => {
  return <Inspector.Body>
    <Inspector.Header><RiTranslate2 /> Translation</Inspector.Header>
    <Inspector.Content>
      <Input.Checkbox label="Post STT results to chat" />
      <Input.Checkbox label="Post Input field to chat" />
      <Input.Checkbox label="Post only when live" />

    </Inspector.Content>
  </Inspector.Body>
}

export default Inspector_Translation;
