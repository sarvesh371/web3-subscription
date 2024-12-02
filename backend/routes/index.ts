import { Application, Request, Response } from "express";
import { CreateSubscriptionList, DeleteSubscriptionList } from "../controllers/subscription";

const Router = (server: Application) => {
  // home route with the get method and a handler
  server.get("/home", (req: Request, res: Response) => {
    try {
      res.status(200).json({
        status: "success",
        data: [],
        message: "Welcome to our API homepage!",
      });
    } catch (err) {
      res.status(500).json({
        status: "failed",
        data: [],
        message: "Internal Server Error",
      });
    }
  });
  server.post("/subs", CreateSubscriptionList);
  server.delete("/subs/:name", DeleteSubscriptionList);
};
export default Router;
