import * as Y from "yjs";
import { ElementState } from "./element";
import { createSceneState, SceneState } from "./scene";
import { createTransformRect, TransformRect } from "./transform-rect";

type SceneId = string;
type ElementId = string;

export type DocumentState = {
  canvas: TransformRect;
  activeScene: string;
  scenes: Record<SceneId, SceneState>;
  elementsIds: ElementId[];
  elements: Record<ElementId, ElementState>;
};
export function createDocumentState(template: Y.Map<any>) {
  template.set("canvas", createTransformRect({w: 500, h: 300}));
  template.set("activeScene", "main");
  template.set("scenes", new Y.Map([
    ["main", createSceneState({id: "main", name: "Main", bindOBS: false, bindOBSName: "OBS scene name"})]
  ]));
  template.set("elementsIds", new Y.Array())
  template.set("elements", new Y.Map());
}
// export const frontendSchema: JSONSchemaType<DocumentState> = {
//   type:       "object",
//   properties: {
//     canvas: transformRectSchema,
//     activeScene: {type: "string", default: "night"},
//     elementsIds: {type: "array", items: {type: "string"}, default: []},
//     scenes: {
//       type: "object",
//       patternProperties: {
//         ".*": sceneStateSchema
//       },
//       additionalProperties: false,
//       default: {},
//       required: []
//     },
//     elements: {
//       type: "object",
//       patternProperties: {
//         ".*": elementStateSchema
//       },
//       additionalProperties: false,
//       default: {},
//       required: []
//     }
//   },
//   additionalProperties: false,
//   required:   ["canvas", "activeScene", "elements", "elementsIds", "scenes"]
// }




export type FileState<Meta = any> = {
  id: string;
  type: string; // mime types
  name: string;
  size: number;
  meta?: Meta;
};
export function createFileState({ id, type, name, size, meta }: FileState) {
  return new Y.Map([
    ["id", id],
    ["type", type],
    ["name", name],
    ["size", size],
    ["meta", meta || {}],
  ]);
}
