const express = require("express");
const { listVolunteers,getVolunteerDetails,topVolunteers } = require("../controllers/Volunteer");

const router = express.Router();

router.get("/list", listVolunteers);
router.get("/toplist", topVolunteers);
router.get("/:id", getVolunteerDetails);


module.exports = router;