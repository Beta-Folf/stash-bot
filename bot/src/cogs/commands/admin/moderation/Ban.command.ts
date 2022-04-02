import {
  CommandCog,
  CommandRunArgs,
  COMMAND_ARG_TYPE,
} from "~/framework/CommandCog";
import { EMOJIS } from "~/constants/emojis";
import { prisma } from "~/utils/db";
import { sendLogMessage } from "~/utils/logs";
import { GuildMember, TextChannel } from "discord.js";

export default class BanUser extends CommandCog {
  constructor() {
    super({
      name: "ban",
      permissions: ["BAN_MEMBERS"],
      commandArgs: [
        {
          name: "userId",
          type: COMMAND_ARG_TYPE.USER,
        },
        {
          name: "reason",
          type: COMMAND_ARG_TYPE.MULTI_STRING,
          optional: true,
        },
      ],
    });
  }

  async run(args: CommandRunArgs) {
    const { client, context, commandArgs } = args;
    const { userId, reason } = commandArgs;

    const { guildId, guild } = context;

    const userIdAsString = userId as string;

    if (!guildId || !guild) {
      return;
    }

    const guildSettings = await prisma.guildSettings.findUnique({
      where: {
        id: guildId,
      },
      select: {
        logChannelId: true,
      },
    });

    try {
      await guild.bans.create(userIdAsString, {
        reason: reason?.toString(),
      });
    } catch {
      await context.react(EMOJIS["RED_X"]);

      return;
    }

    let guildMember: GuildMember | undefined;

    try {
      guildMember = await guild.members.fetch(userIdAsString);
    } catch {}

    if (guildSettings?.logChannelId) {
      const channel = await guild.channels.fetch(guildSettings.logChannelId);

      if (channel && channel.isText() && !channel.isThread()) {
        await sendLogMessage({
          channel: channel as TextChannel,
          doneBy: context.author,
          title: "User banned",
          message: `User <@${guildMember?.user.tag || userId}> banned`,
        });
      }
    }

    await context.react(EMOJIS["GREEN_CHECKMARK"]);
  }
}
