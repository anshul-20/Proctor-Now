import { Router } from "express";
import { Quiz } from "../controllers/Quiz";

const router = Router();

router.get("/", Quiz.allQuiz);
router.get("/add", Quiz.addQuiz);
router.post("/add/callback", Quiz.addQuizCallback);
router.get("/edit/:quizId", Quiz.editQuiz);
router.post("/edit/callback", Quiz.editQuizCallback);
router.delete("/delete/:quizId", Quiz.deleteQuiz);

export default router;
