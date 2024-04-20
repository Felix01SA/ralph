import { Database, Logger } from '@services';
import { Discord, On, type ArgsOf, type Client } from 'discordx';
import { injectable } from 'tsyringe';

@Discord()
@injectable()
export class GuildCreateEvent {
  constructor(
    private readonly database: Database,
    private readonly logger: Logger
  ) {}

  @On({ event: 'guildCreate' })
  async event([guild]: ArgsOf<'guildCreate'>) {
    const dataGuild = await this.database.guild.findUnique({
      where: { id: guild.id },
    });

    if (dataGuild) return;

    await this.database.guild.create({
      data: {
        id: guild.id,
        channels: {
          connectOrCreate: {
            where: {
              guildId: guild.id,
            },
            create: {
              guildId: guild.id,
            },
          },
        },
      },
    });

    this.logger.info('New guild:', guild.name);
  }
}
