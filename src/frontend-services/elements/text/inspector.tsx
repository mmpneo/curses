import classNames from "classnames";
import { FC, memo, useState } from "react";
import { GrTextAlignCenter, GrTextAlignLeft, GrTextAlignRight } from "react-icons/gr";
import { RiAlignBottom, RiAlignTop, RiAlignVertically } from "react-icons/ri";
import { TbTextResize } from "react-icons/tb";
import { useGetState, useUpdateState } from "../..";
import Input from "../../../components/input";
import Inspector from "../../../components/inspector";
import { TextEventSource } from "../../../types";
import TransformInput from "../../components/transform-input";
import { Element_TextState, FlexAlign, FontCase } from "./schema";


const TextInspector: FC<{ id: string }> = ({ id }) => {
  const data = useGetState(state => state.elements[id].scenes["main"].data);
  const update = useUpdateState();
  const up = <K extends keyof Element_TextState>(key: K, v: Element_TextState[K]) => update(state => {
    state.elements[id].scenes["main"].data[key] = v;
  });

  return <>
    <Inspector.SubHeader>Font</Inspector.SubHeader>
    <Input.Text label="Size" type="number" value={data.textFontSize} onChange={e => up("textFontSize", parseFloat(e.target.value))} />
    <Input.Text label="Family" value={data.textFontFamily} onChange={e => up("textFontFamily", e.target.value)} />
    <Input.Range label="Weight" step="100" min="100" max="900" value={data.textFontWeight} onChange={e => up("textFontWeight", parseFloat(e.target.value))} />
    <Input.Chips options={[
      { label: "aa", value: FontCase.lowercase },
      { label: "AA", value: FontCase.uppercase },
      { label: "-", value: FontCase.inherit },
    ]} label="Case" value={data.textCase} onChange={e => up("textCase", e as FontCase)} />
    <Input.Text label="Line Height" type="number" value={data.textLineHeight} onChange={e => up("textLineHeight", parseFloat(e.target.value))} />

    <Inspector.SubHeader>Font Color</Inspector.SubHeader>
    <Input.Color label="Color" value={data.textColor} onChange={e => up("textColor", e)} />
    <Input.Color label="Interim Color" value={data.textColorInterim} onChange={e => up("textColorInterim", e)} />

    <Inspector.SubHeader>Shadow</Inspector.SubHeader>
    <Input.DoubleCountainer label="Position">
      <Input.BaseText value={data.textShadowX} onChange={e => up("textShadowX", parseFloat(e.target.value))} type="number" />
      <Input.BaseText value={data.textShadowY} onChange={e => up("textShadowY", parseFloat(e.target.value))} type="number" />
    </Input.DoubleCountainer>
    <Input.Text label="Blur" type="number" value={data.textShadowZ} onChange={e => up("textShadowZ", parseFloat(e.target.value))} />
    <Input.Color label="Color" value={data.textShadowColor} onChange={e => up("textShadowColor", e)} />

    <Inspector.SubHeader>Text Stroke</Inspector.SubHeader>
    <Input.Text label="Width" min="0" step="0.05" type="number" value={data.textStroke} onChange={e => up("textStroke", parseFloat(e.target.value))} />
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

    <Inspector.SubHeader>Profanity Mask</Inspector.SubHeader>
    <Input.Text label="Mask" value={data.textProfanityMask} onChange={e => up("textProfanityMask", e.target.value)} />
    <Input.Color label="Color" value={data.textProfanityColor} onChange={e => up("textProfanityColor", e)} />
    <Input.Color label="Interim Color" value={data.textProfanityInterimColor} onChange={e => up("textProfanityInterimColor", e)} />
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

const AnimationInspector: FC<{ id: string }> = ({ id }) => {
  const data = useGetState(state => state.elements[id].scenes["main"].data);
  const update = useUpdateState();
  const up = <K extends keyof Element_TextState>(key: K, v: Element_TextState[K]) => update(state => {
    state.elements[id].scenes["main"].data[key] = v;
  });

  return <>
    <Inspector.SubHeader>Animate</Inspector.SubHeader>
    <Input.Checkbox label="Enable animation" value={data.animateEnable} onChange={e => up("animateEnable", e)} />
    <Input.Text label="Characters delay" type="number" value={data.animateDelayChar} onChange={e => up("animateDelayChar", parseFloat(e.target.value))} />
    <Input.Text label="Words delay" type="number" value={data.animateDelayWord} onChange={e => up("animateDelayWord", parseFloat(e.target.value))} />
    <Input.Text label="Sentence delay" type="number" value={data.animateDelaySentence} onChange={e => up("animateDelaySentence", parseFloat(e.target.value))} />

    <Input.Checkbox label="Animate scroll" value={data.animateScroll} onChange={e => up("animateScroll", e)} />

    <Inspector.SubHeader>Clean up</Inspector.SubHeader>
    <Input.Text label="Clear text after" type="number" value={data.behaviorClearTimer} onChange={e => up("behaviorClearTimer", parseFloat(e.target.value))} />
    <Input.Text label="Clear animation delay" type="number" value={data.behaviorClearDelay} onChange={e => up("behaviorClearDelay", parseFloat(e.target.value))} />
    <Input.Checkbox label="Show only one sentence" value={data.behaviorLastSentence} onChange={e => up("behaviorLastSentence", e)} />
    <Input.Checkbox label="Break line" value={data.behaviorBreakLine} onChange={e => up("behaviorBreakLine", e)} />

    <Inspector.SubHeader>Custom event</Inspector.SubHeader>
    <Input.Checkbox label="Emit event" value={data.animateEvent} onChange={e => up("animateEvent", e)} />
    <Input.Text label="Event name" type="number" value={data.animateEventName} onChange={e => up("animateEventName", e.target.value)} />
  </>
}

const Inspector_ElementText: FC<{ id: string }> = memo(({ id }) => {
  const data = useGetState(state => state.elements[id].scenes["main"].data);
  const name = useGetState(state => state.elements[id].name);
  const update = useUpdateState();

  const handleUpdateName = (v: string) => update(state => {
    state.elements[id].name = v;
  });

  const up = <K extends keyof Element_TextState>(key: K, v: Element_TextState[K]) => update(state => {
    state.elements[id].scenes["main"].data[key] = v;
  });

  const [tab, setTab] = useState<string>("text")

  return <Inspector.Body>
    <Inspector.Header><TbTextResize /> {name}</Inspector.Header>
    <Inspector.Content>
      <Input.Text label="Name" value={name} onChange={e => handleUpdateName(e.target.value)} />
      <TransformInput id={id} />

      <div className="flex flex-col space-y-1">
        <Inspector.SubHeader>Source</Inspector.SubHeader>
        <Input.Select value={data.sourceMain} onChange={e => up("sourceMain", e as any)} options={[
          { label: 'STT', value: TextEventSource.stt },
          { label: 'Translation', value: TextEventSource.translation }
        ]} placeholder="Text source" label="Main text source" />
        <Input.Text label="Text source mask" />
        <Input.Checkbox label="Input field" />
        <Input.Text label="Input field mask" />
      </div>

      <div className="-ml-2 pt-2 tabs bg-transparent tabs-boxed">
        <a onClick={() => setTab("text")} className={classNames("tab tab-xs", { "tab-active": tab === "text" })}>Text</a>
        <a onClick={() => setTab("box")} className={classNames("tab tab-xs", { "tab-active": tab === "box" })}>Box</a>
        <a onClick={() => setTab("animation")} className={classNames("tab tab-xs", { "tab-active": tab === "animation" })}>Animation</a>
        <a onClick={() => setTab("sound")} className={classNames("tab tab-xs", { "tab-active": tab === "sound" })}>Sound</a>
        <a onClick={() => setTab("CSS")} className={classNames("tab tab-xs", { "tab-active": tab === "CSS" })}>Css</a>
      </div>
      <Input.Checkbox label="Preview mode" value={data.previewMode} onChange={e => up("previewMode", e)} />

      {tab === "text" && <TextInspector id={id} />}
      {tab === "box" && <BoxInspector id={id} />}
      {tab === "animation" && <AnimationInspector id={id} />}

    </Inspector.Content>
  </Inspector.Body>
})
Inspector_ElementText.displayName = "Inspector_ElementText";
export default Inspector_ElementText;
