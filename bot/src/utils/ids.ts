import { Client, User, AnyChannel } from "discord.js";

interface IDParsingArgs {
  value: string;
  client: Client;
}

export async function getUserIDFromMention({
  value,
  client,
}: IDParsingArgs): Promise<string | null> {
  const valueWithoutDecorations = value
    .replace("<@", "")
    .replace("!", "")
    .replace(">", "");

  if (valueWithoutDecorations.length === 0) {
    return null;
  }

  // Check if the user ID is valid
  let user: User | null = null;

  try {
    user = await client.users.fetch(valueWithoutDecorations);
  } catch {
    user = null;
  }

  if (!user) {
    return null;
  }

  return valueWithoutDecorations;
}
export async function getChannelIDFromLink({
  value,
  client,
}: IDParsingArgs): Promise<string | null> {
  const valueWithoutDecorations = value.replace("<#", "").replace(">", "");

  if (valueWithoutDecorations.length === 0) {
    return null;
  }

  // Check if the channel ID is valid
  let channel: AnyChannel | null = null;

  try {
    channel = await client.channels.fetch(valueWithoutDecorations);
  } catch {
    channel = null;
  }

  if (!channel) {
    return null;
  }

  return valueWithoutDecorations;
}
