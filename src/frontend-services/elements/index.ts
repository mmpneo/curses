import Ajv from "ajv";
import { nanoid } from "nanoid";
import { IServiceInterface } from "../../types";
import { ElementState, ElementType } from "../schema/element";
import { TransformRect } from "../schema/transform-rect";
import { Element_ImageStateSchema } from "./image/schema";
import { Element_TextStateSchema } from "./text/schema";

class Service_Elements implements IServiceInterface {
  constructor() {
    this.#ajv = new Ajv({
      strict: false,
      useDefaults: "empty",
      removeAdditional: true,
    });
  }
  #ajv!: Ajv;

  init(): void {
    
    const validator_text = this.#ajv.compile(Element_TextStateSchema);
    const validator_image = this.#ajv.compile(Element_ImageStateSchema);
    window.APIFrontend.document.patch(state => {
      const elements = state.elements
      Object.values(elements).forEach(element => {
        Object.values(element.scenes).forEach(elementScene => { 
          if (element.type === ElementType.text) {
            validator_text(elementScene.data);
          }
          else if (element.type === ElementType.image) {
            validator_image(elementScene.data);
          }
        });
      });
    });
  }

  validateElements() {

  }

  addElement(type: ElementType, sceneId: string = "main", rect?: TransformRect) {
    let data = {};

    if (type === ElementType.text) {
      const validator = this.#ajv.compile(Element_TextStateSchema);
      validator(data);
    }

    window.APIFrontend.document.patch((state) => {
      const id = nanoid();
      state.elementsIds.push(id);
      state.elements[id] = {
        id,
        type,
        name: `Element - ${type}`,
        scenes: {
          [sceneId]: {
            rect: rect || { x: 100, y: 100, w: 100, h: 100, r: 0 },
            data,
          },
        },
      } as ElementState;
    });
  }

  removeElement(id: string) {
    if (window.API.ui.sidebarState.tab?.value === id)
      window.API.closeSidebar()
    window.APIFrontend.document.patch((state) => {
      if (!state.elements[id]) return;
      const index = state.elementsIds.indexOf(id);
      state.elementsIds.splice(index, 1);
      delete state.elements[id];
    });
  }
}

export default Service_Elements;
