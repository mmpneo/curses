import Service_PubSub from "@/shared/services/pubsub";
import Service_Peer   from "@/shared/services/peer";

class APIShared {

  public pubsub = new Service_PubSub();
  public peer = new Service_Peer();

  async init() {
    await this.pubsub.init();
    await this.peer.init();
  }
}

export default APIShared;
