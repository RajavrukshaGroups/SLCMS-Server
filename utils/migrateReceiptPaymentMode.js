require("dotenv").config();
const mongoose = require("mongoose");
const Receipt = require("../models/receipt");

mongoose
  .connect(process.env.MONGO_URL)
  .then(async () => {
    console.log("MongoDB Connected");

    const receipts = await Receipt.collection
      .find({
        paymentMode: { $exists: true },
      })
      .toArray();

    console.log(`Found ${receipts.length} old receipts`);

    for (const rec of receipts) {
      const updatedParticulars = rec.particulars.map((item) => ({
        ...item,

        paymentMode:
          rec.paymentMode || "",

        referenceNumber:
          rec.referenceNumber || "",
      }));

      await Receipt.collection.updateOne(
        { _id: rec._id },
        {
          $set: {
            particulars: updatedParticulars,
          },
        }
      );

      console.log(`Updated ${rec.receiptNumber}`);
    }

    console.log("Migration completed");
    process.exit();
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });