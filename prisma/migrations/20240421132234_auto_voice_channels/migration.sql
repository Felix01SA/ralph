/*
  Warnings:

  - You are about to drop the column `type` on the `Channels` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[guildId]` on the table `Channels` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Channels" DROP CONSTRAINT "Channels_guildId_fkey";

-- DropIndex
DROP INDEX "Channels_type_guildId_key";

-- AlterTable
ALTER TABLE "Channels" DROP COLUMN "type",
ADD COLUMN     "leave" TEXT,
ADD COLUMN     "logs" TEXT,
ADD COLUMN     "welcome" TEXT;

-- AlterTable
ALTER TABLE "Guild" ADD COLUMN     "autoVoiceChannels" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- DropEnum
DROP TYPE "ChannelType";

-- CreateIndex
CREATE UNIQUE INDEX "Channels_guildId_key" ON "Channels"("guildId");

-- AddForeignKey
ALTER TABLE "Guild" ADD CONSTRAINT "Guild_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
