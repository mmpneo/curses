import { appWindow } from "@tauri-apps/api/window";
import { exit } from '@tauri-apps/api/process';
import classNames from "classnames";
import { FC, HtmlHTMLAttributes, PropsWithChildren, ReactNode, useState } from "react";
import { RiChatVoiceFill, RiFileListLine, RiMicFill, RiMicOffFill, RiPushpin2Fill, RiPushpinFill, RiStackFill, RiTranslate2, RiUserVoiceFill, RiVolumeMuteFill, RiVolumeUpFill } from "react-icons/ri";
import { RxInput } from "react-icons/rx";
import { VscChromeClose, VscChromeMaximize, VscChromeMinimize } from "react-icons/vsc";
import { useSnapshot }         from "valtio";
import { ServiceNetworkState } from "../../types";
import Tooltip                 from "./dropdown/Tooltip";
import Logo                    from "./logo";
import { invoke } from "@tauri-apps/api/tauri";
import { SttMuteState } from "../services/stt/types";
import { useTranslation } from "react-i18next";

const Divider: FC = () => {
  return <div className="flex-none h-4 w-1 bg-neutral rounded-full"></div>
}

type BtnProps<T> = FC<PropsWithChildren<HtmlHTMLAttributes<HTMLButtonElement> & T>>

const Button: BtnProps<{ tooltip: string, body?: ReactNode }> = ({ tooltip, body, children, className = "btn-ghost", ...rest }) => {
  return <Tooltip content={tooltip} body={body}>
    <button {...rest} className={classNames("btn h-10 min-h-fit text-xl w-10 btn-square flex items-center justify-center", className)}>{children}</button>
  </Tooltip>
}

const ButtonService: BtnProps<{ status: ServiceNetworkState, tooltip: string, body?: ReactNode }> = ({ status, tooltip, body, children, ...rest }) => {
  const {t} = useTranslation();
  const classes = status === ServiceNetworkState.connected ? "btn-success" : status === ServiceNetworkState.connecting ? "btn-neutral" : "btn-ghost"
  return <Tooltip className="flex-none" content={tooltip} body={t(`common.status_${status}`)}>
    <button {...rest} className={classNames("btn border-2 h-10 min-h-fit text-xl w-10 btn-square flex items-center justify-center", classes, { "loading": status === ServiceNetworkState.connecting })}>
      {status !== ServiceNetworkState.connecting && children}
    </button>
  </Tooltip>
}

const SttMuteButton: BtnProps<{ status: ServiceNetworkState, tooltip: string, body?: ReactNode }> = ({ status, tooltip, body, children, ...rest }) => {
  const classes = status === ServiceNetworkState.connected ? "btn-success" : status === ServiceNetworkState.connecting ? "btn-neutral" : "btn-ghost"
  return <Tooltip className="flex-none" content={tooltip} body={status}>
    <button {...rest} className={classNames("btn border-2 h-10 min-h-fit text-xl w-10 btn-square flex items-center justify-center", classes, { "loading": status === ServiceNetworkState.connecting })}>
      {status !== ServiceNetworkState.connecting && children}
    </button>
  </Tooltip>
}


const handleSwitchFullscreenInput = () => window.ApiServer.state.showOverlay = !window.ApiServer.state.showOverlay;
const handleSwitchLogs = () => window.ApiServer.state.showLogs = !window.ApiServer.state.showLogs;

const handleSwitchMuteSTT = () => window.ApiServer.stt.toggleMute();
const handleSwitchSoundEffects = () => window.ApiServer.state.muteSoundEffects = !window.ApiServer.state.muteSoundEffects;
const handleSwitchSTT = () => {
  if (window.ApiServer.stt.serviceState.status === ServiceNetworkState.disconnected)
    window.ApiServer.stt.start();
  else if (window.ApiServer.stt.serviceState.status === ServiceNetworkState.connected)
    window.ApiServer.stt.stop();
}
const handleSwitchTTS = () => {
  if (window.ApiServer.tts.serviceState.status === ServiceNetworkState.disconnected)
    window.ApiServer.tts.start();
  else if (window.ApiServer.tts.serviceState.status === ServiceNetworkState.connected)
    window.ApiServer.tts.stop();
}
const handleSwitchTranslation = () => {
  if (window.ApiServer.translation.serviceState.status === ServiceNetworkState.disconnected)
    window.ApiServer.translation.start();
  else if (window.ApiServer.translation.serviceState.status === ServiceNetworkState.connected)
    window.ApiServer.translation.stop();
}

const ActionBar: FC = () => {
  return <div data-tauri-drag-region className="relative w-full py-1 flex items-center space-x-1 sm:space-x-2 px-2">
    <div className="w-full pointer-events-none font-black text-2xl align-middle leading-tight font-header">
      <span className="hidden sm:block text-sm">
        <Logo/>
      </span>
      </div>
    <AppActions />
    <div className="pointer-events-none w-full flex justify-end">
      <WindowActions />
    </div>
  </div>
}

