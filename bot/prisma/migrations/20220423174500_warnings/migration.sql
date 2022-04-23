-- CreateTable
CREATE TABLE "Warnings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "warnedByUserId" TEXT NOT NULL,
    "reason" TEXT,
    "issuedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Warnings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Warnings_userId_idx" ON "Warnings"("userId");

-- CreateIndex
CREATE INDEX "Warnings_issuedAt_idx" ON "Warnings"("issuedAt");
