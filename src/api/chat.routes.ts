import { Router } from "express";
import { answerQuestion } from "../services/chat.service";

const router = Router();

router.post("/chat", async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || typeof query !== "string") {
      return res.status(400).json({ error: "Query required" });
    }

    const result = await answerQuestion(query);
    return res.json(result);
  } catch (error: any) {
    console.error("CHAT ERROR:", error);
    return res.status(500).json({
      error: "Chat failed",
      details: error?.message || "Unknown error"
    });
  }
});

export default router;