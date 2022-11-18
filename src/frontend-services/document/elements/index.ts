import { IServiceInterface } from "../../../types";
import { createElementState, ElementType } from "../../schema";
import { nanoid } from "nanoid";
import * as Y from "yjs";

class Service_Elements implements IServiceInterface {
  init(): void {}

  get #yElements() {
    return window.APIFrontend.document.template?.get("elements") as Y.Map<Y.Map<any>>;
  }

  createElement(name: string, type: ElementType) {
    window.APIFrontend.document.file.transact((_) => {
      const id = nanoid();
      this.#yElements.set(id, createElementState({ id, name, type }));
    });
  }
}
