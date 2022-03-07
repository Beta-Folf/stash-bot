import { Client, MessageReaction, Message } from "discord.js";

import { EventCog, EventHandlerArgs } from "~/framework/EventCog";
import { prisma } from "~/utils/db";

export default class VerifyReactionEvent extends EventCog {
  constructor(client: Client) {
    super({
      client,
      eventName: "messageReactionAdd",
    });
  }

  async eventHandler({ client, context }: EventHandlerArgs) {
    const contextAsReactionEvent = context as unknown as MessageReaction;

    const { message } = contextAsReactionEvent;
    const { id, guildId } = message;

    if (!guildId) {
      return;
    }

    const guildSettings = await prisma.guildSettings.findUnique({
      where: {
        id: guildId,
      },
      select: {
        idVerificationReactionEmoji: true,
        idVerificationReactionMessage: true,
        idVerificationReactionMessageChannel: true,
        idVerificationChannel: true,
      },
    });

    if (
      !guildSettings ||
      !guildSettings.idVerificationReactionEmoji ||
      !guildSettings.idVerificationReactionMessage ||
      !guildSettings.idVerificationReactionMessageChannel ||
      !guildSettings.idVerificationChannel
    ) {
      return;
    }

    const {
      idVerificationReactionEmoji,
      idVerificationReactionMessage,
      idVerificationReactionMessageChannel,
    } = guildSettings;

    // Check if the emoji is the reaction emoji emoji for the server
    console.log(contextAsReactionEvent.emoji.name);
  }
}
