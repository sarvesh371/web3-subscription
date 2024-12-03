import { createClient, type PostgrestError } from "jsr:@supabase/supabase-js@2.46.2"; 
import { env } from "./env.ts";
import { z } from "zod";
import { Database } from "./types.ts";

export const db = createClient<Database>(env.DB_HOST, env.DB_USER);



export const SubSchema = z.object({
	lister_wallet: z.string().min(1, "Wallet address cannot be empty"),
	name: z.string().min(1, "Name cannot be empty"),
	details: z.string().min(1, "Details cannot be empty").optional(),
	amount: z.number().min(1, "Amount cannot be empty"),
	currency: z.string().min(1, "Currency cannot be empty"),
	period: z.number().min(1, "Period cannot be empty"),
	status: z.string().min(1, "Status cannot be empty"),
	already_bought: z.number().min(1, "Already Bought cannot be empty").optional().nullable(), // ? int4
	created_at: z.string().optional().nullable(),
}); 


/**
 * 
 * @param subscription 
 * @returns Promise<Error | void>
 * 
 * @example 
 * PostSubscription({
 *     lister_wallet: "0x123",
 *     name: "test",
 *     details: "test",
 *     amount: 10,
 *     currency: "USD",
 *     period: 1,
 *     status: "ACTIVE",
 *     already_bought: 0,
 *     created_at: new Date(),
 * })=> Promise<Error | void>
 */

export const postSubscription = async (subscription: z.infer<typeof SubSchema>) => {
    const { data, error } = await db
        .from("subscriptions_list")
        .insert(subscription);
    
    if (error) {
        throw new Error(error.message) as PostgrestError;
    }

    console.log("successfully inserted", data);
    return;
};

/**
 * 
 * @param id 
 * @returns Promise<z.infer<typeof SubSchema>[]| Error>
 * @example 
 * getSubscription("test")=> Promise<z.infer<typeof SubSchema>[]| Error>
 */
export const getSubscription = async (id: string)  => { 
    const { data , error } = await db
        .from("subscriptions_list")
        .select("*")
        .eq("name", id);//? better than Raw sql IMO

    if (error ) {
        throw new Error(error?.message ?? "Invalid data");
    }
    return data;
};


/**
 * 
 * @param id 
 * @returns void
 * @example
 * deleteSubscription("test")=> void // successfully deleted 
 */
export const deleteSubscription = async (id: string) => {
    const { data, error } = await db
        .from("subscriptions_list")
        .delete()
        .eq("name", id);

    if (error) {
        throw new Error(error.message);
    }

    console.log("successfully deleted", {name:id , data});
    return;
};












