import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import Router from "./routes/index";
import { SERVER_PORT } from './config/index';

// === 1 - CREATE SERVER ===
const server = express();

// CONFIGURE HEADER INFORMATION
const allowedOrigins =
    ["PRODUCTION_URL",
    "LOCALHOST_URL"];
server.use(
    cors({
        origin: allowedOrigins,
        credentials: true, // Allow cookies and credentials
    }),
);
server.disable("x-powered-by"); //Reduce fingerprinting
server.use(cookieParser());
server.use(express.urlencoded({ extended: false }));
server.use(express.json());


// === 4 - CONFIGURE ROUTES ===
// Connect Route handler to server
Router(server);

// === 5 - START UP SERVER ===
server.listen(SERVER_PORT, () => {
    console.log(`Server running on http://localhost:${SERVER_PORT}`);
}); 