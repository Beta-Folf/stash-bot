import { Client, Message } from "discord.js";

import { EventCog, EventHandlerArgs } from "~/framework/EventCog";
import { messageStartsWithPrefix } from "~/framework/commandHandler";
import { prisma } from "~/utils/db";
import { EMOJIS } from "~/constants/emojis";

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
      await messageAsMessage.react(EMOJIS["UP_ARROW"]);
      await messageAsMessage.react(EMOJIS["DOWN_ARROW"]);
    }
  }
}
