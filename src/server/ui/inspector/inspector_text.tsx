import { useGetState } from "@/client";
import { Element_TextState, FlexAlign, FontCase } from "@/client/elements/text/schema";
import { useUpdateElement } from "@/utils";
import { FC, memo, useMemo, useState } from "react";
import { BsStars, BsTextareaResize } from "react-icons/bs";
import { GrTextAlignCenter, GrTextAlignLeft, GrTextAlignRight } from "react-icons/gr";
import { IoIosRadio } from "react-icons/io";
import { RiAlignBottom, RiAlignTop, RiAlignVertically, RiFileCopyLine, RiFontSize } from "react-icons/ri";
import { SiCsswizardry } from "react-icons/si";
import { TbTextResize } from "react-icons/tb";
import { VscSettings } from "react-icons/vsc";
import { useCopyToClipboard } from "react-use";
import { useSnapshot } from "valtio";
import Inspector from "./components";
import { InputBaseText, InputCheckbox, InputChips, InputCode, InputColor, InputContainer, InputDoubleCountainer, InputFile, InputFont, InputRange, InputSelect, InputText, InputTextSource } from "./components/input";
import NameInput from "./components/name-input";
import TransformInput from "./components/transform-input";
import { ElementSceneState } from "@/client/elements/schema";
import { useTranslation } from "react-i18next";

const SourceInspector: FC<{ id: string }> = ({ id }) => {
  const {t} = useTranslation();
  const {activeScene} = useSnapshot(window.ApiClient.scenes.state);
  const data: Element_TextState = useGetState(state => state.elements[id]?.scenes[activeScene].data as Element_TextState);
  const up = useUpdateElement<Element_TextState>(id);

  return <>
    <Inspector.SubHeader>{t('text.section_text_source')}</Inspector.SubHeader>
    <InputTextSource label="common.field_text_source" value={data.sourceMain} onChange={e => up("sourceMain", e)} />
    <InputCheckbox label="common.field_interim_results" value={data.sourceInterim} onChange={e => up("sourceInterim", e)} />
    <InputCheckbox label="common.field_use_keyboard_input" value={data.sourceInputField} onChange={e => up("sourceInputField", e)} />
    <InputText label="text.field_text_profanity_mask" value={data.textProfanityMask} onChange={e => up("textProfanityMask", e.target.value)} />
  </>
}

