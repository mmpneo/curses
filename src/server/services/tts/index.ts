import { IServiceInterface, ServiceNetworkState, TextEventType } from "@/types";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { patchSentence, serviceSubscibeToInput, serviceSubscibeToSource } from "../../../utils";
import { TTS_Backends } from "./schema";
import { TTS_AzureService } from "./services/azure";
import { TTS_NativeService } from "./services/native";
import { TTS_TikTokService } from "./services/tiktok";
import { TTS_WindowsService } from "./services/windows";
import {
  ISTTServiceConstructor,
  ITTSReceiver,
  ITTSService
} from "./types";

const backends: {
  [k in TTS_Backends]: ISTTServiceConstructor;
} = {
  [TTS_Backends.native]: TTS_NativeService,
  [TTS_Backends.windows]: TTS_WindowsService,
  [TTS_Backends.azure]: TTS_AzureService,
  [TTS_Backends.tiktok]: TTS_TikTokService,
};

class Service_TTS implements IServiceInterface, ITTSReceiver {
  #serviceInstance?: ITTSService;

  serviceState = proxy({
    status: ServiceNetworkState.disconnected,
    error: ""
  });

  get data() {
    return window.ApiServer.state.services.tts.data;
  }

  async init() {
    serviceSubscibeToSource(this.data, "source", data => {
      if (data?.type === TextEventType.final)
        this.play(data.value);
    });

    serviceSubscibeToInput(this.data, "inputField", data => {
      if (data?.type === TextEventType.final)
        this.play(data.value);
    });

    if (this.data.autoStart)
      this.start();
  }  

  stop(): void {
    this.#serviceInstance?.stop();
    this.#serviceInstance = undefined;
  }

  #setStatus(value: ServiceNetworkState) {
    this.serviceState.status = value;
  }

  onStart(): void {
    this.#setStatus(ServiceNetworkState.connected);
  }
  onStop(error?: string | undefined): void {
    if (error) {
      toast(error, { type: "error", autoClose: false });
      this.serviceState.error = error;
    }
    this.#serviceInstance = undefined;
    this.#setStatus(ServiceNetworkState.disconnected);
  }
  onFilePlayRequest(data: ArrayBuffer, options?: Record<string, any> | undefined): void {
  }

  play(value: string) {
    const patchedValue = patchSentence(this.data.replaceWords, value).replace(/[<>]/gi, "");
    if (!patchedValue)
      return;
    this.#serviceInstance?.play(patchedValue);
  }

  start() {
    this.stop();
    this.serviceState.error = "";

    let backend = this.data.backend;
    if (!(backend in backends)) {
      return;
    }
    this.#serviceInstance = new backends[backend](this);
    this.#setStatus(ServiceNetworkState.connecting);
    this.#serviceInstance.start(this.data);
  }
}

export default Service_TTS;
