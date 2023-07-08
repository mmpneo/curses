import { zSafe, zStringNumber } from "@/utils";
import z from "zod";

export const Element_ImageStateSchemaN = z.object({
  fileId: zSafe(z.string(), ""),
  styleOpacity: zSafe(zStringNumber(), "1"),
  activeFileId: zSafe(z.string(), ""),
  activeStyleOpacity: zSafe(z.string(), "1"),
  activeEvent: zSafe(z.string(), ""),
  activeDuration: zSafe(z.number(), 100),
  activeTransitionDuration: zSafe(zStringNumber(), "100"),
  styleCss: zSafe(z.string(), ""),
}).default({});
export type Element_ImageState = z.infer<typeof Element_ImageStateSchemaN>;
