import {
  IServiceInterface,
  ServiceNetworkState,
  TextEvent,
  TextEventType,
} from "@/types";
import {
  serviceSubscibeToInput,
  serviceSubscibeToSource,
} from "../../../utils";
import OBSWebSocket from "obs-websocket-js";
import { proxy } from "valtio";
import { toast } from "react-toastify";

async function sleep(time: number) {
  return new Promise((res) => setTimeout(res, time));
}

class Service_OBS implements IServiceInterface {
  private wsInstance!: OBSWebSocket;
  wsState = proxy({
    status: ServiceNetworkState.disconnected,
  });

  get #state() {
    return window.ApiServer.state.services.obs.data;
  }

  async init() {
    this.wsInstance = new OBSWebSocket();
    this.wsInstance.on("ConnectionOpened", () => {
      this.wsState.status = ServiceNetworkState.connected;
    });
    this.wsInstance.on("ConnectionClosed", () => {
      this.wsState.status = ServiceNetworkState.disconnected;
    });

    serviceSubscibeToSource(this.#state, "source", e => this.processTextEvent(e));
    serviceSubscibeToInput(this.#state, "inputField", e => this.processTextEvent(e));


    if (this.#state.wsAutoStart)
      this.wsConnect();

  }
  sendTest(): void {
    this.wsInstance.call("SendStreamCaption", { captionText: "Test" });
  }

  private processTextEvent(data?: TextEvent) {
    if (
      // this.#state.enable && 
      this.wsState.status === ServiceNetworkState.connected &&
      data?.value
      && (
        data?.type === TextEventType.final ||
        (data?.type === TextEventType.interim && this.#state.interim)
      )
    ) {
      this.wsInstance.call("SendStreamCaption", { captionText: data.value });
    }
  }

  async wsConnect() {
    if (this.#state.wsPort === "") {
      toast("[OBS] Invalid connection port", { type: "error", autoClose: false });
      return;
    }

    try {
      await this.wsInstance.connect(
        `ws://127.0.0.1:${this.#state.wsPort}`,
        this.#state.wsPassword
      );
    } catch (error: any) {
      this.wsState.status = ServiceNetworkState.error;
      const err = error.message ? "[OBS] " + error.message : "[OBS] Connection error";
      toast(err, { type: "error", autoClose: false });
    } finally {
    }
  }

  wsDisconnect() {
    this.wsInstance.disconnect();
  }

  async setupObsScene({
    name,
    port,
    password,
  }: {
    name: string;
    port: string;
    password: string;
  }) {
    const obs = new OBSWebSocket();

    try {
      await obs.connect(`ws://127.0.0.1:${port}`, password);
      const activeScene = await obs.call("GetCurrentProgramScene");
      const canvas = window.ApiClient.document.fileBinder.get().canvas;
      await obs.call("CreateInput", {
        sceneName: activeScene.currentProgramSceneName,
        inputName: name,
        inputKind: "browser_source",
        inputSettings: {
          url: window.ApiShared.peer.getClientLink(),
          width: canvas.w,
          height: canvas.h,
        },
      });
      return "";
    } catch (error: any) {
      return error.message || "Something went wrong";
    } finally {
      obs.disconnect();
    }
  }
}

export default Service_OBS;
