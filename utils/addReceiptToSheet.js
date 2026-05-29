const { GoogleSpreadsheet } = require("google-spreadsheet");
const { JWT } = require("google-auth-library");

const addReceiptToSheet = async (receipt) => {
  try {
    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const doc = new GoogleSpreadsheet(
      process.env.GOOGLE_SHEET_ID,
      serviceAccountAuth,
    );

    await doc.loadInfo();

    let sheet = doc.sheetsByTitle["fee receipts"];

    if (!sheet) {
      throw new Error("fee receipts sheet not found");
    }

    const particularsText = receipt.particulars
      .map((item) => item.title)
      .join(", ");

    const amountsText = receipt.particulars
      .map((item) => item.amount)
      .join(", ");

    const paymentModesText = receipt.paymentBreakup?.length
      ? receipt.paymentBreakup.map((item) => item.paymentMode).join(", ")
      : receipt.paymentMode || "";

    const referenceNumbersText = receipt.paymentBreakup?.length
      ? receipt.paymentBreakup
          .map((item) => item.referenceNumber || "")
          .join(", ")
      : receipt.referenceNumber || "";

    await sheet.addRow({
      "Receipt Number": receipt.receiptNumber,

      "Receipt Date": new Date(receipt.receiptDate).toLocaleDateString("en-GB"),

      "Student Name": receipt.name,

      Course: receipt.course,

      Year: receipt.year,

      Particular: particularsText,

      Amount: amountsText,

      "Payment Mode": paymentModesText,

      "Reference Number": referenceNumbersText,

      "Total Amount": receipt.totalAmount,
    });

    return true;
  } catch (err) {
    console.error("Google Sheet Insert Error", err);
    throw err;
  }
};

module.exports = addReceiptToSheet;
