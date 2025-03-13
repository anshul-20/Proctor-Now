import { Response } from "express";
import { RequestWithUser } from "../interface/interface";

export class Dashboard {
  static home(req: RequestWithUser, res: Response): void {
    res.send("hello only teachers can see this page bro!");
  }
}
