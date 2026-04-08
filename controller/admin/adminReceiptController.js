const Receipt = require("../../models/receipt");
const numberToWords = require("number-to-words");

const generateReceipt = async (req, res) => {
  try {
    const {
      receiptNumber,
      receiptDate,
      name,
      course,
      year,
      particulars,
      paymentMode,
      referenceNumber,
    } = req.body;

    const totalAmount = particulars.reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0,
    );

    const receipt = await Receipt.create({
      receiptNumber,
      receiptDate,
      name,
      course,
      year,
      particulars,
      paymentMode,
      referenceNumber: paymentMode === "cash" ? "" : referenceNumber,
      totalAmount,
    });

    res.status(201).json({
      message: "Receipt created successfully",
      receipt,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Error generating receipt",
    });
  }
};

const fetchAllReceipts = async (req, res) => {
  try {
    const { page = 1, search = "" } = req.query;

    const limit = 10;
    const skip = (page - 1) * limit;

    // 🔍 Search filter
    const searchFilter = {
      $or: [
        { name: { $regex: search, $options: "i" } },
        { receiptNumber: { $regex: search, $options: "i" } },
        { course: { $regex: search, $options: "i" } },
      ],
    };

    const total = await Receipt.countDocuments(searchFilter);

    const receipts = await Receipt.find(searchFilter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      data: receipts,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Error fetching receipts",
    });
  }
};

const editReceipt = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      receiptNumber,
      receiptDate,
      name,
      course,
      year,
      particulars,
      paymentMode,
      referenceNumber,
    } = req.body;

    // 🔥 Check if receipt exists
    const existingReceipt = await Receipt.findById(id);
    if (!existingReceipt) {
      return res.status(404).json({
        message: "Receipt not found",
      });
    }

    // 🔥 Validate particulars
    const validParticulars = (particulars || []).filter(
      (item) => item.title && item.amount,
    );

    if (validParticulars.length === 0) {
      return res.status(400).json({
        message: "At least one valid particular is required",
      });
    }

    // 🔥 Recalculate total
    const totalAmount = validParticulars.reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0,
    );

    // 🔥 Update
    const updatedReceipt = await Receipt.findByIdAndUpdate(
      id,
      {
        receiptNumber,
        receiptDate,
        name,
        course,
        year,
        particulars: validParticulars,
        paymentMode,
        referenceNumber: paymentMode === "cash" ? "" : referenceNumber,
        totalAmount,
      },
      { new: true }, // return updated doc
    );

    res.status(200).json({
      message: "Receipt updated successfully",
      receipt: updatedReceipt,
    });
  } catch (err) {
    console.error("Edit receipt error:", err);
    res.status(500).json({
      message: "Error updating receipt",
    });
  }
};

const getReceiptById = async (req, res) => {
  try {
    const { id } = req.params;

    const receipt = await Receipt.findById(id);

    if (!receipt) {
      return res.status(404).json({
        message: "Receipt not found",
      });
    }

    res.status(200).json({ receipt });
  } catch (err) {
    res.status(500).json({
      message: "Error fetching receipt",
    });
  }
};

const viewReceipt = async (req, res) => {
  try {
    const { id } = req.params;

    const receipt = await Receipt.findById(id);

    if (!receipt) {
      return res.status(404).send("Receipt not found");
    }

    // 🔥 Convert number → words
    // const amountInWords = numberToWords
    //   .toWords(receipt.totalAmount)
    //   .replace(/\b\w/g, (c) => c.toUpperCase());

    const amountInWords = numberToWords
      .toWords(receipt.totalAmount)
      .replace(/,/g, "") // ❌ remove commas
      .replace(/\b\w/g, (c) => c.toUpperCase());

    res.render("receipts/paymentReceipts", {
      receipt,
      amountInWords,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error generating receipt");
  }
};

module.exports = {
  generateReceipt,
  fetchAllReceipts,
  editReceipt,
  getReceiptById,
  viewReceipt,
};