const TextInspector: FC<{ id: string }> = ({ id }) => {
  const {t} = useTranslation();
  const {activeScene} = useSnapshot(window.ApiClient.scenes.state);
  const data: Element_TextState = useGetState(state => state.elements[id]?.scenes[activeScene].data as Element_TextState);
  const up = useUpdateElement<Element_TextState>(id);

  return <>
    <Inspector.SubHeader>{t('text.section_font')}</Inspector.SubHeader>
    <InputColor label="text.font_color" value={data.textColor} onChange={e => up("textColor", e)} />
    <InputColor label="text.font_interim_color" value={data.textColorInterim} onChange={e => up("textColorInterim", e)} />
    <InputColor label="text.font_profanity_color" value={data.textProfanityColor} onChange={e => up("textProfanityColor", e)} />
    <InputColor label="text.font_profanity_interim_color" value={data.textProfanityInterimColor} onChange={e => up("textProfanityInterimColor", e)} />
    <InputText label="text.font_size" type="number" value={data.textFontSize} onChange={e => up("textFontSize", e.target.value)} />
    <InputFont label="text.font_family" value={data.textFontFamily} onChange={value => up("textFontFamily", value)} />
    <InputRange label="text.font_weight" step="100" min="100" max="900" value={data.textFontWeight} onChange={e => up("textFontWeight", e.target.value)} />
    <InputChips options={[
      { label: "aa", value: FontCase.lowercase },
      { label: "AA", value: FontCase.uppercase },
      { label: "-", value: FontCase.inherit },
    ]} label="text.font_case" value={data.textCase} onChange={e => up("textCase", e as FontCase)} />

    {/* <Inspector.SubHeader>Align</Inspector.SubHeader> */}
    <InputChips options={[
      { label: <GrTextAlignLeft />, value: FlexAlign.start },
      { label: <GrTextAlignCenter />, value: FlexAlign.center },
      { label: <GrTextAlignRight />, value: FlexAlign.end },
    ]} label="text.font_horizontal_align" value={data.textAlignH} onChange={e => up("textAlignH", e as FlexAlign)} />
    <InputChips options={[
      { label: <RiAlignTop />, value: FlexAlign.start },
      { label: <RiAlignVertically />, value: FlexAlign.center },
      { label: <RiAlignBottom />, value: FlexAlign.end },
    ]} label="text.font_vertical_align" value={data.textAlignV} onChange={e => up("textAlignV", e as FlexAlign)} />

    <InputText label="text.font_line_height" step="0.1" type="number" value={data.textLineHeight} onChange={e => up("textLineHeight", e.target.value)} />

    <Inspector.SubHeader>{t('text.section_text_shadow')}</Inspector.SubHeader>
    <InputDoubleCountainer label="text.text_shadow_position">
      <InputBaseText value={data.textShadowX} onChange={e => up("textShadowX", e.target.value)} type="number" />
      <InputBaseText value={data.textShadowY} onChange={e => up("textShadowY", e.target.value)} type="number" />
    </InputDoubleCountainer>
    <InputText label="text.text_shadow_blur" type="number" value={data.textShadowZ} onChange={e => up("textShadowZ", e.target.value)} />
    <InputColor label="text.text_shadow_color" value={data.textShadowColor} onChange={e => up("textShadowColor", e)} />

    <Inspector.SubHeader>{t('text.section_text_outline')}</Inspector.SubHeader>
    <InputText label="text.text_outline_size" min="0" step="0.1" type="number" value={data.textStroke} onChange={e => up("textStroke", e.target.value)} />
    <InputColor label="text.text_outline_color" value={data.textStrokeColor} onChange={e => up("textStrokeColor", e)} />
  </>
}

