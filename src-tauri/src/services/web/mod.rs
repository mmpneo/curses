use std::sync::Arc;

use tauri::{
    async_runtime::Mutex,
    command,
    plugin::{Builder, TauriPlugin},
    Manager, Runtime, State,
};
use tokio::sync::mpsc;
use warp::Filter;

mod assets;
mod peer;
mod pubsub;
pub struct WebPlugin {}

impl Default for WebPlugin {
    fn default() -> Self {
        Self {}
    }
}
struct PubSubInput {
    tx: Mutex<mpsc::Sender<String>>,
}

#[command]
async fn pubsub_broadcast(value: String, input: State<'_, PubSubInput>) -> Result<(), String> {
    let tx = input.tx.lock().await;
    tx.send(value).await.map_err(|e| e.to_string())
}

pub fn init<R: Runtime>() -> TauriPlugin<R> {
    let (pubsub_input_tx, pubsub_input_rx) = mpsc::channel::<String>(1); // to pubsub
    let (pubsub_output_tx, mut pubsub_output_rx) = mpsc::channel::<String>(1); // to js
    Builder::new("web")
        .invoke_handler(tauri::generate_handler![pubsub_broadcast])
        .setup(|app| {
            app.manage(WebPlugin::default());
            app.manage(PubSubInput {
                tx: Mutex::new(pubsub_input_tx),
            });
            let a = Arc::new(app.asset_resolver());
            tauri::async_runtime::spawn(async move {
                let routes = warp::path!("ping")
                    .map(|| format!("pong"))
                    .or(peer::path())
                    .or(pubsub::path(pubsub_input_rx, pubsub_output_tx))
                    .or(assets::path(a));

                warp::serve(routes).run(([0, 0, 0, 0], 3030)).await
            });
            let handle = app.app_handle();
            tauri::async_runtime::spawn(async move {
                loop {
                    if let Some(output) = pubsub_output_rx.recv().await {
                        handle.emit_all("pubsub", output).unwrap();
                    }
                }
            });

            Ok(())
        })
        .build()
}
