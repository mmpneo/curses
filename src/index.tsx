// import "./wdyr"
import ReactDOM           from "react-dom/client";
import "./style.css";
import ApiServer          from "./server";
import ApiClient          from "./client";
import ClientView         from "./client/ui/view";
import React, {ReactNode, Suspense} from "react";
import AppConfiguration   from "@/config";
import ApiShared          from "@/shared";
import ClientLoadingView from "./client/ui/view_loading";

declare global {
  interface Window {
    Config: AppConfiguration,
    ApiShared: ApiShared;
    ApiServer: ApiServer;
    ApiClient: ApiClient;
  }
}
window.global ||= window;

declare module 'react' {
  interface CSSProperties {
    '--uiscale'?: string
  }
}

// prevent rightclicks
window.addEventListener('contextmenu', e => {
  const ele = e.target as HTMLElement;
  if (ele.nodeName !== "INPUT" && ele.nodeName !== "TEXTAREA") {
    e.preventDefault();
    return false;
  }
}, false);

let root_ele = document.getElementById("root");
if (!root_ele)
  throw Error("Root not found");

const root = ReactDOM.createRoot(root_ele);

function renderView(view: ReactNode) {
  root && root.render(view);
}

const LazyServerView = React.lazy(() => import("./server/ui/editor-view"));

(async function () {
  window.Config = new AppConfiguration();
  window.ApiShared = new ApiShared();
  window.ApiClient = new ApiClient();

  await window.Config.init();
  await window.ApiShared.init();
  
  if (window.Config.isClient()) {
    if('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js', { scope: '/', type: 'classic' }).then((sw) => {
        sw.addEventListener("updatefound", async _ => {
          console.log("found update");
          await sw.update();
          location.reload();
        } )
      });
    }
  }

  if (window.Config.isClient())
    renderView(<ClientLoadingView/>);
  // else
  //   renderView(<LazyServerView/>);

  // always load client api
  await window.ApiClient.init();

  // load server api only in app
  if (window.Config.isServer()) {
    const serverApi  = await import("./server");
    window.ApiServer = new serverApi.default();
    await window.ApiServer.init();
  }


  if (window.Config.isServer())
    document.documentElement.className = "host";

  if (window.Config.isClient())
    renderView(<ClientView/>);
  else
    renderView(<LazyServerView/>);
})();
