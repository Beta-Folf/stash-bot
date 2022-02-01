import { Client, Message } from "discord.js";

import { EventCog, EventHandlerArgs } from "~/framework/EventCog";
import { messageStartsWithPrefix } from "~/framework/commandHandler";
import { prisma } from "~/utils/db";
import { EMOJIS } from "~/constants/emojis";
import { Logger, LOGGER_CATEGORY } from "~/utils/logger";

export default class VoteEvent extends EventCog {
  constructor(client: Client) {
    super({
      client,
      eventName: "messageCreate",
    });
  }

  async eventHandler({ client, context }: EventHandlerArgs) {
    const messageAsMessage = context as unknown as Message;

    if (messageAsMessage.author.bot) {
      return;
    }

    if (messageStartsWithPrefix(messageAsMessage.content).startsWithPrefix) {
      return;
    }

    const { guildId, channelId } = messageAsMessage;

    const guildHasVoteChannel = await prisma.guildSettings.findFirst({
      where: {
        id: guildId!,
        voteChannels: {
          has: channelId,
        },
      },
    });

    if (!!guildHasVoteChannel) {
      // React to message
      try {
        await messageAsMessage.react(EMOJIS["UP_ARROW"]);
        await messageAsMessage.react(EMOJIS["DOWN_ARROW"]);
      } catch {
        Logger.log({
          message: "Tried to react to a deleted message",
          category: LOGGER_CATEGORY.COMMAND,
          user: messageAsMessage.author,
        });
      }
    }
  }
}
