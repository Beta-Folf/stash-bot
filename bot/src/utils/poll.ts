import { Client, Message, MessageEmbed, TextChannel } from "discord.js";

import { prisma } from "./db";
import { EMBED_COLORS } from "~/constants/colors";
import { Logger } from "./logger";
import { EMOJIS } from "~/constants/emojis";

interface StopPollArgs {
  pollId: number;
  client: Client;
}

export const stopPoll = async ({
  pollId,
  client,
}: StopPollArgs): Promise<boolean> => {
  const pollData = await prisma.poll.findUnique({
    where: {
      id: pollId,
    },
    select: {
      pollMessageId: true,
      guildId: true,
      content: true,
    },
  });

  if (!pollData) {
    return false;
  }

  const { pollMessageId, guildId, content: pollContent } = pollData;

  // Get the poll channel ID
  const guildSettings = await prisma.guildSettings.findUnique({
    where: {
      id: guildId,
    },
    select: {
      pollChannelId: true,
    },
  });

  if (!guildSettings) {
    return false;
  }

  const { pollChannelId } = guildSettings;

  if (!pollChannelId) {
    return false;
  }

  let message: Message | undefined = undefined;

  try {
    const pollChannel = (await client.channels.fetch(
      pollChannelId
    )) as TextChannel;
    message = await pollChannel.messages.fetch(pollMessageId);
  } catch {
    Logger.error(
      `Failed to fetch the poll message with the ID of ${pollMessageId}`
    );
  }

  if (!message) {
    return false;
  }

  // Calculate results. Make sure to subtract one for bot
  const upvoteReactions = await message.reactions.resolve(EMOJIS["UP_ARROW"]);
  const downvoteReactions = await message.reactions.resolve(
    EMOJIS["DOWN_ARROW"]
  );

  if (!upvoteReactions || !downvoteReactions) {
    return false;
  }

  // Subtract one to account for the bot
  const upvoteTotal = upvoteReactions.count - 1;
  const downvoteTotal = downvoteReactions.count - 1;
  const voteTotal = upvoteTotal + downvoteTotal;
  const upvotePercent = Math.round((upvoteTotal / voteTotal) * 100);
  const downvotePercent = Math.round((downvoteTotal / voteTotal) * 100);

  /**
   * If it's a tie, the color is gray
   * If yes wins, the color is green
   * If no wins, the color is red
   */
  let color = EMBED_COLORS.GRAYPLE;
  if (upvoteTotal > downvoteTotal) {
    color = EMBED_COLORS.GREEN;
  } else if (upvoteTotal < downvoteTotal) {
    color = EMBED_COLORS.RED;
  }

  // Update message
  const embed = new MessageEmbed({
    color,
    title: "Poll Closed!",
    description: pollContent,
    fields: [
      {
        name: "Yes",
        value: `${isNaN(upvotePercent) ? "0" : upvotePercent}%`,
        inline: true,
      },
      {
        name: "No",
        value: `${isNaN(downvotePercent) ? "0" : downvotePercent}%`,
        inline: true,
      },
    ],
  });

  await message.edit({
    embeds: [embed],
  });

  // Update database
  await prisma.poll.update({
    where: {
      id: pollId,
    },
    data: {
      inProgress: false,
      votedYes: upvoteTotal,
      votedNo: downvoteTotal,
    },
  });

  return true;
};
