import classNames from "classnames";
import produce from "immer";
import { nanoid } from "nanoid";
import { createContext, FC, memo, PropsWithChildren, useCallback, useEffect, useRef, useState } from "react";
import { useMeasure, useTimeoutFn } from "react-use";
import { useGetState } from "../..";
import { TextEvent, TextEventSource, TextEventType } from "../../../types";
import { Element_TextState } from "./schema";
import TextSentence, { TextSentenceTest } from "./sentence";
import { boxCtx, sentenceCtx, TextSentenceData } from "./shared";
import { elementStyle } from "./style";

const Element_Text: FC<{ id: string }> = memo(({ id }) => {
  const isRunning = useRef(false);
  const state: Element_TextState = useGetState(state => state.elements[id].scenes["main"].data);
  const stateRef = useRef<Element_TextState>({} as Element_TextState);
  stateRef.current = state;

  const [sentences, setSentences] = useState<TextSentenceData[]>([]);
  const sentencesRef = useRef<TextSentenceData[]>([]);

  sentencesRef.current = sentences;

  const sentenceQueue = useRef<TextSentenceData[]>([]);

  const behaviorClearDelayCancelToken = useRef(-1);
  const [active, setActive] = useState(false);

  const [_clearTimeoutReady, cancelClearTimer, startClearTimer] = useTimeoutFn(() => {
    if (!active)
      return;
    setActive(false);

    // play hide sound
    if (stateRef.current.soundFileOnHide) {
      window.ApiClient.sound.playFile(stateRef.current.soundFileOnHide);
    }

    if (sentenceQueue.current.length === 0)
      behaviorClearDelayCancelToken.current = setTimeout(() => {
        setSentences([]);
      }, stateRef.current.behaviorClearDelay) as unknown as number;
  }, state.behaviorClearTimer);

  const tryDequeue = () => {
    if (isRunning.current)
      return;
    const nextSentence = sentenceQueue.current.shift();
    if (!nextSentence)
      return;

    if (stateRef.current.behaviorLastSentence)
      setSentences([nextSentence]);
    else {
      setSentences(v => [...v, nextSentence]);
    }

    if (stateRef.current.soundFileNewSentence && sentencesRef.current.length) {
      window.ApiClient.sound.playFile(stateRef.current.soundFileNewSentence);
    }

    setActive(true);

    // play show sound
    if (stateRef.current.soundFileOnShow)
      window.ApiClient.sound.playFile(stateRef.current.soundFileOnShow);

    isRunning.current = true;
  }

  const enqueueSentence = (event: TextEvent) => {
    clearTimeout(behaviorClearDelayCancelToken.current); // cancel clear
    cancelClearTimer();
    const isInterim = event.type === TextEventType.interim;
    const data: TextSentenceData = {
      id: nanoid(),
      value: event.value.trim(),
      emotes: event.emotes,
      interim: stateRef.current.animateEnable ? false : isInterim,
      state: { ...stateRef.current }
    };

    if (stateRef.current.animateEnable) {
      if (isInterim) { // animation enabled -> ignore interim result completely
        // show indicator
      } else { // queue add
        sentenceQueue.current.push(data);
        tryDequeue();
      }
    }
    else {

      const lookForInterim = sentencesRef.current.findIndex(s => s.interim); // todo cache index
      // ignore interim results if has sentence animating and no active interim
      if (lookForInterim < 0 && isRunning.current && isInterim) {
        return;
      }
      if (!event.value && lookForInterim >= 0) {
        sentenceQueue.current.splice(lookForInterim);
        isRunning.current = false;
        setSentences(l => l.filter(l => !l.interim));
        onComplete();
        return;
        // cancel last interim
      }

      if (lookForInterim >= 0) { // update last interim sentence
        setSentences(produce(t => {
          t[lookForInterim].value = event.value;
          t[lookForInterim].emotes = event.emotes;
          t[lookForInterim].interim = isInterim;
        }));
      }
      else { // push new sentence
        sentenceQueue.current.push(data);
        tryDequeue();
      }
    }
  }

  const name = useGetState(s => s.elements[id].name);
  useEffect(() => {
    const event = {
      label: `${name || 'Text element'} activity`,
      value: `element.${id}`
    }
    window.ApiShared.pubsub.registerEvent(event)
    return () => { window.ApiShared.pubsub.unregisterEvent(event); }
  }, [name]);

  useEffect(() => {
    const sub = window.ApiShared.pubsub.subscribeText(state.sourceMain, event => {
      if (!stateRef.current.sourceInterim && event?.type === TextEventType.interim)
        return;
      event?.value && enqueueSentence(event);
    });
    return () => window.ApiShared.pubsub.unsubscribe(sub);
  }, [state.sourceMain, state.behaviorClearTimer]);

  useEffect(() => {
    if (!state.sourceInputField)
      return;
    const sub = window.ApiShared.pubsub.subscribeText(TextEventSource.textfield, event => {
      if (!stateRef.current.sourceInterim && event?.type === TextEventType.interim)
        return;
      event && enqueueSentence(event);
    }, true);
    return () => window.ApiShared.pubsub.unsubscribe(sub);
  }, [state.sourceInputField, state.behaviorClearTimer]);

  const onComplete = useCallback(() => {
    isRunning.current = false;
    if (sentenceQueue.current.length) // try to dequeue with delay
      setTimeout(() => tryDequeue(), stateRef.current.animateDelaySentence)
    else
      startClearTimer();
  }, [state.behaviorClearTimer]);

  const onActivity = (rect?: DOMRect) => {
    // play sound
    if (stateRef.current.soundEnable && stateRef.current.soundFile) {
      window.ApiClient.sound.playFile(stateRef.current.soundFile, {
        volume: stateRef.current.soundVolume || 1,
        detuneMin: stateRef.current.soundDetuneMin || 0,
        detuneMax: stateRef.current.soundDetuneMax || 0,
        playbackMin: stateRef.current.soundPlaybackMin || 1,
        playbackMax: stateRef.current.soundPlaybackMax || 1,
      });
    }
    if (rect && stateRef.current.particlesEnable) {
      //TODO cache particle config
      window.ApiClient.particles.emit(rect, {
        imageIds: [
          stateRef.current.particlesSpriteFileIdFirst,
          stateRef.current.particlesSpriteFileIdSecond,
          stateRef.current.particlesSpriteFileIdThird,
          // "https://www.pngkit.com/png/full/114-1146708_sushi-sashimi-pixel-art-pixelart-food-asian-pixel.png"
        ].filter(s => !!s),
        particlesCountMin: parseFloat(stateRef.current.particlesCountMin) || 0,
        particlesCountMax: parseFloat(stateRef.current.particlesCountMax) || 0,
        particlesDurationMin: parseFloat(stateRef.current.particlesDurationMin) || 0,
        particlesDurationMax: parseFloat(stateRef.current.particlesDurationMax) || 0,
        particlesDirectionXMin: parseFloat(stateRef.current.particlesDirectionXMin) || 0,
        particlesDirectionXMax: parseFloat(stateRef.current.particlesDirectionXMax) || 0,
        particlesDirectionYMin: parseFloat(stateRef.current.particlesDirectionYMin) || 0,
        particlesDirectionYMax: parseFloat(stateRef.current.particlesDirectionYMax) || 0,
        particlesScaleMin: parseFloat(stateRef.current.particlesScaleMin) || 1,
        particlesScaleMax: parseFloat(stateRef.current.particlesScaleMax) || 1,
        particlesRotationMin: parseFloat(stateRef.current.particlesRotationMin) || 0,
        particlesRotationMax: parseFloat(stateRef.current.particlesRotationMax) || 0,
      });
    }

    // emit activity event
    if (stateRef.current.animateEvent) {
      window.ApiShared.pubsub.publishLocally({ topic: `element.${id}` });
    }
  }

  return <>
    <style>{elementStyle}</style>
    <style>{`
    .container{
      align-items: ${state.boxAlignH};
      justify-content: ${state.boxAlignV};
    }
    .box{
      transform: translate3d(0,0,0);
      overflow-y: scroll;
      justify-content: start;
      width: ${state.boxAutoWidth ? 'auto' : '100%'};
      height: ${state.boxAutoHeight ? 'auto' : '100%'};
      
      padding: ${state.boxScrollPaddingTop}px ${state.boxScrollPaddingRight}px ${state.boxScrollPaddingBottom}px ${state.boxScrollPaddingLeft}px;
      
      ${state.boxBackgroundType == "solid" ?
        `
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      background-color: ${state.boxColor};
      background-image: url("${window.ApiClient.files.getFileUrl(state.boxImageFileId)}");
      border-style: solid;
      border-radius: ${state.boxBorderRadius}px;
      border-width: ${state.boxBorderWidth}px;
      border-color: ${state.boxBorderColor};
      ` :
        `
      border-image: url(${window.ApiClient.files.getFileUrl(state.boxImageFileId)}) ${state.boxSliceTileSize} round;
      border-image-slice: ${state.boxSliceTop} ${state.boxSliceRight} ${state.boxSliceBottom} ${state.boxSliceBottom} fill;
      border-image-width: ${state.boxSliceTop}px ${state.boxSliceRight}px ${state.boxSliceBottom}px ${state.boxSliceBottom}px;
      `}
    }
    .box::-webkit-scrollbar {
      display: none;
    }

    .text-container{
      align-items: ${state.textAlignH};
      justify-content: ${state.textAlignV};
      display: flex;
      flex: 0 0 auto;
      flex-direction: column;
      min-height: 100%;
      min-width: 100%;
    }

    .text{
      padding: ${state.boxPadding}px;
      font-family: ${state.textFontFamily};
      text-transform: ${state.textCase};
      text-align: ${state.textAlignH};
      font-size: ${state.textFontSize}px;
      font-weight: ${state.textFontWeight};
      line-height: ${state.textLineHeight};
      color: ${state.textColor};
      text-shadow: ${state.textShadowX}px ${state.textShadowY}px ${state.textShadowZ}px ${state.textShadowColor};
      
      -webkit-text-stroke: ${state.textStroke}px ${state.textStrokeColor};
      text-stroke: ${state.textStroke}px ${state.textStrokeColor};
    }
    .text img {
      height: ${state.textFontSize}px;
    }
    .profanity {
      color: ${state.textProfanityColor}
    }
    .interim {
      color: ${state.textColorInterim}
    }
    .interim.profanity {
      color: ${state.textProfanityInterimColor}
    }
    
    .char.animate {
      animation: charAppear ${state.animateDelayChar || 20}ms ease-in-out;
    }
    .scroll-container {
      transform: translate3d(0,0,0);
      min-height: 100%;
      min-width: 100%;
      max-height: 100%;
      overflow-y: scroll;
    }
    .scroll-container::-webkit-scrollbar {
      display: none;
    }
    `}</style>
    <style>{state.css}</style>
    <div className="container">
      <BoxElement className={classNames("box", { active: active || state.previewMode })}>
        <span className="text">
          {state.previewMode && <TextSentenceTest state={state} />}
          {sentences.map(data => <sentenceCtx.Provider key={data.id} value={{ data, onActivity, onComplete }}>
            <TextSentence key={data.id} />
          </sentenceCtx.Provider>)}
        </span>
      </BoxElement>
    </div>
  </>

});
// todo path box ref to sentences
const BoxElement: FC<PropsWithChildren<any>> = memo(({ children, ...boxProps }) => {
  const boxRef = useRef<HTMLDivElement>(null)
  const [scrollRef, scrollRect] = useMeasure<HTMLDivElement>();
  const [textRef, textRect] = useMeasure<HTMLDivElement>();

  useEffect(() => {
    if (textRect.height === scrollRect.height)
      return;
    boxRef.current?.scrollTo({ top: boxRef.current.scrollHeight, behavior: "smooth" });
  }, [textRect.height, scrollRect.height]);

  return <div {...boxProps}>
    <div className="scroll-container" ref={element => {
      element && scrollRef(element);
      (boxRef.current as any) = element;
    }}>
      <boxCtx.Provider value={{}}>
        <span ref={textRef} className="text-container">
          {children}
        </span>
      </boxCtx.Provider>
    </div>
  </div>
})
export default Element_Text;
