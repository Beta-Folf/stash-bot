import {
  CommandCog,
  CommandRunArgs,
  COMMAND_ARG_TYPE,
} from "~/framework/CommandCog";
import { EMOJIS } from "~/constants/emojis";
import { prisma } from "~/utils/db";
import { sendLogMessage } from "~/utils/logs";
import { GuildMember, TextChannel } from "discord.js";

export default class ClearWarns extends CommandCog {
  constructor() {
    super({
      name: "clearwarns",
      nicks: [
        "clearwarnings",
        "resetwarns",
        "resetwarnings",
        "clearwarn",
        "clearwarning",
        "resetwarn",
        "resetwarning",
      ],
      permissions: ["BAN_MEMBERS"],
      commandArgs: [
        {
          name: "userId",
          type: COMMAND_ARG_TYPE.USER,
        },
      ],
    });
  }

  async run(args: CommandRunArgs) {
    const { client, context, commandArgs } = args;
    const { userId } = commandArgs;

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

    let guildMember: GuildMember | undefined;

    try {
      guildMember = await guild.members.fetch(userIdAsString);
    } catch {}

    const { count } = await prisma.warnings.deleteMany({
      where: {
        userId: userIdAsString,
      },
    });

    if (count === 0) {
      await context.reply("That user has no warnings!");

      await context.react(EMOJIS["RED_X"]);

      return;
    }

    if (guildSettings?.logChannelId) {
      const channel = await guild.channels.fetch(guildSettings.logChannelId);

      if (channel && channel.isText() && !channel.isThread()) {
        await sendLogMessage({
          channel: channel as TextChannel,
          doneBy: context.author,
          title: "User warnings cleared",
          message: `Cleared warnings for ${
            guildMember?.user.tag
              ? guildMember.user.tag
              : `<@${guildMember?.user.id}>`
          }.`,
        });
      }
    }

    await context.react(EMOJIS["GREEN_CHECKMARK"]);
  }
}
