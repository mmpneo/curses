use std::io;
use std::path::Path;
use std::path::PathBuf;

use serde::{Deserialize, Serialize};
use tauri::{plugin, Runtime};

use tokio::process::Command;

use crate::utils::*;

/// arguments to the `speak` function. most of these get passed straight to piper.exe
#[derive(Serialize, Deserialize, Debug)]
struct SpeakArgs {
    /// audio output device
    device: String,

    /// file to execute
    exe_path: PathBuf,

    /// the actual text to speak
    value: String,
}

async fn get_audio_bytes(args: &SpeakArgs) -> io::Result<Vec<u8>> {
    // create temp dir and file paths
    let directory = tempfile::tempdir()?;
    let txtfile = directory.path().join("speak.txt");
    let outfile = directory.path().join("speak.out");
    let script = &args.exe_path;

    // write text to input file
    tokio::fs::write(&txtfile, &args.value).await?;

    let mut command = build_command(script, &txtfile, &outfile);

    // set the working directory to the script location,
    // but only if the script path has more than one component.
    // otherwise it could also be a utility in the user's PATH.
    if let Some(path) = script.parent() {
        let dir = tokio::fs::canonicalize(path).await?;
        command.current_dir(dir);
    }

    let status = command
        .spawn()
        .with_context(|| format!("Failed to start {:?}", command.as_std()))?
        .wait()
        .await?;

    if status.success() {
        // the user might not actually create an output file,
        // so if we get a read error here we just treat that the same as an empty file.
        tokio::fs::read(&outfile).await.or_else(|_| Ok(vec![]))
    } else {
        let error = match status.code() {
            Some(code) => format!("{:?} exited with status code: {}", command.as_std(), code),
            None => format!("Script terminated by signal"),
        };
        Err(io::Error::other(error))
    }
}

/// Creates a `Command` with some arguments.
macro_rules! command {
    ($exe:expr $(, $arg:expr)*) => {{
        #[allow(unused_mut)]
        let mut temp = Command::new($exe);
        $( temp.arg($arg); )*
        temp
    }};
}

#[cfg(windows)]
fn build_command(script: &Path, txtfile: &Path, outfile: &Path) -> Command {
    // we want to support shell scripts as well, not just bare Win32 EXEs,
    // so we special-case a few file types and delegate the rest to cmd.exe
    let extension = script
        .extension()
        .and_then(std::ffi::OsStr::to_str)
        .unwrap_or_default()
        .to_ascii_lowercase();

    let mut command = match extension.as_str() {
        // if we can launch it directly, do that
        "exe" | "com" => command![script],

        // python might not be installed, so we need to probe for it.
        "py" if which::which("python").is_ok() => command!["python", script],

        // powershell is available on every windows since win7, so we don't need to check.
        // But we do want to bypass the execution policy.
        "ps1" => command!["powershell", "-ExecutionPolicy", "Bypass", "-File", script],

        // everything else we just delegate to cmd.exe
        // so that the user's file associations get used.
        _ => command!["cmd", "/c", script],
    };

    // pass along the actual arguments
    command.arg(txtfile);
    command.arg(outfile);

    // console applications on windows have the annoying habbit of spawning a terminal window.
    // we need to explicitly tell CreateProcess not to do that.
    command.creation_flags(0x08000000); // CREATE_NO_WINDOW

    command
}

#[cfg(not(windows))]
fn build_command(script: &Path, txtfile: &Path, outfile: &Path) -> Command {
    // things are so much easier on unix
    command![script, txtfile, outfile]
}

#[tauri::command]
async fn speak(args: SpeakArgs) -> Result<(), String> {
    use crate::services::audio::{play_async, RpcAudioPlayAsync};

    // fast path for empty string
    if args.value.is_empty() {
        return Ok(());
    }

    let bytes = get_audio_bytes(&args).await.map_err(|e| e.to_string())?;

    // if the user didn't supply any bytes, do nothing.
    if bytes.is_empty() {
        return Ok(());
    }

    let play_async_args = RpcAudioPlayAsync {
        device_name: args.device,
        data: bytes,
        volume: 1.0,
        rate: 1.0,
    };

    play_async(play_async_args).await
}

pub fn init<R: Runtime>() -> plugin::TauriPlugin<R> {
    plugin::Builder::new("custom_tts")
        .invoke_handler(tauri::generate_handler![speak])
        .build()
}
