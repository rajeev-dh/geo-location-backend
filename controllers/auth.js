import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import path from "path";
import crypto from "crypto";

import User from "../models/User.js";
import {
  logInBodyValidation,
  signUpBodyValidation,
} from "../utils/validationSchema.js";
import sendEmail from "../utils/sendEmail.js";

const login = async (req, res) => {
  try {
    const { email } = req.body;
    req.body = {
      ...req.body,
      email: email.replace(/\s/g, "").toLowerCase(),
    };
    const { error } = logInBodyValidation(req.body);
    if (error)
      return res
        .status(400)
        .json({ error: true, message: error.details[0].message });

    const user = await User.findOne({ email: req.body.email });
    if (!user)
      return res
        .status(401)
        .json({ error: true, message: "No User found with given email" });

    const verifiedPassword = bcrypt.compare(req.body.password, user.password);
    if (!verifiedPassword)
      return res
        .status(401)
        .json({ error: true, message: "Invalid email or password" });

    const token = await generateToken(user);

    res.status(200).json({
      error: false,
      token,
      user: {
        name: user.name,
        role: user.role,
      },
      message: "Logged in sucessfully",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

const signUp = async (req, res) => {
  try {
    const { email } = req.body;
    req.body = {
      ...req.body,
      email: email.replace(/\s/g, "").toLowerCase(),
    };
    const { error } = signUpBodyValidation();
    if (error)
      return res
        .status(400)
        .json({ error: true, message: error.details[0].message });

    const oldUser = await User.findOne({ email: req.body.email });
    if (oldUser)
      return res
        .status(409)
        .json({ error: true, message: "User with given email already exist" });

    const salt = await bcrypt.genSalt(Number(process.env.SALT));
    const hashPassword = await bcrypt.hash(req.body.password, salt);

    const user = await new User({ ...req.body, password: hashPassword }).save();
    const token = await generateToken(user);

    res.status(201).json({
      error: false,
      token,
      user: {
        name: user.name,
        role: user.role,
      },
      message: "Account created sucessfully",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

// @route POST api/auth/recover
// @desc Recover Password - Generates token and Sends password reset email
// @access Public
const recover = async (req, res) => {
  const { email } = req.body;
  if (!email)
    return res.status(400).json({ error: true, message: "Email is missing" });
  try {
    const user = await User.findOneAndUpdate(
      { email },
      {
        resetPasswordToken: crypto.randomBytes(20).toString("hex"),
        resetPasswordExpires: Date.now() + 3600000,
      },
      { new: true }
    );
    if (!user)
      return res
        .status(401)
        .json({ error: true, message: "No User found with given email" });
    let link = `https://${req.headers.host}/api/auth/reset/${user.resetPasswordToken}`;
    const mailOptions = {
      from: `"no-reply" ${process.env.SMTP_USER_NAME}`,
      to: user.email,
      subject: "Password change request",
      html: `<p>Hi ${user.name} <br>Please click on the following <a href=${link}>link</a> to reset your password. <br><br>If you did not request this, please ignore this email and your password will remain unchanged.<br></p>`,
    };
    sendEmail(mailOptions);
    res
      .status(200)
      .json({ error: false, message: "A reset email has been sent" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

// @route GET api/auth/reset/:token
// @desc Reset Password - Validate password reset token and shows the password reset view
// @access Public
const reset = async (req, res) => {
  try {
    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user)
      return res.send("Password reset token is invalid or has expired.");
    const __dirname = path.resolve();
    res.sendFile(__dirname + "/reset.html");
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

// @route POST api/auth/reset/:token
// @desc Reset Password
// @access Public
const resetPassword = async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      {
        resetPasswordToken: req.params.token,
        resetPasswordExpires: { $gt: Date.now() },
      },
      {
        password: req.body.password,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      }
    );
    if (!user)
      return res.send("Password reset token is invalid or has expired.");
    const mailOptions = {
      from: `"no-reply" ${process.env.SMTP_USER_NAME}`,
      to: user.email,
      subject: "Your password has been changed",
      text: `Hi ${user.name} \nThis is a confirmation that the password for your account ${user.email} has just been changed.\n`,
    };
    sendEmail(mailOptions);
    res.send("Your password has been updated.");
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

export { login, signUp, recover, reset, resetPassword };

const generateToken = async (user) => {
  try {
    const payload = { _id: user._id, role: user.role };
    const token = jwt.sign(payload, process.env.ACCESS_TOKEN_PRIVATE_KEY, {
      expiresIn: "30d",
    });

    return Promise.resolve(token);
  } catch (err) {
    return Promise.reject(err);
  }
};
