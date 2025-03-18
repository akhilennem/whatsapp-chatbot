
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const cors=require('cors')
const mongoose = require("mongoose");
require('dotenv').config();
const app = express();
app.use(bodyParser.json());

app.use(cors({
  origin: '*', // Allow specific origin
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed methods
  allowedHeaders: ['Content-Type', 'Authorization'] // Allowed headers
}));

const uri = "mongodb+srv://akhilnmtechintl:h2w0tMY73yxqgJmE@cloudapi.x5im9.mongodb.net/?retryWrites=true&w=majority";
// const uri='mongodb://localhost:27017/'

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: "whatsapp", 
})
.then(() => console.log("Connected to MongoDB successfully"))
.catch((err) => console.error("Failed to connect to MongoDB:", err));

app.use(express.static(path.join(__dirname, "public")));

// Route to serve the HTML file
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Routes
app.use("/whatsapp", require("./routes/whatsapp"));
app.use("/products", require("./routes/products"));

// Start the server
const PORT = 8080;
app.listen(PORT, () => console.log(`Server running at port ${PORT}`));
