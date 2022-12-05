import Course from "../models/Course.js";

const createCourse = async (req, res) => {
  try {
    const { courseName, teacher } = req.body;
    const courseCode = generateCourseCode(6);
    const newCourse = await new Course({
      courseName,
      courseCode,
      teacher,
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
      req.user === "student"
        ? { students: req.user_id }
        : { teacher: req.user._id };
    const courses = await Course.find(query, { students: 0, __v: 0 });
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
    const { courseCode, studentId } = req.body;
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
      { $push: { students: studentId } }
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

export { createCourse, getCourses, enrollCourse };

const generateCourseCode = (count) => {
  var chars = "acdefhiklmnoqrstuvwxyz0123456789".split("");
  var result = "";
  for (var i = 0; i < count; i++) {
    var x = Math.floor(Math.random() * chars.length);
    result += chars[x];
  }
  return result;
};
