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
    if (window.mode === "client") {
      // try connect
      this.#initializePeer();
      await this.#provider?.connectClient("123");
    } else {
      // idle
      this.#initializePeer();
      this.#provider?.connectHost("123");
    }
  }

  #initializePeer() {
    if (this.#provider) this.#provider.dispose();
    this.#provider = new PeerProvider(window.APIFrontend.document.file, (status) => this.state.active = status);
  }
}

export default Service_Network;
