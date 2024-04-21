import { singleton } from 'tsyringe'
import { PrismaClient } from '@prisma/client'
import type { Client } from 'discordx'

@singleton()
export class Database extends PrismaClient {
    private async syncGuild(guildId: string, client: Client) {
        const fetchGuild = client.guilds.fetch(guildId)
        const dataGuild = await this.guild.findUnique({
            where: { id: guildId },
        })

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
            })
        } else if (!fetchGuild && dataGuild.deleted === false) {
            await this.guild.update({
                where: { id: guildId },
                data: {
                    deleted: true,
                },
            })
        }
    }

    public async syncUser(userId: string) {
        await this.user.upsert({
            where: { id: userId },
            create: { id: userId },
            update: {
                lastInteraction: new Date(),
            },
        })
    }

    public async syncAllGuilds(client: Client) {
        const allGuilds = await client.guilds.fetch()

        const premises = []

        for (const guild of allGuilds) {
            const g = guild[0]

            premises.push(this.syncGuild(g, client))
        }

        await Promise.all(premises)
    }
}
