import { Client } from "discord.js";

import { INTENTS } from "~/constants/intents";
import { Logger } from "~/utils/logger";

const bot = new Client({
  intents: INTENTS,
});

// TODO: Load cogs

bot.on("ready", () => {
  Logger.log("Bot ready!");
});

bot.login(process.env.TOKEN);
