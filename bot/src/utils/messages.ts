import { Client, Message, TextChannel } from "discord.js";

interface IGetMessageArgs {
  url: string;
  client: Client;
}

export const getMessage = async ({
  url,
  client,
}: IGetMessageArgs): Promise<Message | null> => {
  const splitURL = url.split("/");
  const messageID = splitURL[splitURL.length - 1];
  const channelID = splitURL[splitURL.length - 2];

  // Get the channel
  const channel = (await client.channels.fetch(channelID)) as TextChannel;

  if (!channel) {
    return null;
  }

  // Get the message
  const message = await channel.messages.fetch(messageID);

  if (!message) {
    return null;
  }

  return message;
};
