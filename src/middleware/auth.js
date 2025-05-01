import admin from "../config/firebaseConfig.js";


const authMiddleware = async (req, res, next) => {

    try {
        // Extract the token from the Authorization header
        const token = req.headers.authorization?.split(" ")[1];
        // Extract the token from the Authorization header
  
        if (!token) {
          return unauthorizedResponse(res, "Token is required");
        }
        // Verify the Firebase ID token
        const decodedToken = await admin.auth().verifyIdToken(token);
  
        // Attach user details from the token to the request object
        req.user = {
          email: decodedToken.email,
          user_id: decodedToken.uid,
        };
        next();
      } catch (error) {
        return res
        .status(400)
        .json({ message: "Not Authenticated" });
      }


}


export default authMiddleware;