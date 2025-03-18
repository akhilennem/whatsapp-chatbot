const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema({
  stepKey: { type: String, required: true, unique: true },
  questionText: { type: String },
  options: [
    {
      optionText: String,
      nextQuestionStepKey: String 
    }
  ],
  inputType: { type: String, enum: ["selection", "text"], default: "selection" },
  nextQuestions:[],
  isYesOrNo:{type:Boolean,
    default:false
  }
});

module.exports = mongoose.model("Question", QuestionSchema);