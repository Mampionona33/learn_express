const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  /*
    It is not the best practice to use Gmail
    as a mail service in production because
    a gmail account can only send 100 mail per day
    so you will be marqued as a spammer if you use it
*/

  // 1) Create a transporter
  const trasporter = nodemailer.createTransport({
    // service: 'Gmail',
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,

    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
    // Activate in gmail "less secure app" option if you use gmail
  });
  // 2) Define the email options
  const mailOptions = {
    from: 'Mampionona Ramahazomanana <hello@mampionona.io>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html:
  };
  // 3) Actually send the email

  await trasporter.sendMail(mailOptions);
};

module.exports = sendEmail;
