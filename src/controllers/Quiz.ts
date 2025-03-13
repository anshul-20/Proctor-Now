import { Response } from "express";
import { RequestWithUser } from "../interface/interface";
import { nanoid } from "nanoid";
import { prisma } from "../config/client";
import { parseTime } from "../utils/parseTime";
import { parseDate } from "../utils/parseDate";
import { parseDateAndTime } from "../utils/parseDateAndTime";

export class Quiz {
  static async allQuiz(req: RequestWithUser, res: Response): Promise<void> {
    const quizzes = await prisma.quiz.findMany({
      orderBy: { createdAt: "desc" },

      include: {
        User: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    const information: any = {};
    if ("_success" in req.query) {
      information.success = req.query["_success"];
    }
    if ("_error" in req.query) {
      information.error = req.query["_error"];
    }

    res.render("quiz/all-quiz", {
      quizzes: quizzes
        .filter((quiz) => new Date() <= new Date(quiz.endingDate))
        .map((quiz) => ({
          ...quiz,
          isEditable: quiz.userId === req.user.id,
          isActive: new Date() >= new Date(quiz.startingDate),
          timeLimitInFormat: parseTime(quiz.timeLimit * 60),
          startingDateInFormat: parseDateAndTime(
            quiz.startingDate.toISOString()
          ).trim(),
          endingDateInFormat: parseDate(quiz.endingDate.toISOString()).trim(),
        })),
      information,
    });
  }

  static async addQuiz(req: RequestWithUser, res: Response): Promise<void> {
    res.render("quiz/add-quiz", {
      route: "showaddquiz route",
    });
  }

  static async addQuizCallback(
    req: RequestWithUser,
    res: Response
  ): Promise<void> {
    try {
      const quiz = req.body;

      const newQuiz = await prisma.quiz.create({
        data: {
          userId: req.user.id,
          id: nanoid(),
          title: quiz.title,
          semester: quiz.semester,
          description: quiz.description,
          endingDate: new Date(quiz.endingDate),
          startingDate: new Date(quiz.startingDate),
          timeLimit: parseInt(quiz.timeLimit),
          marksPerQuestion: parseFloat(quiz.marksPerQuestion),
          negativeMarksPerQuestion: parseFloat(quiz.negativeMarksPerQuestion),
          subject: quiz.subject,
          Questions: {
            create: quiz.questions.map((question: any) => ({
              id: nanoid(),
              question: question.question,
              correctAnswer: question.correctAnswerIndex,
              options: question.options,
            })),
          },
        },
      });

      if (!newQuiz)
        res.status(400).render("quiz/add-quiz", {
          error: "Something went wrong please try again later",
        });

      res.redirect("/quiz");
    } catch (err) {
      console.log(err);
      res.render("quiz/add-quiz", { error: err.message });
    }
  }

  static async editQuiz(req: RequestWithUser, res: Response): Promise<void> {
    const quizId = req.params.quizId;
    const quiz = await prisma.quiz.findFirst({
      where: { id: quizId },
      include: { Questions: true },
    });
    if (!quiz) {
      return res.redirect("/quiz");
    }

    res.render("quiz/edit-quiz", {
      id: quizId,
      error: "",
      quiz,
      startingDate: new Date(quiz.startingDate).toISOString().split(".")[0],
      endingDate: new Date(quiz.endingDate).toISOString().split(".")[0],
    });
  }

  static async editQuizCallback(
    req: RequestWithUser,
    res: Response
  ): Promise<void> {
    try {
      const quiz = req.body;
      console.log(quiz);

      res
        .status(200)
        .redirect("/quiz?_error=editing exams is not supported yet.");

      // const response = await prisma.quiz.update({
      //   where: { id: quiz.id },
      //   data: {
      //     title: quiz.title,
      //     description: quiz.description,
      //     endingDate: new Date(quiz.endingDate),
      //     startingDate: new Date(quiz.startingDate),
      //     timeLimit: parseInt(quiz.timeLimit),
      //     marksPerQuestion: parseFloat(quiz.marksPerQuestion),
      //     negativeMarksPerQuestion: parseFloat(quiz.negativeMarksPerQuestion),
      //     subject: quiz.subject,
      //     Questions: {
      //       create: quiz.questions
      //         .filter((question: any) => question.isNewQuestion)
      //         .map((question: any) => ({
      //           id: nanoid(),
      //           question: question.question,
      //           options: question.options,
      //           correctAnswer: question.correctAnswerIndex,
      //         })),
      //       update: quiz.questions
      //         .filter((question: any) => !question.isNewQuestion)
      //         .map((question: any) => ({
      //           id: question.id,
      //           question: question.question,
      //           options: question.options,
      //           correctAnswer: question.correctAnswerIndex,
      //         })),
      //       deleteMany: quiz.removedQuestions.map(
      //         (question: any) => question.id
      //       ),
      //     },
      //   },
      // });
      // if (response) {
      //   return res.status(200).redirect("/quiz?_success=updated the quiz");
      // }
    } catch (err) {
      console.log("error in quiz controller", err);
      res
        .status(500)
        .redirect("/quiz?_error=something went wrong please try again later");
    }
  }

  static async deleteQuiz(req: RequestWithUser, res: Response) {
    if (!req.params?.quizId)
      return res.redirect("/quiz?_error='id not provided'");

    await prisma.quiz.delete({ where: { id: req.params.quizId } });

    res.redirect("/quiz?_success='quiz deleted successfully'");
  }
}
