import { Client, Message } from "discord.js";
import { DateTime } from "luxon";

import { EventCog, EventHandlerArgs } from "~/framework/EventCog";
import { prisma } from "~/utils/db";
import { USERS } from "~/constants/users";

const SUCCESS_MESSAGE_REGEX = /<@[0-9]{18}> Bump done! :thumbsup:/gm;
export default class MessageEvent extends EventCog {
  constructor(client: Client) {
    super({
      client,
      eventName: "messageCreate",
    });
  }

  async eventHandler({ client, context }: EventHandlerArgs) {
    const message = context as unknown as Message;
    const { guildId, author, embeds } = message;

    if (author.id !== USERS.BUMP_BOT) {
      return;
    }

    const embed = embeds[0];

    if (!embed) {
      return;
    }

    const { description } = embed;

    if (!description?.match(SUCCESS_MESSAGE_REGEX)) {
      return;
    }

    const now = DateTime.now().toISO();

    await prisma.guildSettings.upsert({
      where: {
        id: guildId!,
      },
      create: {
        id: guildId!,
        lastBumpedAt: now,
      },
      update: {
        lastBumpedAt: now,
      },
    });
  }
}
