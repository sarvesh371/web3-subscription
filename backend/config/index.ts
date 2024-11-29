import "dotenv/config";
import { z } from "zod";

const envVariables = z.object({
  DB_HOST: z.string(),
  DB_USER: z.string(),
  DB_DATABASE: z.string(),
  DB_PASSWORD: z.string(),
  DB_PORT: z.string(),
  SERVER_PORT: z.string(),
  SSL: z.string(),
});

const env = envVariables.parse(process.env);

export const {
  DB_HOST,
  DB_USER,
  DB_DATABASE,
  DB_PASSWORD,
  DB_PORT,
  SERVER_PORT,
  SSL,
} = env;
