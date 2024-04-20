import { Database, Logger } from '@services';
import { Discord, On, type ArgsOf } from 'discordx';
import { injectable } from 'tsyringe';

@Discord()
@injectable()
export class GuildDeleteEvent {
  constructor(
    private readonly logger: Logger,
    private readonly database: Database
  ) {}

  @On({ event: 'guildDelete' })
  async event([guild]: ArgsOf<'guildDelete'>) {
    const guildData = await this.database.guild.findFirst({
      where: { id: guild.id, deleted: false },
    });

    if (!guildData) return;

    await this.database.guild.update({
      where: { id: guild.id },
      data: {
        deleted: true,
      },
    });

    this.logger.info('Guild deleted:', guild.name);
  }
}
