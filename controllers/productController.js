const ProductsModel=require('../models/products');


const addProduct=((req,res)=>{
    return new Promise(async (resolve, reject)=>{
        try{
            console.log('add products')
            const data = req.body;
            console.log(data)
            const products=new ProductsModel(data)
           const response= await products.save();
           if(response){
            resolve({success:true,
                message:'products added successfully'
            })
           }  else(
            reject({success:false})
           )
        }
        catch(error){
            console.log(error.message)
        }
    })
})

module.exports={
    addProduct
}