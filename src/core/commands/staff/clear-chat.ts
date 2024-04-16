import { Logger } from '@services';
import {
  ApplicationCommandOptionType,
  CommandInteraction,
  EmbedBuilder,
  GuildMember,
  User,
  bold,
  userMention,
  type GuildTextBasedChannel,
} from 'discord.js';
import { Discord, Slash, SlashOption } from 'discordx';
import { injectable } from 'tsyringe';

@Discord()
@injectable()
export class ClearChatCommand {
  constructor(private readonly logger: Logger) {}

  @Slash({
    name: 'clear-chat',
    description: 'Deleta determinadas mensagens do chat',
    defaultMemberPermissions: ['ManageMessages'],
  })
  async run(
    @SlashOption({
      name: 'quatidate',
      description: 'Preciso apagar quantas mensagens?',
      type: ApplicationCommandOptionType.Integer,
      required: false,
    })
    amount: number | undefined,
    @SlashOption({
      name: 'usuario',
      description: 'Algum membro em especifico?',
      type: ApplicationCommandOptionType.User,
      required: false,
    })
    user: GuildMember | User | undefined,
    interaction: CommandInteraction<'cached'>
  ) {
    const channel = interaction.channel as GuildTextBasedChannel;

    const toDeleteAmount = amount ?? 10;

    const embed = new EmbedBuilder()
      .setTimestamp()
      .setAuthor({
        name: interaction.user.username,
        iconURL: interaction.user.displayAvatarURL(),
      })
      .setColor('Green');

    await channel.messages.fetch();

    if (user) {
      const messages = channel.messages.cache
        .filter((msg) => msg.author.id === user.id)
        .first(toDeleteAmount);

      await channel
        .bulkDelete(messages, true)
        .then(async (value) => {
          await interaction.reply({
            embeds: [
              embed
                .setTitle('Mensages apagadas!')
                .setDescription(
                  `Um total de **${
                    value.size
                  }** mensages do usuario ${userMention(
                    user.id
                  )} foram apagadas.`
                ),
            ],
          });
        })
        .catch(async (err) => {
          await interaction.reply({
            embeds: [
              embed
                .setColor('Red')
                .setTitle(':x: Ocorreu um erro desconhecido'),
            ],
          });
          this.logger.error('clear command', err);
        });
    } else {
      await channel
        .bulkDelete(toDeleteAmount, true)
        .then(async (value) => {
          await interaction.reply({
            embeds: [
              embed
                .setTitle('Mensages apagadas!')
                .setDescription(
                  `Um total de **${value.size}** mensages foram apagadas.`
                ),
            ],
          });
        })
        .catch(async (err) => {
          await interaction.reply({
            embeds: [
              embed
                .setColor('Red')
                .setTitle(':x: Ocorreu um erro desconhecido'),
            ],
          });
          this.logger.error('clear command', err);
        });
    }
  }
}
