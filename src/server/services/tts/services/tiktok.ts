import { decodeB64toArrayBuffer, isEmptyValue } from "../../../../utils";
import { TTS_State } from "../schema";
import { ITTSReceiver, ITTSService } from "../types";

export class TTS_TikTokService implements ITTSService {
  constructor(private bindings: ITTSReceiver) {}

  dispose(): void {}

  get state() {
    return window.ApiServer.state.services.tts.data.tiktok;
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
      window.ApiServer.sound.enqueueVoiceClip(decodeB64toArrayBuffer(data.data), {
        volume: parseFloat(this.state.volume) ?? 1,
        rate: parseFloat(this.state.rate) ?? 1,
        device_name: this.state.device
      });
    }
  }
  stop(): void {
    this.bindings.onStop();
  }
}
