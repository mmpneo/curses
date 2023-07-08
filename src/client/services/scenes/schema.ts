import z from "zod";
import { zSafe } from "@/utils";

export const SceneStateSchema = z.object({
  id: z.string(),
  name: zSafe(z.string(), "Unnamed scene"),
});
export type SceneState = z.infer<typeof SceneStateSchema>;
