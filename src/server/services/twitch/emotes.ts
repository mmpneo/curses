import { TextEvent } from "@/types";
import { ApiClient, HelixEmote } from "@twurple/api/lib";
import {
  Load_FFZ_CHANNEL,
  Load_FFZ_GLOBAL,
  Load_BTTV_CHANNEL,
  Load_BTTV_GLOBAL,
  Load_7TV_CHANNEL,
  Load_7TV_GLOBAL,
} from "./emote_loaders";
import { subscribeKey } from "valtio/utils";

class TwitchEmotesApi {
  constructor() {
    subscribeKey(
      window.ApiServer.state.services.twitch.data,
      "emotesReplacements",
      (_) => {
        this.updateReplacementsCache();
      }
    );
  }
  dictionary: Record<string, string> = {};
  dictionaryLowerCase: Record<string, string> = {};
  dictionaryReplacementsLowerCase: Record<string, string> = {};

  get #emoteReplacements() {
    return window.ApiServer.state.services.twitch.data.emotesReplacements;
  }

  // to lowercase
  updateReplacementsCache() {
    this.dictionaryReplacementsLowerCase = Object.fromEntries(
      Object.entries(this.#emoteReplacements).map(([k, v]) => [
        k.toLowerCase(),
        v,
      ])
    );
  }

  scanForEmotes(sentence: string): Record<number, string> {
    const enabled = window.ApiServer.state.services.twitch.data.emotesEnableReplacements;
    if (!sentence || !enabled) return {};

    const isSensitive = window.ApiServer.state.services.twitch.data.emotesCaseSensitive;
    let emotes: TextEvent["emotes"] = {};

    const wordList = (isSensitive ? sentence : sentence.toLowerCase())
      // .replace(/[^\w ]/g, "")
      .split(" ");

    let cursor: number = 0;
    for (let i = 0; i < wordList.length; i++) {
      const word = wordList[i];
      const clearedWord = word.replace(/[^\w ]/g, "");

      // look for replacements
      let replacementKey = isSensitive
        ? this.#emoteReplacements[clearedWord]
        : this.dictionaryReplacementsLowerCase[clearedWord]?.toLowerCase();

      const targetDictionary = isSensitive
        ? this.dictionary
        : this.dictionaryLowerCase;

      if (!!replacementKey && replacementKey in targetDictionary) {
        // for animation cursors
        emotes[cursor] = targetDictionary[replacementKey];
        // for replaceAll
        emotes[replacementKey] = targetDictionary[replacementKey]
      } else if (clearedWord in targetDictionary) {
        emotes[cursor] = targetDictionary[clearedWord];
        emotes[clearedWord] = targetDictionary[clearedWord];
      }

      cursor += word.length + 1;
    }
    return emotes;
  }

  addTwitchEmotes(data: HelixEmote[]) {
    this.dictionary = {
      ...this.dictionary,
      ...Object.fromEntries(data.map((e) => [e.name, e.getImageUrl(1)])),
    };
    this.dictionaryLowerCase = {
      ...this.dictionaryLowerCase,
      ...Object.fromEntries(
        data.map((e) => [e.name.toLowerCase(), e.getImageUrl(1)])
      ),
    };
  }

  addEmotes(data: Record<string, string>) {
    this.dictionary = { ...this.dictionary, ...data };
    this.dictionaryLowerCase = {
      ...this.dictionaryLowerCase,
      ...Object.fromEntries(
        Object.entries(data).map(([k, v]) => [k.toLowerCase(), v])
      ),
    };
    
  }

  async loadEmotes(id: string, apiClient: ApiClient) {
    this.updateReplacementsCache();
    if (!id || !apiClient)
      return;

    await apiClient.chat.getChannelEmotes(id).then(resp => this.addTwitchEmotes(resp));
    await apiClient.chat.getGlobalEmotes().then(resp => this.addTwitchEmotes(resp));
    await Load_FFZ_CHANNEL(id).then(resp => this.addEmotes(resp));
    await Load_FFZ_GLOBAL().then(resp => this.addEmotes(resp));
    await Load_BTTV_CHANNEL(id).then(resp => this.addEmotes(resp));
    await Load_BTTV_GLOBAL().then(resp => this.addEmotes(resp));
    await Load_7TV_CHANNEL(id).then(resp => this.addEmotes(resp));
    await Load_7TV_GLOBAL().then(resp => this.addEmotes(resp));
  }

  dispose() {
    this.dictionary = {};
  }
}

export default TwitchEmotesApi;
