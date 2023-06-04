import { zSafe } from "@/utils";
import { z } from "zod";

export enum Translation_Backends {
  azure = "azure",
}
const zodTranslation_Backends = z.nativeEnum(Translation_Backends);

export const Service_Translation_Schema = z.object({
  backend: zSafe(zodTranslation_Backends, Translation_Backends.azure),
  autoStart: zSafe(z.coerce.boolean(), false),
  inputField: zSafe(z.coerce.boolean(), true),
  azure: z.object({
    key: zSafe(z.coerce.string(), ""),
    location: zSafe(z.coerce.string(), ""),
    languageFrom: zSafe(z.coerce.string(), "en"),
    language: zSafe(z.coerce.string(), "en"),
    profanity: zSafe(z.enum(["Deleted", "Marked", "NoAction"]), "Marked"),
    interim: zSafe(z.coerce.boolean(), true)
  }).default({})
}).default({});

export type Translation_State = z.infer<typeof Service_Translation_Schema>;
