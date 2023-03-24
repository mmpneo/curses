import { FC } from "react";
import { RiTranslate2 } from "react-icons/ri";
import { InputCheckbox } from "./components/input";
import Inspector from "./components";

const Inspector_Translation: FC = () => {
  return (
    <Inspector.Body>
      <Inspector.Header>
        <RiTranslate2 /> Translation
      </Inspector.Header>
      <Inspector.Content>
        <InputCheckbox label="Post STT results to chat" />
        <InputCheckbox label="Post Input field to chat" />
        <InputCheckbox label="Post only when live" />
      </Inspector.Content>
    </Inspector.Body>
  );
};

export default Inspector_Translation;
