import "dotenv/config";
import { z } from "zod";

// added .min() for sensitive feilds like password
// added .trim() to remove accidental spaces, tabs etc

const envVariables = z.object({
  DB_HOST: z.string().min(1, "Database host cannot be empty"),
  DB_USER: z.string().min(3, "Database user must be at least 3 characters"),
  DB_DATABASE: z.string().min(1, "Database name cannot be empty"),
  DB_PASSWORD: z.string().min(8, "Password must be at least 8 characters"),
  DB_PORT: z.coerce.number().int().positive().min(1024).max(65535),
  SERVER_PORT: z.coerce.number().int().positive().min(1024).max(65535),
  SSL: z.enum(['true', 'false']).transform(val => val === 'true')
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