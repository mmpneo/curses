import { FC }                                                                              from "react";
import Inspector                       from "../../index";
import { useGetState, useUpdateState } from "@/client";
import Input                           from "../../../input";
import { RiCheckboxBlankCircleLine, RiCheckboxCircleFill, RiDeleteBack2Fill, RiStackFill } from "react-icons/ri";
import classNames     from "classnames";
import { SceneState } from "@/client/services/scenes/schema";

const Scene: FC<{ data: SceneState }> = ({ data }) => {
  const defaultScene = useGetState(state => state.activeScene);
  const update = useUpdateState();
  return <div className="group flex flex-col border space-y-2 px-3 py-2 bg-base-200 rounded-md border-neutral/10">
    <Input.Text label="Name" value={data.name} onChange={e => update(state => { state.scenes[data.id].name = e.target.value })} />
    <Input.Checkbox label="Bind to OBS" value={data.bindOBS} onChange={e => update(state => { state.scenes[data.id].bindOBS = e })} />
    {data.bindOBS && <Input.Text label="OBS scene name" value={data.bindOBSName} onChange={e => update(state => { state.scenes[data.id].bindOBSName = e.target.value })} />}
    <div className="flex justify-end space-x-2">
      <button className={classNames("btn btn-sm gap-2", defaultScene === data.id ? "btn-success" : "btn-ghost")} onClick={() => window.ApiClient.scenes.setActive(data.id)}>
        {defaultScene === data.id ? <RiCheckboxCircleFill className="text-lg" /> : <RiCheckboxBlankCircleLine className="text-lg" />}
        Active</button>
      <button disabled={data.id === "main"} className="btn btn-sm gap-2 btn-error" onClick={() => window.ApiClient.scenes.deleteScene(data.id)}><RiDeleteBack2Fill /> Delete</button>
    </div>
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
      <Input.DoubleCountainer label="Canvas Size">
        <Input.BaseText value={canvas?.w} onChange={e => updateState(state => { state.canvas.w = parseFloat(e.target.value) })} type="number"/>
        <Input.BaseText value={canvas?.h} onChange={e => updateState(state => { state.canvas.h = parseFloat(e.target.value) })} type="number"/>
      </Input.DoubleCountainer>

      <Inspector.SubHeader>Scenes</Inspector.SubHeader>
      {scenes && Object.keys(scenes).map((sceneId) => <Scene key={sceneId} data={scenes[sceneId]} />)}
      <button className="btn btn-sm" onClick={() => window.ApiClient.scenes.addScene("New scene")}>Create scene</button>
    </Inspector.Content>
  </Inspector.Body>
}

export default Inspector_Scenes;
