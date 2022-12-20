import { invoke } from "@tauri-apps/api/tauri";
import throttle from "lodash/throttle";
import { IServiceInterface, TextEventType } from "../../types";
import { serviceSubscibeToInput, serviceSubscibeToSource } from "../../utils";

class Service_VRC implements IServiceInterface {
  get #state() {
    return window.API.state.services.vrc.data;
  }

  async init() {
    if (window.platform === "web" || window.mode === "client") {
      return;
    }

    serviceSubscibeToSource(this.#state, "source", data => {
      if (data && data.type === TextEventType.final) {
        this.#sendText(data.value, true);
        this.#state.indicator && this.#sendIndicator(false);
      } else {
        this.#state.indicator && this.#sendIndicatorThrottled(true);
      }
    });
    serviceSubscibeToInput(this.#state, "inputField", data => {
      if (data?.type === TextEventType.final) {
        this.#sendText(data.value, true);
        this.#state.indicator && this.#sendIndicator(false);
      } else {
        this.#state.indicator && this.#sendIndicatorThrottled(true);
      }
    });
  }
  sendTest(value: string): void {
    this.#sendText(value, true);
  }

  #sendIndicatorThrottled = throttle(this.#sendIndicator, 800);

  #sendText(value: string, isFinal: boolean = false) {
    invoke("plugin:osc|send", {
      rpc: {
        path: "/chatbox/input",
        args: [value, true],
      },
    });
  }

  #sendIndicator(value: boolean) {
    invoke("plugin:osc|send", {
      rpc: {
        path: "/chatbox/typing",
        args: [value],
      },
    });
  }
}

export default Service_VRC;
