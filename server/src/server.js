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

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/files", require("./routes/files"));

// Check server is running
app.get("/api/check", (req, res) => {
  res.json({
    status: "OK",
    message: "Server is running and connected to database",
  });
});

// Error handling for multer
app.use((err, req, res, next) => {
  console.error(err.stack);

  if (err.name === "MulterError") {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res
        .status(400)
        .json({ message: "File size is too large. Maximum size is 10MB" });
    }
    return res.status(400).json({ message: err.message });
  }

  res.status(500).json({ message: "Something went wrong!" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
