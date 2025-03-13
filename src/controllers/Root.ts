import { Response } from "express";
import { RequestWithUser } from "../interface/interface";
import { prisma } from "../config/client";
import { parseTime } from "../utils/parseTime";
import { parseDate } from "../utils/parseDate";
import { nanoid } from "nanoid";
import { parseDateAndTime } from "../utils/parseDateAndTime";

export class Root {
  static async home(req: RequestWithUser, res: Response): Promise<void> {
    const [quizzes, reports] = await Promise.all([
      prisma.quiz.findMany({
        where: {
          semester: req.user.semester,
        },
      }),
      prisma.report.findMany({
        where: {
          user: {
            id: req.user.id,
          },
        },
      }),
    ]);

    const isTeacher = req.user.role === "TEACHER";

    if (isTeacher) {
      res.redirect("/quiz");
    } else {
      res.render("home/home", {
        title: "home",
        picture: req.user.picture,
        quizzes: quizzes
          .filter((quiz) => new Date() < new Date(quiz.endingDate))
          .map((quiz) => ({
            ...quiz,
            examCompleted: !!reports.find(
              (report) => report.quizId === quiz.id
            ),
            isActive: new Date() >= new Date(quiz.startingDate),
            timeLimitInFormat: parseTime(quiz.timeLimit * 60),
            startingDateInFormat: parseDateAndTime(
              quiz.startingDate.toISOString()
            ).trim(),
            endingDateInFormat: parseDate(quiz.endingDate.toISOString()).trim(),
          })),
      });
    }
  }

  static async startQuiz(req: RequestWithUser, res: Response) {
    try {
      if (!req.params?.quizId) {
        return res.redirect("/home?_error=id was not provided");
      }
      // check whether user has already given the exam

      const report = await prisma.report.findFirst({
        where: {
          user: {
            id: req.user.id,
          },
          quiz: {
            id: req.params.quizId,
          },
        },
      });

      if (report) {
        return res.redirect("/home?_error=you can only give quiz once.");
      }

      const quiz = await prisma.quiz.findFirst({
        where: { id: req.params.quizId },
        include: { Questions: true },
      });

      if (!quiz) return res.redirect("/home?_error=quiz not available");

      const startingDateForQuiz = new Date(quiz.startingDate);
      const endingDateForQuiz = new Date(quiz.endingDate);
      const currentDate = new Date();

      if (currentDate < startingDateForQuiz) {
        return res.redirect("/home");
      }

      if (currentDate > endingDateForQuiz) {
        return res.redirect("/home");
      }

      res.render("home/take-quiz", {
        layout: "main",
        quiz,
      });
    } catch (err) {
      console.log("err in quiz controller", err);
      return res.redirect(
        "/home?_error=something went wrong please try again later"
      );
    }
  }

  static async showUserProfile(
    req: RequestWithUser,
    res: Response
  ): Promise<void> {
    const user = req.user;

    res.render("home/profile", {
      user: {
        name: user.name,
        role: user.role,
        email: user.email,
        picture: user.picture,
      },
    });
  }

  static async generateReport(
    req: RequestWithUser,
    res: Response
  ): Promise<void> {
    try {
      const userExamData = req.body;

      if (!userExamData.examId) {
        console.log("no id found");
        return;
      }
      const userAnswers: { [key: string]: number } = {};

      userExamData.userAnswers.forEach(
        (userAnswer: { userAnswer: number; id: string }) => {
          userAnswers[`${userAnswer.id}`] = userAnswer.userAnswer;
        }
      );

      const quiz = await prisma.quiz.findFirst({
        where: { id: userExamData.examId },
        include: { Questions: true },
      });

      if (!quiz) {
        console.log("quiz not found");
        return;
      }

      const questionsWithUserAnswers: any = [];
      let totalCorrectAnswers = 0;
      let totalIncorrectAnswers = 0;
      let notAnswered = 0;
      quiz.Questions.forEach((question) => {
        questionsWithUserAnswers.push({
          ...question,
          userAnswer: userAnswers[question.id],
        });
        if (userAnswers[question.id] === -1) {
          notAnswered++;
          return;
        }

        if (userAnswers[question.id] === question.correctAnswer) {
          totalCorrectAnswers++;
          return;
        }

        totalIncorrectAnswers++;
        return;
      });

      const totalCorrectAnswersMarks =
        totalCorrectAnswers * quiz.marksPerQuestion;
      const totalIncorrectAnswersMarks =
        totalIncorrectAnswers * quiz.negativeMarksPerQuestion;
      const totalMarks = totalCorrectAnswersMarks - totalIncorrectAnswersMarks;
      const outOf = quiz.marksPerQuestion * quiz.Questions.length;
      const testCompletedInString = parseTime(
        quiz.timeLimit * 60 - userExamData.totalTimeTakenByUser
      );

      const data = {
        quizMarksDetails: {
          totalCorrectAnswers,
          totalIncorrectAnswers,
          totalNotAnswered: notAnswered,
          marksPerQuestion: quiz.marksPerQuestion,
          negativeMarksPerQuestion: quiz.negativeMarksPerQuestion,
          totalMarks,
          outOf,
          testCompletedInString,
          testCompletedIn:
            quiz.timeLimit * 60 - userExamData.totalTimeTakenByUser,
          totalQuestions: quiz.Questions.length,
          timeLimit: quiz.timeLimit,
        },
        questions: questionsWithUserAnswers,
      };
      const report = await prisma.report.create({
        data: {
          id: nanoid(),
          quizId: quiz.id,
          userId: req.user.id,
          score: `${totalMarks}/${outOf}`,
          data: JSON.stringify(data),
        },
      });

      if (!report) {
        console.log("something went wrong while creating report");
        return;
      }

      res.redirect("/home");
    } catch (err) {
      console.log(err, "err in Root controller");
    }
  }

  // : quizzes.filter((quiz) => new Date() > new Date(quiz.endingDate))

  // static async readQuiz(req: RequestWithUser, res: Response): Promise<void> {
  //   const response = await prisma.quiz.findMany({
  //     include: { Questions: { include: { options: true, subject: true } } },
  //   });

  //   console.log(response);

  //   res.render("home/all-quiz", {
  //     quizzes: response.map((quiz) => ({
  //       title: quiz.title,
  //       description: quiz.description,
  //       id: quiz.id,
  //       date: quiz.date,
  //       isActive: new Date(quiz.date) > new Date(),
  //     })),
  //   });
  // }

  static async showAnnouncements(
    req: RequestWithUser,
    res: Response
  ): Promise<void> {
    const announcements = await prisma.announcement.findMany({
      where: {
        semester: req.user.semester,
      },
      orderBy: { updatedAt: "desc" },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    res.render("home/announcements", {
      announcements: announcements.map((announcement) => ({
        ...announcement,
        createdAt: parseDate(announcement.createdAt.toISOString()),
      })),
    });
  }
}
