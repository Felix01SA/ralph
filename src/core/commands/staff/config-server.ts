import { brBuilder, createRow } from '@magicyan/discord'
import type { Channels } from '@prisma/client'
import { Database } from '@services'
import {
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    ChannelSelectMenuBuilder,
    ChannelSelectMenuInteraction,
    ChannelType,
    Colors,
    EmbedBuilder,
    Guild,
    StringSelectMenuBuilder,
    StringSelectMenuInteraction,
    bold,
    channelMention,
    type CommandInteraction,
    type EmojiResolvable,
} from 'discord.js'
import { ButtonComponent, Discord, SelectMenuComponent, Slash } from 'discordx'
import { injectable } from 'tsyringe'

type TChannelType = keyof Omit<Channels, 'id' | 'guildId'>

@Discord()
@injectable()
export class ConfigServerCommand {
    private selectedCategory: TChannelType

    constructor(private readonly database: Database) {}
    // Funções para os menus
    private menus = {
        mainMenu: (guild: Guild) => {
            const embed = new EmbedBuilder()
                .setTitle('Painel de Configurações.')
                .setDescription(brBuilder('- Canais'))
                .setThumbnail(guild.iconURL())
                .setColor('Purple')

            const row = createRow(this.buttons.channels)

            return { embeds: [embed], components: [row] }
        },
        channels: (channels: Channels) => {
            const display = this.selectMenuData.map(
                ({ label, value, emoji }) =>
                    `- ${emoji} ${label} ${
                        channels[value] !== null
                            ? value === 'voice'
                                ? channels.voice.length < 1
                                    ? bold('Não definido')
                                    : channels.voice
                                          .map((id) => channelMention(id))
                                          .join(' ')
                                : channelMention(channels[value] as string)
                            : bold('Não definido')
                    }`
            )

            const embed = new EmbedBuilder({
                title: 'Configurações de canais',
                description: brBuilder(display),
                color: Colors.Purple,
            })

            const buttonsRow = createRow(this.buttons.home)
            const selectRow = createRow(this.SelectMenus.channels.category)

            return { embeds: [embed], components: [selectRow, buttonsRow] }
        },
        configChannel: (channel: TChannelType, channels?: Channels) => {
            const embed = new EmbedBuilder({
                title: `Configurar canal`,
                description: brBuilder(
                    `Categoria: ${bold(channel.toUpperCase())}`,
                    '',
                    `Selecione ${
                        channel === 'voice' ? 'canais' : 'um canal'
                    } para definir`
                ),
                color: Colors.Purple,
            })

            const buttonsRow = createRow(
                this.buttons.home,
                this.buttons.back('channels')
            )

            if (channel === 'voice')
                buttonsRow.addComponents(this.buttons.clearVoiceChannels)

            const selectRow = createRow(
                channel === 'voice'
                    ? this.SelectMenus.channels.setVoiceChannels.setDefaultChannels(
                          channels?.voice!
                      )
                    : this.SelectMenus.channels.setChannel
            )

            return { embeds: [embed], components: [selectRow, buttonsRow] }
        },
    }

    // Componentes de botões
    private buttons = {
        home: new ButtonBuilder()
            .setCustomId('config/button/home')
            .setStyle(ButtonStyle.Secondary)
            .setLabel('INICIO'),

        channels: new ButtonBuilder()
            .setCustomId('config/button/channels')
            .setStyle(ButtonStyle.Primary)
            .setLabel('CANAIS'),
        clearVoiceChannels: new ButtonBuilder()
            .setCustomId('config/button/channels/clearVoice')
            .setStyle(ButtonStyle.Danger)
            .setLabel('Limpar'),

        back: (menu: string) =>
            new ButtonBuilder()
                .setCustomId(`config/button/${menu}`)
                .setStyle(ButtonStyle.Secondary)
                .setLabel('VOLTAR'),
    }

