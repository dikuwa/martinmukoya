-- AlterTable
ALTER TABLE "BlogPost" ADD COLUMN     "coverImageAlt" TEXT,
ADD COLUMN     "featured" BOOLEAN NOT NULL DEFAULT false;