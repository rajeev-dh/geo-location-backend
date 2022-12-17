import nodemailer from "nodemailer";

const sendEmail = async () => {
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
      from: process.env.SMTP_USER_NAME, // sender address
      to: "196301078@gkv.ac.in", // list of receivers
      subject: "Hello ✔", // Subject line
      text: "Hello world?", // plain text body
      html: "<b>Hello world?</b>", // html body
    });

    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  } catch (err) {
    console.log(err);
  }
};

export default sendEmail;
