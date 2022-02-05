import { Client, Message } from "discord.js";

import { EventCog, EventHandlerArgs } from "~/framework/EventCog";
import { messageStartsWithPrefix } from "~/framework/commandHandler";
import { prisma } from "~/utils/db";
import { USERS } from "~/constants/users";

export default class MessageEvent extends EventCog {
  constructor(client: Client) {
    super({
      client,
      eventName: "messageCreate",
    });
  }

  async eventHandler({ client, context }: EventHandlerArgs) {
    const message = context as unknown as Message;
    const { channelId, author, embeds } = message;

    if (author.id === USERS.BUMP_BOT) {
      console.log({ embeds });
    }
  }
}
