import { Client } from "discord.js";

interface IEventCog<T = undefined> {
  eventHandler(args: { client: Client; context?: T }): Promise<void>;
}

export class EventCog<T = undefined> implements IEventCog<T> {
  private readonly client: Client;

  constructor(args: { client: Client; eventName: string }) {
    const { client, eventName } = args;

    this.client = client;

    this.client.on(eventName, this.eventHandler);
  }

  async eventHandler(args: { client: Client<boolean>; context?: T }) {}
}
