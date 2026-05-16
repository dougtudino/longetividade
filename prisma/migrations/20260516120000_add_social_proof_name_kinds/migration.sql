-- AlterTable: SocialProofItem ganha campo name (opcional, pro nome da pessoa)
-- e indice secundario por kind pros novos lookups (kind=progress-quote, kind=women-gallery).
ALTER TABLE "SocialProofItem" ADD COLUMN "name" TEXT;

-- Indice composto: lookups da LP nova filtram por (lpSlug, kind, active) ordenando por orderIndex.
CREATE INDEX "SocialProofItem_lpSlug_kind_active_orderIndex_idx"
  ON "SocialProofItem" ("lpSlug", "kind", "active", "orderIndex");
