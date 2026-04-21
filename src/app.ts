import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import ingestRoutes from "./api/ingest.routes";
import chatRoutes from "./api/chat.routes";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: ["http://localhost:3000"],
  })
);

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api", ingestRoutes);
app.use("/api", chatRoutes);

const port = Number(process.env.PORT || 3001);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
const allowedOrigins = [
  "http://localhost:3000",
  process.env.FRONTEND_URL,
].filter(Boolean);