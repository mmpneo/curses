import "./wdyr"
import ReactDOM from "react-dom/client";
import "./style.css";
import Backend from "./backend-services";
import Frontend from "./frontend-services";
import EditorView from "./components/editor-view";
import ClientView from "./components/client-view";
import React from "react";

declare global {
  interface Window {
    API: Backend;
    APIFrontend: Frontend;
    mode: "host" | "client";
    platform: "app" | "web";
    remoteHost?: string // use this 
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

if (window.mode === "client") {
  const q = new URLSearchParams(window.location.search.substring(1));
  if (q.has("host")) {
    window.remoteHost = q.get("host") as string;
  }
}
window.addEventListener('contextmenu', e => e.preventDefault(), false);

window.API = new Backend();
window.APIFrontend = new Frontend();

Promise.all([
  window.API.init(),
  window.APIFrontend.init()
]).then(() => {
  if (window.mode === "client")
    ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(<ClientView />);
  else
    ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
      <React.StrictMode>
        <EditorView />
      </React.StrictMode>
    );
});

