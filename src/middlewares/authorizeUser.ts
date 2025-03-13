import { NextFunction, Response } from "express";
import { Role } from "@prisma/client";
import { RequestWithUser } from "../interface/interface";

export const authorizeUser = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (req.user.role !== Role.TEACHER) {
    res.redirect("/home");
    return;
  }

  next();
};
