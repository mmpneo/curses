import { invoke } from "@tauri-apps/api/tauri";
import { IServiceInterface, TextEventSource, TextEventType } from "../../types";
import throttle from "lodash/throttle";

class Service_VRC implements IServiceInterface {
  get #state() {
    return window.API.state.services.vrc.data;
  }

  async init() {
    if (window.platform === "web" || window.mode === "client") {
      return;
    }
    window.API.pubsub.subscribeText(TextEventSource.stt, (value) => {
      if (!this.#state.sendStt) return;
      if (value.type === TextEventType.final) {
        this.#sendText(value.value);
        this.#state.indicator && this.#sendIndicator(false);
      } else {
        // this.state.interim && this.#sendTextThrottled(value.value);
        this.#state.indicator && this.#sendIndicatorThrottled(true);
      }
    });
    window.API.pubsub.subscribeText(TextEventSource.textfield, (value) => {
      if (!this.#state.sendText) return;
      if (value.type === TextEventType.final) {
        this.#sendText(value.value, true);
        this.#state.indicator && this.#sendIndicator(false);
      } else {
        // this.state.interim && this.#sendTextThrottled(value.value);
        this.#state.indicator && this.#sendIndicatorThrottled(true);
      }
    });
    // this.eventsSubs.push(window.API.pubsub.subscribe("twitch.chat.mymessage", (value) => {
    //   if (this.bFromChat){
    //     this.SendText(value as string);
    //     this.bShowIndicator && this.SendIndicator(false);
    //   }
    // }));
  }
  sendTest(value: string): void {
    this.#sendText(value, true);
  }

  #sendTextThrottled = throttle(this.#sendText, 800);
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
