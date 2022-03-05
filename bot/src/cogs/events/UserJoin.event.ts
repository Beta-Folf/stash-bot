import { Client, GuildMember, Message } from "discord.js";
import { DateTime } from "luxon";

import { EventCog, EventHandlerArgs } from "~/framework/EventCog";

export default class UserJoinEvent extends EventCog {
  constructor(client: Client) {
    super({
      client,
      eventName: "guildMemberAdd",
    });
  }

  async eventHandler({ client, context }: EventHandlerArgs) {
    const guildUser = context as unknown as GuildMember;
    if (guildUser.user.bot) {
      return;
    }

    const now = DateTime.now();
    const userCreated = guildUser.user.createdAt;

    if (now.minus({ day: 2 }).toMillis() < userCreated.getTime()) {
      await guildUser.ban();
    }
  }
}
