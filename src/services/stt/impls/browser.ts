import { STT_State } from "../schema";
import {ISpeechRecognitionService} from "../types";

export const browserDefaultParams = {
  lang: "en-US",
  langGroup: "English",
  interim: true
}

export class BrowserSpeechRecognitionService implements ISpeechRecognitionService{
  constructor(
    private onStart: () => void,
    private onStop: (reason?: string) => void,
    private onInterim: (value: string) => void,
    private onFinal: (value: string) => void,
) {
    const sp = ((<any>window).webkitSpeechRecognition) || ((<any>window).SpeechRecognition);
    this.#instance = new sp();
    this.#instance.addEventListener("start", () => this.onStart());
    this.#instance.onresult = (event: any) => this.#processResults(event);
    window.addEventListener("beforeunload", () => { // temp fix for edge freezing on page reload
      this.#instance?.stop();
    });
    this.#instance.addEventListener("error", (error: any) => { // listener for active connection
      this.onStop(error.error);
    })
  }
  // speechrecognition instance
  
  #instance: any;

  dispose(): void {
  }

  #processResults = (event: any) => {
    let interim_transcript = '';
    let final_transcript   = '';
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        final_transcript += event.results[i][0].transcript;
        this.onFinal(final_transcript);
      }
      else {
        interim_transcript += event.results[i][0].transcript;
        this.onInterim(interim_transcript);
      }
    }
  }

  start(params: STT_State): void {
    this.#instance.lang           = params.lang_name;
    this.#instance.continuous     = true;
    this.#instance.interimResults = params.interim;

    this.#instance.onend = () => {
      setTimeout(() => this.#instance.start(), 1000);
      console.log(`[Native] Restart`);
    } // auto restart after silence
    this.#instance.start();
  }

  stop(): void {
    this.#instance.onend = null;
    this.#instance?.stop?.()
    this.onStop();
  }

}
