import { JSONSchemaType } from "ajv";
import * as Y from "yjs";
export type TransformRect = {
  x: number;
  y: number;
  w: number;
  h: number;
  r: number;
};
export const createTransformRect = (rect?: Partial<TransformRect>) => {
  return new Y.Map([
    ["x", rect?.x ?? 0],
    ["y", rect?.y ?? 0],
    ["w", rect?.w ?? 100],
    ["h", rect?.h ?? 100],
    ["r", rect?.r ?? 0],
  ]);
};
export const transformRectSchema: JSONSchemaType<TransformRect> = {
  type:       "object",
  properties: {
    x: {type: "number", default: 100},
    y: {type: "number", default: 100},
    w: {type: "number", default: 100},
    h: {type: "number", default: 100},
    r: {type: "number", default: 100},
  },
  default: {},
  additionalProperties: false,
  required:   ["x", "y", "w", "h", "r"]
}