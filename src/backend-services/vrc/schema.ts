import { JSONSchemaType } from "ajv";
import { TextEventSource } from "../../types";

export enum VRC_Backends {
  textbox = "textbox",
  killfrenzy = "killfrenzy",
}

export type VRC_State = {
  enable: boolean;
  source: TextEventSource;
  target: VRC_Backends;
  inputField: boolean;
  textbox: {
    indicator: boolean;
  };
  killfrenzy: {
    syncDelay: string;
    visibleTimer: string;
    syncPoints: string;
    indicator: boolean;
    KAT_Visible: string;
    KAT_Pointer: string;
    KAT_CharSync: string;
    splitSentences: boolean;
  };
};

const Schema_VRC: JSONSchemaType<VRC_State> = {
  type: "object",
  properties: {
    enable: { type: "boolean", default: false },
    source: { type: "string", default: TextEventSource.stt },
    inputField: { type: "boolean", default: false },
    target: { type: "string", default: VRC_Backends.textbox },
    textbox: {
      type: "object",
      properties: {
        indicator: { type: "boolean", default: false },
      },
      required: ["indicator"],
      default: {} as any,
      additionalProperties: false,
    },
    killfrenzy: {
      type: "object",
      properties: {
        syncDelay: { type: "string", default: "250" },
        visibleTimer: { type: "string", default: "5000" },
        syncPoints: { type: "string", default: "4" },
        indicator: { type: "boolean", default: false },
        KAT_Visible: { type: "string", default: "KAT_Visible" },
        KAT_Pointer: { type: "string", default: "KAT_Pointer" },
        KAT_CharSync: { type: "string", default: "KAT_CharSync" },
        splitSentences: { type: "boolean", default: true },
      },
      required: [
        "syncDelay",
        "visibleTimer",
        "syncPoints",
        "indicator",
        "KAT_Visible",
        "KAT_Pointer",
        "KAT_CharSync",
        "splitSentences",
      ],
      default: {} as any,
      additionalProperties: false,
    },
  },
  required: [
    "enable",
    "source",
    "target",
    "inputField",
    "textbox",
    "killfrenzy",
  ],
  default: {},
  additionalProperties: false,
};

export default Schema_VRC;
