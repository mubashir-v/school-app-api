const Login = require("../models/Login");
const School = require("../models/School");
const Volunteer = require("../models/Volunteer");



const registerSchool = async (req, res) => {
    try {
      const { firebaseUser, email, name, address, phone } = req.body;
  
      if (!firebaseUser || !firebaseUser.uid) {
        return res.status(400).json({ message: "Invalid Firebase user data" });
      }
  
      // Check if email already exists
      const existingLogin = await Login.findOne({ email });
      if (existingLogin) {
        return res.status(400).json({ message: "Email already registered" });
      }
  
      // Create login entry
      const login = new Login({
        uid: firebaseUser.uid,
        email,
        name,
        role: "school",
        isActive: true, // You can control activation via admin panel
      });
  
      const savedLogin = await login.save();
  
      // Create school entry
      const school = new School({
        name,
        address,
        phone,
        login: savedLogin._id, // Foreign key reference
      });
  
      const savedSchool = await school.save();
  
      return res.status(201).json({
        message: "School registered successfully",
        login: savedLogin,
        school: savedSchool,
      });
    } catch (error) {
      console.error("Error in registerSchool:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  };




const registerVolunteer = async (req, res) => {
  try {
    const { firebaseUser, email, name, phone, expertise, availability, schoolIds } = req.body;

    if (!firebaseUser || !firebaseUser.uid) {
      return res.status(400).json({ message: "Invalid Firebase user data" });
    }

    // Check if email already exists
    const existingLogin = await Login.findOne({ email });
    if (existingLogin) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Create login entry (volunteers are inactive by default)
    const login = new Login({
      uid: firebaseUser.uid,
      email,
      name,
      role: "volunteer",
      isActive: false, // Volunteer accounts are inactive by default
    });

    const savedLogin = await login.save();

    // Create volunteer entry
    const volunteer = new Volunteer({
      name,
      phone,
      expertise,
      availability,
      schoolIds, // Array of school references
      login: savedLogin._id, // Foreign key reference
    });

    const savedVolunteer = await volunteer.save();

    return res.status(201).json({
      message: "Volunteer registered successfully",
      login: savedLogin,
      volunteer: savedVolunteer,
    });
  } catch (error) {
    console.error("Error in registerVolunteer:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


  module.exports = { registerSchool ,registerVolunteer};