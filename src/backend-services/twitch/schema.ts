import {JSONSchemaType} from "ajv";
import { TextEventSource } from "../../types";

export type Twitch_State = {
  token: string
  chatEnable: boolean,
  chatPostEnable: boolean,
  chatPostLive: boolean,
  chatPostSource: TextEventSource,
  chatPostInput: boolean,
  chatReceiveEnable: boolean,
};

const Schema_Twitch: JSONSchemaType<Twitch_State> = {
  type: "object",
  properties: {
    token: { type: "string", default: "" },
    chatEnable: { type: "boolean", default: false },
    chatPostEnable: { type: "boolean", default: false },
    chatPostLive: { type: "boolean", default: false },
    chatPostSource: { type: "string", default: TextEventSource.stt },
    chatPostInput: { type: "boolean", default: false },    
    chatReceiveEnable: { type: "boolean", default: false },
  },
  required: [
    "token",
    "chatEnable",
    "chatPostEnable",
    "chatPostLive",
    "chatPostSource",
    "chatPostInput",

    "chatReceiveEnable",
  ],
  default: {},
  additionalProperties: false
}

export default Schema_Twitch
