import { Router } from "express";

import {
  createCourse,
  enrollCourse,
  getCourseById,
  getCourses,
} from "../controllers/course.js";

const router = Router();

router.post("/createCourse", createCourse);
router.get("/getCourses", getCourses);
router.post("/enrollCourse", enrollCourse);
router.get("/getCourseById", getCourseById);

export default router;
