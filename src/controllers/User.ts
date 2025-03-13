import { Role } from "@prisma/client";
import { Response } from "express";
import { RequestWithUser } from "../interface/interface";
import { AuthUser } from "../services/User";
import { nanoid } from "nanoid";
import { prisma } from "../config/client";
import { parseDate } from "../utils/parseDate";
import { parseTime } from "../utils/parseTime";

export class DbUser {
  static async allUsers(req: RequestWithUser, res: Response) {
    const users = await AuthUser.getAllUsers();

    if (!users) {
      console.log("no user found");
    }

    res.render("users/all-users", {
      users: users
        .filter((user) => user.email !== req.user.email)
        .map((user) => ({ ...user, isUserStudent: user.role === "STUDENT" })),
    });
  }

  static async editUser(req: RequestWithUser, res: Response) {
    try {
      if (!req.params?.id) return res.redirect("/users");
      const user = await prisma.user.findFirst({
        where: { id: req.params.id },
      });

      if (!user) {
        return res.redirect("/users");
      }

      res.render("users/edit-user", {
        user,
        isEditingUserTeacher: user.role === "TEACHER",
      });
      return null;
    } catch (err) {
      console.log("err in user controlller", err);
      return null;
    }
  }

  static async editUserCallback(req: RequestWithUser, res: Response) {
    try {
      if (!req.params?.id) return res.redirect("/users");

      if (
        !req.body?.email ||
        !req.body?.name ||
        !req.body?.semester ||
        !req.body?.role
      ) {
        return res.render("users/edit-user", {
          error: "invalid data provided",
        });
      }

      const newUser = await prisma.user.update({
        where: { id: req.params.id },
        data: {
          email: req.body.email,
          name: req.body.name,
          role: req.body.role,
          semester: parseInt(req.body.semester),
          updatedAt: new Date(),
        },
      });

      if (!newUser)
        return res.render("users/edit-user", {
          error: "something went wrong",
        });

      res.redirect("/users");
    } catch (err) {
      console.log("err inside user controller", err);
      return null;
    }
  }

  static async addUser(req: RequestWithUser, res: Response) {
    res.render("users/add-user");
  }

  static async addUserCallback(req: RequestWithUser, res: Response) {
    // const { email, name, year, semester, role } = req.body;
    if (
      !req.body?.email ||
      !req.body?.name ||
      !req.body?.semester ||
      !req.body?.role
    ) {
      return res.render("users/add-user", {
        error: "invalid data provided",
      });
    }

    try {
      const user = await AuthUser.findUser(req.body.email);
      if (user) {
        return res.render("users/add-user", {
          error: "user already exists",
        });
      }

      const currentUser = {
        email: req.body.email,
        name: req.body.name,
        picture: "",
        role: req.body.role,
        year: parseInt(req.body.year),
      };

      const newUser = await AuthUser.createUser({
        email: req.body.email as string,
        name: req.body.name as string,
        picture: "",
        role: req.body.role as Role,
        id: nanoid(),
        createdAt: new Date(),
        updatedAt: new Date(),
        semester: parseInt(req.body.semester as string),
      });

      if (!newUser) {
        return res.render("users/add-user", {
          error: "something went wrong please try again later",
        });
      }

      res.redirect("/users");
    } catch (err) {
      console.log("err in user controller", err);
      res.render("users/add-user", {
        error: "something went wrong",
      });
    }
  }

  static async deleteUser(req: RequestWithUser, res: Response) {
    if (!req.params?.id) return res.redirect("/users");
    await AuthUser.deleteUser(req.params.id);
    res.redirect("/users");
  }

  static async showUserReports(
    req: RequestWithUser,
    res: Response
  ): Promise<void> {
    try {
      if (!req.params.userId) {
        return res.redirect("/users");
      }

      const reports = await prisma.report.findMany({
        where: {
          userId: req.params.userId,
        },
        include: {
          quiz: true,
        },
      });

      if (!reports) {
        console.log("no report found");
      }

      return res.render("users/reports", {
        reports: reports.map((report) => ({
          ...report,
          startingDateInFormat: parseDate(
            report.quiz.startingDate.toISOString()
          ),
          endingDateInFormat: parseDate(report.quiz.endingDate.toISOString()),
          timeLimitInFormat: parseTime(report.quiz.timeLimit * 60),
        })),
      });
    } catch (err) {
      console.log(err);
    }
  }
}
