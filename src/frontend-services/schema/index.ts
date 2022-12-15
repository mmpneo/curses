import { JSONSchemaType } from "ajv";
import * as Y from "yjs";
import { FileState, fileStateSchema } from "../files/schema";
import { ElementState, elementStateSchema } from "./element";
import { createSceneState, SceneState, sceneStateSchema } from "./scene";
import { createTransformRect, TransformRect, transformRectSchema } from "./transform-rect";

type SceneId = string;
type ElementId = string;

export type DocumentState = {
  canvas: TransformRect;
  activeScene: string;
  scenes: Record<SceneId, SceneState>;
  filesMeta: Array<FileState>;
  elementsIds: Array<ElementId>;
  elements: Record<ElementId, ElementState>;
};
export function createDocumentState(template: Y.Map<any>) {
  template.set("canvas", createTransformRect({w: 500, h: 300}));
  template.set("activeScene", "main");
  template.set("scenes", new Y.Map([
    ["main", createSceneState({id: "main", name: "Main", bindOBS: false, bindOBSName: "OBS scene name"})]
  ]));
  template.set("elementsIds", new Y.Array())
  template.set("filesMeta", new Y.Array())
  template.set("elements", new Y.Map());
}


//@ts-ignore
// simplify validation
export const documentSchema: JSONSchemaType<DocumentState> = {
  type:       "object",
  properties: {
    canvas: transformRectSchema,
    activeScene: {type: "string", default: "night"},
    elementsIds: {type: "array", items: {type: "string"}, default: []},
    filesMeta: {type: "array", items: fileStateSchema, default: []},
    scenes: {
      type: "object",
      additionalProperties: true,
      default: {},
      required: []
    },
    elements: {
      type: "object",
      additionalProperties: true,
      default: {},
      required: []
    }
  },
  additionalProperties: false,
  required:   ["canvas", "activeScene", "filesMeta", "elements", "elementsIds", "scenes"]
}
