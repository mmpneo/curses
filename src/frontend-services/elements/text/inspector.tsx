import { FC, memo, useState } from "react";
import { BsTextareaResize } from "react-icons/bs";
import { GrTextAlignCenter, GrTextAlignLeft, GrTextAlignRight } from "react-icons/gr";
import { HiOutlineMusicNote } from "react-icons/hi";
import { IoIosRadio } from "react-icons/io";
import { RiAlignBottom, RiAlignTop, RiAlignVertically, RiFileCopyLine, RiFontSize } from "react-icons/ri";
import { SiCsswizardry } from "react-icons/si";
import { TbTextResize } from "react-icons/tb";
import { VscSettings } from "react-icons/vsc";
import { useCopyToClipboard } from "react-use";
import { useGetState, useUpdateState } from "../..";
import Input from "../../../components/input";
import Inspector from "../../../components/inspector";
import NameInput from "../../components/name-input";
import TransformInput from "../../components/transform-input";
import { Element_TextState, FlexAlign, FontCase } from "./schema";

const SourceInspector: FC<{ id: string }> = ({ id }) => {
  const data: Element_TextState = useGetState(state => state.elements[id].scenes["main"].data);
  const update = useUpdateState();
  const up = <K extends keyof Element_TextState>(key: K, v: Element_TextState[K]) => update(state => {
    state.elements[id].scenes["main"].data[key] = v;
  });

  return <>
    <Inspector.SubHeader>Source</Inspector.SubHeader>
    <Input.TextSource label="Source" value={data.sourceMain} onChange={e => up("sourceMain", e)} />
    <Input.Checkbox label="Interim results" value={data.sourceInterim} onChange={e => up("sourceInterim", e)} />
    <Input.Checkbox label="Input field" value={data.sourceInputField} onChange={e => up("sourceInputField", e)} />
    <Input.Text label="Profanity Mask" value={data.textProfanityMask} onChange={e => up("textProfanityMask", e.target.value)} />
  </>
}

const TextInspector: FC<{ id: string }> = ({ id }) => {
  const data = useGetState(state => state.elements[id].scenes["main"].data);
  const update = useUpdateState();
  const up = <K extends keyof Element_TextState>(key: K, v: Element_TextState[K]) => update(state => {
    state.elements[id].scenes["main"].data[key] = v;
  });

  return <>
    <Inspector.SubHeader>Font</Inspector.SubHeader>
    <Input.Color label="Color" value={data.textColor} onChange={e => up("textColor", e)} />
    <Input.Color label="Interim Color" value={data.textColorInterim} onChange={e => up("textColorInterim", e)} />
    <Input.Color label="Profanity Color" value={data.textProfanityColor} onChange={e => up("textProfanityColor", e)} />
    <Input.Color label="Profanity interim" value={data.textProfanityInterimColor} onChange={e => up("textProfanityInterimColor", e)} />
    <Input.Text label="Size" type="number" value={data.textFontSize} onChange={e => up("textFontSize", parseFloat(e.target.value))} />
    <Input.Text label="Family" value={data.textFontFamily} onChange={e => up("textFontFamily", e.target.value)} />
    <Input.Range label="Weight" step="100" min="100" max="900" value={data.textFontWeight} onChange={e => up("textFontWeight", parseFloat(e.target.value))} />
    <Input.Chips options={[
      { label: "aa", value: FontCase.lowercase },
      { label: "AA", value: FontCase.uppercase },
      { label: "-", value: FontCase.inherit },
    ]} label="Case" value={data.textCase} onChange={e => up("textCase", e as FontCase)} />
    <Input.Text label="Line Height" type="number" value={data.textLineHeight} onChange={e => up("textLineHeight", parseFloat(e.target.value))} />

    {/* <Inspector.SubHeader>Font Color</Inspector.SubHeader> */}

    <Inspector.SubHeader>Shadow</Inspector.SubHeader>
    <Input.DoubleCountainer label="Position">
      <Input.BaseText value={data.textShadowX} onChange={e => up("textShadowX", parseFloat(e.target.value))} type="number" />
      <Input.BaseText value={data.textShadowY} onChange={e => up("textShadowY", parseFloat(e.target.value))} type="number" />
    </Input.DoubleCountainer>
    <Input.Text label="Blur" type="number" value={data.textShadowZ} onChange={e => up("textShadowZ", parseFloat(e.target.value))} />
    <Input.Color label="Color" value={data.textShadowColor} onChange={e => up("textShadowColor", e)} />

    <Inspector.SubHeader>Outline</Inspector.SubHeader>
    <Input.Text label="Size" min="0" step="0.05" type="number" value={data.textStroke} onChange={e => up("textStroke", parseFloat(e.target.value))} />
    <Input.Color label="Color" value={data.textStrokeColor} onChange={e => up("textStrokeColor", e)} />

    <Inspector.SubHeader>Align</Inspector.SubHeader>
    <Input.Chips options={[
      { label: <GrTextAlignLeft />, value: FlexAlign.start },
      { label: <GrTextAlignCenter />, value: FlexAlign.center },
      { label: <GrTextAlignRight />, value: FlexAlign.end },
    ]} label="Horizontal" value={data.textAlignH} onChange={e => up("textAlignH", e as FlexAlign)} />
    <Input.Chips options={[
      { label: <RiAlignTop />, value: FlexAlign.start },
      { label: <RiAlignVertically />, value: FlexAlign.center },
      { label: <RiAlignBottom />, value: FlexAlign.end },
    ]} label="Vertical" value={data.textAlignV} onChange={e => up("textAlignV", e as FlexAlign)} />
  </>
}

