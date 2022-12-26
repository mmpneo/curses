import { JSONSchemaType } from "ajv";

export enum STT_Backends {
  browser = "browser",
  browser_remote = "browser-remote",
  azure = "azure",
  deepgram = "deepgram",
}

export type STT_State = {
  backend: STT_Backends;
  azure: {
    device: string;
    language_group: string;
    language: string;
    key: string;
    location: string;
    profanity: string;
    interim: boolean;
  };
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
    azure: {
      type: "object",
      properties: {
        device: { type: "string", default: "" },
        language_group: { type: "string", default: "" },
        language: { type: "string", default: "" },
        key: { type: "string", default: "" },
        location: { type: "string", default: "" },
        profanity: { type: "string", default: "masked" },
        interim: { type: "boolean", default: true },
      },
      required: ["device", "language_group", "language", "key", "location", "profanity", "interim"],
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
  },
  required: [
    "backend",
    "azure",
    "deepgram",
  ],
  default: {},
  additionalProperties: false,
};

export default Schema_STT;
