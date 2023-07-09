import { zSafe, zStringNumber } from "@/utils";
import z from "zod";
import { TextEventSource, zodTextEventSource } from "../../../types";

export enum FontCase {
  lowercase = "lowercase",
  uppercase = "uppercase",
  inherit = "inherit",
}

const FontCaseSchema = z.nativeEnum(FontCase);

export enum FlexAlign {
  start = "start",
  center = "center",
  end = "end",
}
const FlexAlignSchema = z.nativeEnum(FlexAlign);

export const Element_TextStateSchemaN = z.object({
  previewMode: zSafe(z.boolean(), false),
  // text
  textCase: zSafe(FontCaseSchema, FontCase.inherit),
  textFontFamily: zSafe(z.string(), "Outfit"),
  textFontSize: zSafe(zStringNumber(), "22"),
  textFontWeight: zSafe(zStringNumber(), "500"),
  textLineHeight: zSafe(zStringNumber(), "1.2"),
  textColor: zSafe(z.string(), "rgba(255,255,255,1)"),
  textColorInterim: zSafe(z.string(), "rgba(255,255,255,0.7)"),
  textShadowX: zSafe(zStringNumber(), "0"),
  textShadowY: zSafe(zStringNumber(), "0"),
  textShadowZ: zSafe(zStringNumber(), "0"),
  textShadowColor: zSafe(z.string(), "rgba(0,0,0,0.5)"),
  textStroke: zSafe(zStringNumber(), "0"),
  textStrokeColor: zSafe(z.string(), "rgba(0,0,0,1)"),
  textAlignH: zSafe(FlexAlignSchema, FlexAlign.start),
  textAlignV: zSafe(FlexAlignSchema, FlexAlign.start),
  textProfanityMask: zSafe(z.string(), "[redacted]"),
  textProfanityColor: zSafe(z.string(), "rgba(255,255,255,1)"),
  textProfanityInterimColor: zSafe(z.string(), "rgba(255,255,255,1)"),

  //box
  //bgType - 9slice | solid
  //bgImage - url
  //bgImageFillType - cover | fit
  boxBackgroundType: zSafe(z.enum(["solid", "slice"]), "solid"),
  boxColor: zSafe(z.string(), "rgba(0,0,0,0.5)"),
  boxImageFileId: zSafe(z.string(), ""),

  boxShadowX: zSafe(zStringNumber(), "0"),
  boxShadowY: zSafe(zStringNumber(), "0"),
  boxShadowZ: zSafe(zStringNumber(), "0"),
  boxShadowSpread: zSafe(zStringNumber(), "0"),
  boxShadowColor: zSafe(z.string(), "rgba(0,0,0,0)"),

  boxSliceTileSize: zSafe(zStringNumber(), "10"),
  boxSliceTop: zSafe(zStringNumber(), "10"),
  boxSliceRight: zSafe(zStringNumber(), "10"),
  boxSliceBottom: zSafe(zStringNumber(), "10"),
  boxSliceLeft: zSafe(zStringNumber(), "10"),

  //box
  boxPadding: zSafe(zStringNumber(), "10"),
  boxScrollPaddingTop: zSafe(zStringNumber(), "0"),
  boxScrollPaddingRight: zSafe(zStringNumber(), "0"),
  boxScrollPaddingBottom: zSafe(zStringNumber(), "0"),
  boxScrollPaddingLeft: zSafe(zStringNumber(), "0"),
  boxAutoWidth: zSafe(z.boolean(), false),
  boxAutoHeight: zSafe(z.boolean(), true),
  boxAlignH: zSafe(FlexAlignSchema, FlexAlign.center),
  boxAlignV: zSafe(FlexAlignSchema, FlexAlign.end),
  boxBorderRadius: zSafe(zStringNumber(), "5"),
  boxBorderWidth: zSafe(zStringNumber(), "0"),
  boxBorderColor: zSafe(z.string(), "rgba(0,0,0,0)"),

  //animation
  animateEnable: zSafe(z.boolean(), false),
  animateDelayChar: zSafe(z.coerce.number(), 100),
  animateDelayWord: zSafe(z.coerce.number(), 100),
  animateDelaySentence: zSafe(z.coerce.number(), 100),
  animateScroll: zSafe(z.boolean(), true),
  animateEvent: zSafe(z.boolean(), false),

  //sources
  sourceMain: zSafe(zodTextEventSource, TextEventSource.stt),
  sourceInterim: zSafe(z.boolean(), true),
  sourceInputField: zSafe(z.boolean(), true),

  //behaviour
  behaviorClearTimer: zSafe(z.number(), 5000), // clear after...
  behaviorClearDelay: zSafe(z.number(), 200), // Use this to clear text after some animation
  behaviorLastSentence: zSafe(z.boolean(), false), // Show only the last sentence
  behaviorBreakLine: zSafe(z.boolean(), false), // Start every input from a new line

  //sound
  soundEnable: zSafe(z.boolean(), false),
  soundFile: zSafe(z.string(), ""),
  soundFileNewSentence: zSafe(z.string(), ""),
  soundFileOnShow: zSafe(z.string(), ""),
  soundFileOnHide: zSafe(z.string(), ""),
  soundVolume: zSafe(z.coerce.number(), 1),
  // sound effects
  soundDetuneMin: zSafe(z.coerce.number(), 0),
  soundDetuneMax: zSafe(z.coerce.number(), 0),
  soundPlaybackMin: zSafe(z.coerce.number(), 1),
  soundPlaybackMax: zSafe(z.coerce.number(), 1),

  // particles
  particlesEnable: zSafe(z.boolean(), false),
  particlesSpriteFileIdFirst: zSafe(z.string(), ""),
  particlesSpriteFileIdSecond: zSafe(z.string(), ""),
  particlesSpriteFileIdThird: zSafe(z.string(), ""),
  particlesCountMin: zSafe(zStringNumber(), "5"),
  particlesCountMax: zSafe(zStringNumber(), "5"),
  particlesDurationMin: zSafe(zStringNumber(), "200"),
  particlesDurationMax: zSafe(zStringNumber(), "200"),
  particlesDirectionXMin: zSafe(zStringNumber(), "20"),
  particlesDirectionXMax: zSafe(zStringNumber(), "50"),
  particlesDirectionYMin: zSafe(zStringNumber(), "10"),
  particlesDirectionYMax: zSafe(zStringNumber(), "50"),
  particlesScaleMin: zSafe(zStringNumber(), "1"),
  particlesScaleMax: zSafe(zStringNumber(), "1"),
  particlesRotationMin: zSafe(zStringNumber(), "-100"),
  particlesRotationMax: zSafe(zStringNumber(), "100"),

  //css
  css: zSafe(z.string(), ""),
}).default({});

export type Element_TextState = z.infer<typeof Element_TextStateSchemaN>;