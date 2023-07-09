import Service_Document                     from "./services/document";
import { useSyncExternalStoreWithSelector } from "use-sync-external-store/with-selector";
import { DocumentState } from "./schema";
import Service_Scenes    from "./services/scenes";
import Service_Elements  from "./elements";
import Service_Files     from "./services/files";
import Service_Sound     from "./services/sound";
import Service_Particles from "./services/particles";
import AppConfiguration from "@/config";

class ApiClient {
  document = new Service_Document();
  scenes = new Service_Scenes();
  sound = new Service_Sound();
  particles = new Service_Particles();
  elements = new Service_Elements();
  files = new Service_Files();

  async init() {
    if (window.Config.isClient()) {
      const runtimeConfig: AppConfiguration["clientInitialState"] = await window.ApiShared.peer.startClient();
      window.Config.clientInitialState = runtimeConfig;
    }
    await this.document.init();
    await this.scenes.init();
    await this.files.init();
    await this.sound.init();
    await this.particles.init();
    await this.elements.init();
  }
  getInitialConfig(): AppConfiguration["clientInitialState"] {
    return {
      scene: this.scenes.state.activeScene
    }
  }
}

export const useUpdateState = () => {
  return (fn: (state: DocumentState) => void) =>
    window.ApiClient.document.fileBinder.update(fn);
};

export function useGetState<Selection>(
  selector: (state: DocumentState) => Selection
) {
  return useSyncExternalStoreWithSelector<DocumentState, Selection>(
    window.ApiClient.document.fileBinder.subscribe,
    window.ApiClient.document.fileBinder.get,
    window.ApiClient.document.fileBinder.get,
    selector
  );
}

export default ApiClient;
