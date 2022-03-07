import {
  CommandCog,
  CommandRunArgs,
  COMMAND_ARG_TYPE,
} from "~/framework/CommandCog";
import { EMOJIS } from "~/constants/emojis";
import { prisma } from "~/utils/db";

export default class SetQuarantineRole extends CommandCog {
  constructor() {
    super({
      name: "setquarantinerole",
      permissions: ["MANAGE_ROLES"],
      commandArgs: [
        {
          name: "roleId",
          type: COMMAND_ARG_TYPE.ROLE,
        },
      ],
    });
  }

  async run(args: CommandRunArgs) {
    const { client, context, commandArgs } = args;
    const { roleId } = commandArgs;

    const { guildId } = context;

    // We already do the channel ID validation in the
    // argument check so we don't need to check if the
    // channel is valid here
    const roleIdAsString = roleId as string;

    await prisma.guildSettings.upsert({
      where: {
        id: guildId!,
      },
      create: {
        id: guildId!,
        quarantineRoleId: roleIdAsString,
      },
      update: {
        quarantineRoleId: roleIdAsString,
      },
    });

    await context.react(EMOJIS["GREEN_CHECKMARK"]);
  }
}
