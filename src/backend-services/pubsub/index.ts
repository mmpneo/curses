import { invoke } from "@tauri-apps/api/tauri";
import { listen } from '@tauri-apps/api/event'
import PubSub from "pubsub-js";
import { proxyMap } from "valtio/utils";
import { BaseEvent, IServiceInterface, PartialWithRequired, ServiceNetworkState, TextEvent, TextEventSource, TextEvent_Schema } from "../../types";
import Ajv from "ajv";
import { proxy } from "valtio";

type RegisteredEvent = {
  label: string;
  description?: string;
  value: string;
};

class Service_PubSub implements IServiceInterface {
  constructor() {
    this.#ajv = new Ajv({
      strict: false,
      useDefaults: "empty",
      removeAdditional: true,
    });
    const textEventValidator = this.#ajv.compile(TextEvent_Schema)
    window.platform === "app" && listen('pubsub', (event) => {
      if (typeof event.payload === "string") try {
        const {topic, data}: BaseEvent = JSON.parse(event.payload);
        if (typeof data !== "object")
          return;
        const validated = data;
        textEventValidator(validated);
        console.log(validated)
        const textEvent = this.applyEmotes(validated as TextEvent);
        this.receivePubSub({topic, data: textEvent});
      } catch (error) {}
    })
  }
  
  #ajv: Ajv;
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

  private applyEmotes(data: PartialWithRequired<TextEvent, "type" | "value">) {
    if (!data.emotes) {
      let emotes = window.API.twitch.scanForEmotes(data.value);
      return  {...data, emotes};
    }
    else
      return data;
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

  publishText(topic: TextEventSource, textData: PartialWithRequired<TextEvent, "type" | "value">) {
    if (!textData.value)
      return;
    let data = this.applyEmotes(textData)
    this.#publishLocally({topic, data});
    this.#publishToClients({topic, data});
    this.#publishPubSub({topic, data});
  }

  public unsubscribe(key?: string) {
    key && PubSub.unsubscribe(key);
  }

  public subscribe(eventname: string, fn: (value: unknown) => void) {
    return PubSub.subscribe(eventname, (_, data) => fn(data));
  }

  public subscribeText(source: TextEventSource, fn: (value?: TextEvent) => void) {
    return PubSub.subscribe(source, (_, data: TextEvent) => fn(data));
  }


  getLocalNetworkLink() {}

  linkState = proxy({
    value: ServiceNetworkState.disconnected
  })

  private buildPubSubAddress = (a: string, p: string) => `${a}:${p}/pubsub`

  linkConnect(address: string, port: string) {
    if (window.platform === "app") {
      const conf = window.networkConfiguration;
      if (conf.localIp === address && conf.port === port) {
        // prevent loop connect
        return;
      }
    }
    // const ws = new WebSocket("");
  }
  linkDisconnect() {}
}

export default Service_PubSub;
