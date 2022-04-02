import {
  CommandCog,
  CommandRunArgs,
  COMMAND_ARG_TYPE,
} from "~/framework/CommandCog";
import { EMOJIS } from "~/constants/emojis";
import { prisma } from "~/utils/db";
import { sendLogMessage } from "~/utils/logs";
import { TextChannel } from "discord.js";
import ms from "ms";

export default class MuteUser extends CommandCog {
  constructor() {
    super({
      name: "mute",
      nicks: ["timeout", "censor", "1984"],
      permissions: ["MANAGE_ROLES"],
      commandArgs: [
        {
          name: "userId",
          type: COMMAND_ARG_TYPE.USER,
        },
        {
          name: "duration",
          type: COMMAND_ARG_TYPE.TIME,
        },
      ],
    });
  }

  async run(args: CommandRunArgs) {
    const { client, context, commandArgs } = args;
    const { userId, duration } = commandArgs;

    const { guildId, guild } = context;

    const userIdAsString = userId as string;
    const durationAsNumber = duration as number;

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
      await guildMember.timeout(durationAsNumber);
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
          title: "User muted",
          message: `User <@${guildMember.id}> muted for ${ms(durationAsNumber, {
            long: true,
          })}`,
        });
      }
    }

    await context.react(EMOJIS["GREEN_CHECKMARK"]);
  }
}
