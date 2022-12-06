import { Router } from "express";

import {
  startClass,
  dissmissClass,
  markAttendance,
  getClassesByCourseId,
} from "../controllers/class.js";

const router = Router();

router.post("/startClass", startClass);
router.post("/dissmissClass", dissmissClass);
router.post("/markAttendance", markAttendance);
router.get("/getClassesByCourseId", getClassesByCourseId);

export default router;
