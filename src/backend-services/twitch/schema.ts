import {JSONSchemaType} from "ajv";
import { TextEventSource } from "../../types";

export type Twitch_State = {
  token: string
  chatPostEnable: boolean,
  chatPostLive: boolean,
  chatPostSource: TextEventSource,
  chatPostMask: string,
  chatPostInput: boolean,
  chatReceiveEnable: boolean,
  chatReceiveMask: string,
};

const Schema_Twitch: JSONSchemaType<Twitch_State> = {
  type: "object",
  properties: {
    token: { type: "string", default: "" },
    chatPostEnable: { type: "boolean", default: false },
    chatPostLive: { type: "boolean", default: false },
    chatPostSource: { type: "string", default: TextEventSource.stt },
    chatPostMask: { type: "string", default: "" },
    chatPostInput: { type: "boolean", default: false },
    
    chatReceiveEnable: { type: "boolean", default: false },
    chatReceiveMask: { type: "string", default: "" },
  },
  required: [
    "token",
    "chatPostEnable",
    "chatPostLive",
    "chatPostSource",
    "chatPostMask",
    "chatPostInput",

    "chatReceiveEnable",
    "chatReceiveMask",
  ],
  default: {},
}

export default Schema_Twitch
