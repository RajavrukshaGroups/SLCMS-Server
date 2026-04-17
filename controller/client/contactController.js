require("dotenv").config();
const Contact = require("../../models/contact");
const Admission = require("../../models/admission");
const sendMail = require("../../utils/sendMail");
const axios = require("axios");
const appendToSheet = require("../../utils/googleSheets");
const appendAdmissionToGoogleSheet = require("../../utils/appendAdmissionToGoogleSheet");

const PostContactController = async (req, res) => {
  try {
    const {
      fullName,
      email,
      mobile,
      subject,
      course,
      message,
      dob,
      age,
      gender,
      parentName,
    } = req.body;
    /* ===============================
       VALIDATION
    ============================== */
    if (!fullName || !email || !mobile || !subject || !course || !message) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Email format check
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    // Mobile validation (10 digits)
    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileRegex.test(mobile)) {
      return res.status(400).json({
        success: false,
        message: "Invalid mobile number",
      });
    }

    const formatDOB = (dob) => {
      const date = new Date(dob);

      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();

      return `${day}/${month}/${year}`;
    };

    /* ===============================
       SAVE TO DATABASE
    ============================== */
    const newContact = new Contact({
      fullName,
      email,
      mobile,
      subject,
      course,
      message,
      dob,
      age,
      gender,
      parentName,
    });

    await newContact.save();

    await sendMail({
      to: process.env.ADMIN_EMAIL,
      subject: "📩 New Contact Form Submission",
      html: `
        <h2>New Contact Request</h2>
        <p><strong>Name:</strong> ${fullName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Mobile:</strong> ${mobile}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Course:</strong> ${course}</p>
        <p><strong>Message:</strong> ${message}</p>
        <hr/>
        <p>This message was submitted from your website contact form.</p>
      `,
    });
    await appendToSheet([
      fullName,
      email,
      mobile,
      subject,
      course,
      message,
      // formatDOB(dob),
      // age,
      // gender,
      // parentName,
      new Date().toLocaleString("en-IN"),
    ]);

    /* ===============================
       RESPONSE
    ============================== */
    return res.status(201).json({
      success: true,
      message: "Contact form submitted successfully",
      data: newContact,
    });
  } catch (err) {
    console.error("Contact Error:", err);

    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

const submitAdmission = async (req, res) => {
  try {
    const data = req.body;
    console.log("data received", data);

    // ✅ SAVE DB
    const newAdmission = await Admission.create(data);
    const formatDate = (dob) => {
      if (!dob) return "";
      const [year, month, day] = dob.split("-");
      return `${day}/${month}/${year}`;
    };

    await appendAdmissionToGoogleSheet([
      data.fullName,
      data.email,
      data.mobileNumber,
      data.proposedCourse, // ✅ MOVE COURSE UP
      "Admission Form", // Subject
      "Admission Submitted", // Message
      formatDate(data.dob),
      data.age,
      data.gender,
      data.parentName,
      data.apartment,
      data.streetAddress,
      data.city,
      data.state,
      data.postalCode,
      data.country,
      data.score,
      new Date().toLocaleString("en-IN"),
    ]);
    return res.status(201).json({
      success: true,
      message: "Admission submitted successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};

module.exports = {
  PostContactController,
  submitAdmission,
};
