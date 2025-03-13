import { Session, User } from "@prisma/client";
import { GoogleUser } from "../interface/interface";
import { AuthUser } from "../services/User";
import { AuthSession } from "../services/Session";

interface UserWithAuth {
  data: User;
  error: string;
  session: Session;
}

export const createSession = async (
  user: GoogleUser
): Promise<UserWithAuth> => {
  try {
    //   find user exists
    const currentUser = await AuthUser.findUser(user.email);
    if (!currentUser) {
      return { error: "no user found", data: null, session: null };
    }

    // create session for user
    const session = await AuthSession.createSession(currentUser);

    if (!session) {
      return {
        error: "problem in creating a new session",
        data: currentUser,
        session: null,
      };
    }

    return { error: null, data: currentUser, session };
  } catch (err) {
    console.log("inside createsession helper ", err);

    return {
      error: "something went wrong please try after sometime",
      data: null,
      session: null,
    };
  }
};
