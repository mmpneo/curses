// import "./wdyr"
import ReactDOM           from "react-dom/client";
import "./style.css";
import ApiServer          from "./server";
import ApiClient          from "./client";
import ClientView         from "./client/ui/view";
import React, {ReactNode} from "react";
import AppConfiguration   from "@/config";
import ApiShared          from "@/shared";

type NativeFeatures = {
  background_input: boolean
}

declare global {
  interface Window {
    Config: AppConfiguration,
    ApiShared: ApiShared;
    ApiServer: ApiServer;
    ApiClient: ApiClient;
    platform: "app" | "web";
  }
}

declare module 'csstype' {
  interface Properties {
    '--uiscale'?: string
  }
}

window.platform = window.__TAURI_METADATA__ ? "app" : "web";

window.addEventListener('contextmenu', e => {
  const ele = e.target as HTMLElement;
  if (ele.nodeName !== "INPUT" && ele.nodeName !== "TEXTAREA") {
    e.preventDefault();
    return false;
  }
}, false);

function renderView(view: ReactNode) {
  const root = document.getElementById("root");
  root && ReactDOM.createRoot(root).render(view);
}

const LazyServerView = React.lazy(() => import("./server/ui/editor-view"));
(async function () {
  window.Config = new AppConfiguration();
  window.ApiShared = new ApiShared();
  window.ApiClient = new ApiClient();

  await window.Config.init();
  await window.ApiShared.init();

  // load server api only in app
  if (window.Config.isServer()) {
    const serverApi  = await import("./server");
    window.ApiServer = new serverApi.default();
    await window.ApiServer.init();
  }

  // always load client api
  await window.ApiClient.init();

  if (window.Config.isServer())
    document.documentElement.className = "host";

  if (window.Config.isClient())
    renderView(<ClientView/>);
  else
    renderView(<LazyServerView/>);
})();
