import { DateTime } from "luxon";

import { prisma } from "~/utils/db";
import { Logger, LOGGER_CATEGORY } from "~/utils/logger";

export const clearWarnings = async () => {
  const oneMonthAgo = DateTime.now()
    .minus({
      month: 1,
    })
    .toJSDate();

  const { count: amountDeleted } = await prisma.warnings.deleteMany({
    where: {
      issuedAt: {
        lte: oneMonthAgo,
      },
    },
  });

  if (amountDeleted > 0) {
    Logger.info({
      message: `Deleted ${amountDeleted} warnings`,
      category: LOGGER_CATEGORY.BACKGROUND_JOB,
    });
  }
};
