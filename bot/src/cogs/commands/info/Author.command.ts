import { MessageEmbed } from "discord.js";

import { CommandCog, CommandRunArgs } from "~/framework/CommandCog";
import { EMBED_COLORS } from "~/constants/colors";
import { CONFIG } from "~/constants/config";
import { getUserTagAndAvatarURL } from "~/utils/users";

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

    const ownerInformation = await getUserTagAndAvatarURL({
      client,
      userId: CONFIG.OWNER_ID,
    });

    const { tag, avatarURL } = ownerInformation;

    const embed = new MessageEmbed({
      ...BASE_EMBED,
      title: "Gay retard",
      description: `${tag}`,
      thumbnail: {
        url: avatarURL,
      },
    });

    context.channel.send({
      embeds: [embed],
    });
  }
}
