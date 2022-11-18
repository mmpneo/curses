import { IServiceInterface } from "../../types";
import * as Y from "yjs";
import { nanoid } from "nanoid";
import { createSceneState } from "../schema";

class Service_Scenes implements IServiceInterface {
  init(): void {}

  get #yScenes() {
    return window.APIFrontend.document.template?.get("scenes") as Y.Map<
      Y.Map<any>
    >;
  }

  addScene(name: string) {
    window.APIFrontend.document.file.transact((_) => {
      const id = nanoid();
      this.#yScenes.set(id, createSceneState({ id, name, bindOBS: false, bindOBSName: "OBS scene name" }));
    });
  }

  setDefault(id: string): void {
    if (!this.#yScenes.has(id)) return;
    window.APIFrontend.document.file.transact((_) => {
      window.APIFrontend.document.template.set("defaultScene", id);
    });
  }

  deleteScene(id: string) {
    if (!this.#yScenes.has(id)) return;
    window.APIFrontend.document.file.transact((_) => {
      this.#yScenes.delete(id);
    });
    // delete element scene instances
  }
}
export default Service_Scenes;
