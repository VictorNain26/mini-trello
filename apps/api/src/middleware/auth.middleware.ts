import type { Request, Response, NextFunction } from "express"
import { getSession } from "@auth/express"
import { authConfig } from "../config/auth.config.js"

/** Attach the current session to res.locals */
export async function currentSession(req: Request, res: Response, next: NextFunction) {
   
  res.locals.session = await (getSession as any)(req, res, authConfig).catch(() => null)
  next()
}

/** Ensure a user is authenticated before proceeding */
export async function authenticatedUser(req: Request, res: Response, next: NextFunction) {
   
  const session = res.locals.session ?? (await (getSession as any)(req, res, authConfig).catch(() => null))
  if (!session?.user) {
    res.status(401).redirect("/login")
    return
  }
  res.locals.session = session
  next()
}
