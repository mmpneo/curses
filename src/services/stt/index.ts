import {IServiceInterface} from "../schema";
import { BrowserSpeechRecognitionService } from "./impls/browser";
import { STT_Backends } from "./schema";

class Service_STT implements IServiceInterface {
  init(): void {}

  get state () {
    return window.API.state.services.stt;
  }

  start() {
    if (this.state.data.backend === STT_Backends.browser) {
      new BrowserSpeechRecognitionService(
        () => {},
        () => {},
        (interim) => {},
        (final) => {}
      ).start
    }
  }

}

export default Service_STT;
