/* eslint-disable no-undef */
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const Models = require("../model/models.js");

require("dotenv").config();

let User = Models.User; 
  
const sendEmail = async ({ email, emailType, userId }) => {
  try {
    // create reusable transporter object using the default SMTP transport
    const hashedToken = await bcrypt.hash(`${userId}`, 10);
 
    if (emailType === "VERIFY") {
      await User.findByIdAndUpdate(userId, { verifyToken: hashedToken, verifyTokenExpiry: Date.now() + 3600000 })
    } else if (emailType === "RESET") {
      await User.findByIdAndUpdate(userId, { resetPasswordToken: hashedToken, resetPasswordTokenExpiry: Date.now() + 3600000 })
    }
 
    const transporter = nodemailer.createTransport({
      host: "sandbox.smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASS
      }
    });
   
    const mailOptions = {
      from: '"Fred Foo 👻" <',
      to: email,
      subject: emailType === "VERIFY" ? "Verify your email" : "Reset your password",
      html: emailType === "VERIFY"
        ? `<p>Click this link to verify your email:
                   <a href="${process.env.DOMAIN}/users/verifyemail?token=${hashedToken}">here</a> or copy and paste this link into your browser: http://localhost:8080/verifyemail?token=${hashedToken} 
              </p>`
        : `<p>Click this link to reset your password: 
                  <a href="${process.env.DOMAIN}/users/resetpassword?token=${hashedToken}${emailType === "RESET" ? "Reset your password" : "Verify your email"}">here</a> or copy and paste this link into your browser: http://localhost:8080/resetpassword?token=${hashedToken}
          </p>`
    }

    // send mail with defined transport object
    const mailResponse = await transporter.sendMail(mailOptions)
    return mailResponse;


  } catch (error) {
    throw new Error(error.message)
  }
};

module.exports = sendEmail;