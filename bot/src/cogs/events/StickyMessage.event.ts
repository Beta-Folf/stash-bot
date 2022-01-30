import { Client, Message } from "discord.js";

import { EventCog, EventHandlerArgs } from "~/framework/EventCog";
import { messageStartsWithPrefix } from "~/framework/commandHandler";
import { prisma } from "~/utils/db";

export default class MessageEvent extends EventCog {
  // Locked is used to "lock" the deletion/sending of
  // the sticky message. This is used in cases
  // where the message event fires two or more times
  // when the execution takes longer than the new message
  // due to a database operation. Locking prevents
  // the sticky message from being sent twice
  private locked: boolean = false;

  constructor(client: Client) {
    super({
      client,
      eventName: "messageCreate",
    });
  }

  async eventHandler({ client, context }: EventHandlerArgs) {
    const message = context as unknown as Message;
    const { channelId, author } = message;

    if (this.locked) {
      return;
    }

    this.locked = true;

    if (message.author.id === client?.user?.id) {
      this.locked = false;
      return;
    }

    if (messageStartsWithPrefix(message.content).startsWithPrefix) {
      this.locked = false;
      return;
    }

    const stickyMessage = await prisma.stickyMessage.findUnique({
      where: {
        id: channelId,
      },
    });

    if (stickyMessage) {
      const { messageContent, messageId } = stickyMessage;

      if (messageId) {
        try {
          const existingMessage = await message.channel.messages.fetch(
            messageId
          );

          if (existingMessage) {
            await existingMessage.delete();
          }
        } catch (error) {}
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

    this.locked = false;
  }
}
