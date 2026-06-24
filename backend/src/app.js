import express from "express";
import cors from "cors";
import bfhlRouter from "./routes/bfhl.js";
import { MESSAGES } from "./constants/index.js";

const app = express();

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      /\.onrender\.com$/,
    ],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health route
app.get("/", (req, res) => {
  res.json({ status: "ok", message: MESSAGES.SERVER_RUNNING });
});

// API routes
app.use("/bfhl", bfhlRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ is_success: false, message: MESSAGES.ROUTE_NOT_FOUND });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ is_success: false, message: MESSAGES.INTERNAL_ERROR });
});

export default app;
