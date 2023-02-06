import { IVRCTarget } from "../types";
import { sendOsc }    from "./utils";
import chunk          from "lodash/chunk";

async function sleep(time: number) {
  return new Promise((res) => setTimeout(res, time));
}

class VRC_KillFrenzyTarget implements IVRCTarget {
  private hideTimer?: NodeJS.Timeout

  private isRunning = false;
  private queue: string[] = []

  get state() {
    return window.ApiServer.state.services.vrc.data.killfrenzy
  }
  get delayTimer() {
    return parseInt(this.state.syncDelay) || 250;
  }

  // api
  setVisibility = (Bool: boolean) => sendOsc(`/avatar/parameters/${this.state.KAT_Visible || 'KAT_Visible'}`, [{ Bool }]);
  setPointer =(Int: number) => sendOsc(`/avatar/parameters/${this.state.KAT_Pointer || 'KAT_Pointer'}`, [{ Int }]);
  setSyncChar = (index: number, Float: number) => sendOsc(`/avatar/parameters/${this.state.KAT_CharSync || 'KAT_CharSync'}${index}`, [{ Float }]);

  private triggerTimer() {
    clearTimeout(this.hideTimer);
    this.hideTimer = setTimeout(() => {
      this.setVisibility(false); // hide
      this.setPointer(255); // clear
      this.hideTimer = undefined;
    }, parseInt(this.state.visibleTimer) || 1000);
  }

  async tryDequeueAndSend() {
    if (this.isRunning || !this.queue.length)
      return;

    this.isRunning = true;

    const value = this.queue.shift();

    const syncPointsCount = parseInt(this.state.syncPoints) ?? 0;
    if (!syncPointsCount)
      return;

    clearTimeout(this.hideTimer);

    // prevent insta hide -> show
    await sleep(this.delayTimer);

    if (!this.hideTimer)  // make visible
      this.setVisibility(true);
      else // if visible, just clear
      this.setPointer(255);

      await sleep(this.delayTimer);

    const chunks = chunk(value, syncPointsCount);
    for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
      const chunk = chunks[chunkIndex];

      if (chunkIndex === chunks.length -1) // fill undersized chunk
        chunk.push(...new Array(syncPointsCount - chunks[chunkIndex].length).fill(" ").join(""));

      this.setPointer(chunkIndex + 1);

      for (let i = 0; i < chunk.length; i++) {
        this.setSyncChar(i, (KillsKeys[chunk[i]] ?? 255) / 127);
      }
      await sleep(this.delayTimer);
    }

    this.isRunning = false;
    this.triggerTimer();
    this.tryDequeueAndSend();
  }

  // enqueue sentence
  async pushFinal(value: string) {
    if (this.state.splitSentences) {
      const sentenceSplit = chunk(value, 128).map(str => str.join(""));
      this.queue.push(...sentenceSplit);
    }
    else
      this.queue.push(value.slice(0, 128));
    this.tryDequeueAndSend();
  }

  pushInterim(_value: string): void {}
  cancel(): void {}
}

export default VRC_KillFrenzyTarget;

export const KillsKeys: Record<string, number> = {
  " ": 0,
  "!": 1,
  '"': 2,
  "#": 3,
  $: 4,
  "%": 5,
  "&": 6,
  "'": 7,
  "(": 8,
  ")": 9,
  "*": 10,
  "+": 11,
  ",": 12,
  "-": 13,
  ".": 14,
  "/": 15,
  "0": 16,
  "1": 17,
  "2": 18,
  "3": 19,
  "4": 20,
  "5": 21,
  "6": 22,
  "7": 23,
  "8": 24,
  "9": 25,
  ":": 26,
  ";": 27,
  "<": 28,
  "=": 29,
  ">": 30,
  "?": 31,
  "@": 32,
  A: 33,
  B: 34,
  C: 35,
  D: 36,
  E: 37,
  F: 38,
  G: 39,
  H: 40,
  I: 41,
  J: 42,
  K: 43,
  L: 44,
  M: 45,
  N: 46,
  O: 47,
  P: 48,
  Q: 49,
  R: 50,
  S: 51,
  T: 52,
  U: 53,
  V: 54,
  W: 55,
  X: 56,
  Y: 57,
  Z: 58,
  "[": 59,
  "\\": 60,
  "]": 61,
  "^": 62,
  _: 63,
  "`": 64,
  a: 65,
  b: 66,
  c: 67,
  d: 68,
  e: 69,
  f: 70,
  g: 71,
  h: 72,
  i: 73,
  j: 74,
  k: 75,
  l: 76,
  m: 77,
  n: 78,
  o: 79,
  p: 80,
  q: 81,
  r: 82,
  s: 83,
  t: 84,
  u: 85,
  v: 86,
  w: 87,
  x: 88,
  y: 89,
  z: 90,
  "{": 91,
  "|": 92,
  "}": 93,
  "~": 94,
  "€": 95,
  ぬ: 127,
  ふ: 129,
  あ: 130,
  う: 131,
  え: 132,
  お: 133,
  や: 134,
  ゆ: 135,
  よ: 136,
  わ: 137,
  を: 138,
  ほ: 139,
  へ: 140,
  た: 141,
  て: 142,
  い: 143,
  す: 144,
  か: 145,
  ん: 146,
  な: 147,
  に: 148,
  ら: 149,
  せ: 150,
  ち: 151,
  と: 152,
  し: 153,
  は: 154,
  き: 155,
  く: 156,
  ま: 157,
  の: 158,
  り: 159,
  れ: 160,
  け: 161,
  む: 162,
  つ: 163,
  さ: 164,
  そ: 165,
  ひ: 166,
  こ: 167,
  み: 168,
  も: 169,
  ね: 170,
  る: 171,
  め: 172,
  ろ: 173,
  "。": 174,
  ぶ: 175,
  ぷ: 176,
  ぼ: 177,
  ぽ: 178,
  べ: 179,
  ぺ: 180,
  だ: 181,
  で: 182,
  ず: 183,
  が: 184,
  ぜ: 185,
  ぢ: 186,
  ど: 187,
  じ: 188,
  ば: 189,
  ぱ: 190,
  ぎ: 191,
  ぐ: 192,
  げ: 193,
  づ: 194,
  ざ: 195,
  ぞ: 196,
  び: 197,
  ぴ: 198,
  ご: 199,
  ぁ: 200,
  ぃ: 201,
  ぅ: 202,
  ぇ: 203,
  ぉ: 204,
  ゃ: 205,
  ゅ: 206,
  ょ: 207,
  ヌ: 208,
  フ: 209,
  ア: 210,
  ウ: 211,
  エ: 212,
  オ: 213,
  ヤ: 214,
  ユ: 215,
  ヨ: 216,
  ワ: 217,
  ヲ: 218,
  ホ: 219,
  ヘ: 220,
  タ: 221,
  テ: 222,
  イ: 223,
  ス: 224,
  カ: 225,
  ン: 226,
  ナ: 227,
  ニ: 228,
  ラ: 229,
  セ: 230,
  チ: 231,
  ト: 232,
  シ: 233,
  ハ: 234,
  キ: 235,
  ク: 236,
  マ: 237,
  ノ: 238,
  リ: 239,
  レ: 240,
  ケ: 241,
  ム: 242,
  ツ: 243,
  サ: 244,
  ソ: 245,
  ヒ: 246,
  コ: 247,
  ミ: 248,
  モ: 249,
  ネ: 250,
  ル: 251,
  メ: 252,
  ロ: 253,
  "〝": 254,
  "°": 255,
};
