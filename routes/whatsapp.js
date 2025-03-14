const router = require('express').Router();

const {
    webHook,
    verify,
    getToken,
    addQuestions,
    getNewLeads

}=require("../controllers/whatsappController")


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

            router.post("/add-question",  (req, res) => {
              // console.log('webhooikkkkkk')
              addQuestions(req, res)
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

        router.get('/get-new-leads',getNewLeads);
    module.exports = router;
