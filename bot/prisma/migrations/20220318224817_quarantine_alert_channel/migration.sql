/*
  Warnings:

  - You are about to drop the column `lastBumpedAt` on the `GuildSettings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "GuildSettings" DROP COLUMN "lastBumpedAt",
ADD COLUMN     "quarantineAlertChannelId" TEXT;
