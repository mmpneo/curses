import { JSONSchemaType } from "ajv";

export enum STT_Backends {
  native = "native",
  browser = "browser",
  azure = "azure",
  deepgram = "deepgram",
  speechly = "speechly",
}

export type STT_State = {
  backend: STT_Backends;
  autoStart: boolean;
  native: {
    language_group: string;
    language: string;
  },
  azure: {
    device: string;
    language_group: string;
    language: string;
    key: string;
    location: string;
    profanity: string;
    silenceTimeout: string;
    interim: boolean;
  };
  speechly: {
    key: string;
  }
  deepgram: {
    language_group: string;
    language: string;
    tier: string;
    key: string;
    punctuate: boolean;
    profanity: boolean;
    interim: boolean;
  };
};

const Schema_STT: JSONSchemaType<STT_State> = {
  type: "object",
  properties: {
    backend: { type: "string", default: STT_Backends.browser },
    autoStart: { type: "boolean", default: false },
    native: {
      type: "object",
      properties: {
        language_group: { type: "string", default: "" },
        language: { type: "string", default: "" },
      },
      required: ["language_group", "language"],
      default: {} as any,
      additionalProperties: false,
    },
    azure: {
      type: "object",
      properties: {
        device: { type: "string", default: "" },
        language_group: { type: "string", default: "" },
        language: { type: "string", default: "" },
        key: { type: "string", default: "" },
        location: { type: "string", default: "" },
        profanity: { type: "string", default: "masked" },
        silenceTimeout: { type: "string", default: "20" },
        interim: { type: "boolean", default: true },
      },
      required: ["device", "language_group", "language", "key", "location", "profanity", "silenceTimeout", "interim"],
      default: {} as any,
      additionalProperties: false,
    },
    deepgram: {
      type: "object",
      properties: {
        language_group: { type: "string", default: "" },
        language: { type: "string", default: "" },
        tier: { type: "string", default: "" },
        key: { type: "string", default: "" },
        punctuate: { type: "boolean", default: true },
        profanity: { type: "boolean", default: true },
        interim: { type: "boolean", default: true },
      },
      required: ["language_group", "language", "tier", "key", "punctuate", "profanity", "interim"],
      default: {} as any,
      additionalProperties: false,
    },
    speechly: {
      type: "object",
      properties: {
        key: { type: "string", default: "" },
      },
      required: ["key"],
      default: {} as any,
      additionalProperties: false,
    },
  },
  required: [
    "backend",
    "autoStart",
    "speechly",
    "native",
    "azure",
    "deepgram",
  ],
  default: {},
  additionalProperties: false,
};

export default Schema_STT;
