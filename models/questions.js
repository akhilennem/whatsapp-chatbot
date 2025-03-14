const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  question: String,
  options: [String], 
  nextStep: {
    type: mongoose.Schema.Types.Mixed, 
  },
});

const Question = mongoose.model("Question", questionSchema);
module.exports = Question;
