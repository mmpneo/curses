import {JSONSchemaType} from "ajv";
import * as Y           from "yjs";

export enum ElementType {
  text  = "text",
  image = "image",
}

export type TransformRect = {
  x: number;
  y: number;
  w: number;
  h: number;
  r: number;
};
export const createTransformRect                                = (rect?: Partial<TransformRect>) => {
  return new Y.Map([
    ["x", rect?.x ?? 0],
    ["y", rect?.y ?? 0],
    ["w", rect?.w ?? 100],
    ["h", rect?.h ?? 100],
    ["r", rect?.r ?? 0],
  ]);
};
export const transformRectSchema: JSONSchemaType<TransformRect> = {
  type:                 "object",
  properties:           {
    x: {type: "number", default: 100},
    y: {type: "number", default: 100},
    w: {type: "number", default: 100},
    h: {type: "number", default: 100},
    r: {type: "number", default: 100},
  },
  default:              {},
  additionalProperties: false,
  required:             ["x", "y", "w", "h", "r"]
}
export type ElementSceneState<T = any> = {
  rect: TransformRect;
  data: T;
};

export function createElementSceneState({
  rect,
  data,
}: Partial<ElementSceneState>) {
  return new Y.Map([
    ["rect", createTransformRect(rect)],
    ["data", new Y.Map()],
  ]);
}

export const elementSceneStateSchema: JSONSchemaType<ElementSceneState<string>> = {
  type:                 "object",
  properties:           {
    rect: transformRectSchema,
    data: {type: "string", default: "asd"},
  },
  additionalProperties: false,
  default:              {},
  required:             ["rect", "data"],
};

export type ElementState<T = any> = {
  id: string;
  name: string;
  type: ElementType;
  scenes: Record<string, ElementSceneState<T>>;
};

export function createElementState({
  id,
  name,
  type,
  sceneId,
}: Omit<ElementState, "scenes"> & { sceneId?: string }) {
  return new Y.Map([
    ["id", id],
    ["name", name],
    ["type", type],
    [
      "scenes",
      sceneId
        ? new Y.Map([[sceneId, createElementSceneState({})]])
        : new Y.Map(),
    ],
  ]);
}

export const elementStateSchema: JSONSchemaType<ElementState<string>> = {
  type:                 "object",
  properties:           {
    id:     {type: "string"},
    name:   {type: "string", default: "Unnamed element"},
    type:   {type: "string"},
    scenes: {
      type:                 "object",
      patternProperties:    {
        ".*": elementSceneStateSchema,
      },
      additionalProperties: false,
      required:             [],
      default:              {},
    },
  },
  default:              {},
  additionalProperties: false,
  required:             ["id", "name", "scenes", "type"],
};
