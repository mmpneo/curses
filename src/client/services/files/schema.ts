import { zSafe } from "@/utils";
import * as Y from "yjs";
import z from "zod";
export type FileType = "image" | "audio" | "video" | "font";

export const FileStateSchema = z.object({
  id: zSafe(z.string(), ""),
  name: zSafe(z.string(), ""),
  type: zSafe(z.string(), ""),
  size: zSafe(z.number(), 0),
  meta: zSafe(z.record(z.string(), z.any()), {}),
});
export type FileState = z.infer<typeof FileStateSchema>;

export function createDocumentFile(data: FileState) {
  return new Y.Map(Object.entries(FileStateSchema.parse(data)));
}
