import { Request, Response } from "express";
import { getUsersGoogleData, googleAuthUrl } from "../strategy/google";
import { Query } from "../interface/interface";
import { prisma } from "../config/client";
import { createSession } from "../helpers/helper";
import { getExpiryDate } from "../utils/getExpiryDate";

export class Auth {
  static signIn(req: Request, res: Response): void {
    const information: any = {};
    if ("_success" in req.query) {
      information.success = req.query["_success"];
    }
    if ("_error" in req.query) {
      information.error = req.query["_error"];
    }

    res.render("auth/signin", { googleAuthUrl, information, layout: "main" });
  }

  static async signInCallback(
    req: Request<{}, {}, {}, Query>,
    res: Response
  ): Promise<void> {
    try {
      if (!req.query?.code) {
        res.render("auth/signin", {
          error: "something went wrong please try again later!!",
        });
        return;
      }
      const code = req.query.code;

      const userInfo = await getUsersGoogleData(code);

      const user = await createSession(userInfo);

      if (user.error) {
        res.redirect(`/auth/google?_error=${user.error}`);
        return;
      }

      if (!user.session && user.error) {
        res.redirect(`/auth/google?_error=${user.error}`);
        return;
      }

      res.cookie("sid", user.session.id, {
        signed: true,
        httpOnly: true,
        expires: getExpiryDate(),
      });
      res.redirect("/home");
    } catch (err) {
      console.log(err);
      console.log(err.message, "inside error block bro!");
      res.redirect(
        `/auth/google?_error=something went wrong please try again later`
      );
    }
  }

  static async logOut(req: Request, res: Response): Promise<void> {
    const sid = req.signedCookies.sid;

    await prisma.session.delete({ where: { id: sid } });

    res.clearCookie("sid", {
      httpOnly: true,
      signed: true,
    });

    res.redirect("/auth/google");
  }
}
