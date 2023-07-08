import { zSafe } from "@/utils";
import z from "zod";
import { TransformRectSchema, UnionElementStateSchema } from "../elements/schema";
import { FileStateSchema } from "../services/files/schema";
import { SceneStateSchema } from "../services/scenes/schema";

export const DocumentSchema = z.object({
  author: zSafe(z.string(), ""),
  canvas: zSafe(TransformRectSchema, {x: 0, y: 0, w: 500,h: 400, r: 0}),
  activeScene: zSafe(z.string(), "main"),
  scenes: zSafe(z.record(z.string(), SceneStateSchema), {
    main: {id: "main", name: "Default scene"}
  }),
  filesMeta: zSafe(FileStateSchema.array(), []),
  elementsIds: zSafe(z.string().array(), []),
  elements: zSafe(z.record(z.string(), UnionElementStateSchema), {})
});
export type DocumentState = z.infer<typeof DocumentSchema>;