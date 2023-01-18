import NiceModal from "@ebay/nice-modal-react";
import { listen } from "@tauri-apps/api/event";
import { A } from "@tauri-apps/api/path-e12e0e34";
import { invoke } from "@tauri-apps/api/tauri";
import hotkeys from "hotkeys-js";
import uniqBy from "lodash/uniqBy";
import { proxy } from "valtio";
import { IServiceInterface, TextEventSource, TextEventType } from "../../types";
import { BackendState } from "../schema";

type ShortcutKeys = keyof BackendState["shortcuts"];
type InputCommands = "submit" | "delete" | "cancel";

/**
 * pubsub
 * keyboard.key string
 * keyboard.cmd left | right | submit | delete
 */
class Service_Keyboard implements IServiceInterface {

  ui = proxy<{
    currentTarget: ShortcutKeys | "",
    showRecorder: boolean,
    currentValue: string,
    backgroundInputActive: boolean
    backgroundInputValue: string
  }>({
    currentTarget: "",
    showRecorder: false,
    currentValue: "",
    backgroundInputActive: false,
    backgroundInputValue: "",
  })

  async init() {
    if (window.platform === "web" || window.mode === "client") {
      return;
    }

    this.rebindShortcutsNative();

    // send hotkeys
    listen<string>('keyboard', e => {
      const str = e.payload;
      console.log(e);
      str.startsWith("shortcut:") && this.processShortcut(str.slice(9) as ShortcutKeys)
      str.startsWith("key:") && this.processKey(str.slice(4));
      str.startsWith("cmd:") && this.processCommand(str.slice(4) as InputCommands);
    }); 
  }

  inputUpdateValue(value: string) {
    this.ui.backgroundInputValue  = value
    window.API.pubsub.publishText(TextEventSource.textfield, { type: TextEventType.interim, value });
  }
  
  private processKey(key: string) {
    this.ui.backgroundInputValue += key;
    this.triggerBackgroundTimer()
  }
  private processCommand(command: InputCommands) {
    if (command === "submit") {
      console.log(this.ui.backgroundInputValue);
      window.API.pubsub.publishText(TextEventSource.textfield, { type: TextEventType.final, value: this.ui.backgroundInputValue });
      this.stopBackgroundInput();
    }
    if (command === "cancel") {
      this.stopBackgroundInput();
    }
  
    if (command === "delete") {
      this.ui.backgroundInputValue = this.ui.backgroundInputValue.slice(0, -1);
      this.triggerBackgroundTimer()
    }
  }

  private processShortcut(shortcut: ShortcutKeys) {
    console.log(shortcut);
    if (shortcut === "bgInput") {
      this.startBackgroundInput();
    }
  }

  // start/restart background timer
  backgroundTimer: NodeJS.Timeout | null = null;
  private triggerBackgroundTimer() {
    if (this.backgroundTimer !== null)
      clearTimeout(this.backgroundTimer);
    this.backgroundTimer = setTimeout(() => this.stopBackgroundInput(), 5000);
  }
  private startBackgroundInput() {
    console.log("start bg input");
    invoke("plugin:keyboard|start_tracking");
    this.ui.backgroundInputActive = true;
    this.triggerBackgroundTimer();
  }
  stopBackgroundInput() {
    console.log("stop bg input");
  
    // for immidiate cancel
    if (this.backgroundTimer !== null)
      clearTimeout(this.backgroundTimer);
    this.ui.backgroundInputActive = false;
    this.backgroundTimer = null;
    this.ui.backgroundInputValue = "";
    invoke("plugin:keyboard|stop_tracking");
  }
  
  async start() {
    invoke("plugin:bg_input|start");
    
  }
  stop() {
    invoke("plugin:bg_input|stop");
  }

  private rebindShortcutsNative() {
    const shortcuts =  Object
      .entries(window.API.state.shortcuts)
      .filter(sc => !!sc[1])
      .map(([key, value]) => ({name: key, keys: value.split("+")}));
      console.log(shortcuts);
    invoke("plugin:keyboard|apply_shortcuts", {shortcuts});
  }

