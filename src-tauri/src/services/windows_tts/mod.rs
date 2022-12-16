use std::collections::HashMap;

use serde::{Deserialize, Serialize};
use tauri::{
    command,
    plugin::{Builder, TauriPlugin},
    Manager, Runtime, State,
};
use windows::{
    core::BSTR,
    Win32::{
        Media::Speech::{ISpeechObjectToken, ISpeechObjectTokens, ISpeechVoice, SVSFDefault, SVSFlagsAsync, SpVoice, SpeechVoiceSpeakFlags},
        System::Com::{CoCreateInstance, CoInitialize, CLSCTX_ALL},
    },
};

use self::intf::Intf;
mod intf;

#[derive(Default)]
pub struct WindowsTTSPlugin {
    intf: Option<Intf<ISpeechVoice>>,
}

#[derive(Serialize, Deserialize, Debug)]
struct SpeechObject {
    pub id: String,
    pub label: String,
}

enum SpeechToken {
    Device(String),
    Voice(String)
}
impl SpeechToken {
    fn get(&self) -> &String {
        match self {
            SpeechToken::Device(v) => v,
            SpeechToken::Voice(v) => v,
        }
    }
}

impl WindowsTTSPlugin {
    fn new() -> Self {
        let Ok(()) = (unsafe { CoInitialize(None) }) else {
            return Self::default();
        };
        let Ok(instance): Result<ISpeechVoice, windows::core::Error> = (unsafe { CoCreateInstance(&SpVoice, None, CLSCTX_ALL) }) else {
            return Self::default();
        };

        Self { intf: Some(Intf(instance)) }
    }

    fn internal_apply_token(&self, token_type: SpeechToken, token: &ISpeechObjectToken) -> Option<()> {
        unsafe {self.intf.as_ref().and_then(|sp| {
            match token_type {
                SpeechToken::Device(_) => sp.putref_AudioOutput(token),
                SpeechToken::Voice(_) => sp.putref_Voice(token),
            }
        }.ok())}
    }

    fn try_apply_token(&self, token: SpeechToken) -> Result<(), &str> {
        let Some(tokens) = (match token {
            SpeechToken::Device(_) => self.device_tokens(),
            SpeechToken::Voice(_) => self.voice_tokens(),
        }) else {
            return Err("Invalid token format");
        };
        let Some(cur_token) = tokens.get(token.get()) else {
            return Err("Invalid token");
        };
        let Some(cur_id) = (unsafe {cur_token.Id()}.ok()) else {
            return Err("Cannot retrieve token id");
        };

        let def_id = self.intf.as_ref()
            .and_then(|sp| unsafe {
                match token {
                    SpeechToken::Device(_) => sp.AudioOutput(),
                    SpeechToken::Voice(_) => sp.Voice(),
                }
            }.ok())
            .and_then(|v| unsafe {v.Id()}.ok());

        if let Some(def_id) = def_id {
            if !cur_id.eq(&def_id) {
                let Some(()) = self.internal_apply_token(token, cur_token) else {
                    return Err("Error applying token");
                };
            }
        } 
        else {
            let Some(()) = self.internal_apply_token(token, cur_token) else {
                return Err("Error applying token");
            };
        };
        Ok(())
    }

    fn voice_tokens(&self) -> Option<HashMap<String, ISpeechObjectToken>> {
        self.intf
            .as_ref()
            .and_then(|sp| unsafe { sp.GetVoices(&BSTR::new(), &BSTR::new()) }.ok())
            .and_then(get_id_token_map)
    }
    fn device_tokens(&self) -> Option<HashMap<String, ISpeechObjectToken>> {
        self.intf
            .as_ref()
            .and_then(|sp| unsafe { sp.GetAudioOutputs(&BSTR::new(), &BSTR::new()) }.ok())
            .and_then(get_id_token_map)
    }
    fn voices(&self) -> Option<HashMap<String, SpeechObject>> {
        self.intf
            .as_ref()
            .and_then(|sp| unsafe { sp.GetVoices(&BSTR::new(), &BSTR::new()) }.ok())
            .and_then(get_object_map)
    }
    fn devices(&self) -> Option<HashMap<String, SpeechObject>> {
        self.intf
            .as_ref()
            .and_then(|sp| unsafe { sp.GetAudioOutputs(&BSTR::new(), &BSTR::new()) }.ok())
            .and_then(get_object_map)
    }
}

#[derive(Serialize, Deserialize, Debug)]
pub struct RpcWindowsTTSSpeak {
    device: String,
    voice: String,
    value: String,
}

fn get_id_token_map(tokens: ISpeechObjectTokens) -> Option<HashMap<String, ISpeechObjectToken>> {
    let i_m = unsafe { tokens.Count() }.unwrap();
    Some(
        (0..i_m)
            .into_iter()
            .map(|i| {
                unsafe { tokens.Item(i) }
                    .ok()
                    .and_then(|t| unsafe { t.Id() }.ok().map(|id| (t, id)))
                    .and_then(|(t, id)| Some((id.to_string(), t)))
            })
            .flatten()
            .collect(),
    )
}

fn get_object_map(tokens: ISpeechObjectTokens) -> Option<HashMap<String, SpeechObject>> {
    get_id_token_map(tokens).and_then(|m| {
        Some(
            m.iter()
                .map(|(id, token)| {
                    Some(token)
                        .and_then(|t| unsafe { t.GetDescription(0) }.ok())
                        .and_then(|label| {Some((id.clone(), SpeechObject {id: id.clone(),label: label.to_string()},))})
                })
                .flatten()
                .collect(),
        )
    })
}

#[derive(Serialize, Deserialize, Debug)]
pub struct RpcWindowsTTSConfig {
    devices: Vec<SpeechObject>,
    voices: Vec<SpeechObject>,
}

#[command]
fn get_voices(state: State<WindowsTTSPlugin>) -> Result<RpcWindowsTTSConfig, &str> {
    if state.intf.is_none() {
        return Err("Plugin is not initialized");
    };
    let Some(voices_map) = state.voices() else {
        return Err("Plugin is not initialized");
    };
    let Some(devices_map) = state.devices() else {
        return Err("Plugin is not initialized");
    };

    let voices: Vec<SpeechObject> = voices_map.into_values().collect();
    let devices: Vec<SpeechObject> = devices_map.into_values().collect();

    Ok(RpcWindowsTTSConfig { voices, devices })
}

#[command]
fn speak(data: RpcWindowsTTSSpeak, state: State<WindowsTTSPlugin>) -> Result<(), &str> {
    let Some(sp) = &state.intf else {
        return Err("Plugin is not initialized");
    };

    match state.try_apply_token(SpeechToken::Voice(data.voice)) {
        Ok(_) => (),
        Err(err) => println!("{}",err),
    }
    match state.try_apply_token(SpeechToken::Device(data.device)) {
        Ok(_) => (),
        Err(err) => println!("{}",err),
    }

    unsafe {
        sp.Speak(&data.value.into(), SpeechVoiceSpeakFlags(SVSFDefault.0 | SVSFlagsAsync.0))
            .unwrap();
    }
    Ok(())
}

pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("windows_tts")
        .invoke_handler(tauri::generate_handler![speak, get_voices])
        .setup(|app| {
            app.manage(WindowsTTSPlugin::new());
            Ok(())
        })
        .build()
}
