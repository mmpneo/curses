import { decodeB64toArrayBuffer, isEmptyValue } from "../../../utils";
import { TTS_State } from "../schema";
import { ITTSService, TTSServiceEventBindings } from "../types";

export class TTS_TikTokService implements ITTSService {
  constructor(private bindings: TTSServiceEventBindings) {}

  #audioQueue: ArrayBuffer[] = [];
  #isPlaying = false;

  dispose(): void {}

  get state() {
    return window.API.state.services.tts.data.tiktok;
  }

  async #tryDequeueAndPlay() {
    if (this.#isPlaying) return;

    const clip = this.#audioQueue.shift();
    if (!clip) return;

    this.#isPlaying = true;

    await window.APIFrontend.sound.playSoundAsync(clip, this.state.device);
    this.#isPlaying = false;
    this.#tryDequeueAndPlay();
  }

  start(state: TTS_State): void {
    if (Object.values(this.state).some(isEmptyValue))
      return this.bindings.onStop("Options missing");
    this.bindings.onStart();
  }
  async play(value: string) {
    const response = await fetch("https://tiktok-tts.weilnet.workers.dev/api/generation", {
      method: 'POST',
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json'
      },
      referrerPolicy: 'no-referrer',
      body: JSON.stringify({
        text: value,
        voice: this.state.voice
      })
    });

    let data = await response.json();
    if (data?.success === true) {
      this.#audioQueue.push(decodeB64toArrayBuffer(data.data));
      this.#tryDequeueAndPlay();
    }
  }
  stop(): void {
    this.bindings.onStop();
  }
}
