import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";

import { env } from "./env.js";
import userRoutes from "./routes/user.routes.js";
import invoiceRoutes from "./routes/invoice.routes.js";

const app = express();

// middleware
app.use(express.json());
app.use(cookieParser());
// app.use("/uploads", express.static("uploads"));
app.use(cors({ origin: env.client, credentials: true }));
app.use(helmet());
app.use(morgan("dev"));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

// routes
app.use("/api/auth", userRoutes);
app.use("/api/invoices", invoiceRoutes);

// start server
mongoose.connect(env.mongo).then(() => {
  app.listen(env.port, () => {
    console.log(`Server running on http://localhost:${env.port}`);
  });
});
