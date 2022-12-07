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
    const { courseId, location } = req.body;
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
    if (
      Math.sqrt(
        (+runningClass.location.latitude - +location.latitude) *
          (+runningClass.location.latitude - +location.latitude) +
          (+runningClass.location.longitude - +location.longitude) *
            (+runningClass.location.longitude - +location.longitude)
      ) > 25
    ) {
      return res
        .status(400)
        .json({ error: true, message: "You are  too far from class" });
    }
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

const getClassById = async (req, res) => {
  try {
    const { classId } = req.query;
    const foundClass = await Class.findById(classId, { __v: 0 }).populate(
      "students",
      "name registrationNo -_id"
    );
    res.status(200).json({
      error: false,
      data: foundClass,
      message: "Available Class found",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

export {
  startClass,
  dismissClass,
  markAttendance,
  getClassesByCourseId,
  getClassById,
};
