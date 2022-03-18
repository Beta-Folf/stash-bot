-- AlterTable
ALTER TABLE "GuildSettings" ADD COLUMN     "lastBumpedAt" TIMESTAMP(3),
ADD COLUMN     "sendBumpPingAt" TIMESTAMP(3);
