import School from "../models/School.js"; // Adjust path if needed
import authMiddleware from "../middleware/auth.js"; // Assuming you have this
import mongoose from "mongoose";
import Session from "../models/Session.js";
import Student from "../models/Student.js";
import Volunteer from "../models/Volunteer.js";


export const getSchoolList = async (req, res) => {
    try {
      const schools = await School.find().populate("login", "-password_hint"); // exclude password field if present
      res.status(200).json(schools);
    } catch (error) {
      console.error("Error fetching schools:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };
  


export const getSchoolListWithCounts = async (req, res) => {
    try {
      const schools = await School.aggregate([
        {
          $lookup: {
            from: "students",
            localField: "_id",
            foreignField: "schoolId",
            as: "students",
          },
        },
        {
          $lookup: {
            from: "sessions",
            localField: "_id",
            foreignField: "schoolId",
            as: "sessions",
          },
        },
        {
          $addFields: {
            studentCount: { $size: "$students" },
            sessionCount: { $size: "$sessions" },
          },
        },
        {
          $project: {
            students: 0,
            sessions: 0,
          },
        },
      ]);
  
      res.status(200).json(schools);
    } catch (err) {
      console.error("Error fetching school list with counts:", err);
      res.status(500).json({ message: "Internal Server Error" });
    }
  };


  export const getSchoolDetailsById = async (req, res) => {
    try {
      const { id } = req.params;
  
      // Fetch school basic info
      const school = await School.findById(id);
      if (!school) {
        return res.status(404).json({ message: "School not found" });
      }
  
      // Count students and sessions
      const studentCount = await Student.countDocuments({ schoolId: id });
      const sessionCount = await Session.countDocuments({ schoolId: id });
  
      // Get session details
      const sessions = await Session.find({ schoolId: id })
        .populate("volunteerId", "name")
        .sort({ date: -1 });
  
      const formattedSessions = sessions.map((session) => ({
        id: session._id,
        name:session.name,
        date: session.date.toISOString().split("T")[0],
        subject: session.subject,
        volunteer: session.volunteerId?.name || "N/A",
        duration: `${session.duration} minutes`,
        students: session.maxStudents,
      }));
  
      // Construct response
      const result = {
        id: school._id,
        name: school.name,
        studentCount,
        sessionCount,
        sessions: formattedSessions,
      };
  
      res.status(200).json(result);
    } catch (error) {
      console.error("Error fetching school details:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };