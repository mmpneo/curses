import { isEmpty, values } from "lodash";
import {
  OutputFormat,
  SpeechConfig,
  SpeechSynthesisOutputFormat,
  SpeechSynthesizer
} from "microsoft-cognitiveservices-speech-sdk";
import { TTS_State } from "../schema";
import { ITTSService, TTSServiceEventBindings } from "../types";

export class TTS_AzureService implements ITTSService {
  constructor(private bindings: TTSServiceEventBindings) {}

  dispose(): void {}

  #instance?: SpeechSynthesizer;
  #audioQueue: ArrayBuffer[] = [];
  #isPlaying = false;

  start(state: TTS_State): void {
    if (values(state.azure).some(isEmpty)) return this.bindings.onStop();

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
    await window.APIFrontend.sound.playUniqueBuffer(clip);
    this.#isPlaying = false;
    this.#tryDequeueAndPlay();
  }

  play(value: string): void {
    value &&
      this.#instance?.speakTextAsync(
        value,
        (e) => {
          this.#audioQueue.push(e.audioData);
          this.#tryDequeueAndPlay();
        },
        (e) => {
          console.log(e);
        }
      );
  }
  stop(): void {
    this.#instance?.close();
    this.bindings.onStop();
  }
}
