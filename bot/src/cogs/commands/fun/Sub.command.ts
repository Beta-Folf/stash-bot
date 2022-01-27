import { CommandCog, CommandRunArgs } from "~/framework/CommandCog";
import { USERS } from "~/constants/users";

export default class Sub extends CommandCog {
  constructor() {
    super({
      name: "sub",
      nicks: ["submissive", "breedable", "bottom"],
      permissions: ["SEND_MESSAGES"],
    });
  }

  async run(args: CommandRunArgs) {
    const { client, context } = args;

    const subUser = await client.users.fetch(USERS.TOTALLY_A_FOX);

    await context.channel.send(`<@${subUser.id}>`);
  }
}
