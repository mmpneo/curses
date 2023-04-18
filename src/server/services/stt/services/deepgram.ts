import {
  ISTTReceiver,
  ISTTService
} from "../types";

import { isEmptyValue } from "../../../../utils";
import { STT_State } from "../schema";

export class STT_DeepgramService implements ISTTService {
  constructor(private bindings: ISTTReceiver) {}

  dispose(): void {}

  private socket?: WebSocket;
  private recorder?: MediaRecorder;

  get state() {
    return window.ApiServer.state.services.stt.data.deepgram
  }

  start(state: STT_State): void {

    if (Object.values(state.deepgram).some(isEmptyValue))
      return this.bindings.onStop("Options missing");

    navigator.mediaDevices.getUserMedia({audio: {deviceId: {exact: this.state.device}}}).then((stream) => {
      this.recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      this.socket = new WebSocket(
        `wss://api.deepgram.com/v1/listen?punctuate=${!!state.deepgram.punctuate}&interim_results=${!!state.deepgram.interim}&language=${state.deepgram.language}&tier=${state.deepgram.tier}`,
        ["token", state.deepgram.key]
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
            if(rec.speech_final || rec.is_final)
              this.bindings.onFinal(transcript);
            else
              this.bindings.onInterim(transcript);
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
