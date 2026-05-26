const { GoogleSpreadsheet } = require("google-spreadsheet");
const { JWT } = require("google-auth-library");

const exportReceiptsToSheet = async (receipts) => {
  try {
    // 🔥 Google Auth
    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    // 🔥 Open Spreadsheet
    const doc = new GoogleSpreadsheet(
      process.env.GOOGLE_SHEET_ID,
      serviceAccountAuth,
    );

    await doc.loadInfo();

    // 🔥 Get Sheet
    let sheet = doc.sheetsByTitle["fee receipts"];

    // 🔥 Create Sheet if not exists
    if (!sheet) {
      sheet = await doc.addSheet({
        title: "fee receipts",
        headerValues: [
          "Receipt Number",
          "Receipt Date",
          "Student Name",
          "Course",
          "Year",
          "Particular",
          "Amount",
          "Payment Mode",
          "Reference Number",
          "Total Amount",
        ],
      });
    }

    // 🔥 Load existing rows
    const existingRows = await sheet.getRows();

    // 🔥 Delete all existing rows at once
    if (existingRows.length > 0) {
      await sheet.clearRows();
    }

    // 🔥 Prepare rows
    const rows = [];

    receipts.forEach((receipt) => {
      // 🔥 Merge particulars
      const particularsText = receipt.particulars
        .map((item) => item.title)
        .join(", ");

      // 🔥 Merge amounts
      const amountsText = receipt.particulars
        .map((item) => item.amount)
        .join(", ");

      // 🔥 Merge payment modes
      const paymentModesText = receipt.particulars
        .map((item) => item.paymentMode || "")
        .join(", ");

      // 🔥 Merge reference numbers
      const referenceNumbersText = receipt.particulars
        .map((item) => item.referenceNumber || "")
        .join(", ");

      rows.push({
        "Receipt Number": receipt.receiptNumber,

        "Receipt Date": new Date(receipt.receiptDate).toLocaleDateString(
          "en-GB",
        ),

        "Student Name": receipt.name,

        Course: receipt.course,

        Year: receipt.year,

        Particular: particularsText,

        Amount: amountsText,

        "Payment Mode": paymentModesText,

        "Reference Number": referenceNumbersText,

        "Total Amount": receipt.totalAmount,
      });
    });

    // 🔥 Insert fresh rows
    if (rows.length > 0) {
      await sheet.addRows(rows);
    }

    console.log("Receipts exported successfully");

    return true;
  } catch (err) {
    console.error("Google Sheet Export Error", err);
    throw err;
  }
};

module.exports = exportReceiptsToSheet;
