const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3000;
const apiRoutes = require("./src/routes/api");
require("dotenv").config();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS for all domains
app.use(cors());

// Example route
app.use("/", apiRoutes);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

mongoose
  .connect(process.env.DB_URL)
  .then(() => console.log("Connected to MongoDB!"))
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });
