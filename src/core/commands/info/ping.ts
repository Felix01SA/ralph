import {
  CommandInteraction,
  EmbedBuilder,
  InteractionCollector,
  bold,
} from 'discord.js';
import {
  Client,
  Discord,
  SimpleCommand,
  SimpleCommandMessage,
  Slash,
} from 'discordx';
import { injectable } from 'tsyringe';
import { Logger } from '@services';

@Discord()
@injectable()
export class PingCommand {
  constructor(private logger: Logger) {}

  @Slash({ name: 'ping', description: 'Retorna o ping do BOT.' })
  @SimpleCommand({ name: 'ping', aliases: ['p'] })
  async ping(
    command: CommandInteraction<'cached'> | SimpleCommandMessage,
    client: Client
  ) {
    const ping = client.ws.ping;

    const embed = new EmbedBuilder()
      .setTimestamp()
      .setColor('Orange')
      .setTitle('Pong! :ping_pong:')
      .setDescription(`O ping é ${bold(ping.toString())}ms`);

    if (command instanceof CommandInteraction) {
      await command.reply({ embeds: [embed] });
    } else {
      await command.message.reply({ embeds: [embed] });
    }
  }
}
