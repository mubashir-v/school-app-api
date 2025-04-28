const express = require("express");
const { registerSchool,registerVolunteer } = require("../controllers/Regsiter");

const router = express.Router();

router.post("/registerschool", registerSchool);
router.post("/registervolunteer", registerVolunteer);

module.exports = router;