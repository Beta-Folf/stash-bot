import { MessageEmbed } from "discord.js";

import { CommandCog, CommandRunArgs } from "~/framework/CommandCog";
import { EMBED_COLORS } from "~/constants/colors";
import { CONFIG } from "~/constants/config";
import { URLS } from "~/constants/urls";
import { generateAvatarURL, getUserTagAndAvatarURL } from "~/utils/users";

const packageJson = require("@packagejson");

export default class About extends CommandCog {
  constructor() {
    super({
      name: "about",
      permissions: ["SEND_MESSAGES"],
    });
  }

  async run(args: CommandRunArgs) {
    const { client, context } = args;

    const { tag: authorTag } = await getUserTagAndAvatarURL({
      client,
      userId: CONFIG.OWNER_ID,
    });
    const thumbnailURL = generateAvatarURL(client.user!);

    const embed = new MessageEmbed({
      color: EMBED_COLORS.BLURPLE,
      title: "About",
      thumbnail: {
        url: thumbnailURL,
      },
      description: URLS.GITHUB_REPOSITORY,
      fields: [
        {
          name: "Author",
          value: authorTag,
          inline: true,
        },
        {
          name: "Version",
          value: `v.) ${packageJson.version}`,
          inline: true,
        },
        {
          name: "Built using",
          value: `Node.js, JavaScript, TypeScript, and Docker`,
        },
        {
          name: "Deployed on",
          value: "Digital Ocean droplet",
        },
      ],
    });

    await context.channel.send({
      embeds: [embed],
    });
  }
}
