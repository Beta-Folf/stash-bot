-- CreateTable
CREATE TABLE "StickyMessage" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "messageContent" TEXT NOT NULL,

    CONSTRAINT "StickyMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StickyMessage_messageId_key" ON "StickyMessage"("messageId");
