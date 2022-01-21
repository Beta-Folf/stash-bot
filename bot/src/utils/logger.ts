import { User } from "discord.js";
import { DateTime } from "luxon";

enum LOGGER_LEVEL {
  INFO = "info",
  WARN = "warn",
  ERROR = "error",
}

export enum LOGGER_CATEGORY {
  COMMAND = "COMMAND",
  EVENT = "EVENT",
  BACKGROUND_JOB = "JOB",
}

type Message =
  | {
      message: string;
      user?: User;
      category?: LOGGER_CATEGORY;
    }
  | string;

class LoggerClass {
  private logMessage({
    level,
    message,
  }: {
    level: LOGGER_LEVEL;
    message: Message;
  }) {
    const now = DateTime.now()
      .toUTC()
      .toLocaleString(DateTime.DATETIME_FULL_WITH_SECONDS);

    let messageContents = "";
    let messageCategory = "";

    if (typeof message === "object") {
      const { category, user } = message;

      if (category) {
        messageCategory += `[${category}] `;
      }

      if (user) {
        messageContents += `[${user.id} | ${user.username}#${user.discriminator}] `;
      }

      messageContents += message.message;
    } else {
      messageContents = message;
    }

    const msg = `[${level.toUpperCase()}] ${
      messageCategory || ""
    }[${now}] ${messageContents}`;

    console[level](msg);
  }
  log(message: Message) {
    this.logMessage({
      level: LOGGER_LEVEL.INFO,
      message,
    });
  }
  info(message: Message) {
    this.logMessage({
      level: LOGGER_LEVEL.INFO,
      message,
    });
  }
  warn(message: Message) {
    this.logMessage({
      level: LOGGER_LEVEL.WARN,
      message,
    });
  }
  error(message: Message) {
    this.logMessage({
      level: LOGGER_LEVEL.ERROR,
      message,
    });
  }
}

const Logger = new LoggerClass();

export { Logger };
