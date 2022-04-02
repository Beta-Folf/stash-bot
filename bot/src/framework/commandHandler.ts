import { Client, Message } from "discord.js";

import {
  CommandRunArgs,
  ImportedCommandCog,
  COMMAND_ARG_TYPE,
} from "~/framework/CommandCog";
import { ARGUMENT_VALIDATION_ERRORS } from "~/framework/CommandError";
import { getUserIDFromMention, getChannelIDFromLink } from "~/utils/ids";
import { CONFIG } from "~/constants/config";
import { CommandError, CustomValidatorError } from "./CommandError";
import ms from "ms";

type CommandExecutionReturnType = Pick<ImportedCommandCog, "run"> & {
  runArgs: CommandRunArgs;
};

/**
 * Function to check if the given string starts with a prefix
 * @param message - The text of the message to check
 * @returns If the message started with a prefix
 */
export function messageStartsWithPrefix(message: string): {
  startsWithPrefix: boolean;
  prefixUsed?: string;
} {
  let prefixUsed: string | undefined = undefined;
  const startsWithPrefix = CONFIG.PREFIXES.some((prefix) => {
    // Add one to include the actual command
    if (message.length < prefix.length + 1) {
      return false;
    }

    if (
      message.toLowerCase().substring(0, prefix.length) === prefix.toLowerCase()
    ) {
      prefixUsed = prefix;
      return true;
    } else {
      return false;
    }
  });

  return {
    startsWithPrefix,
    prefixUsed,
  };
}

/**
 * Function to be called from the createMessage event to
 * check if the message is a command, check permissions, and
 * parse any argument values if necessary
 */
