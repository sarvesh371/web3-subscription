import "dotenv/config";
import { z } from "zod";

// added .min() for sensitive fields  like password
// added .trim() to remove accidental spaces, tabs etc

declare global {
	namespace NodeJs {
		interface ProcessEnv extends z.infer<typeof envVariables> {}
	}
}


const envVariables = z.object({
  DB_HOST: z.string().min(1, "Database host cannot be empty"),
  DB_USER: z.string().min(3, "Database user must be at least 3 characters"),
  DB_DATABASE: z.string().min(1, "Database name cannot be empty"),
  DB_PASSWORD: z.string().min(8, "Password must be at least 8 characters"),
  DB_PORT: z.number().int().positive().min(1024).max(65535),
  SERVER_PORT: z.number().int().positive().min(1024).max(65535),
  SSL: z.enum(['true', 'false']).transform(val => val === "true")
});


const config : z.infer<typeof envVariables> = { 
  DB_HOST : process.env.DB_HOST?? "",
  DB_USER : process.env.DB_USER??"",
  DB_DATABASE : process.env.DB_DATABASE??"",
  DB_PASSWORD : process.env.DB_PASSWORD??"",
  DB_PORT : Number(process.env.DB_PORT)??0,
  SERVER_PORT : Number(process.env.SERVER_PORT)??0,
  SSL : JSON.parse(process.env.SSL??"false")
}

export const { DB_HOST, DB_USER, DB_DATABASE, DB_PASSWORD, DB_PORT, SERVER_PORT, SSL } = envVariables.parse(config);

