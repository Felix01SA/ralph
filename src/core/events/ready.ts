import { Discord, Once, type ArgsOf, type Client } from 'discordx';
import { injectable } from 'tsyringe';
import { Logger } from '@services';

@Discord()
@injectable()
export class ReadyEvent {
  constructor(private readonly logger: Logger) {}

  @Once({ event: 'ready' })
  async event([clientEvent]: ArgsOf<'ready'>, client: Client) {
    await client.initApplicationCommands();

    this.logger.star('Tô ON!', clientEvent.user.username);
  }
}
