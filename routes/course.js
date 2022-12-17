import { Router } from "express";

import {
  createCourse,
  deleteCourseById,
  enrollCourse,
  getCourseById,
  getCourses,
  sendAttendanceViaMail,
} from "../controllers/course.js";

const router = Router();

router.post("/createCourse", createCourse);
router.get("/getCourses", getCourses);
router.post("/enrollCourse", enrollCourse);
router.get("/getCourseById", getCourseById);
router.get("/sendAttendanceViaMail", sendAttendanceViaMail);
router.delete("/deleteCourseById", deleteCourseById);

export default router;
