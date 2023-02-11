import { IServiceInterface, TextEventType } from "@/types";
import { serviceSubscibeToInput, serviceSubscibeToSource } from "@/utils";

class Service_Discord implements IServiceInterface {

  get #state() {
    return window.ApiServer.state.services.discord
  }

  async init() {
    serviceSubscibeToSource(this.#state.data, "postSource", data => {
      this.#state.data.postEnable
      && data?.value
      && data?.type === TextEventType.final
      && this.say(data.value);
    });
    serviceSubscibeToInput(this.#state.data, "postInput", data => {
      this.#state.data.postEnable
      && data?.value
      && data?.type === TextEventType.final
      && this.say(data.value);
    });
  }

  say(value: string) {
    console.log(value);
    fetch(this.#state.data.channelHook, {
      method: "POST",
      headers: {
        "Content-type": "application/json"
      },
      body: JSON.stringify({
        "content": value,
        "embeds": null,
        "username": this.#state.data.channelBotName || "Curses",
        "avatar_url": this.#state.data.channelAvatarUrl || "",
        "attachments": []
      })
    })
  }

}

export default Service_Discord;
