-- AlterTable
ALTER TABLE "GuildSettings" ADD COLUMN     "bumpChannelId" TEXT,
ADD COLUMN     "bumpRoleId" TEXT,
ADD COLUMN     "lastBumpedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "VoteMessages" (
    "id" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,

    CONSTRAINT "VoteMessages_pkey" PRIMARY KEY ("id")
);
