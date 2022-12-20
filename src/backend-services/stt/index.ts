import { toast } from "react-toastify";
import { proxy } from "valtio";
import { IServiceInterface, TextEventSource, TextEventType } from "../../types";
import { STT_AzureService } from "./services/azure";
import { STT_BrowserService } from "./services/browser";
import { STT_DeepgramService } from "./services/deepgram";
import { STT_Backends } from "./schema";
import {
  ISpeechRecognitionService,
  SpeechServiceEventBindings,
  ServiceNetworkState,
} from "./types";

class Service_STT implements IServiceInterface {
  async init() {}

  serviceState = proxy({
    status: ServiceNetworkState.disconnected,
    muted: false
  });

  get data() {
    return window.API.state.services.stt;
  }

  stop(): void {
    if (this.#serviceInstance) this.#serviceInstance.stop();
  }

  #sendFinal(value: string) {
    !this.serviceState.muted &&
    window.API.pubsub.publishText(TextEventSource.stt, {
      value,
      type: TextEventType.final,
    });
  }

  #sendInterim(value: string) {
    !this.serviceState.muted &&
    window.API.pubsub.publishText(TextEventSource.stt, {
      value,
      type: TextEventType.interim,
    });
  }

  #setStatus(value: ServiceNetworkState) {
    this.serviceState.status = value;
  }

  #serviceInstance?: ISpeechRecognitionService;

  start() {
    this.stop();

    let bindings: SpeechServiceEventBindings = {
      onStart: () => this.#setStatus(ServiceNetworkState.connected),
      onStop: (error?: string) => {
        if (error) toast(error, { type: "error" });
        return this.#setStatus(
          error ? ServiceNetworkState.error : ServiceNetworkState.disconnected
        );
      },
      onInterim: (interim: string) => this.#sendInterim(interim),
      onFinal: (final: string) => this.#sendFinal(final),
    };

    let backend = this.data.data.backend;
    if (backend === STT_Backends.browser) {
      this.#serviceInstance = new STT_BrowserService(bindings);
    }
    if (backend === STT_Backends.azure) {
      this.#serviceInstance = new STT_AzureService(bindings);
    }
    if (backend === STT_Backends.deepgram) {
      this.#serviceInstance = new STT_DeepgramService(bindings);
    }

    if (!this.#serviceInstance) return;
    this.#setStatus(ServiceNetworkState.connecting);
    this.#serviceInstance.start(this.data.data);
  }
}

export default Service_STT;
