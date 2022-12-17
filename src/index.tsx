import "./wdyr"
import ReactDOM from "react-dom/client";
import "./style.css";
import Backend from "./backend-services";
import Frontend from "./frontend-services";
import EditorView from "./components/editor-view";
import ClientView from "./components/client-view";

declare global {
  interface Window {
    API: Backend;
    APIFrontend: Frontend;
    mode: "host" | "client";
    platform: "app" | "web";
    // "__TAURI_METADATA__": any
  }
}

declare module 'csstype' {
  interface Properties {
    '--uiscale'?: string
  }
}

window.platform = window.__TAURI_METADATA__ ? "app" : "web";

const q = new URLSearchParams(window.location.search.substring(1));
window.mode = window.location.pathname.startsWith('/client') ? "client" : "host";

if (window.mode === "client" && !q.has("host"))
  throw Error("invalid client url");
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
      // <React.StrictMode>
      <EditorView />
      // </React.StrictMode>
    );
});

