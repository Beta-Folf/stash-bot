import { Client, Message } from "discord.js";

import { EventCog } from "~/framework/EventCog";
import { Logger } from "~/utils/logger";

export default class OnMessageEvent extends EventCog<Message> {
  constructor(client: Client) {
    super({
      client,
      eventName: "messageCreate",
    });
  }

  async eventHandler(context) {
    Logger.log(context.author.toString());
  }
}
