import { JSONSchemaType } from "ajv";
import * as Y from "yjs";
export type SceneState = {
  id: string;
  name: string;
  bindOBS: boolean;
  bindOBSName: string;
};
export function createSceneState({ id, name, bindOBS, bindOBSName }: SceneState) {
  return new Y.Map([
    ["id", id],
    ["name", name],
    ["bindOBS", bindOBS],
    ["bindOBSName", bindOBSName],
  ]);
}
export const sceneStateSchema: JSONSchemaType<SceneState> = {
  type: "object",
  properties: {
    id: {type: "string", default: ""},
    name: {type: "string", default: "Unnamed scene"},
    bindOBS: {type: "boolean", default: false},
    bindOBSName: {type: "string", default: "Some obs scene"},
  },
  required:   ["id", "name", "bindOBS", "bindOBSName"],
  additionalProperties: false
}