import { Router } from "express";
import { Auth } from "../controllers/Auth";
const router = Router();

router.get("/google", Auth.signIn);

router.get("/google/callback", Auth.signInCallback);

router.get("/logout", Auth.logOut);

export default router;
