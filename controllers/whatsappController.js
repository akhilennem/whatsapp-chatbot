const axios = require("axios");
const UserModel = require("../models/users");
const ProductModel = require("../models/products");
require("dotenv").config();
const token = process.env.accessToken;
const Question = require("../models/questions");

const webHook = async (req, res) => {
  res.sendStatus(200);
  try {
    const entry = req.body.entry[0];
    const changes = entry?.changes[0]?.value?.messages;
    if (changes && changes[0]) {
      if (changes[0].type == "text") {
        await manageText(changes);
      } else if (changes[0].type == "order") {
        manageOrders(changes);
      }
    }
  } catch (error) {
    console.error("Error in webhook processing:", error.message);
  }
};

const manageText = async (changes, res) => {
  const message = changes[0];
  const from = message.from;
  let text = message.text?.body?.trim().toLowerCase();
  let user = await UserModel.findOne({ phone: from });
  if (!user) {
    user = new UserModel({ phone: from, stepKey: "welcome", questionIndex: 0 });
    await user.save();
    let currentQuestion = await Question.findOne({ stepKey: user.stepKey });
    if (currentQuestion) {
      await sendMessage(
        from,
        "Hi there! 👋 Welcome to TechWyse Digital Marketing. How can I assist you today?"
      );
      await sendMessage(from, formatQuestionWithOptions(currentQuestion));
    }
    return;
  }

  let currentQuestion = await Question.findOne({ stepKey: user.stepKey });

  if (!currentQuestion) {
    await sendMessage(from, "Sorry, an error occurred.");
    return;
  }

  if (currentQuestion.inputType === "selection") {
    const selectedIndex = parseInt(text);
    if (
      isNaN(selectedIndex) ||
      selectedIndex < 1 ||
      selectedIndex > currentQuestion.options.length
    ) {
      await sendMessage(from, "Invalid option. Please select a valid number.");
      return;
    }

    let selectedOption =
      currentQuestion.options[selectedIndex - 1].nextQuestionStepKey;
    console.log("selectedOption");
    console.log(selectedOption);
    let nextQuestion = await Question.findOne({ stepKey: selectedOption });
    if (nextQuestion.inputType == "selection") {
      const formattedMessage = formatQuestionWithOptions(nextQuestion);
      await sendMessage(from, formattedMessage);
      user.stepKey = nextQuestion.stepKey;
    } else {
      console.log("text");
      if(nextQuestion.nextQuestions.length==0){
        let singleQuestion = nextQuestion.questionText;;
        await sendMessage(from, singleQuestion);
        user.stepKey = 'welcome';
      }
      else if (nextQuestion.nextQuestions.length >= user.questionIndex) {
        let singleQuestion = nextQuestion.nextQuestions[user.questionIndex];
        await sendMessage(from, singleQuestion);
        user.stepKey = nextQuestion.stepKey;
        user.questionIndex += 1;
      }  else {
        user.stepKey = "welcome";
        user.questionIndex = 0;
      }
    }
  } else {
    console.log("else==>> Text");
    if (user.questionIndex > 0) {
      console.log(currentQuestion.nextQuestions[user.questionIndex - 1]);
      let prev =
        currentQuestion.nextQuestions[user.questionIndex - 1].toLowerCase();
      console.log(prev);
      if (prev.includes("yes")) {
        if (text != "yes" || text != "no") {
          await sendMessage(from, "error yes or no only");
        }
        return;
      }
    }
    if (currentQuestion.nextQuestions.length >= user.questionIndex) {
      let singleQuestion = currentQuestion.nextQuestions[user.questionIndex];
      if (typeof singleQuestion === "object" && singleQuestion !== null) {
        let nextQuestion = await Question.findOne({
          stepKey: singleQuestion.stepKey,
        });
        if (nextQuestion.inputType == "selection") {
          const formattedMessage = formatQuestionWithOptions(nextQuestion);
          await sendMessage(from, formattedMessage);
          user.stepKey = nextQuestion.stepKey;
        }
      }

      console.log("single Question>>", singleQuestion);
      await sendMessage(from, singleQuestion);
      user.stepKey = currentQuestion.stepKey;
      user.questionIndex += 1;
      if (currentQuestion.nextQuestions.length == user.questionIndex) {
        console.log("lenght ====");
        user.stepKey = "welcome";
        user.questionIndex = 1;
      }
    } else {
      console.log("lenght >>>>");
      user.stepKey = "welcome";
      user.questionIndex = 1;
      let currentQuestion = await Question.findOne({ stepKey: "welcome" });
      if (currentQuestion) {
        await sendMessage(
          from,
          "Hi there! 👋 Welcome to TechWyse Digital Marketing. How can I assist you today?"
        );
        await sendMessage(from, formatQuestionWithOptions(currentQuestion));
      }
      return;
    }
  }

  await user.save();
};

const formatQuestionWithOptions = (question) => {
  console.log(question);
  const formattedMessage = question.questionText.replace(/\\n/g, "\n");
  return formattedMessage.trim();
};

const sendMessage = async (to, message) => {
  console.log("send message");
  const apiUrl = "https://graph.facebook.com/v21.0/429759463560731/messages";
  const accessToken = token;
  console.log(message);
  try {
    const response = await axios.post(
      apiUrl,
      {
        messaging_product: "whatsapp",
        to: to,
        text: { body: message },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("Message sent successfully:");
  } catch (err) {
    console.error("Error sending message:", err.response?.data || err.message);
    if (err.response?.status === 401) {
      console.log("401 - Unauthorized error. Please check your access token.");
    }
  }
};

const verify = (req, res) => {
  return new Promise((resolve, reject) => {
    console.log("verify");
    const challenge = req.query["hub.challenge"];
    res.type("text/plain");
    res.send(challenge);
  });
};

const getNewLeads = async (req, res) => {
  try {
    const leads = await UserModel.find(
      { isLeadConverted: true, status: "new" },
      { step: 0, subStep: 0, selectedService: 0, "--v": 0 }
    );
    return res.status(200).json(leads);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  webHook,
  verify,
  getNewLeads,
};
