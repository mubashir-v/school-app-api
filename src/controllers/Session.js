import Session from "../models/Session.js"; // Adjust path if needed
import authMiddleware from "../middleware/auth.js"; // Assuming you have this
import mongoose from "mongoose";
import Login from "../models/Login.js";
import Volunteer from "../models/Volunteer.js";
import Student from "../models/Student.js";
import School from "../models/School.js";

export const createSession = [
  authMiddleware,

  async (req, res) => {
    const login = await Login.findOne({ uid: req.user.user_id });

    if (!login) {
      return res
        .status(401)
        .json({ message: "Login not found. Please re-authenticate." });
    }

    // Step 2: Find the volunteer using the login
    const volunteer = await Volunteer.findOne({ login });

    if (!volunteer) {
      return res.status(404).json({ message: "Volunteer profile not found." });
    }

    try {
      const {
        name,
        schoolId,
        volunteerId = volunteer._id,
        subject,
        date,
        startTime,
        duration,
        maxStudents,
        description,
        grade,
        topics, // Array of objects with { value: "..." }
      } = req.body;

      // Validate schoolId and volunteerId format
      if (!mongoose.Types.ObjectId.isValid(schoolId)) {
        return res.status(400).json({ message: "Invalid schoolId" });
      }
      if (!mongoose.Types.ObjectId.isValid(volunteerId)) {
        return res.status(400).json({ message: "Invalid volunteerId" });
      }

      // Create session document
      const session = new Session({
        name,
        schoolId,
        volunteerId,
        subject,
        date,
        startTime,
        duration: Number(duration),
        maxStudents: Number(maxStudents),
        description,
        grade,
        topics, // Should be array like [{ value: "..." }, ...]
      });

      const savedSession = await session.save();

      return res.status(201).json({
        message: "Session created successfully",
        session: savedSession,
      });
    } catch (error) {
      console.error("Error in createSession:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  },
];

export const listSessions = async (req, res) => {
  try {
    const sessions = await Session.find()
      .populate("volunteerId", "name") // only fetch volunteer name
      .populate("schoolId", "name"); // only fetch school name

    const result = sessions.map((session) => ({
      id: session._id,
      name: session.name,
      subject: session.subject,
      date: session.date.toISOString().split("T")[0], // format YYYY-MM-DD
      duration: session.duration
        ? `${(session.duration / 60).toFixed(1)} hours`
        : "N/A",
      studentCount: session.maxStudents || 0, // change if you have real student count logic
      volunteer: session.volunteerId?.name || "Unknown",
      school: session.schoolId?.name || "Unknown",
      grade: session.grade || "N/A",
    }));

    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching sessions:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getSessionDetails = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the session by ID
    const session = await Session.findById(id)
      .populate("schoolId", "name")
      .populate("volunteerId", "name")
      .exec();

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    // Find the students who belong to the same school and grade as the session
    const students = await Student.find({
      schoolId: session.schoolId,
      grade: session.grade,
    });

    // Map the students data to match the required structure
    const studentList = students.map((student) => ({
      id: student._id,
      name: student.name,
      grade: student.grade,
      attendance: student.attendance,
    }));

    // Get the topics covered in the session
    const coveredItems = session.topics.map((topic, index) => ({
      id: index + 1, // Using the index as the ID
      topic,
    }));

    // Prepare the session details response
    const sessionDetails = {
      id: session._id,
      subject: session.subject,
      date: session.date,
      duration: `${Math.round(session.duration / 60)}`, // Assuming session.duration is in hours
      volunteer: session.volunteerId.name,
      school: session.schoolId.name,
      grade: session.grade,
      students: studentList,
      coveredItems: coveredItems,
    };

    return res.json(sessionDetails);
  } catch (error) {
    console.error("Error fetching session details:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    // Get total number of schools
    const totalSchools = await School.countDocuments();

    // Get total number of students
    const totalStudents = await Student.countDocuments();

    // Get total number of active volunteers
    const totalVolunteers = await Volunteer.countDocuments();

    // Get total volunteer hours
    const totalVolunteerHours = await Session.aggregate([
      { $group: { _id: null, totalHours: { $sum: "$duration" } } },
    ]);

    // Check if totalVolunteerHours is an empty array (i.e., no sessions)
    const volunteerHours =
      totalVolunteerHours.length > 0 ? totalVolunteerHours[0].totalHours : 0;

    // Prepare the response data
    const dashboardData = {
      totalSchools,
      totalStudents,
      totalVolunteers,
      totalVolunteerHours: Math.round(volunteerHours / 60),
    };

    res.status(200).json(dashboardData);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching dashboard data." });
  }
};

const SUBJECT_COLORS = {
  Mathematics: "#7E69AB",
  English: "#2196F3",
  Science: "#FF9800", // Example additional subject
};

export const getMonthlyStatistics = async (req, res) => {
  try {
    const sessions = await Session.aggregate([
      {
        $match: {
          date: { $ne: null }, // Ensure valid date
        },
      },
      {
        $project: {
          month: { $month: "$date" },
          subject: 1,
        },
      },
      {
        $group: {
          _id: {
            month: "$month",
            subject: "$subject",
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.month": 1 },
      },
    ]);

    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const resultMap = new Map();

    // Build chart data
    sessions.forEach((entry) => {
      const monthName = months[entry._id.month - 1];
      if (!resultMap.has(monthName)) {
        resultMap.set(monthName, { name: monthName });
      }
      resultMap.get(monthName)[entry._id.subject] = entry.count;
    });

    // Fill missing months and subjects with 0
    for (let i = 0; i < 12; i++) {
      const monthName = months[i];
      if (!resultMap.has(monthName)) {
        const entry = { name: monthName };
        Object.keys(SUBJECT_COLORS).forEach((subject) => {
          entry[subject] = 0;
        });
        resultMap.set(monthName, entry);
      } else {
        const entry = resultMap.get(monthName);
        Object.keys(SUBJECT_COLORS).forEach((subject) => {
          if (!entry[subject]) entry[subject] = 0;
        });
      }
    }

    const chartData = Array.from(resultMap.values());

    const subjects = Object.entries(SUBJECT_COLORS).map(([name, color]) => ({
      name,
      color,
    }));

    res.json({ data: chartData, subjects });
  } catch (err) {
    console.error("Error generating monthly statistics:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
