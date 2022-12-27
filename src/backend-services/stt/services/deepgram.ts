import {
  ISpeechRecognitionService,
  SpeechServiceEventBindings
} from "../types";

import { isEmptyValue } from "../../../utils";
import { STT_State } from "../schema";

export class STT_DeepgramService implements ISpeechRecognitionService {
  constructor(private bindings: SpeechServiceEventBindings) {}

  dispose(): void {}

  private socket?: WebSocket;
  private recorder?: MediaRecorder;

  start(state: STT_State): void {

    if (Object.values(state.deepgram).some(isEmptyValue))
      return this.bindings.onStop("Options missing 111");

    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      console.log(state.deepgram)
      this.recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      const token = "d99a3d4b920d77190ac70ca89b9adef41ebea239";

      // this.socket = new WebSocket(
      //   `wss://api.deepgram.com/v1/listen`,
      //   ["token", "1f1d964482856a2ba66a02a7979c20868b4c658b"]
      // );

      this.socket = new WebSocket(
        `wss://api.deepgram.com/v1/listen?punctuate=${!!state.deepgram.punctuate}&interim_results=${!!state.deepgram.interim}&language=${state.deepgram.language}&tier=${state.deepgram.tier}`,
        ["token", "1f1d964482856a2ba66a02a7979c20868b4c658b"]
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
        try {
          const rec = JSON.parse(e.data);
          const transcript = rec?.channel?.alternatives?.[0]?.transcript;
          if (!transcript)
            return;
            if(!rec.speech_final)
              this.bindings.onInterim(transcript);
            else
              this.bindings.onFinal(transcript);
          // rec.speech_final &&console.log(rec.speech_final,rec.is_final, rec.channel.alternatives[0].transcript);
        } catch (error) {}
      };
      this.socket.onclose = (ev) => {
        this.stopRecorder();
        if (ev.wasClean)
          return this.bindings.onStop();
        else
          this.bindings.onStop(ev.code === 1006 ? "" : "[Deepgram] Unexpected error");
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
