-- CreateEnum
CREATE TYPE "ChannelType" AS ENUM ('LOGS', 'WELCOME', 'LEAVE');

-- CreateTable
CREATE TABLE "Guild" (
    "id" TEXT NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "channelId" TEXT NOT NULL,

    CONSTRAINT "Guild_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Channels" (
    "id" TEXT NOT NULL,
    "type" "ChannelType" NOT NULL,
    "guildId" TEXT NOT NULL,

    CONSTRAINT "Channels_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Guild_channelId_key" ON "Guild"("channelId");

-- CreateIndex
CREATE UNIQUE INDEX "Channels_type_guildId_key" ON "Channels"("type", "guildId");

-- AddForeignKey
ALTER TABLE "Channels" ADD CONSTRAINT "Channels_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
