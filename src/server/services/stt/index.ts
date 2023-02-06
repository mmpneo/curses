import { toast } from "react-toastify";
import { proxy }                                                                  from "valtio";
import { IServiceInterface, ServiceNetworkState, TextEventSource, TextEventType } from "@/types";
import { STT_AzureService }                                                       from "./services/azure";
import { STT_BrowserService }                                                     from "./services/browser";
import { STT_DeepgramService }                                                    from "./services/deepgram";
import { STT_Backends }                                                           from "./schema";
import {
  ISpeechRecognitionService,
  SpeechServiceEventBindings
}                                                                                 from "./types";
import { STT_SpeechlyService }                                                    from "./services/speechly";

class Service_STT implements IServiceInterface {
  #serviceInstance?: ISpeechRecognitionService;

  serviceState = proxy({
    status: ServiceNetworkState.disconnected,
    error: "",
    muted: false
  });

  async init() {
    if (this.data.autoStart)
      this.start();
  }


  get data() {
    return window.ApiServer.state.services.stt.data;
  }

  stop(): void {
    this.#serviceInstance?.stop();
  }

  async #sendFinal(value: string) {
    !this.serviceState.muted &&
    window.ApiShared.pubsub.publishText(TextEventSource.stt, {
      value,
      type: TextEventType.final,
    });
  }

  #sendInterim(value: string) {
    !this.serviceState.muted &&
    window.ApiShared.pubsub.publishText(TextEventSource.stt, {
      value,
      type: TextEventType.interim,
    });
  }

  #setStatus(value: ServiceNetworkState) {
    this.serviceState.status = value;
  }

  start() {
    this.stop();
    this.serviceState.error = "";

    let bindings: SpeechServiceEventBindings = {
      onStart: () => this.#setStatus(ServiceNetworkState.connected),
      onStop: (error?: string) => {
        if (error) {
          toast(error, { type: "error", autoClose: false });
          this.serviceState.error = error;
        }
        return this.#setStatus(ServiceNetworkState.disconnected);
      },
      onInterim: (interim: string) => this.#sendInterim(interim),
      onFinal: (final: string) => this.#sendFinal(final),
    };

    let backend = this.data.backend;
    if (backend === STT_Backends.browser) {
      this.#serviceInstance = new STT_BrowserService(bindings);
    }
    else if (backend === STT_Backends.azure) {
      this.#serviceInstance = new STT_AzureService(bindings);
    }
    else if (backend === STT_Backends.deepgram) {
      this.#serviceInstance = new STT_DeepgramService(bindings);
    }
    else if (backend === STT_Backends.speechly) {
      this.#serviceInstance = new STT_SpeechlyService(bindings);
    }

    if (!this.#serviceInstance) return;
    this.#setStatus(ServiceNetworkState.connecting);
    this.#serviceInstance.start(this.data);
  }
}

export default Service_STT;
