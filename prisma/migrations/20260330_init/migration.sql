-- CreateTable
CREATE TABLE IF NOT EXISTS "Order" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "plan" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "mpPaymentId" TEXT,
    "mpPreferenceId" TEXT,
    "downloadToken" TEXT,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "tokenExpiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "AbandonedCheckout" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "plan" TEXT,
    "step" TEXT NOT NULL DEFAULT 'checkout',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AbandonedCheckout_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Order_mpPaymentId_key" ON "Order"("mpPaymentId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Order_mpPreferenceId_key" ON "Order"("mpPreferenceId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Order_downloadToken_key" ON "Order"("downloadToken");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Order_email_idx" ON "Order"("email");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Order_status_idx" ON "Order"("status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Order_downloadToken_idx" ON "Order"("downloadToken");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Order_createdAt_idx" ON "Order"("createdAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "AbandonedCheckout_email_idx" ON "AbandonedCheckout"("email");
