import { Router } from "express";

import {
  createCourse,
  deleteCourseById,
  enrollCourse,
  getCourseById,
  getCourses,
} from "../controllers/course.js";

const router = Router();

router.post("/createCourse", createCourse);
router.get("/getCourses", getCourses);
router.post("/enrollCourse", enrollCourse);
router.get("/getCourseById", getCourseById);
router.delete("/deleteCourseById", deleteCourseById);

export default router;
