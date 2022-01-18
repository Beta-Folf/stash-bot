import { Client } from "discord.js";
import fs from "fs";
import path from "path";

import { INTENTS } from "~/constants/intents";
import { Logger } from "~/utils/logger";

const bot = new Client({
  intents: INTENTS,
});

function loadCogs(baseDirectory: string) {
  fs.readdirSync(baseDirectory).forEach((file) => {
    const filePath = path.join(baseDirectory, file);
    const fileStats = fs.statSync(filePath);

    // If the file is a directory, recursively call this function
    if (fileStats.isDirectory()) {
      loadCogs(filePath);
    } else {
      // File is a file, try to load it

      // Check file extension
      const fileExtension = path.extname(filePath);

      if ([".ts", ".js"].includes(fileExtension.toLowerCase())) {
        try {
          const CogClass = require(filePath);

          new CogClass.default(bot);

          Logger.info(`Successfully loaded cog ${file}`);
        } catch (error) {
          Logger.error(`Failed to load cog ${file}. ${error}`);
        }
      } else if ([".tsx", ".jsx"].includes(fileExtension.toLowerCase())) {
        Logger.error(
          `Failed to load cog ${file}. You tried creating a React file idiot!`
        );
      }
    }
  });
}

loadCogs(path.join(__dirname, "./cogs"));

// Login once the cogs are all loaded
bot.login(process.env.TOKEN);
