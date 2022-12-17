import Class from "../models/Class.js";
import Course from "../models/Course.js";

const startClass = async (req, res) => {
  try {
    const { courseId, location, radius } = req.body;
    const runningClass = await Class.findOne({ courseId, active: true });
    if (runningClass)
      return res
        .status(400)
        .json({ error: true, message: "Already Have a running class" });
    const newClass = await new Class({
      courseId,
      location,
      radius,
      createdDate: new Date(),
    }).save();
    await Course.updateOne({ _id: courseId }, { activeClass: true, radius });
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
    const { courseId } = req.body;
    const oldClass = await Class.findOneAndUpdate(
      { courseId, active: true },
      { active: false }
    );
    await Course.updateOne({ _id: courseId }, { activeClass: false });
    if (!oldClass)
      return res
        .status(404)
        .json({ error: true, message: "No running Class found" });
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
        .json({ error: true, message: "No running class found" });
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
      ) > runningClass.radius
    ) {
      return res
        .status(400)
        .json({ error: true, message: "You are too far from class" });
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
    res.status(200).json({
      error: false,
      data: classes,
      message: `Available classes found: ${classes.length}`,
    });
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
      "name registrationNo"
    );
    if (!foundClass)
      return res.status(404).json({
        error: true,
        message: "Class not found",
      });
    res.status(200).json({
      error: false,
      data: foundClass,
      message: `${foundClass.students.length} student found`,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

const deleteClassById = async (req, res) => {
  try {
    const { classId } = req.query;
    const deletedClass = await Class.findByIdAndDelete(classId);
    if (!deletedClass)
      return res.status(404).json({ error: true, message: "Class not found" });
    res
      .status(200)
      .json({ error: false, message: "Class deleted successfully" });
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
  deleteClassById,
};
