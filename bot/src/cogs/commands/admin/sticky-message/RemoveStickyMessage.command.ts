import { Prisma } from "@prisma/client";

import { CommandCog, CommandRunArgs } from "~/framework/CommandCog";
import { EMOJIS } from "~/constants/emojis";
import { prisma } from "~/utils/db";

export default class RemoveStickyMessage extends CommandCog {
  constructor() {
    super({
      name: "removestickymessage",
      nicks: ["rsm", "rmsm", "rmstickym", "rmsticky"],
      permissions: ["MANAGE_MESSAGES"],
    });
  }

  async run(args: CommandRunArgs) {
    const { client, context } = args;

    const { channelId } = context;

    try {
      await prisma.stickyMessage.delete({
        where: {
          id: channelId,
        },
      });

      await context.react(EMOJIS["GREEN_CHECKMARK"]);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
          case "P2025":
            await context.reply(
              "There is no sticky message set for this channel!"
            );
            break;
          default:
            throw error;
        }
      } else {
        throw error;
      }
    }
  }
}
