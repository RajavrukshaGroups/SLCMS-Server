const express = require("express");
const router = express.Router();
const ContactController = require("../../controller/client/contactController");

router.post("/contact-page", ContactController.PostContactController);
router.post("/submit-admission", ContactController.submitAdmission);
router.post("/check-admission", ContactController.checkAdmission);
router.post("/submit-quiz", ContactController.submitQuizAdmission);

module.exports = router;
