import { findChannel } from '@magicyan/discord'
import { Database } from '@services'
import { EmbedBuilder, codeBlock, userMention } from 'discord.js'
import { Discord, On, type ArgsOf } from 'discordx'
import { injectable } from 'tsyringe'

@Discord()
@injectable()
export class LogEvents {
    constructor(private readonly database: Database) {}

    @On({ event: 'guildMemberAdd' })
    async guildMemberAdd([event]: ArgsOf<'guildMemberAdd'>) {
        const channels = await this.database.channels.findUnique({
            where: { guildId: event.guild.id },
        })

        if (!channels || !channels.welcome) return

        const guildChannel = findChannel(event.guild).byId(channels.welcome)

        if (!guildChannel) {
            await this.database.channels.update({
                where: { guildId: event.guild.id },
                data: { logs: null },
            })
            return
        }

        const embed = this.embed()
            .setTitle('👋 Bem-vindo(a)!')
            .setThumbnail(event.user.displayAvatarURL())
            .setDescription(
                `Olá ${userMention(
                    event.user.id
                )}, bem vindo, fique a vontade não se esqueça de ver o canal de regras.,`
            )
            .setFooter({ text: `ID do usuário: ${event.user.id}` })

        await guildChannel.send({ embeds: [embed] })
    }

    @On({ event: 'guildMemberRemove' })
    async guildMemberRemove([event]: ArgsOf<'guildMemberRemove'>) {
        const channels = await this.database.channels.findUnique({
            where: { guildId: event.guild.id },
        })

        if (!channels || !channels.leave) return

        const guildChannel = findChannel(event.guild).byId(channels.leave)

        if (!guildChannel) {
            await this.database.channels.update({
                where: { guildId: event.guild.id },
                data: { logs: null },
            })
            return
        }

        const embed = this.embed()
            .setTitle('Mais um foi embora')
            .setDescription(`Já foi tarde ${userMention(event.user.id)}`)
            .setThumbnail(event.user.displayAvatarURL())

        await guildChannel.send({ embeds: [embed] })
    }

    @On({ event: 'guildMemberUpdate' })
    async guildMemberUpdate([old, current]: ArgsOf<'guildMemberUpdate'>) {
        const channels = await this.database.channels.findUnique({
            where: { guildId: old.guild.id },
        })

        if (!channels || !channels.logs) return

        const guildChannel = findChannel(old.guild).byId(channels.logs)

        if (!guildChannel) {
            await this.database.channels.update({
                where: { guildId: old.guild.id },
                data: { logs: null },
            })
            return
        }

        const embed = this.embed().addFields(
            { name: 'Evento', value: 'Atualização de membro', inline: true },
            { name: 'Membro', value: userMention(old.user.id), inline: true },
            {
                name: 'Antes',
                value: codeBlock(
                    'js',
                    JSON.stringify(
                        {
                            nickname: old.nickname,
                            avatar: old.displayAvatarURL(),
                        },
                        null,
                        2
                    )
                ),
            },
            {
                name: 'Agora',
                value: codeBlock(
                    'js',
                    JSON.stringify(
                        {
                            nickname: current.nickname,
                            avatar: current.displayAvatarURL(),
                        },
                        null,
                        2
                    )
                ),
            }
        )

        await guildChannel.send({ embeds: [embed] })
    }

    @On({ event: 'guildBanAdd' })
    async guildBanAdd([guildBan]: ArgsOf<'guildBanAdd'>) {
        const channels = await this.database.channels.findUnique({
            where: { guildId: guildBan.guild.id },
        })

        if (!channels || !channels.logs) return

        const guildChannel = findChannel(guildBan.guild).byId(channels.logs)

        if (!guildChannel) {
            await this.database.channels.update({
                where: { guildId: guildBan.guild.id },
                data: { logs: null },
            })
            return
        }

        const embed = this.embed().addFields(
            { name: 'Evento', value: 'Banimento', inline: true },
            {
                name: 'Membro',
                value: userMention(guildBan.user.id),
                inline: true,
            },
            {
                name: 'Motivo',
                value: `${guildBan.reason ?? 'Não informado.'}`,
            }
        )
        console.log(guildBan.toJSON())

        await guildChannel.send({ embeds: [embed] })
    }
    @On({ event: 'guildBanRemove' })
    async guildBanRemove([guildBan]: ArgsOf<'guildBanRemove'>) {
        const channels = await this.database.channels.findUnique({
            where: { guildId: guildBan.guild.id },
        })

        if (!channels || !channels.logs) return

        const guildChannel = findChannel(guildBan.guild).byId(channels.logs)

        if (!guildChannel) {
            await this.database.channels.update({
                where: { guildId: guildBan.guild.id },
                data: { logs: null },
            })
            return
        }

        const embed = this.embed().addFields(
            { name: 'Evento', value: 'Remoção de banimento', inline: true },
            {
                name: 'Membro',
                value: userMention(guildBan.user.id),
                inline: true,
            }
        )

        await guildChannel.send({ embeds: [embed] })
    }

    private embed() {
        return new EmbedBuilder()
            .setColor('Purple')
            .setTimestamp()
            .setTitle('📃 Sistema de Logs')
    }
}