const BoxInspector: FC<{ id: string }> = ({ id }) => {
  const {t} = useTranslation();
  const {activeScene} = useSnapshot(window.ApiClient.scenes.state);
  const data: Element_TextState = useGetState(state => state.elements[id]?.scenes[activeScene].data as Element_TextState);
  const up = useUpdateElement<Element_TextState>(id);

  return <>
    <Inspector.SubHeader>{t('text.section_box')}</Inspector.SubHeader>
    <InputCheckbox label="text.box_auto_width" value={data.boxAutoWidth} onChange={e => up("boxAutoWidth", e)} />
    <InputCheckbox label="text.box_auto_height" value={data.boxAutoHeight} onChange={e => up("boxAutoHeight", e)} />

    {/* <Inspector.SubHeader>Align</Inspector.SubHeader> */}
    <InputChips options={[
      { label: <GrTextAlignLeft />, value: FlexAlign.start },
      { label: <GrTextAlignCenter />, value: FlexAlign.center },
      { label: <GrTextAlignRight />, value: FlexAlign.end },
    ]} label="text.box_horizontal_align" value={data.boxAlignH} onChange={e => up("boxAlignH", e as FlexAlign)} />
    <InputChips options={[
      { label: <RiAlignTop />, value: FlexAlign.start },
      { label: <RiAlignVertically />, value: FlexAlign.center },
      { label: <RiAlignBottom />, value: FlexAlign.end },
    ]} label="text.box_vertical_align" value={data.boxAlignV} onChange={e => up("boxAlignV", e as FlexAlign)} />

    <InputText label="text.box_text_padding" min="0" step="1" type="number" value={data.boxPadding} onChange={e => up("boxPadding", e.target.value)} />

    <InputDoubleCountainer label="text.box_vertical_offset">
      <InputBaseText value={data.boxScrollPaddingTop} onChange={e => up("boxScrollPaddingTop", e.target.value)} type="number" />
      <InputBaseText value={data.boxScrollPaddingBottom} onChange={e => up("boxScrollPaddingBottom", e.target.value)} type="number" />
    </InputDoubleCountainer>

    <InputDoubleCountainer label="text.box_horizontal_offset">
      <InputBaseText value={data.boxScrollPaddingLeft} onChange={e => up("boxScrollPaddingLeft", e.target.value)} type="number" />
      <InputBaseText value={data.boxScrollPaddingRight} onChange={e => up("boxScrollPaddingRight", e.target.value)} type="number" />
    </InputDoubleCountainer>

    <Inspector.SubHeader>{t('text.section_box_shadow')}</Inspector.SubHeader>
    <InputDoubleCountainer label="text.box_shadow_position">
      <InputBaseText value={data.boxShadowX} onChange={e => up("boxShadowX", e.target.value)} type="number" />
      <InputBaseText value={data.boxShadowY} onChange={e => up("boxShadowY", e.target.value)} type="number" />
    </InputDoubleCountainer>
    <InputText label="text.box_shadow_blur" type="number" value={data.boxShadowZ} onChange={e => up("boxShadowZ", e.target.value)} />
    <InputText label="text.box_shadow_spread" type="number" value={data.boxShadowSpread} onChange={e => up("boxShadowZ", e.target.value)} />
    <InputColor label="text.box_shadow_color" value={data.boxShadowColor} onChange={e => up("boxShadowColor", e)} />

    <Inspector.SubHeader>{t('text.section_box_background')}</Inspector.SubHeader>
    <InputSelect options={[
      { label: t('text.box_bg_type_solid'), value: 'solid' },
      { label: t('text.box_bg_type_slice'), value: 'slice' },
    ]} label="text.box_bg_type" value={data.boxBackgroundType} onValueChange={e => up("boxBackgroundType", e as any)} />
    <InputFile type="image" label="text.box_bg_image" value={data.boxImageFileId} onChange={e => up("boxImageFileId", e)} />

    <Inspector.Switchable visible={data.boxBackgroundType === "solid"}>
      <InputColor label="text.box_bg_color" value={data.boxColor} onChange={e => up("boxColor", e)} />
      <Inspector.SubHeader>{t('text.section_box_bg_border')}</Inspector.SubHeader>
      <InputText label="text.box_bg_border_radius" min="0" step="1" type="number" value={data.boxBorderRadius} onChange={e => up("boxBorderRadius", e.target.value)} />
      <InputText label="text.box_bg_border_width" min="0" step="1" type="number" value={data.boxBorderWidth} onChange={e => up("boxBorderWidth", e.target.value)} />
      <InputColor label="text.box_bg_border_color" value={data.boxBorderColor} onChange={e => up("boxBorderColor", e)} />
    </Inspector.Switchable>

    <Inspector.Switchable visible={data.boxBackgroundType === "slice"}>
      <Inspector.SubHeader>{t('text.section_box_bg_slice')}</Inspector.SubHeader>
      <Inspector.Description>
        <span>
          You can learn about 9-slice <a target="_blank" className="link link-primary link-hover" href="https://en.wikipedia.org/wiki/9-slice_scaling">here</a> and <a target="_blank" className="link link-primary link-hover" href="https://developer.mozilla.org/en-US/docs/Web/CSS/border-image-slice">here</a>
        </span>
      </Inspector.Description>
      <InputText label="text.box_bg_slice_tile" min="0" step="1" type="number" value={data.boxSliceTileSize} onChange={e => up("boxSliceTileSize", e.target.value)} />
      <InputText label="text.box_bg_slice_top" min="0" step="1" type="number" value={data.boxSliceTop} onChange={e => up("boxSliceTop", e.target.value)} />
      <InputText label="text.box_bg_slice_right" min="0" step="1" type="number" value={data.boxSliceRight} onChange={e => up("boxSliceRight", e.target.value)} />
      <InputText label="text.box_bg_slice_bottom" min="0" step="1" type="number" value={data.boxSliceBottom} onChange={e => up("boxSliceBottom", e.target.value)} />
      <InputText label="text.box_bg_slice_left" min="0" step="1" type="number" value={data.boxSliceLeft} onChange={e => up("boxSliceLeft", e.target.value)} />
    </Inspector.Switchable>
  </>
}

