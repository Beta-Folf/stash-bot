import {
  CommandCog,
  CommandRunArgs,
  COMMAND_ARG_TYPE,
} from "~/framework/CommandCog";
import { EMOJIS } from "~/constants/emojis";
import { prisma } from "~/utils/db";
import { stopPoll } from "~/utils/poll";

export default class StopPoll extends CommandCog {
  constructor() {
    super({
      name: "stoppoll",
      nicks: ["endpoll", "closepoll"],
      permissions: ["MANAGE_MESSAGES"],
      commandArgs: [
        {
          name: "pollId",
          type: COMMAND_ARG_TYPE.NUMBER,
        },
      ],
    });
  }

  async run(args: CommandRunArgs) {
    const { client, context, commandArgs } = args;
    const { pollId } = commandArgs;

    const pollIdAsString = pollId as number;

    // Check if poll ID is valid
    const pollExists = await prisma.poll.findUnique({
      where: {
        id: pollIdAsString,
      },
      select: {
        inProgress: true,
      },
    });

    if (!pollExists) {
      await context.reply("A poll with that ID does not exist!");
      return;
    }

    if (!pollExists.inProgress) {
      await context.reply("That poll is not in progress!");
      return;
    }

    // Close poll
    await stopPoll({
      pollId: pollIdAsString,
      client,
    });

    // React to command message
    await context.react(EMOJIS["GREEN_CHECKMARK"]);
  }
}
