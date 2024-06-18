import { useGetState } from "@/client";
import { ServiceNetworkState } from "@/types";
import { getVersion } from '@tauri-apps/api/app';
import { FC, memo, useEffect, useState } from "react";
import { RiFileCopyLine, RiSettings2Fill } from "react-icons/ri";
import { SiDiscord, SiPatreon, SiTwitch, SiTwitter } from "react-icons/si";
import { useSnapshot } from "valtio";
import Dropdown from "../dropdown/Dropdown";
import Tooltip from "../dropdown/Tooltip";
import Logo from "../logo";
import ServiceButton from "../service-button";
import Inspector from "./components";
import { InputChips, InputNetworkStatus, InputSelect, InputShortcut, InputText } from "./components/input";
import { useTranslation } from "react-i18next";
import { i18nLanguages, loadLanguageFile } from "@/i18n";
const themesLight = [
  'light',
  'lofi',
  'cupcake',
  'retro',
  'valentine',
  'garden',
  'aqua',
  'pastel',
  'wireframe',
  'winter',
  'cyberpunk',
  // 'corporate',
  // 'bumblebee',
  // 'emerald',
  // 'fantasy',
  // 'cmyk',
  // 'autumn',
  // 'acid',
  // 'lemonade',
]

const themesDark = [
  'curses',
  'matrix',
  'staffy',
  'dark',
  'synthwave',
  'halloween',
  'forest',
  'black',
  'dracula',
  'business',
  'night',
  'coffee',
  // 'luxury',
]

const options = [
  { label: 'Light themes', options: themesLight.map(theme => ({ value: theme, label: theme })) },
  { label: 'Dark themes', options: themesDark.map(theme => ({ value: theme, label: theme })) }
]

const UI_SCALE_MIN = 0.8;
const UI_SCALE_MAX = 1.5;

const languageOptions = i18nLanguages.map(({code, name}) => ({label: name, value: code}));

const AddrInput = () => {
  const [v, setV] = useState(window.ApiServer.state.linkAddress);
  const upd = (v: string) => {
    setV(v);
    window.ApiServer.state.linkAddress = v;
  }
  return <InputText value={v} onChange={e => upd(e.target.value)} label="settings.field_ip_address" placeholder="192.168..smth" />
}

const ExportMenu: FC = () => {
  const [name, setName] = useState("");
  return <div className="menu bg-base-100 p-4 w-72 rounded-box flex flex-col space-y-2">
    <span className="menu-title"><span>Export template</span></span>
    <InputText label="Author" value={name} onChange={e => setName(e.target.value)} />
    <button className="btn btn-sm btn-primary" onClick={() => name && window.ApiClient.document.exportDocument(name)}>Export</button>
  </div>;
}

