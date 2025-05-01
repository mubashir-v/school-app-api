const express = require("express");
const { registerSchool,registerVolunteer,registerStudent,checkAuth } = require("../controllers/Regsiter");

const router = express.Router();

router.post("/registerschool", registerSchool);
router.post("/registervolunteer", registerVolunteer);
router.post("/registerstudent", registerStudent);
router.post("/check-auth", checkAuth);

module.exports = router;