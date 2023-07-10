import {
  IServiceInterface,
  ServiceNetworkState,
  TextEvent,
  TextEventType,
} from "@/types";
import OBSWebSocket, { EventSubscription, OBSWebSocketError } from "obs-websocket-js";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import {
  serviceSubscibeToInput,
  serviceSubscibeToSource,
} from "../../../utils";

class Service_OBS implements IServiceInterface {
  private wsInstance!: OBSWebSocket;
  private wsRequestCancelToken = false;

  wsState = proxy({
    status: ServiceNetworkState.disconnected,
  });

  get #state() {
    return window.ApiServer.state.services.obs.data;
  }

  async init() {
    this.wsInstance = new OBSWebSocket();
    this.wsInstance.on("Identified", () => this.wshandleConnected());
    this.wsInstance.on("CurrentProgramSceneChanged", e => this.trySwitchScene(e.sceneName));

    serviceSubscibeToSource(this.#state, "source", e => this.processTextEvent(e));
    serviceSubscibeToInput(this.#state, "inputField", e => this.processTextEvent(e));

    if (this.#state.wsAutoStart)
      await this.wsConnect();

  }

  private trySwitchScene(obsSceneName?: string) {
    if (!this.#state.scenesEnable)
      return;
    function trySwitchScene(sceneName: string) {
      const scene = Object.values(window.ApiClient.scenes.scenes).find(f => f.name === sceneName);
      scene && window.ApiShared.pubsub.publish("scenes:change", scene.id);
    }
    
    if (obsSceneName && obsSceneName in this.#state.scenesMap) {
      trySwitchScene(this.#state.scenesMap[obsSceneName])
    }
    else if (this.#state.scenesFallback)
      trySwitchScene(this.#state.scenesFallback);
  }

  private async wshandleConnected() {
    if (this.#state.scenesEnable) try {
      const currentScene = await this.wsInstance.call("GetCurrentProgramScene");
      this.trySwitchScene(currentScene.currentProgramSceneName);
    } catch (error) {
      console.error(error);
    }
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
      this.wsInstance.call("SendStreamCaption", { captionText: data.value }).catch((e: OBSWebSocketError) => {        
        if (e.code !== 501)
          this.toastError(e);
      });
    }
  }

  private toastError(e: OBSWebSocketError) {
    const err = e.message ? "[OBS] " + e.message : "[OBS] Connection error";
    toast(err, { type: "error", autoClose: 2000 });
  }

  private wsHandleDisconnect(e: OBSWebSocketError) {
    console.log(e.code)
    if (e.code === 1006 || e.code === 1001) {
      if (this.wsRequestCancelToken) {
        this.wsRequestCancelToken = false;
        this.wsState.status = ServiceNetworkState.disconnected;
      }
      else {
        if (this.#state.wsAutoStart)
          this.wsConnect().catch();
        else {
          this.wsState.status = ServiceNetworkState.disconnected;
          this.toastError(e);
        }
      } 
    }
    else {
      this.wsState.status = ServiceNetworkState.disconnected;
      if(e.code !== 1000) { // 1000 - graceful stop
        this.toastError(e);
      }
    }
  }

  async wsConnect() {
    if (this.#state.wsPort === "") {
      toast("[OBS] Invalid connection port", { type: "error", autoClose: false });
      return;
    }
    this.wsState.status = ServiceNetworkState.connecting;

    try {
      this.wsInstance.disconnect();
      this.wsInstance.removeAllListeners("ConnectionClosed");
      await this.wsInstance.connect(`ws://127.0.0.1:${this.#state.wsPort}`,this.#state.wsPassword, {
        eventSubscriptions: EventSubscription.All | EventSubscription.Scenes
      });
      this.wsState.status = ServiceNetworkState.connected;
      this.wsInstance.addListener("ConnectionClosed", e => this.wsHandleDisconnect(e));
    } catch (e: any) {
      if (e instanceof OBSWebSocketError)
        this.wsHandleDisconnect(e);
    }
  }

  wsDisconnect() {
    this.wsInstance.disconnect();
  }

  wsCancel() {
    if (this.wsState.status === ServiceNetworkState.connecting) {
      this.wsInstance.disconnect();
      this.wsRequestCancelToken = true;
    }
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
