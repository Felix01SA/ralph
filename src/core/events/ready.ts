import { Discord, Once, type ArgsOf, type Client } from 'discordx';
import { injectable } from 'tsyringe';
import { Database, Logger } from '@services';

@Discord()
@injectable()
export class ReadyEvent {
  constructor(
    private readonly logger: Logger,
    private readonly database: Database
  ) {}

  @Once({ event: 'ready' })
  async event([clientEvent]: ArgsOf<'ready'>, client: Client) {
    await client.initApplicationCommands();

    await this.database.syncAllGuilds(client);

    this.logger.star('Tô ON!', clientEvent.user.username);
  }
}
