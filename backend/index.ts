import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import Router from "./routes/index";
import { SERVER_PORT } from './config/index';

// Initialize the Express application
const app = express();

// Middleware configuration
const allowedOrigins = [
    "PRODUCTION_URL",
    "LOCALHOST_URL"
];

// CORS configuration
app.use(cors({
    origin: allowedOrigins,
    credentials: true, // Allow cookies and credentials
}));

app.disable("x-powered-by"); // reduce fingerprinting
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Connect Route handler to server
app.use("/api", Router); // Prefix all routes with /api

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error("Error occurred:", err);
    res.status(500).json({
        status: "failed",
        message: "Internal Server Error",
    });
});

// Start the server
app.listen(SERVER_PORT, () => {
    console.log(`Server running on http://localhost:${SERVER_PORT}`);
}); 