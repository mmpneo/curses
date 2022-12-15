import classNames from "classnames";
import react, { FC, memo, MutableRefObject, useEffect, useState } from "react";
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


const checkProfanity = (word: string, mask?: string) => {
  return mask && word[0] === '*';
}

type WordDataSegment = { classes: string, value: string, type: TextWordType };

export const TextSentenceTest: FC = () => {
  return <span className="word"><span className="char">Test, test, test!!!1</span></span>
}

const TextSentenceRenderSimple: FC<{ data: TextSentenceData, onComplete?: () => void }> = memo(({ data, onComplete }) => {
  const [words, setWords] = useState<WordDataSegment[]>([])
  useEffect(() => {
    let wordsList = data.value.split(' ');

    const words: WordDataSegment[] = wordsList.map(word => {
      // check for profanity
      if (checkProfanity(word, data.state.textProfanityMask)) {
        return { classes: "profanity", type: TextWordType.profanity, value: data.state.textProfanityMask };
      }

      // check is img
      const isImg = word === "emote";
      if (isImg) {
        return { classes: '', type: TextWordType.img, value: 'https://cdn.7tv.app/pp/610ef8a3900cbd77c69589c7/c8b0cb0d18504b70a1e750d2f38c2afe' }
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
type CharData = [TextSymbolType, string, number, number, number];
type WordData = { classes: string, symbols: CharData[] };

function loopEventSequence(timers: number[], index: number, onActivity?: () => void) {
  setTimeout(() => {
    if (index + 2 <= timers.length)
      loopEventSequence(timers, index + 1, onActivity)
    onActivity?.()
  }, timers[index]);
}

const TextSentenceRenderAnimated: FC<{ data: TextSentenceData, onActivity?: () => void, onComplete?: () => void }> = memo(({ data, onComplete, onActivity }) => {
  const [words, setWords] = useState<WordData[]>([]);
  const [animated, setAnimated] = useState(false); // animate only once

  useEffect(() => {
    let wordsList = data.value.split(' ');
    let eventTimers: number[] = [];

    let totalTimeMs = 0 - (data.value[0] === ' ' ? data.state.animateDelayWord : data.state.animateDelayChar); // shift initial time to match 0
    let totalSymbols = 0;

    const words: WordData[] = wordsList.map((word, wordIndex) => {
      let _word = word;

      const isImg = false;
      if (isImg) {
        return { classes: '', symbols: [[TextSymbolType.img, "asd", 0, 0, 0]] } as WordData
      }

      // check for profanity
      let profanity = data.state.textProfanityMask && word[0] === '*';
      let classes = classNames({ profanity });
      if (profanity)
        _word = data.state.textProfanityMask;

      //todo  check for emotes

      const symbols: CharData[] = (_word + ' ').split('').map((char, charIndex) => {
        totalSymbols++;
        // skip animation of last space in sentence
        if (wordsList.length == wordIndex + 1 && char === ' ') {
          return [TextSymbolType.char, char, 0, totalSymbols - 1, charIndex] as CharData
        }
        const delay = char === ' ' ? data.state.animateDelayWord : data.state.animateDelayChar;
        totalTimeMs += delay;
        eventTimers.push(delay);
        return [TextSymbolType.char, char, totalTimeMs, totalSymbols - 1, charIndex] as CharData
      });
      return { classes, symbols }
    });
    setWords(words);

    eventTimers.splice(0, 1) // remove first timer and replace it with 0 later
    eventTimers = eventTimers.filter(t => t); // collapse zero timers
    eventTimers.unshift(0);
    loopEventSequence(eventTimers, 0, onActivity);

    setTimeout(() => {
      onComplete?.();
      setAnimated(true);
    }, totalTimeMs);

  }, [data.value, data.interim]);

  const renderSymbol = (symbol: CharData) => {
    switch (symbol[0]) {
      case TextSymbolType.profanity:
      case TextSymbolType.char:
        return <span className="char">{symbol[1]}</span>
      case TextSymbolType.img:
        return <span className="char"><img src={symbol[1]} /></span>
    }
  }

  return <>
    {words.map((word, i) => <span className={classNames("word animate", { animated, interim: data.interim }, word.classes)} key={i}>
      {word.symbols.map((symbol, lI) => <span className="char-internal" key={lI} style={{ '--index': symbol[3], '--wordindex': symbol[4], '--time': `${symbol[2]}ms` }}>
        {renderSymbol(symbol)}
        {/* <span className="char">{symbol[1]}</span> */}
      </span>)}
    </span>)}
    {data.state.behaviorBreakLine && <br />}
  </>
})

const TextSentence: FC<{ data: TextSentenceData, onActivity?: () => void, onComplete?: () => void }> = memo(({ data, onComplete, onActivity }) => {

  // console.log("render sentence", data.value);

  if (data.state.animateEnable)
    return <TextSentenceRenderAnimated onActivity={onActivity} onComplete={onComplete} data={data} />
  return <TextSentenceRenderSimple onComplete={onComplete} data={data} />
})

export default TextSentence