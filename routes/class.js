import { Router } from "express";

import {
  startClass,
  dismissClass,
  markAttendance,
  getClassesByCourseId,
  getClassById,
  getAllAttendanceByCourseIdInExcel,
} from "../controllers/class.js";

const router = Router();

router.post("/startClass", startClass);
router.post("/dismissClass", dismissClass);
router.post("/markAttendance", markAttendance);
router.get("/getClassesByCourseId", getClassesByCourseId);
router.get("/getClassById", getClassById);
router.get(
  "/getAllAttendanceByCourseIdInExcel",
  getAllAttendanceByCourseIdInExcel
);

export default router;
