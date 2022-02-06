import { DateTime } from "luxon";

// 119 instead of 120 because the cron job always executes on the next minute
const BUMP_INTERVAL_MINUTES = 119;

export const generateBumpTime = (): string => {
  const now = DateTime.now();
  const nowPlusInterval = now.plus({
    minute: BUMP_INTERVAL_MINUTES,
  });

  return nowPlusInterval.toISO();
};
