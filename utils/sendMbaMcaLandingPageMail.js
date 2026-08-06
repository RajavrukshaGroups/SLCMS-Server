const nodemailer = require("nodemailer");

const sendMbaMcaLandingPageMail = async ({ to, subject, html, replyTo }) => {
  const email = process.env.BCALANDINGPAGEEMAIL;
  const appPassword = process.env.BCALANDINGPAGEPASS;

  if (!email || !appPassword) {
    throw new Error(
      "MBA/MCA landing page email credentials are not configured.",
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
    from: `"SLCMS MBA & MCA Admissions" <${email}>`,
    to,
    replyTo: replyTo || email,
    subject,
    html,
  });
};

module.exports = sendMbaMcaLandingPageMail;
