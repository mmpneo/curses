#![cfg_attr(all(not(debug_assertions), target_os = "windows"), windows_subsystem = "windows")]

mod services;

fn main() {
    let app = tauri::Builder::default();
        
    app
    .plugin(services::osc::init())
    .plugin(services::web::init())
    .plugin(services::windows_tts::init())
    .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
