import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

import "jsr:@std/dotenv/load"


export const env = createEnv({
	server: {
		DB_HOST: z
			.string()
			.min(1, "Database host cannot be empty")
			.default(Deno.env.get("DB_HOST") ?? "1"),
		DB_USER: z
			.string()
			.min(3, "Database user must be at least 3 characters")
			.default(Deno.env.get("DB_USER") ?? "1"),
		DB_DATABASE: z
			.string()
			.min(1, "Database name cannot be empty")
			.default(Deno.env.get("DB_DATABASE") ?? "1"),
		DB_PASSWORD: z
			.string()
			.min(8, "Password must be at least 8 characters")
			.default(Deno.env.get("DB_PASSWORD") ?? "1"),
		DB_PORT: z
			.number()
			.int()
			.positive()
			.min(1024)
			.max(65535)
			.default(JSON.parse(Deno.env.get("DB_PORT") ?? "6543")),
		SERVER_PORT: z
			.number()
			.int()
			.positive()
			.min(1024)
			.max(65535)
			.default(JSON.parse(Deno.env.get("SERVER_PORT") ?? "8080")),
		SSL: z
			.enum(["true", "false"])
			.transform((val) => val === "true")
			.default("false"),
	},
	runtimeEnv: { ...Deno.env.toObject()  , DB_PORT :JSON.parse(Deno.env.get("DB_PORT") ?? "6543"), SERVER_PORT:JSON.parse(Deno.env.get("SERVER_PORT") ?? "8000"), SSL:Deno.env.get("SSL") ?? "false"},
});

