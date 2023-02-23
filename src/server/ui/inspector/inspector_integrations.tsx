import { Discord_State } from "@/server/services/discord/schema";
import { Twitch_State } from "@/server/services/twitch/schema";
import { FC } from "react";
import { MdExtension } from "react-icons/md";
import { SiDiscord, SiTwitch } from "react-icons/si";
import { useSnapshot } from "valtio";
import Tooltip from "../dropdown/Tooltip";
import Inspector from "./components";
import Input from "./components/input";

const TwitchInspector: FC = () => {
  const {user, liveStatus} = useSnapshot(window.ApiServer.twitch.state);
  const chatState = useSnapshot(window.ApiServer.twitch.chat.state);
  const handleLogin = () => window.ApiServer.twitch.login();
  const handleLogout = () => window.ApiServer.twitch.logout();
  const pr = useSnapshot(window.ApiServer.state.services.twitch.data);
  const up = <K extends keyof Twitch_State>(key: K, v: Twitch_State[K]) => window.ApiServer.patchService("twitch", s => s.data[key] = v);

  return <>
    <Inspector.SubHeader><div className="flex gap-2 items-center"><SiTwitch/> Twitch</div></Inspector.SubHeader>
    {user && <div className="flex items-center space-x-4">
      <img className="rounded-full aspect-square w-10 ring-2 ring-success ring-offset-base-100 ring-offset-2" src={user.profilePictureUrl} />
      <div className="flex flex-col">
        <div className="font-semibold">{user.name}</div>
        <div className="text-xs link link-warning link-hover font-medium" onClick={handleLogout}>Logout</div>
      </div>
    </div>}

    {!user && <button className="btn gap-2 border-none" style={{backgroundColor: "#9147ff", color: "#fff"}} onClick={handleLogin}><SiTwitch size={20}/> Login</button>}
    <Inspector.Switchable visible={!!user}>
      <Input.NetworkStatus label="Live" value={liveStatus} />
      <Input.NetworkStatus label="Chat Connection" value={chatState.connection} />
      <Input.Checkbox label="Enable chat" value={pr.chatEnable} onChange={e => up("chatEnable", e)} />
      <Inspector.Switchable visible={pr.chatEnable}>
        <Input.Checkbox label="Post in chat" value={pr.chatPostEnable} onChange={e => up("chatPostEnable", e)} />
        <Inspector.Description>Post speech to text or translation results in chat</Inspector.Description>
        <Input.Checkbox label="Post only when live streaming" value={pr.chatPostLive} onChange={e => up("chatPostLive", e)} />
        <Input.TextSource label="Post from" value={pr.chatPostSource} onChange={e => up("chatPostSource", e)} />
        <Input.Checkbox label="Post from text field" value={pr.chatPostInput} onChange={e => up("chatPostInput", e)} />
        <Input.Checkbox label="Post from chat" value={pr.chatReceiveEnable} onChange={e => up("chatReceiveEnable", e)} />
        <Inspector.Description>Chat as a text field</Inspector.Description>
      </Inspector.Switchable>
    </Inspector.Switchable>
  </>
}

const DiscordInspector: FC = () => {
  const pr = useSnapshot(window.ApiServer.state.services.discord.data);
  const up = <K extends keyof Discord_State>(key: K, v: Discord_State[K]) => window.ApiServer.patchService("discord", s => s.data[key] = v);

  return <>
    <Inspector.SubHeader><div className="flex gap-2 items-center"><SiDiscord/> Discord</div></Inspector.SubHeader>
    <Inspector.Description>Post STT results to discord channel</Inspector.Description>
    <Input.Checkbox label="Enable" value={pr.postEnable} onChange={e => up("postEnable", e)} />
    <Input.Checkbox label="Post only when live streaming" value={pr.postWithTwitchLive} onChange={e => up("postWithTwitchLive", e)} />
    <Input.Text type="password" label="Channel hook" value={pr.channelHook} onChange={e => up("channelHook", e.target.value)} />
    <Input.Text label="Bot name" placeholder="Curses" value={pr.channelBotName} onChange={e => up("channelBotName", e.target.value)} />
    <Input.Text label="Bot avatar" placeholder="Image url" value={pr.channelAvatarUrl} onChange={e => up("channelAvatarUrl", e.target.value)} />
    <Input.TextSource label="Post from" value={pr.postSource} onChange={e => up("postSource", e)} />
    <Input.Checkbox label="Post from text field" value={pr.postInput} onChange={e => up("postInput", e)} />
  </>
}

const EmotesInspector: FC = () => {
  return <>
    <Inspector.SubHeader>Emotes ({Object.keys(window.ApiServer.twitch.emotes.dictionary).length})</Inspector.SubHeader>
    <div className="grid grid-cols-8 gap-1">
      {Object.keys(window.ApiServer.twitch.emotes).map((k, i) =>
        <Tooltip key={k} className="relative aspect-square" placement="top" content={k}>
          <img className="w-full h-full aspect-square object-contain" src={window.ApiServer.twitch.emotes.dictionary[k]} />
        </Tooltip>
      )
      }
    </div>
  </>
}

const Inspector_Integrations: FC = () => {
  return <Inspector.Body>
    <Inspector.Header><MdExtension /> Integrations</Inspector.Header>
    <Inspector.Content>
      <TwitchInspector />
      <DiscordInspector />
    </Inspector.Content>
  </Inspector.Body>
}

export default Inspector_Integrations;
