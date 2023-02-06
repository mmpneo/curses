import {JSONSchemaType} from "ajv";

import * as Y      from "yjs";
export type FileType = "image" | "audio" | "video" | "font";

export type FileState<Meta = Record<string, any>> = {
  id: string;
  type: string; // mime types
  name: string;
  size: number;
  meta: Meta;
}

export function createDocumentFile({id, type, name, size, meta}: FileState) {
  return new Y.Map([
    ["id", id],
    ["type", type],
    ["name", name],
    ["size", size],
    ["meta", meta || {}],
  ])
}

export const fileStateSchema: JSONSchemaType<FileState> = {
  type: "object",
  properties: {
    id: {type: "string", default: ""},
    name: {type: "string", default: "Unnamed file"},
    type: {type: "string", default: ""},
    size: {type: "number", default: 0},
    meta: {type: "object", additionalProperties: true},
  },
  required:   ["id", "name", "type", "size"],
  additionalProperties: true
}