import { Router } from "express";
import multer from "multer";
import { ingestSop } from "../services/ingestion.service";

const router = Router();
const upload = multer({ dest: "uploads/" });

router.post("/ingest", upload.single("file"), async (req, res) => {
  try {
    const adminToken = req.headers["x-admin-upload-token"];

    if (adminToken !== process.env.ADMIN_UPLOAD_TOKEN) {
      return res.status(401).json({ error: "Unauthorized upload request" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const result = await ingestSop(req.file.path, req.file.originalname);

    return res.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error("INGEST ERROR:", error);
    return res.status(500).json({
      error: "Ingestion failed",
      details: error?.message || "Unknown error",
    });
  }
});

export default router;