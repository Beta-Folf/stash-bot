import { MessageEmbed } from "discord.js";

import { CommandCog, CommandRunArgs } from "~/framework/CommandCog";
import { prisma } from "~/utils/db";
import { EMBED_COLORS } from "~/constants/colors";

export default class ListPolls extends CommandCog {
  constructor() {
    super({
      name: "listpolls",
      nicks: ["polls", "showpolls"],
      permissions: ["MANAGE_CHANNELS"],
    });
  }

  async run(args: CommandRunArgs) {
    const { client, context } = args;

    const { guildId } = context;

    const polls = await prisma.poll.findMany({
      where: {
        guildId: guildId!,
        inProgress: true,
      },
      orderBy: {
        endAt: "desc",
      },
      select: {
        id: true,
        content: true,
      },
      take: 20,
    });

    let description = "No polls in progress!";

    if (polls.length > 0) {
      description = "```ID | Content\n";
      description += polls
        .map(({ id, content }) => `${id} - ${content}`)
        .join("\n");
      description += "```";
    }

    const embed = new MessageEmbed({
      color: EMBED_COLORS.BLURPLE,
      title: "Ongoing Polls",
      description,
      timestamp: new Date(),
    });

    await context.channel.send({
      embeds: [embed],
    });
  }
}
