import React    from "react";
import ReactDOM from "react-dom/client";
import App      from "./App";
import "./style.css";
import Backend  from "./services";

declare global {
  interface Window {
    API: Backend;
  }
}

window.addEventListener('contextmenu', e => e.preventDefault(), false);
window.API = new Backend();
window.API.Init();


ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App/>
  </React.StrictMode>
);
