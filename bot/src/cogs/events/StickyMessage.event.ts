import { Client, Message } from "discord.js";

import { EventCog, EventHandlerArgs } from "~/framework/EventCog";
import { messageStartsWithPrefix } from "~/framework/commandHandler";
import { prisma } from "~/utils/db";

export default class MessageEvent extends EventCog {
  constructor(client: Client) {
    super({
      client,
      eventName: "messageCreate",
    });
  }

  async eventHandler({ client, context }: EventHandlerArgs) {
    const message = context as unknown as Message;
    const { channelId, author } = message;

    if (author.bot) {
      return;
    }

    if (messageStartsWithPrefix(message.content).startsWithPrefix) {
      return;
    }

    const stickyMessage = await prisma.stickyMessage.findUnique({
      where: {
        id: channelId,
      },
      rejectOnNotFound: false,
    });

    if (stickyMessage) {
      const { messageContent, messageId } = stickyMessage;

      let existingMessage: Message | null = null;

      try {
        existingMessage = await message.channel.messages.fetch(messageId);
      } catch {}

      if (existingMessage) {
        await existingMessage.delete();
      }

      const resentMessage = await message.channel.send(messageContent);

      await prisma.stickyMessage.update({
        where: {
          id: channelId,
        },
        data: {
          messageId: resentMessage.id,
        },
      });
    }
  }
}
