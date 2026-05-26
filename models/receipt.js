const mongoose = require("mongoose");

const receiptSchema = new mongoose.Schema(
  {
    receiptNumber: String,
    receiptDate: Date,
    name: String,

    course: String,
    year: String,

    // particulars: [
    //   {
    //     title: String,
    //     amount: Number,
    //   },
    // ],
    particulars: [
      {
        title: String,
        amount: Number,
        paymentMode: String,
        referenceNumber: String,
      },
    ],

    totalAmount: Number,

    // paymentMode: String,
    // referenceNumber: String,
  },
  { timestamps: true },
);

module.exports = mongoose.model("Receipt", receiptSchema);
