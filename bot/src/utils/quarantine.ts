import { Client, GuildMember, TextChannel } from "discord.js";

interface ISendQuarantineAlertArgs {
  client: Client;
  channelId: string;
  member: GuildMember;
}

export async function sendQuarantineAlert(args: ISendQuarantineAlertArgs) {
  const { client, channelId, member } = args;

  const channel = await client.channels.fetch(channelId);

  if (!channel || !channel.isText) {
    return;
  }

  try {
    await (channel as TextChannel).send(
      `<@${member.user.id}> has been quarantined!`
    );
  } catch {}
}
