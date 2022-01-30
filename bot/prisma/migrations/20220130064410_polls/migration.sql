-- CreateTable
CREATE TABLE "Poll" (
    "id" SERIAL NOT NULL,
    "guildId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "pollMessageId" TEXT NOT NULL,
    "inProgress" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3) NOT NULL,
    "votedYes" INTEGER,
    "votedNo" INTEGER,

    CONSTRAINT "Poll_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuildSettings" (
    "id" TEXT NOT NULL,
    "pollChannelId" TEXT,

    CONSTRAINT "GuildSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Poll_pollMessageId_key" ON "Poll"("pollMessageId");

-- CreateIndex
CREATE INDEX "Poll_inProgress_endAt_idx" ON "Poll"("inProgress", "endAt");
