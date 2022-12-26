import classNames from "classnames";
import { createContext, FC, memo, useCallback, useContext, useEffect, useState } from "react";
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

const TextSentenceRenderSimple: FC = memo(() => {
  const { data, onComplete, onActivity } = useContext(sentenceCtx);
  const [words, setWords] = useState<WordDataSegment[]>([])
  useEffect(() => {
    let wordsList = data.value.split(' ');

    const words: WordDataSegment[] = wordsList.map((word, wordIndex) => {
      // check for profanity
      if (checkProfanity(word, data.state.textProfanityMask)) {
        return { classes: "profanity", type: TextWordType.profanity, value: data.state.textProfanityMask };
      }
      // check is img
      if (wordIndex in data.emotes) {
        return { classes: '', type: TextWordType.img, value: data.emotes[wordIndex] }
      }
      return { classes: '', type: TextWordType.char, value: word }
    });

    // merge segments
    const arr: WordDataSegment[] = [];
    let step = 0;
    for (let index = 0; index < words.length; index++) {
      const word = words[index];
      if (word.type === TextWordType.char && arr[step - 1]?.type === TextWordType.char) {
        // merge
        arr[step - 1].value = arr[step - 1].value.concat(' ', word.value);
      }
      else {
        arr.push(word);
        step++;
        // push
      }
    }
    setWords(arr);
    onActivity?.();
  }, [data.value]);

  useEffect(() => {!data.interim && onComplete?.()}, [data.interim])

  const renderWord = (word: WordDataSegment) => {
    switch (word.type) {
      case TextWordType.profanity:
      case TextWordType.char:
        return <span className="char">{word.value} </span>
      case TextWordType.img:
        return <span className="char"><img src={word.value} /> </span>
    }
  }

  return <>
    {words.map((word, i) => <span className={classNames("word", { interim: data.interim }, word.classes)} key={i}>
      {renderWord(word)}
    </span>)}
  </>
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
    newNode.className = "char animate";
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
        flatChars.push([TextSymbolType.char, char, delay, char !== ' ']);
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