import { Request } from "express";
import { Role } from "@prisma/client";

export interface Query {
  [key: string]: string;
}

export interface RequestWithUser extends Request {
  user: {
    role: Role;
    email: string;
    name: string;
    id: string;
    picture: string;
    semester: number;
  };
}

export interface GoogleUser {
  id: string;
  name: string;
  email: string;
  picture: string;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
}

export interface QuizQuestions {
  question: string;
  correctAnswer: string;
  subject: string;
  options: { [key: string]: string };
}

export interface QuizData {
  title: string;
  description: string;
  questions: QuizQuestions[];
  date: Date;
}
