import {
  CommandCog,
  CommandRunArgs,
  COMMAND_ARG_TYPE,
} from "~/framework/CommandCog";
import { EMOJIS } from "~/constants/emojis";
import { prisma } from "~/utils/db";

export default class RemoveVerifyReactionEmoji extends CommandCog {
  constructor() {
    super({
      name: "removeverifyreactionemoji",
      nicks: [
        "rmverifyreactemoji",
        "removeverifyreactemoji",
        "rmverifyreactionemoji",
        "removeverifyreactionemoji",
      ],
      permissions: ["MANAGE_EMOJIS_AND_STICKERS"],
    });
  }

  async run(args: CommandRunArgs) {
    const { client, context } = args;

    const { guildId } = context;

    // Check if guild settings exists
    const guildSettings = await prisma.guildSettings.findUnique({
      where: {
        id: guildId!,
      },
      select: {
        idVerificationReactionEmoji: true,
      },
    });

    if (!guildSettings || !guildSettings.idVerificationReactionEmoji) {
      await context.reply(
        "There is no ID verification reaction emoji set for this server!"
      );
      return;
    }

    await prisma.guildSettings.update({
      where: {
        id: guildId!,
      },
      data: {
        idVerificationReactionEmoji: {
          set: null,
        },
      },
    });

    await context.react(EMOJIS["GREEN_CHECKMARK"]);
  }
}
