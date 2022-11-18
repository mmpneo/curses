import {JSONSchemaType} from "ajv";


export enum STT_Backends {
  browser = "browser",
  browser_remote = "browser-remote",
  azure = "azure",
  deepgram = "deepgram"
}

export type STT_State = {
  backend: STT_Backends,
  lang_group: string,
  lang_name: string,
  device: string,
  interim: boolean,
  azure_key: string,
  azure_location: string,
  azure_profanity: string,
  deepgram_tier: string,
  deepgram_key: string,
  deepgram_punctuate: boolean,
  deepgram_profanity: boolean,
}

const Schema_STT: JSONSchemaType<STT_State> = {
  type:                 "object",
  properties:           {
    backend:        {type: "string", default: STT_Backends.browser},
    lang_name:      {type: "string", default: ""},
    lang_group:     {type: "string", default: ""},
    device:         {type: "string", default: ""},
    interim:        {type: "boolean", default: false},
    azure_key:      {type: "string", default: ""},
    azure_location: {type: "string", default: ""},
    azure_profanity: {type: "string", default: ""},
    deepgram_tier: {type: "string", default: ""},
    deepgram_key: {type: "string", default: ""},
    deepgram_punctuate: {type: "boolean", default: false},
    deepgram_profanity: {type: "boolean", default: false},

  },
  required:             [
    "backend",
    "lang_name",
    "lang_group",
    "device",
    "interim",
    "azure_key",
    "azure_location",
    "azure_profanity",
    "deepgram_tier",
    "deepgram_key",
    "deepgram_punctuate",
    "deepgram_profanity",
  ],
  default:              {},
  additionalProperties: false
}

export default Schema_STT
