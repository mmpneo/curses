import { FC } from "react";
import { RiTwitchFill } from "react-icons/ri";
import Input from "../../components/input";
import Inspector from "../../components/inspector";

const Inspector_Twitch: FC = () => {
  return <Inspector.Body>
    <Inspector.Header><RiTwitchFill /> Twitch integration</Inspector.Header>
    <Inspector.Content>
      <Input.Checkbox label="Post STT results to chat" />
      <Input.Checkbox label="Post Input field to chat" />
      <Input.Checkbox label="Post only when live" />

    </Inspector.Content>
  </Inspector.Body>
}

export default Inspector_Twitch;
