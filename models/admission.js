const mongoose = require("mongoose");

const admissionSchema = new mongoose.Schema(
  {
    fullName: String,
    email: String,
    mobile: String,
    course: String,

    couponCode: String,
    discountAmount: String,
    testAttempted: {
      type: Boolean,
      default: false,
    },

    dob: String,
    age: String,
    gender: String,
    parentName: String,

    streetAddress: String,
    apartment: String,
    city: String,
    state: String,
    postalCode: String,
    country: String,

    score: Number,
    totalQuestions: Number,
  },
  { timestamps: true },
);

module.exports = mongoose.model("Admission", admissionSchema);
