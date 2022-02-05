import { CommandCog, CommandRunArgs } from "~/framework/CommandCog";
import { EMOJIS } from "~/constants/emojis";
import { prisma } from "~/utils/db";

export default class ClearBumpTime extends CommandCog {
  constructor() {
    super({
      name: "clearbumptime",
      nicks: ["clearbumpertime"],
      permissions: ["MANAGE_MESSAGES"],
    });
  }

  async run(args: CommandRunArgs) {
    const { context } = args;

    const { guildId } = context;

    const guildSettings = await prisma.guildSettings.findUnique({
      where: {
        id: guildId!,
      },
    });

    if (guildSettings) {
      await prisma.guildSettings.update({
        where: {
          id: guildId!,
        },
        data: {
          sendBumpPingAt: null,
        },
      });
    }

    await context.react(EMOJIS["GREEN_CHECKMARK"]);
  }
}
