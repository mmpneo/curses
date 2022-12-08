import "./wdyr"
import ReactDOM from "react-dom/client";
import App from "./App";
import "./style.css";
import Backend from "./backend-services";
import Frontend from "./frontend-services";

declare global {
  interface Window {
    API: Backend;
    APIFrontend: Frontend;
  }
}

window.addEventListener('contextmenu', e => e.preventDefault(), false);
window.API = new Backend();
window.API.Init();
window.APIFrontend = new Frontend();
window.APIFrontend.Init().then(() => {
  ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    // <React.StrictMode>
      <App />
    // </React.StrictMode>
  );
});

