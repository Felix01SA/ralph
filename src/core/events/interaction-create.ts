import { Database } from '@services'
import { type Client, Discord, On, type ArgsOf } from 'discordx'
import { injectable } from 'tsyringe'

@Discord()
@injectable()
export class InteractionCreateEvent {
    constructor(private readonly database: Database) {}

    @On({ event: 'interactionCreate' })
    async event([interaction]: ArgsOf<'interactionCreate'>, client: Client) {
        await this.database.syncUser(interaction.user.id)

        await client.executeInteraction(interaction)
    }
}
