
const mongoose = require("mongoose")

const UserSchema = mongoose.Schema({
    userImg :  String,
    name : {
        type : String,
        required : true 
    },
    email : {
        type : String,
        required : true 
    },
    password : {
        type : String,
        required : true  
    },
    status : {
        type : String,
        enum:["pending","rejected","approved"],
        required : true
    },
    role : {
        type: String,
        enum: ['user', 'admin'],
        required : true
    },
    otp : String,
    otpVerify : Boolean,
    postPlane : {
        type : String,
        enum : ["free","bronze","silver","gold","dimond"],
        required : true
    },
    devicePlan : {
        type : String,
        enum : ["free","bronze","silver","gold","dimond"],
        required : true
    }
},
{ timestamps: true}
)

module.exports = mongoose.model("user",UserSchema)