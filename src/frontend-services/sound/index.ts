import { proxy } from "valtio";
import { IServiceInterface } from "../../types";

type SoundEffects = {
  volume?: number;
  playbackMin?: number;
  playbackMax?: number;
  detuneMin?: number;
  detuneMax?: number;
}

class Service_Sound implements IServiceInterface {
  constructor() {
    this.audioContext = new AudioContext();
  }
  async init() {

  }
  public state = proxy({
    micMuted: false,
    soundMuted: false,
  });
  private audioContext!: AudioContext;

  async playUniqueBuffer(buffer: ArrayBuffer) {
    if (this.state.soundMuted) return;
    return new Promise(async (res, rej) => {
      try {
        const audio = await this.audioContext.decodeAudioData(buffer);
        const source = this.audioContext.createBufferSource();
        source.buffer = audio;
        source.connect(this.audioContext.destination);
        source.start();
        ``;
        source.onended = res;
      } catch (error) {
        rej(error);
      }
    });
  }

  #audioFiles: { [fileId: string]: AudioBuffer } = {};

  private random = (min: number, max: number) =>
    Math.random() * (max - min) + min;
  async playFromFile(fileId: string, effects?: SoundEffects) {
    if (this.state.soundMuted) return;
    if (!this.#audioFiles[fileId]) {
      const buffer = window.APIFrontend.files.getFileBuffer(fileId);
      if (!buffer) return;
      try {
        this.#audioFiles[fileId] = await this.audioContext.decodeAudioData(
          buffer.buffer.slice(0)
        );
      } catch (error) {
        return;
      }
    }

    const source = this.audioContext.createBufferSource();

    source.buffer = this.#audioFiles[fileId];

    const gainNode = this.audioContext.createGain();
    gainNode.gain.value = effects?.volume || 1; // 10 %
    gainNode.connect(this.audioContext.destination);

    source.connect(gainNode);

    // region effects
    // -1200 1200
    if (effects?.detuneMin || effects?.detuneMax) {
      source.detune.value = this.random(
        Math.max(-1200, effects.detuneMin ?? 0),
        Math.min(1200, effects.detuneMax ?? 0)
      );
    }
    if (effects?.playbackMin || effects?.playbackMax) {
      source.playbackRate.value = this.random(
        Math.max(0.1, effects.playbackMin ?? 1),
        Math.min(3, effects.playbackMax ?? 1)
      );
    }
    // endregion

    source.start();
  }
}

export default Service_Sound;
