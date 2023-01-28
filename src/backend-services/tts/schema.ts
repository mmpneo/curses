import { JSONSchemaType } from "ajv";
import { TextEventSource } from "../../types";

export enum TTS_Backends {
  native = "native",
  windows = "windows",
  azure = "azure",
  tiktok = "tiktok",
}

export type TTS_State = {
  source: TextEventSource;
  inputField: boolean;
  backend: TTS_Backends;
  autoStart: boolean;
  replaceWords: Record<string, string>;
  native: {
    voice: string;
    pitch: string;
    rate: string;
    volume: string;
  };
  tiktok: {
    device: string;
    voice: string;
    volume: string;
    rate: string;
  };
  windows: {
    device: string;
    voice: string;
    volume: string;
    rate: string;
  };
  azure: {
    device: string;
    language: string;
    voice: string;
    voiceStyle: string;
    voiceRole: string;
    
    voiceVolume: string;
    voiceRate: string;
    voicePitch: string;
    voiceRange: string;
    volume: string;
    rate: string;

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
    native: {
      type: "object",
      properties: {
        voice: { type: "string", default: "" },
        pitch: { type: "string", default: "1" },
        rate: { type: "string", default: "1" },
        volume: { type: "string", default: "1" },
      },
      required: ["voice", "pitch", "rate", "volume"],
      default: {} as any,
      additionalProperties: false,
    },
    tiktok: {
      type: "object",
      properties: {
        device: { type: "string", default: "" },
        voice: { type: "string", default: "" },
        volume: { type: "string", default: "1" },
        rate: { type: "string", default: "1" },
      },
      required: ["device", "voice", "volume", "rate"],
      default: {} as any,
      additionalProperties: false,
    },
    windows: {
      type: "object",
      properties: {
        device: { type: "string", default: "" },
        voice: { type: "string", default: "" },
        volume: { type: "string", default: "1" },
        rate: { type: "string", default: "1" },
      },
      required: ["device", "voice", "volume", "rate"],
      default: {} as any,
      additionalProperties: false,
    },
    azure: {
      type: "object",
      properties: {
        device: { type: "string", default: "" },
        volume: { type: "string", default: "1" },
        rate: { type: "string", default: "1" },
        language: { type: "string", default: "" },
        voice: { type: "string", default: "" },
        voiceStyle: { type: "string", default: "" },
        voiceRole: { type: "string", default: "" },

        voiceVolume: { type: "string", default: "default" },
        voiceRate: { type: "string", default: "default" },
        voicePitch: { type: "string", default: "default" },
        voiceRange: { type: "string", default: "default" },

        key: { type: "string", default: "" },
        location: { type: "string", default: "" },
      },
      required: [
        "device",
        "volume",
        "rate",
        "voiceStyle",
        "voiceRole",
        "voiceVolume",
        "voiceRate",
        "voiceRange",
        "voicePitch",
        "language",
        "voice",
        "key",
        "location",
      ],
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
    "native",
    "tiktok",
    "windows",
    "azure",
  ],
  default: {},
  additionalProperties: false,
};

export default Schema_STT;
