import {
  ISpeechRecognitionService,
  SpeechServiceEventBindings,
} from "../types";

import { isEmptyValue } from "../../../utils";
import { STT_State } from "../schema";
import { BrowserClient, BrowserMicrophone, Segment } from "@speechly/browser-client";

export class STT_SpeechlyService implements ISpeechRecognitionService {
  constructor(private bindings: SpeechServiceEventBindings) {}
  
  #microphone?: BrowserMicrophone;
  #instance?: BrowserClient;
  #initialized?: boolean;
  
  dispose(): void {}

  async start(state: STT_State) {
    // ignore device for now
    if (Object.values(state.speechly).some(isEmptyValue))
      return this.bindings.onStop("Options missing");

    this.#instance = new BrowserClient({
      appId: state.speechly.key,
      vad: { enabled: true, noiseGateDb: -24.0 },
    });

    this.#instance.onStart(_ => {
      if (this.#initialized)
        return;
      this.bindings.onStart();
      this.#initialized = true;
    });

    this.#microphone = new BrowserMicrophone();
    await this.#microphone.initialize();
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
