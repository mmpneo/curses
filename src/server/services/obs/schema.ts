import { TextEventSource, zodTextEventSource } from "@/types";
import { zSafe } from "@/utils";
import { z } from "zod";

export const Service_OBS_Schema = z.object({
  enable: zSafe(z.coerce.boolean(), false),
  wsHost: zSafe(z.coerce.string(), ""),
  wsAutoStart: zSafe(z.coerce.boolean(), false),
  wsPort: zSafe(z.coerce.string(), ""),
  wsPassword: zSafe(z.coerce.string(), ""),

  captionsEnable: zSafe(z.coerce.boolean(), false),
  source: zSafe(zodTextEventSource, TextEventSource.stt),
  inputField: zSafe(z.coerce.boolean(), false),
  interim: zSafe(z.coerce.boolean(), false),

  scenesEnable: zSafe(z.coerce.boolean(), false),
  scenesFallback: zSafe(z.string(), "Main"),
  scenesMap: zSafe(z.record(z.string(), z.string()), {}),
}).default({});

export type OBS_State = z.infer<typeof Service_OBS_Schema>
