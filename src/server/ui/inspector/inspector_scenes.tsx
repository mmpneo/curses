import { useGetState, useUpdateState } from "@/client";
import { SceneState } from "@/client/services/scenes/schema";
import { FC } from "react";
import { RiAddCircleFill, RiMore2Fill, RiStackFill } from "react-icons/ri";
import { useSnapshot } from "valtio";
import Dropdown from "../dropdown/Dropdown";
import Tooltip from "../dropdown/Tooltip";
import Inspector from "./components";
import { InputBaseText, InputDoubleCountainer } from "./components/input";

const SceneMenu: FC<{ id: string }> = ({ id }) => {
  return (
    <ul className="dropdown p-2">
      <li className="menu-title"><span>Scene</span></li>
      <li><button onClick={() => window.ApiClient.scenes.duplicateScene(id)}>Duplicate scene</button></li>
      <li><button onClick={() => window.ApiClient.scenes.deleteScene(id)}>Remove scene</button></li>
    </ul>
  );
};

const Scene: FC<{ data: SceneState }> = ({ data }) => {
  const {activeScene} = useSnapshot(window.ApiClient.scenes.state);
  const update = useUpdateState();

  return <div className="flex items-center space-x-2">
    <Tooltip className="flex items-center" placement="top" content={`Activate`}>
      <input type="radio" name="font" value={data.id} checked={data.id === activeScene} onChange={e => window.ApiClient.scenes.setActive(e.target.value)} className="radio radio-sm radio-primary" />
    </Tooltip>
    <InputBaseText disabled={data.id === 'main'} fieldWidth={false} className="w-full" value={data.name} onChange={e => update(state => { state.scenes[data.id].name = e.target.value })} />
    {data.id !== 'main' && <Dropdown placement="right" content={<SceneMenu id={data.id} />}>
      <button className="btn btn-sm btn-ghost btn-circle flex-nowrap whitespace-nowrap gap-1"><RiMore2Fill/></button>
    </Dropdown>}
  </div>
}

const Inspector_Scenes: FC = () => {
  const scenes = useGetState(state => state.scenes);
  const canvas = useGetState(state => state.canvas);

  const updateState = useUpdateState();

  // create scene
  return <Inspector.Body>
    <Inspector.Header><RiStackFill /> Layout & Scenes</Inspector.Header>
    <Inspector.Content>
      <Inspector.SubHeader>Canvas</Inspector.SubHeader>
      <InputDoubleCountainer label="Canvas Size">
        <InputBaseText value={canvas?.w} onChange={e => updateState(state => { state.canvas.w = parseFloat(e.target.value) })} type="number"/>
        <InputBaseText value={canvas?.h} onChange={e => updateState(state => { state.canvas.h = parseFloat(e.target.value) })} type="number"/>
      </InputDoubleCountainer>

      <Inspector.SubHeader>Scenes</Inspector.SubHeader>
      {scenes && Object.keys(scenes).map((sceneId) => <Scene key={sceneId} data={scenes[sceneId]} />)}
      <button className="btn btn-sm gap-2" onClick={() => window.ApiClient.scenes.addScene()}><RiAddCircleFill /> Add scene</button>
    </Inspector.Content>
  </Inspector.Body>
}

export default Inspector_Scenes;
