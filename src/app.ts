import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import ingestRoutes from "./api/ingest.routes";
import chatRoutes from "./api/chat.routes";

dotenv.config();

const app = express();

// FIXED CORS (allows frontend to call backend)
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());

// Health check route
app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

// Routes
app.use("/api", ingestRoutes);
app.use("/api", chatRoutes);

// Start server
const port = Number(process.env.PORT || 3001);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});