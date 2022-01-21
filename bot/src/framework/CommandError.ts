interface ICommandError extends Error {
  commandName: string;
}

export enum ARGUMENT_VALIDATION_ERRORS {
  // Command execution checks
  MISSING_PERMISSIONS = "MISSING_PERMISSIONS",
  BOT_OWNER_ONLY = "BOT_OWNER_ONLY",
  MISSING_REQUIRED_ARGS = "MISSING_REQUIRED_ARGS",
  // Argument checks
  INVALID_NUMBER = "INVALID_NUMBER",
  INVALID_BOOLEAN = "INVALID_BOOLEAN",
  INVALID_USER = "INVALID_USER",
  INVALID_CHANNEL = "INVALID_CHANNEL",
  GENERAL_INVALID = "GENERAL_INVALID",
}

export const FURRY_READABLE_ARGUMENT_VALIDATION_ERRORS = {
  // Command execution checks
  MISSING_PERMISSIONS:
    "You don't have the necessary permissions to use this command!",
  BOT_OWNER_ONLY: "Only the bot owner can use this command!",
  MISSING_REQUIRED_ARGS: "Missing required arguments!",
  // Argument checks
  INVALID_NUMBER: "Invalid number passed!",
  INVALID_BOOLEAN: "Invalid boolean passed!",
  INVALID_USER: "Invalid user passed!",
  INVALID_CHANNEL: "Invalid channel passed!",
  GENERAL_INVALID: "One of the arguments is invalid!",
};

export class CommandError extends Error implements ICommandError {
  commandName: string;

  constructor({
    commandName,
    message,
  }: {
    commandName: string;
    message: string;
  }) {
    super(message);

    Object.setPrototypeOf(this, CommandError.prototype);

    this.name = "CommandError";
    this.commandName = commandName;
  }
}
