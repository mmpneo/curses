import { TTS_State } from "../schema";
import { ITTSReceiver, ITTSService } from "../types";

export class TTS_NativeService implements ITTSService {
  constructor(private bindings: ITTSReceiver) {}
  #instance?: SpeechSynthesisUtterance;

  dispose(): void {}

  async start(state: TTS_State) {
    try {
      if (!this.state.voice)
        return this.bindings.onStop("Options missing");

      let voices = window.speechSynthesis.getVoices();
      if (!voices.length) {
        // wait for voices
        await new Promise(res => window.speechSynthesis.onvoiceschanged = res)
      }

      voices = window.speechSynthesis.getVoices();
      let voice = voices.find(voice => voice.voiceURI === this.state.voice);

      if (!voice) {
        this.bindings.onStop("Invalid voice");
        return;
      }

      this.#instance = new SpeechSynthesisUtterance();

      this.#instance.voice = voice;
      this.#instance.volume = 1;

      this.bindings.onStart();
    } catch (error) {}
  }

  get state() {
    return window.ApiServer.state.services.tts.data.native;
  }
  play(value: string): void {
    if (!this.#instance)
      return;
    this.#instance.text = value;
    this.#instance.pitch = parseFloat(this.state.pitch) ?? 1;
    this.#instance.rate = parseFloat(this.state.rate) ?? 1;
    this.#instance.volume = parseFloat(this.state.volume) ?? 1;
    window.speechSynthesis.speak(this.#instance);
  }
  stop(): void {
    this.bindings.onStop();
  }
}
