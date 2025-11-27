// import nodemailer from "nodemailer";
// import ejs from "ejs";
// import path from "path";
// import { fileURLToPath } from "url";

// const sendMail = async (options) => {
//   const transporter = nodemailer.createTransport({
//     host: process.env.SMTP_HOST,
//     port: process.env.SMTP_PORT,
//     service: process.env.SMTP_SERVICE,
//     auth: {
//       user: process.env.SMTP_MAIL,
//       pass: process.env.SMTP_PASSWORD,
//     },
//   });

//   const { email, subject, template, data } = options;

//   const moduleDir = path.dirname(fileURLToPath(import.meta.url));
//   const templatePath = path.resolve(moduleDir, "..", "mails", template);

//   const resolvedTemplatePath = path.resolve(templatePath);

//   try {
//     const html = await ejs.renderFile(resolvedTemplatePath, data);

//     const mailOptions = {
//       from: process.env.SMTP_MAIL,
//       to: email,
//       subject,
//       html,
//     };

//     await transporter.sendMail(mailOptions);
//   } catch (error) {
//     console.error("Error rendering or sending email:", error);
//     throw error;
//   }
// };

// export default sendMail;

import nodemailer from "nodemailer";
import ejs from "ejs";
import path from "path";
import { fileURLToPath } from "url";

const sendMail = async (options) => {
  const { email, subject, template, data } = options;
  // Get credentials from environment variables
  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_SENDER_NAME,
    SMTP_SENDER_EMAIL,
    SENDGRID_API_KEY,
  } = process.env;

  const transporter = nodemailer.createTransport({
    port: SMTP_PORT, // Standard port for SendGrid's SMTP API
    host: SMTP_HOST, // SendGrid's SMTP server
    auth: {
      user: SMTP_USER, // Use the string 'apikey' for username
      pass: SENDGRID_API_KEY, // Your SendGrid API key as password
    },
  });

  // Rest of your code remains the same for rendering the email template
  const moduleDir = path.dirname(fileURLToPath(import.meta.url));
  const templatePath = path.resolve(moduleDir, "..", "mails", template);
  const resolvedTemplatePath = path.resolve(templatePath);

  try {
    const html = await ejs.renderFile(resolvedTemplatePath, data);

    const mailOptions = {
      from: `"${SMTP_SENDER_NAME}" <${SMTP_SENDER_EMAIL}>`, // Set your "From" email address
      to: email,
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error rendering or sending email:", error);
    throw error;
  }
};

export default sendMail;