export async function checkCommandExecution(args: {
  client: Client;
  message: Message;
  commands: ImportedCommandCog[];
}): Promise<CommandExecutionReturnType | void> {
  const { client, message, commands } = args;

  let error = "";
  let customValidatorError = false;

  const originalMessageContent = message.content;

  // Replace all whitespace with a single whitespace
  originalMessageContent.replace(/\s+/g, " ");

  const lowerMessageContent = originalMessageContent.toLowerCase();

  const { startsWithPrefix: messageHasPrefix, prefixUsed } =
    messageStartsWithPrefix(lowerMessageContent);

  if (messageHasPrefix && prefixUsed) {
    const baseMessageWithoutPrefix = originalMessageContent.substring(
      prefixUsed.length
    );
    const originalMessageWithoutPrefix = baseMessageWithoutPrefix;
    const lowercaseMessageWithoutPrefix =
      baseMessageWithoutPrefix.toLowerCase();

    const splitLowercaseMessageWithoutPrefix =
      lowercaseMessageWithoutPrefix.split(" ");
    const splitOriginalMessageWithoutPrefix =
      originalMessageWithoutPrefix.split(" ");
    const commandRan = splitLowercaseMessageWithoutPrefix[0];

    const commandRanCog = commands.find((command) => {
      const { settings } = command;
      const { name, nicks } = settings;

      const parsedName = name.toLowerCase();
      const parsedNicks = nicks ? nicks.map((nick) => nick.toLowerCase()) : [];

      const validCommandNames = [parsedName, ...parsedNicks];

      if (validCommandNames.includes(commandRan)) {
        return command;
      }
    });

    if (commandRanCog) {
      const { run, settings } = commandRanCog;
      const {
        name: commandName,
        ownerOnly,
        permissions,
        commandArgs,
      } = settings;

      const commandExecutionerAsGuildMember =
        await message.guild!.members.fetch(message.author.id);

      /**
       * Handle command execution
       */
      const runArgs: CommandRunArgs = {
        client,
        context: message,
        commandArgs: {},
      };

      // Check if command is owner only
      if (ownerOnly && message.author.id !== CONFIG.OWNER_ID) {
        error = ARGUMENT_VALIDATION_ERRORS.BOT_OWNER_ONLY;
      }

      // Check is user has proper permissions
      if (permissions) {
        const userHasPermissions = permissions.every((permission) => {
          return commandExecutionerAsGuildMember.permissions.has(permission);
        });

        if (!userHasPermissions) {
          error = ARGUMENT_VALIDATION_ERRORS.MISSING_REQUIRED_ARGS;
        }
      }

      if (!error) {
        // Argument parsing
        splitLowercaseMessageWithoutPrefix.shift();
        splitOriginalMessageWithoutPrefix.shift();
        const passedArgs = splitLowercaseMessageWithoutPrefix;

        if (commandArgs) {
          const argsInOrderOfRequired = commandArgs.sort(
            ({ optional: aOptional }, { optional: bOptional }) => {
              const aAsNum = aOptional ? 1 : -1;
              const bAsNum = bOptional ? 1 : -1;

              return aAsNum - bAsNum;
            }
          );

          const amountOfArgsRequired = commandArgs.filter(
            ({ optional }) => !optional
          ).length;

          // Not enough required arguments were passed
          if (amountOfArgsRequired > passedArgs.length) {
            error = ARGUMENT_VALIDATION_ERRORS.MISSING_REQUIRED_ARGS;
          }

          /**
           * Loop through required command args and pull them
           * from the message content
           */
          let index = 0;
          for (const arg of argsInOrderOfRequired) {
            const { name, type, defaultValue, optional, customValidator } = arg;

            await new Promise<void>(async (resolve) => {
              // Prevent further execution if an error is already detected
              if (error) {
                resolve();
              }

              /**
               * Validate command
               */
              let value: string | boolean | number | undefined;

              switch (type) {
                case COMMAND_ARG_TYPE.STRING:
                  value = splitOriginalMessageWithoutPrefix[index];
                  break;
                case COMMAND_ARG_TYPE.MULTI_STRING:
                  const restOfValues =
                    splitOriginalMessageWithoutPrefix.slice(index);
                  value = restOfValues.join(" ");
                  break;
                case COMMAND_ARG_TYPE.NUMBER:
                  // Check if the value can be parsed into a string
                  const parsedValue = parseInt(
                    splitOriginalMessageWithoutPrefix[index]
                  );

                  if (splitOriginalMessageWithoutPrefix[index]) {
                    if (isNaN(parsedValue)) {
                      error = ARGUMENT_VALIDATION_ERRORS.INVALID_NUMBER;
                    } else {
                      value = parsedValue;
                    }
                  }
                  break;
                case COMMAND_ARG_TYPE.BOOLEAN:
                  // Check if the value is true/false, t/f, yes/no, or y/n
                  const val = splitLowercaseMessageWithoutPrefix[index];

                  if (splitLowercaseMessageWithoutPrefix[index]) {
                    if (["true", "t", "yes", "y"].includes(val)) {
                      value = true;
                    } else if (["false", "f", "no", "n"].includes(val)) {
                      value = false;
                    } else {
                      error = ARGUMENT_VALIDATION_ERRORS.INVALID_BOOLEAN;
                    }
                  }
                  break;
                case COMMAND_ARG_TYPE.USER:
                  // Check if the value is a valid ping or snowflake
                  // then try to get the user via the provided ID
                  if (splitLowercaseMessageWithoutPrefix[index]) {
                    const parsedUserId = await getUserIDFromMention({
                      value: splitOriginalMessageWithoutPrefix[index],
                      client,
                    });

                    if (parsedUserId) {
                      value = parsedUserId;
                    } else {
                      error = ARGUMENT_VALIDATION_ERRORS.INVALID_USER;
                    }
                  }

                  break;
                case COMMAND_ARG_TYPE.CHANNEL:
                  // Check if value is a valid channel link or
                  // snowflake then try to get the channel
                  // via the provided ID
                  if (splitLowercaseMessageWithoutPrefix[index]) {
                    const parsedChannelId = await getChannelIDFromLink({
                      value: splitOriginalMessageWithoutPrefix[index],
                      client,
                    });

                    if (parsedChannelId) {
                      value = parsedChannelId;
                    } else {
                      error = ARGUMENT_VALIDATION_ERRORS.INVALID_CHANNEL;
                    }
                  }

                  break;
                case COMMAND_ARG_TYPE.ROLE:
                  // Check if the value is a valid role in
                  // the guild the command was run in
                  try {
                    const { roles } = message.guild!;

                    const roleWithID = await roles.fetch(
                      splitLowercaseMessageWithoutPrefix[index]
                    );

                    if (roleWithID) {
                      value = splitOriginalMessageWithoutPrefix[index];
                    } else {
                      error = ARGUMENT_VALIDATION_ERRORS.INVALID_ROLE;
                    }
                  } catch {
                    error = ARGUMENT_VALIDATION_ERRORS.INVALID_ROLE;
                  }
                  break;
                case COMMAND_ARG_TYPE.TIME:
                  const restOfTimeValues =
                    splitOriginalMessageWithoutPrefix.slice(index);
                  const allTimeValues = restOfTimeValues.join(" ");

                  value = ms(allTimeValues);

                  if (value === undefined || value < 1) {
                    error = ARGUMENT_VALIDATION_ERRORS.INVALID_TIME;
                  }

                  break;
                default:
                  error = `Failed to run command ${settings.name}\nInvalid arg type "${type}" for argument ${name}`;
              }

              if (!error && customValidator) {
                const customValidatorResult = customValidator(
                  splitLowercaseMessageWithoutPrefix[index]
                );

                if (customValidatorResult) {
                  error = customValidatorResult;
                  customValidatorError = true;
                }
              }

              // Check arg values
              if (!error) {
                // We check against undefined or an empty string
                // because the value could be falsy due to the
                // boolean argument type
                const valueIsInvalid = value === undefined || value === "";

                if (valueIsInvalid && optional && defaultValue) {
                  value = defaultValue;
                } else if (valueIsInvalid && optional) {
                  value = "";
                } else if (valueIsInvalid && !optional) {
                  error = ARGUMENT_VALIDATION_ERRORS.GENERAL_INVALID;
                }
              }

              if (!error) {
                runArgs.commandArgs[name] = value;
              }

              index += 1;

              resolve();
            });
          }
        }
      }

      if (!!error && customValidatorError) {
        throw new CustomValidatorError(error);
      } else if (!!error) {
        throw new CommandError({
          commandName,
          message: error,
        });
      } else {
        return {
          run,
          runArgs,
        };
      }
    }
  }
}
