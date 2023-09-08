import { useGetState, useUpdateState } from "@/client";
import { SceneState } from "@/client/services/scenes/schema";
import { FC } from "react";
import { RiAddCircleFill, RiMore2Fill, RiStackFill } from "react-icons/ri";
import { useSnapshot } from "valtio";
import Dropdown from "../dropdown/Dropdown";
import Tooltip from "../dropdown/Tooltip";
import Inspector from "./components";
import { InputBaseText, InputDoubleCountainer } from "./components/input";
import { useTranslation } from "react-i18next";

const SceneMenu: FC<{ id: string }> = ({ id }) => {
  const {t} = useTranslation();
  return (
    <ul className="dropdown p-2">
      <li className="menu-title"><span>{t('scenes.scene_menu_title')}</span></li>
      <li><button onClick={() => window.ApiClient.scenes.duplicateScene(id)}>{t('scenes.btn_duplicate_scene')}</button></li>
      {id !== 'main' && <li><button onClick={() => window.ApiClient.scenes.deleteScene(id)}>{t('scenes.btn_remove_scene')}</button></li>}
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
    <Dropdown placement="right" content={<SceneMenu id={data.id} />}>
      <button className="btn btn-sm btn-ghost btn-circle flex-nowrap whitespace-nowrap gap-1"><RiMore2Fill/></button>
    </Dropdown>
  </div>
}

const Inspector_Scenes: FC = () => {
  const {t} = useTranslation();
  const scenes = useGetState(state => state.scenes);
  const canvas = useGetState(state => state.canvas);

  const updateState = useUpdateState();

  // create scene
  return <Inspector.Body>
    <Inspector.Header><RiStackFill /> {t('scenes.title')}</Inspector.Header>
    <Inspector.Content>
      <Inspector.SubHeader>{t('scenes.section_canvas')}</Inspector.SubHeader>
      <InputDoubleCountainer label="scenes.field_canvas_size">
        <InputBaseText value={canvas?.w} onChange={e => updateState(state => { state.canvas.w = parseFloat(e.target.value) })} type="number"/>
        <InputBaseText value={canvas?.h} onChange={e => updateState(state => { state.canvas.h = parseFloat(e.target.value) })} type="number"/>
      </InputDoubleCountainer>

      <Inspector.SubHeader>{t('scenes.section_scenes')}</Inspector.SubHeader>
      {scenes && Object.keys(scenes).map((sceneId) => <Scene key={sceneId} data={scenes[sceneId]} />)}
      <button className="btn btn-sm gap-2" onClick={() => window.ApiClient.scenes.addScene()}><RiAddCircleFill /> {t('scenes.btn_add_scene')}</button>
    </Inspector.Content>
  </Inspector.Body>
}

export default Inspector_Scenes;
