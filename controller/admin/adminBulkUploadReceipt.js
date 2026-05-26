const Receipt = require("../../models/receipt");
const exportReceiptsToSheet = require("../../utils/exportReceiptsToSheet");

const adminBulkUploadPaymentData = async (req, res) => {
  try {
    const receipts = await Receipt.find();

    if (!receipts.length) {
      return res.status(404).json({
        success: false,
        message: "No receipts found",
      });
    }

    await exportReceiptsToSheet(receipts);

    return res.status(200).json({
      success: true,
      message: "Receipts exported successfully",
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Export failed",
    });
  }
};

module.exports = {
  adminBulkUploadPaymentData,
};
