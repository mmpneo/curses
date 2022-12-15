use std::sync::Arc;

use tauri::{
    command,
    plugin::{Builder, TauriPlugin},
    Runtime, State,
};
use warp::Filter;

mod peer;
mod assets;
pub struct WebPlugin {}

impl Default for WebPlugin {
    fn default() -> Self {
        Self {}
    }
}

impl WebPlugin {
    fn send(&self) {}
}

#[command]
fn send(state: State<WebPlugin>) {
    state.send();
}

pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("web")
        .invoke_handler(tauri::generate_handler![send])
        .setup(|app| {
            let a = Arc::new(app.asset_resolver());
            tauri::async_runtime::spawn(async move {
                let routes = warp::path!("ping")
                    .map(|| format!("pong"))
                    .or(peer::path())
                    .or(assets::path(a));

                warp::serve(routes).run(([0, 0, 0, 0], 3030)).await
            });
            // app.manage(WebPlugin::default());
            Ok(())
        })
        .build()
}
