import 'core-js';
import { dirname, importx } from '@discordx/importer';
import { CustomItents as CustomIntents } from '@magicyan/discord';
import { Client, DIService, tsyringeDependencyRegistryEngine } from 'discordx';
import { container } from 'tsyringe';

async function run() {
  DIService.engine = tsyringeDependencyRegistryEngine.setInjector(container);

  const client = new Client({
    intents: CustomIntents.All,
  });

  await importx(`${dirname(import.meta.url)}/core/**/*.ts`);

  await client.login(process.env.BOT_TOKEN!);
}

void run();
