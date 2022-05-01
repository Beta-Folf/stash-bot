import {
  CommandCog,
  CommandRunArgs,
  COMMAND_ARG_TYPE,
} from "~/framework/CommandCog";
import { EMOJIS } from "~/constants/emojis";
import { prisma } from "~/utils/db";
import { sendLogMessage } from "~/utils/logs";
import { EmbedField, GuildMember, MessageEmbed, TextChannel } from "discord.js";
import { DateTime } from "luxon";
import { EMBED_COLORS } from "~/constants/colors";

export default class WarnUser extends CommandCog {
  constructor() {
    super({
      name: "warn",
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

    let guildMember: GuildMember | undefined;

    try {
      guildMember = await guild.members.fetch(userIdAsString);
    } catch {}

    const originalUserWarnings = await prisma.warnings.findMany({
      where: {
        userId: userIdAsString,
      },
    });

    await prisma.warnings.create({
      data: {
        userId: userIdAsString,
        reason: reason?.toString() || null,
        warnedByUserId: context.author.id,
        issuedAt: DateTime.now().toJSDate(),
      },
    });

    try {
      const fields: EmbedField[] = [
        {
          name: "Warned By",
          value: context.author.tag,
          inline: true,
        },
      ];

      if (reason) {
        fields.push({
          name: "Reason",
          value: reason.toString(),
          inline: true,
        });
      }

      const dmEmbed = new MessageEmbed({
        color: EMBED_COLORS.BETA_BLUE,
        title: `You've been warned in The Stash`,
        timestamp: new Date(),
        fields,
      });

      await guildMember?.send({
        embeds: [dmEmbed],
      });
    } catch {}

    if (guildSettings?.logChannelId) {
      const channel = await guild.channels.fetch(guildSettings.logChannelId);

      if (channel && channel.isText() && !channel.isThread()) {
        await sendLogMessage({
          channel: channel as TextChannel,
          doneBy: context.author,
          title: "User warned",
          message: `User ${
            guildMember?.user.tag
              ? guildMember.user.tag
              : `<@${guildMember?.user.id}>`
          } warned. ${reason && `Reason: ${reason.toString()}`}`,
        });
      }
    }

    // If user already has three warnings, we give them a warning then ban them for a month
    if (originalUserWarnings.length >= 2) {
      try {
        await guild.bans.create(userIdAsString, {
          reason: "User reached maximum warnings",
        });

        await context.reply(
          "User has three warnings and was banned for a month"
        );

        // Clear the user's warnings
        await prisma.warnings.deleteMany({
          where: {
            userId: userIdAsString,
          },
        });

        if (guildSettings?.logChannelId) {
          const channel = await guild.channels.fetch(
            guildSettings.logChannelId
          );

          if (channel && channel.isText() && !channel.isThread()) {
            await sendLogMessage({
              channel: channel as TextChannel,
              doneBy: context.author,
              title: "User temp banned",
              message: `User ${
                guildMember?.user.tag
                  ? guildMember.user.tag
                  : `<@${guildMember?.user.id}>`
              } hit 3 warnings and was banned for a month`,
            });
          }
        }
      } catch (error) {
        await context.reply("User has three warnings but failed to ban them");

        return;
      }
    }

    await context.react(EMOJIS["GREEN_CHECKMARK"]);
  }
}
