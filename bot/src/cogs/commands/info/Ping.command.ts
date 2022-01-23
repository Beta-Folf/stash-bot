import { MessageEmbed } from "discord.js";

import { CommandCog, CommandRunArgs } from "~/framework/CommandCog";
import { EMBED_COLORS } from "~/constants/colors";

const BASE_EMBED = {
  color: EMBED_COLORS.BLURPLE,
};

export default class Ping extends CommandCog {
  constructor() {
    super({
      name: "ping",
      permissions: ["SEND_MESSAGES"],
    });
  }

  async run(args: CommandRunArgs) {
    const { client, context } = args;

    const embed = new MessageEmbed({
      ...BASE_EMBED,
      title: "Ping?",
      description: "Pinging...",
    });

    const sentMessage = await context.channel.send({
      embeds: [embed],
    });

    const messageLatencyMS = Date.now() - sentMessage.createdTimestamp;
    const apiLatencyMS = client.ws.ping;

    const updatedEmbed = new MessageEmbed({
      ...BASE_EMBED,
      title: "🏓 Pong!",
      fields: [
        {
          name: "Message Latency",
          value: `${messageLatencyMS}ms`,
        },
        {
          name: "API Latency",
          value: `${apiLatencyMS}ms`,
        },
      ],
    });

    await sentMessage.edit({
      embeds: [updatedEmbed],
    });
  }
}
