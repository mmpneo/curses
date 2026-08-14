import { ServiceNetworkState, TextEventSource, TextEventType } from "@/types";
import { AuthProvider } from "@twurple/auth";
import { ChatClient } from "@twurple/chat";
import { proxy } from "valtio";

class TwitchChatApi {
  chatClient?: ChatClient;

  get #state() {
    return window.ApiServer.state.services.twitch;
  }

  state = proxy({
    username: "",
    connection: ServiceNetworkState.disconnected,
  });

  async connect(username: string, authProvider: AuthProvider) {
    if (this.state.connection !== ServiceNetworkState.disconnected)
      return;
    const target = window.ApiServer.twitch.state.chatTarget;
    const channels = target && target !== username ? [username, target] : [username];
    this.chatClient = new ChatClient({ authProvider, channels });
    this.chatClient.irc.onConnect(() => {
      this.state.username = username;
      this.state.connection = ServiceNetworkState.connected;
    });

    this.chatClient.irc.onDisconnect(() => {
      this.state.username = "";
      this.state.connection = ServiceNetworkState.disconnected;
    });

    this.chatClient.onMessage((channel, user, message, msg) => {
      if (channel.replace(/^#/, "") !== this.state.username) return;
      if (msg.userInfo.userName !== this.state.username) return;

      if (this.#state.data.chatReceiveEnable) {
        window.ApiShared.pubsub.publishText(TextEventSource.textfield, {
          type: TextEventType.final,
          value: msg.text,
          textFieldType: "twitchChat",
        });
      }
    });

    await this.chatClient.connect();
  }

  disconnect() {
    this.chatClient?.quit();
  }

  dispose() {
    this.disconnect(); 
  }

  join(channel: string) {
    if (this.state.connection !== ServiceNetworkState.connected) return;
    this.chatClient?.join(channel).catch(() => {});
  }

  post(message: string) {
    const target = window.ApiServer.twitch.state.chatTarget || this.state.username;
    target &&
    this.state.connection === ServiceNetworkState.connected &&
    setTimeout(() => {
      this.chatClient?.say(target, message);
    }, parseFloat(this.#state.data.chatSendDelay) || 0);
  }
}

export default TwitchChatApi;
