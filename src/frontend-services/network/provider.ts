import {applyUpdate, Doc, encodeStateAsUpdate}                                              from "yjs";
import Peer, {DataConnection}                                                               from "peerjs";
import {decoding, encoding}                                                                 from "lib0";
import {messageYjsSyncStep1, messageYjsSyncStep2, readSyncMessage, readUpdate, writeUpdate} from 'y-protocols/sync'
import {nanoid}                                                                             from "nanoid";
import { BaseEvent } from "../../types";
export class PeerjsProvider {
  constructor(
    private document: Doc,
    private onStatusChange: (connected: boolean) => void
  ) {}

  #peer?: Peer;
  private peers: { [id: string]: DataConnection } = {};

  connectHost(netId: string) {
    // track document update
    this.document.on("update", update => this.broadcastUpdate(this.serializeUpdate(update)));

    this.#peer = new Peer(netId, {
      host: "localhost",
      port:   3030,
      key:    '',
      path:   'peer',
      secure: false,
      debug: 2});
    this.#peer.on("open", () => this.onStatusChange(true));
    this.#peer.on("connection", clientConn => {
      this.onStatusChange(true);
      console.log("connected client", clientConn);
      this.peers[clientConn.connectionId] = clientConn;
      clientConn.on("open", () => clientConn.send(this.serializeUpdate(encodeStateAsUpdate(this.document))));
      clientConn.on("close", () => delete this.peers[clientConn.connectionId]);
    });
    this.#peer.on("disconnected", () => this.onStatusChange(false));
  }

  // await connect to server
  // await connect to peer

  private tryReconnectClient(netId: string) {
    this.#peer?.destroy();
    this.#peer = undefined;
    setTimeout(() => {
      console.log("[Client] Reset")
      this.connectClient(netId);
    }, 1000);
  }

  async internalConnectClient(netId: string, resolve: (v: any) => void, reject: (v: any) => void) {
    this.#peer = new Peer(nanoid(64), {
      host: "localhost",
      port:   3030,
      key:    '',
      path:   'peer',
      secure: false,
      debug: 2
    });
    if (!this.#peer)
      reject("No peer");

    this.#peer.on("open", () => {
      const hostConn = this.#peer!.connect(netId, {serialization: 'binary'});
      this.peers[hostConn.connectionId] = hostConn;
      // try again
      hostConn.on("close", () => this.tryReconnectClient(netId));
      hostConn.on("data", handleData => this.readMessage(new Uint8Array(handleData as ArrayBuffer)));
      hostConn.on("open", () => {
        resolve("connected");
        console.log("connected to host");
      });
    });
    this.#peer.on("error", () => this.tryReconnectClient(netId));
  }

  async connectClient(netId: string) {
    let resolve = (v: unknown) => {};
    let reject = (v?: any) => {};
    const p = new Promise((res, rej) => {resolve = res; reject = rej;})
    this.internalConnectClient(netId, resolve, reject);
    await p;
  }

  dispose() {
    this.document.off("update", (update: any) => this.broadcastUpdate(this.serializeUpdate(update)));
    this.#peer?.destroy();
  }

  private readMessage(buffer: Uint8Array) {
    const decoder     = decoding.createDecoder(buffer);
    const encoder     = encoding.createEncoder();
    const messageType = decoding.readVarUint(decoder);

    if (messageType === 0) {
      const syncMessageType = readSyncMessage(decoder, encoder, this.document, 0);

      if (syncMessageType === messageYjsSyncStep2) {
        applyUpdate(this.document, decoder.arr);
        readUpdate(decoder, this.document, 0);
      }
      if (syncMessageType === messageYjsSyncStep1) {
      }
    }
    else if (messageType === 1) {
      try {
        const topicStr = decoding.readVarString(decoder);
        const dataStr = decoding.readVarString(decoder);
        window.API.pubsub.publishLocally({topic: topicStr, data: JSON.parse(dataStr)});
      } catch (error) {console.error(error)}
    }
  }

  serializeUpdate (update: Uint8Array) {
    const encoder = encoding.createEncoder()
    encoding.writeVarUint(encoder, 0)
    writeUpdate(encoder, update);
    return encoding.toUint8Array(encoder);
  }

  broadcastPubSub (msg: BaseEvent) {
    try {
      const encoder = encoding.createEncoder();
      encoding.writeVarInt(encoder, 1);
      encoding.writeVarString(encoder, msg.topic);
      encoding.writeVarString(encoder, JSON.stringify(msg.data));
      this.broadcastUpdate(encoding.toUint8Array(encoder));
    } catch (error) {
      console.error(error)
    }
  }

  private broadcastUpdate(uint8Array: Uint8Array) {
    for (let peersKey in this.peers) {
      this.peers[peersKey].send(uint8Array);
    }
  }
}


