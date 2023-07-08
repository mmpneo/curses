import { BaseEvent, IServiceInterface, PartialWithRequired, ServiceNetworkState, TextEvent, TextEventSchema, TextEventSource } from "@/types";
import { listen } from '@tauri-apps/api/event';
import { invoke } from "@tauri-apps/api/tauri";
import PubSub from "pubsub-js";
import { toast } from "react-toastify";
import { proxy } from "valtio";
import { proxyMap } from "valtio/utils";

type RegisteredEvent = {
  label: string;
  description?: string;
  value: string;
};

class Service_PubSub implements IServiceInterface {
  constructor() {}
  #socket?: WebSocket;
  serviceState = proxy({
    state: ServiceNetworkState.disconnected
  });

  private consumePubSubMessage(stringEvent?: string) {
    if (!window.Config.isServer())
      return;
    if (typeof stringEvent === "string") try {
      const {topic, data}: BaseEvent = JSON.parse(stringEvent);
      if (typeof data !== "object")
        return;
      const validated = TextEventSchema.safeParse(data);
      if (!validated.success)
        return;
      
      const textEvent = this.applyEmotes(validated.data);
      // redirect stt
      if (topic === "text.stt") {
        window.ApiServer.stt.processExternalMessage(textEvent);
        return;
      }

      this.receivePubSub({topic, data: textEvent});
    } catch (error) {
      // just ignore invalid messages
    }
  }


  public registeredEvents = proxyMap<string, RegisteredEvent>([]);

  registerEvent = (event: RegisteredEvent) => this.registeredEvents.set(event.value, event);
  unregisterEvent = (event: RegisteredEvent) => this.registeredEvents.delete(event.value);

  async init() {
    window.Config.isServer() && listen('pubsub', (event) => {
      this.consumePubSubMessage(event.payload as string);
    })

    this.registerEvent({label: "Speech to text", value: TextEventSource.stt});
    this.registerEvent({label: "Translation",value: TextEventSource.translation});
    this.registerEvent({label: "Text field",value: TextEventSource.textfield});
    this.registerEvent({label: "Any text source",value: TextEventSource.any});
  }

  private applyEmotes(data: PartialWithRequired<TextEvent, "type" | "value">) {
    if (!data.emotes) {
      let emotes = window.ApiServer.twitch.emotes.scanForEmotes(data.value);
      return  {...data, emotes};
    }
    else
      return data;
  }

  receivePubSub(msg: BaseEvent) {
    this.#publishLocally(msg);
    this.#publishPeers(msg);
  }

  publishLocally(msg: BaseEvent) {
    this.#publishLocally(msg);
  }
  #publishLocally({topic, data}: BaseEvent) {
    PubSub.publishSync(topic, data);
  }
  #publishPubSub(msg: BaseEvent) {
    window.Config.isApp() &&
    invoke("plugin:web|pubsub_broadcast", {value: JSON.stringify(msg)});
  }
  #publishLink(msg: BaseEvent) {
    if (this.#socket && this.#socket.readyState === this.#socket.OPEN)
      this.#socket.send(JSON.stringify(msg));
  }
  #publishPeers(msg: BaseEvent) {
    window.ApiShared.peer.broadcast(msg);
  }

  publishText(topic: TextEventSource, textData: PartialWithRequired<TextEvent, "type" | "value">) {
    if (window.Config.isClient())
      return;
    let data = this.applyEmotes(textData);
    let msg = {topic, data};
    this.#publishLocally(msg);
    this.#publishPeers(msg);
    this.#publishPubSub(msg);
    this.#publishLink(msg);
  }

  public unsubscribe(key?: string) {
    key && PubSub.unsubscribe(key);
  }

  public subscribe(eventname: string, fn: (value: unknown) => void) {
    return PubSub.subscribe(eventname, (_, data) => fn(data));
  }

  public subscribeText(source: TextEventSource, fn: (value?: TextEvent, eventName?: string) => void, allowEmpty = false) {
    return PubSub.subscribe(source, (eventName, data: TextEvent) => {
      if (allowEmpty)
        fn(data, eventName);
      else if (data.value)
        fn(data, eventName);
    })
  }

  linkState = proxy({
    value: ServiceNetworkState.disconnected
  });

  copyLinkAddress() {
    const conf = window.Config.serverNetwork;
    navigator.clipboard.writeText(`${conf.ip}:${conf.port}`)
    toast.success("Copied!");
  }

  linkConnect() {
    const ipValidator = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]):[0-9]+$/;
    const fullAddress = window.ApiServer.state.linkAddress;
    if (!fullAddress.match(ipValidator))
      return;

    const conf = window.Config.serverNetwork;
    // prevent loop connect
    if (`${conf.ip}:${conf.port}` === fullAddress) {
      toast.error("Cannot connect to self");
      return;
    }


    this.serviceState.state = ServiceNetworkState.connecting;
    this.#socket = new WebSocket(`ws://${fullAddress}/pubsub?id=${window.ApiServer.state.id}-${Date.now()}`);
    const a = setTimeout(() => {
      this.#socket?.close();
    }, 5000);
    this.#socket.onopen = () => {
      clearTimeout(a);
      this.serviceState.state = ServiceNetworkState.connected;
      if (!this.#socket)
        return;
      this.#socket.onmessage = (msg) => {
        return this.consumePubSubMessage(msg.data);
      };
    };
    this.#socket.onclose = () => {
      this.serviceState.state = ServiceNetworkState.disconnected;
    }
  }
  linkDisconnect() {
    if (this.#socket?.close())
      this.#socket = undefined;
  }
}

export default Service_PubSub;
