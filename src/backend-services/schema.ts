import {JSONSchemaType}              from "ajv";
import Schema_STT, {STT_State}       from "./stt/schema";
import Schema_Twitch, {Twitch_State} from "./twitch/schema";
import Schema_VRC, {VRC_State}       from "./vrc/schema";
import Schema_TTS, {TTS_State}       from "./tts/schema";

export interface BackendState {
  clientTheme: string;
  uiScale: number;
  shortcuts: {
    start: string;
    muteMic: string;
    muteSound: string;
  },
  services: {
    stt: ServiceState<STT_State>
    tts: ServiceState<TTS_State>
    twitch: ServiceState<Twitch_State>
    vrc: ServiceState<VRC_State>
  }
}


type ServiceState<Data = any> = {
  showActionButton: boolean
  data: Data
}

const genServiceSchema = <T>(schema: JSONSchemaType<T>): JSONSchemaType<ServiceState<T>> => ({
  type:       "object",
  properties: {
    showActionButton: {type: "boolean", default: false},
    data:      schema
  },
  default:    {},
  required:   ["showActionButton", "data"]
} as JSONSchemaType<ServiceState<T>>)

export const backendSchema: JSONSchemaType<BackendState> = {
  type:       "object",
  properties: {
    clientTheme: {type: "string", default: "night"},
    uiScale: {type: "number", default: 1},
    shortcuts:    {
      type:       "object",
      properties: {
        muteMic: {type: "string", default: ""},
        muteSound: {type: "string", default: ""},
        start: {type: "string", default: ""},
      },
      default:    {} as any,
      required:   ["muteMic", "muteSound", "start"],
    },
    services:    {
      type:       "object",
      properties: {
        vrc:    genServiceSchema(Schema_VRC),
        stt:    genServiceSchema(Schema_STT),
        tts:    genServiceSchema(Schema_TTS),
        twitch: genServiceSchema(Schema_Twitch),
      },
      default:    {} as any,
      required:   ["vrc", "stt", "tts", "twitch"],
    }
  },
  additionalProperties: false,
  required:   ["clientTheme", "services"]
}
