const nodemailer = require("nodemailer");

const sendBcaLandingPageMail = async ({
  to,
  subject,
  html,
  replyTo,
}) => {
  const email = process.env.BCALANDINGPAGEEMAIL;
  const appPassword = process.env.BCALANDINGPAGEPASS;

  if (!email || !appPassword) {
    throw new Error(
      "BCA landing page email credentials are not configured.",
    );
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: email,
      pass: appPassword,
    },
  });

  await transporter.verify();

  return transporter.sendMail({
    from: `"SLCMS BCA Admissions" <${email}>`,
    to,
    replyTo: replyTo || email,
    subject,
    html,
  });
};

module.exports = sendBcaLandingPageMail;