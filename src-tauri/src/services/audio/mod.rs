use std::io::Cursor;

use rodio::{Decoder, OutputStream, Sink};
use tauri::{command, plugin::{TauriPlugin, Builder}, Runtime};

#[command]
async fn play_async(data: Vec<u8>) -> Result<(), String> {
    let (_stream, stream_handle) = OutputStream::try_default().unwrap();
    let sink = Sink::try_new(&stream_handle).unwrap();    
    let source = Decoder::new(Cursor::new(data)).unwrap();
    sink.append(source);
    sink.sleep_until_end();
    Ok(())
}

pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("audio")
        .invoke_handler(tauri::generate_handler![play_async])
        .build()
}