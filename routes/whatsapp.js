const router = require('express').Router();

const {
    webHook,
    verify,
    getToken,
    addQuestions,
    getNewLeads

}=require("../controllers/whatsappController")
const Question = require('../models/questions')

 router.post("/webhook",  (req, res) => {
  webHook(req, res)
      .then((response) => {
        return res.status(201).json(response);
      })
      .catch((error) => {
        return res.status(500).json({
          message: "Unable to generate QR-Code",
          success: false,
          error: error.message,
        }); 
      });
    });

    router.get("/webhook",  (req, res) => {
      verify(req, res).then((response) => {
            return res.status(201).json(response);
          })
          .catch((error) => {
            return res.status(500).json({
              message: "Unable to generate QR-Code",
              success: false,
              error: error.message,
            }); 
          });
        });


        router.post("/get-token",  (req, res) => {
          // console.log('webhooikkkkkk')
          getToken(req, res)
              .then((response) => {
                return res.status(201).json(response);
              })
              .catch((error) => {
                return res.status(500).json({
                  message: "Unable to generate QR-Code",
                  success: false,
                  error: error.message,
                }); 
              });
            });


            router.post("/add-questions", async (req, res) => {
              try {
                console.log('adddddd')
                await Question.insertMany(req.body);
                res.json({ success: true, message: "Questions added successfully" });
              } catch (error) {
                console.log(error.message)
                res.status(500).json({ success: false, message: error.message });
              }
            });
            
            router.get("/get-question/:stepKey", async (req, res) => {
              try {
                const question = await Question.findOne({ stepKey: req.params.stepKey });
                if (!question) return res.status(404).json({ message: "Question not found" });
                res.json(question);
              } catch (error) {
                res.status(500).json({ message: error.message });
              }
            });

        router.get('/get-new-leads',getNewLeads);
    module.exports = router;
