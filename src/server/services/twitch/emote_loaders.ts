
//region BTTV
export async function Load_BTTV_GLOBAL() {
  const emotes: Record<string, string>                     = {};
  try {
    const bttv_global                          = await fetch('https://api.betterttv.net/3/cached/emotes/global');
    const json_bttv_global: any = await bttv_global.json();
    for (let i = 0; i < json_bttv_global.length; i++)
      emotes[json_bttv_global[i].code] = `https://cdn.betterttv.net/emote/${json_bttv_global[i].id}/1x`
  } catch (error) {}
  return emotes;
}

export async function Load_BTTV_CHANNEL(id: string) {
  const emotes: Record<string, string>                       = {};
  try {
    const bttv_channel                           = await fetch(`https://api.betterttv.net/3/cached/users/twitch/${id}`);
    const json_bttv_channel: any = await bttv_channel.json();
    for (let i = 0; i < json_bttv_channel.channelEmotes.length; i++)
      emotes[json_bttv_channel.channelEmotes[i].code] = `https://cdn.betterttv.net/emote/${json_bttv_channel.channelEmotes[i].id}/1x`
    for (let i = 0; i < json_bttv_channel.sharedEmotes.length; i++)
      emotes[json_bttv_channel.sharedEmotes[i].code] = `https://cdn.betterttv.net/emote/${json_bttv_channel.sharedEmotes[i].id}/1x`
  } catch (error) {}
  return emotes;
}
//endregion

//region FFZ
function ParseFFz(data: any) {
  const emotes: Record<string, string> = {};
  try {
    Object.keys(data.sets).forEach(set_key => {
      for (let i = 0; i < data.sets[set_key].emoticons.length; i++) {
        const emoticon        = data.sets[set_key].emoticons[i];
        emotes[emoticon.name] = emoticon.urls["1"]
      }
    });
  } catch (error) {}
  return emotes;
}
export async function Load_FFZ_GLOBAL() {
  const ffz_global                         = await fetch('https://api.frankerfacez.com/v1/set/global');
  const json_ffz_global: any = await ffz_global.json();
  return ParseFFz(json_ffz_global);
}

export async function Load_FFZ_CHANNEL(id: string) {
  const ffz_channel                          = await fetch(`https://api.frankerfacez.com/v1/room/id/${id}`);
  const json_ffz_channel: any = await ffz_channel.json();
  return ParseFFz(json_ffz_channel);
}
//endregion

//region 7tv
export async function Load_7TV_CHANNEL(id: string) {
  
  try {

    const resp                          = await fetch(`https://7tv.io/v3/users/twitch/${id}`);
    const r = await resp.json();
    const emoteSet = r.emote_set;
    return Object.fromEntries(emoteSet.emotes.map((emote: any) =>
      [emote.name, `${emote.data.host.url}/${emote.data.host.files[1].name}`]
    ))
  } catch (error) {
    return {}
  }
}
export async function Load_7TV_GLOBAL() {
  try {
    const resp                          = await fetch(`https://7tv.io/v3/emote-sets/global`);
    const r = await resp.json();
    return Object.fromEntries(r.emotes.map((emote: any) =>
      [emote.name, `${emote.data.host.url}/${emote.data.host.files[1].name}`]
    ));
  } catch (error) {
    return {}
  }
}
//endregion