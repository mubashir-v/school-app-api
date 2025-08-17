const authRoutes = require("./auth");
const sessionRoutes = require("./session");
const schoolRoutes = require("./school");
const volunteerRoutes = require("./volunteer");
const express = require("express");
const getSummary  = require("./summary");

const router = express.Router();
router.get("/", (req, res) => {
  res.send("you are successfuly conected !");
});

router.use("/auth", authRoutes);
router.use("/session", sessionRoutes);
router.use("/school", schoolRoutes);
router.use("/volunteer", volunteerRoutes);
router.use("/summary", getSummary);

module.exports = router;
