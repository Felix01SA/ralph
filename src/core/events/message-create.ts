import { Database } from '@services'
import { Discord, On, type ArgsOf, type Client } from 'discordx'
import { injectable } from 'tsyringe'

@Discord()
@injectable()
export class MessageCreateEvent {
    constructor(private readonly database: Database) {}
    @On({ event: 'messageCreate' })
    async event([message]: ArgsOf<'messageCreate'>, client: Client) {
        await this.database.syncUser(message.author.id)
        client.executeCommand(message)
    }
}
