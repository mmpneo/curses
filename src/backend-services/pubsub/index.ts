import { invoke } from "@tauri-apps/api/tauri";
import { listen } from '@tauri-apps/api/event'
import PubSub from "pubsub-js";
import { proxyMap } from "valtio/utils";
import { BaseEvent, IServiceInterface, TextEvent, TextEventSource } from "../../types";
type RegisteredEvent = {
  label: string;
  description?: string;
  value: string;
};

function log(...args: any) {
  console.log("[pubsub]", ...args);
}

class Service_PubSub implements IServiceInterface {
  constructor() {
    window.platform === "app" && listen('pubsub', (event) => {
      if (typeof event.payload === "string") try {
        const {topic, data} = JSON.parse(event.payload);
        this.receivePubSub({topic, data});
      } catch (error) {}
    })
  }

  #pubsub = PubSub;

  public registeredEvents = proxyMap<string, RegisteredEvent>([]);

  registerEvent = (event: RegisteredEvent) => this.registeredEvents.set(event.value, event);
  unregisterEvent = (event: RegisteredEvent) => this.registeredEvents.delete(event.value);

  async init() {
    this.registerEvent({label: "Speech to text", value: TextEventSource.stt});
    this.registerEvent({label: "Translation",value: TextEventSource.translation});
    this.registerEvent({label: "Input field",value: TextEventSource.textfield});
    this.registerEvent({label: "Any text source",value: TextEventSource.any});
  }

  receivePubSub(msg: BaseEvent) {
    this.#publishLocally(msg);
    this.#publishToClients(msg);
  }

  publishLocally(msg: BaseEvent) {
    this.#publishLocally(msg);
  }
  #publishLocally({topic, data}: BaseEvent) {
    this.#pubsub.publishSync(topic, data);
  }
  #publishPubSub(msg: BaseEvent) {
    invoke("plugin:web|pubsub_broadcast", {value: JSON.stringify(msg)});
  }
  #publishToClients(msg: BaseEvent) {
    window.APIFrontend.network.broadcast(msg);
  }

  publishText(topic: TextEventSource, data: TextEvent) {
    this.#publishLocally({topic, data});
    this.#publishToClients({topic, data});
    this.#publishPubSub({topic, data});
  }

  public unsubscribe(key: string) {
    PubSub.unsubscribe(key);
  }

  public subscribe(eventname: string, fn: (value: unknown) => void) {
    return PubSub.subscribe(eventname, (_, data) => fn(data));
  }

  public subscribeText(source: TextEventSource, fn: (value?: TextEvent) => void) {
    return PubSub.subscribe(source, (_, data: TextEvent) => fn(data));
  }

  Init() {}
}

export default Service_PubSub;
