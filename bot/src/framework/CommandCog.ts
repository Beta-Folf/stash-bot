import { Client, PermissionString, Message } from "discord.js";

export enum COMMAND_ARG_TYPE {
  STRING = "string",
  MULTI_STRING = "multi_string", // Has to be the last argument
  NUMBER = "number", // Try to parse to a number
  BOOLEAN = "boolean", // true/false, yes/no, t/f, y/n
  USER = "user", // snowflake or user ping
  CHANNEL = "channel", // snowflake or channel link
}

export interface CommandArg {
  name: string;
  type: COMMAND_ARG_TYPE;
  optional?: boolean;
  defaultValue?: string | boolean | number;
  customValidator?(value: string): string | void;
}

export interface Settings {
  name: string;
  nicks?: string[];
  commandArgs?: CommandArg[];
  permissions?: PermissionString[];
  ownerOnly?: boolean;
}

// there's probably a better name for this but oh well
export interface CommandRunCmdArgs {
  [key: string]: string | boolean | number | undefined;
}

export interface CommandRunArgs {
  context: Message;
  client: Client;
  commandArgs: CommandRunCmdArgs;
}

export interface ImportedCommandCog {
  run(args: CommandRunArgs): Promise<void>;
  settings: Settings;
}

export interface ICommandCog {
  // static settings: Settings; - I guess TypeScript doesn't support static declarations in interfaces?
  run(args: CommandRunArgs): Promise<void>;
}

export class CommandCog implements ICommandCog {
  private settings: Settings;

  constructor(args: Settings) {
    this.settings = args;
  }

  async run(args: CommandRunArgs) {}
}
