import { toast } from "react-toastify";
import { proxy } from "valtio";
import { IServiceInterface, ServiceNetworkState, TextEventType } from "../../types";
import { serviceSubscibeToInput, serviceSubscibeToSource } from "../../utils";
import { TTS_Backends } from "./schema";
import { TTS_AzureService } from "./services/azure";
import { TTS_WindowsService } from "./services/windows";
import {
  ITTSService,
  TTSServiceEventBindings
} from "./types";

class Service_TTS implements IServiceInterface {
  #serviceInstance?: ITTSService;

  serviceState = proxy({
    status: ServiceNetworkState.disconnected,
    error: ""
  });

  async init() {
    serviceSubscibeToSource(window.API.state.services.tts.data, "source", data => {
      if (data?.type === TextEventType.final)
        this.play(data.value);
    });

    serviceSubscibeToInput(window.API.state.services.tts.data, "inputField", data => {
      if (data?.type === TextEventType.final)
        this.play(data.value);
    });

    if (this.data.autoStart)
      this.start();
  }

  get data() {
    return window.API.state.services.tts.data;
  }

  
  stop(): void {
    this.#serviceInstance?.stop();
    this.#serviceInstance = undefined;
  }
  
  #setStatus(value: ServiceNetworkState) {
    this.serviceState.status = value;
  }
  
  #replaceWords(sentence: string): string {
    return sentence
    .split(" ")
    .map(word => {
      const cleared = word.replace(/([.,\/#!$%\^&\*;:{}=\-_`~()\]\[])+$/g, "");
      return this.data.replaceWords[cleared] ? word.replace(cleared, this.data.replaceWords[cleared]) : word;
    })
    .join(" ")
  }

  play(value: string) {
    this.#serviceInstance?.play(this.#replaceWords(value));
  }

  start() {
    this.stop();
    this.serviceState.error = "";

    let bindings: TTSServiceEventBindings = {
      onStart: () => this.#setStatus(ServiceNetworkState.connected),
      onStop: (error?: string) => {
        if (error) {
          toast(error, { type: "error", autoClose: false });
          this.serviceState.error = error;
        }
        this.#serviceInstance = undefined;
        this.#setStatus(ServiceNetworkState.disconnected);
      },
    };

    let backend = this.data.backend;
    if (backend === TTS_Backends.windows) {
      this.#serviceInstance = new TTS_WindowsService(bindings);
    }
    if (backend === TTS_Backends.azure) {
      this.#serviceInstance = new TTS_AzureService(bindings);
    }

    if (!this.#serviceInstance) return;
    this.#setStatus(ServiceNetworkState.connecting);
    this.#serviceInstance.start(this.data);
  }
}

export default Service_TTS;
