import { CommandCog, CommandRunArgs } from "~/framework/CommandCog";
import { USERS } from "~/constants/users";

export default class Femboy extends CommandCog {
  constructor() {
    super({
      name: "femboy",
      permissions: ["SEND_MESSAGES"],
    });
  }

  async run(args: CommandRunArgs) {
    const { client, context } = args;

    const femboyUser = await client.users.fetch(USERS.SYMFIZ);

    await context.channel.send(`<@${femboyUser.id}>`);
  }
}
