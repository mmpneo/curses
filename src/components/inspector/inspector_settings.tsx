import { FC } from "react";
import { useSnapshot } from "valtio";
import Inspector from ".";

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

const Inspector_Settings: FC = () => {
    const state = useSnapshot(window.API.state)
    const handleChangeTheme = (v: string) => window.API.changeTheme(v);
    return <Inspector.Body>
        <Inspector.Header>Settings</Inspector.Header>
        <Inspector.Content>
            <fieldset>
                <label>Theme</label>
                <select onChange={e => handleChangeTheme(e.target.value)} value={state.clientTheme} className="field-width">
                    <optgroup label="Light">
                        {themesLight.map((theme, i) => <option key={i} value={theme}>{theme}</option>)}
                    </optgroup>
                    <optgroup label="Dark">
                        {themesDark.map((theme, i) => <option key={i} value={theme}>{theme}</option>)}
                    </optgroup>
                </select>
            </fieldset>
        </Inspector.Content>
    </Inspector.Body>
}

export default Inspector_Settings;