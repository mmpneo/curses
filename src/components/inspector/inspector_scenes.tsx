import { FC } from "react";
import Inspector from ".";
import { useGetState, useUpdateState } from "../../frontend-services";
import { nanoid } from "nanoid";
import { SceneState } from "../../frontend-services/schema";
import Input from "../input";
import { RiDeleteBack2Fill, RiStarFill, RiStarLine } from "react-icons/ri";

const Scene: FC<{ data: SceneState }> = ({ data }) => {
  const defaultScene = useGetState(state => state.defaultScene);
  const update = useUpdateState();
  return <div className="group flex flex-col space-y-1 p-2 border rounded-md border-neutral">
    {/* <span className="text-sm flex-grow">{data.name}</span> */}

    <Input.Text label="Name" value={data.name} onChange={e => update(state => {state.scenes[data.id].name = e.target.value})} />
    <Input.Text label="OBS name" value={data.bindOBSName} onChange={e => update(state => {state.scenes[data.id].bindOBSName = e.target.value})} />
    <Input.Checkbox label="Bind OBS" value={data.bindOBS} onChange={e => update(state => {state.scenes[data.id].bindOBS = e})} />
    <div className="flex space-x-2">
      <button className="btn btn-sm btn-ghost gap-2 flex-grow" onClick={() => window.APIFrontend.scenes.setDefault(data.id)}>{defaultScene === data.id ? <RiStarFill/> : <RiStarLine/>} Make default</button>
      <button disabled={data.id === "main"} className="btn btn-sm gap-2 btn-error" onClick={() => window.APIFrontend.scenes.deleteScene(data.id)}><RiDeleteBack2Fill/> Delete</button>
    </div>
  </div>
}

const Inspector_Scenes: FC = () => {
  const scenes = useGetState(state => state.scenes);
  const canvas = useGetState(state => state.canvas);

  const updateState = useUpdateState();

  // create scene
  return <Inspector.Body>
    <Inspector.Header>Layout & Scenes</Inspector.Header>
    <Inspector.Content>
      <Inspector.SubHeader>Canvas</Inspector.SubHeader>
      <Input.Text label="Canvas width" type="number" value={canvas?.w} onChange={e => updateState(state => { state.canvas.w = parseFloat(e.target.value) })} />
      <Input.Text label="Canvas height" type="number" value={canvas?.h} onChange={e => updateState(state => { state.canvas.h = parseFloat(e.target.value) })} />

      <Inspector.SubHeader>Scenes</Inspector.SubHeader>
      {scenes && Object.keys(scenes).map((sceneId) => <Scene key={sceneId} data={scenes[sceneId]} />)}
      <button className="btn btn-sm" onClick={() => window.APIFrontend.scenes.addScene("New scene")}>Create scene</button>
    </Inspector.Content>
  </Inspector.Body>
}

export default Inspector_Scenes;