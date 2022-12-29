import { STT_State } from "../schema";
import {ISpeechRecognitionService, SpeechServiceEventBindings} from "../types";

export const browserDefaultParams = {
  lang: "en-US",
  langGroup: "English",
  interim: true
}

export class STT_BrowserService implements ISpeechRecognitionService{
  constructor(private bindings: SpeechServiceEventBindings) {
    const sp = ((<any>window).webkitSpeechRecognition) || ((<any>window).SpeechRecognition);
    this.#instance = new sp();
    this.#instance.addEventListener("start", () => this.bindings.onStart());
    this.#instance.onresult = (event: any) => this.#processResults(event);
    window.addEventListener("beforeunload", () => { // temp fix for edge freezing on page reload
      this.#instance?.stop();
    });
    this.#instance.addEventListener("error", (error: any) => { // listener for active connection
      this.bindings.onStop(error.error);
    })
  }
  
  #instance: any;

  dispose(): void {
  }

  #processResults = (event: any) => {
    let interim_transcript = '';
    let final_transcript   = '';
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        final_transcript += event.results[i][0].transcript;
        this.bindings.onFinal(final_transcript);
      }
      else {
        interim_transcript += event.results[i][0].transcript;
        this.bindings.onInterim(interim_transcript);
      }
    }
  }

  start(params: STT_State): void {
    return this.bindings.onStop();
    this.#instance.lang           = "en-US";
    this.#instance.continuous     = true;
    this.#instance.interimResults = true;

    

    this.#instance.onend = (e: any) => {
      setTimeout(() => this.#instance.start(), 1000);
      console.log(`[Native] Restart`, e);
    } // auto restart after silence
    this.#instance.start();
  }

  stop(): void {
    this.#instance.onend = null;
    this.#instance?.stop?.()
    this.bindings.onStop();
  }

}
