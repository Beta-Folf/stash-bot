import { Client, TextChannel } from "discord.js";
import { DateTime } from "luxon";

import { prisma } from "~/utils/db";
import { Logger, LOGGER_CATEGORY } from "~/utils/logger";

const BUMP_INTERVAL_MINUTES = 2;

export const bumpReminderJob = async (client: Client) => {
  const allGuilds = client.guilds.cache.each((guild) => guild);

  allGuilds.forEach(async (guild) => {
    const { id } = guild;

    const now = DateTime.now();
    const nowPlusInterval = now.plus({
      minute: BUMP_INTERVAL_MINUTES,
    });

    const guildSettings = await prisma.guildSettings.findFirst({
      where: {
        id,
        lastBumpedAt: {
          lte: nowPlusInterval.toISO(),
        },
      },
      select: {
        bumpChannelId: true,
        bumpRoleId: true,
      },
    });

    if (!guildSettings) {
      return;
    }

    const { bumpChannelId, bumpRoleId } = guildSettings;

    if (!bumpChannelId || !bumpRoleId) {
      return;
    }

    const channel = await client.channels.fetch(bumpChannelId);

    if (!channel) {
      return;
    }

    Logger.log({
      message: "Running bump reminder",
      category: LOGGER_CATEGORY.BACKGROUND_JOB,
    });

    await (channel as TextChannel).send(`<@&${bumpRoleId}> time to bump!`);

    await prisma.guildSettings.update({
      where: {
        id,
      },
      data: {
        lastBumpedAt: null,
      },
    });
  });
};
