import { Client, MessageReaction, Message } from "discord.js";

import { EventCog, EventHandlerArgs } from "~/framework/EventCog";
import { prisma } from "~/utils/db";
import { EMOJIS } from "~/constants/emojis";

export default class PollReactionEvent extends EventCog {
  constructor(client: Client) {
    super({
      client,
      eventName: "messageReactionAdd",
    });
  }

  async eventHandler({ client, context }: EventHandlerArgs) {
    const contextAsUnknown = context as unknown;

    if (
      ![EMOJIS["UP_ARROW"], EMOJIS["DWN_ARROW"]].includes(
        // @ts-ignore
        contextAsUnknown._emoji.name
      )
    ) {
      return;
    }

    // Check if message id belongs to a poll
    // @ts-ignore
    const message = contextAsUnknown.message as Message;

    const poll = await prisma.poll.findFirst({
      where: {
        pollMessageId: message.id,
        inProgress: true,
      },
    });

    if (!poll) {
      return;
    }

    // Check if user has reacted to the poll already
    const allUpvoteReactions = message.reactions.resolve(EMOJIS["UP_ARROW"]);
    const allDownvoteReactions = message.reactions.resolve(
      EMOJIS["DOWN_ARROW"]
    );
  }
}
