import PubSub from "pubsub-js";
import { IServiceInterface, TextEvent, TextEventSource } from "../../types";
import { proxyMap, proxySet } from 'valtio/utils'
import { subscribe } from "valtio";

type RegisteredEvent = {
  label: string
  description?: string
  value: string
}

function log(...args: any) {
  console.log("[pubsub]", ...args);
}

class Service_PubSub implements IServiceInterface {
  constructor() {}

  public pubsub = PubSub;

  public registeredEvents = proxyMap<string, RegisteredEvent>([]);

  registerEvent(event: RegisteredEvent) {
    this.registeredEvents.set(event.value, event);
  }
  unregisterEvent(event: RegisteredEvent) {
    console.log('remove result', this.registeredEvents.delete(event.value));
  }

  async init() {
    subscribe(this.registeredEvents, e => {
      log("added event", e);
    });

    this.registerEvent({
      label: "Speech to text",
      value: TextEventSource.stt
    });
    this.registerEvent({
      label: "Translation",
      value: TextEventSource.translation
    });
    this.registerEvent({
      label: "Input field",
      value: TextEventSource.textfield
    });
    this.registerEvent({
      label: "Any text source",
      value: TextEventSource.any
    });
  }

  #publishLocally(topic: string, data: any) {
    this.pubsub.publishSync(topic, data);
  }

  publishText(topic: TextEventSource, data: TextEvent) {
    this.#publishLocally(topic, data);
  }

  publish(
    topic: string,
    data?: any,
    { replicate }: { replicate?: boolean } = { replicate: false }
  ) {
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

  public subscribeText(
    source: TextEventSource,
    callback: (value: TextEvent) => void
  ) {
    return PubSub.subscribe(source, (_, data) => callback(data));
  }

  public subscribeOnce(eventname: string, callback: (value: unknown) => void) {
    return PubSub.subscribeOnce(eventname, (_, data) => callback(data));
  }

  Init() {}
}

export default Service_PubSub;