    // Menus de Seleção
    private selectMenuData: Array<{
        label: string
        value: TChannelType
        description?: string
        emoji?: string
    }> = [
        {
            label: 'Logs',
            value: 'logs',
            description: 'Logs do servidor',
            emoji: '📃',
        },
        {
            label: 'Welcome',
            value: 'welcome',
            description: 'Canal de boas-vindas',
            emoji: '🥳',
        },
        {
            label: 'Leave',
            value: 'leave',
            description: 'Informa a saída de membros',
            emoji: '🍃',
        },
        {
            label: 'Voice',
            value: 'voice',
            description: 'Canais de voz automáticos',
            emoji: '🔉',
        },
    ] as const

    private SelectMenus = {
        channels: {
            category: new StringSelectMenuBuilder({
                customId: 'config/select/channelCategory',
                placeholder: 'Selecione uma categoria',
                options: Array.from(this.selectMenuData),
            }),
            setChannel: new ChannelSelectMenuBuilder({
                customId: 'config/select/setChannel',
                placeholder: 'Selecione um canal',
                channelTypes: [ChannelType.GuildText],
            }),

            setVoiceChannels: new ChannelSelectMenuBuilder({
                customId: 'config/select/setVoiceChannels',
                channelTypes: [
                    ChannelType.GuildVoice,
                    ChannelType.GuildStageVoice,
                ],
                placeholder: 'Selecione os canais',
                maxValues: 10,
            }),
        },
    }

    // -> Interações
    // Comando
    @Slash({
        name: 'config-server',
        description: 'Vamo fazer o setup desse server',
        defaultMemberPermissions: ['ManageGuild'],
    })
    async run(interaction: CommandInteraction<'cached'>) {
        interaction.reply(this.menus.mainMenu(interaction.guild))
    }

    // Botões
    @ButtonComponent({ id: 'config/button/home' })
    async homeButton(interaction: ButtonInteraction<'cached'>) {
        interaction.update(this.menus.mainMenu(interaction.guild))
    }

    @ButtonComponent({ id: 'config/button/channels' })
    async channelButton(interaction: ButtonInteraction<'cached'>) {
        await interaction.deferUpdate()

        const channels = await this.database.channels.findUnique({
            where: { guildId: interaction.guild.id },
        })

        await interaction.editReply(this.menus.channels(channels!))
    }

    @ButtonComponent({ id: 'config/button/channels/clearVoice' })
    async clearVoiceChannelsButton(interaction: ButtonInteraction<'cached'>) {
        await interaction.deferUpdate()

        const channels = await this.database.channels.update({
            where: { guildId: interaction.guild.id },
            data: { voice: [] },
        })

        await interaction.editReply(this.menus.channels(channels!))
    }

    // Menus de Seleção
    @SelectMenuComponent({ id: 'config/select/channelCategory' })
    async selectChannelCategory(
        interaction: StringSelectMenuInteraction<'cached'>
    ) {
        const category = interaction.values[0] as TChannelType
        this.selectedCategory = category

        const channels = await this.database.channels.findUnique({
            where: { guildId: interaction.guildId },
        })

        interaction.update(this.menus.configChannel(category, channels!))
    }

    @SelectMenuComponent({ id: 'config/select/setChannel' })
    @SelectMenuComponent({ id: 'config/select/setVoiceChannels' })
    async selectSetChannel(
        interaction: ChannelSelectMenuInteraction<'cached'>
    ) {
        const channel = interaction.values

        await interaction.deferUpdate()

        let channels: Channels

        switch (this.selectedCategory) {
            case 'logs':
                channels = await this.database.channels.update({
                    where: { guildId: interaction.guild.id },
                    data: {
                        logs: channel[0],
                    },
                })
                break
            case 'leave':
                channels = await this.database.channels.update({
                    where: { guildId: interaction.guild.id },
                    data: {
                        leave: channel[0],
                    },
                })
                break
            case 'welcome':
                channels = await this.database.channels.update({
                    where: { guildId: interaction.guild.id },
                    data: {
                        welcome: channel[0],
                    },
                })
                break
            case 'voice':
                channels = await this.database.channels.update({
                    where: { guildId: interaction.guildId },
                    data: {
                        voice: [...channel],
                    },
                })
                break
        }

        interaction.editReply(this.menus.channels(channels))
    }
}
