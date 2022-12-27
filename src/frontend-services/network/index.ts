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

  async init() {
    this.#initializePeer();
    if (window.mode === "client")
      await this.#provider?.connectClient("local");
    else
      this.#provider?.connectHost("local");
  }

  #initializePeer() {
    if (this.#provider) this.#provider.dispose();
    this.#provider = new PeerProvider(window.APIFrontend.document.file, (status) => this.state.active = status);
  }
}

export default Service_Network;
