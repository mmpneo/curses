import { TextEventSource, zodTextEventSource } from "@/types";
import { zSafe } from "@/utils";
import { z } from "zod";

export const Service_Discord_Schema = z.object({
  channelHook: zSafe(z.coerce.string(), ""),
  channelBotName: zSafe(z.coerce.string(), ""),
  channelAvatarUrl: zSafe(z.coerce.string(), ""),
  postEnable: zSafe(z.coerce.boolean(), false),
  postWithTwitchLive: zSafe(z.coerce.boolean(), false),
  postSource: zSafe(zodTextEventSource, TextEventSource.stt),
  postInput: zSafe(z.coerce.boolean(), false),
}).default({});

export type Discord_State = z.infer<typeof Service_Discord_Schema>;
