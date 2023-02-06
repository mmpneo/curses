import { IServiceInterface } from "@/types";
import { nanoid }            from "nanoid";

class Service_Scenes implements IServiceInterface {
  init(): void {}

  addScene(name: string) {
    window.ApiClient.document.patch((state) => {
      const id = nanoid();
      state.scenes[id] = {
        id,
        name,
        bindOBS: false,
        bindOBSName: "Some OBS scene",
      };
    });
  }

  setActive(id: string): void {
    window.ApiClient.document.patch((state) => {
      if (state.scenes[id]) state.activeScene = id;
    });
  }

  deleteScene(id: string) {
    window.ApiClient.document.patch((state) => {
      if (state.scenes[id]) delete state.scenes[id];
      // delete element scene instances
    });
  }
}
export default Service_Scenes;
