import { EmbedFieldData, GuildMember, MessageEmbed } from "discord.js";
import { DateTime } from "luxon";

import {
  CommandCog,
  CommandRunArgs,
  COMMAND_ARG_TYPE,
} from "~/framework/CommandCog";
import { EMOJIS } from "~/constants/emojis";
import { prisma } from "~/utils/db";
import { EMBED_COLORS } from "~/constants/colors";
import { generateAvatarURL } from "~/utils/users";

export default class ListWarns extends CommandCog {
  constructor() {
    super({
      name: "listwarns",
      nicks: ["listwarnings", "showwarns", "showwarnings", "warns", "warnings"],
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

    let guildMember: GuildMember | undefined;

    try {
      guildMember = await guild.members.fetch(userIdAsString);
    } catch {}

    if (!guildMember) {
      return;
    }

    const warnings = await prisma.warnings.findMany({
      where: {
        userId: userIdAsString,
      },
      orderBy: {
        issuedAt: "desc",
      },
    });

    if (warnings.length === 0) {
      await context.reply("That user has no warnings!");

      return;
    }

    const warningFields: EmbedFieldData[] = [];

    for (const warning of warnings) {
      let adminDetails: GuildMember | undefined;

      try {
        adminDetails = await guild.members.fetch(warning.warnedByUserId);
      } catch {}

      warningFields.push({
        name: "Reason",
        value: warning.reason ?? "`No reason given`",
        inline: true,
      });
      warningFields.push({
        name: "Issued At",
        value: DateTime.fromJSDate(warning.issuedAt).toISO(),
        inline: true,
      });
      warningFields.push({
        name: "Issued By",
        value: adminDetails?.user.tag || warning.warnedByUserId,
        inline: true,
      });
    }

    const embed = new MessageEmbed({
      color: EMBED_COLORS.BETA_BLUE,
      title: `Warnings for ${guildMember.user.username}`,
      timestamp: new Date(),
      fields: warningFields,
      thumbnail: {
        url: generateAvatarURL(guildMember.user),
      },
    });

    await context.channel.send({
      embeds: [embed],
    });
  }
}
