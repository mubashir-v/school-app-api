const School = require("../models/School");
const Session = require("../models/Session");
const Student = require("../models/Student");
const Volunteer = require("../models/Volunteer");

const getSummary = async (req, res) => {
  try {
    // Get counts
    const totalSchools = await School.countDocuments();
    const totalStudents = await Student.countDocuments();
    const totalVolunteers = await Volunteer.countDocuments();
    const totalSessions = await Session.countDocuments();

    // Get extra details

    return res.status(200).json({
      success: true,
      schools: totalSchools,
      students: totalStudents,
      volunteers: totalVolunteers,
      sessions: totalSessions,
    });
  } catch (error) {
    console.error("Error fetching summary:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};




const getVolunteerSummaries = async (req, res) => {
  try {
    // Fetch all volunteers
    const volunteers = await Volunteer.find().lean();

    // Build summaries
    const summaries = await Promise.all(
      volunteers.map(async (volunteer) => {
        // Fetch all sessions for this volunteer
        const sessions = await Session.find({ volunteerId: volunteer._id })
          .populate("schoolId", "name") // populate school names
          .lean();

        // Total teaching hours
        const totalMinutes = sessions.reduce(
          (sum, session) => sum + (session.duration || 0),
          0
        );
        const totalHours = Math.round(totalMinutes / 60);

        // Unique schools based on sessions
        const uniqueSchoolMap = new Map();
        sessions.forEach((s) => {
          if (s.schoolId) {
            uniqueSchoolMap.set(s.schoolId._id.toString(), s.schoolId.name);
          }
        });

        const uniqueSchools = Array.from(uniqueSchoolMap.values());

        return {
          id: volunteer._id,
          name: volunteer.name,
          expertise: volunteer.expertise?.join(", "), // make string
          totalHours,
          schoolCount: uniqueSchools.length,
          schools: uniqueSchools.length,
          phone: volunteer.phone,
          availability: volunteer.availability,
          bio: `Passionate about teaching ${volunteer.expertise?.join(", ")} and contributing to ${uniqueSchools.length} school(s).`,
        };
      })
    );

    return res.status(200).json({
      success: true,
      volunteers: summaries,
    });
  } catch (error) {
    console.error("Error fetching volunteer summaries:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};



module.exports = { getSummary,getVolunteerSummaries };
