import { Client, Message } from "discord.js";
import fs from "fs";
import path from "path";
import cron from "node-cron";

import { ImportedCommandCog } from "~/framework/CommandCog";
import {
  FURRY_READABLE_ARGUMENT_VALIDATION_ERRORS,
  ARGUMENT_VALIDATION_ERRORS,
  CustomValidatorError,
} from "~/framework/CommandError";
import { checkCommandExecution } from "~/framework/commandHandler";
import { CommandError } from "~/framework/CommandError";
import { Logger, LOGGER_CATEGORY } from "~/utils/logger";
import { INTENTS } from "~/constants/intents";
import { EMOJIS } from "~/constants/emojis";
import { closePollsJob } from "~/jobs/closePolls";
import { bumpReminderJob } from "~/jobs/bumpReminder";

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

          Logger.info({
            message: `Successfully loaded event cog ${file}`,
            category: LOGGER_CATEGORY.COMMAND,
          });
        } catch (error) {
          Logger.info({
            message: `Failed to load cog ${file}. ${error}`,
            category: LOGGER_CATEGORY.COMMAND,
          });
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
        FURRY_READABLE_ARGUMENT_VALIDATION_ERRORS[error.message]
      );

      if (!ARGUMENT_VALIDATION_ERRORS[error.message]) {
        Logger.error({
          message: `Failed to run command "${error.commandName}"\n${error.stack}`,
          user: message.author,
          category: LOGGER_CATEGORY.COMMAND,
        });
      }
    } else if (error instanceof CustomValidatorError) {
      await message.reply(error.message);
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

// Schedule background jobs
bot.on("ready", async () => {
  // Check polls on bot start
  await closePollsJob(bot);

  // Schedule jobs
  cron.schedule("* * * * *", async () => {
    await closePollsJob(bot);
  });

  cron.schedule("* * * * *", async () => {
    await bumpReminderJob(bot);
  });
});

loadCogs(path.join(__dirname, "./cogs"));

// Login once the cogs are all loaded
bot.login(process.env.TOKEN);

/**
 * Explicitly handle stopping the bot for ts-node-dev
 * https://github.com/wclr/ts-node-dev/issues/69#issuecomment-493675960
 */
process.on("SIGTERM", () => process.exit());
