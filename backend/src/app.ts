import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes";
import journalRoutes from "./routes/journal.routes";
import insightRoutes from "./routes/insight.routes";

const app = express();

app.set("trust proxy", 1);

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/journal", journalRoutes);
app.use("/api/insights", insightRoutes);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

export default app;
