import { IServiceInterface, ServiceNetworkState, TextEvent, TextEventSource, TextEventType } from "@/types";
import { patchSentence } from "@/utils";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { STT_Backends } from "./schema";
import { STT_AzureService } from "./services/azure";
import { STT_DeepgramService } from "./services/deepgram";
import { STT_NativeService } from "./services/native";
import { STT_SpeechlyService } from "./services/speechly";
import {
  ISTTReceiver,
  ISTTServiceConstructor,
  ISpeechRecognitionService,
  SttMuteState
} from "./types";

const backends: {
  [k in STT_Backends]?: ISTTServiceConstructor;
} = {
  [STT_Backends.native]: STT_NativeService,
  [STT_Backends.browser]: undefined,
  [STT_Backends.azure]: STT_AzureService,
  [STT_Backends.deepgram]: STT_DeepgramService,
  [STT_Backends.speechly]: STT_SpeechlyService
};

class Service_STT implements IServiceInterface, ISTTReceiver {
  #serviceInstance?: ISpeechRecognitionService;

  #lastMessageState = {
    value: "",
    isInterim: false
  }
  updateLastMessage(value: string, isInterim: boolean) {
    this.#lastMessageState = {value, isInterim};
  }

  serviceState = proxy({
    status: ServiceNetworkState.disconnected,
    error: "",
    muted: SttMuteState.unmuted
  });

  isMuted() {
    return this.serviceState.muted === SttMuteState.muted || this.serviceState.muted === SttMuteState.pendingUnmute;
  }

  get data() {
    return window.ApiServer.state.services.stt.data;
  }

  stop(): void {
    this.#serviceInstance?.stop();
    this.tryCancelSentence();
  }

  toggleMute() {
    if (this.serviceState.muted === SttMuteState.unmuted) {
      // cancel mid sentence and notify user
      this.tryCancelSentence();
      this.serviceState.muted = SttMuteState.muted;
    }
    else if (this.serviceState.muted === SttMuteState.muted){
      // set pending if unmuting during interim results
      if (this.#lastMessageState.isInterim) {
        this.serviceState.muted = SttMuteState.pendingUnmute;
      }
      else {
        this.serviceState.muted = SttMuteState.unmuted;
      }
    }
    else 
      this.serviceState.muted = SttMuteState.unmuted;
  }

  triggerPendingUnmute() {
    // apply unmute if pending
    if (this.serviceState.muted === SttMuteState.pendingUnmute) {
      this.serviceState.muted = SttMuteState.unmuted;
    }
  }

  async init() {
    // native is bugged
    if (this.data.autoStart && this.data.backend !== STT_Backends.native)
      this.start();
  }

  tryCancelSentence() {
    if (this.#lastMessageState.isInterim) {
      this.#sendFinal("[...]");
      this.updateLastMessage("", false);
    }
  }

  processExternalMessage(event: Partial<TextEvent>) {
    if (!("type" in event) || !event.value)
      return;
    if (event.type === TextEventType.final)
      this.#sendFinal(event.value);
    else
      this.#sendInterim(event.value);
  }

  async #sendFinal(sentence: string) {
    const value = patchSentence(this.data.replaceWords, sentence);    
    !this.isMuted() &&
    window.ApiShared.pubsub.publishText(TextEventSource.stt, {
      value,
      type: TextEventType.final,
    });

    this.updateLastMessage(value, false);

    // apply unmute if pending
    this.triggerPendingUnmute();
  }

  #sendInterim(value: string) {
    !this.isMuted() &&
    window.ApiShared.pubsub.publishText(TextEventSource.stt, {
      value,
      type: TextEventType.interim,
    });
    this.updateLastMessage(value, true);
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
    this.#setStatus(ServiceNetworkState.disconnected);
  }
  onInterim(value: string): void {
    this.#sendInterim(value);
  }
  onFinal(value: string): void {
    this.#sendFinal(value);
  }

  start() {
    this.stop();
    this.serviceState.error = "";

    let backend = this.data.backend;
    if (!(backend in backends) || !backends[backend]) {
      return;
    }

    const serviceConstructor = backends[backend];
    if (!serviceConstructor)
      return;
    this.#serviceInstance = new serviceConstructor(this);
    this.#setStatus(ServiceNetworkState.connecting);
    this.#serviceInstance.start(this.data);
  }
}

export default Service_STT;
