#[cfg(windows)]
mod windows;
#[cfg(windows)]
pub use windows::init;

#[cfg(not(windows))]
pub fn init<R: tauri::Runtime>() -> tauri::plugin::TauriPlugin<R> {
    tauri::plugin::Builder::new("windows_tts")
        .invoke_handler(tauri::generate_handler![])
        .build()
}