import {JSONSchemaType} from "ajv";

export enum STT_Backends {
  browser = "browser",
  browser_remote = "browser-remote",
  azure   = "azure"
}

export type STT_State = {
  backend: STT_Backends,
  lang_group: string,
  lang_name: string,
  device: string,
  interim: boolean,
  azure_key: string,
  azure_location: string,
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
  },
  required:             [
    "backend",
    "lang_name",
    "lang_group",
    "device",
    "interim",
    "azure_key",
    "azure_location",
  ],
  default:              {},
  additionalProperties: false
}

export default Schema_STT
