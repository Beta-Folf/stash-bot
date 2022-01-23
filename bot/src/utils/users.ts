import { Client, User } from "discord.js";

import { URLS } from "~/constants/urls";

export const getUserTagAndAvatarURL = async (args: {
  client: Client;
  userId: string;
}): Promise<{ tag: string; avatarURL: string }> => {
  const { client, userId } = args;

  const userInformation = await client.users.fetch(userId);

  if (userInformation) {
    const avatarURL = generateAvatarURL(userInformation);

    return {
      tag: userInformation.tag,
      avatarURL,
    };
  } else {
    throw new Error(`Failed to get owner information with the ID ${userId}`);
  }
};

export const generateAvatarURL = (user: User): string => {
  return (
    user.avatarURL() ||
    `${URLS.BASE_DISCORD_CDN}/embed/avatars/${
      parseInt(user.discriminator) % 5
    }.png`
  );
};
