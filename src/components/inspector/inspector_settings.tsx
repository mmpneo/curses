import { globalShortcut } from "@tauri-apps/api";
import { FC } from "react";
import { RiSettings2Fill } from "react-icons/ri";
import { useSnapshot } from "valtio";
import Inspector from ".";
import { BackendState } from "../../backend-services/schema";
import Input from "../input";

const themesLight = [
  'light',
  'lofi',
  'cupcake',
  'bumblebee',
  'emerald',
  'corporate',
  'retro',
  'valentine',
  'garden',
  'aqua',
  'pastel',
  'fantasy',
  'cmyk',
  'autumn',
  'acid',
  'wireframe',
  'lemonade',
  'winter',
  'cyberpunk',
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

const Inspector_Settings: FC = () => {
  const {clientTheme, shortcuts} = useSnapshot(window.API.state);
  const handleChangeTheme = (v: string) => window.API.changeTheme(v);
  
  const handleShortcuts = (key: keyof BackendState["shortcuts"], v: string) => {
    window.API.state.shortcuts[key] = v;
  }

  return <Inspector.Body>
    <Inspector.Header><RiSettings2Fill /> Settings</Inspector.Header>
    <Inspector.Content>
      <Input.Select label="Theme" options={options} value={{ value: clientTheme, label: clientTheme }} onChange={(e: any) => handleChangeTheme(e.value)} />

      {/* <Inspector.SubHeader>Shortcuts</Inspector.SubHeader>
      <Input.Text onChange={e => handleShortcuts("start", e.target.value) } value={shortcuts.start} label="Start/Stop" />
      <Input.Text onChange={e => handleShortcuts("muteMic", e.target.value) } value={shortcuts.muteMic} label="Mute microphone" />
      <Input.Text onChange={e => handleShortcuts("muteSound", e.target.value) } value={shortcuts.muteSound} label="Mute editor" /> */}
    </Inspector.Content>
  </Inspector.Body>
}

export default Inspector_Settings;