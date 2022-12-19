import mongoose from "mongoose";
import { getPreciseDistance } from "geolib";

import Class from "../models/Class.js";
import Course from "../models/Course.js";

const startClass = async (req, res) => {
  try {
    const { courseId, location, radius } = req.body;
    if (!mongoose.Types.ObjectId.isValid(courseId))
      return res
        .status(400)
        .json({ error: true, message: "Course Id is not valid" });
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
    if (!mongoose.Types.ObjectId.isValid(courseId))
      return res
        .status(400)
        .json({ error: true, message: "Course Id is not valid" });
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
    if (!mongoose.Types.ObjectId.isValid(courseId))
      return res
        .status(400)
        .json({ error: true, message: "Course Id is not valid" });
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
    // const distance = Math.sqrt(
    //   (+runningClass.location.latitude - +location.latitude) *
    //     (+runningClass.location.latitude - +location.latitude) +
    //     (+runningClass.location.longitude - +location.longitude) *
    //       (+runningClass.location.longitude - +location.longitude)
    // );
    function distance(lat1, lon1, lat2, lon2) {
      var p = 0.017453292519943295; // Math.PI / 180
      var c = Math.cos;
      var a =
        0.5 -
        c((lat2 - lat1) * p) / 2 +
        (c(lat1 * p) * c(lat2 * p) * (1 - c((lon2 - lon1) * p))) / 2;

      return 12742 * 1000 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
    }
    const distanc = distance(
      runningClass.location.latitude,
      runningClass.location.longitude,
      location.latitude,
      location.longitude
    );
    console.log(
      "distance: ",
      distanc,
      "class radius: ",
      runningClass.radius,
      "teacher location: ",
      runningClass.location,
      "student location: ",
      location
    );
    if (distanc > runningClass.radius) {
      return res
        .status(400)
        .json({ error: true, message: "You are too far from class" });
    }
    await Class.findByIdAndUpdate(classId, {
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
    if (!mongoose.Types.ObjectId.isValid(courseId))
      return res
        .status(400)
        .json({ error: true, message: "Course Id is not valid" });
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
    if (!mongoose.Types.ObjectId.isValid(classId))
      return res
        .status(400)
        .json({ error: true, message: "Class Id is not valid" });
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
    if (!mongoose.Types.ObjectId.isValid(classId))
      return res
        .status(400)
        .json({ error: true, message: "Class Id is not valid" });
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
