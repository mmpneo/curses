import { invoke }                                          from "@tauri-apps/api/tauri";
import { IServiceInterface, TextEventType }                from "@/types";
import { serviceSubscibeToInput, serviceSubscibeToSource } from "../../../utils";
import { VRC_Backends }                                    from "./schema";
import VRC_KillFrenzyTarget                                from "./targets/killfrenzy";
import VRC_TextboxTarget                                   from "./targets/textbox";
import { IVRCTarget }                                      from "./types";

async function sleep(time: number) {
  return new Promise((res) => setTimeout(res, time));
}

class Service_VRC implements IServiceInterface {
  get #state() {
    return window.ApiServer.state.services.vrc.data;
  }

  targets: Record<VRC_Backends, IVRCTarget | undefined> = {
    [VRC_Backends.textbox]: undefined,
    [VRC_Backends.killfrenzy]: undefined
  }

  get #activeTarget() {
    return this.targets[this.#state.target];
  }

  async init() {
    this.targets.textbox = new VRC_TextboxTarget();
    this.targets.killfrenzy = new VRC_KillFrenzyTarget();
    serviceSubscibeToSource(this.#state, "source", (data) => {
      if (!this.#state.enable || !data) return;
      if (data.type === TextEventType.final) {
        this.#activeTarget?.pushFinal(data.value);
      } else {
        this.#activeTarget?.pushInterim(data.value);
      }
    });
    serviceSubscibeToInput(this.#state, "inputField", (data) => {
      if (!this.#state.enable || !data) return;
      if (data.type === TextEventType.final) {
        this.#activeTarget?.pushFinal(data.value);
      } else {
        this.#activeTarget?.pushInterim(data.value);
      }
    });
  }
  sendTest(value: string): void {
    this.targets.textbox?.pushFinal(value);
  }

  sendOsc(path: string, args: any[]) {
    invoke("plugin:osc|send", {
      rpc: {
        path,
        args,
      },
    });
  }
}

export default Service_VRC;
