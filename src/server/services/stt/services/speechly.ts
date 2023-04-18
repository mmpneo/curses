import {
  ISTTReceiver,
  ISTTService
} from "../types";

import { BrowserClient, BrowserMicrophone, Segment } from "@speechly/browser-client";
import { isEmptyValue } from "../../../../utils";
import { STT_State } from "../schema";

export class STT_SpeechlyService implements ISTTService {
  constructor(private bindings: ISTTReceiver) {}

  #microphone?: BrowserMicrophone;
  #instance?: BrowserClient;
  #initialized?: boolean;
  #connectTimeout?: NodeJS.Timeout;

  dispose(): void {}

  get state() {
    return window.ApiServer.state.services.stt.data.speechly
  }

  async start(state: STT_State) {
    // ignore device for now
    if (Object.values(state.speechly).some(isEmptyValue))
      return this.bindings.onStop("Options missing");

    this.#instance = new BrowserClient({
      appId: state.speechly.key,
      vad: { enabled: true, noiseGateDb: -24.0 },
    });

    // timeout
    this.#connectTimeout = setTimeout(() => {
      this.bindings.onStop("connection timeout");
    }, 6000);

    this.#instance.onStart(_ => {
      clearTimeout(this.#connectTimeout);
      if (this.#initialized)
        return;
      this.bindings.onStart();
      this.#initialized = true;
    });

    this.#microphone = new BrowserMicrophone();

    await this.#microphone.initialize();
    
    // intercept into speechly's mediaStream initialization
    this.#microphone.mediaStream?.getAudioTracks().forEach(t => t.stop());
    this.#microphone.mediaStream = await navigator.mediaDevices.getUserMedia({audio: {deviceId: {exact: this.state.device}}});

    if (!this.#microphone.mediaStream)
      return this.bindings.onStop("Error initialising");
    await this.#instance.attach(this.#microphone.mediaStream);

    this.#instance.onSegmentChange((segment: Segment) => {
      let transcript = segment.words
          .map(w => w.value.toLowerCase())
          .join(" ").trim();
      if (segment.isFinal)
        transcript += ".";

      if (!transcript)
        return;
      if (!segment.isFinal)
        this.bindings.onInterim(transcript);
      else
        this.bindings.onFinal(transcript)
    });
  }

  stop(): void {
    this.#microphone?.close();
    this.#instance?.close();
    this.bindings.onStop()
  }
}
