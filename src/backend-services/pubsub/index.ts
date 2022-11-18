import PubSub from "pubsub-js";
import { TextEvent, TextEventSource } from "../../types";

function log(...args: any) {
  console.log('[pubsub]', ...args);
}

class Service_PubSub {
  public pubsub = PubSub;

  constructor() {
    // window.nativeApi?.onMessage(({topic, data}) => {
    //   this.#publishLocally(topic, data);
    //   window.API.network.broadcast({topic, data});
    // });
  }

  #publishLocally(topic: string, data: any) {
    this.pubsub.publishSync(topic, data);
  }

  publishText(topic: TextEventSource, data: TextEvent) {
      this.#publishLocally(topic, data);
  }

  publish(topic: string, data?: any, {replicate}: { replicate?: boolean } = {replicate: false}) {
    this.#publishLocally(topic, data);
    // emit to clients
    // if (replicate)
    //   window.API.network.broadcast({topic, data});
  }

  public unsubscribe(key: string) {
    PubSub.unsubscribe(key);
  }

  public subscribe(eventname: string, callback: (value: unknown) => void) {
    return PubSub.subscribe(eventname, (_, data) => callback(data));
  }

  public subscribeText(source: TextEventSource, callback: (value: TextEvent) => void) {
    return PubSub.subscribe(source, (_, data) => callback(data));
  }

  public subscribeOnce(eventname: string, callback: (value: unknown) => void) {
    return PubSub.subscribeOnce(eventname, (_, data) => callback(data));
  }


  Init() {

  }
}

export default Service_PubSub;