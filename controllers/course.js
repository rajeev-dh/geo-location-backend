import Class from "../models/Class.js";
import Course from "../models/Course.js";

const createCourse = async (req, res) => {
  try {
    const { courseName } = req.body;
    const courseCode = generateCourseCode(6);
    const newCourse = await new Course({
      courseName,
      courseCode,
      teacher: req.user._id,
    }).save();
    res.status(201).json({
      error: false,
      data: newCourse,
      message: "Course Created successfully",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

const getCourses = async (req, res) => {
  try {
    const query =
      req.user.role === "student"
        ? { students: req.user._id }
        : { teacher: req.user._id };
    const courses = await Course.find(query);
    res
      .status(200)
      .json({ error: false, data: courses, message: "Available Course found" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

const enrollCourse = async (req, res) => {
  try {
    const { courseCode } = req.body;
    const studentId = req.user._id;
    const course = await Course.findOne({ courseCode });
    if (!course)
      return res
        .status(404)
        .json({ error: false, message: "Course not found" });
    const studentCourse = await Course.findOne({
      courseCode,
      students: studentId,
    });
    if (studentCourse)
      return res
        .status(400)
        .json({ error: true, message: "Student already enrolled" });
    const enrolledCourse = await Course.findOneAndUpdate(
      { courseCode },
      { $push: { students: studentId } },
      { new: true }
    );
    res.status(200).json({
      error: false,
      data: enrolledCourse,
      message: "Course Enrollment Done",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

const getCourseById = async (req, res) => {
  try {
    const { courseId } = req.query;
    const course = await Course.findById(courseId).populate(
      "students",
      "registrationNo name"
    );
    if (!course)
      return res
        .status(404)
        .json({ error: false, message: "Course not found" });
    res.status(200).json({
      error: false,
      data: course,
      message: "Course Found successfully",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

const deleteCourseById = async (req, res) => {
  try {
    const { courseId } = req.query;
    const deletedCourse = await Course.findByIdAndDelete(courseId);
    if (!deletedCourse)
      return res.status(404).json({ error: true, message: "Course not found" });
    await Class.deleteMany({ courseId });
    res
      .status(200)
      .json({ error: true, message: "Course deleted successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

export {
  createCourse,
  getCourses,
  enrollCourse,
  getCourseById,
  deleteCourseById,
};

const generateCourseCode = (count) => {
  let chars = "acdefhiklmnoqrstuvwxyz0123456789".split("");
  let result = "";
  for (let i = 0; i < count; i++) {
    let x = Math.floor(Math.random() * chars.length);
    result += chars[x];
  }
  return result;
};
