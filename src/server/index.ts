import OBSWebSocket         from "obs-websocket-js";
import { proxy }            from "valtio";
import { InspectorTabPath } from "@/types";
import { BackendState }     from "./schema";
import Service_Keyboard     from "./services/keyboard";
import Service_State        from "./services/state";
import Service_STT          from "./services/stt";
import Service_Translation  from "./services/translation";
import Service_TTS          from "./services/tts";
import Service_Twitch       from "./services/twitch";
import Service_VRC          from "./services/vrc";
import Service_Sound        from "@/server/services/sound";
import Service_Discord from "./services/discord";

export enum Services {
  vrc = "vrc",
  stt = "stt",
  tts = "tts",
  translation = "translation",
  twitch = "twitch",
}

class ApiServer {
  constructor() {}

  private readonly _state = new Service_State();
  public readonly stt = new Service_STT();
  public readonly tts = new Service_TTS();
  public readonly translation = new Service_Translation();
  public readonly twitch = new Service_Twitch();
  public readonly discord = new Service_Discord();
  public readonly vrc = new Service_VRC();
  public readonly keyboard = new Service_Keyboard();
  public readonly sound = new Service_Sound();

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
    const sidebar = window.ApiServer.ui.sidebarState;
    sidebar.tab = undefined;
    sidebar.show = false;
  }
  changeTab(v?: InspectorTabPath) {
    const sidebar = window.ApiServer.ui.sidebarState;
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
      await obs.connect(`ws://127.0.0.1:${port}`, password);
      const activeScene = await obs.call("GetCurrentProgramScene")
      const canvas = window.ApiClient.document.fileBinder.get().canvas;
      await obs.call("CreateInput", {
        sceneName: activeScene.currentProgramSceneName,
        inputName: name,
        inputKind: "browser_source",
        inputSettings: {
          url: window.ApiShared.peer.getClientLink(),
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
    if (window.Config.isClient())
      return;
    await this._state.init();
    await window.ApiShared.peer.startServer();
    await this.twitch.init();
    await this.discord.init();
    await this.stt.init();
    await this.tts.init();
    await this.translation.init();
    await this.vrc.init();
    await this.keyboard.init();
    this.changeTheme(this.state.clientTheme);
    this.changeScale(this.state.uiScale);
  }
}

export default ApiServer;
