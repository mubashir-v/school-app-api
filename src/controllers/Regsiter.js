import admin from "../config/firebaseConfig.js";
import authMiddleware from "../middleware/auth.js";
import Login from "../models/Login.js";
import School from "../models/School.js";
import Student from "../models/Student.js";
import Volunteer from "../models/Volunteer.js";
import mongoose from "mongoose";
export const registerSchool = [
  authMiddleware,
  async (req, res) => {
    try {
      const { email, password, name, principal, address, contact } = req.body;

      // Check if all required fields are present
      if (!email || !password || !name || !contact) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // 1. Create Firebase user
      let firebaseUser;
      try {
        firebaseUser = await admin.auth().createUser({
          email,
          password,
        });
      } catch (err) {
        if (err.code === "auth/email-already-exists") {
          return res
            .status(400)
            .json({ message: "Email already exists in Firebase" });
        }
        console.error("Firebase user creation error:", err);
        return res
          .status(500)
          .json({ message: "Error creating Firebase user" });
      }

      // 2. Check if email already exists in the Login collection
      const existingLogin = await Login.findOne({ email });
      if (existingLogin) {
        return res.status(400).json({ message: "Email already registered" });
      }

      // 3. Create the login entry
      const login = new Login({
        uid: firebaseUser.uid,
        email,
        password_hint: password, // Optional: You can provide a password hint if needed
        name,
        role: "school",
        isActive: true, // School is active by default
      });

      const savedLogin = await login.save();

      // 4. Create the school entry
      const school = new School({
        name,
        address,
        principal, // Optional
        contact,
        login: savedLogin._id, // Reference to the login
      });

      const savedSchool = await school.save();

      // Return success response with school and login data
      return res.status(201).json({
        message: "School registered successfully",
        login: savedLogin,
        school: savedSchool,
      });
    } catch (error) {
      console.error("Error in registerSchool:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  },
];

export const registerVolunteer = [
  authMiddleware,
  async (req, res) => {
    try {
      const {
        email,
        password,
        name,
        phone,
        expertise,
        availability,
        schoolIds,
      } = req.body;

      // 1. Check if email already exists in your DB
      const existingLogin = await Login.findOne({ email });
      if (existingLogin) {
        return res.status(400).json({ message: "Email already registered" });
      }

      // 2. Create Firebase user (no login will happen)
      let firebaseUser;
      try {
        firebaseUser = await admin.auth().createUser({
          email,
          password,
        });
      } catch (err) {
        if (err.code === "auth/email-already-exists") {
          return res
            .status(400)
            .json({ message: "Email already exists in Firebase" });
        }
        console.error("Firebase user creation error:", err);
        return res
          .status(500)
          .json({ message: "Error creating Firebase user" });
      }

      // 3. Create login entry (volunteers are inactive by default)
      const login = new Login({
        uid: firebaseUser.uid,
        email,
        password_hint: password,
        name,
        role: "volunteer",
        isActive: false, // Volunteer accounts are inactive by default
      });

      const savedLogin = await login.save();

      // 4. Create volunteer entry
      const volunteer = new Volunteer({
        name,
        phone,
        expertise:expertise.split(",").map(item => item.trim()),
        availability,
        schoolIds, // Array of school references
        login: savedLogin._id, // Foreign key reference
      });

      const savedVolunteer = await volunteer.save();

      // 5. Return success response
      return res.status(201).json({
        message: "Volunteer registered successfully",
        login: savedLogin,
        volunteer: savedVolunteer,
      });
    } catch (error) {
      console.error("Error in registerVolunteer:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  },
];

export const checkAuth = [
  authMiddleware,
  async (req, res) => {
    try {
      const user = await Login.findOne({ uid: req.user.user_id }).select(
        "-password_hint"
      );
      return res.status(201).json({
        message: "Authenticated",
        user: user,
      });
    } catch (error) {
      console.error("Error in Authenticating:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  },
];

export const registerStudent = [
  authMiddleware,
  async (req, res) => {
    try {
      const {
        name,
        email,
        grade,
        address,
        schoolId,
        contactNumber,
        password,
      } = req.body;


      let firebaseUser;
      try {
        firebaseUser = await admin.auth().createUser({
          email,
          password,
        });
      } catch (err) {
        if (err.code === "auth/email-already-exists") {
          return res
            .status(400)
            .json({ message: "Email already exists " });
        }
        console.error(" user creation error:", err);
        return res
          .status(500)
          .json({ message: "Error creating Student " });
      }

      const login = new Login({
        uid: firebaseUser.uid,
        email,
        password_hint: password,
        name,
        role: "student",
        isActive: false, // Volunteer accounts are inactive by default
      });

      const savedLogin = await login.save();
      // Check required fields
      if (!name || !grade || !schoolId  || !password) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Validate ObjectIds
      if (!mongoose.Types.ObjectId.isValid(schoolId)) {
        return res.status(400).json({ message: "Invalid schoolId format" });
      }
     

      // Check if school exists
      const school = await School.findById(schoolId);
      if (!school) {
        return res.status(404).json({ message: "School not found" });
      }

  

      // Create student
      const newStudent = new Student({
        name,
        grade,
        address,
        schoolId,
        contactNumber,
        login:savedLogin,
        password,
      });

      const savedStudent = await newStudent.save();

      return res.status(201).json({
        message: "Student registered successfully",
        student: savedStudent,
      });
    } catch (error) {
      console.error("Error in registerStudent:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  },
];
