import {toast}                          from "react-toastify";
import {proxy}                          from "valtio";
import {BaseEvent, IServiceInterface}   from "@/types";
import {PeerjsProvider as PeerProvider} from "./provider";

class Service_Peer implements IServiceInterface {
  broadcast(msg: BaseEvent) {
    this.#provider?.broadcastPubSub(msg);
  }

  #provider?: PeerProvider;

  state = proxy({
    active: false,
  });

  getClientLink(): string {
    const n = window.Config.serverNetwork;
    return `${n.host}:${n.port}/client?id=${window.ApiServer.state.id}`;
  }

  copyClientLink() {
    navigator.clipboard.writeText(window.ApiShared.peer.getClientLink());
    toast.success("Copied!");
  }

  startServer(id: string) {
    this.#initializePeer();
    this.#provider?.connectServer({
      id: window.ApiServer.state.id,
      host: window.Config.serverNetwork.host,
      port: window.Config.serverNetwork.port,
    });
  }
  async startClient() {
    this.#initializePeer();
    if (window.Config.isClient()) {
      await this.#provider?.connectClient({
        id:   window.Config.clientNetwork.serverId,
        host: window.Config.clientNetwork.host,
        port: window.Config.clientNetwork.port,
      });
    }
  }

  async init() {
  }

  #initializePeer() {
    if (this.#provider) this.#provider.dispose();
    this.#provider = new PeerProvider(window.ApiClient.document.file, (status) => this.state.active = status);
  }
}

export default Service_Peer;
