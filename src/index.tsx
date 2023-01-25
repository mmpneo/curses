// import "./wdyr"
import ReactDOM from "react-dom/client";
import "./style.css";
import Backend from "./backend-services";
import Frontend from "./frontend-services";
import EditorView from "./components/editor-view";
import ClientView from "./components/client-view";
import React from "react";
import { invoke } from "@tauri-apps/api/tauri";

type NetworkConfiguration = {
  id?: string
  localIp: string,
  host: string,
  port: string
}

type NativeFeatures = {
  background_input: boolean
}

declare global {
  interface Window {
    // api: API;
    API: Backend;
    APIFrontend: Frontend;
    nativeFeatures: NativeFeatures;
    mode: "host" | "client";
    platform: "app" | "web";
    networkConfiguration: NetworkConfiguration
    // "__TAURI_METADATA__": any
  }
}

declare module 'csstype' {
  interface Properties {
    '--uiscale'?: string
  }
}

window.platform = window.__TAURI_METADATA__ ? "app" : "web";

window.mode = window.location.pathname.startsWith('/client') ? "client" : "host";

if (window.mode === "host")
  document.documentElement.className = "host";

window.addEventListener('contextmenu', e => {
  const ele = e.target as HTMLElement;
  if (ele.nodeName !== "INPUT" && ele.nodeName !== "TEXTAREA") {
    e.preventDefault();
    return false;
  }
}, false);

window.API = new Backend();
window.APIFrontend = new Frontend();

async function loadNativeFeatures() {
  // get_native_features
  if (window.platform === "app") {
    const nativeFeatures = await invoke<NativeFeatures>("get_native_features");
    console.log(nativeFeatures);
    
    window.nativeFeatures = nativeFeatures;
  }
  }

async function buildNetworkConfiguration() {
  // only host
  if (window.platform === "app") {
    const appConfig = await invoke<any>("plugin:web|config");
    window.networkConfiguration = {
      localIp: appConfig.local_ip,
      host: "localhost",
      port: appConfig.port
    }
  }
  else {
    const q = new URLSearchParams(window.location.search.substring(1));
    const qHostId = q.has("id") ? q.get("id") : null;
    const qHost = q.has("host") ? q.get("host") : null;
    const qPort = q.has("port") ? q.get("port") : null;
    window.networkConfiguration = {
      localIp: "",
      id: qHostId ?? "",
      host: qHost ?? location.hostname,
      port: qPort ?? location.port
    }
  }
}

const LazyEditor = React.lazy(() => import("./components/editor-view"));

buildNetworkConfiguration()
  .then(async () => {
    await loadNativeFeatures(),
    await window.API.init(),
    await window.APIFrontend.init()
  }).then(() => {
    if (window.mode === "client")
      ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(<ClientView/>);
    else
      ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(<LazyEditor/>);
  })

