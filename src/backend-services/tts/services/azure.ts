import {
  SpeechConfig,
  SpeechSynthesisOutputFormat,
  SpeechSynthesizer
} from "microsoft-cognitiveservices-speech-sdk";
import { isEmptyValue } from "../../../utils";
import { TTS_State } from "../schema";
import { ITTSService, TTSServiceEventBindings } from "../types";

export class TTS_AzureService implements ITTSService {
  constructor(private bindings: TTSServiceEventBindings) {}

  dispose(): void {}

  #instance?: SpeechSynthesizer;
  #audioQueue: ArrayBuffer[] = [];
  #isPlaying = false;

  start(state: TTS_State): void {
    if (Object.values(state.azure).some(isEmptyValue)) return this.bindings.onStop("Options missing");

    try {
      // const audioConfig                     = AudioConfig.fromSpeakerOutput(p);
      const speechConfig = SpeechConfig.fromSubscription(
        state.azure.key,
        state.azure.location
      );
      speechConfig.speechSynthesisLanguage = state.azure.language;
      speechConfig.speechSynthesisVoiceName = state.azure.voice;
      speechConfig.speechSynthesisOutputFormat = SpeechSynthesisOutputFormat.Audio48Khz192KBitRateMonoMp3;
      this.#instance = new SpeechSynthesizer(speechConfig, null as any);

      this.bindings.onStart();
    } catch (error: any) {
      console.log(error);
      this.bindings.onStop(error?.message as string);
    }
  }

  async #tryDequeueAndPlay() {
    if (this.#isPlaying) return;

    const clip = this.#audioQueue.shift();
    if (!clip) return;

    this.#isPlaying = true;
    await window.APIFrontend.sound.playVoiceBuffer(clip);
    this.#isPlaying = false;
    this.#tryDequeueAndPlay();
  }

  play(value: string): void {
    value &&
      this.#instance?.speakTextAsync(
        value,
        result => {
          this.#audioQueue.push(result.audioData);
          this.#tryDequeueAndPlay();
        },
        (e) => {
          this.#instance?.close();
          this.bindings.onStop(e);
        }
      );
  }
  stop(): void {
    this.#instance?.close();
    this.bindings.onStop();
  }
}
