import {
  CommandCog,
  CommandRunArgs,
  COMMAND_ARG_TYPE,
} from "~/framework/CommandCog";
import { EMOJIS } from "~/constants/emojis";
import { prisma } from "~/utils/db";
import { getMessage } from "~/utils/messages";

export default class SetVerifyReactionMessage extends CommandCog {
  constructor() {
    super({
      name: "setverifyreactionmessage",
      nicks: ["setverifyreactmessage"],
      permissions: ["MANAGE_MESSAGES"],
      commandArgs: [
        {
          name: "messageLink",
          type: COMMAND_ARG_TYPE.MESSAGE_URL,
        },
      ],
    });
  }

  async run(args: CommandRunArgs) {
    const { client, context, commandArgs } = args;
    const { messageLink } = commandArgs;

    const { guildId } = context;

    /**
     * We already check if this a valid message in the
     * command handler, so we know this is not null
     */
    const message = (await getMessage({
      client,
      url: messageLink as string,
    }))!;

    const { id, channelId } = message;

    const updateQuery = {
      idVerificationReactionMessage: id,
      idVerificationReactionMessageChannel: channelId,
    };

    await prisma.guildSettings.upsert({
      where: {
        id: guildId!,
      },
      create: {
        id: guildId!,
        ...updateQuery,
      },
      update: updateQuery,
    });

    await context.react(EMOJIS["GREEN_CHECKMARK"]);
  }
}
