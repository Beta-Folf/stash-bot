import { MessageEmbed } from "discord.js";

import { CommandCog, CommandRunArgs } from "~/framework/CommandCog";
import { EMBED_COLORS } from "~/constants/colors";
import { CONFIG } from "~/constants/config";
import { URLS } from "~/constants/urls";
import { CommandError } from "~/framework/CommandError";

const BASE_EMBED = {
  color: EMBED_COLORS.BETA_BLUE,
};

export default class Author extends CommandCog {
  constructor() {
    super({
      name: "author",
      permissions: ["SEND_MESSAGES"],
    });
  }

  async run(args: CommandRunArgs) {
    const { client, context } = args;

    const ownerInformation = await client.users.fetch(CONFIG.OWNER_ID);
    const defaultAvatarURL = `${URLS.BASE_DISCORD_CDN}/embed/avatars/${
      parseInt(ownerInformation.discriminator) % 5
    }.png`;

    if (ownerInformation) {
      const embed = new MessageEmbed({
        ...BASE_EMBED,
        title: "Gay retard",
        description: `${ownerInformation.tag}`,
        thumbnail: {
          url: ownerInformation.avatarURL() || defaultAvatarURL,
        },
      });

      context.channel.send({
        embeds: [embed],
      });
    } else {
      throw new Error(
        `Failed to get owner information with the ID ${CONFIG.OWNER_ID}`
      );
    }
  }
}
