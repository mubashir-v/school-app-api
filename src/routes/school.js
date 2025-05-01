const express = require("express");
const { getSchoolList,getSchoolListWithCounts,getSchoolDetailsById } = require("../controllers/School");

const router = express.Router();

router.get("/list", getSchoolListWithCounts);
router.get("/:id", getSchoolDetailsById);


module.exports = router;