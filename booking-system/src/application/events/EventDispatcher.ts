import { DomainEvent } from "../../domain/events/DomainEvent";

export interface EventHandler {
  handle(event: DomainEvent): void;
}

export class EventDispatcher {
  private handlers = new Map<string, EventHandler[]>();

  register(eventName: string, handler: EventHandler): void {
    const existing = this.handlers.get(eventName) ?? [];
    existing.push(handler);
    this.handlers.set(eventName, existing);
  }

  dispatch(event: DomainEvent): void {
    const handlers = this.handlers.get(event.eventName);
    if (!handlers) return;
    for (const handler of handlers) {
      handler.handle(event);
    }
  }
}
