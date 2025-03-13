import { User } from "@prisma/client";
import { prisma } from "../config/client";

export class AuthUser {
  static async createUser(user: User): Promise<User> {
    try {
      const newUser = await prisma.user.create({
        data: {
          email: user.email,
          name: user.name,
          picture: "",
          role: user.role,
          semester: user.semester,
        },
      });

      return newUser;
    } catch (err) {
      console.log("err in user service", err);
      return null;
    }
  }
  static async getAllUsers(): Promise<User[]> {
    try {
      const users = await prisma.user.findMany();

      if (!users) {
        return null;
      }

      return users;
    } catch (err) {
      console.log("err in error in db user controller", err);
      return null;
    }
  }
  static async findUser(email: string): Promise<User> {
    try {
      const user = await prisma.user.findFirst({ where: { email } });

      if (!user) return null;

      return user;
    } catch (err) {
      console.log("inside AuthUser service", err);
      return null;
    }
  }

  static async deleteUser(userId: string) {
    try {
      const user = await prisma.user.delete({ where: { id: userId } });

      return true;
    } catch (err) {
      console.log("err in user services", err);
      return null;
    }
  }
}
