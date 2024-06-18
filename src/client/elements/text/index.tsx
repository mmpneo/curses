import fastEqual from "fast-deep-equal";
import { FC, memo, useEffect, useRef } from "react";
import { subscribe, useSnapshot } from "valtio";
import { useGetState } from "../..";
import { TextEvent, TextEventSource, TextEventType } from "../../../types";
import { Element_TextState } from "./schema";
import { buildStateStyle, elementStyle } from "./style";

type SentenceState = {
  type: TextEventType
  element: HTMLElement
  text: string
  cursor: number
  cursorProfanity: number
  profanityCursorList: Record<number, any>
  isAnimated: boolean,
  emotes: Record<number, string>
}

class TextController {
  constructor(private id: string) {}
  private disposed: boolean = false;

  private boxElement!: HTMLElement
  private containerElement!: HTMLElement
  private scrollContainerElement!: HTMLElement
  private textElement!: HTMLElement
  private textEndElement!: HTMLSpanElement
  private baseStyleElement!: HTMLStyleElement;
  private stateStyleElement!: HTMLStyleElement;

  private textObserver!: ResizeObserver;

  private eventTextRef: any;
  private eventTextInputRef: any;
  private storeEventCancelToken?: () => void;
  private sceneChangeEventCancelToken?: () => void;

  private currentState!: Element_TextState;
  private sentenceQueue: SentenceState[] = [];

  private isPlayingAnimation = false;

  private activityTimerHandle: number = -1;
  private activityTimerDelayClearHandle: number = -1;

  onShow() {
    if (this.currentState.soundEnable && this.currentState.soundFileOnShow) {
      window.ApiClient.sound.playFile(this.currentState.soundFileOnShow, {volume: this.currentState.soundVolume ?? 1});
    }
  }
  onHide() {
    if (this.currentState.soundEnable && this.currentState.soundFileOnHide) {
      window.ApiClient.sound.playFile(this.currentState.soundFileOnHide, {volume: this.currentState.soundVolume ?? 1});
    }
  }
  onNewSentence() {}

  onActivity() {
    try {
      const rect = this.textEndElement.getBoundingClientRect();
  
      if (this.currentState.animateEvent) {
        window.ApiShared.pubsub.publishLocally({ topic: `element.${this.id}` });
      }
  
      if (rect && this.currentState.particlesEnable) {
        //TODO cache particle config
        window.ApiClient.particles.emit(rect, {
          imageIds: [
            this.currentState.particlesSpriteFileIdFirst,
            this.currentState.particlesSpriteFileIdSecond,
            this.currentState.particlesSpriteFileIdThird,
          ].filter(s => !!s),
          particlesCountMin: parseFloat(this.currentState.particlesCountMin) || 0,
          particlesCountMax: parseFloat(this.currentState.particlesCountMax) || 0,
          particlesDurationMin: parseFloat(this.currentState.particlesDurationMin) || 0,
          particlesDurationMax: parseFloat(this.currentState.particlesDurationMax) || 0,
          particlesDirectionXMin: parseFloat(this.currentState.particlesDirectionXMin) || 0,
          particlesDirectionXMax: parseFloat(this.currentState.particlesDirectionXMax) || 0,
          particlesDirectionYMin: parseFloat(this.currentState.particlesDirectionYMin) || 0,
          particlesDirectionYMax: parseFloat(this.currentState.particlesDirectionYMax) || 0,
          particlesScaleMin: parseFloat(this.currentState.particlesScaleMin) || 1,
          particlesScaleMax: parseFloat(this.currentState.particlesScaleMax) || 1,
          particlesRotationMin: parseFloat(this.currentState.particlesRotationMin) || 0,
          particlesRotationMax: parseFloat(this.currentState.particlesRotationMax) || 0,
        });
      }
  
      if (this.currentState.soundEnable && this.currentState.soundFile) {
        window.ApiClient.sound.playFile(this.currentState.soundFile, {
          volume: this.currentState.soundVolume ?? 1,
          detuneMin: this.currentState.soundDetuneMin ?? 0,
          detuneMax: this.currentState.soundDetuneMax ?? 0,
          playbackMin: this.currentState.soundPlaybackMin ?? 1,
          playbackMax: this.currentState.soundPlaybackMax ?? 1,
        });
      }
    } catch (error) {
      
    }
  }

  // start/restart activity timer
  triggerActivity() {
    // reset timer
    clearTimeout(this.activityTimerHandle);
    clearTimeout(this.activityTimerDelayClearHandle);

    // const previewEnabled = this.currentState.previewMode;
    

    if (!this.boxElement.classList.contains("active")) {
      this.onShow();
      this.boxElement.classList.add("active");
    }

    this.activityTimerHandle = setTimeout(() => {
      this.boxElement.classList.remove("active");

      this.onHide();

      this.activityTimerDelayClearHandle = setTimeout(() => {
        this.clearSentences();
      }, this.currentState.behaviorClearDelay) as unknown as number;
    }, this.currentState.behaviorClearTimer) as unknown as number;
  }

