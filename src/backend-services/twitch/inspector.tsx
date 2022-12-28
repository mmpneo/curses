import { FC, useState } from "react";
import { BsEmojiHeartEyesFill } from "react-icons/bs";
import { MdChat } from "react-icons/md";
import { RiTwitchFill } from "react-icons/ri";
import { useSnapshot } from "valtio";
import Tooltip from "../../components/dropdown/Tooltip";
import Input from "../../components/input";
import Inspector from "../../components/inspector";
import { Twitch_State } from "./schema";

export const useInspectorTabs = () => {
  const [[tab, direction], setTab] = useState<[number, number]>([0, 0]);
  const handleTab = (v: number) => {
    setTab([v, Math.sign(v - tab)]);
  }
  return [[tab, direction], handleTab] as [[number, number], (v: number) => void];
}

const ChatInspector: FC = () => {
  const pr = useSnapshot(window.API.state.services.twitch.data);
  const up = <K extends keyof Twitch_State>(key: K, v: Twitch_State[K]) => window.API.patchService("twitch", s => s.data[key] = v);
  const chatState = useSnapshot(window.API.twitch.chatState);

  return <>
    <Inspector.SubHeader>Chat options</Inspector.SubHeader>
    <Input.NetworkStatus label="Chat connection" value={chatState.status} />
    <Input.Checkbox label="Post in chat" value={pr.chatPostEnable} onChange={e => up("chatPostEnable", e)} />
    <Inspector.Description>Post speech to text or translation results in chat</Inspector.Description>
    <Inspector.Switchable visible={pr.chatPostEnable}>
      <Input.Checkbox label="Post only when live" value={pr.chatPostLive} onChange={e => up("chatPostLive", e)} />
      <Input.TextSource label="Post from" value={pr.chatPostSource} onChange={e => up("chatPostSource", e)} />
      <Input.Checkbox label="Post from input field" value={pr.chatPostInput} onChange={e => up("chatPostInput", e)} />
    </Inspector.Switchable>
    <Input.Checkbox label="Post from chat" value={pr.chatReceiveEnable} onChange={e => up("chatReceiveEnable", e)} />
    <Inspector.Description>Use your chat as an input field</Inspector.Description>
  </>
}

const EmotesInspector: FC = () => {
  return <>
    <Inspector.SubHeader>Emotes ({Object.keys(window.API.twitch.emotes).length})</Inspector.SubHeader>
    <div className="grid grid-cols-8 gap-1">
      {Object.keys(window.API.twitch.emotes).map((k, i) => 
      <Tooltip key={k} className="relative aspect-square" placement="top" content={k}>
        <img className="w-full h-full aspect-square object-contain" src={window.API.twitch.emotes[k]} />
      </Tooltip>
      )
      }
    </div>
  </>
}

const Inspector_Twitch: FC = () => {
  const { user } = useSnapshot(window.API.twitch.state);

  const handleLogin = () => window.API.twitch.login();
  const handleLogout = () => window.API.twitch.logout();

  const [[tab, direction], handleTab] = useInspectorTabs();

  return <Inspector.Body>
    <Inspector.Header><RiTwitchFill /> Twitch integration</Inspector.Header>
    <Inspector.Content>

      {user && <div className="flex items-center space-x-4">
        <img className="rounded-full aspect-square w-10 ring-2 ring-success ring-offset-base-100 ring-offset-2" src={user.avatar} />
        <div className="flex flex-col">
          <div className="font-semibold">{user.name}</div>
          <div className="text-xs link link-warning link-hover font-medium" onClick={handleLogout}>Logout</div>
        </div>
      </div>}

      {!user && <button className="btn btn-primary" onClick={handleLogin}>Login</button>}

      <Inspector.Tabs>
        <Inspector.Tab tooltip="Chat" tooltipBody="Chat options" onClick={() => handleTab(0)} active={tab === 0}><MdChat /></Inspector.Tab>
        <Inspector.Tab tooltip="Emotes" tooltipBody="Available emotes" onClick={() => handleTab(1)} active={tab === 1}><BsEmojiHeartEyesFill /></Inspector.Tab>
      </Inspector.Tabs>
      <Inspector.TabsContent direction={direction} tabKey={tab}>
        {tab === 0 && <ChatInspector />}
        {tab === 1 && <EmotesInspector />}
      </Inspector.TabsContent>
    </Inspector.Content>
  </Inspector.Body>
}

export default Inspector_Twitch;
