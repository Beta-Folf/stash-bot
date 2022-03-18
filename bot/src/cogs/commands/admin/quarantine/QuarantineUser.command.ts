import {
  CommandCog,
  CommandRunArgs,
  COMMAND_ARG_TYPE,
} from "~/framework/CommandCog";
import { EMOJIS } from "~/constants/emojis";
import { prisma } from "~/utils/db";
import { sendQuarantineAlert } from "~/utils/quarantine";

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
        quarantineAlertChannelId: true,
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

    const { quarantineRoleId, quarantineAlertChannelId } = guildSettings;

    await guildMember.roles.add([quarantineRoleId]);

    if (quarantineAlertChannelId) {
      await sendQuarantineAlert({
        client,
        channelId: quarantineAlertChannelId,
        member: guildMember,
      });
    }

    await context.react(EMOJIS["GREEN_CHECKMARK"]);
  }
}
