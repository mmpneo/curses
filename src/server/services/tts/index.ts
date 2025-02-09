import { IServiceInterface, ServiceNetworkState, TextEventType } from "@/types";
import { WordReplacementsCache, buildWordReplacementsCache, serviceSubscibeToInput, serviceSubscibeToSource } from "@/utils";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { subscribeKey } from "valtio/utils";
import { TTS_Backends } from "./schema";
import { TTS_AzureService } from "./services/azure";
import { TTS_NativeService } from "./services/native";
import { TTS_TikTokService } from "./services/tiktok";
import { TTS_WindowsService } from "./services/windows";
import { TTS_UberduckService } from "./services/uberduck";
import { TTS_PiperService } from "./services/piper";
import { TTS_CustomService } from "./services/custom";
import {
  ITTSReceiver,
  ITTSService,
  ITTSServiceConstructor
} from "./types";

const backends: {
  [k in TTS_Backends]: ITTSServiceConstructor;
} = {
  [TTS_Backends.native]: TTS_NativeService,
  [TTS_Backends.windows]: TTS_WindowsService,
  [TTS_Backends.azure]: TTS_AzureService,
  [TTS_Backends.tiktok]: TTS_TikTokService,
  [TTS_Backends.uberduck]: TTS_UberduckService,
  [TTS_Backends.piper]: TTS_PiperService,
  [TTS_Backends.custom]: TTS_CustomService,
};

class Service_TTS implements IServiceInterface, ITTSReceiver {
  #serviceInstance?: ITTSService;

  serviceState = proxy({
    status: ServiceNetworkState.disconnected,
    error: ""
  });

  #_wordReplacementsCache!: WordReplacementsCache;

  get data() {
    return window.ApiServer.state.services.tts.data;
  }

  updateReplacementsCache() {
    this.#_wordReplacementsCache = buildWordReplacementsCache(this.data.replaceWords, this.data.replaceWordsIgnoreCase);
  }

  runReplacements(value: string) {
    if (this.#_wordReplacementsCache.isEmpty)
      return value;
    return value.replace(this.#_wordReplacementsCache.regexp, v => {
      const _v = this.data.replaceWordsIgnoreCase ? v.toLowerCase() : v;
      return this.#_wordReplacementsCache.map[_v];
    }).replace(/[<>]/gi, ""); // clear ssml tags
  }

  async init() {
    this.updateReplacementsCache();
    subscribeKey(this.data, "replaceWords", () => this.updateReplacementsCache());
    subscribeKey(this.data, "replaceWordsIgnoreCase", () => this.updateReplacementsCache());

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
    
    window.ApiShared.pubsub.subscribe("stream.on_ended", () => {
      if (this.data.stopWithStream && this.serviceState.status === ServiceNetworkState.connected) {
        this.stop();
      }
    });
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
    const patchedValue = this.runReplacements(value);
    if (!patchedValue)
      return;
    this.#serviceInstance?.play(patchedValue);
  }

  start() {
    this.stop();
    this.serviceState.error = "";
    let backend = this.data.backend;
    if (backend in backends) {
      this.#serviceInstance = new backends[backend](this);
      this.#setStatus(ServiceNetworkState.connecting);
      this.#serviceInstance.start(this.data);
    }
  }
}

export default Service_TTS;
