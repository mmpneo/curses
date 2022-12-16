import {
  ISpeechRecognitionService,
  SpeechServiceEventBindings,
} from "../types";

import { STT_State } from "../schema";
import {
  AudioConfig,
  AutoDetectSourceLanguageConfig,
  CancellationErrorCode,
  PropertyId,
  SpeechConfig,
  SpeechRecognizer,
} from "microsoft-cognitiveservices-speech-sdk";

export class STT_AzureService implements ISpeechRecognitionService {
  constructor(private bindings: SpeechServiceEventBindings) {}

  #instance?: SpeechRecognizer;

  dispose(): void {}

  start(params: STT_State): void {

    if (!params.lang_name)
      return this.bindings.onStop("[STT:Azure] Missing language");
    if (!params.azure_key)
      return this.bindings.onStop("[STT:Azure] Missing key");
    if (!params.azure_location)
      return this.bindings.onStop("[STT:Azure] Missing location");

    const speechConfig = SpeechConfig.fromSubscription(
      params.azure_key,
      params.azure_location
    );
    speechConfig.speechRecognitionLanguage = params.lang_name;
    speechConfig.setProperty(
      PropertyId.SpeechServiceResponse_ProfanityOption as any,
      params.azure_profanity
    );
    speechConfig.setProperty(
      PropertyId.SpeechServiceConnection_InitialSilenceTimeoutMs as any,
      "60000"
    );
    speechConfig.setProperty(
      PropertyId.SpeechServiceConnection_EndSilenceTimeoutMs as any,
      "20000"
    );
    speechConfig.enableDictation();

    const langConfig = AutoDetectSourceLanguageConfig.fromLanguages([
      params.lang_name,
    ]);
    const audioConfig = AudioConfig.fromMicrophoneInput(params.device);
    this.#instance = SpeechRecognizer.FromConfig(
      speechConfig,
      langConfig,
      audioConfig
    );

    this.#instance.sessionStarted = () => this.bindings.onStart();
    this.#instance.sessionStopped = () => this.bindings.onStop();
    this.#instance.canceled = (r, e) => {
      if (CancellationErrorCode.NoError === e.errorCode) this.bindings.onStop();
      else this.bindings.onStop(`${CancellationErrorCode[e.errorCode]}`);
    };

    this.#instance.recognizing = (s, e) =>
      params.interim &&
      !!e.result.text &&
      this.bindings.onInterim(e.result.text);
    this.#instance.recognized = (s, e) => this.bindings.onFinal(e.result.text);
    this.#instance?.startContinuousRecognitionAsync();
  }

  stop(): void {
    this.#instance?.stopContinuousRecognitionAsync(() => {
      this.#instance?.close();
    });
  }
}
