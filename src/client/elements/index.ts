import { IServiceInterface } from "@/types";
import { nanoid } from "nanoid";
import { ElementSceneStateFactory, ElementType, TransformRect, UnionElementStateSchema } from "./schema";

class Service_Elements implements IServiceInterface {
  constructor() {}

  init(): void {
    const elements = window.ApiClient.document.fileBinder.get().elements;
    for (const id in elements) {
      this.#registerElementEvent(id, elements[id].name);
    }
  }

  #registerElementEvent(id: string, elementName: string) {
    const eventId = `element.${id}`;
    window.ApiShared.pubsub.unregisterEvent(eventId);
    const event = {
      label: `${elementName} activity`,
      value: eventId
    }
    window.ApiShared.pubsub.registerEvent(event);
  }

  updateField<SchemaType, Key extends keyof SchemaType>(id: string, sceneId: string, key: Key, value: SchemaType[Key]) {
    window.ApiClient.document.patch(state => {
      if (!(id in state.elements) || !(sceneId in state.elements[id].scenes))
        return;

      // update custom event label
      if (key === "name" && state.elements[id].type === ElementType.text) {
        this.#registerElementEvent(id, value as string);
      }

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
    let id = nanoid();
    window.ApiClient.document.patch((state) => {
      while (id in state.elements) {
        id = nanoid();
      }
      state.elementsIds.push(id);
      state.elements[id] = UnionElementStateSchema.parse({id, type});
      state.elements[id].scenes[sceneId] = ElementSceneStateFactory(state.elements[id].type).parse({rect});
    });
    const elements = window.ApiClient.document.fileBinder.get().elements;

    if (type === ElementType.text)
      this.#registerElementEvent(id, elements[id].name);
  }

  removeElement(id: string) {
    window.ApiClient.document.patch((state) => {
      if (!state.elements[id]) return;
      const index = state.elementsIds.indexOf(id);
      state.elementsIds.splice(index, 1);
      delete state.elements[id];
    });
    window.ApiShared.pubsub.unregisterEvent(`element.${id}`);
  }
}

export default Service_Elements;
