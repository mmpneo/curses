import { IVRCTarget } from "../types";
import { sendOsc }    from "./utils";
import throttle       from "lodash/throttle";

class VRC_TextboxTarget implements IVRCTarget {
  pushFinal(value: string): void {
    sendOsc("/chatbox/input", [
      { String: value }, // value
      { Bool: true }, // is final
    ]);
  }

  get state() {
    return window.ApiServer.state.services.vrc.data.textbox;
  }

  #sendIndicatorThrottled = throttle(this.#sendIndicator, 1400);
  #sendIndicator(value: boolean) {
    sendOsc("/chatbox/typing", [{ Bool: value }]);
  }
  pushInterim(_value: string): void {
    if (this.state.indicator)
      this.#sendIndicatorThrottled(true);
  }
  cancel(): void {}
}

export default VRC_TextboxTarget;
