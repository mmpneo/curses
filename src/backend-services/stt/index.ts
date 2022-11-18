import { toast } from "react-toastify";
import { proxy } from "valtio";
import { IServiceInterface, TextEventSource, TextEventType } from "../../types";
import { STT_AzureService } from "./impls/azure";
import { STT_BrowserService } from "./impls/browser";
import { STT_DeepgramService } from "./impls/deepgram";
import { STT_Backends } from "./schema";
import {
  ISpeechRecognitionService,
  SpeechServiceEventBindings,
  SpeechServiceState,
} from "./types";

class Service_STT implements IServiceInterface {
  init(): void {}

  serviceState = proxy({
    status: SpeechServiceState.disconnected,
  });

  get data() {
    return window.API.state.services.stt;
  }

  stop(): void {
    if (this.#serviceInstance)
      this.#serviceInstance.stop();
  }

  #sendFinal(value: string) {
    window.API.pubsub.publishText(TextEventSource.stt, {
      value,
      type: TextEventType.final,
    });
  }

  #sendInterim(value: string) {
    window.API.pubsub.publishText(TextEventSource.stt, {
      value,
      type: TextEventType.interim,
    });
  }

  #setStatus(value: SpeechServiceState) {
    this.serviceState.status = value;
  }

  #serviceInstance?: ISpeechRecognitionService;

  start() {
    this.stop();

    let bindings: SpeechServiceEventBindings = {
      onStart: () => this.#setStatus(SpeechServiceState.connected),
      onStop: (error?: string) => {
        if (error)
          toast(error, {type: 'error'})
        return this.#setStatus(error ? SpeechServiceState.error : SpeechServiceState.disconnected);
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
    this.#setStatus(SpeechServiceState.connecting);
    this.#serviceInstance.start(this.data.data);
  }
}

export default Service_STT;
