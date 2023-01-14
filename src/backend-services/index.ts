import OBSWebSocket from "obs-websocket-js";
import { proxy } from "valtio";
import { InspectorTabPath } from "../types";
import Service_PubSub from "./pubsub";
import { BackendState } from "./schema";
import Service_Shortcuts from "./shortcuts";
import Service_State from "./state";
import Service_STT from "./stt";
import Service_Translation from "./translation";
import Service_TTS from "./tts";
import Service_Twitch from "./twitch";
import Service_VRC from "./vrc";

export enum Services {
  vrc = "vrc",
  stt = "stt",
  tts = "tts",
  translation = "translation",
  twitch = "twitch",
}

class Backend {
  constructor() {}

  private readonly _state = new Service_State();
  public readonly stt = new Service_STT();
  public readonly tts = new Service_TTS();
  public readonly translation = new Service_Translation();
  public readonly twitch = new Service_Twitch();
  public readonly vrc = new Service_VRC();
  public readonly pubsub = new Service_PubSub();
  public readonly shortcuts = new Service_Shortcuts();

  get state() {
    return this._state.state;
  }

  ui = proxy<{
    sidebarState: {
      tab: InspectorTabPath | undefined;
      show: boolean;
      expand: boolean;
    };
  }>({
    sidebarState: {
      tab: undefined,
      show: false,
      expand: false
    },
  });
  closeSidebar() {
    const sidebar = window.API.ui.sidebarState;
    sidebar.tab = undefined;
    sidebar.show = false;
  }
  changeTab(v?: InspectorTabPath) {
    const sidebar = window.API.ui.sidebarState;
    if (sidebar.tab?.tab === v?.tab && sidebar.tab?.value === v?.value && sidebar.show) {
      sidebar.show = false; // close tab
      sidebar.tab = undefined;
      return;
    }
    sidebar.tab = v; // close tab
    sidebar.show = true; // close tab
  }

  patchService<Key extends keyof BackendState["services"]>(
    service: Key,
    fn: (state: BackendState["services"][Key]) => void
  ) {
    fn(this.state.services[service]);
    // this.state.services[service] = produce(this.state.services[service], fn);
  }

  public changeTheme(value: string) {
    this.state.clientTheme = value;
    document.body.setAttribute("data-theme", value);
  }

  public changeScale(value: number) {
    this.state.uiScale = value;
    document.documentElement.style.setProperty("--uiscale", value.toString());
  }

  async setupObsScene({name, port, password}: {name: string, port: string, password: string}) {
    const obs = new OBSWebSocket();
    try {
      const { host: nHost, port: nPort } = window.networkConfiguration;
      await obs.connect(`ws://127.0.0.1:${port}`, password);
      const activeScene = await obs.call("GetCurrentProgramScene")
      const canvas = window.APIFrontend.document.fileBinder.get().canvas;
      await obs.call("CreateInput", {
        sceneName: activeScene.currentProgramSceneName,
        inputName: name,
        inputKind: "browser_source",
        inputSettings: {
          url: window.APIFrontend.network.getClientLink(),
          width: canvas.w,
          height: canvas.h,
        }
      });
      return "";
    } catch (error: any) {
      return error.message || "Something went wrong"
    } finally {
      obs.disconnect();
    }
  }

  public async init() {
    // todo later
    // this.initInputWIndow();
    await this._state.init();
    await this.pubsub.init();
    await this.twitch.init();
    await this.stt.init();
    await this.tts.init();
    await this.translation.init();
    await this.vrc.init();
    await this.shortcuts.init();
    window.mode === "host" && this.changeTheme(this.state.clientTheme);
    window.mode === "host" && this.changeScale(this.state.uiScale);
  }
}

export default Backend;
