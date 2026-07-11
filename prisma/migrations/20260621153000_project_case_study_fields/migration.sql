ALTER TABLE "Project"
  ADD COLUMN "eyebrow" TEXT,
  ADD COLUMN "timeline" TEXT,
  ADD COLUMN "role" TEXT,
  ADD COLUMN "deliverables" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "stackSummary" TEXT,
  ADD COLUMN "benefits" JSONB,
  ADD COLUMN "capabilities" JSONB,
  ADD COLUMN "coverImageAlt" TEXT,
  ADD COLUMN "galleryImages" JSONB,
  ADD COLUMN "ctaEyebrow" TEXT,
  ADD COLUMN "ctaTitle" TEXT,
  ADD COLUMN "ctaDescription" TEXT,
  ADD COLUMN "ctaPrimaryLabel" TEXT,
  ADD COLUMN "ctaPrimaryUrl" TEXT,
  ADD COLUMN "ctaSecondaryLabel" TEXT,
  ADD COLUMN "ctaSecondaryUrl" TEXT;

UPDATE "Project"
SET "galleryImages" = (
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'url', image_url,
    'alt', "Project"."title" || ' project screenshot ' || ordinal,
    'caption', '',
    'sortOrder', ordinal - 1
  ) ORDER BY ordinal), '[]'::jsonb)
  FROM unnest("Project"."gallery") WITH ORDINALITY AS images(image_url, ordinal)
)
WHERE cardinality("gallery") > 0;
