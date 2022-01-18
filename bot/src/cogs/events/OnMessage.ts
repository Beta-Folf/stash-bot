import { Client, Message } from "discord.js";

import { EventCog, EventHandlerArgs } from "~/framework/EventCog";
import { Logger } from "~/utils/logger";

export default class OnMessageEvent extends EventCog<Message> {
  constructor(client: Client) {
    super({
      client,
      eventName: "messageCreate",
    });
  }

  async eventHandler(args: EventHandlerArgs<Message>) {
    const { client, context } = args;

    console.log(client);
    console.log(context);

    Logger.log(context.author.toString());
  }
}