const BoxInspector: FC<{ id: string }> = ({ id }) => {
  const data = useGetState(state => state.elements[id].scenes["main"].data);
  const update = useUpdateState();
  const up = <K extends keyof Element_TextState>(key: K, v: Element_TextState[K]) => update(state => {
    state.elements[id].scenes["main"].data[key] = v;
  });

  return <>
    <Inspector.SubHeader>Box</Inspector.SubHeader>
    <Input.Color label="Color" value={data.boxColor} onChange={e => up("boxColor", e)} />
    <Input.Checkbox label="Auto width" value={data.boxAutoWidth} onChange={e => up("boxAutoWidth", e)} />
    <Input.Checkbox label="Auto height" value={data.boxAutoHeight} onChange={e => up("boxAutoHeight", e)} />
    <Inspector.SubHeader>Border</Inspector.SubHeader>
    <Input.Text label="Radius" min="0" step="0.05" type="number" value={data.boxBorderRadius} onChange={e => up("boxBorderRadius", parseFloat(e.target.value))} />
    <Input.Text label="Width" min="0" step="0.05" type="number" value={data.boxBorderWidth} onChange={e => up("boxBorderWidth", parseFloat(e.target.value))} />
    <Input.Color label="Color" value={data.boxBorderColor} onChange={e => up("boxBorderColor", e)} />

    <Inspector.SubHeader>Align</Inspector.SubHeader>
    <Input.Chips options={[
      { label: <GrTextAlignLeft />, value: FlexAlign.start },
      { label: <GrTextAlignCenter />, value: FlexAlign.center },
      { label: <GrTextAlignRight />, value: FlexAlign.end },
    ]} label="Horizontal" value={data.boxAlignH} onChange={e => up("boxAlignH", e as FlexAlign)} />
    <Input.Chips options={[
      { label: <RiAlignTop />, value: FlexAlign.start },
      { label: <RiAlignVertically />, value: FlexAlign.center },
      { label: <RiAlignBottom />, value: FlexAlign.end },
    ]} label="Vertical" value={data.boxAlignV} onChange={e => up("boxAlignV", e as FlexAlign)} />
  </>
}

const BehaviourInspector: FC<{ id: string }> = ({ id }) => {
  const data = useGetState(state => state.elements[id].scenes["main"].data);
  const update = useUpdateState();
  const [, copyToClipboard] = useCopyToClipboard();

  const up = <K extends keyof Element_TextState>(key: K, v: Element_TextState[K]) => update(state => {
    state.elements[id].scenes["main"].data[key] = v;
  });

  const handleCopyCss = () => {
    const style = `[event-element-${id}-100] {}`
    copyToClipboard(style);
  }

  return <>
    <Inspector.SubHeader>Animation</Inspector.SubHeader>
    <Input.Checkbox label="Enable animation" value={data.animateEnable} onChange={e => up("animateEnable", e)} />
    <Input.Checkbox label="Emit event" value={data.animateEvent} onChange={e => up("animateEvent", e)} />
    {data.animateEvent && <Input.Container label="Copy event css">
      <button onClick={handleCopyCss} className="btn btn-neutral btn-sm gap-1">Copy <RiFileCopyLine/></button>
    </Input.Container>}
    <Input.Text label="Characters delay" type="number" value={data.animateDelayChar} onChange={e => up("animateDelayChar", parseFloat(e.target.value))} />
    <Input.Text label="Words delay" type="number" value={data.animateDelayWord} onChange={e => up("animateDelayWord", parseFloat(e.target.value))} />
    <Input.Text label="Sentence delay" type="number" value={data.animateDelaySentence} onChange={e => up("animateDelaySentence", parseFloat(e.target.value))} />

    <Input.Checkbox label="Animate scroll" value={data.animateScroll} onChange={e => up("animateScroll", e)} />

    <Inspector.SubHeader>Clean up</Inspector.SubHeader>
    <Input.Text label="Clear text after" type="number" value={data.behaviorClearTimer} onChange={e => up("behaviorClearTimer", parseFloat(e.target.value))} />
    <Input.Text label="Clear animation delay" type="number" value={data.behaviorClearDelay} onChange={e => up("behaviorClearDelay", parseFloat(e.target.value))} />
    <Input.Checkbox label="Show only one sentence" value={data.behaviorLastSentence} onChange={e => up("behaviorLastSentence", e)} />
    <Input.Checkbox label="Break line" value={data.behaviorBreakLine} onChange={e => up("behaviorBreakLine", e)} />
  </>
}