const BehaviourInspector: FC<{ id: string }> = ({ id }) => {
  const {t} = useTranslation();
  const {activeScene} = useSnapshot(window.ApiClient.scenes.state);
  const data: Element_TextState = useGetState(state => state.elements[id]?.scenes[activeScene].data as Element_TextState);
  const up = useUpdateElement<Element_TextState>(id);

  const [, copyToClipboard] = useCopyToClipboard();

  const handleCopyCss = () => {
    const style = `[event-element-${id}-100] {}`
    copyToClipboard(style);
  }

  return <>
    <Inspector.SubHeader>{t('text.section_animation')}</Inspector.SubHeader>
    <InputCheckbox label="common.field_enable" value={data.animateEnable} onChange={e => up("animateEnable", e)} />
    <Inspector.Switchable visible={data.animateEnable}>
      <Inspector.Description>{t('text.animation_interval')}</Inspector.Description>
      <InputText label="text.animation_interval_characters" type="number" value={data.animateDelayChar} onChange={e => up("animateDelayChar", parseFloat(e.target.value) || 0)} />
      <InputText label="text.animation_interval_words" type="number" value={data.animateDelayWord} onChange={e => up("animateDelayWord", parseFloat(e.target.value) || 0)} />
      <InputText label="text.animation_interval_sentences" type="number" value={data.animateDelaySentence} onChange={e => up("animateDelaySentence", parseFloat(e.target.value) || 0)} />
    </Inspector.Switchable>
    <InputCheckbox label="text.animation_emit_event" value={data.animateEvent} onChange={e => up("animateEvent", e)} />
    {data.animateEvent && <InputContainer label="text.btn_copy_event_css">
      <button onClick={handleCopyCss} className="btn btn-neutral btn-sm gap-1">{t('common.btn_copy')} <RiFileCopyLine /></button>
    </InputContainer>}

    <Inspector.SubHeader>{t('text.section_cleanup')}</Inspector.SubHeader>
    <InputText label="text.cleanup_clear_after" type="number" value={data.behaviorClearTimer} onChange={e => up("behaviorClearTimer", parseFloat(e.target.value) || 0)} />
    <InputText label="text.cleanup_clear_animation_delay" type="number" value={data.behaviorClearDelay} onChange={e => up("behaviorClearDelay", parseFloat(e.target.value) || 0)} />
    <InputCheckbox label="text.cleanup_replace_previous_sentence" value={data.behaviorLastSentence} onChange={e => up("behaviorLastSentence", e)} />
    {/* <InputCheckbox label="Break line" value={data.behaviorBreakLine} onChange={e => up("behaviorBreakLine", e)} /> */}
  </>
}

