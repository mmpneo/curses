import classNames from "classnames";
import produce from "immer";
import { nanoid } from "nanoid";
import { FC, memo, PropsWithChildren, useCallback, useEffect, useRef, useState } from "react";
import { useMeasure, useTimeoutFn } from "react-use";
import { useGetState } from "../..";
import { TextEvent, TextEventSource, TextEventType } from "../../../types";
import Inspector_ElementText from "./inspector";
import { Element_TextState, Element_TextStateSchema } from "./schema";
import TextSentence, { sentenceCtx, TextSentenceData, TextSentenceTest } from "./sentence";
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
    setActive(false);
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
    else
      setSentences(v => [...v, nextSentence]);
    setActive(true);
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
    window.API.pubsub.registerEvent(event)
    return () => { window.API.pubsub.unregisterEvent(event); }
  }, [name]);

  useEffect(() => {
    const sub = window.API.pubsub.subscribeText(state.sourceMain, event => {
      if (!stateRef.current.sourceInterim && event?.type === TextEventType.interim)
        return;
      event?.value && enqueueSentence(event);
    });
    return () => window.API.pubsub.unsubscribe(sub);
  }, [state.sourceMain, state.behaviorClearTimer]);

  useEffect(() => {
    if (!state.sourceInputField)
      return;
    const sub = window.API.pubsub.subscribeText(TextEventSource.textfield, event => {
      if (!stateRef.current.sourceInterim && event?.type === TextEventType.interim)
        return;
      event && enqueueSentence(event);
    }, true);
    return () => window.API.pubsub.unsubscribe(sub);
  }, [state.sourceInputField, state.behaviorClearTimer]);

  const onComplete = useCallback(() => {
    isRunning.current = false;
    if (sentenceQueue.current.length) // try to dequeue with delay
      setTimeout(() => tryDequeue(), stateRef.current.animateDelaySentence)
    else
      startClearTimer();
  }, [state.behaviorClearTimer]);

  const onActivity = () => {
    // play sound
    if (stateRef.current.soundEnable && stateRef.current.soundFile) {
      window.APIFrontend.sound.playFile(stateRef.current.soundFile, {
        volume: stateRef.current.soundVolume || 1,
        detuneMin: stateRef.current.soundDetuneMin || 0,
        detuneMax: stateRef.current.soundDetuneMax || 0,
        playbackMin: stateRef.current.soundPlaybackMin || 1,
        playbackMax: stateRef.current.soundPlaybackMax || 1,
      });
    }

    // emit activity event
    if (stateRef.current.animateEvent) {
      window.API.pubsub.publishLocally({ topic: `element.${id}` });
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
      overflow-y: scroll;
      justify-content: start;
      background-color: ${state.boxColor};
      width: ${state.boxAutoWidth ? 'auto' : '100%'};
      height: ${state.boxAutoHeight ? 'auto' : '100%'};
      border-style: solid;
      border-radius: ${state.boxBorderRadius}px;
      border-width: ${state.boxBorderWidth}px;
      border-color: ${state.boxBorderColor};
    }
    .box::-webkit-scrollbar {
      display: none;
    }

    .scrollbox{
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
    .scroll-container {
      min-height: calc((${state.textFontSize}px + (${state.boxPadding}px * 2)) * ${state.textLineHeight});
    }
    `}</style>
    <style>{state.css}</style>
    <div className="container">
      <BoxElement className={classNames("box", { active: active || state.previewMode })}>
        <span className="text">
          {state.previewMode && <TextSentenceTest state={state} />}
          {sentences.map(data => <sentenceCtx.Provider key={data.id} value={{data, onActivity, onComplete}}>
            <TextSentence key={data.id} />
          </sentenceCtx.Provider>)}
        </span>
      </BoxElement>
    </div>
  </>

});

const BoxElement: FC<PropsWithChildren<any>> = memo(({ children, ...boxProps }) => {
  const boxRef = useRef<HTMLDivElement>(null)
  const [scrollRef, scrollRect] = useMeasure<HTMLDivElement>();
  const [textRef, textRect] = useMeasure<HTMLDivElement>();

  useEffect(() => {
    if (textRect.height === scrollRect.height)
      return;
    boxRef.current?.scrollTo({ top: boxRef.current.scrollHeight, behavior: "smooth" });
  }, [textRect.height, scrollRect.height]);

  return <div {...boxProps} ref={element => {
    element && scrollRef(element);
    (boxRef.current as any) = element;

  }}>
    <span ref={textRef} className="scrollbox">
      {children}
    </span>
  </div>
})
export { Inspector_ElementText, Element_TextStateSchema }
export default Element_Text;