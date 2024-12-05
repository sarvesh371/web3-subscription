import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";

import { SubSchema, postSubscription, deleteSubscription, getSubscription } from "./db.ts";
import { env } from "./env.ts";
import { consola } from "npm:consola";
const app = new Hono();

app.get("/", (c) => {
	console.log("Done Get Home");
	return c.json({ ok: true, message: "Hello World" });
});

const subs_post = app.post(
	"/api/subs/",
	zValidator("json", SubSchema, (result, c) => {
		console.log(result);
		if (!result.success) {
			c.text("not valid schema for the subscription");
		}
	}),
	async (c) => {
		const { amount, currency, details, lister_wallet, name, period, status, already_bought } = c.req.valid("json");
		c.json({ ok: true, message: "Hello World" });
		try {
			await postSubscription({
				lister_wallet,
				name,
				details,
				amount,
				currency,
				period,
				status,
				already_bought,
			});
			consola.box("Done Post Subscription", name , );
			return c.json({ ok: true, message: "successfully created" });
		} catch (error) {
			return c.json({ ok: false, error: error });
		}
	},
);

const subs_get = app.get("/api/subs/:id", async (c) => {
	// Changed this - params are handled differently
	const id = c.req.param("id"); // Use param instead of query validator for URL parameters
	const subs = await getSubscription(id);
	consola.box("Done Get Subscription", subs);
	return c.json({ ok: true, message: subs });
});

const subs_delete = app.delete("/api/subs/:id", async (c) => {
	// Changed this - params are handled differently
	const id = c.req.param("id"); // Use param instead of query validator for URL parameters
	await deleteSubscription(id);
	consola.box("Done Delete Subscription", id);
	return c.json({ ok: true, message: id });
});

if (import.meta.main) {
	Deno.serve({ port: env.DB_PORT }, app.fetch);
	consola.info(`Listening on port ${env.DB_PORT}`);
}

export type SubsPost = typeof subs_post;
export type SubsGet = typeof subs_get;
export type SubsDelete = typeof subs_delete;
