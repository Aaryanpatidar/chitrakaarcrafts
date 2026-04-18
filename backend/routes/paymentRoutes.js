const express = require("express");
const router = express.Router();
const { createRazorpayOrder, verifyAndCreateOrder } = require("../controllers/paymentController");
const { protect } = require("../middleware/authMiddleware");

router.post("/create-order", protect, createRazorpayOrder);
router.post("/verify", protect, verifyAndCreateOrder);

module.exports = router;
