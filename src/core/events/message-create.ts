import { Discord, On, type ArgsOf, type Client } from 'discordx';

@Discord()
export class MessageCreateEvent {
  @On({ event: 'messageCreate' })
  async event([message]: ArgsOf<'messageCreate'>, client: Client) {
    client.executeCommand(message);
  }
}
