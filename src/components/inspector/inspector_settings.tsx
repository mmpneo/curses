import { emit } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/tauri";
import { FC } from "react";
import { RiSettings2Fill } from "react-icons/ri";
import { useSnapshot } from "valtio";
import Inspector from ".";
import { BackendState } from "../../backend-services/schema";
import Input from "../input";

const themesLight = [
  'customblack',
  'light',
  'lofi',
  'cupcake',
  'corporate',
  'retro',
  'valentine',
  'garden',
  'aqua',
  'pastel',
  'wireframe',
  'winter',
  'cyberpunk',
  // 'bumblebee',
  // 'emerald',
  // 'fantasy',
  // 'cmyk',
  // 'autumn',
  // 'acid',
  // 'lemonade',
]

const themesDark = [
  'dark',
  'synthwave',
  'halloween',
  'forest',
  'black',
  'luxury',
  'dracula',
  'business',
  'night',
  'coffee',
]

const options = [
  { label: 'Light', options: themesLight.map(theme => ({ value: theme, label: theme })) },
  { label: 'Dark', options: themesDark.map(theme => ({ value: theme, label: theme })) }
]

const UI_SCALE_MIN = 0.8;
const UI_SCALE_MAX = 1.5;

const Inspector_Settings: FC = () => {
  const {clientTheme, uiScale, shortcuts} = useSnapshot(window.API.state);
  const handleChangeTheme = (v: string) => window.API.changeTheme(v);
  const handleChangeScale = (v: string | number) => {
    const _v = typeof v === "string" ? parseFloat(v) : v;
    window.API.changeScale(Math.max(UI_SCALE_MIN, Math.min(UI_SCALE_MAX, _v)));
  }

  const handleShortcuts = (key: keyof BackendState["shortcuts"], v: string) => {
    window.API.state.shortcuts[key] = v;
  }

  const getIP = () => {
    invoke("plugin:web|config");
  }

  return <Inspector.Body>
    <Inspector.Header><RiSettings2Fill /> Settings</Inspector.Header>
    <Inspector.Content>
      <Inspector.SubHeader>UI</Inspector.SubHeader>
      <Input.Select label="Theme" options={options} value={{ value: clientTheme, label: clientTheme }} onChange={(e: any) => handleChangeTheme(e.value)} />
      <Input.Chips label="UI scale" value={uiScale} onChange={e => handleChangeScale(e)} options={[
        {label: "S", value: .8},
        {label: "M", value: 1},
        {label: "L", value: 1.2},
        {label: "X", value: 1.4},
      ]}/>
      <Inspector.SubHeader>Connection</Inspector.SubHeader>
      <Input.Checkbox label="Network share"/>
      <Input.Container label="Connection"><span className=" font-semibold badge badge-success">active</span></Input.Container>
      <Input.Container label="Remote Connection"><span className=" font-semibold badge badge-neutral">disconnected</span></Input.Container>

      <button onClick={getIP}>get ip</button>
      {/* <Input.Container label="Link">
        <div className="btn-group">
          <button className="btn btn-sm self-end">Copy</button>
          <button className="btn btn-sm self-end">Copy remote</button>
          <button className="btn btn-sm btn-warning self-end">Refresh</button>
        </div>
      </Input.Container> */}
      
      <div className="opacity-50">Made with 💗 by Mmp</div>
    </Inspector.Content>
  </Inspector.Body>
}

export default Inspector_Settings;