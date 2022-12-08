import { JSONSchemaType } from "ajv";
import { TextEventSource } from "../../../types";

export enum FontCase {
  lowercase = "lowercase",
  uppercase = "uppercase",
  inherit = "inherit",
}

export enum FlexAlign {
  start = "start",
  center = "center",
  end = "end",
}

export type Element_TextState = {
  previewMode: boolean;
  // text
  textFontSize: number;
  textFontFamily: string;
  textFontWeight: number;
  textCase: FontCase;
  textLineHeight: number;
  textColor: string;
  textColorInterim: string;
  textShadowX: number;
  textShadowY: number;
  textShadowZ: number;
  textShadowColor: string;
  textStroke: number;
  textStrokeColor: string;
  textAlignH: FlexAlign;
  textAlignV: FlexAlign;
  textProfanityMask: string;
  textProfanityColor: string;
  textProfanityInterimColor: string;

  //box
  boxColor: string;
  boxPadding: number;
  boxAutoWidth: boolean;
  boxAutoHeight: boolean;
  boxAlignH: FlexAlign;
  boxAlignV: FlexAlign;
  boxBorderRadius: number;
  boxBorderWidth: number;
  boxBorderColor: string;

  //animation
  animateEnable: boolean;
  animateDelayChar: number;
  animateDelayWord: number;
  animateDelaySentence: number;
  animateScroll: boolean;
  animateEvent: boolean;
  animateEventName: string;

  //sources
  sourceMain: TextEventSource;
  sourceInputField: boolean;

  //behaviour
  behaviorClearTimer: number; // clear after...
  behaviorClearDelay: number; // Use this to clear text after some animation
  behaviorLastSentence: boolean; // Show only the last sentence
  behaviorBreakLine: boolean; // Start every input from a new line

  //sound
  soundEnable: boolean;
  soundFile: string;
  soundVolume: number;
  // sound effects
  soundDetuneMin: number;
  soundDetuneMax: number;
  soundPlaybackMin: number;
  soundPlaybackMax: number;

  //css
  css: string;
};

export const Element_TextStateSchema: JSONSchemaType<Element_TextState> = {
  type: "object",
  properties: {
    previewMode: { type: "boolean", default: false },
    textFontSize: { type: "number", default: 18 },
    textFontFamily: { type: "string", default: "Inter" },
    textFontWeight: { type: "number", default: 500 },
    textCase: { type: "string", default: FontCase.inherit },
    textLineHeight: { type: "number", default: 1 },
    textColor: { type: "string", default: "rgb(255,255,255)" },
    textColorInterim: { type: "string", default: "rgb(255,255,255)" },
    textShadowX: {type: "number", default: 0},
    textShadowY: {type: "number", default: 0},
    textShadowZ: {type: "number", default: 0},
    textShadowColor: {type: "string", default: "rgb(0,0,0,0.5)"},
    textStroke: { type: "number", default: 0 },
    textStrokeColor: { type: "string", default: "rgb(255,255,255)" },
    textAlignH: { type: "string", default: FlexAlign.start },
    textAlignV: { type: "string", default: FlexAlign.start },
    textProfanityMask: { type: "string", default: "[redacted ]" },
    textProfanityColor: { type: "string", default: "rgb(255,255,255)" },
    textProfanityInterimColor: { type: "string", default: "rgb(255,255,255)" },
    boxColor: { type: "string", default: "rgb(0,0,0,0.5)" },
    boxPadding: { type: "number", default: 10 },
    boxAutoWidth: { type: "boolean", default: false },
    boxAutoHeight: { type: "boolean", default: true },
    boxAlignH: { type: "string", default: FlexAlign.center },
    boxAlignV: { type: "string", default: FlexAlign.end },
    boxBorderRadius: { type: "number", default: 5 },
    boxBorderWidth: { type: "number", default: 0 },
    boxBorderColor: { type: "string", default: "rgb(0,0,0)" },
    animateEnable: { type: "boolean", default: false },
    animateDelayChar: { type: "number", default: 100 },
    animateDelayWord: { type: "number", default: 100 },
    animateDelaySentence: { type: "number", default: 100 },
    animateScroll: { type: "boolean", default: true },
    animateEvent: { type: "boolean", default: false },
    animateEventName: { type: "string", default: "" },
    sourceMain: { type: "string", default: TextEventSource.stt },
    sourceInputField: { type: "boolean", default: true },
    behaviorClearTimer: { type: "number", default: 5000 },
    behaviorClearDelay: { type: "number", default: 200 },
    behaviorLastSentence: { type: "boolean", default: false },
    behaviorBreakLine: { type: "boolean", default: false },
    soundEnable: { type: "boolean", default: false },
    soundFile: { type: "string", default: "" },
    soundVolume: { type: "number", default: 1 },
    soundDetuneMin: { type: "number", default: 0 },
    soundDetuneMax: { type: "number", default: 0 },
    soundPlaybackMin: { type: "number", default: 1 },
    soundPlaybackMax: { type: "number", default: 1 },
    css: { type: "string", default: "" },
  },
  additionalProperties: false,
  default: {},
  required: [
    "previewMode",
    "textFontSize",
    "textFontFamily",
    "textFontWeight",
    "textCase",
    "textLineHeight",
    "textColor",
    "textColorInterim",
    "textShadowX",
    "textShadowY",
    "textShadowZ",
    "textShadowColor",
    "textStroke",
    "textStrokeColor",
    "textAlignH",
    "textAlignV",
    "textProfanityMask",
    "boxColor",
    "boxPadding",
    "boxAutoWidth",
    "boxAutoHeight",
    "boxAlignH",
    "boxAlignV",
    "boxBorderRadius",
    "boxBorderWidth",
    "boxBorderColor",
    "animateEnable",
    "animateDelayChar",
    "animateDelayWord",
    "animateDelaySentence",
    "animateScroll",
    "animateEvent",
    "animateEventName",
    "sourceMain",
    "sourceInputField",
    "behaviorClearTimer",
    "behaviorClearDelay",
    "behaviorLastSentence",
    "behaviorBreakLine",
    "soundEnable",
    "soundFile",
    "soundVolume",
    "soundDetuneMin",
    "soundDetuneMax",
    "soundPlaybackMin",
    "soundPlaybackMax",
    "css",
  ],
};
