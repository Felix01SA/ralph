import { type Client, Discord, On, type ArgsOf } from 'discordx';

@Discord()
export class InteractionCreateEvent {
  @On({ event: 'interactionCreate' })
  async event([interaction]: ArgsOf<'interactionCreate'>, client: Client) {
    await client.executeInteraction(interaction);
  }
}
