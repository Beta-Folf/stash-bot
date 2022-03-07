import {
  CommandCog,
  CommandRunArgs,
  COMMAND_ARG_TYPE,
} from "~/framework/CommandCog";
import { EMOJIS } from "~/constants/emojis";
import { prisma } from "~/utils/db";

export default class QuarantineUser extends CommandCog {
  constructor() {
    super({
      name: "quarantine",
      permissions: ["MANAGE_ROLES"],
      commandArgs: [
        {
          name: "userId",
          type: COMMAND_ARG_TYPE.USER,
        },
      ],
    });
  }

  async run(args: CommandRunArgs) {
    const { client, context, commandArgs } = args;
    const { userId } = commandArgs;

    const { guildId, guild } = context;

    const userIdAsString = userId as string;

    if (!guildId || !guild) {
      return;
    }

    const guildSettings = await prisma.guildSettings.findUnique({
      where: {
        id: guildId,
      },
      select: {
        quarantineRoleId: true,
      },
    });

    if (!guildSettings || !guildSettings.quarantineRoleId) {
      await context.reply("There is no quarantine role set for this server!");

      return;
    }

    const guildMember = await guild.members.fetch(userIdAsString);

    if (!guildMember) {
      await context.reply("User not found!");

      return;
    }

    await guildMember.roles.add([guildSettings.quarantineRoleId]);

    await context.react(EMOJIS["GREEN_CHECKMARK"]);
  }
}
