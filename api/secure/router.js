import express from "express";

import aiRouter from "./ai/ai.router.js";
import userRouter from "./user/user.router.js";
import authRouter from "./auth/auth.router.js";
import fileRouter from "./file/file.router.js";

const router = express.Router();

router.use("/user", userRouter);
router.use("/auth", authRouter);
router.use("/ai", aiRouter);
router.use("/file", fileRouter);

export default router;
