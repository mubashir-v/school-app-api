const express = require("express");
const { getSummary, getVolunteerSummaries } = require("../controllers/summary");

const router = express.Router();

router.get("/", getSummary);
router.get("/volunteer", getVolunteerSummaries);


module.exports = router;