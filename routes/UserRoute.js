
const express = require("express")
const { Registration, Login, givePermission, showAllUser, deleteUser, chnagePassword, otpVerification, otpByPass, updatePostPlan, UpdateProfile, getAllUserSomeData } = require("../controller/UserController")
const auth = require("../middleware/auth")
const User_Route = express()
const bodyParser = require("body-parser")
const multer = require("multer")
const path = require("path")


User_Route.use("/public", express.static(path.join(__dirname, "../public")));

const storage = multer.diskStorage({
    destination : (req,file,cb) =>{
        cb(null, path.join(__dirname,"../public/uploads",));
    },
    filename : (req,file,cb) =>{
        const ext = path.extname(file.originalname);
        const baseName = path.basename(file.originalname, ext).replace(/\s+/g, "-"); // replace spaces
        const fileName = Date.now() + "-" + baseName + ext;
        cb(null, fileName);
    }

})


const uplode = multer({storage : storage})


User_Route.use(express.json())
User_Route.use(bodyParser.json())
User_Route.use(bodyParser.urlencoded({extended:true}))

User_Route.post("/registration",uplode.single("userImg"),Registration)
User_Route.post("/otp-verify",otpVerification)
User_Route.post("/login",Login)
User_Route.post("/permission",auth,givePermission)
User_Route.post("/otp-bypass",auth,otpByPass)
User_Route.get("/all-user",auth,showAllUser)
User_Route.post("/deleteUser",auth,deleteUser)
User_Route.post("/changePassword",auth,chnagePassword)
User_Route.put("/purchase-plan", auth, updatePostPlan);
User_Route.put("/update-profile", auth, uplode.single("userImg"), UpdateProfile);
User_Route.get("/usersomeData",auth,getAllUserSomeData)
User_Route.get("/me", auth, (req, res) => {
    res.status(200).json({ success: true, data: req.user });
  });

module.exports = User_Route