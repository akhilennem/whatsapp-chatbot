const { type } = require('@testing-library/user-event/dist/cjs/utility/type.js');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const LeadSchema = mongoose.Schema(
    {
        _id: { 
            type: String, 
            default: uuidv4 
        }, 
        phone: {
            type: String,
            required: true,
            unique: true
        },
        status:{
            type: String,
            default:'new'
        },
        name: String,
        email: String,
        address: String,
        jobPlace: String,
        age: Number,
        selectedService: String,
        isaskedforhuman:{type:Boolean,default:false},
        selectedServices: [],
        socialmedia: [],
        websitetype: String,
        businessName: String,
        businessWebsite: String,
        industry: String,
        customMessage:String,
        location: String,
        preferredContact: {
            type: String,
            enum: ["Phone", "Email", "WhatsApp"]
        },
        step: { type: Number, default: 0 },
        subStep: { type: Number, default: 0 },
        isLeadConverted: { type: Boolean, default: false } // Lead status
    },  
    { timestamps: true }
);

module.exports = mongoose.model('people', LeadSchema);
