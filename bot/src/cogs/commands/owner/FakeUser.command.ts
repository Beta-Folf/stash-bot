import { TextChannel } from "discord.js";

import {
  CommandCog,
  CommandRunArgs,
  COMMAND_ARG_TYPE,
} from "~/framework/CommandCog";

export default class FakeUser extends CommandCog {
  constructor() {
    super({
      name: "fakeuser",
      permissions: ["SEND_MESSAGES"],
      ownerOnly: true,
      commandArgs: [
        {
          name: "user",
          type: COMMAND_ARG_TYPE.USER,
        },
        {
          name: "message",
          type: COMMAND_ARG_TYPE.MULTI_STRING,
        },
      ],
    });
  }

  async run(args: CommandRunArgs) {
    const { client, context, commandArgs } = args;
    const { user, message } = commandArgs;

    const userData = await client.users.fetch(user as string);
    const messageAsString = message as string;

    if (!userData) {
      throw new Error(
        `Failed to get user information with the ID ${user as string}`
      );
    }

    const { username, avatarURL } = userData;

    await context.delete();

    const webhook = await (context.channel as TextChannel).createWebhook(
      username,
      {
        avatar: avatarURL({
          format: "png",
        }),
      }
    );

    await webhook.send({
      content: messageAsString,
    });
    await webhook.delete();
  }
}
