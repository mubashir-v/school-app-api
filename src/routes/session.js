const express = require("express");
const { createSession,listSessions,getSessionDetails,getDashboardStats,getMonthlyStatistics } = require("../controllers/Session");

const router = express.Router();

router.post("/create", createSession);
router.get("/list", listSessions);
router.get("/:id", getSessionDetails);
router.get("/dashboard/stat", getDashboardStats);
router.get("/dashboard/monthstat", getMonthlyStatistics);


module.exports = router;