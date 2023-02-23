import { TextEvent } from "@/types";
import { ApiClient, HelixEmote } from "@twurple/api/lib";
import { Load_FFZ_CHANNEL, Load_FFZ_GLOBAL, Load_BTTV_CHANNEL, Load_BTTV_GLOBAL, Load_7TV_CHANNEL, Load_7TV_GLOBAL } from "./emote_loaders";

class TwitchEmotesApi {
  dictionary: Record<string, string> = {};
  scanForEmotes(sentence: string) {
    let emotes: TextEvent["emotes"] = {};
    if (!sentence) return {};
    const wl = sentence.split(" ");
    for (let i = 0; i < wl.length; i++) {
      if (wl[i] in this.dictionary) {
        emotes[i] = this.dictionary[wl[i]];
      }
    }
    return emotes;
  }

  addTwitchEmotes(data: HelixEmote[]) {
    const newEmotes = Object.fromEntries(data.map((e) => [e.name, e.getImageUrl(1)]));
    this.dictionary = { ...this.dictionary, ...newEmotes };
  }

  addEmotes(data: Record<string, string>) {
    this.dictionary = { ...this.dictionary, ...data };
  }

  async loadEmotes(id: string, apiClient: ApiClient) {
    if (!id || !apiClient)
      return;
    Promise.allSettled([
      apiClient.chat.getChannelEmotes(id),
      apiClient.chat.getGlobalEmotes(),
      Load_FFZ_CHANNEL(id),
      Load_FFZ_GLOBAL(),
      Load_BTTV_CHANNEL(id),
      Load_BTTV_GLOBAL(),
      Load_7TV_CHANNEL(id),
      Load_7TV_GLOBAL(),
    ]).then(([
      tw_g,
      tw_ch,
      ffz_ch,
      ffz_g,
      bttv_ch,
      bttv_g,
      stv_ch,
      stv_g,
    ]) => {
      tw_g.status === "fulfilled" && this.addTwitchEmotes(tw_g.value);
      tw_ch.status === "fulfilled" && this.addTwitchEmotes(tw_ch.value);
      ffz_ch.status === "fulfilled" && this.addEmotes(ffz_ch.value);
      ffz_g.status === "fulfilled" && this.addEmotes(ffz_g.value);
      bttv_ch.status === "fulfilled" && this.addEmotes(bttv_ch.value);
      bttv_g.status === "fulfilled" && this.addEmotes(bttv_g.value);
      stv_ch.status === "fulfilled" && this.addEmotes(stv_ch.value);
      stv_g.status === "fulfilled" && this.addEmotes(stv_g.value);
    });
  }

  dispose() {
    this.dictionary = {}
  }

}

export default TwitchEmotesApi;