  clearSentences() {
    for (let v of this.sentenceQueue) {
      v.element.remove();
    }
    // this.textElement.replaceChildren();
    this.sentenceQueue.length = 0;
  }

  moveCursorToSpaceOrEnd(sentence: SentenceState) {
    let emoteEndIndex = sentence.text.indexOf(" ", sentence.cursor);
    if (emoteEndIndex === -1) { // if last
      emoteEndIndex = sentence.text.length;
    }
    sentence.cursor = emoteEndIndex;
  }

  stepSentenceAnimation(sentence: SentenceState) {
    if (this.disposed) {
      return
    }
    // end sentence animation
    if (sentence.cursor >= sentence.text.length) {
      sentence.isAnimated = true;
      this.isPlayingAnimation = false;
      this.tryAnimateNextSentence();
      // add space in the end
      sentence.element.innerHTML += " ";
      return;
    }

    this.isPlayingAnimation = true;

    this.triggerActivity();
    sentence.text[sentence.cursor] !== " " && this.onActivity();

    //profanity mask
    if (sentence.cursor in sentence.profanityCursorList) {
      const maskStr: string = this.currentState.textProfanityMask;

      if (this.currentState.animateDelayChar === 0) {
        sentence.element.innerHTML += `<span class="profanity">${maskStr}</span>`; 
        this.moveCursorToSpaceOrEnd(sentence);
      }
      else {
        sentence.element.innerHTML += `<span class="profanity">${maskStr[sentence.cursorProfanity]}</span>`; 
  
        // finish mask stepping
        if (sentence.cursorProfanity +1 >= maskStr.length) {
          this.moveCursorToSpaceOrEnd(sentence);
          sentence.cursorProfanity = 0;
        }
        else {
          sentence.cursorProfanity++;
        }
      }
    }
    // insert emote
    else if (sentence.cursor in sentence.emotes) {
      sentence.element.innerHTML += `<img src=${sentence.emotes[sentence.cursor]} />`;
      this.moveCursorToSpaceOrEnd(sentence);
    }
    // insert text
    else {
      // animate whole word
      if (this.currentState.animateDelayChar === 0 && sentence.text[sentence.cursor] !== " ") {
        // skip to next word
        const wordStart = sentence.cursor;
        this.moveCursorToSpaceOrEnd(sentence);
        sentence.element.innerHTML += sentence.text.substring(wordStart, sentence.cursor);
      }
      // animate single char
      else {
        sentence.element.innerHTML += sentence.text[sentence.cursor];
        sentence.cursor ++;
      }
    }

    setTimeout(() => this.stepSentenceAnimation(sentence), sentence.text[sentence.cursor] === " " ? 
      this.currentState.animateDelayWord - this.currentState.animateDelayChar :
      this.currentState.animateDelayChar);
  }

  tryAnimateNextSentence() {
    if (this.isPlayingAnimation) {
      return;
    }

    const interimIndex = this.sentenceQueue.findIndex(s => !s.isAnimated); // todo cache index
    if (interimIndex !== -1) {
      // run animation
      this.stepSentenceAnimation(this.sentenceQueue[interimIndex]);
    }
  }

  enqueueSentence(event: TextEvent) {
    if (!this.currentState.sourceInterim && event?.type === TextEventType.interim) {
      return;
    }

    // insert animated text
    if (this.currentState.animateEnable) {
      // ignore interim
      if (event.type === TextEventType.interim) {
        return;
      }

      const sentenceState: SentenceState = {
        type: event.type,
        element: document.createElement("span"),
        text: event.value,
        cursor: 0,
        cursorProfanity: 0,
        profanityCursorList: {},
        isAnimated: false,
        emotes: event.emotes
      }

      // find profanity
      const maskedValue = event.value.matchAll(/[^\s\.,?!]*\*+[^\s\.,?!]*/gi);
      for(let v of maskedValue) {
        sentenceState.profanityCursorList[v.index as number] = true;
      }

      this.sentenceQueue.push(sentenceState);
      this.textElement.insertBefore(sentenceState.element, this.textEndElement);
      this.tryAnimateNextSentence();

    }
    // insert static text
    else {
      const interimIndex = this.sentenceQueue.findIndex(s => s.type === TextEventType.interim); // todo cache index
      
      let filteredText = event.value.replaceAll(/[^\s\.,?!]*\*+[^\s\.,?!]*/gi, `<span class="${event.type === TextEventType.interim ? 'interim' : ''} profanity">${this.currentState.textProfanityMask}</span>`);
      for (let emoteKey in event.emotes) {
        // ignore cursors
        if (typeof emoteKey === "string") {          
          filteredText = filteredText.replaceAll(emoteKey, `<img src="${event.emotes[emoteKey]}" />`)
        }
      }

      // add space
      filteredText += " ";

      // update interim
      if (interimIndex !== -1) {

        // remove interim / drop active state
        if (event.value === "") {
          this.sentenceQueue[interimIndex].element?.remove?.();
          this.sentenceQueue.splice(interimIndex, 1);

          if (!this.sentenceQueue.length) {
            this.boxElement.classList.remove("active");
          }
          return;
        }

        const sentenceElement = this.sentenceQueue[interimIndex].element;
        this.sentenceQueue[interimIndex].type = event.type;
        if (sentenceElement) {
          sentenceElement.innerHTML = filteredText;
          // final
          if (event.type === TextEventType.final) {
            sentenceElement.classList.remove("interim");
          }
        }
      }
      else {
        // create new sentence
        const sentenceState: SentenceState = {
          type: event.type,
          element: document.createElement("span"),
          text: event.value,
          cursor: 0,
          cursorProfanity: 0,
          profanityCursorList: {},
          isAnimated: true,
          emotes: event.emotes
        }

        this.sentenceQueue.push(sentenceState);
        sentenceState.element.innerHTML = filteredText;
        if (event.type === TextEventType.interim) {
          sentenceState.element.classList.add("interim");
        }
        this.textElement.insertBefore(sentenceState.element, this.textEndElement);
      }
      this.onActivity();
    }
    this.triggerActivity();
  }

