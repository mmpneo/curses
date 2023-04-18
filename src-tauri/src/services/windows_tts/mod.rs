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
    intf: Option<Intf<ISpeechVoice>>
}

#[derive(Serialize, Deserialize, Debug)]
struct SpeechObject {
    pub id: String,
    pub label: String,
}

#[derive(Debug)]
struct ISpeechToken {
    id: String,
    pub t: Intf<ISpeechObjectToken>,
}

impl ISpeechToken {
    fn get_desc(&self) -> Option<SpeechObject> {
        unsafe {
            self.t.0.Id().ok()
                .and_then(|id| {
                    self.t.0
                        .GetDescription(0).ok()
                        .map(|label| (id.to_string(), label.to_string()))
                })
                .map(|(id, label)| SpeechObject { id, label })
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

    fn list_devices(&self) -> Option<Vec<ISpeechToken>> {
        self.intf
            .as_ref()
            .and_then(|sp| unsafe { sp.GetAudioOutputs(&BSTR::new(), &BSTR::new()) }.ok())
            .and_then(into_speech_tokens)
    }
    fn list_voices(&self) -> Option<Vec<ISpeechToken>> {
        self.intf
            .as_ref()
            .and_then(|sp| unsafe { sp.GetVoices(&BSTR::new(), &BSTR::new()) }.ok())
            .and_then(into_speech_tokens)
    }
}

fn into_speech_tokens(tokens: ISpeechObjectTokens) -> Option<Vec<ISpeechToken>> {
    let i_m = unsafe { tokens.Count() }.unwrap();
    let ll = (0..i_m)
        .into_iter()
        .map(|i| {
            unsafe { tokens.Item(i) }
                .ok()
                .and_then(|token| unsafe { token.Id() }.ok().map(|id| (token, id)))
                .and_then(|(t, id)| {
                    Some(ISpeechToken {
                        id: id.to_string(),
                        t: Intf(t),
                    })
                })
        })
        .flatten()
        .collect();
    Some(ll)
}

#[derive(Serialize, Deserialize, Debug)]
pub struct RpcWindowsTTSConfig {
    devices: Vec<SpeechObject>,
    voices: Vec<SpeechObject>,
}

#[command]
fn get_voices(state: State<WindowsTTSPlugin>) -> Result<RpcWindowsTTSConfig, &str> {
    let Some(devices): Option<Vec<SpeechObject>> = state
        .list_devices()
        .map(|list| list.iter().map(|t| t.get_desc()).flatten().collect()) else {
        return Err("Failed to get device list");
    };
    let Some(voices): Option<Vec<SpeechObject>> = state
        .list_voices()
        .map(|list| list.iter().map(|t| t.get_desc()).flatten().collect()) else {
        return Err("Failed to get voice list");
    };

    Ok(RpcWindowsTTSConfig { voices, devices })
}

#[derive(Serialize, Deserialize, Debug)]
pub struct RpcWindowsTTSSpeak {
    device: String,
    voice: String,
    value: String,
    volume: f32, // 0 - 1
    rate: f32 // 0 - 1 - 5
}

#[command]
fn speak(data: RpcWindowsTTSSpeak, state: State<WindowsTTSPlugin>) -> Result<(), &str> {
    if data.value == "" {
        return Ok(());
    }
    let Some(sp_voice) = &state.intf else {
        return Err("Plugin is not initialized");
    };
    
    if unsafe {sp_voice.0.SetVolume((data.volume * 100.0) as i32)}.is_err() {
        return Err("Unable to update volume");
    }

    // convert multiply based [0 - 1 - 5] to range [-10 - 10]
    let rate = if data.rate >= 1.0 {
        ((data.rate - 1.0) / 4.0 * 10.0) as i32
    } else {
        (-data.rate * 100.0) as i32
    };
    if unsafe {sp_voice.0.SetRate(rate)}.is_err() {
        return Err("Unable to update rate");
    }

    let Some(_apply_res_device) = state
        .list_devices()
        .as_deref()
        .and_then(|list| list.iter().find(|t| t.id == data.device))
        .and_then(|token| unsafe { sp_voice.0.putref_AudioOutput(&token.t.0).ok() })
        else {
        return Err("Failed to apply device");
    };
    let Some(_apply_res_voice) = state
        .list_voices()
        .as_deref()
        .and_then(|list| list.iter().find(|t| t.id == data.voice))
        .and_then(|token| unsafe { sp_voice.0.putref_Voice(&token.t.0).ok() }) else {
        return Err("Failed to apply voice");
    };

    if let Err(_err) = unsafe {sp_voice.Speak(&data.value.into(), SpeechVoiceSpeakFlags(SVSFDefault.0 | SVSFlagsAsync.0))} {
        Err("Unable to process text")
    }
    else {
        Ok(())
    }
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