const AppActions: FC = () => {
  const {t} = useTranslation();
  const { muted: sttMute, status: sttStatus } = useSnapshot(window.ApiServer.stt.serviceState);
  const { muteSoundEffects: vfxMute, showLogs } = useSnapshot(window.ApiServer.state);
  const { status: ttsStatus } = useSnapshot(window.ApiServer.tts.serviceState);
  const { status: translationStatus } = useSnapshot(window.ApiServer.translation.serviceState);

  const { showActionButton: sttButton } = useSnapshot(window.ApiServer.state.services.stt);
  const { showActionButton: ttsButton } = useSnapshot(window.ApiServer.state.services.tts);
  const { showActionButton: translationButton } = useSnapshot(window.ApiServer.state.services.translation);

  return <div className="flex flex-none items-center space-x-0 sm:space-x-2">
    {showLogs ? 
      <Button tooltip={t('main.btn_show_canvas')} onClick={handleSwitchLogs} ><RiStackFill /></Button> :
      <Button tooltip={t('main.btn_show_logs')} onClick={handleSwitchLogs} ><RiFileListLine /></Button>
    }
    <Button tooltip={t('main.btn_fullscreen_input')} onClick={handleSwitchFullscreenInput} ><RxInput /></Button>
    {/* <Button tooltip={t('main.btn_show_canvas')} onClick={handleSwitchLogs} ><RxInput /></Button> */}
    <Button className={vfxMute ? "btn-error" : "btn-ghost"} tooltip={t('main.btn_mute_effects')} body={t('main.btn_mute_effects_desc')} onClick={handleSwitchSoundEffects}>{vfxMute ? <RiVolumeMuteFill /> : <RiVolumeUpFill />}</Button>

    {window.ApiServer.stt.serviceState.muted === SttMuteState.muted && (
      <Button className="btn-error" tooltip={t('main.btn_unmute_stt')} onClick={handleSwitchMuteSTT}>
        <RiMicOffFill />
      </Button>  
    )}

    {window.ApiServer.stt.serviceState.muted === SttMuteState.pendingUnmute && (
      <Button className="btn-outline btn-error !text-error border-2 hover:!bg-transparent" tooltip="Pending unmute" body={<>Waiting for STT to finish its current interim work and then unmuting.<br/>  Click to skip this and unmute.</>} onClick={handleSwitchMuteSTT}>
        <RiMicOffFill />
      </Button>
    )}

    {window.ApiServer.stt.serviceState.muted === SttMuteState.unmuted && (
      <Button className="btn-ghost" tooltip={t('main.btn_mute_stt')} onClick={handleSwitchMuteSTT}>
        <RiMicFill />
      </Button>  
    )}
    {(sttButton || ttsButton) && <Divider />}
    {sttButton && <ButtonService status={sttStatus} tooltip={t('stt.title')} onClick={handleSwitchSTT} ><RiUserVoiceFill /></ButtonService>}
    {ttsButton && <ButtonService status={ttsStatus} tooltip={t('tts.title')} onClick={handleSwitchTTS} ><RiChatVoiceFill /></ButtonService>}
    {translationButton && <ButtonService status={translationStatus} tooltip={t('transl.title')} onClick={handleSwitchTranslation} ><RiTranslate2 /></ButtonService>}
  </div>
}

const WindowActions: FC = () => {
  const {t} = useTranslation();
  const handleMinimize = () => window.Config.isApp() && appWindow.minimize();
  const handleMaximize = async () => {
    const state = await appWindow.isMaximized();
    state ? appWindow.unmaximize() : appWindow.maximize();
  };

  const [alwaysOnTop, setAlwaysOnTop] = useState(false);

  const handlePin = async () => {
    await appWindow.setAlwaysOnTop(!alwaysOnTop)
    setAlwaysOnTop(!alwaysOnTop);
  }

  const handleClose = () => {

    invoke("app_close")
    .catch(() => exit()); // try to close anyway
  }

  return <div className="flex z-0 pointer-events-auto items-center space-x-2">
    <Button tooltip={alwaysOnTop ? t('main.btn_unpin_window') : t('main.btn_pin_window')} onClick={handlePin}>{alwaysOnTop ? <RiPushpin2Fill /> : <RiPushpinFill />}</Button>
    <button className="btn btn-ghost btn-sm btn-square" onClick={handleMinimize}><VscChromeMinimize /></button>
    <button className="btn btn-ghost btn-sm btn-square" onClick={handleMaximize}><VscChromeMaximize /></button>
    <button className="btn btn-ghost btn-sm btn-square" onClick={handleClose}><VscChromeClose /></button>
  </div>
}

export default ActionBar;
