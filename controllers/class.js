import Class from "../models/Class.js";

const startClass = async (req, res) => {
  try {
    const { courseId, location } = req.body;
    const runningClass = await Class.findOne({ courseId, active: true });
    if (runningClass)
      return res
        .status(400)
        .json({ error: true, message: "Already Have a running class" });
    const newClass = await new Class({ courseId, location }).save();
    res.status(201).json({
      error: false,
      data: newClass,
      message: "Class created successfully",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

const dismissClass = async (req, res) => {
  try {
    const { classId } = req.body;
    const oldClass = await Class.findByIdAndUpdate(classId, { active: false });
    if (!oldClass)
      return res.status(404).json({ error: true, message: "Class not found" });
    res.status(200).json({
      error: false,
      message: "Class dismissed successfully",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

const markAttendance = async (req, res) => {
  try {
    const { courseId } = req.body;
    const studentId = req.user._id;
    const runningClass = await Class.findOne({ courseId, active: true });
    if (!runningClass)
      return res
        .status(404)
        .json({ error: false, message: "No running class not found" });
    const classId = runningClass._id;
    const studentClass = await Class.findOne({
      _id: classId,
      students: studentId,
    });
    if (studentClass)
      return res
        .status(400)
        .json({ error: true, message: "Student already marked Attendance" });
    const newClass = await Class.findByIdAndUpdate(classId, {
      $push: { students: studentId },
    });
    res.status(200).json({
      error: false,
      message: "Class Attendance marked successfully",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

const getClassesByCourseId = async (req, res) => {
  try {
    const { courseId } = req.query;
    const query =
      req.user.role === "student"
        ? { students: req.user._id, courseId }
        : { courseId };
    const classes = await Class.find(query);
    res
      .status(200)
      .json({ error: false, data: classes, message: "Available Course found" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

export { startClass, dismissClass, markAttendance, getClassesByCourseId };
