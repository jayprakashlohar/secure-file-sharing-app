const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDatabase = require("./config/database");

dotenv.config();

const app = express();

connectDatabase(); // Connect to database

app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Check server is running
app.get("/api/check", (req, res) => {
  res.json({
    status: "OK",
    message: "Server is running and connected to database",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
