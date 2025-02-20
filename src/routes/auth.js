const express = require("express");
const { registerSchool } = require("../controllers/Regsiter");

const router = express.Router();

router.post("/registerschool", registerSchool);

module.exports = router;