import * as Y from "yjs";

type SceneId = string;
type ElementId = string;

export type DocumentState = {
  canvas: TransformRect;
  defaultScene: string;
  scenes: Record<SceneId, SceneState>;
  elements: Record<ElementId, ElementState>;
};
export function createDocumentState(template: Y.Map<any>) {
  template.set("canvas", createRectTransform({w: 500, h: 300}));
  template.set("defaultScene", "main");
  template.set("scenes", new Y.Map([
    ["main", createSceneState({id: "main", name: "Main", bindOBS: false, bindOBSName: "OBS scene name"})]
  ]));
  template.set("elements", new Y.Map());
}

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

export enum ElementType {
  text = "text",
  image = "image",
}

export type ElementState = {
  id: ElementId;
  name: string;
  type: ElementType;
  scenes: Record<SceneId, ElementSceneState>;
};
export function createElementState({ id, name, type }: Omit<ElementState, "scenes">) {
  return new Y.Map([
    ["id", id],
    ["name", name],
    ["type", type],
    ["scenes", new Y.Map()],
  ]);
}

export type ElementSceneState = {
  rect: TransformRect;
  data: any;
};
export function createElementSceneState({ rect, data }: ElementSceneState) {
  return new Y.Map([
    ["rect", createRectTransform(rect)],
    ["data", new Y.Map()],
  ]);
}

export type TransformRect = {
  x: number;
  y: number;
  w: number;
  h: number;
  r: number;
};
export const createRectTransform = (rect?: Partial<TransformRect>) => {
  return new Y.Map([
    ["x", rect?.x ?? 0],
    ["y", rect?.y ?? 0],
    ["w", rect?.w ?? 100],
    ["h", rect?.h ?? 100],
    ["r", rect?.r ?? 0],
  ]);
};
