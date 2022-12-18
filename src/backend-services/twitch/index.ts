import { ApiClient } from "@twurple/api";
import { HelixEmoteData } from "@twurple/api/lib/api/helix/chat/HelixEmote";
import { StaticAuthProvider } from "@twurple/auth";
import { ChatClient } from "@twurple/chat";
import { DataObject, rawDataSymbol } from "@twurple/common";
import { proxy } from "valtio";
import { IServiceInterface, TextEvent, TextEventSource, TextEventType } from "../../types";
import { serviceSubscibeToInput, serviceSubscibeToSource } from "../../utils";
import { ServiceNetworkState } from "../stt/types";
import { Load_7TV_CHANNEL, Load_7TV_GLOBAL, Load_BTTV_CHANNEL, Load_BTTV_GLOBAL, Load_FFZ_CHANNEL, Load_FFZ_GLOBAL } from "./emote_loaders";
const scope = [
  'chat:read',
  'chat:edit',
  'channel:read:subscriptions'
]

class Service_Twitch implements IServiceInterface {
  constructor() {}
  
  chatClient?: ChatClient;
  apiClient?: ApiClient;

  chatState = proxy({
    status: ServiceNetworkState.disconnected
  })

  state = proxy<{
    user: {
      id: string
      name: string
      avatar: string
    } | null
  }>({
    user: null
  });

  get #state() {
    return window.API.state.services.twitch
  }

  async init() {  
    this.connect();
    serviceSubscibeToSource(this.#state.data, "chatPostSource", data => {
      this.chatClient?.isConnected 
      && this.#state.data.chatPostEnable
      && data?.value
      && data?.type === TextEventType.final
      && this.say(data.value);
    });
    serviceSubscibeToInput(this.#state.data, "chatPostInput", data => {
      this.chatClient?.isConnected 
      && data?.value 
      && data?.type === TextEventType.final
      && this.say(data.value);
    });
  }

  say(value: string) {
    this.state.user?.name && 
    this.chatClient?.isConnected &&
    this.chatClient?.say(this.state.user.name, value);
  }

  login() {
    try {
      const redirect = import.meta.env.MODE === "development" ? "http://localhost:1420/oauth_twitch.html" : import.meta.env.VITE_TWITCH_CLIENT_REDIRECT_LOCAL;
      const auth_link   = `https://id.twitch.tv/oauth2/authorize?client_id=${import.meta.env.VITE_TWITCH_CLIENT_ID}&redirect_uri=${redirect}&response_type=token&scope=${scope.join('+')}`
      const auth_window = window.open(auth_link, '', 'width=600,height=600');
      const handleMessage = (msg: MessageEvent<unknown>) => {
        if (typeof msg.data === "string" && msg.data.startsWith("smplstt_tw_auth:")) {
          const access_token = msg.data.split(":")[1]
          if (typeof access_token === "string"){
            this.#state.data.token = access_token;
            this.connect();
          }
        }
      }
      if (auth_window) {
        window.addEventListener("message", m => handleMessage(m));
        auth_window.onbeforeunload = () => {
          window?.removeEventListener("message", m => handleMessage(m), false);
        }
      }
    } catch (error) {}
  }

  logout() {
    window.API.state.services.twitch.data.token = "";
    this.state.user = null;
    // this.chatClient?
    // disconnect chat
    // disconnect auth
    // remove token
  }

  emotes: Record<string, string> = {}
  scanForEmotes(sentence: string) {
    let emotes: TextEvent["emotes"] = {}
    const wl = sentence.split(" ");
    for (let i = 0; i < wl.length; i++) {
      if (wl[i] in window.API.twitch.emotes) {
        emotes[i] = window.API.twitch.emotes[wl[i]];
      }
    }
    return emotes;
  }

  

  addTwitchEmotes(data:  DataObject<HelixEmoteData>[]) {
    const newEmotes = Object.fromEntries(data.map(e => [e[rawDataSymbol].name, e[rawDataSymbol].images.url_1x]))
    this.emotes = {...this.emotes, ...newEmotes};
  }

  addEmotes(data:  Record<string, string>) {
    this.emotes = {...this.emotes, ...data};
  }

  async connect() {
    const token = window.API.state.services.twitch.data.token;
    if (!token)
      return;

      const authProvider = new StaticAuthProvider(import.meta.env.VITE_TWITCH_CLIENT_ID, token);
      try {
        
        this.apiClient = new ApiClient({authProvider});
        const me        = await this.apiClient.users.getMe();
        
        this.state.user = {
          id:     me.id,
          name:   me.name,
          avatar: me.profilePictureUrl
        };
        
        const emotes = await this.apiClient.chat.getChannelEmotes(me.id);
        const globalEmotes = await this.apiClient.chat.getGlobalEmotes();

        const res = await Promise.allSettled([
          Load_FFZ_CHANNEL(me.id),
          Load_FFZ_GLOBAL(),
          Load_BTTV_CHANNEL(me.id),
          Load_BTTV_GLOBAL(),
          Load_7TV_CHANNEL(me.id),
          Load_7TV_GLOBAL(),
        ]);

        res.forEach(p => p.status === "fulfilled" && this.addEmotes(p.value));
        
        this.addTwitchEmotes(emotes);
        this.addTwitchEmotes(globalEmotes);

        this.chatState.status = ServiceNetworkState.connecting;
        this.chatClient = new ChatClient({authProvider, channels: [me.name]});
        this.chatClient.onConnect(() => this.chatState.status = ServiceNetworkState.connected)
        this.chatClient.onDisconnect(() => this.chatState.status = ServiceNetworkState.disconnected)
        this.chatClient.onMessage((channel, user, message, msg) => {
          if (msg.userInfo.userId === this.state.user?.id) {
            if (this.#state.data.chatReceiveEnable) {
              window.API.pubsub.publishText(TextEventSource.textfield, {type: TextEventType.final, value: msg.content.value})
            }
          }
        });
        await this.chatClient.connect();
      } catch (error) {
        this.logout();
      }

  }

}

export default Service_Twitch;
