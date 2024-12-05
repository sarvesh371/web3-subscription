import { env } from "./env.ts";
import {  assertEquals } from "jsr:@std/assert/";
import { SubsPost, SubsGet, SubsDelete } from "./main.ts";
import { hc } from "hono/client";
const BASE_URL = `http://localhost:${env.DB_PORT}/api/subs/`; // Note the /api at the end




// Helper function to get full test server URL
const getUrl = (path: string) => `${BASE_URL}${path}`;


const test_config = {
	lister_wallet: "0x123",
	name: "test",
	details: "test",
	amount: 10,
	currency: "USD",
	period: 1,
	status: "ACTIVE",
	already_bought: 100,
};


Deno.test("get /api/ working", async () => {
	const res = await fetch(getUrl("/"));
	const data = await res.json();
	console.log(res.status,200);
	assertEquals(res.headers.get("content-type"), "application/json");

	if (!data.ok) {
		throw new Error(`Failed to fetch /api/: ${data.message}`);
	}
	console.log(res.status, 200);
	assertEquals(data.message, "Hello World");
});

Deno.test("post /api/subs working", async () => {
	const client =  hc<SubsPost>(BASE_URL);
	const res = await client.api.subs.index.$post({
	
		json: { 
 		...test_config
		}
	} , {headers:{"Content-Type":"application/json"}});
	const data = await res.json();
	console.log(res.status, 200);
	if (!data.ok) {
		throw new Error(`Failed to fetch /api/subs: ${data.message}`);
	}
	assertEquals(data.message, "successfully created");

});

Deno.test("get /api/subs/:id", async () => {
	const client =  hc<SubsGet>(BASE_URL);
	const res = await client.api.subs[":id"].$get({ param: { id: "test" } });
	const data = await res.json();
	assertEquals(res.status, 200);

	if (!data.ok) {
		throw new Error(`Failed to fetch /api/subs/test: ${data.message}`);
	}
	assertEquals(data.message.at(0)?.name, "test");
});

Deno.test("delete /api/subs/:id", async () => {
	const client = hc<SubsDelete>(BASE_URL);
	const res = await client.api.subs[":id"].$delete({ param: { id: "test" } });
	const data = await res.json();
	assertEquals(res.status, 200);

	//? 
	if (!data.ok) {
		throw new Error(`Failed to fetch /api/subs/test: ${data.message}`);
	}

	assertEquals(data.message, "test");
});
