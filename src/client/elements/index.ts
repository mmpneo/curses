import { IServiceInterface } from "@/types";
import { nanoid } from "nanoid";
import { ElementSceneStateFactory, ElementType, TransformRect, UnionElementStateSchema } from "./schema";

class Service_Elements implements IServiceInterface {
  constructor() {}

  init(): void {}

  updateField<SchemaType, Key extends keyof SchemaType>(id: string, sceneId: string, key: Key, value: SchemaType[Key]) {
    window.ApiClient.document.patch(state => {
      if (!(id in state.elements) || !(sceneId in state.elements[id].scenes))
        return;
      (state.elements[id].scenes[sceneId].data as SchemaType)[key] = value;
    });
  }

  addElementToScene(id: string, sceneId = "main", copyFrom = "main") {
    window.ApiClient.document.patch(state => {
      if (!(id in state.elements))
        return;
      if (copyFrom in state.elements[id].scenes)
        state.elements[id].scenes[sceneId] = {...state.elements[id].scenes[copyFrom]}
      else
        state.elements[id].scenes[sceneId] = ElementSceneStateFactory(state.elements[id].type).parse({});
    })
  }
  removeElementFromScene(id: string, sceneId: string) {
    window.ApiClient.document.patch(state => {
      if (!(id in state.elements) || !(sceneId in state.elements[id].scenes))
        return;
      delete state.elements[id].scenes[sceneId];
    })
  }

  addElement(type: ElementType, sceneId: string = "main" , rect?: TransformRect) {
    window.ApiClient.document.patch((state) => {
      let id = nanoid();
      while (id in state.elements) {
        id = nanoid();
      }
      state.elementsIds.push(id);
      state.elements[id] = UnionElementStateSchema.parse({id, type});
      state.elements[id].scenes[sceneId] = ElementSceneStateFactory(state.elements[id].type).parse({rect});
    });
  }

  removeElement(id: string) {
    window.ApiClient.document.patch((state) => {
      if (!state.elements[id]) return;
      const index = state.elementsIds.indexOf(id);
      state.elementsIds.splice(index, 1);
      delete state.elements[id];
    });
  }
}

export default Service_Elements;
