const express = require("express");
const router = express.Router();

const farmerRouter = require("./farmer");
const traderRouter = require("./trader");
const supplierRouter = require("./transporter");
const orderRouter = require("./order");
const cropRouter = require("./crop");


router.get("/", (req, res) => {
  res.send("API for Agricultural Supply Chain");
});

router.use("/farmer", farmerRouter);
router.use("/trader", traderRouter);
router.use("/transporter", supplierRouter);
router.use("/order", orderRouter);
router.use("/crop", cropRouter);

module.exports = router;
