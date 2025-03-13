import { google } from "googleapis";
import dotenv from "dotenv";
import { GoogleUser } from "../interface/interface";
dotenv.config();

export const oauth2Client = new google.auth.OAuth2({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: process.env.GOOGLE_CALLBACK_URL,
});

export const googleAuthUrl = oauth2Client.generateAuthUrl({
  scope: ["profile", "email"],
  access_type: "offline",
});

google.options({ auth: oauth2Client });

export const getUsersGoogleData = async (code: string): Promise<GoogleUser> => {
  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const data = google.oauth2({
      version: "v2",
    });
    const userData = await data.userinfo.get();

    return {
      email: userData.data.email,
      name: userData.data.name,
      id: userData.data.id,
      picture: userData.data.picture,
    };
  } catch (err) {
    console.log(err);
  }
};
