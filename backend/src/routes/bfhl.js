import { Router } from "express";
import { handlePost, handleGet } from "../controllers/bfhlController.js";

const router = Router();

router.get("/", handleGet);
router.post("/", handlePost);

export default router;
