import { TextEvent } from "@/types";
import { ApiClient, HelixEmote } from "@twurple/api/lib";
import { Load_FFZ_CHANNEL, Load_FFZ_GLOBAL, Load_BTTV_CHANNEL, Load_BTTV_GLOBAL, Load_7TV_CHANNEL, Load_7TV_GLOBAL } from "./emote_loaders";
import { subscribeKey } from "valtio/utils";

class TwitchEmotesApi {
  constructor() {
    subscribeKey(window.ApiServer.state.services.twitch.data, "emotesReplacements", _ => {
      this.updateReplacementsCache();
    });
  }
  dictionary: Record<string, string> = {};
  dictionaryReplacements: Record<string, string> = {};

  
  get #emoteReplacements() {
    return window.ApiServer.state.services.twitch.data.emotesReplacements;
  }

  // to lowercase
  updateReplacementsCache() {
    this.dictionaryReplacements = Object.fromEntries(Object.entries(this.#emoteReplacements).map(([k,v]) => [k.toLowerCase(), v]))
  }

  scanForEmotes(sentence: string) {
    const enabled = window.ApiServer.state.services.twitch.data.emotesEnableReplacements;
    if (!sentence || !enabled)
      return {};
    let emotes: TextEvent["emotes"] = {};
    
    const wl = sentence.toLowerCase().replace(/[^\w ]/g, "").split(" ");
    for (let i = 0; i < wl.length; i++) {
      const w = wl[i];
      let r = this.dictionaryReplacements[w]?.toLowerCase();
      if (!!r) {
       emotes[i] = this.dictionary[r];
     }
      else if (w in this.dictionary) {
        emotes[i] = this.dictionary[w];
      }
    }
    return emotes;
  }

  addTwitchEmotes(data: HelixEmote[]) {
    const newEmotes = Object.fromEntries(data.map((e) => [e.name.toLowerCase(), e.getImageUrl(1)]));
    this.dictionary = { ...this.dictionary, ...newEmotes };
  }

  addEmotes(data: Record<string, string>) {
    let d = Object.fromEntries(Object.entries(data).map(([k,v]) => [k.toLowerCase(), v]));
    this.dictionary = { ...this.dictionary, ...d };
  }

  async loadEmotes(id: string, apiClient: ApiClient) {
    this.updateReplacementsCache();
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