const EffectsInspector: FC<{ id: string }> = ({ id }) => {
  const {t} = useTranslation();
  const {activeScene} = useSnapshot(window.ApiClient.scenes.state);
  const data: Element_TextState = useGetState(state => state.elements[id]?.scenes[activeScene].data as Element_TextState);
  const up = useUpdateElement<Element_TextState>(id);

  return <>
    <Inspector.SubHeader>{t('text.section_audio')}</Inspector.SubHeader>
    <InputCheckbox label="common.field_enable" value={data.soundEnable} onChange={e => up("soundEnable", e)} />
    <InputFile label="text.audio_typing_sound" type="audio" value={data.soundFile} onChange={e => up("soundFile", e)} />
    <InputFile label="text.audio_new_sentence_sound" type="audio" value={data.soundFileNewSentence} onChange={e => up("soundFileNewSentence", e)} />
    <InputFile label="text.audio_show_sound" type="audio" value={data.soundFileOnShow} onChange={e => up("soundFileOnShow", e)} />
    <InputFile label="text.audio_hide_sound" type="audio" value={data.soundFileOnHide} onChange={e => up("soundFileOnHide", e)} />
    <InputRange label="common.field_volume" step="0.01" min="0" max="1" value={data.soundVolume} onChange={e => up("soundVolume", parseFloat(e.target.value) || 0)} />
    <InputDoubleCountainer label="text.audio_params">
      <div className="flex-grow font-semibold text-xs text-center opacity-50">min</div>
      <div className="flex-grow font-semibold text-xs text-center opacity-50">max</div>
    </InputDoubleCountainer>
    <InputDoubleCountainer label="text.audio_detune">
      <InputBaseText type="number" value={data.soundDetuneMin} onChange={e => up("soundDetuneMin", parseFloat(e.target.value) || 0)} />
      <InputBaseText type="number" value={data.soundDetuneMax} onChange={e => up("soundDetuneMax", parseFloat(e.target.value) || 0)} />
    </InputDoubleCountainer>
    <InputDoubleCountainer label="text.audio_playback">
      <InputBaseText type="number" value={data.soundPlaybackMin} onChange={e => up("soundPlaybackMin", parseFloat(e.target.value) || 0)} />
      <InputBaseText type="number" value={data.soundPlaybackMax} onChange={e => up("soundPlaybackMax", parseFloat(e.target.value) || 0)} />
    </InputDoubleCountainer>


    <Inspector.SubHeader>{t('text.section_particles')}</Inspector.SubHeader>
    <InputCheckbox label="common.field_enable" value={data.particlesEnable} onChange={e => up("particlesEnable", e)} />
    <InputFile label="text.particles_first" type="image" value={data.particlesSpriteFileIdFirst} onChange={e => up("particlesSpriteFileIdFirst", e)} />
    <InputFile label="text.particles_second" type="image" value={data.particlesSpriteFileIdSecond} onChange={e => up("particlesSpriteFileIdSecond", e)} />
    <InputFile label="text.particles_third" type="image" value={data.particlesSpriteFileIdThird} onChange={e => up("particlesSpriteFileIdThird", e)} />
    <InputDoubleCountainer label="text.particles_params">
      <div className="flex-grow font-semibold text-xs text-center opacity-50">min</div>
      <div className="flex-grow font-semibold text-xs text-center opacity-50">max</div>
    </InputDoubleCountainer>
    <InputDoubleCountainer label="text.particles_number">
      <InputBaseText type="number" min="0" value={data.particlesCountMin} onChange={e => up("particlesCountMin", e.target.value)} />
      <InputBaseText type="number" min="0" value={data.particlesCountMax} onChange={e => up("particlesCountMax", e.target.value)} />
    </InputDoubleCountainer>
    <InputDoubleCountainer label="text.particles_duration">
      <InputBaseText type="number" min="0" value={data.particlesDurationMin} onChange={e => up("particlesDurationMin", e.target.value)} />
      <InputBaseText type="number" min="0" value={data.particlesDurationMax} onChange={e => up("particlesDurationMax", e.target.value)} />
    </InputDoubleCountainer>

    <InputDoubleCountainer label="text.particles_direction_x">
      <InputBaseText type="number" min="0" value={data.particlesDirectionXMin} onChange={e => up("particlesDirectionXMin", e.target.value)} />
      <InputBaseText type="number" min="0" value={data.particlesDirectionXMax} onChange={e => up("particlesDirectionXMax", e.target.value)} />
    </InputDoubleCountainer>
    <InputDoubleCountainer label="text.particles_direction_y">
      <InputBaseText type="number" min="0" value={data.particlesDirectionYMin} onChange={e => up("particlesDirectionYMin", e.target.value)} />
      <InputBaseText type="number" min="0" value={data.particlesDirectionYMax} onChange={e => up("particlesDirectionYMax", e.target.value)} />
    </InputDoubleCountainer>

    <InputDoubleCountainer label="text.particles_scale">
      <InputBaseText type="number" min="0" value={data.particlesScaleMin} onChange={e => up("particlesScaleMin", e.target.value)} />
      <InputBaseText type="number" min="0" value={data.particlesScaleMax} onChange={e => up("particlesScaleMax", e.target.value)} />
    </InputDoubleCountainer>

    <InputDoubleCountainer label="text.particles_rotation">
      <InputBaseText type="number" min="0" value={data.particlesRotationMin} onChange={e => up("particlesRotationMin", e.target.value)} />
      <InputBaseText type="number" min="0" value={data.particlesRotationMax} onChange={e => up("particlesRotationMax", e.target.value)} />
    </InputDoubleCountainer>

  </>
}

