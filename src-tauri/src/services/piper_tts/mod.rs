use serde::{Deserialize, Serialize};
use std::{io, path::PathBuf};
use tauri::{plugin, Runtime};

use crate::utils::*;

#[derive(Serialize, Deserialize, Debug)]
struct Voice {
    /// human-readable name to display to the user
    name: String,

    /// full path to the .onnx file
    path: PathBuf,
}

/// arguments to the `speak` function. most of these get passed straight to piper.exe
#[derive(Serialize, Deserialize, Debug)]
struct SpeakArgs {
    /// audio output device
    device: String,

    /// path to piper.exe
    exe_path: PathBuf,

    /// path to the voice model
    voice_path: PathBuf,

    /// id of speaker when using multi-speaker models
    speaker_id: Option<u32>,

    /// generator noise
    noise_scale: Option<f32>,

    /// phoneme width noise
    noise_width: Option<f32>,

    /// phoneme length
    length_scale: Option<f32>,

    /// seconds of silence after each sentence
    sentence_silence: Option<f32>,

    /// the actual text to speak
    value: String,
}

/// Scans the given directory for Piper voice files.
/// A valid piper voice file must end in `.onnx` and have an accompanying `.onnx.json`
fn scan_voice_directory(path: PathBuf) -> io::Result<Vec<Voice>> {
    fn try_into_voice(entry: std::fs::DirEntry) -> Option<Voice> {
        let path = entry.path();
        if path.is_file() && path.extension() == Some("onnx".as_ref()) && path.with_extension("onnx.json").exists() {
            // we only need the name for display purposes, so the lossy conversion here is fine.
            let name = path.file_stem()?.to_string_lossy().into();
            Some(Voice { name, path })
        } else {
            None
        }
    }

    Ok(std::fs::read_dir(path)?
        .filter_map(Result::ok)
        .filter_map(try_into_voice)
        .collect())
}

/// Writes a byte slice to the standard input of a child process
async fn write_to_stdin(process: &mut tokio::process::Child, bytes: &[u8]) -> io::Result<()> {
    use tokio::io::AsyncWriteExt;
    let stdin = process.stdin.as_mut().expect("Failed to open stdin");
    let result = stdin.write_all(bytes).await;
    result.with_context(|| "Could not write to piper's standard input")
}

/// Handles adding optional command line parameters to a Command object
fn add_arg_if_some(command: &mut tokio::process::Command, name: &str, value: Option<impl ToString>) {
    if let Some(value) = value {
        command.arg(name);
        command.arg(value.to_string());
    }
}

/// Tries to create a new temporary WAV file; Gives an error with some context if that fails.
fn create_temp_file() -> io::Result<tempfile::NamedTempFile> {
    let dir = tempfile::env::temp_dir();
    tempfile::Builder::new()
        .suffix(".wav")
        .tempfile_in(&dir)
        .with_context(|| format!("Failed to create temporary file in {}", dir.display()))
}

/// Invokes piper to generate a WAV file and returns it as a byte vector
async fn get_wav_bytes(args: &SpeakArgs) -> io::Result<Vec<u8>> {
    // at first i tried to read the wav data from stdout, but that didn't work,
    // so now i just use a regular file here.
    let wav_file = create_temp_file()?;
    let wav_file_path = wav_file.path();
    let model_path = &args.voice_path;
    let piper_path = &args.exe_path;

    let mut command = tokio::process::Command::new(piper_path);
    command.stdin(std::process::Stdio::piped());
    command.stdout(std::process::Stdio::null());
    command.stderr(std::process::Stdio::null());
    command.arg("-q"); // quiet
    command.arg("-m");
    command.arg(model_path);
    command.arg("-f");
    command.arg(wav_file_path);

    add_arg_if_some(&mut command, "--speaker", args.speaker_id);
    add_arg_if_some(&mut command, "--noise_scale", args.noise_scale);
    add_arg_if_some(&mut command, "--noise_w", args.noise_width);
    add_arg_if_some(&mut command, "--length_scale", args.length_scale);
    add_arg_if_some(&mut command, "--sentence_silence", args.sentence_silence);

    #[cfg(windows)]
    {
        // console applications on windows have the annoying habbit of spawning a terminal window.
        // we need to explicitly tell CreateProcess not to do that.
        command.creation_flags(0x08000000); // CREATE_NO_WINDOW
    }

    let mut process = command
        .spawn()
        .with_context(|| format!("Failed to start {}", piper_path.display()))?;

    write_to_stdin(&mut process, &args.value.as_bytes()).await?;

    let status = process.wait().await?;

    if status.success() {
        tokio::fs::read(wav_file_path)
            .await
            .with_context(|| format!("Failed to read temporary file at {}", wav_file_path.display()))
    } else {
        let error = match status.code() {
            Some(code) => format!("Piper exited with status code: {code}"),
            None => "Piper terminated by signal".into(),
        };
        Err(io::Error::other(error))
    }
}

#[tauri::command]
fn get_voices(path: PathBuf) -> Result<Vec<Voice>, String> {
    match scan_voice_directory(path) {
        Ok(vec) if vec.is_empty() => Err("No voices found. Voice files must come in pairs named '<file>.onnx' and '<file>.onnx.json'".into()),
        Ok(vec) => Ok(vec),
        Err(e) => Err(e.to_string()),
    }
}

#[tauri::command]
async fn speak(args: SpeakArgs) -> Result<(), String> {
    use crate::services::audio::{play_async, RpcAudioPlayAsync};

    // fast path for empty string
    if args.value.is_empty() {
        return Ok(());
    }

    let bytes = get_wav_bytes(&args).await.map_err(|e| e.to_string())?;

    let play_async_args = RpcAudioPlayAsync {
        device_name: args.device,
        data: bytes,
        volume: 1.0,
        rate: 1.0,
    };

    play_async(play_async_args).await
}

pub fn init<R: Runtime>() -> plugin::TauriPlugin<R> {
    plugin::Builder::new("piper_tts")
        .invoke_handler(tauri::generate_handler![speak, get_voices])
        .build()
}
