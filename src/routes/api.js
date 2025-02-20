const authRoutes = require("./auth");
const express = require("express");

const router = express.Router();
router.get("", (req, res) => {
  res.send("you are successfuly conected !");
});

router.use("auth/", authRoutes);

module.exports = router;
