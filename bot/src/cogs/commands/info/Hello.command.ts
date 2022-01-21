import {
  CommandCog,
  COMMAND_ARG_TYPE,
  CommandRunArgs,
} from "~/framework/CommandCog";

export default class Hello extends CommandCog {
  constructor() {
    super({
      name: "hello",
      nicks: ["h", "bruh"],
      commandArgs: [
        {
          name: "name",
          type: COMMAND_ARG_TYPE.USER,
        },
        {
          name: "second",
          type: COMMAND_ARG_TYPE.BOOLEAN,
        },
      ],
      ownerOnly: false,
      permissions: ["SEND_MESSAGES"],
    });
  }

  async run(args: CommandRunArgs) {
    const { client, context, commandArgs } = args;
    const { name, second } = commandArgs;

    const user = await client.users.fetch(name as string);

    await context.channel.send(`Hello, ${user?.username}! ${second && second}`);
  }
}
