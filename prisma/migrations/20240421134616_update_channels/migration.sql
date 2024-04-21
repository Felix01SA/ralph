/*
  Warnings:

  - You are about to drop the column `autoVoiceChannels` on the `Guild` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Channels" ADD COLUMN     "voice" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "Guild" DROP COLUMN "autoVoiceChannels";
