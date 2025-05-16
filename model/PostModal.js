const mongoose = require("mongoose")


const PostSchema = mongoose.Schema({
    postImage : String,
    title : {
        type : String,
        required : true
    },
    description : {
        type : String,
        required : true
    },
    userId : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",  
        required: true
    },
    status : {
        type : String,
        enum:["pending","rejected","approved"],
        required: true
    },
    comment : String
    
},{  timestamps: true})


module.exports = mongoose.model("post",PostSchema)


