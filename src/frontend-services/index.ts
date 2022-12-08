import Service_Document from "./document";
import Service_Network from "./network";
import { useSyncExternalStoreWithSelector } from "use-sync-external-store/with-selector";
import { DocumentState } from "./schema";
import Service_Scenes from "./scenes";
import Service_Elements from "./elements";
class Frontend {
  network = new Service_Network();
  document = new Service_Document();
  scenes = new Service_Scenes();
  elements = new Service_Elements();

  async Init() {
    await this.document.init();
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
  // console.log(window.APIFrontend.document.fileBinder.get(state => state))
  return useSyncExternalStoreWithSelector<DocumentState, Selection>(
    window.APIFrontend.document.fileBinder.subscribe,
    window.APIFrontend.document.fileBinder.get,
    window.APIFrontend.document.fileBinder.get,
    selector
  );
}

export default Frontend;
