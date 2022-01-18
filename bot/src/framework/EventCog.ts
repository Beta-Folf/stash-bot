import { Client } from "discord.js";

export interface EventHandlerArgs<T = undefined> {
  client: Client;
  context: T;
}

export interface IEventCog<T> {
  eventHandler(args: EventHandlerArgs<T>): Promise<void>;
}

export class EventCog<T = undefined> implements IEventCog<T> {
  private readonly client: Client;

  constructor(args: { client: Client; eventName: string }) {
    const { client, eventName } = args;

    this.client = client;

    this.client.on(eventName, (event) =>
      this.eventHandler({
        client,
        context: event,
      })
    );
  }

  async eventHandler(args: EventHandlerArgs<T>): Promise<void> {}
}
