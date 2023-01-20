import { JSONSchemaType } from "ajv";
import Schema_STT, { STT_State } from "./stt/schema";
import Schema_Twitch, { Twitch_State } from "./twitch/schema";
import Schema_VRC, { VRC_State } from "./vrc/schema";
import Schema_TTS, { TTS_State } from "./tts/schema";
import { customAlphabet, urlAlphabet } from "nanoid";

export interface BackendState {
  id: string;
  linkAddress: string;
  clientTheme: string;
  uiScale: number;
  showOverlay: boolean;
  showOverlayLogs: boolean;
  backgroundInputTimer: string;
  shortcuts: {
    bgInput: string;
    start: string;
    muteMic: string;
    muteSound: string;
  };
  services: {
    stt: ServiceState<STT_State>;
    tts: ServiceState<TTS_State>;
    twitch: ServiceState<Twitch_State>;
    vrc: ServiceState<VRC_State>;
  };
}

type ServiceState<Data = any> = {
  showActionButton: boolean;
  data: Data;
};

const genServiceSchema = <T>(
  schema: JSONSchemaType<T>
): JSONSchemaType<ServiceState<T>> =>
  ({
    type: "object",
    properties: {
      showActionButton: { type: "boolean", default: false },
      data: schema,
    },
    default: {},
    required: ["showActionButton", "data"],
  } as JSONSchemaType<ServiceState<T>>);

export const backendSchema: JSONSchemaType<BackendState> = {
  type: "object",
  properties: {
    id: { type: "string", default: customAlphabet(urlAlphabet, 42)() },
    linkAddress: { type: "string", default: "" },
    clientTheme: { type: "string", default: "curses" },
    uiScale: { type: "number", default: 1 },
    showOverlay: { type: "boolean", default: false },
    showOverlayLogs: { type: "boolean", default: false },
    backgroundInputTimer: { type: "string", default: "5000" },
    shortcuts: {
      type: "object",
      properties: {
        bgInput: { type: "string", default: "" },
        muteMic: { type: "string", default: "" },
        muteSound: { type: "string", default: "" },
        start: { type: "string", default: "" },
      },
      default: {} as any,
      required: ["bgInput", "muteMic", "muteSound", "start"],
    },
    services: {
      type: "object",
      properties: {
        vrc: genServiceSchema(Schema_VRC),
        stt: genServiceSchema(Schema_STT),
        tts: genServiceSchema(Schema_TTS),
        twitch: genServiceSchema(Schema_Twitch),
      },
      default: {} as any,
      required: ["vrc", "stt", "tts", "twitch"],
    },
  },
  additionalProperties: false,
  required: [
    "id",
    "linkAddress",
    "uiScale",
    "showOverlay",
    "showOverlayLogs",
    "clientTheme",
    "backgroundInputTimer",
    "services",
  ],
};