const Inspector_Settings: FC = memo(() => {
  const {t} = useTranslation();
  const { clientTheme, uiScale, uiLanguage, backgroundInputTimer } = useSnapshot(window.ApiServer.state);
  const { state: linkStatus } = useSnapshot(window.ApiShared.pubsub.serviceState);
  const author = useGetState(state => state.author);

  const [version, setVersion] = useState("")
  useEffect(() => {
    getVersion().then(setVersion);
  }, [])

  const handleChangeTheme = (v: string) => window.ApiServer.changeTheme(v);
  const handleChangeLanguage = (v: string) => window.ApiServer.changeLanguage(v);

  const handleChangeScale = (v: string | number) => {
    const _v = typeof v === "string" ? parseFloat(v) : v;
    window.ApiServer.changeScale(Math.max(UI_SCALE_MIN, Math.min(UI_SCALE_MAX, _v)));
  }

  return <Inspector.Body>
    <Inspector.Header><RiSettings2Fill /> {t('settings.title')}</Inspector.Header>
    <Inspector.Content>
      <div className="flex flex-col items-center space-y-1">
        <span className="text-4xl leading-none font-header font-black"><Logo/></span>
        <div className="flex space-x-1 self-center">
          <Tooltip content="/mmpcode" body={<span>I stream app development, vrc udon <br/> stuff and games sometimes</span>}>
            <a target="_blank" href="https://www.twitch.tv/mmpcode" className="btn text-primary btn-ghost btn-circle text-2xl"><SiTwitch /></a>
          </Tooltip>
          <Tooltip content="@mmpneo" body="I tweet once a year, LUL">
            <a target="_blank" href="https://twitter.com/mmpneo" className="btn text-primary btn-ghost btn-circle text-2xl"><SiTwitter /></a>
          </Tooltip>
          <Tooltip content="Code and Curses" body={<span>App updates and help</span>}>
            <a target="_blank" href="https://discord.gg/Sw6pw8fGYS" className="btn text-primary btn-ghost btn-circle text-2xl"><SiDiscord /></a>
          </Tooltip>
          <Tooltip content="Patreon" body={<span>Subscribe to get a Supporter role in discord <br/> (completely useless, just different color) <img className="h-8" src="/peepoSmile.webp"/></span>}>
            <a target="_blank" href="https://www.patreon.com/mmpcode" className="btn text-primary btn-ghost btn-circle text-2xl"><SiPatreon /></a>
          </Tooltip>
        </div>
        <div className="self-center text-sm opacity-50">{t('settings.desc_1')}</div>
        <div className="self-center text-sm opacity-50">{t('settings.desc_2')}</div>
        <div className="self-center text-sm opacity-50">v.{version}</div>
      </div>
      <div className="divider"></div>

      <InputSelect label="settings.field_app_theme" options={options} value={clientTheme} onValueChange={handleChangeTheme} />
      <InputChips label="settings.field_ui_scale" value={uiScale} onChange={e => handleChangeScale(e)} options={[
        { label: "S", value: .8 },
        { label: "M", value: 1 },
        { label: "L", value: 1.2 },
        { label: "X", value: 1.4 },
      ]} />
      <InputSelect label="settings.field_language" options={languageOptions} value={uiLanguage} onValueChange={handleChangeLanguage} />
      <Inspector.Description><span className="text-primary font-semibold mt-2" onClick={loadLanguageFile}>{t('settings.btn_import_translation')}</span></Inspector.Description>


      <Inspector.SubHeader>{t('settings.section_template')}</Inspector.SubHeader>
      {author && <span className="text-sm text-secondary font-semibold">Created by {author}</span>}
      <div className="flex items-center space-x-2">
        <button onClick={() => window.ApiClient.document.importDocument()} className="flex-grow btn btn-sm gap-2"><RiFileCopyLine /> {t('settings.btn_import_template')}</button>
        <Dropdown className="flex-grow btn btn-sm gap-2" targetOffset={24} placement="right" content={<ExportMenu />}>
          <RiFileCopyLine /> {t('settings.btn_export_template')}
        </Dropdown>
      </div>

      {window.Config.features.background_input && <>
        <Inspector.SubHeader>Background Input</Inspector.SubHeader>
        <InputShortcut label="Shortcut" shortcut="bgInput" />
        <InputText label="Timer" value={backgroundInputTimer} onChange={e => window.ApiServer.state.backgroundInputTimer = e.target.value} type="number"/>
        <div className="text-xs opacity-70">
          Use <kbd className="kbd kbd-sm font-semibold text-primary">Esc</kbd> to cancel input, <kbd className="kbd kbd-sm font-semibold text-primary">Enter</kbd> to submit and <kbd className="kbd kbd-sm font-semibold text-primary">Backspace</kbd> to delete
        </div>
      </>}


      <Inspector.SubHeader>{t('settings.section_link_apps')}</Inspector.SubHeader>
      <Inspector.Description>{t('settings.section_link_apps_desc')}</Inspector.Description>
      <Inspector.Deactivatable active={linkStatus === ServiceNetworkState.disconnected}>
        <AddrInput />
        <InputNetworkStatus value={linkStatus} label="common.field_connection_status" />
      </Inspector.Deactivatable>
      <ServiceButton startLabel="common.btn_connect" stopLabel="common.btn_disconnect" status={linkStatus} onStart={() => window.ApiShared.pubsub.linkConnect()} onStop={() => window.ApiShared.pubsub.linkDisconnect()} />
      <button className="btn btn-sm btn-ghost" onClick={() => window.ApiShared.pubsub.copyLinkAddress()}>{t('settings.btn_copy_address')}</button>

    </Inspector.Content>
  </Inspector.Body>
})
export default Inspector_Settings;
