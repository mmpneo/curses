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
  autoStart: boolean,
  replaceWords: Record<string, string>
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
    backend: { type: "string", default: TTS_Backends.windows },
    autoStart: { type: "boolean", default: false },
    source: { type: "string", default: TextEventSource.stt },
    inputField: { type: "boolean", default: true },
    replaceWords: { type: "object", default: {}, required: [] },
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
    "replaceWords",
    "backend",
    "autoStart",
    "source",
    "inputField",
    "windows",
    "azure",
  ],
  default: {},
  additionalProperties: false,
};

export default Schema_STT;
