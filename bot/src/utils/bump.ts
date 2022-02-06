import { DateTime } from "luxon";

const BUMP_INTERVAL_MINUTES = 120;

export const generateBumpTime = (): string => {
  const now = DateTime.now();
  const nowPlusInterval = now.plus({
    minute: BUMP_INTERVAL_MINUTES,
  });

  return nowPlusInterval.toISO();
};
