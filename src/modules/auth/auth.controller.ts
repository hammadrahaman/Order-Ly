import { Request, Response } from "express";
import { signupOwner, loginUser } from "./auth.service";

export async function signup(req: Request, res: Response) {
  try {
    const result = await signupOwner(req.body);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    const result = await loginUser(email, password);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
}
