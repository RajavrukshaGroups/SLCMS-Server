const { GoogleSpreadsheet } = require("google-spreadsheet");
const { JWT } = require("google-auth-library");

const updateReceiptInSheet = async (receipt) => {
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

    const sheet = doc.sheetsByTitle["fee receipts"];

    if (!sheet) {
      return;
    }

    const rows = await sheet.getRows();

    const row = rows.find(
      (r) => r.get("Receipt Number") === receipt.receiptNumber,
    );

    if (!row) {
      console.log(`Receipt ${receipt.receiptNumber} not found in sheet`);
      return;
    }

    row.set(
      "Receipt Date",
      new Date(receipt.receiptDate).toLocaleDateString("en-GB"),
    );

    row.set("Student Name", receipt.name);

    row.set("Course", receipt.course);

    row.set("Year", receipt.year);

    row.set("Particular", receipt.particulars.map((p) => p.title).join(", "));

    row.set("Amount", receipt.particulars.map((p) => p.amount).join(", "));

    row.set(
      "Payment Mode",
      receipt.paymentBreakup?.length
        ? receipt.paymentBreakup.map((p) => p.paymentMode).join(", ")
        : "",
    );

    row.set(
      "Reference Number",
      receipt.paymentBreakup?.length
        ? receipt.paymentBreakup.map((p) => p.referenceNumber || "").join(", ")
        : "",
    );

    row.set("Total Amount", receipt.totalAmount);

    await row.save();

    console.log(`Receipt ${receipt.receiptNumber} updated in sheet`);
  } catch (err) {
    console.error("Google Sheet Update Error", err);
  }
};

module.exports = updateReceiptInSheet;
