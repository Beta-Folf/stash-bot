import { CommandCog, CommandRunArgs } from "~/framework/CommandCog";
import { USERS } from "~/constants/users";

export default class Gay extends CommandCog {
  constructor() {
    super({
      name: "gay",
      nicks: ["fag", "faggot", "subbyboy"],
      permissions: ["SEND_MESSAGES"],
    });
  }

  async run(args: CommandRunArgs) {
    const { client, context } = args;

    const gayUser = await client.users.fetch(USERS.ARTY);

    await context.channel.send(`<@${gayUser.id}>`);
  }
}
