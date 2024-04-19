import { singleton } from 'tsyringe';
import { PrismaClient } from '@prisma/client';
import type { Client } from 'discordx';

@singleton()
export class Database extends PrismaClient {
  private async syncGuild(guildId: string, client: Client) {
    const fetchGuild = client.guilds.fetch(guildId);
    const dataGuild = await this.guild.findUnique({ where: { id: guildId } });

    if (!dataGuild) {
      await this.guild.create({
        data: {
          id: guildId,
          channels: {
            connectOrCreate: {
              where: { guildId: guildId },
              create: {
                guildId: guildId,
              },
            },
          },
        },
      });
    } else if (!fetchGuild && dataGuild.deleted === false) {
      await this.guild.update({
        where: { id: guildId },
        data: {
          deleted: true,
        },
      });
    }
  }

  public async syncAllGuilds(client: Client) {
    const allGuilds = await client.guilds.fetch();

    const promisses = [];

    for (const guild of allGuilds) {
      const g = guild[0];

      promisses.push(this.syncGuild(g, client));
    }

    await Promise.all(promisses);
  }
}
