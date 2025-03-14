const router = require('express').Router();

const {
 addProduct
}=require("../controllers/productController")


 router.post("/add-product",  (req, res) => {
  addProduct(req, res)
      .then((response) => {
        return res.status(201).json(response);
      })
      .catch((error) => {
        return res.status(500).json({
          message: "Unable to add product",
          success: false,
          error: error.message,
        }); 
      });
    });

    module.exports = router;
