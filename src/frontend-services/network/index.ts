import { toast } from "react-toastify";
import { proxy } from "valtio";
import { BaseEvent, IServiceInterface } from "../../types";
import { PeerjsProvider as PeerProvider } from "./provider";

class Service_Network implements IServiceInterface {
  broadcast(msg: BaseEvent) {
    this.#provider?.broadcastPubSub(msg);
  }
  #provider?: PeerProvider;

  state = proxy({
    active: false,
  });

  getClientLink(): string {
    const n = window.networkConfiguration;
    return `${n.host}:${n.port}/client?id=${window.API.state.id}`;
  }
  copyClientLink() {
    navigator.clipboard.writeText(window.APIFrontend.network.getClientLink());
    toast.success("Copied!");
  }

  async init() {
    this.#initializePeer();
    const tHost = window.networkConfiguration.id;
    if (window.mode === "client")
      if (tHost)
        await this.#provider?.connectClient(tHost);
      else 
        throw Error("Invalid host id");
    else
      this.#provider?.connectHost(window.API.state.id);
  }

  #initializePeer() {
    if (this.#provider) this.#provider.dispose();
    this.#provider = new PeerProvider(window.APIFrontend.document.file, (status) => this.state.active = status);
  }
}

export default Service_Network;
