import { env } from "./env.ts";
import { assertEquals } from "jsr:@std/assert/";

const BASE_URL = `http://localhost:${env.DB_PORT}/api`; // Note the /api at the end

// Helper function to get full test server URL
const getUrl = (path: string) => `${BASE_URL}${path}`;

Deno.test("get /api/ working", async () => {
	const res = await fetch(getUrl("/"));
	const data = await res.json();
	assertEquals(res.status, 200);
	assertEquals(res.headers.get("content-type"), "application/json");

	if (!data.ok) {
		throw new Error(`Failed to fetch /api/: ${data.message}`);
	}
	assertEquals(data.message, "Hello World");
});

Deno.test("post /api/subs working", async () => {
	const res = await fetch(getUrl("/subs"), {
		method: "POST",
		body: JSON.stringify({
			lister_wallet: "0x123",
			name: "test",
			details: "test",
			amount: 10,
			currency: "USD",
			period: 1,
			status: "ACTIVE",
			already_bought: 0,
		}),
		headers: {
			"Content-Type": "application/json",
		},
	});
	const data = await res.json();
	assertEquals(res.status, 200);
	assertEquals(res.headers.get("content-type"), "application/json");

	if (!data.ok) {
		throw new Error(`Failed to fetch /api/subs: ${data.message}`);
	}
	assertEquals(data.message, "successfully created");
});

Deno.test("get /api/subs/:id", async () => {
	const res = await fetch(getUrl("/subs/test"));
	const data = await res.json();
	assertEquals(res.status, 200);
	assertEquals(res.headers.get("content-type"), "application/json");

	if (!data.ok) {
		throw new Error(`Failed to fetch /api/subs/test: ${data.message}`);
	}

	assertEquals(data.message, {
		lister_wallet: "0x123",
		name: "test",
		details: "test",
		amount: 10,
		currency: "USD",
		period: 1,
		status: "ACTIVE",
		already_bought: 0,
	});
});

Deno.test("delete /api/subs/:id", async () => {
	const res = await fetch(getUrl("/subs/test"), {
		method: "DELETE",
	});
	const data = await res.json();
	assertEquals(res.status, 200);
	assertEquals(res.headers.get("content-type"), "application/json");

	if (!data.ok) {
		throw new Error(`Failed to fetch /api/subs/test: ${data.message}`);
	}
	assertEquals(data.message, "test");
});
