import { Client } from "discord.js";

import { EventCog, EventHandlerArgs } from "~/framework/EventCog";
import { Logger, LOGGER_CATEGORY } from "~/utils/logger";

export default class ReadyEvent extends EventCog {
  constructor(client: Client) {
    super({
      client,
      eventName: "ready",
    });
  }

  async eventHandler({ client, context }: EventHandlerArgs) {
    client.user?.setActivity("a dick measuring contest", { type: "COMPETING" });

    Logger.log({
      message: "Bot ready!",
      category: LOGGER_CATEGORY.EVENT,
    });
  }
}
