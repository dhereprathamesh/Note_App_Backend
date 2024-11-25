const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const noteRoutes = require("./routes/noteRoutes");
const cors = require("cors"); // Import cors package

dotenv.config();
connectDB();

const app = express();

// Enable CORS middleware
app.use(cors()); // This will allow all origins by default

app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/notes", noteRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
