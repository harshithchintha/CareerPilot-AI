import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { clerkMiddleware } from "@clerk/express";
import { publishableKeyFromHost } from "@clerk/shared/keys";
import {
  CLERK_PROXY_PATH,
  clerkProxyMiddleware,
  getClerkProxyHost,
} from "./middlewares/clerkProxyMiddleware";
import router from "./routes";
import { logger } from "./lib/logger";
import pinoHttp from "pino-http";

const app = express();

app.use(pinoHttp({ logger }));

// Clerk proxy must come before body parsers
app.use(CLERK_PROXY_PATH, clerkProxyMiddleware());

app.use(cors({ credentials: true, origin: true }));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

// Resolve publishable key from request host (supports custom domains) if secret key is present
if (process.env.CLERK_SECRET_KEY) {
  app.use(
    clerkMiddleware((req) => ({
      publishableKey: publishableKeyFromHost(
        getClerkProxyHost(req) ?? "",
        process.env.CLERK_PUBLISHABLE_KEY,
      ),
    })),
  );
}

// API Routes
app.use("/api", router);

// Serve static frontend build if present (for single-container Render deployments)
const staticPaths = [
  path.resolve(import.meta.dirname, "../../career-copilot/dist/public"),
  path.resolve(process.cwd(), "artifacts/career-copilot/dist/public")
];

for (const staticPath of staticPaths) {
  if (fs.existsSync(staticPath)) {
    app.use(express.static(staticPath));
    app.get("*", (req, res, next) => {
      if (req.path.startsWith("/api")) return next();
      res.sendFile(path.join(staticPath, "index.html"));
    });
    break;
  }
}

export default app;
