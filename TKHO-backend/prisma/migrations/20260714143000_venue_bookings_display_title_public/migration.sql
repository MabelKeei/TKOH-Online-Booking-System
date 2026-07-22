-- AlterTable
ALTER TABLE "venue_bookings"
  ADD COLUMN IF NOT EXISTS "display_title_public" BOOLEAN NOT NULL DEFAULT true;

COMMENT ON COLUMN "venue_bookings"."display_title_public" IS '是否允许会议标题在 venue display 大屏公开显示；false 时大屏显示 Reserved';
