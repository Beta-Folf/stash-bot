import { Client, Message } from "discord.js";

import { EventCog, EventHandlerArgs } from "~/framework/EventCog";
import { messageStartsWithPrefix } from "~/framework/commandHandler";
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
    const { channelId, author, embeds } = message;

    if (author.id !== USERS.BUMP_BOT) {
      return;
    }

    const embed = embeds[0];
    const { description } = embed;

    console.log({ description });

    if (description?.match(SUCCESS_MESSAGE_REGEX)) {
      console.log("Matches");
    } else {
      console.log("Does not match");
    }
  }
}
