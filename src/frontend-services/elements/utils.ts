import template from "lodash/template";

export type StyleEvent = {
  event: string;
  attribute: string;
  duration: number;
};

export function CssReplaceFileReference(style: unknown) {
  if (typeof style !== "string") return style;

  const newStyle = Array.from(style.matchAll(/\[file-.*?\]/g));
  // .reduce((sum, file) => {
  //   const requestedFileId = file[0].substring(6, file[0].length-1);
  //   const url = window.API.files.getFileUrl(requestedFileId);
  //   return url ? sum.replace(file[0], url) : sum;
  // }, style);

  return newStyle;
}

function extractEventsFromStyle(style: unknown): StyleEvent[] {
  if (typeof style !== "string") return [];

  function processEvent(
    styleEvent: string,
    removePrefix?: boolean
  ): StyleEvent {
    const s = styleEvent.split("-");

    const duration = parseInt(s.at(-1) || "");

    removePrefix && s.shift(); // remove prefix 'event-'
    !isNaN(duration) && s.pop(); // remove duration if it has any
    return {
      event: s.join("."),
      attribute: styleEvent,
      duration: duration || 0,
    };
  }

  // find everything with pattern [*]
  const styleBindings = Array.from(style.matchAll(/\[.*?\]/g)).map((v) =>
    v[0].substring(1, v[0].length - 1)
  );

  // find event-*
  // extract timer
  return styleBindings
    .filter((e) => e.startsWith("event-"))
    .map((e) => processEvent(e, true));
}

export class StyleToEventController {
  constructor(
    private initialStyle: string,
    private onAttributesChanged: (attrs: string[]) => void
  ) {
    this.Init();
  }

  private activeStyleSubs: string[] = [];
  private activeAttributes: { [eventAttribute: string]: any } = {};
  private currentStyleEvents: StyleEvent[] = [];

  private Init() {
    this.ExtractStyleEvents(this.initialStyle);
    this.ReApplyStyleEvents();
    this.NotifyAttributes();
  }

  private clearAttribute(attribute: string) {
    clearTimeout(this.activeAttributes[attribute]);
    delete this.activeAttributes[attribute];
  }

  private startAttributeTimer(event: StyleEvent) {
    this.activeAttributes[event.attribute] = setTimeout(() => {
      this.clearAttribute(event.attribute);
      this.NotifyAttributes();
    }, event.duration);
  }

  private NotifyAttributes() {
    this.onAttributesChanged(Object.keys(this.activeAttributes));
  }

  //convert css to StyleEvent[]
  private ExtractStyleEvents(v: unknown) {
    if (typeof v !== "string") return;
    this.currentStyleEvents = extractEventsFromStyle(v);
  }

  public OnStyleChange(css: unknown) {
    this.ExtractStyleEvents(css);
    this.ReApplyStyleEvents();
    this.NotifyAttributes();
  }

  private ReApplyStyleEvents() {
    // clear active subscriptions
    this.activeStyleSubs.forEach(window.API.pubsub.unsubscribe);

    //remove unused attributes
    const newAttrs = this.currentStyleEvents.map((e) => e.attribute);
    Object.keys(this.activeAttributes).forEach(
      (attribute) =>
        !newAttrs.includes(attribute) && this.clearAttribute(attribute)
    );

    // subscribe to everything except scenes
    this.activeStyleSubs = this.currentStyleEvents
      .filter((e) => !e.attribute.startsWith("scene-"))
      .map((event) =>
        window.API.pubsub.subscribe(event.event, () => {
          this.ApplyEvent(event);
          this.NotifyAttributes();
        })
      );
  }

  private ApplyEvent(event: StyleEvent) {
    //cancel timer
    if (this.activeAttributes[event.attribute])
      clearTimeout(this.activeAttributes[event.attribute]);

    if (event.duration) this.startAttributeTimer(event);
    else this.activeAttributes[event.attribute] = 0;
  }
}

// fields
function ProcessFieldValue(value: any, field: any): any {
  if (field.type === "number") {
    if (typeof value === "number") return value;
    return typeof value === "string" ? parseFloat(value) || 0 : 0;
  }
  if (field.type === "css")
    return (CssReplaceFileReference(value) as string) ?? field.value ?? "";
  // else if (field.type === 'file' && field.convertFileToUrl)
  //   return window.API.files.getFileUrl(value) ?? field.value ?? '';
  else return value;
}

export type TemplateEvent = {
  event: string;
  text: string;
};

export function templateEventsSubscriber(
  events: TemplateEvent[],
  fn: (event: string, value: string) => void
) {
  return (
    events
      .filter((e) => e.event && e.text)
      .map?.((e) => {
        try {
          const eventTemplate = template(e.text);
          return window.API.pubsub.subscribe(e.event, (value) => {
            try {
              fn?.(e.event, eventTemplate({ event: value }));
            } catch (_error) {
              fn?.(e.event, "_invalid_value_");
            }
          });
        } catch {
          return window.API.pubsub.subscribe(e.event, (value) =>
            fn(e.event, "_invalid_template_")
          );
        }
      }) || []
  );
}
