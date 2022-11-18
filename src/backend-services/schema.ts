import {JSONSchemaType}              from "ajv";
import Schema_STT, {STT_State}       from "./stt/schema";
import Schema_Twitch, {Twitch_State} from "./twitch/schema";
import Schema_VRC, {VRC_State}       from "./vrc/schema";
import Schema_TTS, {TTS_State}       from "./tts/schema";

export interface BackendState {
  clientTheme: string
  services: {
    stt: ServiceState<STT_State>
    tts: ServiceState<TTS_State>
    twitch: ServiceState<Twitch_State>
    vrc: ServiceState<VRC_State>
  }
}


type ServiceState<Data = any> = {
  autoStart: boolean
  data: Data
}

const genServiceSchema = <T>(schema: JSONSchemaType<T>): JSONSchemaType<ServiceState<T>> => ({
  type:       "object",
  properties: {
    autoStart: {type: "boolean", default: false},
    data:      schema
  },
  default:    {},
  required:   ["autoStart", "data"]
} as JSONSchemaType<ServiceState<T>>)

export const backendSchema: JSONSchemaType<BackendState> = {
  type:       "object",
  properties: {
    clientTheme: {type: "string", default: "night"},
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
