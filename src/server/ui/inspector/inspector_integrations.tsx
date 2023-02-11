import { Twitch_State } from "@/server/services/twitch/schema";
import { useInspectorTabs } from "@/server/ui/inspector/components/tabs";
import { FC } from "react";
import { MdExtension } from "react-icons/md";
import { SiDiscord, SiTwitch } from "react-icons/si";
import { useSnapshot } from "valtio";
import Tooltip from "../dropdown/Tooltip";
import Inspector from "./components";
import Input from "./components/input";

const TwitchInspector: FC = () => {
  const {user, chatStatus, liveStatus} = useSnapshot(window.ApiServer.twitch.state);
  const handleLogin = () => window.ApiServer.twitch.login();
  const handleLogout = () => window.ApiServer.twitch.logout();
  const pr = useSnapshot(window.ApiServer.state.services.twitch.data);
  const up = <K extends keyof Twitch_State>(key: K, v: Twitch_State[K]) => window.ApiServer.patchService("twitch", s => s.data[key] = v);

  return <>
    <Inspector.SubHeader><div className="flex gap-2 items-center"><SiTwitch/> Twitch</div></Inspector.SubHeader>
    {user && <div className="flex items-center space-x-4">
      <img className="rounded-full aspect-square w-10 ring-2 ring-success ring-offset-base-100 ring-offset-2" src={user.avatar} />
      <div className="flex flex-col">
        <div className="font-semibold">{user.name}</div>
        <div className="text-xs link link-warning link-hover font-medium" onClick={handleLogout}>Logout</div>
      </div>
    </div>}

    {!user && <button className="btn gap-2 border-none" style={{backgroundColor: "#9147ff", color: "#fff"}} onClick={handleLogin}><SiTwitch size={20}/> Login</button>}
    <Inspector.Switchable visible={!!user}>
      <Input.NetworkStatus label="Live" value={liveStatus} />
      <Input.NetworkStatus label="Chat Connection" value={chatStatus} />
      <Input.Checkbox label="Enable chat" value={pr.chatEnable} onChange={e => up("chatEnable", e)} />
      <Inspector.Switchable visible={pr.chatEnable}>
        <Input.Checkbox label="Post in chat" value={pr.chatPostEnable} onChange={e => up("chatPostEnable", e)} />
        <Inspector.Description>Post speech to text or translation results in chat</Inspector.Description>
        <Input.Checkbox label="Post only when live" value={pr.chatPostLive} onChange={e => up("chatPostLive", e)} />
        <Input.TextSource label="Post from" value={pr.chatPostSource} onChange={e => up("chatPostSource", e)} />
        <Input.Checkbox label="Post from text field" value={pr.chatPostInput} onChange={e => up("chatPostInput", e)} />
        <Input.Checkbox label="Post from chat" value={pr.chatReceiveEnable} onChange={e => up("chatReceiveEnable", e)} />
        <Inspector.Description>Chat as a text field</Inspector.Description>
      </Inspector.Switchable>
    </Inspector.Switchable>
  </>
}

const DiscordInspector: FC = () => {
  const pr = useSnapshot(window.ApiServer.state.services.twitch.data);
  const up = <K extends keyof Twitch_State>(key: K, v: Twitch_State[K]) => window.ApiServer.patchService("twitch", s => s.data[key] = v);

  return <>
    <Inspector.SubHeader><div className="flex gap-2 items-center"><SiDiscord/> Discord</div></Inspector.SubHeader>
    <Inspector.Description>Post STT results to discord channel</Inspector.Description>
    {/* <Input.Checkbox label="Enable" value={pr.chatEnable} onChange={e => up("chatEnable", e)} />
    <Input.Text label="Channel hook" value={pr.chatPostSource} onChange={e => up("chatPostSource", e.target.value)} /> */}
  </>
}

const EmotesInspector: FC = () => {
  return <>
    <Inspector.SubHeader>Emotes ({Object.keys(window.ApiServer.twitch.emotes).length})</Inspector.SubHeader>
    <div className="grid grid-cols-8 gap-1">
      {Object.keys(window.ApiServer.twitch.emotes).map((k, i) =>
        <Tooltip key={k} className="relative aspect-square" placement="top" content={k}>
          <img className="w-full h-full aspect-square object-contain" src={window.ApiServer.twitch.emotes[k]} />
        </Tooltip>
      )
      }
    </div>
  </>
}

const Inspector_Integrations: FC = () => {
  const [[tab, direction], handleTab] = useInspectorTabs();

  return <Inspector.Body>
    <Inspector.Header><MdExtension /> Integrations</Inspector.Header>
    <Inspector.Content>

      <TwitchInspector />
        {/* <Inspector.Tabs>
          <Inspector.Tab tooltip="Chat" tooltipBody="Chat options" onClick={() => handleTab(0)} active={tab === 0}><MdChat /></Inspector.Tab>
          <Inspector.Tab tooltip="Emotes" tooltipBody="Available emotes" onClick={() => handleTab(1)} active={tab === 1}><BsEmojiHeartEyesFill /></Inspector.Tab>
        </Inspector.Tabs> */}
        {/* <Inspector.TabsContent direction={direction} tabKey={tab}>
          {tab === 0 && <>
            </>}
            {tab === 1 && <EmotesInspector />}
          </Inspector.TabsContent> */}
      <DiscordInspector />

    </Inspector.Content>
  </Inspector.Body>
}

export default Inspector_Integrations;
