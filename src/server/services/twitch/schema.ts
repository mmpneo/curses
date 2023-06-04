import { TextEventSource, zodTextEventSource } from "@/types";
import { zSafe } from "@/utils";
import { z } from "zod";

export const Service_Twitch_Schema = z.object({
  token: zSafe(z.coerce.string(), ""),
  chatPostSource: zSafe(zodTextEventSource, TextEventSource.stt),
  chatEnable: zSafe(z.coerce.boolean(), false),
  chatPostEnable: zSafe(z.coerce.boolean(), false),
  chatPostLive: zSafe(z.coerce.boolean(), false),
  chatPostInput: zSafe(z.coerce.boolean(), false),
  chatReceiveEnable: zSafe(z.coerce.boolean(), false),
  emotesEnableReplacements: zSafe(z.coerce.boolean(), true),
  emotesReplacements: zSafe(z.record(z.coerce.string(), z.coerce.string()), {}),
}).default({});

export type Twitch_State = z.infer<typeof Service_Twitch_Schema>;
