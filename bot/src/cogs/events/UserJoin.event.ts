import { Client, GuildMember } from "discord.js";
import { DateTime } from "luxon";

import { EventCog, EventHandlerArgs } from "~/framework/EventCog";
import { prisma } from "~/utils/db";
import { sendQuarantineAlert } from "~/utils/quarantine";

const MINIMUM_ACCOUNT_AGE_DAYS = 7;

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

    const guildSettings = await prisma.guildSettings.findUnique({
      where: {
        id: guildUser.guild.id,
      },
      select: {
        quarantineRoleId: true,
        verifiedRoleId: true,
        quarantineAlertChannelId: true,
      },
    });

    if (
      !guildSettings ||
      !guildSettings.quarantineRoleId ||
      !guildSettings.verifiedRoleId
    ) {
      return;
    }

    const { quarantineRoleId, verifiedRoleId, quarantineAlertChannelId } =
      guildSettings;

    if (
      now.minus({ day: MINIMUM_ACCOUNT_AGE_DAYS }).toMillis() <
      userCreated.getTime()
    ) {
      await guildUser.roles.set([quarantineRoleId]);

      if (quarantineAlertChannelId) {
        await sendQuarantineAlert({
          client,
          channelId: quarantineAlertChannelId,
          member: guildUser,
        });
      }
    } else {
      await guildUser.roles.set([verifiedRoleId]);
    }
  }
}
