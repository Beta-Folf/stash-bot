import { EMOJIS } from "~/constants/emojis";

import { CommandCog, CommandRunArgs } from "~/framework/CommandCog";
import { prisma } from "~/utils/db";

export default class ResetBump extends CommandCog {
  constructor() {
    super({
      name: "resetbump",
      permissions: ["SEND_MESSAGES"],
      ownerOnly: true,
    });
  }

  async run(args: CommandRunArgs) {
    const { client, context, commandArgs } = args;

    const { guildId } = context;

    if (!guildId) {
      return;
    }

    const existingGuild = await prisma.guildSettings.findUnique({
      where: {
        id: guildId,
      },
    });

    if (!existingGuild) {
      await context.reply("This guild has no guild settings!");

      return;
    }

    await prisma.guildSettings.update({
      where: {
        id: guildId,
      },
      data: {
        isBumped: null,
        lastBumpedAt: null,
      },
    });

    await context.react(EMOJIS["GREEN_CHECKMARK"]);
  }
}
