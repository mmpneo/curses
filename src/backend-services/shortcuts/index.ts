import { IServiceInterface } from "../../types";
import { register, unregisterAll } from "@tauri-apps/api/globalShortcut";
import { subscribe } from "valtio";
import { debounce } from "lodash";
class Service_Shortcuts implements IServiceInterface {
  async init() {
    if (window.platform === "web" || window.mode === "client") {
      return;
    }
    subscribe(window.API.state.shortcuts, () => {
      this.#_update();
    });
    // this.#_update();
  }

  #_update = debounce(async () => {
    await unregisterAll();

    const st = window.API.state.shortcuts;

    if (st.muteMic)
      await register(st.muteMic, (a) => console.log("mute mic", a));

    if (st.muteSound)
      await register(st.muteSound, (a) => console.log("mute editor", a));

    if (st.start) await register(st.start, (a) => console.log("start", a));
  }, 1000);
}

export default Service_Shortcuts;
