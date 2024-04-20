import { z } from 'zod';

const envSchema = z.object({
  BOT_TOKEN: z.string(),
});

export const env = envSchema.parse(process.env);

type Env = z.infer<typeof envSchema>;

declare global {
  namespace NodeJS {
    interface ProcessEnv extends Env {}
  }
}

export {};
