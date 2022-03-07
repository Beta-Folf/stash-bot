import {
  CommandCog,
  CommandRunArgs,
  COMMAND_ARG_TYPE,
} from "~/framework/CommandCog";
import { EMOJIS } from "~/constants/emojis";
import { prisma } from "~/utils/db";

export default class SetVerifyReactionEmoji extends CommandCog {
  constructor() {
    super({
      name: "setverifyreactionemoji",
      nicks: [
        "setverifyreactemoji",
        "setverificationreactemoji",
        "setidreactemoji",
        "setidreactionemoji",
      ],
      permissions: ["MANAGE_EMOJIS_AND_STICKERS"],
      commandArgs: [
        {
          name: "emoji",
          type: COMMAND_ARG_TYPE.EMOJI,
        },
      ],
    });
  }

  async run(args: CommandRunArgs) {
    const { client, context, commandArgs } = args;
    const { emoji } = commandArgs;

    const { guildId } = context;

    const emojiAsString = emoji as string;

    await prisma.guildSettings.upsert({
      where: {
        id: guildId!,
      },
      create: {
        id: guildId!,
        idVerificationReactionEmoji: emojiAsString,
      },
      update: {
        idVerificationReactionEmoji: emojiAsString,
      },
    });

    await context.react(EMOJIS["GREEN_CHECKMARK"]);
  }
}
