import { DateTime } from "luxon";

enum LEVEL {
  INFO = "log",
  WARN = "warn",
  ERROR = "error",
}

class LoggerClass {
  private logMessage({ level, message }: { level: LEVEL; message: string }) {
    const now = DateTime.now()
      .toUTC()
      .toLocaleString(DateTime.DATETIME_FULL_WITH_SECONDS);

    const msg = `[${level.toUpperCase()}] [${now}] - ${message}`;

    console[level](msg);
  }
  log(message: string) {
    this.logMessage({
      level: LEVEL.INFO,
      message,
    });
  }
  info(message: string) {
    this.logMessage({
      level: LEVEL.INFO,
      message,
    });
  }
  warn(message: string) {
    this.logMessage({
      level: LEVEL.WARN,
      message,
    });
  }
  error(message: string) {
    this.logMessage({
      level: LEVEL.ERROR,
      message,
    });
  }
}

const Logger = new LoggerClass();

export { Logger };
