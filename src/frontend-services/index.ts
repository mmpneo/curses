import Service_Document from "./document";
import Service_Network from "./network";
import { useSyncExternalStoreWithSelector } from "use-sync-external-store/with-selector";
import { DocumentState } from "./schema";
import Service_Scenes from "./scenes";
import Service_Elements from "./elements";
import Service_Files from "./files";
import Service_Sound from "./sound";
import Service_Particles from "./particles";
class Frontend {
  network = new Service_Network();
  document = new Service_Document();
  scenes = new Service_Scenes();
  sound = new Service_Sound();
  particles = new Service_Particles();
  elements = new Service_Elements();
  files = new Service_Files();

  async init() {
    await this.network.init();
    await this.document.init();
    await this.scenes.init();
    await this.files.init();
    await this.sound.init();
    await this.particles.init();
    await this.elements.init();
  }
}

export const useUpdateState = () => {
  return (fn: (state: DocumentState) => void) =>
    window.APIFrontend.document.fileBinder.update(fn);
};

export function useGetState<Selection>(
  selector: (state: DocumentState) => Selection
) {
  return useSyncExternalStoreWithSelector<DocumentState, Selection>(
    window.APIFrontend.document.fileBinder.subscribe,
    window.APIFrontend.document.fileBinder.get,
    window.APIFrontend.document.fileBinder.get,
    selector
  );
}

export default Frontend;
