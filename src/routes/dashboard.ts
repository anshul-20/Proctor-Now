import { Router } from "express";
import { Dashboard } from "../controllers/Dashboard";

const router = Router();

router.get("/", Dashboard.home);

export default router;
