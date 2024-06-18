import { IServiceInterface, ServiceNetworkState, TextEventType } from "@/types";
import { ApiClient, HelixUser } from "@twurple/api";
import { StaticAuthProvider } from "@twurple/auth";
import { proxy } from "valtio";
import { subscribeKey } from "valtio/utils";
import {
  serviceSubscibeToInput,
  serviceSubscibeToSource,
} from "../../../utils";
import TwitchChatApi from "./chat";
import TwitchEmotesApi from "./emotes";
const scope = ["chat:read", "chat:edit", "channel:read:subscriptions"];

class Service_Twitch implements IServiceInterface {
  authProvider?: StaticAuthProvider;
  constructor() {}

  emotes!: TwitchEmotesApi;
  chat!: TwitchChatApi;

  liveCheckInterval?: any = null;

  apiClient?: ApiClient;

  state = proxy<{
    user: HelixUser | null;
    liveStatus: ServiceNetworkState;
  }>({
    liveStatus: ServiceNetworkState.disconnected,
    user: null,
  });

  get #state() {
    return window.ApiServer.state.services.twitch;
  }

  async init() {
    this.emotes = new TwitchEmotesApi();
    this.chat = new TwitchChatApi();
    // check live status
    setInterval(() => this.#checkLive(), 4000);

    // login with token
    this.connect();

    subscribeKey(this.#state.data, "chatEnable", (value) => {
      if (value) {
        if (this.state.user && this.authProvider)
          this.chat.connect(this.state.user.name, this.authProvider);
      } else this.chat.disconnect();
    });

    serviceSubscibeToSource(this.#state.data, "chatPostSource", (data) => {
      if (
        this.#state.data.chatPostLive &&
        this.state.liveStatus !== ServiceNetworkState.connected
      )
        return;
      this.#state.data.chatPostEnable &&
        data?.value &&
        data?.type === TextEventType.final &&
        this.chat.post(data.value);
    });

    serviceSubscibeToInput(this.#state.data, "chatPostInput", (data) => {
      if (
        this.#state.data.chatPostLive &&
        this.state.liveStatus !== ServiceNetworkState.connected
      )
        return;
      this.#state.data.chatPostEnable &&
        data?.textFieldType !== "twitchChat" &&
        data?.value &&
        data?.type === TextEventType.final &&
        this.chat.post(data.value);
    });
  }

  login() {
    try {
      const redirect =
        import.meta.env.MODE === "development"
          ? "http://localhost:1420/oauth_twitch.html"
          : import.meta.env.CURSES_TWITCH_CLIENT_REDIRECT_LOCAL;

      const link = new URL("https://id.twitch.tv/oauth2/authorize");
      link.searchParams.set(
        "client_id",
        import.meta.env.CURSES_TWITCH_CLIENT_ID
      );
      link.searchParams.set("redirect_uri", redirect);
      link.searchParams.set("response_type", "token");
      link.searchParams.set("scope", scope.join("+"));
      link.search = decodeURIComponent(link.search);

      const auth_window = window.open(link, "", "width=600,height=600");
      const thisRef = this;

      const handleMessage = (msg: MessageEvent<unknown>) => {
        if (
          typeof msg.data === "string" &&
          msg.data.startsWith("smplstt_tw_auth:")
        ) {
          const access_token = msg.data.split(":")[1];
          if (typeof access_token === "string") {
            thisRef.#state.data.token = access_token;
            thisRef.connect();
            window.removeEventListener("message", handleMessage, true);
          }
        }
      };
      if (auth_window) {
        window.addEventListener("message", handleMessage, true);
        auth_window.onbeforeunload = () => {
          window?.removeEventListener("message", (m) => handleMessage(m), true);
        };
      }
    } catch (error) {}
  }

  logout() {
    window.ApiServer.state.services.twitch.data.token = "";
    this.chat.dispose();
    delete this.apiClient;
    delete this.authProvider;
    this.emotes.dispose();
    this.state.user = null;
    this.state.liveStatus = ServiceNetworkState.disconnected;
  }

  async #checkLive() {
    if (!this.state.user?.name) {
      this.state.liveStatus = ServiceNetworkState.disconnected;
      return;
    }
    try {
      const resp = await this.apiClient?.streams.getStreamByUserName(
        this.state.user.name
      );
      // window.ApiShared.pubsub.publishLocally({topic: "stream.on_started"});
      const prevStatus = this.state.liveStatus;
      this.state.liveStatus = !!resp
        ? ServiceNetworkState.connected
        : ServiceNetworkState.disconnected;
      // stream ended
      if (prevStatus === ServiceNetworkState.connected && this.state.liveStatus == ServiceNetworkState.disconnected) {
        window.ApiShared.pubsub.publishLocally({topic: "stream.on_ended"});
      }
    } catch (error) {
      this.state.liveStatus = ServiceNetworkState.disconnected;
    }
  }

  async connect() {
    try {
      if (!this.#state.data.token) return this.logout();

      this.authProvider = new StaticAuthProvider(
        import.meta.env.CURSES_TWITCH_CLIENT_ID,
        this.#state.data.token,
        scope
      );

      this.apiClient = new ApiClient({ authProvider: this.authProvider });
      const tokenInfo = await this.apiClient.getTokenInfo();
      if (!tokenInfo.userId) return this.logout();

      const me = await this.apiClient?.users.getUserById({
        id: tokenInfo.userId,
      });

      if (!me) return this.logout();

      this.state.user = me;

      // initial live check
      this.#checkLive();

      this.emotes.loadEmotes(me.id, this.apiClient);
      if (this.#state.data.chatEnable)
        this.chat.connect(me.name, this.authProvider);
    } catch (error) {
      this.logout();
    }
  }
}

export default Service_Twitch;
