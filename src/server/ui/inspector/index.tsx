import {AnimatePresence}                                                          from "framer-motion";
import {FC}                                                                       from "react";
import {ErrorBoundary}                                                            from "react-error-boundary";
import {toast}                                                                    from "react-toastify";
import SimpleBar                                                                  from "simplebar-react";
import {Services}                                                                 from "@/server";
import Inspector_STT                                                              from "./inspector_stt";
import Inspector_Translation                                                      from "./inspector_translation";
import Inspector_TTS                                                              from "./inspector_tts";
import Inspector_VRC                                                              from "./inspector_vrc";
import Inspector_ElementImage                                                     from "./inspector_image";
import Inspector_ElementText                                                      from "./inspector_text";
import Inspector_Files                                                            from "./inspector_files";
import {ElementType}                                                              from "@/client/elements/schema";
import {InspectorTabPath}                                                         from "@/types";
import Inspector_Scenes                                                           from "./inspector_scenes";
import Inspector_Settings                                                         from "./inspector_settings";
import Inspector_Twitch from "./inspector_twitch";
import Inspector_Discord from "./inspector_discord";
import Inspector_OBS from "./inspector_obs";

const Inspector: FC<{ path?: InspectorTabPath }> = ({ path }) => {
  const handleCopyError = (err: string) => {
    navigator.clipboard.writeText(err);
    toast.success("Copied!");
  }
  return <div style={{ width: '19rem' }} className="relative h-full flex-none bg-base-100 rounded-t-box flex flex-col overflow-hidden">
    <ErrorBoundary fallbackRender={({ error, resetErrorBoundary }) => (
      <div className="w-full h-full flex flex-col items-center justify-center p-4 space-y-2">
        <div className="flex flex-col items-center">
          <img className="w-16 grayscale" src="/images/ui-noo.gif" />
          <div className="text-primary font-semibold font-header inline-block">Inspector crashed!</div>
          <pre className="text-xs text-base-content/50 whitespace-pre-wrap text-center">
            Try to close and open it again.
            If this doesn't work, you can ask for help in the <a className="link text-secondary ink-primary link-hover" href="discord://-/channels/856500849815060500/1058343274991058945">Discord #help</a>
          </pre>
        </div>
        {error.stack && <pre style={{ fontSize: 9 }} className="relative w-full text-xs rounded-box bg-base-200 h-24">
          <SimpleBar className="w-full h-full">
            <pre className="px-2 truncate break-words whitespace-pre-wrap">{error.stack}</pre>
          </SimpleBar>
          <button className="absolute right-2 top-0 btn btn-link btn-xs self-start" onClick={() => error.stack && handleCopyError(error.stack)}>
            Copy
          </button>
        </pre>}
      </div>
    )}>
      <AnimatePresence initial={false}>
        {path?.tab === Services.stt && <Inspector_STT key="stt" />}
        {path?.tab === Services.tts && <Inspector_TTS key="tts" />}
        {path?.tab === Services.translation && <Inspector_Translation key="translation" />}
        {path?.tab === "obs" && <Inspector_OBS key="obs" />}
        {path?.tab === Services.vrc && <Inspector_VRC key="vrc" />}
        {path?.tab === Services.twitch && <Inspector_Twitch key="twitch" />}
        {path?.tab === Services.discord && <Inspector_Discord key="discord" />}
        {path?.tab === "settings" && <Inspector_Settings key="settings" />}
        {path?.tab === "scenes" && <Inspector_Scenes key="scenes" />}
        {path?.tab === "files" && <Inspector_Files key="files" />}
        {path?.tab === ElementType.text && path?.value && <Inspector_ElementText id={path.value} key={`${path.tab}-${path.value}`} />}
        {path?.tab === ElementType.image && path?.value && <Inspector_ElementImage id={path.value} key={`${path.tab}-${path.value}`} />}
      </AnimatePresence>
    </ErrorBoundary>
  </div>
}

export default Inspector;
