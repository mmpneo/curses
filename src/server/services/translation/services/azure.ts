import { TextEvent, TextEventType } from "@/types";
import { isObjectVaid } from "@/utils";
import { Translation_State } from "../schema";
import {
  ITranslationReceiver,
  ITranslationService
} from "../types";

export class Translation_AzureService implements ITranslationService {
  constructor(private receiver: ITranslationReceiver) {}

  dispose(): void {}

  start(state: Translation_State): void {
    if (!isObjectVaid(this.state))
      return this.receiver.onStop("[Azure translator] Options missing");
    this.receiver.onStart();
  }

  get state() {
    return window.ApiServer.state.services.translation.data.azure;
  }

  async translate(id: number, text: TextEvent) {
    if (text.type === TextEventType.interim && !this.state.interim)
      return;
    let key = this.state.key;
    let location = this.state.location;

    const link = new URL(
      "https://api.cognitive.microsofttranslator.com/translate"
    );
    link.searchParams.set("api-version", "3.0");
    link.searchParams.set("from", this.state.languageFrom);
    link.searchParams.set("profanityAction", this.state.profanity);
    
    link.searchParams.set("to", this.state.language);
    link.search = decodeURIComponent(link.search);
    const resp = await fetch(link, {
      method: "POST",
      body: JSON.stringify([{ text: text.value }]),
      headers: {
        "Ocp-Apim-Subscription-Key": key,
        "Ocp-Apim-Subscription-Region": location,
        "Content-type": "application/json",
        // "X-ClientTraceId": uuid.v4().toString(),
      },
    });

    // ignore invalid
    // todo notify
    if (!resp.ok) return;
    try {
      const data: [
        {
          translations: {
            text: string;
            to: string;
          }[];
        }
      ] = await resp.json();

      const tr = data?.[0]?.translations;
      if (!tr || !Array.isArray(tr) || !tr.length) return;
      this.receiver.onTranslation(id, text, tr[0].text);
    } catch (error) {}
  }
  stop(): void {
    this.receiver.onStop();
  }
}
