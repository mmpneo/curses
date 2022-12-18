import { JSONSchemaType } from "ajv";
import { TextEventSource } from "../../types";

export enum TTS_Backends {
  windows = "windows",
  azure = "azure",
}

export type TTS_State = {
  source: TextEventSource;
  inputField: boolean;
  backend: TTS_Backends;
  windows: {
    device: string;
    voice: string;
  };
  azure: {
    device: string;
    language: string;
    voice: string;
    key: string;
    location: string;
  };
};

const Schema_STT: JSONSchemaType<TTS_State> = {
  type: "object",
  properties: {
    source: { type: "string", default: TextEventSource.stt },
    inputField: { type: "boolean", default: true },
    backend: { type: "string", default: TTS_Backends.windows },
    windows: {
      type: "object",
      properties: {
        device: { type: "string", default: "" },
        voice: { type: "string", default: "" },
      },
      required: ["device", "voice"],
      default: {} as any,
      additionalProperties: false,
    },
    azure: {
      type: "object",
      properties: {
        device: { type: "string", default: "" },
        language: { type: "string", default: "" },
        voice: { type: "string", default: "" },
        key: { type: "string", default: "" },
        location: { type: "string", default: "" },
      },
      required: ["device", "language", "voice", "key", "location"],
      default: {} as any,
      additionalProperties: false,
    },
  },
  required: [
    "source",
    "inputField",
    "backend",
    "windows",
    "azure",
  ],
  default: {},
  additionalProperties: false,
};

export default Schema_STT;
