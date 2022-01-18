# Stash Bot

The Discord bot for the stash Discord server

## Table of Contents

1. [Ideas](#ideas)
2. [Development](#development)

## Ideas

- Automatically create stash channels for user once they receive a certain rank (5?). By default do the SFW one but if they have the NSFW role then create an NSFW stash for them as well
- Command to get the direct links to a given users stash so you don't have to scroll through the channel list to find it
- Automatically delete stash channels when:
  - A user gets banned
  - A user leaves the server. If there are less than (30?) messages in the channel then delete it after 24 hours if they do not rejoin. If there are more messages than that, delete the channel if the user does not rejoin after 7 days.
- Admin command to check all the channels and purge any ones that meet the deletion criteria
- Admin command to create a stash for a user if the channels do not exist
- Ability to save an image from someone's stash (to your dms or your channel) by adding a specific reaction to it
- (Owner only) command to add letters to a message in the reactions by spelling out the word

## Development

Here are the following steps to get the bot up and running locally for development

1. In `/bot` create a file called `.env`. It should include the following values, you need to get your own values for `CLIENT_ID` and `TOKEN`

```
CLIENT_ID=<Discord application client ID>
TOKEN=<Discord bot token>
DYNAMO_DB_URL=http://dynamodb-local:8000
```

2. In `/bot`, run `yarn install` to install the node dependencies.
3. In the root directory (same level as this README) run `docker-compose up --build` to build the docker images and run the database and bot.
4. To run the application again, just run `docker-compose up`. You don't need to add `--build` to runs except from the first one and ones where you changed the `Dockerfile` in `/bot`, but that Dockerfile should only be used for production deployments anyways.
