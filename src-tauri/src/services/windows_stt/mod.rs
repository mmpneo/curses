use tauri::{plugin::{Builder, TauriPlugin}, Runtime, command};
use windows::{Win32::Media::Speech::ISpeechRecognizer, Media::SpeechRecognition::{SpeechRecognizer, SpeechRecognitionResult}};

#[command]
fn start() {
    println!("start");
    unsafe {
        let p = SpeechRecognizer::new().unwrap();
        let session = p.ContinuousRecognitionSession().unwrap();
    }
    // ISpeechRecognizer::
}

pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("windows_stt")
        .invoke_handler(tauri::generate_handler![start])
        .build()
}