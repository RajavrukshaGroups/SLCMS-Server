const mongoose = require("mongoose");

const receiptSchema = new mongoose.Schema({
  receiptNumber: String,
  receiptDate: Date,
  name: String,

  course: String,
  year: String,

  particulars: [
    {
      title: String,
      amount: Number,
    },
  ],

  totalAmount: Number,

  paymentMode: String,
  referenceNumber: String,
});

module.exports = mongoose.model("Receipt", receiptSchema);
