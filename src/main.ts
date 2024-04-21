import 'core-js'
import { dirname, importx } from '@discordx/importer'
import { CustomItents as CustomIntents } from '@magicyan/discord'
import { Client, DIService, tsyringeDependencyRegistryEngine } from 'discordx'
import { container } from 'tsyringe'
import { env } from '@lib/env'

async function run() {
    DIService.engine = tsyringeDependencyRegistryEngine.setInjector(container)

    const client = new Client({
        intents: CustomIntents.All,
    })

    container.registerInstance(Client, client)

    await importx(`${dirname(import.meta.url)}/core/**/*.ts`)
    await client.login(env.BOT_TOKEN)
}

void run()
