use std::{collections::HashMap, sync::Arc};

use futures::StreamExt;
use serde::Deserialize;
use tauri::async_runtime::RwLock;
use tokio::sync::mpsc;
use tokio_stream::wrappers::UnboundedReceiverStream;
use warp::{
    filters::BoxedFilter,
    ws::{Message, WebSocket, Ws},
    Filter, Reply,
};

#[derive(Deserialize)]
pub struct PeerQueryData {
    id: String,
}

pub type Peers = Arc<RwLock<HashMap<String, mpsc::UnboundedSender<Result<Message, warp::Error>>>>>;

pub fn path(mut input: mpsc::Receiver<String>, output: mpsc::Sender<String>) -> BoxedFilter<(impl Reply,)> {
    let peers = Peers::default();

    let input_peers = peers.clone();
    tauri::async_runtime::spawn(async move {
        loop {
            if let Some(input) = input.recv().await {
                let p = input_peers.read().await;
                let str = input.as_str();
                for peer in p.values() {
                    peer.send(Ok(Message::text(str))).ok();
                }
            }
        }
    });

    let peers = warp::any().map(move || peers.clone());
    let output = warp::any().map(move || output.clone());
    let t = warp::path("pubsub")
        .and(warp::ws())
        .and(peers)
        .and(output)
        .and(warp::query::<PeerQueryData>())
        .map(|ws: Ws, peers, output, q| ws.on_upgrade(move |socket| peer_handler(socket, peers, output, q)))
        .boxed();
    t
}

pub async fn peer_handler(ws: WebSocket, peers: Peers, output: mpsc::Sender<String>, query: PeerQueryData) {
    let (peer_tx, mut peer_rx) = ws.split();

    let (tx, rx) = mpsc::unbounded_channel();
    let rx = UnboundedReceiverStream::new(rx);
    tauri::async_runtime::spawn(rx.forward(peer_tx));

    if peers.read().await.contains_key(&query.id) {
        println!("already registered");
        return;
    }

    peers.write().await.insert(query.id.clone(), tx);

    while let Some(result) = peer_rx.next().await {
        let Ok(msg) = result else {
            break;
        };
        let Ok(msg_str) = msg.to_str() else {break};
        output.send(msg_str.to_string()).await.ok();
        let p = peers.read().await;
        for peer in p.values() {
            peer.send(Ok(Message::text(msg_str))).ok();
        }
    }
    peers.write().await.remove(&query.id);
}
