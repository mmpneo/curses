import { ServiceNetworkState } from "@/types";
import { AnimatePresence, motion } from "framer-motion";
import { FC, PropsWithChildren } from "react";
import { SiDiscord, SiTwitch } from "react-icons/si";
import { useSnapshot } from "valtio";
import Tooltip from "./dropdown/Tooltip";

const StatusButton: FC<PropsWithChildren<{key: string, tooltip: string, onClick: () => void}>> = ({key, tooltip, onClick, children}) => {
  return <motion.div
  key={key}
  initial={{ opacity: 0, scale:0 }}
  exit={{ opacity: 0, scale: 0 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ ease: "anticipate", duration: 0.5 }}
>
  <Tooltip content={tooltip} body="Click to stop">
    <button onClick={onClick} className="btn btn-sm btn-warning btn-circle">
      {children}
    </button>
  </Tooltip>
</motion.div>
}

const RecordingAlerts: FC = () => {
  const { postEnable: discordPostEnable } = useSnapshot(
    window.ApiServer.state.services.discord.data
  );
  const { chatPostEnable, chatEnable, chatPostLive } = useSnapshot(
    window.ApiServer.state.services.twitch.data
  );
  const { chatStatus: twitchChatStatus, liveStatus: twitchLiveStatus } =
    useSnapshot(window.ApiServer.twitch.state);

  const handleStopTwitch = () => {
    window.ApiServer.patchService("twitch", state => state.data.chatPostEnable = false)
  };
  const handleStopDiscord = () => {
    window.ApiServer.patchService("discord", state => state.data.postEnable = false)};

  const showTwitch =
    chatEnable &&
    chatPostEnable &&
    twitchChatStatus === ServiceNetworkState.connected &&
    (chatPostLive ? twitchLiveStatus === ServiceNetworkState.connected : true);
  return (
    <div className="flex space-x-2">
      <AnimatePresence>
        {showTwitch && <StatusButton tooltip="Twitch Chat integration" key="twitch" onClick={handleStopTwitch }><SiTwitch size={20} /></StatusButton>}
        {discordPostEnable && <StatusButton tooltip="Discord integration" key="discord" onClick={handleStopDiscord }><SiDiscord size={20} /></StatusButton>}
      </AnimatePresence>
    </div>
  );
};

export default RecordingAlerts;
