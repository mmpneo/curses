import {invoke}            from "@tauri-apps/api/tauri";
import {proxy}             from "valtio";
import {IServiceInterface} from "@/types";

type SoundEffects = {
  volume?: number;
  playbackMin?: number;
  playbackMax?: number;
  detuneMin?: number;
  detuneMax?: number;
};

type VoiceClipOptions = {
  device_name: string;
  volume: number; // 1 - base
  rate: number; // 1 - base
};

class Service_Sound implements IServiceInterface {
  constructor() {
  }

  private audioContext!: AudioContext;

  async init() {
    this.audioContext = new AudioContext();
  }

  public serviceState = proxy({
    muted: false,
  });


  #voiceClipQueue: { data: ArrayBuffer; options: VoiceClipOptions }[] = [];

  #isVoiceClipPlaying = false;

  async #tryDequeueVoiceClip() {
    if (this.#isVoiceClipPlaying) return;

    const clip = this.#voiceClipQueue.shift();
    // empty queue
    if (!clip) return;

    this.#isVoiceClipPlaying = true;

    try {
      await invoke<any>("plugin:audio|play_async", {
        data: {
          data: Array.from(new Uint8Array(clip.data)),
          ...clip.options,
          speed: 1
        },
      });
    } catch (error) {
      // 
    } finally {
      this.#isVoiceClipPlaying = false;
      this.#tryDequeueVoiceClip();
    }
  }

  enqueueVoiceClip(buffer: ArrayBuffer, options: VoiceClipOptions) {
    if (!buffer)
      return;
    this.#voiceClipQueue.push({data: buffer, options});
    this.#tryDequeueVoiceClip();
  }

  private random = (min: number, max: number) =>
    Math.random() * (max - min) + min;
}

export default Service_Sound;
