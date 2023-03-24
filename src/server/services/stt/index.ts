import { toast } from "react-toastify";
import { proxy }                                                                  from "valtio";
import { IServiceInterface, ServiceNetworkState, TextEventSource, TextEventType } from "@/types";
import { STT_AzureService }                                                       from "./services/azure";
import { STT_NativeService }                                                     from "./services/native";
import { STT_DeepgramService }                                                    from "./services/deepgram";
import { STT_Backends }                                                           from "./schema";
import {
  ISpeechRecognitionService,
  SpeechServiceEventBindings,
  SttMuteState
}                                                                                 from "./types";
import { STT_SpeechlyService }                                                    from "./services/speechly";

class Service_STT implements IServiceInterface {
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
    if (this.data.autoStart)
      this.start();
  }

  tryCancelSentence() {
    if (this.#lastMessageState.isInterim) {
      this.#sendFinal("[...]");
      this.updateLastMessage("", false);
    }
  }

  async #sendFinal(value: string) {
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
    if (backend === STT_Backends.native) {
      this.#serviceInstance = new STT_NativeService(bindings);
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
