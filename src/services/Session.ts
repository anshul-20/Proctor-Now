import { Session, User } from "@prisma/client";
import { prisma } from "../config/client";
import { nanoid } from "nanoid";
import { getExpiryDate } from "../utils/getExpiryDate";

interface SessionWithUser extends Session {
  user: User;
}

export class AuthSession {
  static async findSession(sessionId: string): Promise<SessionWithUser> {
    try {
      const session = await prisma.session.findFirst({
        where: { id: sessionId },
        include: {
          user: true,
        },
      });

      if (!session) {
        return null;
      }

      return session;
    } catch (err) {
      console.log("err in auth session services", err);
      return null;
    }
  }

  static async createSession(userInfo: User): Promise<Session> {
    try {
      const newSession = await prisma.session.create({
        data: {
          id: nanoid(),
          userId: userInfo.id,
          expiresAt: getExpiryDate(),
        },
      });

      if (!newSession) return null;
      return newSession;
    } catch (err) {
      console.log("inside session services ", err);
      return null;
    }
  }

  static async deleteSession(sessionId: string): Promise<void> {
    try {
      const deletedSession = await prisma.session.delete({
        where: { id: sessionId },
      });
    } catch (err) {
      console.log("err in auth session services", err);
      return null;
    }
  }
}
