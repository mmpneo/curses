import { TextEventSource, zodTextEventSource } from "@/types";
import { zSafe, zStringNumber } from "@/utils";
import { z } from "zod";

export enum VRC_Backends {
  textbox = "textbox",
  killfrenzy = "killfrenzy",
}
const zodVRC_Backends = z.nativeEnum(VRC_Backends);

export const Service_VRC_Schema = z.object({
  enable: zSafe(z.coerce.boolean(), false),
  source: zSafe(zodTextEventSource, TextEventSource.stt),
  target: zSafe(zodVRC_Backends, VRC_Backends.textbox),
  inputField: zSafe(z.coerce.boolean(), true),
  textbox: z.object({
    indicator: zSafe(z.coerce.boolean(), true),
  }).default({}),
  killfrenzy: z.object({
    syncDelay: zSafe(zStringNumber(), "250"),
    visibleTimer: zSafe(zStringNumber(), "5000"),
    syncPoints: zSafe(zStringNumber(), "4"),
    indicator: zSafe(z.coerce.boolean(), false),
    KAT_Visible: zSafe(z.coerce.string(), "KAT_Visible"),
    KAT_Pointer: zSafe(z.coerce.string(), "KAT_Pointer"),
    KAT_CharSync: zSafe(z.coerce.string(), "KAT_CharSync"),
    splitSentences: zSafe(z.coerce.boolean(), true)
  }).default({})
}).default({});

export type VRC_State = z.infer<typeof Service_VRC_Schema>;