const SoundInspector: FC<{ id: string }> = ({ id }) => {
  const data: Element_TextState = useGetState(state => state.elements[id].scenes["main"].data);
  const update = useUpdateState();
  const up = <K extends keyof Element_TextState>(key: K, v: Element_TextState[K]) => update(state => {
    state.elements[id].scenes["main"].data[key] = v;
  });

  return <>
    <Inspector.SubHeader>Audio</Inspector.SubHeader>
    <Input.Checkbox label="Enabled" value={data.soundEnable} onChange={e => up("soundEnable", e)} />
    <Input.File label="Audio file" type="audio" value={data.soundFile} onChange={e => up("soundFile", e)} />
    <Input.Range label={`Volume (${data.soundVolume})`} step="0.01" min="0" max="1" value={data.soundVolume} onChange={e => up("soundVolume", parseFloat(e.target.value) || 0)} />
    <Inspector.SubHeader>Effects</Inspector.SubHeader>
    <Input.DoubleCountainer label="Detune (min/max)">
      <Input.BaseText type="number" value={data.soundDetuneMin} onChange={e => up("soundDetuneMin", parseFloat(e.target.value) || 0)} />
      <Input.BaseText type="number" value={data.soundDetuneMax} onChange={e => up("soundDetuneMax", parseFloat(e.target.value) || 0)} />
    </Input.DoubleCountainer>
    <Input.DoubleCountainer label="Playback (min/max)">
      <Input.BaseText type="number" value={data.soundPlaybackMin} onChange={e => up("soundPlaybackMin", parseFloat(e.target.value) || 0)} />
      <Input.BaseText type="number" value={data.soundPlaybackMax} onChange={e => up("soundPlaybackMax", parseFloat(e.target.value) || 0)} />
    </Input.DoubleCountainer>
  </>
}

const CssInspector: FC<{ id: string }> = ({ id }) => {
  const data: Element_TextState = useGetState(state => state.elements[id].scenes["main"].data);
  const update = useUpdateState();
  const up = <K extends keyof Element_TextState>(key: K, v: Element_TextState[K]) => update(state => {
    state.elements[id].scenes["main"].data[key] = v;
  });
  return <>
    <Inspector.SubHeader>CSS style</Inspector.SubHeader>
    <Input.Code language="css" label="CSS" value={data.css} onChange={e => up("css", e || "")} />
  </>
}


const Inspector_ElementText: FC<{ id: string }> = memo(({ id }) => {
  const data: Element_TextState = useGetState(state => state.elements[id].scenes["main"].data);
  const update = useUpdateState();

  const up = <K extends keyof Element_TextState>(key: K, v: Element_TextState[K]) => update(state => {
    state.elements[id].scenes["main"].data[key] = v;
  });

  const [[tab, direction], setTab] = useState<[number, number]>([1, 0]);

  const handleTab = (v: number) => {
    setTab([v, Math.sign(v - tab)]);
  }

  return <Inspector.Body>
    <Inspector.Header><TbTextResize /> <NameInput id={id} /></Inspector.Header>
    <Inspector.Content>
      <TransformInput id={id} />
      <Input.Checkbox label="Preview mode" value={data.previewMode} onChange={e => up("previewMode", e)} />
      <Inspector.Tabs>
        <Inspector.Tab tooltip="Text source" tooltipBody="Where should we get the text from" onClick={() => handleTab(0)} active={tab === 0}><IoIosRadio /></Inspector.Tab>
        <Inspector.Tab tooltip="Text" tooltipBody="Colors, size, shadow, stroke" onClick={() => handleTab(1)} active={tab === 1}><RiFontSize /></Inspector.Tab>
        <Inspector.Tab tooltip="Box" tooltipBody="Background, border, size" onClick={() => handleTab(2)} active={tab === 2}><BsTextareaResize /></Inspector.Tab>
        <Inspector.Tab tooltip="Behaviour" tooltipBody="Timer, typing and scroll animations, events" onClick={() => handleTab(3)} active={tab === 3}><VscSettings /></Inspector.Tab>
        <Inspector.Tab tooltip="Sound" tooltipBody="Volume, sound vfx" onClick={() => handleTab(4)} active={tab === 4}><HiOutlineMusicNote /></Inspector.Tab>
        <Inspector.Tab tooltip="CSS editor" onClick={() => handleTab(5)} active={tab === 5}><SiCsswizardry /></Inspector.Tab>
      </Inspector.Tabs>
      <Inspector.TabsContent direction={direction} tabKey={tab}>
        {tab === 0 && <SourceInspector id={id} />}
        {tab === 1 && <TextInspector id={id} />}
        {tab === 2 && <BoxInspector id={id} />}
        {tab === 3 && <BehaviourInspector id={id} />}
        {tab === 4 && <SoundInspector id={id} />}
        {tab === 5 && <CssInspector id={id} />}
      </Inspector.TabsContent>
    </Inspector.Content>
  </Inspector.Body>
})
Inspector_ElementText.displayName = "Inspector_ElementText";
export default Inspector_ElementText;
