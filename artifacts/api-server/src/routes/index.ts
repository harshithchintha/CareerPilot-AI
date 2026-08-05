import { Router, type IRouter } from "express";
import healthRouter from "./health";
import usersRouter from "./users";
import resumesRouter from "./resumes";
import jobsRouter from "./jobs";
import interviewsRouter from "./interviews";
import roadmapsRouter from "./roadmaps";
import coverlettersRouter from "./coverletters";
import chatRouter from "./chat";
import dashboardRouter from "./dashboard";
import projectsRouter from "./projects";
import questionsRouter from "./questions";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/users", usersRouter);
router.use("/resumes", resumesRouter);
router.use("/jobs", jobsRouter);
router.use("/interviews", interviewsRouter);
router.use("/roadmaps", roadmapsRouter);
router.use("/cover-letters", coverlettersRouter);
router.use("/chat", chatRouter);
router.use("/dashboard", dashboardRouter);
router.use("/projects", projectsRouter);
router.use("/questions", questionsRouter);

export default router;
