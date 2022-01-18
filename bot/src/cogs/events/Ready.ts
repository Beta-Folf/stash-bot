import { Client } from "discord.js";

import { EventCog } from "~/framework/EventCog";
import { Logger } from "~/utils/logger";

export default class ReadyEvent extends EventCog {
  constructor(client: Client) {
    super({
      client,
      eventName: "ready",
    });
  }

  async eventHandler() {
    Logger.log("Bot ready!");
  }
}
