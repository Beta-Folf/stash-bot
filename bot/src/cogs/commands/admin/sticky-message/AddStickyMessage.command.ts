import {
  CommandCog,
  CommandRunArgs,
  COMMAND_ARG_TYPE,
} from "~/framework/CommandCog";
import { EMOJIS } from "~/constants/emojis";
import { prisma } from "~/utils/db";

export default class AddStickyMessage extends CommandCog {
  constructor() {
    super({
      name: "addstickymessage",
      nicks: ["asm", "addsm", "addstickym", "addsticky"],
      permissions: ["MANAGE_MESSAGES"],
      commandArgs: [
        {
          name: "messageContent",
          type: COMMAND_ARG_TYPE.MULTI_STRING,
        },
      ],
    });
  }

  async run(args: CommandRunArgs) {
    const { client, context, commandArgs } = args;
    const { messageContent } = commandArgs;

    const { channelId } = context;

    const messageContentAsString = messageContent as string;

    await prisma.stickyMessage.upsert({
      where: {
        id: channelId,
      },
      create: {
        id: channelId,
        messageContent: messageContentAsString,
      },
      update: {
        messageContent: messageContentAsString,
      },
    });

    await context.react(EMOJIS["GREEN_CHECKMARK"]);
  }
}
