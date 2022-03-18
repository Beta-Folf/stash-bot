import {
  CommandCog,
  CommandRunArgs,
  COMMAND_ARG_TYPE,
} from "~/framework/CommandCog";
import { EMOJIS } from "~/constants/emojis";
import { prisma } from "~/utils/db";

export default class SetQuarantineAlertChannel extends CommandCog {
  constructor() {
    super({
      name: "setquarantinealertchannel",
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

    // We already do the channel ID validation in the
    // argument check so we don't need to check if the
    // channel is valid here
    const channelIdAsString = channelId as string;

    await prisma.guildSettings.upsert({
      where: {
        id: guildId!,
      },
      create: {
        id: guildId!,
        quarantineAlertChannelId: channelIdAsString,
      },
      update: {
        quarantineAlertChannelId: channelIdAsString,
      },
    });

    await context.react(EMOJIS["GREEN_CHECKMARK"]);
  }
}
