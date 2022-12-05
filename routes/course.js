import { Router } from "express";

import {
  createCourse,
  enrollCourse,
  getCourses,
} from "../controllers/course.js";

const router = Router();

router.post("/createCourse", createCourse);
router.get("/getCourses", getCourses);
router.post("/enrollCourse", enrollCourse);

export default router;
