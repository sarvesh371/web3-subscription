import { Request, Response } from "express";
import { runQuery } from "../utils/postgres";

export async function CreateSubscriptionList(req: Request, res: Response): Promise<void> {
    const { lister_wallet, name, details, amount, currency, period } = req.body;

    try {
        // Validate that we don't have same name subscription in the list
        const subscriptionList = await runQuery(
            `SELECT * FROM public.subscriptions_list WHERE name = '${name}'`
        );

        // Return an error if the subscription already exists
        if (subscriptionList && subscriptionList.length > 0) {
            res.status(400).json({
                status: "error",
                data: [],
                message: "There is already a subscription with this name !!",
            });
            return;
        }
        // Write the data to the database
        await runQuery(
            `INSERT INTO subscriptions_list 
            (lister_wallet, name, details, amount, status, currency, period) 
            VALUES (
                '${lister_wallet}', 
                '${name}', 
                '${details}', 
                ${amount}, 
                'ACTIVE', 
                '${currency}', 
                '${period}'
            )`
        );
        
        // Return success when 
        res.status(201).json({
            status: "success",
            data: [
                {
                    "lister_wallet": lister_wallet,
                    "name": name,
                }
            ],
            message:
                "Your subscription has been listed successfully !!",
        });
        return;
    } catch (err) {
      res.status(500).json({
        status: "error",
        data: [],
        message: "Internal Server Error",
      });
    }
  }