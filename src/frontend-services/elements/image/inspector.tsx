import { FC } from "react";
import { RiImageFill, RiImageLine } from "react-icons/ri";
import { SiCsswizardry } from "react-icons/si";
import { useGetState, useUpdateState } from "../..";
import Input from "../../../components/input";
import Inspector, { useInspectorTabs } from "../../../components/inspector";
import NameInput from "../../components/name-input";
import TransformInput from "../../components/transform-input";
import { Element_ImageState } from "./schema";


const BaseInspector: FC<{ id: string }> = ({ id }) => {
  const data: Element_ImageState = useGetState(state => state.elements[id].scenes["main"].data);
  const update = useUpdateState();
  const up = <K extends keyof Element_ImageState>(key: K, v: Element_ImageState[K]) => update(state => {
    state.elements[id].scenes["main"].data[key] = v;
  });
  return <>
    <Inspector.SubHeader>Base style</Inspector.SubHeader>
    <Input.File type="image" value={data.fileId} onChange={id => up("fileId", id)} label="File" />
    <Input.Text type="number" value={data.styleOpacity} onChange={e => up("styleOpacity", parseFloat(e.target.value) || 0)} label="Opacity" />
  </>
}

const ActiveInspector: FC<{ id: string }> = ({ id }) => {
  const data: Element_ImageState = useGetState(state => state.elements[id].scenes["main"].data);
  const update = useUpdateState();
  const up = <K extends keyof Element_ImageState>(key: K, v: Element_ImageState[K]) => update(state => {
    state.elements[id].scenes["main"].data[key] = v;
  });

  return <>
    <Inspector.SubHeader>
      <div className="overflow-hidden flex flex-col">
        <span>Active style</span>
        <p className="text-xs text-base-content/70 whitespace-normal font-normal">Temporary replace your image when something happens. For more advanced animations (tweening, keyframes) use css</p>
      </div>
    </Inspector.SubHeader>
    <Input.File type="image" value={data.activeFileId} onChange={id => up("activeFileId", id)} label="File" />
    <Input.Text type="number" value={data.activeStyleOpacity} onChange={e => up("activeStyleOpacity", parseFloat(e.target.value) || 0)} label="Opacity" />
    <Input.Text type="number" min={0} value={data.activeTransitionDuration} onChange={e => up("activeTransitionDuration", parseFloat(e.target.value) || 0)} label="Transition" />

    <Inspector.SubHeader>Event</Inspector.SubHeader>
    <Input.Event value={data.activeEvent} onChange={event => up("activeEvent", event)} label="Event" />
    <Input.Text type="number" min={0} value={data.activeDuration} onChange={e => up("activeDuration", parseFloat(e.target.value) || 0)} label="Duration" />
  </>
}

const CssInspector: FC<{ id: string }> = ({ id }) => {
  const data: Element_ImageState = useGetState(state => state.elements[id].scenes["main"].data);
  const update = useUpdateState();
  const up = <K extends keyof Element_ImageState>(key: K, v: Element_ImageState[K]) => update(state => {
    state.elements[id].scenes["main"].data[key] = v;
  });
  return <>
    <Inspector.SubHeader>CSS style</Inspector.SubHeader>
    <Input.Code language="css" label="CSS" value={data.styleCss} onChange={e => up("styleCss", e || "")} />
  </>
}

const Inspector_ElementImage: FC<{ id: string }> = ({ id }) => {
  const [[tab, direction], handleTab] = useInspectorTabs();
  const data: Element_ImageState = useGetState(state => state.elements[id]?.scenes["main"].data);

  if (!data)
    return <Inspector.Body>Deleted</Inspector.Body>

  return <Inspector.Body>
    <Inspector.Header><RiImageFill /> <NameInput id={id} /></Inspector.Header>
    <Inspector.Content>
    <TransformInput id={id} />
      <Inspector.Tabs>
        <Inspector.Tab tooltip="Base style" tooltipBody="Image file, opacity" onClick={() => handleTab(0)} active={tab === 0}><RiImageLine /></Inspector.Tab>
        <Inspector.Tab tooltip="Active style" tooltipBody="Image animation" onClick={() => handleTab(1)} active={tab === 1}><RiImageFill /></Inspector.Tab>
        <Inspector.Tab tooltip="CSS" onClick={() => handleTab(2)} active={tab === 2}><SiCsswizardry /></Inspector.Tab>
      </Inspector.Tabs>
      <Inspector.TabsContent direction={direction} tabKey={tab}>
        {tab === 0 && <BaseInspector id={id} />}
        {tab === 1 && <ActiveInspector id={id} />}
        {tab === 2 && <CssInspector id={id} />}
      </Inspector.TabsContent>
    </Inspector.Content>
  </Inspector.Body>
}

export default Inspector_ElementImage;
