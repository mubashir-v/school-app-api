import Session from "../models/Session.js";
import Volunteer from "../models/Volunteer.js";

export const listVolunteers = async (req, res) => {
  try {
    const volunteers = await Volunteer.find();

    const volunteerData = await Promise.all(
      volunteers.map(async (volunteer) => {
        const sessions = await Session.find({ volunteerId: volunteer._id });

        const totalHours = sessions.reduce((sum, session) => {
          const duration = parseFloat(session.duration);
          return sum + (isNaN(duration) ? 0 : duration);
        }, 0);

        const uniqueSubjects = [...new Set(sessions.map((s) => s.subject))];
        const uniqueSchoolIds = [
          ...new Set(sessions.map((s) => s.schoolId?.toString())),
        ];

        return {
          id: volunteer._id,
          name: volunteer.name,
          hours: totalHours / 60,
          schools: uniqueSchoolIds.length,
          subjects:
            volunteer.expertise.length > 0
              ? volunteer.expertise
              : uniqueSubjects,
          avatar: "/placeholder.svg",
        };
      })
    );

    return res.status(200).json(volunteerData);
  } catch (error) {
    console.error("Error listing volunteers:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const topVolunteers = async (req, res) => {
  try {
    const volunteers = await Volunteer.find();

    const volunteerStats = await Promise.all(
      volunteers.map(async (volunteer) => {
        const sessions = await Session.find({ volunteerId: volunteer._id });

        const totalHours = sessions.reduce((sum, session) => {
          const duration = parseFloat(session.duration);
          return sum + (isNaN(duration) ? 0 : duration);
        }, 0);

        const uniqueSubjects = [...new Set(sessions.map((s) => s.subject))];

        return {
          id: volunteer._id,
          name: volunteer.name,
          sessionCount: sessions.length,
          totalHours: totalHours / 60,
          avatar: "/placeholder.svg",
          subjects:
            volunteer.expertise.length > 0
              ? volunteer.expertise
              : uniqueSubjects,
        };
      })
    );

    const sorted = volunteerStats
      .sort((a, b) => {
        if (b.sessionCount === a.sessionCount) {
          return b.totalHours - a.totalHours;
        }
        return b.sessionCount - a.sessionCount;
      })
      .slice(0, 4); // top 4

    return res.status(200).json(sorted);
  } catch (error) {
    console.error("Error fetching top volunteers:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
export const getVolunteerDetails = async (req, res) => {
  try {
    const volunteerId = req.params.id;

    // Fetch volunteer basic info
    const volunteer = await Volunteer.findById(volunteerId).lean();
    if (!volunteer) {
      return res.status(404).json({ message: "Volunteer not found" });
    }

    // Fetch all sessions for this volunteer
    const sessions = await Session.find({ volunteerId: volunteer._id })
      .populate("schoolId", "name") // Populate school name only
      .lean();

    // Organize sessions by school
    const schoolMap = {};

    let totalHours = 0;
    for (const session of sessions) {
      const schoolId = session.schoolId._id.toString();

      totalHours += session.duration / 60;

      if (!schoolMap[schoolId]) {
        schoolMap[schoolId] = {
          id: session.schoolId._id,
          name: session.schoolId.name,
          sessions: [],
        };
      }

      schoolMap[schoolId].sessions.push({
        id: session._id,
        date: session.date.toISOString().split("T")[0],
        subject: session.subject,
        hours: Math.round(session.duration / 60),
      });
    }

    const result = {
      id: volunteer._id,
      name: volunteer.name,
      hours: Math.round(totalHours),
      schools: Object.values(schoolMap),
    };

    return res.json(result);
  } catch (err) {
    console.error("Error fetching volunteer details:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
