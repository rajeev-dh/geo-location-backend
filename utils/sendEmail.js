import nodemailer from "nodemailer";

const sendEmail = async (email, courseName) => {
  try {
    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER_NAME, // generated ethereal user
        pass: process.env.SMTP_USER_PASSWORD, // generated ethereal password
      },
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: `"no-reply" ${process.env.SMTP_USER_NAME}`, // sender address
      to: email, // list of receivers
      subject: "Course Attendance", // Subject line
      text: `Complete Attendance for ${courseName}`, // plain text body
      html: `<b>Complete Attendance for ${courseName}</b>`, // html body
      attachments: [
        {
          // filename and content type is derived from path
          path: "./attendance.xlsx",
        },
      ],
    });

    console.log("Message sent: %s", info.messageId);
  } catch (err) {
    console.log(err);
  }
};

export default sendEmail;
