const axios = require('axios');
const UserModel=require('../models/users')
const ProductModel=require('../models/products')
require("dotenv").config();
const token=process.env.accessToken;

const webHook = async (req, res) => {
  res.sendStatus(200);
  try {
    const entry = req.body.entry[0];
    const changes = entry?.changes[0]?.value?.messages;
    console.log('changes');
    // console.log(entry.changes[0]);

    if (changes && changes[0]) {
      if(changes[0].type=='text'){
      await  manageText(changes)
      }else if(changes[0].type=='order'){
        manageOrders(changes)
      }
    }
  } catch (error) {
    console.error("Error in webhook processing:", error.message);
  }
};

const manageText = async (changes, res) => {
    const message = changes[0];
    const from = message.from;
    const text = message.text?.body?.trim().toLowerCase();
    console.log("User message:", text);

    let user = await UserModel.findOne({ phone: from }).catch(err => console.log(err.message));

    if (!user ) {
        user = new UserModel({
            phone: from,
            step: 0,
            subStep: 0,
            selectedService: null,
            isLeadConverted: false, // Default to false
        });
    }

    if (user.step === 0) {
        await sendMessage(from, "Hi there! 👋 Welcome to TechWyse Digital Marketing. How can I assist you today?");
        await sendMessage(from, "💼 1. Learn about our services \n📅 2. Book a free consultation \n💰 3. Get pricing information \n📖 4. Read our latest blogs \n🤝 5. Talk to a human \n📝 6. Custom Message");
        user.step = 1;
    } else if (user.step === 1) {
        if (text === "1") {
            await sendMessage(from, "Which service are you interested in? \n1️⃣ SEO \n2️⃣ PPC \n3️⃣ Social Media \n4️⃣ Web Design \n5️⃣ Back to main menu");
            user.step = 2;
        } else if (text === "2") {
            await sendMessage(from, "Great! Please provide your name to book a consultation.");
            user.step = 10;
        } else if (text === "3") {
            await sendMessage(from, "Which service do you need pricing for? \n1️⃣ SEO \n2️⃣ PPC \n3️⃣ Social Media \n4️⃣ Web Design");
            user.step = 20;
        } else if (text === "4") {
            await sendMessage(from, "Check out our latest blogs here: https://www.techwyse.com/blog/");
        } else if (text === "5") {
            await sendMessage(from, "Our expert will contact you within 10 minutes.");
            user.isaskedforhuman=true;
        } else if (text === "6") {
          await sendMessage(from, "Please type your custom message, and our team will get back to you soon.");
          user.step = 30; 
      } else {
          await sendMessage(from, "Invalid option. Please choose 1-6.");
      }
    } else if (user.step === 2) {
        const services = {
            "1": "SEO improves your website ranking on Google. Want a free audit? (Reply Yes/No)",
            "2": "PPC helps you run ads on Google. Want a free strategy call? (Reply Yes/No)",
            "3": "Social media marketing helps you grow on platforms like Facebook & Instagram. Interested? (Reply Yes/No)",
            "4": "We design high-converting websites. Want a quote? (Reply Yes/No)",
            "5": "Going back to main menu..."
        };

       selectedService={"1": "SEO" ,"2":"PPC" ,"3":"Social Media","4":"Web Design"};

        if (selectedService[text]) {
            await sendMessage(from, services[text]);

            if (text === "5") {
                user.step = 1;
                user.selectedService = null;
            } else {
                user.step = 3;
                user.selectedService = text;
                user.selectedServices = selectedService[text];
            }
        } else {
            await sendMessage(from, "Invalid option, please choose 1-5.");
        }
    } else if (user.step === 3) {
        if (text === "yes" && user.selectedService) {
            const serviceResponses = {
                "1": "Great! We’ll conduct an SEO audit. Please provide your website URL(url must start with 'www').",
                "2": "Awesome! Our PPC team will reach out. Please share your business name.",
                "3": "Social media marketing is powerful! Which platform are you most interested in?1.Facebook\n2.Instagram\n3.LinkedIn",
                "4": "Web design projects vary. Could you tell us what type of website you need?\n1.Business\n2.E-commerce\n3.Portfolio"
            };

            await sendMessage(from, serviceResponses[user.selectedService]);
            user.step = 4;
        } else if (text === "no") {
            await sendMessage(from, "No worries! Let me know if you need any other help.");
            user.step = 1;
            user.selectedService = null;
        } else {
          console.log("/////??")
            await sendMessage(from, "Please reply with 'Yes' or 'No'.");
        }
    } else if (user.step === 4) {
      if(user.selectedService==4 && user.step==4){
        const platforms = { "1": "Business", "2": "E-commerce", "3": "portfolio" };
        if(platforms[text]){
        await sendMessage(from, `Great choice! You have selected ${platforms[text]}. Our team will contact you soon.`);
        user.step = 1;
        user.websitetype = text;
        }else{
          await sendMessage(from, "Invalid option, please select 1, 2, or 3.");
          return;
        }
      }
     else if (user.selectedService === "3") {
          const platforms = { "1": "Facebook", "2": "Instagram", "3": "LinkedIn" };
          if (platforms[text]) {
              await sendMessage(from, `Great choice! We'll focus on ${platforms[text]} marketing. Our team will contact you soon.`);
              user.step = 1;
              user.socialmedia=platforms[text];
              user.selectedService = null;
          } else {
              await sendMessage(from, "Invalid option, please select 1, 2, or 3.");
              return;
          }
      } else {
          await sendMessage(from, `Thanks! We have received your details: ${text}. Our team will contact you soon.`);
          user.step = 1;
          user.selectedService = null;
          if (text.includes('www')) {
              user.businessWebsite = text;
          } else {
              user.businessName = text;
          }
      }
  } else if (user.step === 10) {
        user.name = text;
        await sendMessage(from, "Thanks! Please provide your business name (or type 'none' if not applicable).");
        user.step = 11;
    } else if (user.step === 11) {
        user.businessName = text === 'none' ? null : text;
        user.businessName=text;
        await sendMessage(from, "Do you have a business website? If yes, please provide the URL(url must start with 'www'). If not, type 'none'.");
        user.step = 12;
    } else if (user.step === 12) {
        user.businessWebsite = text === 'none' ? null : text;
        await sendMessage(from, "What industry does your business operate in? (e.g., E-commerce, Healthcare, Finance, etc.)");
        user.step = 13;
    } else if (user.step === 13) {
        user.industry = text;
        await sendMessage(from, "Where is your business located? (City, Country)");
        user.step = 14;
    } else if (user.step === 14) {
        user.location = text;
        await sendMessage(from, "How would you like us to contact you? (Phone, WhatsApp)");
        user.step = 15;
    } else if (user.step === 15) {
        user.preferredContact = text;
        await sendMessage(from, `Thanks, ${user.name}! We’ve received your details. Our team will contact you soon.`);
        user.step = 1;
        user.isLeadConverted = true; // Mark as a lead once they complete the form
    } else if (user.step === 20) {
      const pricingResponses = {
          "1": "Our SEO pricing starts at $XXX. Want a custom quote? (Reply Yes/No)",
          "2": "PPC pricing varies based on ad spend. Would you like a free consultation? (Reply Yes/No)",
          "3": "Social Media pricing depends on platforms and ad spend. Want a pricing breakdown? (Reply Yes/No)",
          "4": "Web Design pricing depends on project scope. Want a detailed quote? (Reply Yes/No)"
      };
  
      if (pricingResponses[text]) {
          await sendMessage(from, pricingResponses[text]);
          user.step = 21; // Move to the next step where the bot waits for Yes/No
          // user.selectedService = text;
      } else {
          await sendMessage(from, "Invalid option. Please choose 1-4.");
      }
  } else if (user.step === 21) {
      if (text === "yes" && user.selectedService) {
          await sendMessage(from, "Great! Please provide your email so we can send the pricing details.");
          user.step = 22;
      } else if (text === "no") {
          await sendMessage(from, "No worries! Let me know if you need anything else.");
          user.step = 1;
          user.selectedService = null;
      } else {
          await sendMessage(from, "Please reply with 'Yes' or 'No'.");
      }
  } else if (user.step === 22) {
      user.email = text;
      await sendMessage(from, `Thanks! We’ll send the pricing details to ${user.email}. Our team will contact you soon.`);
      user.step = 1;
      user.selectedService = null;
  }else if (user.step === 30) {
    user.customMessage = text;
    await sendMessage(from, "Thank you for your message! Our team will review it and contact you soon.");
    user.step = 1; 
}

    await UserModel.findOneAndUpdate(
        { phone: from },
        {
            $set: {
                step: user.step,
                email:user.email,
                isaskedforhuman:user.isaskedforhuman,
                customMessage: user.customMessage,
                selectedServices: user.selectedServices,
                selectedService: user.selectedService,
                name: user.name,
                businessName: user.businessName,
                businessWebsite: user.businessWebsite,
                industry: user.industry,
                location: user.location,
                socialmedia: user.socialmedia,
                websitetype: user.websitetype,
                preferredContact: user.preferredContact,
                isLeadConverted: user.isLeadConverted
            }
        },
        { upsert: true }
    );
};



  
  // const manageOrders = async (changes, res) => {
  //   console.log(changes[0].order.product_items[0]);
  //       const orderDetails = changes[0].order;
  //       const from=changes[0].from;
  //       const quantity=changes[0].order.product_items[0].quantity;
  //       console.log('New Order Received:');
  //       console.log(from);
  //   const catalogID=orderDetails.catalog_id;
  //   const productId=orderDetails.product_items[0].product_retailer_id;
  //       const url = `https://graph.facebook.com/v16.0/${catalogID}/products/${productId}`;
  //           const response = await axios.get(url, {
  //               headers: {
  //                   Authorization: `Bearer ${token}`,
  //               },
  //           });
  //           if(response.data.data.length>0){
  //           const order= await ProductModel.findOne({productID:productId,currentStock:{$ne:0}})
  //           if(order){
  //             if(order.currentStock<quantity){
  //               await sendMessage(from,"Stock is limited. we only have "+order.currentStock +" units remaining" )
  //             }else{
  //             const newStock=order.currentStock-changes[0].order.product_items[0].quantity;
  //             const totalAmount=changes[0].order.product_items[0].quantity*changes[0].order.product_items[0].item_price;
  //           await  ProductModel.findOneAndUpdate({productID:productId,currentStock:newStock})
  //           await sendMessage(from, `Thank you! Your order has been placed:
  //             - Product Name : ${order.pname}
  //             - colour: ${order.color}
  //             - Brand: ${order.brand}
  //             - Quantity: ${changes[0].order.product_items[0].quantity}
  //             - price: ${changes[0].order.product_items[0].quantity} * ${changes[0].order.product_items[0].item_price} =  ${totalAmount}`);
  //           }
  //         }
  //           else{
  //             sendMessage(from,'sorry product out of stock ')
  //           }

  //           }
  //   }

  
  

