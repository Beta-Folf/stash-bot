import { MessageEmbed } from "discord.js";
import prettyMS from "pretty-ms";

import { CommandCog, CommandRunArgs } from "~/framework/CommandCog";
import { EMBED_COLORS } from "~/constants/colors";

const BASE_EMBED = {
  color: EMBED_COLORS.BLURPLE,
};

export default class Uptime extends CommandCog {
  constructor() {
    super({
      name: "uptime",
      permissions: ["SEND_MESSAGES"],
    });
  }

  async run(args: CommandRunArgs) {
    const { client, context } = args;

    const uptime = prettyMS(client.uptime!, {
      compact: true,
    });

    const embed = new MessageEmbed({
      ...BASE_EMBED,
      title: "I haven't slept in",
      description: uptime,
    });

    await context.channel.send({
      embeds: [embed],
    });
  }
}