  onResize() {
    this.scrollContainerElement.scrollTo({ top: this.scrollContainerElement.scrollHeight, behavior: "smooth" });
  }

  // copy state for faster access
  onStateChange(){
    // detect changes
    const scene = window.ApiClient.scenes.state.activeScene;
    const storedState = window.ApiClient.document.fileBinder.get().elements[this.id].scenes[scene].data as Element_TextState;
    if (fastEqual(storedState, this.currentState)) {
      return;
    }
    this.currentState = storedState;

    // update styles
    this.stateStyleElement.innerHTML = buildStateStyle(this.currentState);

    // rebind events
    this.bindTextEvents();

    if (this.currentState.previewMode) {
      this.boxElement.classList.add("active");
    }
    else {
      this.boxElement.classList.remove("active");
    }
  }


  bindTextEvents() {
    // primary event sub
    window.ApiShared.pubsub.unsubscribe(this.eventTextRef);
    this.eventTextRef = window.ApiShared.pubsub.subscribeText(this.currentState.sourceMain, e => e?.value && this.enqueueSentence(e));

    // kb input event sub
    window.ApiShared.pubsub.unsubscribe(this.eventTextInputRef);
    this.eventTextInputRef = window.ApiShared.pubsub.subscribeText(TextEventSource.textfield, e => e && this.enqueueSentence(e), true);
  }

  bindContainer(containerElement: HTMLDivElement | null) {
    if (!containerElement) {
      return;
    }

    this.containerElement = containerElement;
    this.boxElement = this.containerElement.querySelector(".box") as HTMLElement;
    this.textElement = this.containerElement.querySelector(".text") as HTMLElement;
    this.textEndElement = this.containerElement.querySelector(".text-end") as HTMLSpanElement;
    this.scrollContainerElement = this.containerElement.querySelector(".scroll-container") as HTMLElement;

    // create base style ele
    this.baseStyleElement = document.createElement("style");
    this.baseStyleElement.innerHTML = elementStyle;
    this.containerElement.append(this.baseStyleElement);

    // create state style ele
    this.stateStyleElement = document.createElement("style");
    this.containerElement.append(this.stateStyleElement);

    // listen for text or container sizes
    this.textObserver = new ResizeObserver(e => this.onResize());
    this.textObserver.observe(this.textElement);
    this.textObserver.observe(this.scrollContainerElement);
    
    // subscribe to store updates
    this.sceneChangeEventCancelToken = subscribe(window.ApiClient.scenes.state, () => this.onStateChange());
    this.storeEventCancelToken = window.ApiClient.document.fileBinder.subscribe(data => this.onStateChange());

    this.onStateChange();
  }

  dispose() {
    this.disposed = true;
    this.textObserver.disconnect();
    this.sceneChangeEventCancelToken?.();
    this.storeEventCancelToken?.();
    window.ApiShared.pubsub.unsubscribe(this.eventTextRef);
    window.ApiShared.pubsub.unsubscribe(this.eventTextInputRef);
  }
}
// state.previewMode
const Element_Text: FC<{ id: string }> = memo(({ id }) => {
  const controller = useRef(new TextController(id));
  const {activeScene} = useSnapshot(window.ApiClient.scenes.state);
  const state = useGetState(state => (state.elements[id].scenes[activeScene].data as Element_TextState));

  useEffect(() => {
    return () => controller.current.dispose();
  }, []);

  return <div className="container" ref={ele => controller.current.bindContainer(ele)}>
    <div className="box">
      <div className="scroll-container">
        <div className="text-container">
          <span className="text">
            {state.previewMode && <span>This is <span className="profanity">{state.textProfanityMask || '***'}</span> test! <span className="interim">This is interim test</span> </span>}
            <span className="text-end"></span>
          </span>
        </div>
      </div>
    </div>
  </div>
});
export default Element_Text;