import mongoose from "mongoose";

const Schema = mongoose.Schema;

const classSchema = new Schema({
  createdDate: {
    type: Date,
    required: true,
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  location: {
    longitude: {
      type: String,
      required: true,
    },
    latitude: {
      type: String,
      required: true,
    },
  },
  students: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  active: {
    type: Boolean,
    default: true,
    required: true,
  },
});

const Class = mongoose.model("Class", classSchema);

export default Class;
