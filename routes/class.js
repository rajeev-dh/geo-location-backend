import { Router } from "express";

import {
  startClass,
  dissmissClass,
  markAttendance,
} from "../controllers/class.js";

const router = Router();

router.post("/startClass", startClass);
router.post("/dissmissClass", dissmissClass);
router.post("/markAttendance", markAttendance);

export default router;
