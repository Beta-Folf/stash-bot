import {
  CommandCog,
  CommandRunArgs,
  COMMAND_ARG_TYPE,
} from "~/framework/CommandCog";
import { EMOJIS } from "~/constants/emojis";
import { prisma } from "~/utils/db";
import { sendLogMessage } from "~/utils/logs";
import { TextChannel } from "discord.js";

export default class KickUser extends CommandCog {
  constructor() {
    super({
      name: "kick",
      permissions: ["KICK_MEMBERS"],
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

    const guildMember = await guild.members.fetch(userIdAsString);

    if (!guildMember) {
      await context.reply("User not found!");

      return;
    }

    try {
      await guildMember.kick(reason?.toString());
    } catch {
      await context.react(EMOJIS["RED_X"]);

      return;
    }

    if (guildSettings?.logChannelId) {
      const channel = await guild.channels.fetch(guildSettings.logChannelId);

      if (channel && channel.isText() && !channel.isThread()) {
        await sendLogMessage({
          channel: channel as TextChannel,
          doneBy: context.author,
          title: "User kicked",
          message: `User <@${guildMember.id}> kicked`,
        });
      }
    }

    await context.react(EMOJIS["GREEN_CHECKMARK"]);
  }
}
