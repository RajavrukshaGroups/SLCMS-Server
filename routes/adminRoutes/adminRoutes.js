const express = require("express");
const router = express.Router();
const protectAdmin = require("../../middleware/authMiddleware");
const AdminLoginController = require("../../controller/admin/adminLoginController");
const AdminReceiptController = require("../../controller/admin/adminReceiptController");

router.post("/login", AdminLoginController.loginDetails);
router.post("/logout", AdminLoginController.logoutDetails);
router.post(
  "/generate-receipt",
  protectAdmin,
  AdminReceiptController.generateReceipt,
);
router.get(
  "/fetch-all-receipts",
  protectAdmin,
  AdminReceiptController.fetchAllReceipts,
);
router.put(
  "/edit-receipt/:id",
  protectAdmin,
  AdminReceiptController.editReceipt,
);
router.get(
  "/get-receipt/:id",
  protectAdmin,
  AdminReceiptController.getReceiptById,
);
router.get("/view-receipt/:id", AdminReceiptController.viewReceipt);

module.exports = router;
