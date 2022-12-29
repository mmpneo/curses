import { createContext, FC, memo, useCallback, useContext, useEffect, useLayoutEffect, useRef } from "react";
import { TextEvent } from "../../../types";
import { Element_TextState } from "./schema";

declare module 'csstype' {
  interface Properties {
    '--time'?: string
    '--index'?: string | number
    '--wordindex'?: string | number
  }
}

export type TextSentenceData = {
  id: string;
  value: string;
  interim: boolean;
  emitEvent?: string;
  emotes: TextEvent["emotes"]
  state: Element_TextState
}

const enum TextSymbolType {
  char,
  img,
  profanity
  // .. mb svg
}

const enum TextWordType {
  char,
  img,
  profanity
}

export const sentenceCtx = createContext<{
  data: TextSentenceData,
  onActivity: (rect?: DOMRect) => void,
  onComplete: () => void
}>({
  data: {} as unknown as any,
  onActivity: () => {},
  onComplete: () => {},
});

const checkProfanity = (word: string, mask?: string) => {
  return mask && word[0] === '*';
}

type WordDataSegment = { classes: string, value: string, type: TextWordType };

export const TextSentenceTest: FC<{state: Element_TextState}> = ({state}) => {
  return <>
    <span className="word"><span className="char">Normal Test, </span></span>
    <span className="word profanity"><span className="char">{state.textProfanityMask}</span></span>
    <span className="word"><span className="char">, test!!!1 </span></span>
    <br/>
    <span className="word interim"><span className="char">Interim Test, </span></span>
    <span className="word interim profanity"><span className="char">{state.textProfanityMask}</span></span>
    <span className="word interim"><span className="char">, test!!!1 </span></span>
  </>
}

function nativeRender(container: HTMLSpanElement, data: TextSentenceData, onActivity: (r: DOMRect) => void, onComplete: () => void) {
  if (!container) // skip when destroying sentence ele
    return;
  container.replaceChildren();
  let wordsList = data.value.split(' ');
    // convert words to data blocks
    const words: WordDataSegment[] = wordsList.map((_word, wordIndex) => {
      let word = _word + " ";
      // check for profanity
      if (checkProfanity(word, data.state.textProfanityMask))
        return { classes: "profanity", type: TextWordType.profanity, value: data.state.textProfanityMask };
      // check is img
      if (wordIndex in data.emotes)
        return { classes: '', type: TextWordType.img, value: data.emotes[wordIndex] }
      return { classes: '', type: TextWordType.char, value: word }
    });

    // merge words into segments
    const segments: WordDataSegment[] = [];
    let step = 0;
    for (let index = 0; index < words.length; index++) {
      const word = words[index];
      if (word.type !== TextWordType.img && (word.type === segments[step - 1]?.type))
        segments[step - 1].value = segments[step - 1].value.concat(' ', word.value);
      else {
        segments.push(word);
        step++;
      }
    }

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      let newNode: Element;
      if (segment.type === TextWordType.char || segment.type === TextWordType.profanity) {
        newNode = document.createElement("span");
        newNode.innerHTML = segment.value;
      }
      else {
        newNode = document.createElement("img");
        (newNode as HTMLImageElement).src = segment.value;
      }
      newNode.className = segment.classes + (data.interim ? " interim" : "");
      container.appendChild(newNode);
    }
    !data.interim && onComplete();
}

const TextSentenceRenderSimple: FC = memo(() => {
  const { data, onComplete, onActivity } = useContext(sentenceCtx);
  useEffect(() => {!data.interim && onComplete?.()}, [data.interim])
  const containerRef = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => {
    containerRef.current && nativeRender(containerRef.current, data, onActivity, onComplete);
  }, [data.value, data.interim])
  return <span ref={containerRef}></span>
});


// type, value, delay, index sentence, index word
type CharData = [TextSymbolType, string, number, boolean];

function nativeLoop(chars: CharData[], index: number, container: HTMLSpanElement, onActivity: (rect: DOMRect) => void, onComplete: () => void) {
  if (!container) // skip when destroying sentence ele
    return;
  const char = chars[index];
  setTimeout(() => {
    let newNode: Element;
    if (char[0] === 0 || char[0] === 2) {
      newNode = document.createElement("span");
      newNode.innerHTML = char[1];
    }
    else {
      newNode = document.createElement("img");
      (newNode as HTMLImageElement).src = char[1];
    }
    newNode.className = `char animate ${char[0] === 2 ? "profanity" : ''}`;
    container.appendChild(newNode);
    char[3] && onActivity(newNode.getBoundingClientRect());
    if (index + 2 <= chars.length)
      nativeLoop(chars, index + 1, container, onActivity, onComplete);
    else onComplete()
  }, index === 0 ? 0 : char[2])
}



const TextSentenceRenderAnimated: FC = memo(() => {
  const { data, onComplete, onActivity } = useContext(sentenceCtx);

  const onContainerReady = useCallback((ref: HTMLSpanElement) => {
    let wordsList = data.value.split(' ');
  
    const flatChars: CharData[] = [];
  
     wordsList.forEach((word, wordIndex) => {
      let _word = word;

      let isProfanity = checkProfanity(word, data.state.textProfanityMask);
      if (isProfanity)
        _word = data.state.textProfanityMask;
  
      if (wordIndex in (data.emotes || {})) {
        '_ '.split('').forEach((char, charIndex) => {
          // skip animation of last space in sentence
          if (wordsList.length == wordIndex + 1 && char === ' ') {
            flatChars.push([TextSymbolType.char, char, 0, false]);
          }
          else {
            const delay = char === ' ' ? data.state.animateDelayChar : data.state.animateDelayWord;
            if (charIndex === 0)
              flatChars.push([TextSymbolType.img, data.emotes[wordIndex], delay, true]);
            else flatChars.push([TextSymbolType.char, char, delay, false]);
          }
        });
        return;
      }
  
      (_word + ' ').split('').map((char, charIndex) => {
        // skip animation of last space in sentence
        if (wordsList.length == wordIndex + 1 && char === ' ') {
          flatChars.push([TextSymbolType.char, char, 0, false]);
          return;
        }
        const delay = char === ' ' ? data.state.animateDelayWord : data.state.animateDelayChar;
        flatChars.push([isProfanity ? TextSymbolType.profanity : TextSymbolType.char, char, delay, char !== ' ']);
      });
    });
    nativeLoop(flatChars, 0, ref, rect => onActivity(rect), () => onComplete());
  }, []);

  return <span ref={onContainerReady}></span>
})

const TextSentence: FC = memo(() => {
  const {data} = useContext(sentenceCtx);
  if (data.state.animateEnable)
    return <TextSentenceRenderAnimated/>
  return <TextSentenceRenderSimple/>
});

export default TextSentence