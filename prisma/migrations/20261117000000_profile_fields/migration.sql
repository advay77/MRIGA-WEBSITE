-- AlterTable
ALTER TABLE "User" ADD COLUMN     "city" TEXT,
ADD COLUMN     "preferredModel" TEXT,
ADD COLUMN     "updatesOptIn" BOOLEAN NOT NULL DEFAULT false;

