-- AlterTable
ALTER TABLE "User" ADD COLUMN     "lastInteraction" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;