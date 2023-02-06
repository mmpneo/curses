import {invoke} from "@tauri-apps/api/tauri";

enum AppMode {
  server,
  client
}

enum AppPlatform {
  app,
  web
}

type NativeFeatures = {
  background_input: boolean
}

type ClientNetwork = {
  serverId: string;
  host: string;
  port: string;
}
type ServerNetwork = {
  ip: string,
  host: string,
  port: string
}

class AppConfiguration {
  mode: AppMode            = AppMode.server;
  platform: AppPlatform    = AppPlatform.app;
  features: NativeFeatures = {
    background_input: false
  }
  serverNetwork!: ServerNetwork;
  clientNetwork!: ClientNetwork;

  public isApp    = () => window.Config.platform === AppPlatform.app;
  public isWeb    = () => window.Config.platform === AppPlatform.web;
  public isClient = () => window.Config.mode === AppMode.client;
  public isServer = () => window.Config.mode === AppMode.server;

  // region ---INITIALIZERS---
  private loadBase() {
    this.platform = window.__TAURI_METADATA__ ? AppPlatform.app : AppPlatform.web;
    this.mode     = window.location.pathname.startsWith('/client') ? AppMode.client : AppMode.server;
  }

  private async loadFeatures() {
    if (!this.isApp())
      return;
    this.features = await invoke<NativeFeatures>("get_native_features");
  }

  private async loadNetwork() {
    // client is always web
    // load network params from url query
    if (this.isClient()) {
      const q            = new URLSearchParams(window.location.search.substring(1));
      this.clientNetwork = {
        serverId: q.get("id") ?? "",
        host:     q.get("host") ?? location.hostname,
        port:     q.get("port") ?? location.port
      }
      if (!this.clientNetwork.serverId)
        throw Error("Invalid client ID")
    }
      // server is always app
    // load network params from rust
    else {
      const appConfig    = await invoke<any>("plugin:web|config");
      this.serverNetwork = {
        ip:   appConfig.local_ip,
        host: "localhost",
        port: appConfig.port
      }
    }
  }

  async init() {
    this.loadBase();
    await Promise.all([
      this.loadFeatures(),
      this.loadNetwork()
    ]);
  }
  //endregion

}

export default AppConfiguration;
