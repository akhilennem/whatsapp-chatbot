// Import necessary modules
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
require('dotenv').config();
// Create an Express application
const app = express();
app.use(bodyParser.json());

// MongoDB connection string
const uri = "mongodb+srv://akhilnmtechintl:h2w0tMY73yxqgJmE@cloudapi.x5im9.mongodb.net/?retryWrites=true&w=majority";
// const uri="mongodb://localhost:27017/whatsapp";
// Connect to MongoDB
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: "whatsapp", // Specify the database name
})
.then(() => console.log("Connected to MongoDB successfully"))
.catch((err) => console.error("Failed to connect to MongoDB:", err));

// Routes
app.use("/whatsapp", require("../Whatsapp API/routes/whatsapp"));
app.use("/products", require("../Whatsapp API/routes/products"));

// Start the server
const PORT = 8080;
app.listen(PORT, () => console.log(`Server running at port ${PORT}`));
