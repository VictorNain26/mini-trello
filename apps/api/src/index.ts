import "dotenv/config"
import express, { type Request, type Response } from "express"
import logger        from "morgan"
import path          from "node:path"
import cors          from "cors"
import rateLimit     from "express-rate-limit"
import pug           from "pug"

import { ExpressAuth } from "@auth/express"
import { authConfig }  from "./config/auth.config.js"

import {
  errorHandler,
  errorNotFoundHandler,
} from "./middleware/error.middleware.js"
import {
  currentSession,
  authenticatedUser,
} from "./middleware/auth.middleware.js"

export const app = express()
app.set("port", process.env.PORT ?? 3000)

/* ───────────── Views (Pug) ───────────── */
app.engine("pug", pug.__express as any)
app.set("views", path.join(import.meta.dirname, "..", "views"))
app.set("view engine", "pug")

/* ───────────── Middlewares généraux ───── */
app.set("trust proxy", true)                // si derrière un proxy
app.use(logger("dev"))
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173",
    credentials: true,
  }),
)
app.use(express.static(path.join(import.meta.dirname, "..", "public")))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(currentSession)

/* ───────────── Rate-limit (auth only) ─── */
app.use(
  "/api/auth",
  rateLimit({ windowMs: 60_000, max: 30 }), // 30 req/min IP
)

/* ───────────── Auth.js — WILDCARD NOMMÉ ──
 * Express 5 utilise path-to-regexp v8 → `*` seul
 * n’est plus autorisé. Il faut :rest(.*)
 */
app.use("/api/auth/:rest(.*)", ExpressAuth(authConfig))

/* ───────────── Routes demo ────────────── */
app.get("/", (_req: Request, res: Response) =>
  res.render("index", {
    title: "Express Auth Example",
    user: res.locals.session?.user,
  }),
)

app.get(
  "/protected",
  authenticatedUser,
  (_req: Request, res: Response) =>
    res.render("protected", { session: res.locals.session }),
)

app.get(
  "/api/protected",
  authenticatedUser,
  (_req: Request, res: Response) => res.json(res.locals.session),
)

/* ───────────── Error handlers ─────────── */
app.use(errorNotFoundHandler)
app.use(errorHandler)
