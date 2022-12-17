import { toast } from "react-toastify";
import { proxy } from "valtio";
import { subscribeKey } from "valtio/utils";
import { IServiceInterface, TextEventSource, TextEventType } from "../../types";
import { TTS_Backends } from "./schema";
import { TTS_AzureService } from "./services/azure";
import { TTS_WindowsService } from "./services/windows";
import {
  ITTSService,
  ServiceNetworkState,
  TTSServiceEventBindings,
} from "./types";

class Service_TTS implements IServiceInterface {
  #serviceInstance?: ITTSService;

  #sourceSubKey?: string;

  serviceState = proxy({
    status: ServiceNetworkState.disconnected,
  });

  #subscribeToTextEvent(v: TextEventSource) {
    this.#sourceSubKey && window.API.pubsub.unsubscribe(this.#sourceSubKey);
    this.#sourceSubKey = window.API.pubsub.subscribeText(v, (data) => {
      if (data && data.type === TextEventType.final) {
        this.#serviceInstance?.play(data.value);
      }
    });
  }

  async init() {
    subscribeKey(window.API.state.services.tts.data, "source", (v) => {
      console.log("changed");
      this.#subscribeToTextEvent(v);
    });
    window.API.state.services.tts.data.source &&
      this.#subscribeToTextEvent(window.API.state.services.tts.data.source);
  }

  get data() {
    return window.API.state.services.tts;
  }

  stop(): void {
    this.#serviceInstance?.stop();
    this.#serviceInstance = undefined;
  }

  #setStatus(value: ServiceNetworkState) {
    this.serviceState.status = value;
  }

  start() {
    this.stop();

    let bindings: TTSServiceEventBindings = {
      onStart: () => this.#setStatus(ServiceNetworkState.connected),
      onStop: (error?: string) => {
        if (error) toast(error, { type: "error" });
        return this.#setStatus(
          error ? ServiceNetworkState.error : ServiceNetworkState.disconnected
        );
      },
    };

    let backend = this.data.data.backend;
    if (backend === TTS_Backends.windows) {
      this.#serviceInstance = new TTS_WindowsService(bindings);
    }
    if (backend === TTS_Backends.azure) {
      this.#serviceInstance = new TTS_AzureService(bindings);
    }

    if (!this.#serviceInstance) return;
    this.#setStatus(ServiceNetworkState.connecting);
    this.#serviceInstance.start(this.data.data);
  }
}

export default Service_TTS;
