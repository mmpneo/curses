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
    chatTarget: string; // empty string = own channel
    targetLiveStatus: ServiceNetworkState;
  }>({
    liveStatus: ServiceNetworkState.disconnected,
    user: null,
    chatTarget: "",
    targetLiveStatus: ServiceNetworkState.disconnected,
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
      if (!this.#canPost())
        return;
      this.#state.data.chatPostEnable &&
        data?.value &&
        data?.type === TextEventType.final &&
        this.chat.post(data.value);
    });

    serviceSubscibeToInput(this.#state.data, "chatPostInput", (data) => {
      if (!this.#canPost())
        return;
      this.#state.data.chatPostEnable &&
        data?.textFieldType !== "twitchChat" &&
        data?.value &&
        data?.type === TextEventType.final &&
        this.chat.post(data.value);
    });
  }

  // posting to another streamer's channel requires that channel to be live;
  // posting to the own channel only requires live when chatPostLive is enabled
  #canPost() {
    if (this.state.chatTarget)
      return this.state.targetLiveStatus === ServiceNetworkState.connected;
    return (
      !this.#state.data.chatPostLive ||
      this.state.liveStatus === ServiceNetworkState.connected
    );
  }

  setChatTarget(channel: string) {
    const target = channel.trim().toLowerCase();
    this.state.chatTarget =
      !target || target === this.state.user?.name ? "" : target;
    this.state.targetLiveStatus = ServiceNetworkState.disconnected;
    if (this.state.chatTarget) this.chat.join(this.state.chatTarget);
    this.#checkLive();
  }

  async addChatTarget(name: string): Promise<boolean> {
    const login = name.trim().toLowerCase().replace(/^[#@]/, "");
    if (!login || !this.apiClient) return false;
    if (
      login === this.state.user?.name ||
      this.#state.data.chatTargets.includes(login)
    )
      return true;
    try {
      const user = await this.apiClient.users.getUserByName(login);
      if (!user) return false;
      window.ApiServer.patchService("twitch", (s) =>
        s.data.chatTargets.push(user.name)
      );
      return true;
    } catch (error) {
      return false;
    }
  }

  removeChatTarget(name: string) {
    window.ApiServer.patchService("twitch", (s) => {
      s.data.chatTargets = s.data.chatTargets.filter((c) => c !== name);
    });
    if (this.state.chatTarget === name) this.setChatTarget("");
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
    this.state.chatTarget = "";
    this.state.targetLiveStatus = ServiceNetworkState.disconnected;
  }

  async #checkLive() {
    if (!this.state.user?.name) {
      this.state.liveStatus = ServiceNetworkState.disconnected;
      this.state.targetLiveStatus = ServiceNetworkState.disconnected;
      return;
    }
    const target = this.state.chatTarget;
    try {
      const names = target
        ? [this.state.user.name, target]
        : [this.state.user.name];
      const streams = await this.apiClient?.streams.getStreamsByUserNames(
        names
      );
      const liveNames = streams?.map((s) => s.userName.toLowerCase()) ?? [];
      // window.ApiShared.pubsub.publishLocally({topic: "stream.on_started"});
      const prevStatus = this.state.liveStatus;
      this.state.liveStatus = liveNames.includes(
        this.state.user.name.toLowerCase()
      )
        ? ServiceNetworkState.connected
        : ServiceNetworkState.disconnected;
      this.state.targetLiveStatus = target
        ? liveNames.includes(target.toLowerCase())
          ? ServiceNetworkState.connected
          : ServiceNetworkState.disconnected
        : this.state.liveStatus;
      // stream ended
      if (prevStatus === ServiceNetworkState.connected && this.state.liveStatus == ServiceNetworkState.disconnected) {
        window.ApiShared.pubsub.publishLocally({topic: "stream.on_ended"});
      }
    } catch (error) {
      this.state.liveStatus = ServiceNetworkState.disconnected;
      this.state.targetLiveStatus = ServiceNetworkState.disconnected;
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
