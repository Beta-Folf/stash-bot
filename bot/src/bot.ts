import { Client, Message } from "discord.js";
import fs from "fs";
import path from "path";

import { ImportedCommandCog } from "~/framework/CommandCog";
import {
  HUMAN_READABLE_ARGUMENT_VALIDATION_ERRORS,
  ARGUMENT_VALIDATION_ERRORS,
} from "~/framework/CommandError";
import { checkCommandExecution } from "~/framework/commandHandler";
import { CommandError } from "~/framework/CommandError";
import { Logger, LOGGER_CATEGORY } from "~/utils/logger";
import { INTENTS } from "~/constants/intents";
import { EMOJIS } from "~/constants/emojis";

const bot = new Client({
  intents: INTENTS,
});

const commands: ImportedCommandCog[] = [];

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
          // Check cog type
          const splitFileName = file.split(".");
          const cogType = splitFileName[1]?.toLowerCase();

          if (cogType === "event") {
            /**
             * Load event cog by creating an instance of the default
             * class export
             */
            const CogClass = require(filePath);

            new CogClass.default(bot);
          } else if (cogType === "command") {
            /**
             * Load command cog by adding its details to the
             * commands array
             */
            const CommandClass = require(filePath);

            const cmdCog = new CommandClass.default();

            commands.push({
              run: cmdCog.run,
              settings: cmdCog.settings,
            });
          } else {
            throw new Error("Cog is not an event or command");
          }

          Logger.info(`Successfully loaded event cog ${file}`);
        } catch (error) {
          Logger.error(`Failed to load cog ${file}. ${error}`);
        }
      } else if ([".tsx", ".jsx"].includes(fileExtension.toLowerCase())) {
        Logger.error({
          message: `Failed to load cog ${file}. You tried creating a React file idiot!`,
          category: LOGGER_CATEGORY.COMMAND,
        });
      }
    }
  });
}

// Command listener
bot.on("messageCreate", async (message: Message) => {
  if (message.author.bot) {
    return;
  }
  if (message.channel.type === "DM" || !message.guild) {
    return;
  }

  try {
    const result = await checkCommandExecution({
      client: bot,
      message,
      commands,
    });

    if (result) {
      const { run, runArgs } = result;

      await run(runArgs);
    }
  } catch (error) {
    if (error instanceof CommandError) {
      await message.reply(
        HUMAN_READABLE_ARGUMENT_VALIDATION_ERRORS[error.message]
      );

      if (!ARGUMENT_VALIDATION_ERRORS[error.message]) {
        Logger.error({
          message: `Failed to run command "${error.commandName}"\n${error.stack}`,
          user: message.author,
          category: LOGGER_CATEGORY.COMMAND,
        });
      }
    } else {
      await message.react(EMOJIS["RED_X"]);

      const errorAsError = error as Error;

      Logger.error({
        message: `${errorAsError.name}\n${errorAsError.message}\n${errorAsError.stack}`,
        user: message.author,
        category: LOGGER_CATEGORY.COMMAND,
      });
    }
  }
});

loadCogs(path.join(__dirname, "./cogs"));

// Login once the cogs are all loaded
bot.login(process.env.TOKEN);
