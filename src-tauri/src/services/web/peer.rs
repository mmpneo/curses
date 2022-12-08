use std::{collections::HashMap, sync::Arc};

use futures::StreamExt;
use serde::{Deserialize, Serialize};
use serde_json::Value as SerdeValue;
use tauri::async_runtime::RwLock;
use warp::{
    filters::BoxedFilter,
    ws::{Message, WebSocket, Ws},
    Filter, Reply,
};

use tokio::sync::mpsc;
use tokio_stream::wrappers::UnboundedReceiverStream;

#[derive(Deserialize)]
pub struct PeerQueryData {
    id: String,
}

pub type Peers = Arc<RwLock<HashMap<String, mpsc::UnboundedSender<Result<Message, warp::Error>>>>>;

pub fn path() -> BoxedFilter<(impl Reply,)> {
    let peers = Peers::default();
    let peers = warp::any().map(move || peers.clone());
    let t = warp::path("peer")
        .and(warp::ws())
        .and(peers)
        .and(warp::query::<PeerQueryData>())
        .map(|ws: Ws, peers, q| ws.on_upgrade(move |socket| peer_handler(socket, peers, q)))
        .boxed();
    t
}

pub async fn peer_handler(ws: WebSocket, peers: Peers, query: PeerQueryData) {
    let (peer_tx, mut peer_rx) = ws.split();

    let (tx, rx) = mpsc::unbounded_channel();
    let rx = UnboundedReceiverStream::new(rx);
    tauri::async_runtime::spawn(rx.forward(peer_tx));

    if peers.read().await.contains_key(&query.id) {
        println!("already registered");
        return;
    }

    tx.send(Ok(PeerMessageType::OPEN.into())).unwrap();

    peers.write().await.insert(query.id.clone(), tx);

    while let Some(result) = peer_rx.next().await {
        let Ok(msg) = result else {
            break;
        };
        handle_message(&query.id, msg, &peers).await;
    }
    peers.write().await.remove(&query.id);
}

#[derive(Serialize, Deserialize, PartialEq)]
enum PeerMessageType {
    OPEN, // socket ready
    LEAVE,
    CANDIDATE,
    OFFER,
    ANSWER,
    EXPIRE, // host not found
    HEARTBEAT,
    #[serde(rename(serialize = "ID_TAKEN", deserialize = "IDTAKEN"))]
    IDTAKEN,
    ERROR,
}
impl Default for PeerMessageType {
    fn default() -> Self {
        PeerMessageType::ERROR
    }
}
impl Into<Message> for PeerMessageType {
    fn into(self) -> Message {
        Message::text(serde_json::to_string(&PeerMessageShort { t: self }).unwrap())
    }
}

#[derive(Serialize, Deserialize, PartialEq)]
struct PeerMessage {
    #[serde(rename(serialize = "type", deserialize = "type"))]
    #[serde(default)]
    pub t: PeerMessageType,
    #[serde(default)]
    pub src: String,
    #[serde(default)]
    pub dst: String,
    #[serde(default)]
    pub payload: SerdeValue,
}

#[derive(Serialize, Deserialize, PartialEq)]
struct PeerMessageShort {
    #[serde(rename(serialize = "type", deserialize = "type"))]
    #[serde(default)]
    pub t: PeerMessageType,
}

async fn handle_message(peer_id: &String, msg: Message, users: &Peers) {
    let Ok(msg_str) = msg.to_str() else {return};
    let Ok(mut msg) = serde_json::from_str::<PeerMessage>(msg_str) else {return};

    let users = users.read().await;

    if msg.t == PeerMessageType::OFFER && !users.contains_key(msg.dst.as_str()) {
        let Some(peer_tx) = users.get(peer_id) else {return};
        let Ok(msg_str) = serde_json::to_string(&PeerMessage{
            t: PeerMessageType::EXPIRE,
            src: msg.dst,
            dst: peer_id.clone(),
            payload: msg.payload,
        }) else {return};
        peer_tx.send(Ok(Message::text(msg_str))).unwrap();
    } else if msg.dst != "" && users.contains_key(&msg.dst) {
        msg.src = peer_id.clone();
        let Some(peer_tx) = users.get(&msg.dst) else {return};
        let Ok(msg_str) = serde_json::to_string(&msg) else {return};
        peer_tx.send(Ok(Message::text(msg_str))).unwrap();
    }
}
