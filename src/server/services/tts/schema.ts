import { TextEventSource, zodTextEventSource } from "@/types";
import { zSafe, zStringNumber } from "@/utils";
import { z } from "zod";

export enum TTS_Backends {
  native = "native",
  windows = "windows",
  azure = "azure",
  tiktok = "tiktok",
  uberduck = "uberduck",
  piper = "piper",
  custom = "custom",
  // voicevox = "voicevox",
}

const zodTTS_Backends = z.nativeEnum(TTS_Backends);

export const Service_TTS_Schema = z.object({
  source: zSafe(zodTextEventSource, TextEventSource.stt),
  inputField: zSafe(z.coerce.boolean(), true),
  backend: zSafe(zodTTS_Backends, TTS_Backends.native),
  autoStart: zSafe(z.coerce.boolean(), false),
  stopWithStream: zSafe(z.coerce.boolean(), false),
  replaceWords: zSafe(z.record(z.coerce.string(), z.coerce.string()), {}),
  replaceWordsIgnoreCase: zSafe(z.coerce.boolean(), true),
  native: z.object({
    voice: zSafe(z.coerce.string(), ""),
    pitch: zSafe(zStringNumber(), "1"),
    rate: zSafe(zStringNumber(), "1"),
    volume: zSafe(zStringNumber(), "1"),
  }).default({}),
  tiktok: z.object({
    device: zSafe(z.coerce.string(), ""),
    voice: zSafe(z.coerce.string(), ""),
    volume: zSafe(zStringNumber(), "1"),
    rate: zSafe(zStringNumber(), "1"),
  }).default({}),
  windows: z.object({
    device: zSafe(z.coerce.string(), ""),
    voice: zSafe(z.coerce.string(), ""),
    volume: zSafe(zStringNumber(), "1"),
    rate: zSafe(zStringNumber(), "1"),
  }).default({}),
  uberduck: z.object({
    api_key: zSafe(z.coerce.string(), ""),
    secret_key: zSafe(z.coerce.string(), ""),
    device: zSafe(z.coerce.string(), ""),
    voice: zSafe(z.coerce.string(), ""),
    volume: zSafe(zStringNumber(), "1"),
    rate: zSafe(zStringNumber(), "1"),
  }).default({}),
  azure: z.object({
    device: zSafe(z.coerce.string(), ""),
    language: zSafe(z.coerce.string(), ""),
    voice: zSafe(z.coerce.string(), ""),
    voiceStyle: zSafe(z.coerce.string(), ""),
    voiceRole: zSafe(z.coerce.string(), ""),
    voiceVolume: zSafe(z.coerce.string(), "default"),
    voiceRate: zSafe(z.coerce.string(), "default"),
    voicePitch: zSafe(z.coerce.string(), "default"),
    voiceRange: zSafe(z.coerce.string(), "default"),
    volume: zSafe(zStringNumber(), "1"),
    rate: zSafe(zStringNumber(), "1"),
    key: zSafe(z.coerce.string(), ""),
    location: zSafe(z.coerce.string(), ""),
  }).default({}),
  piper: z.object({
    device: zSafe(z.coerce.string(), ""),
    voice: zSafe(z.coerce.string(), ""),
    exe_location: zSafe(z.coerce.string(), ""),
    voice_location: zSafe(z.coerce.string(), ""),
    speaker_id: zSafe(z.coerce.number(), 0),
  }).default({}),
  custom: z.object({
    device: zSafe(z.coerce.string(), ""),
    exe_location: zSafe(z.coerce.string(), ""),
  }).default({})
}).default({});

export type TTS_State = z.infer<typeof Service_TTS_Schema>
