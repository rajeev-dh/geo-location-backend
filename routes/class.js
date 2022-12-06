import { Router } from "express";

import {
  startClass,
  dismissClass,
  markAttendance,
  getClassesByCourseId,
} from "../controllers/class.js";

const router = Router();

router.post("/startClass", startClass);
router.post("/dismissClass", dismissClass);
router.post("/markAttendance", markAttendance);
router.get("/getClassesByCourseId", getClassesByCourseId);

export default router;
