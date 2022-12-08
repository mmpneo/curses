import { JSONSchemaType } from "ajv";
import * as Y from "yjs";
import {
  createTransformRect,
  TransformRect,
  transformRectSchema,
} from "./transform-rect";
export enum ElementType {
  text = "text",
  image = "image",
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
  type: "object",
  properties: {
    rect: transformRectSchema,
    data: { type: "string", default: "asd" },
  },
  additionalProperties: false,
  default: {},
  required: ["rect", "data"],
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
  type: "object",
  properties: {
    id: { type: "string" },
    name: { type: "string", default: "Unnamed element" },
    type: { type: "string" },
    scenes: {
      type: "object",
      patternProperties: {
        ".*": elementSceneStateSchema,
      },
      additionalProperties: false,
      required: [],
      default: {},
    },
  },
  default: {},
  additionalProperties: false,
  required: ["id", "name", "scenes", "type"],
};
