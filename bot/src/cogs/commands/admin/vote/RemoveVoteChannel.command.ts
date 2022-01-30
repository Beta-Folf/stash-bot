import { Prisma } from "@prisma/client";

import {
  CommandCog,
  CommandRunArgs,
  COMMAND_ARG_TYPE,
} from "~/framework/CommandCog";
import { EMOJIS } from "~/constants/emojis";
import { prisma } from "~/utils/db";

export default class RemoveVoteChannel extends CommandCog {
  constructor() {
    super({
      name: "removevotechannel",
      nicks: ["rmvotechannel"],
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
        voteChannels: true,
      },
    });

    if (!guildSettings) {
      await context.reply("There are no vote channels set for this server!");
      return;
    }

    const { voteChannels } = guildSettings;

    // Check if channel id is set as a vote channel
    if (!voteChannels.includes(channelIdAsString)) {
      await context.reply("The channel you passed is not a vote channel!");
      return;
    }

    const updatedVoteChannels = voteChannels.filter(
      (channel) => channel !== channelIdAsString
    );

    // Remove vote channel
    await prisma.guildSettings.update({
      where: {
        id: guildId!,
      },
      data: {
        voteChannels: {
          set: updatedVoteChannels,
        },
      },
    });

    await context.react(EMOJIS["GREEN_CHECKMARK"]);
  }
}
