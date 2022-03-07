import { Prisma } from "@prisma/client";

import {
  CommandCog,
  CommandRunArgs,
  COMMAND_ARG_TYPE,
} from "~/framework/CommandCog";
import { EMOJIS } from "~/constants/emojis";
import { prisma } from "~/utils/db";

export default class RemoveVerificationChannel extends CommandCog {
  constructor() {
    super({
      name: "removeverificationchannel",
      nicks: [
        "rmverificationchannel",
        "removeverifychannel",
        "rmverifychannel",
        "removeidchannel",
        "rmidchannel",
      ],
      permissions: ["MANAGE_CHANNELS"],
      commandArgs: [
        {
          name: "channelId",
          type: COMMAND_ARG_TYPE.CHANNEL,
        },
      ],
    });
  }

  async run(args: CommandRunArgs) {
    const { client, context, commandArgs } = args;
    const { channelId } = commandArgs;

    const { guildId } = context;

    const channelIdAsString = channelId as string;

    // Check if guild settings exists
    const guildSettings = await prisma.guildSettings.findUnique({
      where: {
        id: guildId!,
      },
      select: {
        idVerificationChannel: true,
      },
    });

    if (!guildSettings) {
      await context.reply(
        "There is not an ID verification channel set for this server!"
      );
      return;
    }

    const { idVerificationChannel } = guildSettings;

    // Check if channel id is set as a vote channel
    if (idVerificationChannel !== channelIdAsString) {
      await context.reply(
        "The channel you passed is not an ID verification channel!"
      );
      return;
    }

    // Remove vote channel
    await prisma.guildSettings.update({
      where: {
        id: guildId!,
      },
      data: {
        idVerificationChannel: null,
      },
    });

    await context.react(EMOJIS["GREEN_CHECKMARK"]);
  }
}
