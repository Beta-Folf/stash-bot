import { Client } from "discord.js";
import { DateTime } from "luxon";

import { stopPoll } from "~/utils/poll";
import { prisma } from "~/utils/db";
import { Logger, LOGGER_CATEGORY } from "~/utils/logger";

export const closePollsJob = async (client: Client) => {
  /**
   * We should close any polls that are currently
   * in progress and the end at date has passed
   */
  const allPolls = await prisma.poll.findMany({
    where: {
      inProgress: true,
      endAt: {
        lte: DateTime.now().toISO(),
      },
    },
  });

  allPolls.forEach(async ({ id }) => {
    const result = await stopPoll({
      client,
      pollId: id,
    });

    if (result) {
      Logger.log({
        category: LOGGER_CATEGORY.BACKGROUND_JOB,
        message: `Closed poll ${id}`,
      });
    }
  });
};
