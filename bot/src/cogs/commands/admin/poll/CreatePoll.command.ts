import { DateTime } from "luxon";
import { MessageEmbed, TextChannel } from "discord.js";

import {
  CommandCog,
  CommandRunArgs,
  COMMAND_ARG_TYPE,
} from "~/framework/CommandCog";
import { EMOJIS } from "~/constants/emojis";
import { EMBED_COLORS } from "~/constants/colors";
import { prisma } from "~/utils/db";

// Not inclusive
const MAXIMUM_MINUTE = 60;
const MAXIMUM_HOUR = 24;
const MAXIMUM_DAYS = 7;
const MAXIMUM_WEEKS = 5;

enum DURATION {
  MINUTES = MAXIMUM_MINUTE,
  HOURS = MAXIMUM_HOUR,
  DAYS = MAXIMUM_DAYS,
  WEEKS = MAXIMUM_WEEKS,
}

const VALID_MINUTE_UNITS = ["m", "min", "minutes"];
const VALID_HOUR_UNITS = ["h", "hour", "hours"];
const VALID_DAY_UNITS = ["d", "day", "days"];
const VALID_WEEK_UNITS = ["w", "week", "weeks"];
const VALID_DURATION_UNITS = [
  ...VALID_MINUTE_UNITS,
  ...VALID_HOUR_UNITS,
  ...VALID_DAY_UNITS,
  ...VALID_WEEK_UNITS,
];

const getPollDuration = (value: string): { num?: number; unit?: DURATION } => {
  const splitValue = value.toLowerCase().split("");

  let num = "";
  let unit: DURATION | undefined = undefined;

  let continueToGetNumber = true;
  let numberEndsAt = 0;

  // Get the number value by checking each item in
  // the split value array. If a string contains
  // a valid number then add the number to the
  // number string. If it is not a valid
  // number, then stop trying to grab the number.
  // Record the index when the number in the string
  // stops so we can use that value to substring the
  // passed argument to get the unit
  splitValue.forEach((val, index) => {
    if (!continueToGetNumber) {
      return;
    }

    const parsedValue = parseInt(val);

    if (isNaN(parsedValue)) {
      continueToGetNumber = false;
      numberEndsAt = index;
    } else {
      num += val;
    }
  });

  // Check the unit from the passed argument
  const passedUnit = value.toLowerCase().substring(numberEndsAt);
  const unitUsed = VALID_DURATION_UNITS.find((unit) => unit === passedUnit);

  if (!unitUsed) {
    return {
      num: parseInt(num),
      unit,
    };
  }

  if (VALID_MINUTE_UNITS.includes(unitUsed)) {
    unit = DURATION.MINUTES;
  } else if (VALID_HOUR_UNITS.includes(unitUsed)) {
    unit = DURATION.HOURS;
  } else if (VALID_DAY_UNITS.includes(unitUsed)) {
    unit = DURATION.DAYS;
  } else if (VALID_WEEK_UNITS.includes(unitUsed)) {
    unit = DURATION.WEEKS;
  }

  return {
    num: parseInt(num),
    unit,
  };
};

export default class CreatePoll extends CommandCog {
  constructor() {
    super({
      name: "poll",
      nicks: ["createpoll", "startpoll"],
      permissions: ["MANAGE_MESSAGES"],
      commandArgs: [
        {
          name: "duration",
          type: COMMAND_ARG_TYPE.STRING,
          customValidator: (value: string): string | void => {
            const { num, unit } = getPollDuration(value);

            // Check if number was not passed
            if (!num) {
              return "You did not specify an amount of time for the poll duration!";
            }

            // Check if duration unit was not passed or invalid
            if (!unit) {
              return "You did not specify a unit of time for the poll duration!";
            }

            // Check if number is within a valid range
            if (num <= 0 || num >= unit) {
              return `The maximum value for the unit of time you selected is ${
                unit - 1
              }!`;
            }
          },
        },
        {
          name: "content",
          type: COMMAND_ARG_TYPE.MULTI_STRING,
        },
      ],
    });
  }

  async run(args: CommandRunArgs) {
    const { client, context, commandArgs } = args;
    const { duration, content } = commandArgs;

    const durationValue = duration as string;
    const contentValue = content as string;

    const { num, unit } = getPollDuration(durationValue);

    if (!num || !unit) {
      // This shouldn't happen because of the custom arg validation
      return;
    }

    // Calculate end at time
    let endAt = DateTime.now();

    switch (unit) {
      case DURATION.MINUTES:
        endAt = endAt.plus({
          minute: num,
        });
        break;
      case DURATION.HOURS:
        endAt = endAt.plus({
          hour: num,
        });
        break;
      case DURATION.DAYS:
        endAt = endAt.plus({
          day: num,
        });
        break;
      case DURATION.WEEKS:
        endAt = endAt.plus({
          week: num,
        });
        break;
    }

    // Check if poll channel is set for the current guild
    const guildSettings = await prisma.guildSettings.findUnique({
      where: {
        id: context.guildId!,
      },
    });

    if (!guildSettings || !guildSettings.pollChannelId) {
      await context.reply("There is no poll channel set for this server!");
      return;
    }

    const { pollChannelId } = guildSettings;

    // Send the poll embed in the poll channel
    const embed = new MessageEmbed({
      color: EMBED_COLORS.BLURPLE,
      title: "Poll!",
      description: contentValue,
      timestamp: endAt.toJSDate(),
    });

    const channel = await client.channels.fetch(pollChannelId);

    if (!channel) {
      await context.reply("Could not get the poll channel!");
      return;
    }

    const pollEmbedMessage = await (channel as TextChannel).send({
      embeds: [embed],
    });

    // Add the voting reactions to the sent embed
    await pollEmbedMessage.react(EMOJIS["UP_ARROW"]);
    await pollEmbedMessage.react(EMOJIS["DOWN_ARROW"]);

    try {
      // Save poll to database
      await prisma.poll.create({
        data: {
          content: contentValue,
          pollMessageId: pollEmbedMessage.id,
          inProgress: true,
          createdAt: DateTime.now().toISO(),
          endAt: endAt.toISO(),
          guildId: context.guildId!,
        },
      });
    } catch (error) {
      await pollEmbedMessage.delete();
      throw error;
    }

    // React to the command message
    await context.react(EMOJIS["GREEN_CHECKMARK"]);
  }
}
