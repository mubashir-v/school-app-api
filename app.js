const mongoose = require("mongoose");
const express = require("express");
const app = express();
const port = 3000;

require("dotenv").config();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Example route
app.get("/", (req, res) => {
  res.send("Hello, World!");
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

mongoose
  .connect(process.env.DB_URL)
  .then(() => console.log("Connected!"))
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });
