use futures::TryFutureExt;
use serde::{Deserialize, Serialize};
use tauri::{
    command,
    plugin::{Builder, TauriPlugin},
    Runtime
};

use crate::services::audio::{play_async, RpcAudioPlayAsync};

#[derive(Serialize, Deserialize, Debug)]
struct UberDuckAuth{
    api_key: String,
    secret_key: String
}

#[derive(Serialize, Deserialize, Debug)]
struct Voice{
    model_id: String,
    voicemodel_uuid: String,
    display_name: String
}


#[derive(Serialize, Deserialize, Debug)]
struct UberduckRequest {
    auth: UberDuckAuth,
    text: String,
    device_name: String,
    voicemodel_uuid: String,
    volume: f32
}

#[derive(Serialize, Deserialize, Debug)]
struct SynthRequest {
    speech: String,
    voicemodel_uuid: String,
}

#[command]
async fn get_voices(auth: UberDuckAuth) -> Result<Vec<Voice>, String> {
    let client = reqwest::Client::new();
    if let Ok(voices) = client.get("https://api.uberduck.ai/voices?mode=tts-all")
        .basic_auth(auth.api_key, Some(auth.secret_key))
        .send()
        .and_then(|f| f.json::<Vec<Voice>>()).await {
            Ok(voices)
    }
    else {
        Err("Unable to load voices".to_string())
    }
}

#[command]
async fn speak(data: UberduckRequest) -> Result<(), String> {
    let client = reqwest::Client::new();
    if let Ok(resp) = client
        .post("https://api.uberduck.ai/speak-synchronous")
        .basic_auth(data.auth.api_key, Some(data.auth.secret_key))
        .json(&SynthRequest {
            speech: data.text,
            voicemodel_uuid: data.voicemodel_uuid,
        })
        .send()
        .and_then(|f| f.bytes()).await {
            play_async(RpcAudioPlayAsync {
                device_name: data.device_name,
                data: resp.to_vec(),
                volume: data.volume,
                rate: 1.0,
            })
            .await
        }
    else {
        Err("Request failed".to_string())
    }
}

pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("uberduck_tts")
        .invoke_handler(tauri::generate_handler![speak, get_voices])
        .build()
}