  private tempRecordSet = new Set<{key: string, code: number}>;
  async startShortcutRecord(target: ShortcutKeys) {
    this.ui.currentTarget = target;
    this.ui.showRecorder = true;
    hotkeys("*", e => {
      this.tempRecordSet.add({key: e.code, code: e.keyCode});
      let arr = Array.from(this.tempRecordSet).filter(key => hotkeys.isPressed(key.code));
      this.tempRecordSet = new Set(uniqBy(arr, "code"));
      this.ui.currentValue = Array.from(this.tempRecordSet).map(k => (<any>NativeKeysMap)[k.key] as string).join("+")
      e.preventDefault();
    })
  }
  confirmShortcutRecord() {
    this.ui.showRecorder = false;
    this.ui.currentValue = "";
    hotkeys.unbind("*");
    let value = Array.from(this.tempRecordSet).map(k => (<any>NativeKeysMap)[k.key] as string).join("+");
    this.tempRecordSet.clear();

    if (!this.ui.currentTarget)
      return;
    // if shortuct already exists
    if (Object.values(window.API.state.shortcuts).includes(value))
      return;

    window.API.state.shortcuts[this.ui.currentTarget] = value;
    this.rebindShortcutsNative();
  }
  cancelComboRecord() {
    this.ui.showRecorder = false;
    this.ui.currentValue = "";
    hotkeys.unbind("*");
    this.tempRecordSet.clear();
  }
}

enum NativeKeysMap {
  KeyA = "A",
  KeyB = "B",
  KeyC = "C",
  KeyD = "D",
  KeyE = "E",
  KeyF = "F",
  KeyG = "G",
  KeyH = "H",
  KeyI = "I",
  KeyJ = "J",
  KeyK = "K",
  KeyL = "L",
  KeyM = "M",
  KeyN = "N",
  KeyO = "O",
  KeyP = "P",
  KeyQ = "Q",
  KeyR = "R",
  KeyS = "S",
  KeyT = "T",
  KeyU = "U",
  KeyV = "V",
  KeyW = "W",
  KeyX = "X",
  KeyY = "Y",
  KeyZ = "Z",
  Digit0 = "Number0",
  Digit1 = "Number1",
  Digit2 = "Number2",
  Digit3 = "Number3",
  Digit4 = "Number4",
  Digit5 = "Number5",
  Digit6 = "Number6",
  Digit7 = "Number7",
  Digit8 = "Number8",
  Digit9 = "Number9",
  AltLeft = "LeftAlt",
  AltRight = "RightAlt",
  ShiftLeft = "LeftShift",
  ShiftRight = "RightShift",
  ControlLeft = "LeftControl",
  ControlRight = "RightControl",
  Backspace = "BackSpace",
  Tab = "Tab",
  Enter = "Enter",
  Escape = "Escape",
  Space = "Space",
  PageUp = "PageUp",
  PageDown = "PageDown",
  Home = "Home",
  ArrowLeft = "Left",
  ArrowUp = "Up",
  ArrowRight = "Right",
  ArrowDown = "Down",
  Print = "Print",
  PrintScreen = "PrintScreen",
  Insert = "Insert",
  Delete = "Delete",
  MetaLeft = "LeftWindows",
  MetaRight = "RightWindows",
  Comma = "Comma",         // ,<
  Period = "Period",        // .>
  Slash = "Slash",         // /?
  Semicolon = "SemiColon",     // ;:
  Quote = "Apostrophe",    // '"
  BracketLeft = "LeftBrace",     // [{
  Backslash = "BackwardSlash", // \|
  BracketRight = "RightBrace",    // ]}
  Backquote = "Grave",         // `~
  F1 = "F1",
  F2 = "F2",
  F3 = "F3",
  F4 = "F4",
  F5 = "F5",
  F6 = "F6",
  F7 = "F7",
  F8 = "F8",
  F9 = "F9",
  F10 = "F10",
  F11 = "F11",
  F12 = "F12",
  F13 = "F13",
  F14 = "F14",
  F15 = "F15",
  F16 = "F16",
  F17 = "F17",
  F18 = "F18",
  F19 = "F19",
  F20 = "F20",
  F21 = "F21",
  F22 = "F22",
  F23 = "F23",
  F24 = "F24",
  NumLock = "NumLock",
  ScrollLock = "ScrollLock",
  CapsLock = "CapsLock",
  Numpad0 = "Numpad0",
  Numpad1 = "Numpad1",
  Numpad2 = "Numpad2",
  Numpad3 = "Numpad3",
  Numpad4 = "Numpad4",
  Numpad5 = "Numpad5",
  Numpad6 = "Numpad6",
  Numpad7 = "Numpad7",
  Numpad8 = "Numpad8",
  Numpad9 = "Numpad9",
  NumpadMultiply = "Multiply",
  NumpadAdd = "Add",
  Separator = "Separator",
  NumpadSubtract = "Subtract",
  NumpadDecimal = "Decimal",
  NumpadDivide = "Divide",
}
export default Service_Keyboard;
