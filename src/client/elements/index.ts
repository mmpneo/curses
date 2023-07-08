import { IServiceInterface } from "@/types";
import { nanoid } from "nanoid";
import { ElementSceneStateFactory, ElementType, TransformRect, UnionElementStateSchema } from "./schema";

class Service_Elements implements IServiceInterface {
  constructor() {}

  init(): void {}

  addElementToScene(id: string, sceneId = "main") {
    window.ApiClient.document.patch(state => {
      if (!(id in state.elements))
        return;
      state.elements[id].scenes[sceneId] = ElementSceneStateFactory(state.elements[id].type).parse({});
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
