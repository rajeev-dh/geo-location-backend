import path from "path";

import Class from "../models/Class.js";
import Course from "../models/Course.js";
import { exportToExcel } from "../utils/genrateExcel.js";

const startClass = async (req, res) => {
  try {
    const { courseId, location } = req.body;
    const runningClass = await Class.findOne({ courseId, active: true });
    if (runningClass)
      return res
        .status(400)
        .json({ error: true, message: "Already Have a running class" });
    const newClass = await new Class({
      courseId,
      location,
      createdDate: new Date(),
    }).save();
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
        .json({ error: false, message: "No running class found" });
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
      message: "Available classes found",
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
      return res.status(404).json({ error: false, message: "Class not found" });
    res.status(200).json({
      error: false,
      data: foundClass,
      message: "Class found successfully",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

const getAllAttendanceByCourseIdInExcel = async (req, res) => {
  const workSheetName = "students";
  const filePath = "./attendance.xlsx";
  try {
    const { courseId } = req.query;
    const classes = await Class.find({ courseId });
    const classesDates = classes.map((cls) =>
      cls.createdDate.toLocaleDateString("pt-PT")
    );
    const workSheetColumnName = [
      "Registration No",
      "Student Name",
      ...classesDates,
    ];
    const course = await Course.findById(courseId).populate(
      "students",
      "name registrationNo"
    );
    const users = course.students;
    let userList = [];
    for (let i = 0; i < users.length; i++) {
      let d = [users[i].registrationNo, users[i].name];
      for (let j = 0; j < classes.length; j++) {
        if (
          classes[j].students.find(
            (stu) => stu.toString() === users[i]._id.toString()
          )
        ) {
          d = [...d, "P"];
        } else {
          d = [...d, ""];
        }
      }
      userList.push(d);
    }
    exportToExcel(userList, workSheetColumnName, workSheetName, filePath);
    res.sendFile(path.resolve(filePath));
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
  getAllAttendanceByCourseIdInExcel,
};
