import {
  ISpeechRecognitionService,
  SpeechServiceEventBindings,
} from "../types";

import { STT_State } from "../schema";

export class STT_DeepgramService implements ISpeechRecognitionService {
  constructor(private bindings: SpeechServiceEventBindings) {}

  dispose(): void {}

  private socket?: WebSocket;
  private recorder?: MediaRecorder;

  start(p: STT_State): void {
    if (!p.lang_name)
      return this.bindings.onStop("[STT:Deepgram] Missing language");
    if (!p.deepgram_key)
      return this.bindings.onStop("[STT:Deepgram] Missing key");
    if (!p.deepgram_tier)
      return this.bindings.onStop("[STT:Deepgram] Missing tier");

    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      this.recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      const token = "d99a3d4b920d77190ac70ca89b9adef41ebea239";
      // $0.99/h enchanced
      // $0.87/h base

      this.socket = new WebSocket(
        `wss://api.deepgram.com/v1/listen?punctuate=${!!p.deepgram_punctuate}&interim_results=${!!p.interim}&language=${!!p.lang_name}&tier=${!!p.deepgram_tier}`,
        ["token", p.deepgram_key]
      );
      this.socket.onopen = () => {
        this.bindings.onStart();
        this.recorder?.addEventListener("dataavailable", (event) => {
          if (!this.socket || this.socket.readyState === this.socket.CLOSING)
            return;
          if (
            this.socket.readyState === this.socket.OPEN &&
            this.recorder?.state === "recording"
          )
            this.socket.send(event.data);
        });
        this.recorder?.start(250);
      };
      this.socket.onmessage = (e) => {
        console.log(e);
        const rec = JSON.parse(e.data);
        const transcript = rec.channel.alternatives[0].transcript;

        rec.speech_final &&
          console.log(
            rec.speech_final,
            rec.is_final,
            rec.channel.alternatives[0].transcript
          );
      };
      this.socket.onclose = (ev) => {
        console.log(ev);
        this.stopRecorder();
        // ignore frame error
        this.bindings.onStop(
          ev.wasClean || ev.code === 1006
            ? ""
            : "[STT:Deepgram] Unexpected error"
        );
      };
    });
  }

  stopSocket() {
    this.socket?.close();
  }
  stopRecorder() {
    if (this.recorder && this.recorder?.state !== "inactive") {
      this.recorder?.stop();
      this.recorder = undefined;
    }
  }

  stop(): void {
    this.stopSocket();
    this.stopRecorder();
  }
}
