import { toast } from "react-toastify";
import { proxy } from "valtio";
import { IServiceInterface, ServiceNetworkState, TextEventSource, TextEventType } from "../../types";
import { STT_AzureService } from "./services/azure";
import { STT_BrowserService } from "./services/browser";
import { STT_DeepgramService } from "./services/deepgram";
import { STT_Backends } from "./schema";
import {
  ISpeechRecognitionService,
  SpeechServiceEventBindings
} from "./types";
import { STT_SpeechlyService } from "./services/speechly";

const defaultTranslateOptions = {
  client: 'webapp',
  from: 'auto',
  to: 'en',
  hl: 'en',
  tld: 'com',
};

function sM(a: string) {
  let e = [];
  let f = 0;
  for (let g = 0; g < a.length; g++) {
    let l = a.charCodeAt(g);
    128 > l
      ? (e[f++] = l)
      : (2048 > l
        ? (e[f++] = (l >> 6) | 192)
        : (55296 == (l & 64512) &&
        g + 1 < a.length &&
        56320 == (a.charCodeAt(g + 1) & 64512)
          ? ((l = 65536 + ((l & 1023) << 10) + (a.charCodeAt(++g) & 1023)),
            (e[f++] = (l >> 18) | 240),
            (e[f++] = ((l >> 12) & 63) | 128))
          : (e[f++] = (l >> 12) | 224),
          (e[f++] = ((l >> 6) & 63) | 128)),
        (e[f++] = (l & 63) | 128));
  }
  let a_: number = 0;
  for (f = 0; f < e.length; f++) {
    a_ += e[f];
    a_ = xr(a_, '+-a^+6');
  }
  a_ = xr(a_, '+-3^+b+-f');
  a_ ^= 0;
  0 > a_ && (a_ = (a_ & 2147483647) + 2147483648);
  a_ %= 1e6;
  return a_.toString() + '.' + a_.toString();
}

const xr = function (a: number, b: string) {
  for (let c = 0; c < b.length - 2; c += 3) {
    let d: number | string = b.charAt(c + 2);
    d = 'a' <= d ? d.charCodeAt(0) - 87 : Number(d);
    d = '+' == b.charAt(c + 1) ? a >>> d : a << d;
    a = '+' == b.charAt(c) ? a + d : a ^ d;
  }
  return a;
};

class Service_STT implements IServiceInterface {
  #serviceInstance?: ISpeechRecognitionService;

  serviceState = proxy({
    status: ServiceNetworkState.disconnected,
    error: "",
    muted: false
  });

  async init() {}


  get data() {
    return window.API.state.services.stt;
  }

  stop(): void {
    this.#serviceInstance?.stop();
  }

  async #sendFinal(value: string) {  
    !this.serviceState.muted &&
    window.API.pubsub.publishText(TextEventSource.stt, {
      value,
      type: TextEventType.final,
    });
  }

  #sendInterim(value: string) {
    !this.serviceState.muted &&
    window.API.pubsub.publishText(TextEventSource.stt, {
      value,
      type: TextEventType.interim,
    });
  }

  #setStatus(value: ServiceNetworkState) {
    this.serviceState.status = value;
  }

  start() {
    this.stop();
    this.serviceState.error = "";

    let bindings: SpeechServiceEventBindings = {
      onStart: () => this.#setStatus(ServiceNetworkState.connected),
      onStop: (error?: string) => {
        if (error) {
          toast(error, { type: "error", autoClose: false });
          this.serviceState.error = error;
        }
        return this.#setStatus(ServiceNetworkState.disconnected);
      },
      onInterim: (interim: string) => this.#sendInterim(interim),
      onFinal: (final: string) => this.#sendFinal(final),
    };

    let backend = this.data.data.backend;
    if (backend === STT_Backends.browser) {
      this.#serviceInstance = new STT_BrowserService(bindings);
    }
    else if (backend === STT_Backends.azure) {
      this.#serviceInstance = new STT_AzureService(bindings);
    }
    else if (backend === STT_Backends.deepgram) {
      this.#serviceInstance = new STT_DeepgramService(bindings);
    }
    else if (backend === STT_Backends.speechly) {
      this.#serviceInstance = new STT_SpeechlyService(bindings);
    }

    if (!this.#serviceInstance) return;
    this.#setStatus(ServiceNetworkState.connecting);
    this.#serviceInstance.start(this.data.data);
  }
}

export default Service_STT;