const sendMessage = async (to, message) => {
  console.log('send message');
  const apiUrl = 'https://graph.facebook.com/v21.0/429759463560731/messages';
  const accessToken = token;
  console.log(message)
  try {
    const response = await axios.post(apiUrl, {
      messaging_product: 'whatsapp',
      to: to,
      text: { body: message },
    }, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    console.log('Message sent successfully:');
  } catch (err) {
    console.error('Error sending message:', err.response?.data || err.message);
    if (err.response?.status === 401) {
      console.log('401 - Unauthorized error. Please check your access token.');
    }
  }
};



const verify= (req, res) => {
  return new Promise((resolve,reject)=>{
    console.log('verify')
  const challenge = req.query['hub.challenge'];
  res.type('text/plain');
  res.send(challenge);
})
};

exports.messageFlow= async (req, res) => {
  try {
    
    

  } catch (error) {
    
  }
}

// const manageText = async (changes, res) => {
//   const message = changes[0];
//   const from = message.from;
//   const text = message.text?.body;

//   console.log("User message received:", text);

//   // Fetch user session
//   let userSession = await UserModel.findOne({ phone: from });

//   if (!userSession) {
//     userSession = new UserModel({ phone: from });
//   }

//   let nextQuestion;
//   if (!userSession.currentQuestion) {
//     // Start the first question if user is new
//     nextQuestion = await Question.findOne();
//   } else {
//     // Fetch current question and determine the next step
//     const currentQuestion = await Question.findById(userSession.currentQuestion);
//     const nextQuestionId = currentQuestion.nextStep[text];

//     if (nextQuestionId) {
//       nextQuestion = await Question.findById(nextQuestionId);
//     } else {
//       await sendMessage(from, "Invalid response. Please choose from the given options.");
//       return;
//     }
//   }

//   if (nextQuestion) {
//     await sendMessage(from, nextQuestion.question);
//     userSession.currentQuestion = nextQuestion._id;
//     await userSession.save();
//   } else {
//     await sendMessage(from, "Thank you! Your application has been submitted.");
//     await UserSession.deleteOne({ phone: from }); // Reset session after completion
//   }
// };


const Question = require("../models/questions");
const addQuestions = async (req, res) => {
  try {

    const newQuestion = new Question(req.boody);
    
    await newQuestion.save();
    return res.status(201).json(savedQuestions);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

const manageOrders = async (changes, res) => {
    console.log(changes[0].order.product_items[0]);

    const orderDetails = changes[0].order;
    const from = changes[0].from;
    const productId = orderDetails.product_items[0].product_retailer_id;

    console.log('New eBook Purchase Received:');
    console.log(from);

    // Define the PDF file path
    const pdfFilePath = path.join(__dirname, '../ebooks', `${productId}.pdf`);
    console.log('pdfFilePath',pdfFilePath);
    // Check if the PDF file exists
    if (fs.existsSync(pdfFilePath)) {
        await sendPDF(from, pdfFilePath, `Thank you for your purchase! Here is your eBook.`);
    } else {
        await sendMessage(from, "Sorry, the eBook file is not available at the moment.");
    }
};


const sendPDF = async (recipient, filePath, caption) => {
  const Token = token; // Replace with your actual access token
  const formData = new FormData();
  console.log('send pdf');
  // Append the PDF file
  formData.append("file", fs.createReadStream(filePath), {
    filename: filePath.split("/").pop(),
    contentType: "application/pdf",
  });

  try {
    // Step 1: Upload the PDF file to Facebook's servers
    const uploadResponse = await axios.post(
      `https://graph.facebook.com/v16.0/429759463560731/media`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${Token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    const mediaId = uploadResponse.data.id;
    console.log("PDF Uploaded Successfully", mediaId);
    // Step 2: Send the PDF using the media ID
    const sendResponse = await axios.post(
      `https://graph.facebook.com/v16.0/429759463560731/messages`,
      {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: recipient,
        type: "document",
        document: {
          id: mediaId,
          caption: caption,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${Token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("PDF Sent Successfully", sendResponse.data);
  } catch (error) {
    console.error("Error Sending PDF:", error.response ? error.response.data : error.message);
  }
};

const  getNewLeads = async (req, res) => {
  try {
    const leads = await UserModel.find({ isLeadConverted: true,status:'new' },{step:0,subStep:0,selectedService:0,'--v':0});
    return res.status(200).json(leads);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

module.exports={
  webHook,
  verify,
  addQuestions,
  getNewLeads
}








// const manageText = async (changes, res) => {
//   const message = changes[0];
//   const from = message.from;
//   const text = message.text?.body?.trim().toLowerCase();
//   console.log("User message:", text);

//   let user = await UserModel.findOne({ phone: from }).catch(err => console.log(err.message));

//   if (!user) {
//       user = new UserModel({ phone: from, step: 0, subStep: 0, selectedService: null });
//   }

//   if (user.step === 0) {
//       await sendMessage(from, "Hi there! 👋 Welcome to TechWyse Digital Marketing. How can I assist you today?");
//       await sendMessage(from, "💼 1. Learn about our services \n📅 2. Book a free consultation \n💰 3. Get pricing information \n📖 4. Read our latest blogs \n🤝 5. Talk to a human");
//       user.step = 1;
//   } else if (user.step === 1) {
//       if (text === "1") {
//           await sendMessage(from, "Which service are you interested in? \n1️⃣ SEO \n2️⃣ PPC \n3️⃣ Social Media \n4️⃣ Web Design \n5️⃣ Back to main menu");
//           user.step = 2;
//       } else if (text === "2") {
//           await sendMessage(from, "Great! Please provide your name to book a consultation.");
//           user.step = 10;
//       } else if (text === "3") {
//           await sendMessage(from, "Which service do you need pricing for? \n1️⃣ SEO \n2️⃣ PPC \n3️⃣ Social Media \n4️⃣ Web Design");
//           user.step = 20;
//       } else if (text === "4") {
//           await sendMessage(from, "Check out our latest blogs here: https://www.techwyse.com/blog/");
//       } else if (text === "5") {
//           await sendMessage(from, "Our expert will contact you within 10 minutes");
//       } else {
//           await sendMessage(from, "Invalid option. Please choose 1-5.");
//       }
//   } else if (user.step === 2) {
//       const services = {
//           "1": "SEO improves your website ranking on Google. Want a free audit? (Reply Yes/No)",
//           "2": "PPC helps you run ads on Google. Want a free strategy call? (Reply Yes/No)",
//           "3": "Social media marketing helps you grow on platforms like Facebook & Instagram. Interested? (Reply Yes/No)",
//           "4": "We design high-converting websites. Want a quote? (Reply Yes/No)",
//           "5": "Going back to main menu..."
//       };

//       if (services[text]) {
//           await sendMessage(from, services[text]);

//           if (text === "5") {
//               user.step = 1;
//               user.selectedService = null;
//           } else {
//               user.step = 3;
//               user.selectedService = text;
//           }
//       } else {
//           await sendMessage(from, "Invalid option, please choose 1-5.");
//       }
//   } else if (user.step === 3) {
//       if (text === "yes" && user.selectedService) {
//           const serviceResponses = {
//               "1": "Great! We’ll conduct an SEO audit. Please provide your website URL.",
//               "2": "Awesome! Our PPC team will reach out. Please share your business name.",
//               "3": "Social media marketing is powerful! Which platform are you most interested in? (Facebook, Instagram, LinkedIn)",
//               "4": "Web design projects vary. Could you tell us what type of website you need? (Business, E-commerce, Portfolio)"
//           };

//           await sendMessage(from, serviceResponses[user.selectedService]);
//           user.step = 4;
//       } else if (text === "no") {
//           await sendMessage(from, "No worries! Let me know if you need any other help.");
//           user.step = 1;
//           user.selectedService = null;
//       } else {
//           await sendMessage(from, "Please reply with 'Yes' or 'No'.");
//       }
//   } else if (user.step === 4) {
//       await sendMessage(from, `Thanks! We have received your details: ${text}. Our team will contact you soon.`);
//       user.step = 1;
//       user.selectedService = null;
//   } else if (user.step === 10) {
//       user.name = text;
//       await sendMessage(from, "Thanks! Please provide your business name (or type 'none' if not applicable).");
//       user.step = 11;
//   } else if (user.step === 11) {
//       user.businessName = text === 'none' ? null : text;
//       await sendMessage(from, "Do you have a business website? If yes, please provide the URL. If not, type 'none'.");
//       user.step = 12;
//   } else if (user.step === 12) {
//       user.businessWebsite = text === 'none' ? null : text;
//       await sendMessage(from, "What industry does your business operate in? (e.g., E-commerce, Healthcare, Finance, etc.)");
//       user.step = 13;
//   } else if (user.step === 13) {
//       user.industry = text;
//       await sendMessage(from, "Where is your business located? (City, Country)");
//       user.step = 14;
//   } else if (user.step === 14) {
//       user.location = text;
//       await sendMessage(from, "How would you like us to contact you? (Phone, Email, WhatsApp)");
//       user.step = 15;
//   } else if (user.step === 15) {
//       user.preferredContact = text;
//       await sendMessage(from, `Thanks, ${user.name}! We’ve received your details. Our team will contact you soon.`);
//       user.step = 1;
//   } 
//   // New logic for Pricing Information (Option 3)
//   else if (user.step === 20) {
//       const pricingResponses = {
//           "1": "SEO Pricing: Our SEO packages start at $500/month. Want a custom quote? (Yes/No)",
//           "2": "PPC Pricing: PPC management starts at $300/month + ad spend. Want a free consultation? (Yes/No)",
//           "3": "Social Media Pricing: Social media marketing starts at $400/month. Want a detailed package? (Yes/No)",
//           "4": "Web Design Pricing: Website design starts at $1000. Would you like a custom estimate? (Yes/No)"
//       };

//       if (pricingResponses[text]) {
//           await sendMessage(from, pricingResponses[text]);
//           user.step = 21;  // Move to the next step
//           user.selectedService = text; // Store selected pricing category
//       } else {
//           await sendMessage(from, "Invalid option. Please select 1-4.");
//       }
//   } else if (user.step === 21) {
//       if (text === "yes" && user.selectedService) {
//           await sendMessage(from, "Please provide some details about your business so we can offer a custom quote.");
//           user.step = 22; // Move to collect details
//       } else if (text === "no") {
//           await sendMessage(from, "Alright! Let me know if you need anything else.");
//           user.step = 1;
//           user.selectedService = null;
//       } else {
//           await sendMessage(from, "Please reply with 'Yes' or 'No'.");
//       }
//   } else if (user.step === 22) {
//       await sendMessage(from, `Thanks! We’ve received your details: ${text}. Our team will reach out soon.`);
//       user.step = 1;
//       user.selectedService = null;
//   }

//   await UserModel.findOneAndUpdate(
//       { phone: from },
//       { $set: {
//           step: user.step,
//           selectedService: user.selectedService,
//           name: user.name,
//           businessName: user.businessName,
//           businessWebsite: user.businessWebsite,
//           industry: user.industry,
//           location: user.location,
//           preferredContact: user.preferredContact,
//       } },
//       { upsert: true }
//   );
// };
