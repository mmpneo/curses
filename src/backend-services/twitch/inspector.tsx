import { FC } from "react";
import { RiTwitchFill } from "react-icons/ri";
import { useSnapshot } from "valtio";
import Input from "../../components/input";
import Inspector from "../../components/inspector";
import { ServiceNetworkState } from "../stt/types";
import { Twitch_State } from "./schema";

const Status: FC = () => {
  return <div>

  </div>
}

const Inspector_Twitch: FC = () => {
  const { user } = useSnapshot(window.API.twitch.state);
  const pr = useSnapshot(window.API.state.services.twitch.data);

  const up = <K extends keyof Twitch_State>(key: K, v: Twitch_State[K]) => window.API.patchService("twitch", s => s.data[key] = v);

  const handleLogin = () => {
    window.API.twitch.login()
  }

  const handleLogout = () => {
    window.API.twitch.logout()
  }

  const chatState = useSnapshot(window.API.twitch.chatState);
  return <Inspector.Body>
    <Inspector.Header><RiTwitchFill /> Twitch integration</Inspector.Header>
    <Inspector.Content>

      {user && <div className="flex items-center space-x-4">
        <img className="rounded-full aspect-square w-10 ring-2 ring-primary ring-offset-base-100 ring-offset-2" src={user.avatar} />
        <div className="flex flex-col">
          <div className="font-semibold">{user.name}</div>
          <div className="text-sm link link-warning link-hover font-medium" onClick={handleLogout}>Logout</div>
        </div>
      </div>}

      {!user && <button className="btn btn-primary" onClick={handleLogin}>Login</button>}


      <Inspector.SubHeader>Chat</Inspector.SubHeader>
      <Input.NetworkStatus label="Chat connection" value={chatState.status} />
      <Input.Checkbox label="Enabled" value={pr.chatPostEnable} onChange={e => up("chatPostEnable", e)} />
      <Inspector.Description>Post speech-to-text or translation results in chat</Inspector.Description>
      <Input.Checkbox label="Only when live" value={pr.chatPostLive} onChange={e => up("chatPostLive", e)} />
      <Input.TextSource label="Source" value={pr.chatPostSource} onChange={e => up("chatPostSource", e)} />
      <Input.Text label="Source mask" value={pr.chatPostMask} onChange={e => up("chatPostMask", e.target.value)} />

      <Input.Checkbox label="Input field" value={pr.chatPostInput} onChange={e => up("chatPostInput", e)} />
      {/* <Input.Text label="Input field mask" value={pr.chatPostInputMask} onChange={e => up("chatPostInputMask", e.target.value)} /> */}

      <Inspector.SubHeader>Post from chat</Inspector.SubHeader>
      <Inspector.Description>Use your chat messages as text source</Inspector.Description>
      <Input.Checkbox label="Enabled" value={pr.chatReceiveEnable} onChange={e => up("chatReceiveEnable", e)} />
      <Input.Text label="Mask" value={pr.chatReceiveMask} onChange={e => up("chatReceiveMask", e.target.value)} />
      <Inspector.SubHeader>Emotes</Inspector.SubHeader>
    </Inspector.Content>
  </Inspector.Body>
}

export default Inspector_Twitch;
