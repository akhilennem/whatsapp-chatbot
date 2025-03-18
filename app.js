
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const mongoose = require("mongoose");
require('dotenv').config();
const app = express();
const cors=require('cors')
app.use(bodyParser.json());


app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  // allowedHeaders: ['Content-Type', 'Authorization'] // Allowed headers
}));


// const uri = "mongodb+srv://akhilnmtechintl:h2w0tMY73yxqgJmE@cloudapi.x5im9.mongodb.net/?retryWrites=true&w=majority";
const uri='mongodb://localhost:27017/'

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: "whatsapp", 
})
.then(() => console.log("Connected to MongoDB successfully"))
.catch((err) => console.error("Failed to connect to MongoDB:", err));

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});
app.get("/questions", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "saveQuestions.html"));
});

app.use("/whatsapp", require("./routes/whatsapp"));
app.use("/products", require("./routes/products"));

const PORT = 8000;
app.listen(PORT, () => console.log(`Server running at port http://localhost:${PORT}`));
