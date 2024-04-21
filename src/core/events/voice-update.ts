import { Discord, On, type ArgsOf, Client } from 'discordx'
import { injectable } from 'tsyringe'
import { Database } from '@services'
import { ChannelType, type VoiceBasedChannel } from 'discord.js'

@Discord()
@injectable()
export class VoiceUpdateEvent {
    private autoChannels: Array<string> = []
    constructor(private readonly database: Database) {}

    @On({ event: 'voiceStateUpdate' })
    async event([old, current]: ArgsOf<'voiceStateUpdate'>) {
        if (old.channelId && this.autoChannels.includes(old.channelId)) {
            const oldChannel = old.guild.channels.cache.get(
                old.channelId
            ) as VoiceBasedChannel

            if (oldChannel.members.size > 0) return

            await oldChannel.delete()
        }

        const channels = await this.database.channels.findUnique({
            where: { guildId: current.guild.id },
        })

        if (!channels || channels.voice.length === 0) return
        if (!channels.voice.includes(current.channelId!)) return

        const currentChannel = current.guild.channels.cache.get(
            current.channelId!
        )

        if (!currentChannel || !currentChannel.isVoiceBased()) return

        if (currentChannel.members.size === 1) {
            const newChannel = await current.guild.channels.create({
                name: `${current.member?.user.username} | Codding`,
                type: ChannelType.GuildVoice,
                parent: currentChannel.parent,
            })

            this.autoChannels.push(newChannel.id)

            await current.member?.voice.setChannel(newChannel)
        }
    }
}
