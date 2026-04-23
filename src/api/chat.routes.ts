import { Router } from "express";
import { answerQuestion } from "../services/chat.service";

const router = Router();

router.post("/chat", async (req, res) => {
  try {
    const query = req.body?.query;
    const domain = req.body?.domain;

    if (!query || typeof query !== "string") {
      return res.status(400).json({ error: "Query required" });
    }

    if (!domain || !["technical", "finance"].includes(domain)) {
      return res.status(400).json({ error: "Valid domain is required" });
    }

    const result = await answerQuestion(query, domain);
    return res.json(result);
  } catch (error: any) {
    console.error("CHAT ERROR:", error);
    return res.status(500).json({
      error: "Chat failed",
      details: error?.message || "Unknown error",
    });
  }
});

export default router;