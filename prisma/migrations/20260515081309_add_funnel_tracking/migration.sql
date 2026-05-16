-- CtaClick: cliques no CTA capturados pelo /api/track/cta-click via sendBeacon
CREATE TABLE "CtaClick" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ctaId" TEXT NOT NULL,
    "planId" TEXT,
    "destinationUrl" TEXT NOT NULL,
    "userAgent" TEXT,
    "referrer" TEXT,
    "pathname" TEXT,
    "utmSource" TEXT,
    "utmCampaign" TEXT,
    "utmMedium" TEXT,
    "utmContent" TEXT,
    "utmTerm" TEXT,
    "ipHash" TEXT,

    CONSTRAINT "CtaClick_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CtaClick_timestamp_idx" ON "CtaClick"("timestamp");
CREATE INDEX "CtaClick_ctaId_idx" ON "CtaClick"("ctaId");
CREATE INDEX "CtaClick_utmCampaign_idx" ON "CtaClick"("utmCampaign");
CREATE INDEX "CtaClick_planId_idx" ON "CtaClick"("planId");

-- MetaCapiEvent: log auditavel dos eventos enviados pro Meta Conversions API
CREATE TABLE "MetaCapiEvent" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "eventName" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "sourceUrl" TEXT,
    "value" DOUBLE PRECISION,
    "currency" TEXT,
    "orderId" TEXT,
    "status" TEXT NOT NULL,
    "errorMessage" TEXT,
    "rawResponse" JSONB,

    CONSTRAINT "MetaCapiEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "MetaCapiEvent_timestamp_idx" ON "MetaCapiEvent"("timestamp");
CREATE INDEX "MetaCapiEvent_eventName_idx" ON "MetaCapiEvent"("eventName");
CREATE INDEX "MetaCapiEvent_eventId_idx" ON "MetaCapiEvent"("eventId");
CREATE INDEX "MetaCapiEvent_orderId_idx" ON "MetaCapiEvent"("orderId");
CREATE INDEX "MetaCapiEvent_status_idx" ON "MetaCapiEvent"("status");