const CssInspector: FC<{ id: string }> = ({ id }) => {
  const {t} = useTranslation();
  const {activeScene} = useSnapshot(window.ApiClient.scenes.state);
  const data: Element_TextState = useGetState(state => state.elements[id]?.scenes[activeScene].data as Element_TextState);
  const up = useUpdateElement<Element_TextState>(id);
  return <>
    <Inspector.SubHeader>{t('text.section_css')}</Inspector.SubHeader>
    <InputCode language="css" label="common.field_css" value={data.css} onChange={e => up("css", e || "")} />
  </>
}

const Inspector_ElementText: FC<{ id: string }> = memo(({ id }) => {
  const {t} = useTranslation();
  const {activeScene} = useSnapshot(window.ApiClient.scenes.state);
  const data = useGetState(state => state.elements[id]?.scenes as Record<string, ElementSceneState<Element_TextState>>);
  const up = useUpdateElement<Element_TextState>(id);

  const [[tab, direction], setTab] = useState<[number, number]>([1, 0]);

  const isInScene = useMemo(() => data && activeScene in data, [activeScene, data]);

  const handleTab = (v: number) => {
    setTab([v, Math.sign(v - tab)]);
  }

  if (!data)
    return <Inspector.Deleted/>

  return <Inspector.Body>
    <Inspector.Header><TbTextResize /> <NameInput id={id} /></Inspector.Header>
    {isInScene && <Inspector.Content>
      <TransformInput id={id} />
      <InputCheckbox label="text.field_preview" value={data[activeScene]?.data?.previewMode} onChange={e => up("previewMode", e)} />
      <Inspector.Tabs>
        <Inspector.Tab tooltip={t('text.section_text_source')} tooltipBody={t('text.section_text_source_desc')} onClick={() => handleTab(0)} active={tab === 0}><IoIosRadio /></Inspector.Tab>
        <Inspector.Tab tooltip={t('text.section_font')} tooltipBody={t('text.section_font_desc')} onClick={() => handleTab(1)} active={tab === 1}><RiFontSize /></Inspector.Tab>
        <Inspector.Tab tooltip={t('text.section_box')} tooltipBody={t('text.section_box_desc')} onClick={() => handleTab(2)} active={tab === 2}><BsTextareaResize /></Inspector.Tab>
        <Inspector.Tab tooltip={t('text.section_behaviour')} tooltipBody={t('text.section_behaviour_desc')} onClick={() => handleTab(3)} active={tab === 3}><VscSettings /></Inspector.Tab>
        <Inspector.Tab tooltip={t('text.section_effects')} tooltipBody={t('text.section_effects_desc')} onClick={() => handleTab(4)} active={tab === 4}><BsStars /></Inspector.Tab>
        <Inspector.Tab tooltip={t('text.section_css')} onClick={() => handleTab(5)} active={tab === 5}><SiCsswizardry /></Inspector.Tab>
      </Inspector.Tabs>
      <Inspector.TabsContent direction={direction} tabKey={tab}>
        {tab === 0 && <SourceInspector id={id} />}
        {tab === 1 && <TextInspector id={id} />}
        {tab === 2 && <BoxInspector id={id} />}
        {tab === 3 && <BehaviourInspector id={id} />}
        {tab === 4 && <EffectsInspector id={id} />}
        {tab === 5 && <CssInspector id={id} />}
      </Inspector.TabsContent>
    </Inspector.Content>}
    {!isInScene && <Inspector.Content>
      <Inspector.AddToScene id={id} />
    </Inspector.Content>}
  </Inspector.Body>
})
Inspector_ElementText.displayName = "Inspector_ElementText";
export default Inspector_ElementText;
