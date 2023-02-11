import { TextEventSource } from "@/types";
import {JSONSchemaType}    from "ajv";

export type Discord_State = {
  channelHook: string,
  channelBotName: string,
  channelAvatarUrl: string,
  postEnable: boolean,
  postSource: TextEventSource,
  postInput: boolean,
};

const Schema_Discord: JSONSchemaType<Discord_State> = {
  type: "object",
  properties: {
    channelHook: { type: "string", default: "" },
    channelBotName: { type: "string", default: "" },
    channelAvatarUrl: { type: "string", default: "" },
    postEnable: { type: "boolean", default: false },
    postSource: { type: "string", default: TextEventSource.stt },
    postInput: { type: "boolean", default: false },
  },
  required: [
    "channelHook",
    "channelBotName",
    "channelAvatarUrl",
    "postEnable",
    "postSource",
    "postInput",
  ],
  default: {},
  additionalProperties: false
}

export default Schema_Discord
