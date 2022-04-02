import { User, TextChannel, MessageEmbed } from "discord.js";

import { EMBED_COLORS } from "~/constants/colors";

interface ISendLogMessageArgs {
  channel: TextChannel;
  title: string;
  message: string;
  doneBy: User;
}

export const sendLogMessage = async (args: ISendLogMessageArgs) => {
  const { channel, title, message, doneBy } = args;

  const embed = new MessageEmbed({
    color: EMBED_COLORS.BETA_BLUE,
    title,
    description: message,
    footer: {
      text: `Action done by ${doneBy.tag}`,
    },
    timestamp: new Date(),
  });

  await channel.send({
    embeds: [embed],
  });
};
