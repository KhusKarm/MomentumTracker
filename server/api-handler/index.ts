import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "../routes";

// 💡 Caches the initialized Express app instance
let cachedApp: express.Application | null = null;

async function initializeApp() {
    // Return cached instance if it exists (for warm function starts)
    if (cachedApp) {
        return cachedApp;
    }

    const app = express();

    // 1. Middleware Setup (synchronous)
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));

    // 2. Logging/Tracing Middleware (synchronous)
    app.use((req, res, next) => {
        // ... Your logging logic ...
        next();
    });

    // 3. Route Registration (AWAIT THE ASYNCHRONOUS SETUP)
    await registerRoutes(app);

    // 4. Error Handler Setup (synchronous)
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
        const status = err.status || err.statusCode || 500;
        const message = err.message || "Internal Server Error";

        res.status(status).json({ message });
        console.error(err);
    });

    // Cache the fully initialized app
    cachedApp = app;
    return app;
}

// 💡 The main Vercel Serverless Function handler
// This pattern guarantees initialization is complete before the request is processed.
export default async (req: Request, res: Response) => {
    try {
        const app = await initializeApp();
        // Manually dispatch the request to the Express app
        app(req, res);
    } catch (error) {
        console.error("Initialization Failed:", error);
        res.status(500).send("Server initialization failed.");
    }
};
