require("dotenv").config();
const Contact = require("../../models/contact");
const Admission = require("../../models/admission");
const sendMail = require("../../utils/sendMail");
const axios = require("axios");
const appendToSheet = require("../../utils/googleSheets");
const appendAdmissionToGoogleSheet = require("../../utils/appendAdmissionToGoogleSheet");
const contact = require("../../models/contact");
const appendFeeDiscountConcession = require("../../utils/appendFeeDiscountConcession");

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
    const mappedData = {
      fullName: data.fullName,
      email: data.email,
      mobile: data.mobileNumber,
      course: data.proposedCourse,
      dob: data.dob,
      age: data.age,
      gender: data.gender,
      parentName: data.parentName,

      streetAddress: data.streetAddress,
      apartment: data.apartment,
      city: data.city,
      state: data.state,
      postalCode: data.postalCode,
      country: data.country,

      score: data.score,
      totalQuestions: data.totalQuestions,
    };

    // ✅ SAVE DB
    const newAdmission = await Admission.create(mappedData);
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

const checkAdmission = async (req, res) => {
  try {
    const { email, mobile, fullName, course } = req.body;

    if (!email && !mobile) {
      return res.status(400).json({
        success: false,
        message: "Email or mobile required",
      });
    }

    /* ===============================
       CHECK ADMISSION
    ============================== */
    const existingAdmission = await Admission.findOne({
      $or: [{ email }, { mobile }],
    });

    if (existingAdmission && existingAdmission.score !== undefined) {
      return res.status(200).json({
        success: true,
        alreadyTaken: true,
        data: existingAdmission,
      });
    }

    /* ===============================
       CHECK CONTACT
    ============================== */
    const existingContact = await Contact.findOne({
      $or: [{ email }, { mobile }],
    });

    if (!existingContact) {
      await Contact.create({
        fullName,
        email,
        mobile,
        subject: "Concession Test Enquiry",
        course,
        message: "User filled info before concession test",
      });

      console.log("new contact saved");

      // ✅ GOOGLE SHEET (SAFE)
      try {
        await appendToSheet([
          fullName,
          email,
          mobile,
          "Concession Test Enquiry",
          course,
          "User filled info before concession test",
          new Date().toLocaleString("en-IN"),
        ]);
      } catch (sheetErr) {
        console.error("Google Sheet Error:", sheetErr);
      }
    } else {
      console.log("contact already exist");
    }

    /* ===============================
       RESPONSE
    ============================== */
    return res.status(200).json({
      success: true,
      alreadyTaken: false,
    });
  } catch (err) {
    console.error("Check Admission Error", err);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const submitQuizAdmission = async (req, res) => {
  try {
    const {
      fullName,
      email,
      mobile,
      course,
      score,
      totalQuestions,
      couponCode,
      discountAmount,
    } = req.body;

    /* ===============================
       SAVE DB
    ============================== */
    const newAdmission = await Admission.create({
      fullName,
      email,
      mobile,
      course,
      score,
      totalQuestions,
      couponCode,
      discountAmount,
      testAttempted: true,
    });

    /* ===============================
       GOOGLE SHEET (SAFE)
    ============================== */
    try {
      await appendFeeDiscountConcession([
        fullName,
        email,
        mobile,
        course,
        score,
        discountAmount,
        couponCode,
        new Date().toLocaleString("en-IN"),
      ]);
    } catch (sheetErr) {
      console.error("Sheet Save Failed:", sheetErr);
    }

    /* ===============================
       RESPONSE
    ============================== */
    return res.status(201).json({
      success: true,
      message: "Quiz submitted successfully",
      data: newAdmission,
    });
  } catch (err) {
    console.error("Submit Quiz Error:", err);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
const discountModalContactForm = async (req, res) => {
  try {
  } catch (err) {}
};

module.exports = {
  PostContactController,
  submitAdmission,
  checkAdmission,
  discountModalContactForm,
  submitQuizAdmission,
};
