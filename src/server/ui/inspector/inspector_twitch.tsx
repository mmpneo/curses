import { FC, useState }         from "react";
import { BsEmojiHeartEyesFill } from "react-icons/bs";
import { MdChat }               from "react-icons/md";
import { RiTwitchFill }         from "react-icons/ri";
import { useSnapshot }          from "valtio";
import Tooltip                  from "../dropdown/Tooltip";
import Input                    from "./components/input";
import Inspector                from "./components";
import { Twitch_State }         from "@/server/services/twitch/schema";
import {useInspectorTabs}       from "@/server/ui/inspector/components/tabs";

const ChatInspector: FC = () => {
  const pr = useSnapshot(window.ApiServer.state.services.twitch.data);
  const up = <K extends keyof Twitch_State>(key: K, v: Twitch_State[K]) => window.ApiServer.patchService("twitch", s => s.data[key] = v);
  const chatState = useSnapshot(window.ApiServer.twitch.chatState);

  return <>
    <Inspector.SubHeader>Chat</Inspector.SubHeader>
    <Input.Checkbox label="Enable" value={pr.chatEnable} onChange={e => up("chatEnable", e)} />
    <Input.NetworkStatus label="Connection" value={chatState.status} />
    <Input.Checkbox label="Post in chat" value={pr.chatPostEnable} onChange={e => up("chatPostEnable", e)} />
    <Inspector.Description>Post speech to text or translation results in chat</Inspector.Description>
    <Inspector.Switchable visible={pr.chatPostEnable}>
      <Input.Checkbox label="Post only when live" value={pr.chatPostLive} onChange={e => up("chatPostLive", e)} />
      <Input.TextSource label="Post from" value={pr.chatPostSource} onChange={e => up("chatPostSource", e)} />
      <Input.Checkbox label="Post from text field" value={pr.chatPostInput} onChange={e => up("chatPostInput", e)} />
    </Inspector.Switchable>
    <Input.Checkbox label="Post from chat" value={pr.chatReceiveEnable} onChange={e => up("chatReceiveEnable", e)} />
    <Inspector.Description>Chat as a text field</Inspector.Description>
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

const Inspector_Twitch: FC = () => {
  const { user } = useSnapshot(window.ApiServer.twitch.state);

  const handleLogin = () => window.ApiServer.twitch.login();
  const handleLogout = () => window.ApiServer.twitch.logout();

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

      <Inspector.Switchable visible={!!user}>
        <Inspector.Tabs>
          <Inspector.Tab tooltip="Chat" tooltipBody="Chat options" onClick={() => handleTab(0)} active={tab === 0}><MdChat /></Inspector.Tab>
          <Inspector.Tab tooltip="Emotes" tooltipBody="Available emotes" onClick={() => handleTab(1)} active={tab === 1}><BsEmojiHeartEyesFill /></Inspector.Tab>
        </Inspector.Tabs>
        <Inspector.TabsContent direction={direction} tabKey={tab}>
          {tab === 0 && <ChatInspector />}
          {tab === 1 && <EmotesInspector />}
        </Inspector.TabsContent>
      </Inspector.Switchable>

    </Inspector.Content>
  </Inspector.Body>
}

export default Inspector_Twitch;
