use tauri::{
    command,
    plugin::{Builder, TauriPlugin},
    Runtime,
};
use uwuifier::uwuify_str_sse;

#[command]
fn translate(value: String) -> String {
    uwuify_str_sse(value.as_str())
}

pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("uwu")
        .invoke_handler(tauri::generate_handler![translate])
        .build()
}
