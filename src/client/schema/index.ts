import { JSONSchemaType } from "ajv";
import * as Y                               from "yjs";
import { FileState, fileStateSchema }                                                              from "../services/files/schema";
import {createTransformRect, ElementState, elementStateSchema, TransformRect, transformRectSchema} from "../elements/schema";
import { createSceneState, SceneState, sceneStateSchema }                                          from "../services/scenes/schema";

type SceneId = string;
type ElementId = string;

export type DocumentState = {
  author: string;
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
    author: {type: "string", default: ""},
    canvas: transformRectSchema,
    activeScene: {type: "string", default: "main"},
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
  required:   ["author", "canvas", "activeScene", "filesMeta", "elements", "elementsIds", "scenes"]
}
